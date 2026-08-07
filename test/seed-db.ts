// Database Seeding Trigger Script for Aiven Cloud PostgreSQL

import { CorePlatformManager } from '../src/core/CorePlatformManager.js';
import { WebsiteBuilder } from '../src/capabilities/website-builder/WebsiteBuilder.js';
import { BasicCMS } from '../src/capabilities/basic-cms/BasicCMS.js';
import { CommerceEngine } from '../src/capabilities/commerce/CommerceEngine.js';
import { CRMEngine } from '../src/capabilities/crm/CRMEngine.js';
import { seedLioramediaTenant } from '../src/seed/seedLioramedia.js';
import { PersistenceDriver } from '../src/foundation/PersistenceDriver.js';

async function seedDatabaseTables() {
  console.log('=======================================================');
  console.log(' Seeding Aiven Cloud PostgreSQL Tables with Data...');
  console.log('=======================================================');

  // Wait 1.5s for database pool initialization
  await new Promise(r => setTimeout(r, 1500));

  // 1. Seed LIORAMEDIA and Default datasets
  seedLioramediaTenant();

  const core = CorePlatformManager.getInstance();
  const websiteBuilder = WebsiteBuilder.getInstance();
  const cms = BasicCMS.getInstance();
  const commerce = CommerceEngine.getInstance();
  const crm = CRMEngine.getInstance();
  const persistence = PersistenceDriver.getInstance();

  // Sync default & lioramedia collections to Aiven PostgreSQL tables
  await persistence.saveCollection('tenants', core.listTenants());
  await persistence.saveCollection('pages', [
    ...websiteBuilder.listPages('tenant_default'),
    ...websiteBuilder.listPages('tenant_lioramedia'),
  ]);
  await persistence.saveCollection('cms_entries', [
    ...cms.listEntries('tenant_default'),
    ...cms.listEntries('tenant_lioramedia'),
  ]);
  await persistence.saveCollection('products', [
    ...commerce.listProducts('tenant_default'),
    ...commerce.listProducts('tenant_lioramedia'),
  ]);
  await persistence.saveCollection('leads', [
    ...crm.listLeads('tenant_default'),
    ...crm.listLeads('tenant_lioramedia'),
  ]);

  console.log('=======================================================');
  console.log(' SUCCESS: All platform tables seeded on Aiven PostgreSQL!');
  console.log('=======================================================');
}

seedDatabaseTables().catch(err => {
  console.error('Seeding error:', err);
});
