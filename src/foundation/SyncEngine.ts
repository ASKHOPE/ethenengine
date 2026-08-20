// Foundation: SyncEngine — Dual-Write Data Safety Layer (ADR-012)
//
// Architecture:
//   Every data-mutating action publishes a platform event via EventBus.
//   SyncEngine subscribes to ALL write events and performs concurrent dual-writes:
//     1. Local Docker PostgreSQL (primary fast store)
//     2. Aiven Cloud PostgreSQL  (durable cloud backup)
//   If either write fails it is queued to a retry buffer (max 3 attempts, exponential backoff).
//   A heartbeat loop runs every 60 s to drain the retry queue and verify connectivity.

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { EventBus, PlatformEvent } from './EventBus.js';
import { Logger } from './Logger.js';
import { AivenPostgresEngine } from '../db/aivenPostgres.js';

const { Pool } = pg;

// ── Types ─────────────────────────────────────────────────────────────────────

export type SyncTarget = 'docker' | 'aiven';

export interface SyncRecord {
  id:             string;
  collection:     string;
  operation:      'upsert' | 'delete';
  data:           any;
  tenantId?:      string;
  timestamp:      string;
}

interface RetryItem {
  record:    SyncRecord;
  target:    SyncTarget;
  attempts:  number;
  nextRetry: number;   // epoch ms
}

// ── SQL helpers ───────────────────────────────────────────────────────────────

const UPSERT_SQL: Record<string, (item: any) => { sql: string; params: any[] }> = {
  tenants: (t) => ({
    sql: `INSERT INTO platform_tenants (id, org_id, name, slug, domain)
          VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT (id) DO UPDATE
            SET name=$3, slug=$4, domain=$5`,
    params: [t.id, t.orgId || 'org_default', t.name || '', t.slug || t.id, t.domain || ''],
  }),
  pages: (p) => ({
    sql: `INSERT INTO platform_pages (id, tenant_id, title, slug, blocks_json, is_published)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO UPDATE
            SET title=$3, slug=$4, blocks_json=$5, is_published=$6`,
    params: [p.id, p.tenantId || 'tenant_default', p.title || '', p.slug || p.id, JSON.stringify(p.blocks || []), p.isPublished ?? true],
  }),
  cms_entries: (e) => ({
    sql: `INSERT INTO platform_cms_entries (id, tenant_id, content_type_id, slug, data_json, status)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO UPDATE
            SET data_json=$5, status=$6`,
    params: [e.id, e.tenantId || 'tenant_default', e.contentTypeId || 'default', e.slug || e.id, JSON.stringify(e.data || {}), e.status || 'published'],
  }),
  products: (p) => ({
    sql: `INSERT INTO platform_products (id, tenant_id, name, sku, price, currency, stock, description)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (id) DO UPDATE
            SET name=$3, price=$5, stock=$7, description=$8`,
    params: [p.id, p.tenantId || 'tenant_default', p.name || '', p.sku || p.id, p.price ?? 0, p.currency || 'USD', p.stock ?? 100, p.description || ''],
  }),
  orders: (o) => ({
    sql: `INSERT INTO platform_orders (id, tenant_id, user_id, items_json, total_amount, status)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO UPDATE
            SET status=$6, total_amount=$5`,
    params: [o.id, o.tenantId || 'tenant_default', o.userId || 'guest', JSON.stringify(o.items || []), o.totalAmount ?? 0, o.status || 'pending'],
  }),
  leads: (l) => ({
    sql: `INSERT INTO platform_crm_leads (id, tenant_id, contact_name, email, company, deal_value, stage)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (id) DO UPDATE
            SET stage=$7, deal_value=$6`,
    params: [l.id, l.tenantId || 'tenant_default', l.contactName || '', l.email || '', l.company || '', l.dealValue ?? 0, l.stage || 'lead'],
  }),
  ledger: (e) => ({
    sql: `INSERT INTO platform_ledger (id, tenant_id, account_name, type, amount, description)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO NOTHING`,
    params: [e.id, e.tenantId || 'tenant_default', e.accountName || '', e.type || 'DEBIT', e.amount ?? 0, e.description || ''],
  }),
  audit_logs: (a) => ({
    sql: `INSERT INTO platform_audit_logs (id, tenant_id, actor_id, action, resource, details_json)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO NOTHING`,
    params: [a.id, a.tenantId || 'tenant_default', a.actorId || 'system', a.action || '', a.resource || '', JSON.stringify(a.details || {})],
  }),
};

