// Live Aiven Cloud PostgreSQL Query Verification Script

import { AivenPostgresEngine } from '../src/db/aivenPostgres.js';

async function checkLiveDatabaseRows() {
  console.log('=======================================================');
  console.log(' Live Aiven Cloud PostgreSQL Database Query Inspector');
  console.log('=======================================================');

  const postgres = AivenPostgresEngine.getInstance();
  
  // Wait 1 second for pool connection setup
  await new Promise(r => setTimeout(r, 1000));

  if (!postgres.isCloudConnected()) {
    console.error('❌ Error: Aiven Cloud PostgreSQL is not connected.');
    process.exit(1);
  }

  // 1. Query platform_tenants
  console.log('\n--- 1. Querying platform_tenants ---');
  const tenantsRes = await postgres.query('SELECT id, name, slug, domain FROM platform_tenants ORDER BY created_at DESC');
  console.table(tenantsRes.rows);

  // 2. Query platform_pages
  console.log('\n--- 2. Querying platform_pages ---');
  const pagesRes = await postgres.query('SELECT id, tenant_id, title, slug, is_published FROM platform_pages LIMIT 5');
  console.table(pagesRes.rows);

  // 3. Query platform_cms_entries
  console.log('\n--- 3. Querying platform_cms_entries ---');
  const cmsRes = await postgres.query('SELECT id, tenant_id, slug, status, data_json->>\'title\' as title FROM platform_cms_entries LIMIT 5');
  console.table(cmsRes.rows);

  // 4. Query platform_products
  console.log('\n--- 4. Querying platform_products ---');
  const prodRes = await postgres.query('SELECT id, tenant_id, name, sku, price, currency, stock FROM platform_products LIMIT 5');
  console.table(prodRes.rows);

  // 5. Query platform_crm_leads
  console.log('\n--- 5. Querying platform_crm_leads ---');
  const leadsRes = await postgres.query('SELECT id, tenant_id, contact_name, company, deal_value, stage FROM platform_crm_leads LIMIT 5');
  console.table(leadsRes.rows);

  console.log('\n=======================================================');
  console.log(' SUCCESS: 100% Data Queried Live from Aiven PostgreSQL! ');
  console.log('=======================================================');
}

checkLiveDatabaseRows().catch((err) => {
  console.error('Database Query Error:', err);
  process.exit(1);
});
