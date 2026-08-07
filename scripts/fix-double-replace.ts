/**
 * ETHENENGINE — Emergency corrective fix for double-replace side-effect.
 * Fixes: EETHENENGINE → ETHENENGINE  and  eethenengine.com → ethenengine.com
 * Run: npx tsx scripts/fix-double-replace.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!.split('?')[0],
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  const client = await pool.connect();
  console.log('\n  Connected to Aiven. Applying corrective fixes...\n');

  // Fix name: EETHENENGINE → ETHENENGINE
  const r1 = await client.query(
    `UPDATE platform_tenants SET name = REPLACE(name, 'EETHENENGINE', 'ETHENENGINE') WHERE name LIKE '%EETHENENGINE%'`
  );
  console.log(`  [${r1.rowCount ? 'FIXED' : 'OK'}] tenant.name: ${r1.rowCount} row(s)`);

  // Fix domain: eethenengine.com → ethenengine.com
  const r2 = await client.query(
    `UPDATE platform_tenants SET domain = REPLACE(domain, 'eethenengine.com', 'ethenengine.com') WHERE domain LIKE '%eethenengine%'`
  );
  console.log(`  [${r2.rowCount ? 'FIXED' : 'OK'}] tenant.domain: ${r2.rowCount} row(s)`);

  // Verify
  const after = await client.query(`SELECT id, name, domain FROM platform_tenants`);
  console.log('\n  Final tenant state:');
  for (const row of after.rows) {
    console.log(`    id=${row.id}  name="${row.name}"  domain="${row.domain}"`);
  }

  // Also fix pages blocks_json double-replace if any
  const r3 = await client.query(
    `UPDATE platform_pages
     SET blocks_json = REPLACE(blocks_json::text, 'EETHENENGINE', 'ETHENENGINE')::jsonb
     WHERE blocks_json::text LIKE '%EETHENENGINE%'`
  );
  console.log(`\n  [${r3.rowCount ? 'FIXED' : 'OK'}] pages blocks_json double-E: ${r3.rowCount} row(s)`);

  console.log('\n  Done.\n');
  client.release();
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
