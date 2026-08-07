/**
 * ETHENENGINE — Aiven PostgreSQL Idempotent Data Patch v2
 *
 * Safe to run multiple times. Uses exact WHERE filters so a second run
 * is always a no-op (no double-replace possible).
 *
 * Run: npx tsx scripts/patch-aiven.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// ── ANSI helpers ─────────────────────────────────────────────────────────────
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', C = '\x1b[36m', B = '\x1b[1m', X = '\x1b[0m';
const ok   = (m: string) => console.log(`${G}  [UPDATED]${X} ${m}`);
const noop = (m: string) => console.log(`${C}  [NO-OP]${X}   ${m}`);
const fail = (m: string) => console.log(`${R}  [ERROR]${X}   ${m}`);
const info = (m: string) => console.log(`         ${m}`);
const hdr  = (m: string) => console.log(`\n${B}${m}${X}`);

// Each patch: only matches the OLD string, replaces with NEW.
// Because the WHERE clause checks for the exact OLD token, a second run never matches → safe.
interface Patch {
  label:  string;
  table:  string;
  column: string;
  old:    string;  // exact string to find (case-insensitive LIKE)
  new:    string;  // exact replacement
  isJsonb?: boolean; // cast column to text, replace, cast back
}

const PATCHES: Patch[] = [
  // ── platform_tenants ──────────────────────────────────────────────────
  { table:'platform_tenants', column:'name',   old:'THENENGINE',     new:'ETHENENGINE',    label:'tenant.name THENENGINE→ETHENENGINE' },
  { table:'platform_tenants', column:'name',   old:'thenengine',     new:'ethenengine',    label:'tenant.name thenengine→ethenengine' },
  { table:'platform_tenants', column:'domain', old:'ethanengine.com',new:'ethenengine.com',label:'tenant.domain ethanengine→ethenengine' },
  { table:'platform_tenants', column:'domain', old:'thenengine.com', new:'ethenengine.com',label:'tenant.domain thenengine→ethenengine' },

  // ── platform_pages ────────────────────────────────────────────────────
  { table:'platform_pages', column:'title', old:'THENENGINE', new:'ETHENENGINE', label:'pages.title THENENGINE→ETHENENGINE' },
  { table:'platform_pages', column:'title', old:'thenengine', new:'ethenengine', label:'pages.title thenengine→ethenengine' },
  { table:'platform_pages', column:'blocks_json', isJsonb:true, old:'THENENGINE',     new:'ETHENENGINE',    label:'pages.blocks_json THENENGINE→ETHENENGINE' },
  { table:'platform_pages', column:'blocks_json', isJsonb:true, old:'thenengine.com', new:'ethenengine.com',label:'pages.blocks_json thenengine.com→ethenengine.com' },
  { table:'platform_pages', column:'blocks_json', isJsonb:true, old:'ethanengine.com',new:'ethenengine.com',label:'pages.blocks_json ethanengine.com→ethenengine.com' },

  // ── platform_cms_entries ──────────────────────────────────────────────
  { table:'platform_cms_entries', column:'data_json', isJsonb:true, old:'THENENGINE',     new:'ETHENENGINE',    label:'cms.data_json THENENGINE→ETHENENGINE' },
  { table:'platform_cms_entries', column:'data_json', isJsonb:true, old:'thenengine.com', new:'ethenengine.com',label:'cms.data_json thenengine.com→ethenengine.com' },
  { table:'platform_cms_entries', column:'data_json', isJsonb:true, old:'ethanengine.com',new:'ethenengine.com',label:'cms.data_json ethanengine.com→ethenengine.com' },

  // ── platform_products ─────────────────────────────────────────────────
  { table:'platform_products', column:'name',        old:'THENENGINE',     new:'ETHENENGINE',    label:'products.name THENENGINE→ETHENENGINE' },
  { table:'platform_products', column:'description', old:'THENENGINE',     new:'ETHENENGINE',    label:'products.description THENENGINE→ETHENENGINE' },
  { table:'platform_products', column:'description', old:'thenengine.com', new:'ethenengine.com',label:'products.description thenengine.com→ethenengine.com' },
  { table:'platform_products', column:'description', old:'ethanengine.com',new:'ethenengine.com',label:'products.description ethanengine.com→ethenengine.com' },

  // ── platform_crm_leads ────────────────────────────────────────────────
  { table:'platform_crm_leads', column:'email', old:'@thenengine.com', new:'@ethenengine.com', label:'leads.email @thenengine→@ethenengine' },

  // ── platform_orders ───────────────────────────────────────────────────
  { table:'platform_orders', column:'items_json', isJsonb:true, old:'THENENGINE', new:'ETHENENGINE', label:'orders.items_json THENENGINE→ETHENENGINE' },

  // ── platform_audit_logs ───────────────────────────────────────────────
  { table:'platform_audit_logs', column:'action',       old:'THENENGINE', new:'ETHENENGINE', label:'audit.action THENENGINE→ETHENENGINE' },
  { table:'platform_audit_logs', column:'resource',     old:'THENENGINE', new:'ETHENENGINE', label:'audit.resource THENENGINE→ETHENENGINE' },
  { table:'platform_audit_logs', column:'details_json', isJsonb:true, old:'THENENGINE', new:'ETHENENGINE', label:'audit.details_json THENENGINE→ETHENENGINE' },
];

async function applyPatch(client: pg.PoolClient, p: Patch): Promise<number> {
  try {
    let sql: string;
    if (p.isJsonb) {
      // Only update rows where the OLD token exists; replacement is exact.
      sql = `UPDATE ${p.table}
             SET ${p.column} = REPLACE(${p.column}::text, $1, $2)::jsonb
             WHERE ${p.column}::text LIKE $3`;
    } else {
      sql = `UPDATE ${p.table}
             SET ${p.column} = REPLACE(${p.column}, $1, $2)
             WHERE ${p.column} LIKE $3`;
    }
    const res = await client.query(sql, [p.old, p.new, `%${p.old}%`]);
    const rows = res.rowCount ?? 0;
    if (rows > 0) {
      ok(`${p.label}  (${rows} row${rows !== 1 ? 's' : ''})`);
    } else {
      noop(`${p.label}`);
    }
    return rows;
  } catch (err: any) {
    fail(`${p.label}: ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ETHENENGINE — Aiven PostgreSQL Idempotent Data Patch v2');
  console.log('═══════════════════════════════════════════════════════════════');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('secretpassword')) {
    fail('DATABASE_URL not set or is the local docker placeholder. Aborting.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl.split('?')[0],
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  let client: pg.PoolClient;
  try {
    client = await pool.connect();
    const r = await client.query('SELECT NOW() as ts, current_database() as db');
    console.log(`\n  ${G}Connected${X} → DB: ${r.rows[0].db} | ${r.rows[0].ts}\n`);
  } catch (err: any) {
    fail(`Cannot connect to Aiven: ${err.message}`);
    await pool.end();
    process.exit(1);
  }

  // Apply all patches grouped by table
  const tables = [...new Set(PATCHES.map(p => p.table))];
  let totalUpdated = 0;

  for (const table of tables) {
    hdr(table);
    const tablePatches = PATCHES.filter(p => p.table === table);
    for (const patch of tablePatches) {
      totalUpdated += await applyPatch(client!, patch);
    }
  }

  // ── Post-patch verification ──────────────────────────────────────────────
  hdr('VERIFICATION — scanning for any remaining stale tokens');

  const staleTokens = ['THENENGINE', 'thenengine', 'ethanengine'];

  const columnsToCheck: { table: string; column: string; isJsonb?: boolean }[] = [
    { table: 'platform_tenants',     column: 'name' },
    { table: 'platform_tenants',     column: 'domain' },
    { table: 'platform_pages',       column: 'title' },
    { table: 'platform_pages',       column: 'blocks_json',  isJsonb: true },
    { table: 'platform_cms_entries', column: 'data_json',    isJsonb: true },
    { table: 'platform_products',    column: 'name' },
    { table: 'platform_products',    column: 'description' },
    { table: 'platform_crm_leads',   column: 'email' },
  ];

  let allClean = true;
  for (const { table, column, isJsonb } of columnsToCheck) {
    const col = isJsonb ? `${column}::text` : column;
    const conditions = staleTokens.map((_,i) => `${col} ILIKE $${i+1}`).join(' OR ');
    try {
      const res = await client!.query(
        `SELECT COUNT(*) as count FROM ${table} WHERE ${conditions}`,
        staleTokens.map(t => `%${t}%`)
      );
      const n = parseInt(res.rows[0].count, 10);
      if (n === 0) {
        ok(`${table}.${column} — clean`);
      } else {
        fail(`${table}.${column} — ${n} stale reference(s) remain`);
        allClean = false;
      }
    } catch (err: any) {
      fail(`${table}.${column}: ${err.message}`);
    }
  }

  // ── Tenant state after patch ─────────────────────────────────────────────
  hdr('FINAL TENANT STATE');
  const tenants = await client!.query(`SELECT id, name, domain FROM platform_tenants ORDER BY id`);
  for (const row of tenants.rows) {
    info(`id=${row.id}  name="${row.name}"  domain="${row.domain}"`);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  hdr('SUMMARY');
  if (allClean) {
    console.log(`\n${G}${B}  ALL CLEAN — ${totalUpdated} update(s) applied. Aiven is fully up to date.${X}\n`);
  } else {
    console.log(`\n${Y}${B}  ${totalUpdated} update(s) applied. Some stale references may remain — check above.${X}\n`);
  }

  client!.release();
  await pool.end();
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
