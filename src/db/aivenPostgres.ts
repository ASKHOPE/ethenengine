// Aiven Cloud PostgreSQL Database Connection Engine & Schema Sync

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export class AivenPostgresEngine {
  private static instance: AivenPostgresEngine;
  private pool: pg.Pool | null = null;
  private isConnected = false;

  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.initPromise = this.initPool();
  }

  public static getInstance(): AivenPostgresEngine {
    if (!AivenPostgresEngine.instance) {
      AivenPostgresEngine.instance = new AivenPostgresEngine();
    }
    return AivenPostgresEngine.instance;
  }

  public async ensureConnected(): Promise<boolean> {
    if (this.initPromise) {
      await this.initPromise;
    }
    return this.isConnected;
  }

  private async initPool() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('secretpassword@ethenengine-postgres')) {
      console.log('[AivenPostgres] No valid Aiven DATABASE_URL supplied. Operating in memory/disk fallback mode.');
      return;
    }

    try {
      const cleanConnectionString = dbUrl.split('?')[0];
      this.pool = new Pool({
        connectionString: cleanConnectionString,
        ssl: {
          rejectUnauthorized: false, // Required for Aiven SSL connections
        },
        max: 15,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      this.pool.on('error', (err) => {
        console.error('[AivenPostgres] Unexpected pool connection error:', err);
      });

      await this.testConnection();
    } catch (err) {
      console.error('[AivenPostgres] Failed to initialize connection pool:', err);
    }
  }

  private async testConnection() {
    if (!this.pool) return;
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
      this.isConnected = true;
      console.log(`✓ [AivenPostgres] Connected to Aiven Cloud PostgreSQL (${res.rows[0].db_name}) at ${res.rows[0].current_time}`);
      client.release();

      await this.ensureTablesExist();
    } catch (err: any) {
      console.warn(`[AivenPostgres] Connection attempt to Aiven PostgreSQL failed (${err.message}). Using local fallback.`);
      this.isConnected = false;
    }
  }

  public async ensureTablesExist() {
    if (!this.pool || !this.isConnected) return;

    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS platform_tenants (
        id VARCHAR(255) PRIMARY KEY,
        org_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        domain VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platform_pages (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        blocks_json JSONB NOT NULL,
        is_published BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platform_cms_entries (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        content_type_id VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        data_json JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'published',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platform_products (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(255) NOT NULL,
        price NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        stock INT DEFAULT 100,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS platform_orders (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        items_json JSONB NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platform_crm_leads (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        deal_value NUMERIC(12, 2) NOT NULL,
        stage VARCHAR(50) DEFAULT 'lead',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platform_ledger (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platform_audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        actor_id VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        details_json JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.pool.query(createTablesQuery);
      // Clean up legacy timestamp tenant records from earlier test runs
      await this.pool.query(`DELETE FROM platform_tenants WHERE id LIKE 'tenant_178%' OR (slug = 'acme' AND id != 'tenant_default');`);
      console.log('✓ [AivenPostgres] Verified PostgreSQL schemas for all 8 platform tables: platform_tenants, platform_pages, platform_cms_entries, platform_products, platform_orders, platform_crm_leads, platform_ledger, platform_audit_logs');
    } catch (err) {
      console.error('[AivenPostgres] Table creation query failed:', err);
    }
  }

  public async query(text: string, params?: any[]) {
    if (!this.pool || !this.isConnected) {
      throw new Error('Aiven PostgreSQL is not connected');
    }
    return this.pool.query(text, params);
  }

  public isCloudConnected(): boolean {
    return this.isConnected;
  }
}
