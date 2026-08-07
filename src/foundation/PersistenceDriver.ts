// Database Persistence Layer for tenant configuration, pages, CMS content, and logs
// v2: Every saveCollection now dual-writes via SyncEngine (Docker + Aiven) and
//     publishes a 'persistence.collection.saved' event to the EventBus.

import fs from 'fs';
import path from 'path';
import { AivenPostgresEngine } from '../db/aivenPostgres.js';
import { EventBus } from './EventBus.js';

export class PersistenceDriver {
  private static instance: PersistenceDriver;
  private dbFilePath: string;
  private memoryStore: Record<string, any> = {};
  private postgres = AivenPostgresEngine.getInstance();
  private eventBus = EventBus.getInstance();

  // Lazy-load SyncEngine to avoid circular imports at startup
  private syncEngine: any = null;
  private getSyncEngine() {
    if (!this.syncEngine) {
      // Dynamic import keeps the module graph acyclic
      import('./SyncEngine.js').then(m => {
        this.syncEngine = m.SyncEngine.getInstance();
      }).catch(() => { /* SyncEngine unavailable – degrade gracefully */ });
    }
    return this.syncEngine;
  }

  private constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbFilePath = path.join(dataDir, 'platform_db.json');
    this.load();

    // Kick off SyncEngine init early
    this.getSyncEngine();
  }

  public static getInstance(): PersistenceDriver {
    if (!PersistenceDriver.instance) {
      PersistenceDriver.instance = new PersistenceDriver();
    }
    return PersistenceDriver.instance;
  }

  private load() {
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        this.memoryStore = JSON.parse(raw);
      } catch (e) {
        console.error('[PersistenceDriver] Failed to read database file:', e);
        this.memoryStore = {};
      }
    }
  }

  // ── saveCollection ──────────────────────────────────────────────────────────
  // 1. Updates in-memory store
  // 2. Persists to local JSON (disk fallback)
  // 3. Dual-writes via SyncEngine to Docker + Aiven concurrently
  // 4. Publishes event so any listener can react
  public async saveCollection(collectionName: string, data: any[]) {
    this.memoryStore[collectionName] = data;

    // ── 1. Local JSON disk backup ──────────────────────────────────────────
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch (e) {
      console.error('[PersistenceDriver] Failed to persist data to disk:', e);
    }

    // ── 2. SyncEngine dual-write (Docker + Aiven) ──────────────────────────
    const sync = this.getSyncEngine();
    if (sync) {
      try {
        await sync.syncCollection(collectionName, data);
      } catch (err) {
        // SyncEngine has its own retry logic; log and continue
        console.error(`[PersistenceDriver] SyncEngine error for "${collectionName}":`, err);
      }
    } else {
      // Fallback: direct Aiven write (legacy path, kept for safety)
      await this.legacyAivenSync(collectionName, data);
    }

    // ── 3. EventBus notification ───────────────────────────────────────────
    this.eventBus.publish('persistence.collection.saved', {
      collection: collectionName,
      count: data.length,
      timestamp: new Date().toISOString(),
    }).catch(() => { /* non-fatal */ });
  }

  // ── Legacy direct Aiven sync (used only if SyncEngine not yet loaded) ────
  private async legacyAivenSync(collectionName: string, data: any[]) {
    const isCloud = await this.postgres.ensureConnected();
    if (!isCloud) return;

    try {
      if (collectionName === 'tenants') {
        for (const item of data) {
          await this.postgres.query(
            `INSERT INTO platform_tenants (id, org_id, name, slug, domain)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, domain = EXCLUDED.domain, slug = EXCLUDED.slug`,
            [item.id, item.orgId || 'org_default', item.name, item.slug, item.domain || '']
          );
        }
      } else if (collectionName === 'pages') {
        for (const page of data) {
          await this.postgres.query(
            `INSERT INTO platform_pages (id, tenant_id, title, slug, blocks_json, is_published)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, blocks_json = EXCLUDED.blocks_json`,
            [page.id, page.tenantId, page.title, page.slug, JSON.stringify(page.blocks || []), page.isPublished ?? true]
          );
        }
      } else if (collectionName === 'cms_entries') {
        for (const entry of data) {
          await this.postgres.query(
            `INSERT INTO platform_cms_entries (id, tenant_id, content_type_id, slug, data_json, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE SET data_json = EXCLUDED.data_json, status = EXCLUDED.status`,
            [entry.id, entry.tenantId, entry.contentTypeId, entry.slug, JSON.stringify(entry.data || {}), entry.status || 'published']
          );
        }
      } else if (collectionName === 'products') {
        for (const prod of data) {
          await this.postgres.query(
            `INSERT INTO platform_products (id, tenant_id, name, sku, price, currency, stock, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock`,
            [prod.id, prod.tenantId, prod.name, prod.sku, prod.price, prod.currency || 'USD', prod.stock || 100, prod.description || '']
          );
        }
      } else if (collectionName === 'leads') {
        for (const lead of data) {
          await this.postgres.query(
            `INSERT INTO platform_crm_leads (id, tenant_id, contact_name, email, company, deal_value, stage)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET stage = EXCLUDED.stage, deal_value = EXCLUDED.deal_value`,
            [lead.id, lead.tenantId, lead.contactName, lead.email, lead.company, lead.dealValue, lead.stage]
          );
        }
      }
    } catch (err) {
      console.error(`[PersistenceDriver] Legacy Aiven sync error for "${collectionName}":`, err);
    }
  }

  public getCollection<T = any>(collectionName: string): T[] {
    return this.memoryStore[collectionName] || [];
  }
}