const DELETE_SQL: Record<string, (id: string) => { sql: string; params: any[] }> = {
  tenants:     (id) => ({ sql: `DELETE FROM platform_tenants     WHERE id=$1`, params: [id] }),
  pages:       (id) => ({ sql: `DELETE FROM platform_pages       WHERE id=$1`, params: [id] }),
  cms_entries: (id) => ({ sql: `DELETE FROM platform_cms_entries WHERE id=$1`, params: [id] }),
  products:    (id) => ({ sql: `DELETE FROM platform_products    WHERE id=$1`, params: [id] }),
  orders:      (id) => ({ sql: `DELETE FROM platform_orders      WHERE id=$1`, params: [id] }),
  leads:       (id) => ({ sql: `DELETE FROM platform_crm_leads   WHERE id=$1`, params: [id] }),
};

// ── SyncEngine ────────────────────────────────────────────────────────────────

export class SyncEngine {
  private static instance: SyncEngine;

  private logger          = Logger.getInstance();
  private eventBus        = EventBus.getInstance();
  private aivenEngine     = AivenPostgresEngine.getInstance();

  // Local Docker PostgreSQL pool (only active when DATABASE_URL is the docker connection)
  private dockerPool:     pg.Pool | null = null;
  private dockerReady     = false;

  private retryQueue:     RetryItem[] = [];
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  // Statistics
  private stats = {
    aivenWrites:   0,
    dockerWrites:  0,
    retrySuccess:  0,
    retryFailed:   0,
    lastSync:      '',
  };

  private constructor() {
    this.initDockerPool();
    this.subscribeToEvents();
    this.startHeartbeat();
    this.logger.info('[SyncEngine] Dual-write SyncEngine initialized', {});
  }

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  // ── Docker local pool init ───────────────────────────────────────────────

  private async initDockerPool() {
    // Docker local PostgreSQL: postgres://platform:secretpassword@localhost:5432/ethenenginedb
    const dockerUrl = process.env.DOCKER_DATABASE_URL ||
                      `postgres://platform:${process.env.DB_PASSWORD || 'secretpassword'}@localhost:5432/ethenenginedb`;

    try {
      this.dockerPool = new Pool({
        connectionString: dockerUrl,
        max: 5,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 10000,
      });

      // Test connection
      const client = await this.dockerPool.connect();
      await client.query('SELECT 1');
      client.release();
      this.dockerReady = true;
      this.logger.info('[SyncEngine] Connected to local Docker PostgreSQL', {});
      await this.ensureDockerTables();
    } catch (err: any) {
      this.dockerReady = false;
      this.logger.warn(`[SyncEngine] Local Docker PostgreSQL not available (${err.message}). Docker writes disabled.`, {});
    }
  }

  // ── Ensure docker tables exist (mirrors Aiven schema) ───────────────────

