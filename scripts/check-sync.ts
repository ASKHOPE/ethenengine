/**
 * ETHENENGINE — Aiven PostgreSQL <-> Local JSON Sync Check
 * Run: npx tsx scripts/check-sync.ts
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

const ok   = (msg: string) => console.log(`${COLORS.green}  [OK]${COLORS.reset}   ${msg}`);
const fail = (msg: string) => console.log(`${COLORS.red}  [FAIL]${COLORS.reset} ${msg}`);
const warn = (msg: string) => console.log(`${COLORS.yellow}  [WARN]${COLORS.reset} ${msg}`);
const info = (msg: string) => console.log(`${COLORS.cyan}  [--]${COLORS.reset}   ${msg}`);
const header = (msg: string) => console.log(`\n${COLORS.bold}${msg}${COLORS.reset}`);

async function main() {
  console.log('');
  console.log('===============================================================');
  console.log('  ETHENENGINE - Aiven PostgreSQL <-> Local JSON Sync Check');
  console.log('===============================================================');

  // Load local JSON
  const localDbPath = path.resolve(process.cwd(), 'data/platform_db.json');
  let localDb: any = {};
  if (fs.existsSync(localDbPath)) {
    localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
    ok(`Loaded local fallback: data/platform_db.json`);
  } else {
    warn('data/platform_db.json not found.');
  }

  header('LOCAL (data/platform_db.json) Summary');
  const localTenants    = localDb.tenants     ?? [];
  const localPages      = localDb.pages       ?? [];
  const localCmsEntries = localDb.cms_entries ?? [];
  const localProducts   = localDb.products    ?? [];
  const localLeads      = localDb.leads       ?? [];

  info(`Tenants    : ${localTenants.length} record(s)   → ${localTenants.map((t: any) => t.id).join(', ')}`);
  info(`Pages      : ${localPages.length} record(s)   → ${localPages.map((p: any) => p.id).join(', ')}`);
  info(`CMS entries: ${localCmsEntries.length} record(s)`);
  info(`Products   : ${localProducts.length} record(s)`);
  info(`CRM Leads  : ${localLeads.length} record(s)`);

  // Connect to Aiven
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('secretpassword')) {
    fail('DATABASE_URL not set or is the local docker placeholder — cannot check Aiven.');
    process.exit(1);
  }

  header('AIVEN CLOUD POSTGRESQL');
  const redacted = dbUrl.replace(/:([^:@\s]+)@/, ':***@');
  info(`Connecting to: ${redacted}`);

  const pool = new Pool({
    connectionString: dbUrl.split('?')[0],
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  let client: pg.PoolClient;
  try {
    client = await pool.connect();
    const connTest = await client.query('SELECT NOW() as ts, current_database() as db');
    ok(`Connected! DB: ${connTest.rows[0].db} | Server time: ${connTest.rows[0].ts}`);
  } catch (err: any) {
    fail(`Failed to connect to Aiven PostgreSQL: ${err.message}`);
    await pool.end();
    process.exit(1);
  }

  // Table-by-table row counts
  header('TABLE ROW COUNTS (Aiven vs Local JSON)');

  const tables: { table: string; localCount: number }[] = [
    { table: 'platform_tenants',     localCount: localTenants.length },
    { table: 'platform_pages',       localCount: localPages.length },
    { table: 'platform_cms_entries', localCount: localCmsEntries.length },
    { table: 'platform_products',    localCount: localProducts.length },
    { table: 'platform_orders',      localCount: (localDb.orders      ?? []).length },
    { table: 'platform_crm_leads',   localCount: localLeads.length },
    { table: 'platform_ledger',      localCount: (localDb.ledger      ?? []).length },
    { table: 'platform_audit_logs',  localCount: (localDb.audit_logs  ?? []).length },
  ];

  let allInSync = true;
  const missingTables: string[] = [];

  for (const { table, localCount } of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      const aivenCount = parseInt(res.rows[0].count, 10);
      const label = `${table.padEnd(28)} Aiven: ${String(aivenCount).padStart(4)}   Local JSON: ${String(localCount).padStart(4)}`;

      if (aivenCount === 0 && localCount === 0) {
        ok(`${label}   [BOTH EMPTY]`);
      } else if (aivenCount >= localCount && localCount > 0) {
        ok(`${label}   [IN SYNC or Aiven has more]`);
      } else if (aivenCount > 0 && localCount === 0) {
        ok(`${label}   [Aiven-only data — no local baseline]`);
      } else if (aivenCount === 0 && localCount > 0) {
        fail(`${label}   [NOT SEEDED IN AIVEN]`);
        allInSync = false;
      } else {
        warn(`${label}   [COUNT MISMATCH]`);
        allInSync = false;
      }
    } catch (err: any) {
      fail(`${table.padEnd(28)} TABLE DOES NOT EXIST in Aiven yet!`);
      missingTables.push(table);
      allInSync = false;
    }
  }

  // Tenant ID spot-check
  header('TENANT ID SPOT-CHECK');
  try {
    const aivenTenants = await client.query(`SELECT id, name, slug, domain FROM platform_tenants ORDER BY id`);
    if (aivenTenants.rows.length === 0) {
      fail('platform_tenants is EMPTY in Aiven — data has NOT been seeded!');
    } else {
      for (const row of aivenTenants.rows) {
        const localMatch = localTenants.find((t: any) => t.id === row.id);
        if (localMatch) {
          ok(`Tenant "${row.id}"  |  "${row.name}"  |  domain: ${row.domain}   [BOTH]`);
        } else {
          warn(`Tenant "${row.id}" is in Aiven but NOT in local JSON (Aiven-only record)`);
        }
      }
      for (const lt of localTenants) {
        const found = aivenTenants.rows.find((r: any) => r.id === lt.id);
        if (!found) {
          fail(`Tenant "${lt.id}" is in local JSON but MISSING from Aiven — needs seeding!`);
        }
      }
    }
  } catch (err: any) {
    fail(`Could not check tenants: ${err.message}`);
  }

  // Summary
  header('SYNC RESULT');
  if (missingTables.length > 0) {
    fail(`The following tables are missing from Aiven: ${missingTables.join(', ')}`);
    info('  → Tables are created automatically when the app starts (AivenPostgresEngine.ensureTablesExist)');
    info('  → Start the app once with a valid DATABASE_URL to create all tables, then re-run this script.');
  }
  if (allInSync) {
    console.log(`\n${COLORS.green}${COLORS.bold}  RESULT: Aiven PostgreSQL and local JSON are IN SYNC!${COLORS.reset}\n`);
  } else {
    console.log(`\n${COLORS.red}${COLORS.bold}  RESULT: SYNC ISSUES DETECTED — see above.${COLORS.reset}`);
    console.log(`${COLORS.yellow}  Run seed: npx tsx scripts/seed-to-aiven.ts${COLORS.reset}\n`);
  }

  client!.release();
  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