  private async ensureDockerTables() {
    if (!this.dockerPool || !this.dockerReady) return;
    const ddl = `
      CREATE TABLE IF NOT EXISTS platform_tenants (
        id VARCHAR(255) PRIMARY KEY, org_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
        domain VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS platform_pages (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL,
        blocks_json JSONB NOT NULL DEFAULT '[]',
        is_published BOOLEAN DEFAULT true, updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS platform_cms_entries (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        content_type_id VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL,
        data_json JSONB NOT NULL DEFAULT '{}', status VARCHAR(50) DEFAULT 'published',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS platform_products (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL, sku VARCHAR(255) NOT NULL,
        price NUMERIC(12,2) NOT NULL, currency VARCHAR(10) DEFAULT 'USD',
        stock INT DEFAULT 100, description TEXT
      );
      CREATE TABLE IF NOT EXISTS platform_orders (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL, items_json JSONB NOT NULL DEFAULT '[]',
        total_amount NUMERIC(12,2) NOT NULL, status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS platform_crm_leads (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL, deal_value NUMERIC(12,2) NOT NULL,
        stage VARCHAR(50) DEFAULT 'lead', created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS platform_ledger (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        account_name VARCHAR(255) NOT NULL, type VARCHAR(20) NOT NULL,
        amount NUMERIC(12,2) NOT NULL, description TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS platform_audit_logs (
        id VARCHAR(255) PRIMARY KEY, tenant_id VARCHAR(255) NOT NULL,
        actor_id VARCHAR(255) NOT NULL, action VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL, details_json JSONB,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    try {
      await this.dockerPool.query(ddl);
      this.logger.info('[SyncEngine] Docker PostgreSQL schemas verified (8 tables)', {});
    } catch (err: any) {
      this.logger.error(`[SyncEngine] Docker schema setup failed: ${err.message}`, {});
    }
  }

  // ── EventBus subscriptions ───────────────────────────────────────────────

  private subscribeToEvents() {
    const eventMapping: Record<string, { collection: string; operation: 'upsert' | 'delete'; extractId?: (payload: any) => string }> = {
      'tenant.created': { collection: 'tenants', operation: 'upsert' },
      'tenant.updated': { collection: 'tenants', operation: 'upsert' },
      'tenant.deleted': { collection: 'tenants', operation: 'delete', extractId: (p) => p.id || p.tenantId },
      'page.created': { collection: 'pages', operation: 'upsert' },
      'page.updated': { collection: 'pages', operation: 'upsert' },
      'page.deleted': { collection: 'pages', operation: 'delete', extractId: (p) => p.pageId || p.id },
      'website.page.created': { collection: 'pages', operation: 'upsert' },
      'website.page.updated': { collection: 'pages', operation: 'upsert' },
      'website.page.deleted': { collection: 'pages', operation: 'delete', extractId: (p) => p.pageId || p.id },
      'cms.entry.created': { collection: 'cms_entries', operation: 'upsert' },
      'cms.entry.updated': { collection: 'cms_entries', operation: 'upsert' },
      'cms.entry.published': { collection: 'cms_entries', operation: 'upsert' },
      'cms.entry.deleted': { collection: 'cms_entries', operation: 'delete', extractId: (p) => p.id || p.entryId },
      'product.created': { collection: 'products', operation: 'upsert' },
      'product.updated': { collection: 'products', operation: 'upsert' },
      'product.deleted': { collection: 'products', operation: 'delete', extractId: (p) => p.id || p.productId },
      'commerce.product.created': { collection: 'products', operation: 'upsert' },
      'order.created': { collection: 'orders', operation: 'upsert' },
      'order.updated': { collection: 'orders', operation: 'upsert' },
      'lead.created': { collection: 'leads', operation: 'upsert' },
      'lead.updated': { collection: 'leads', operation: 'upsert' },
      'crm.lead.created': { collection: 'leads', operation: 'upsert' },
      'ledger.entry.created': { collection: 'ledger', operation: 'upsert' },
      'accounting.transaction.posted': { collection: 'ledger', operation: 'upsert' },
      'audit.log.created': { collection: 'audit_logs', operation: 'upsert' },
      'audit.created': { collection: 'audit_logs', operation: 'upsert' },
    };

    for (const [eventName, config] of Object.entries(eventMapping)) {
      this.eventBus.subscribe(eventName, (e: PlatformEvent<any>) => {
        const payload = e.payload;
        if (!payload) return;

        // If payload is already a fully formed SyncRecord
        if (payload.collection && payload.operation && payload.id) {
          this.syncRecord(payload);
          return;
        }

        const items = Array.isArray(payload) ? payload : [payload];
        for (const item of items) {
          const id = config.extractId ? config.extractId(item) : item.id;
          if (!id) continue;

          this.syncRecord({
            id,
            collection: config.collection,
            operation: config.operation,
            data: config.operation === 'upsert' ? item : undefined,
            tenantId: item.tenantId || (e as any).context?.tenantId,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  }

  // ── Core dual-write ──────────────────────────────────────────────────────

  public async syncRecord(record: SyncRecord): Promise<void> {
    if (!record || !record.id || !record.collection || (record.operation === 'upsert' && !record.data)) {
      return; // Skip malformed or summary objects
    }

    const [aivenResult, dockerResult] = await Promise.allSettled([
      this.writeToTarget('aiven',  record),
      this.writeToTarget('docker', record),
    ]);

    this.stats.lastSync = new Date().toISOString();

    if (aivenResult.status === 'rejected') {
      this.logger.warn(`[SyncEngine] Aiven write failed for ${record.collection}/${record.id} — queued for retry`, {});
      this.enqueueRetry(record, 'aiven');
    }

    if (dockerResult.status === 'rejected') {
      // Docker is optional; only warn, no retry if it was never connected
      if (this.dockerReady) {
        this.logger.warn(`[SyncEngine] Docker write failed for ${record.collection}/${record.id} — queued for retry`, {});
        this.enqueueRetry(record, 'docker');
      }
    }
  }

  // ── Sync a whole collection (called by PersistenceDriver) ───────────────

  public async syncCollection(collectionName: string, data: any[], tenantId?: string): Promise<void> {
    for (const item of data) {
      await this.syncRecord({
        id:          item.id || `${collectionName}_${Date.now()}`,
        collection:  collectionName,
        operation:   'upsert',
        data:        item,
        tenantId,
        timestamp:   new Date().toISOString(),
      });
    }
  }

  // ── Write to a single target ─────────────────────────────────────────────

  private async writeToTarget(target: SyncTarget, record: SyncRecord): Promise<void> {
    const pool = target === 'aiven' ? null : this.dockerPool;

    // Aiven: use existing AivenPostgresEngine
    if (target === 'aiven') {
      const connected = await this.aivenEngine.ensureConnected();
      if (!connected) throw new Error('Aiven not connected');

      const { sql, params } = this.buildSQL(record);
      await this.aivenEngine.query(sql, params);
      this.stats.aivenWrites++;
      return;
    }

    // Docker: use local pool
    if (!this.dockerReady || !pool) {
      throw new Error('Docker pool not ready');
    }
    const { sql, params } = this.buildSQL(record);
    await pool.query(sql, params);
    this.stats.dockerWrites++;
  }

  // ── SQL builder ──────────────────────────────────────────────────────────

  private buildSQL(record: SyncRecord): { sql: string; params: any[] } {
    if (record.operation === 'delete') {
      const builder = DELETE_SQL[record.collection];
      if (!builder) return { sql: 'SELECT 1', params: [] }; // no-op for unknown
      return builder(record.id);
    }

    const builder = UPSERT_SQL[record.collection];
    if (!builder) return { sql: 'SELECT 1', params: [] }; // no-op for unknown
    return builder(record.data);
  }

  // ── Retry queue ──────────────────────────────────────────────────────────

  private enqueueRetry(record: SyncRecord, target: SyncTarget, attempt = 1) {
    const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 30_000); // 1s, 2s, 4s … cap 30s
    this.retryQueue.push({
      record,
      target,
      attempts:  attempt,
      nextRetry: Date.now() + delayMs,
    });
  }

  private async drainRetryQueue() {
    const now = Date.now();
    const due = this.retryQueue.filter(i => i.nextRetry <= now);
    this.retryQueue = this.retryQueue.filter(i => i.nextRetry > now);

    for (const item of due) {
      try {
        await this.writeToTarget(item.target, item.record);
        this.stats.retrySuccess++;
        this.logger.info(`[SyncEngine] Retry succeeded: ${item.target}/${item.record.collection}/${item.record.id}`, {});
      } catch {
        if (item.attempts < 3) {
          this.enqueueRetry(item.record, item.target, item.attempts + 1);
        } else {
          this.stats.retryFailed++;
          this.logger.error(`[SyncEngine] Gave up after 3 attempts: ${item.target}/${item.record.collection}/${item.record.id}`, {});
          // Persist failure to disk for manual review
          this.persistFailure(item);
        }
      }
    }
  }

  private persistFailure(item: RetryItem) {
    try {
      const failDir = path.resolve(process.cwd(), 'data', 'sync-failures');
      if (!fs.existsSync(failDir)) fs.mkdirSync(failDir, { recursive: true });
      const file = path.join(failDir, `fail_${Date.now()}_${item.record.id}.json`);
      fs.writeFileSync(file, JSON.stringify({ ...item, failedAt: new Date().toISOString() }, null, 2));
    } catch { /* non-fatal */ }
  }

  // ── Heartbeat ────────────────────────────────────────────────────────────

  private startHeartbeat(intervalMs = 60_000) {
    this.heartbeatTimer = setInterval(async () => {
      // Drain retries
      await this.drainRetryQueue();

      // Re-test docker connectivity if it was previously down
      if (!this.dockerReady && this.dockerPool) {
        try {
          const client = await this.dockerPool.connect();
          await client.query('SELECT 1');
          client.release();
          this.dockerReady = true;
          this.logger.info('[SyncEngine] Docker PostgreSQL reconnected', {});
        } catch { /* still down */ }
      }

      if (this.retryQueue.length > 0) {
        this.logger.warn(`[SyncEngine] Heartbeat: ${this.retryQueue.length} item(s) pending retry`, {});
      }
    }, intervalMs);
    (this.heartbeatTimer as any)?.unref?.();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  public getStats() {
    return {
      ...this.stats,
      retryQueueDepth: this.retryQueue.length,
      dockerConnected: this.dockerReady,
    };
  }

  public async forceSync(collectionName: string, data: any[]) {
    this.logger.info(`[SyncEngine] Force-syncing ${data.length} records in "${collectionName}"`, {});
    await this.syncCollection(collectionName, data);
  }

  public stop() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }
}
