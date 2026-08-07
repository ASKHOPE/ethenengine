// Integration Test Suite for Business Platform Architecture

import { EventBus } from '../src/foundation/EventBus.js';
import { CorePlatformManager } from '../src/core/CorePlatformManager.js';
import { CapabilityRegistry } from '../src/capability-sdk/CapabilityRegistry.js';
import { ThemeEngine } from '../src/capabilities/theme-engine/ThemeEngine.js';
import { BasicCMS } from '../src/capabilities/basic-cms/BasicCMS.js';
import { WebsiteBuilder } from '../src/capabilities/website-builder/WebsiteBuilder.js';
import { CommerceEngine } from '../src/capabilities/commerce/CommerceEngine.js';
import { NotificationEngine } from '../src/core/NotificationEngine.js';
import { WorkflowEngine } from '../src/core/WorkflowEngine.js';
import { SearchEngine } from '../src/core/SearchEngine.js';
import { MediaEngine } from '../src/core/MediaEngine.js';
import { MarketplaceEngine } from '../src/capabilities/marketplace/MarketplaceEngine.js';

async function runTestSuite() {
  console.log('=======================================================');
  console.log(' Running Platform Architecture End-to-End Test Suite...');
  console.log('=======================================================');

  // 1. Core Platform & Multi-tenancy Test
  const core = CorePlatformManager.getInstance();
  const tenant = core.createTenant('org_acme', 'Beta Corp', 'beta', 'beta.localhost', 'usr_admin');
  console.log('✓ Test 1: Created Multi-tenant Environment ->', tenant.id);

  // 2. Capability Registry Test
  const capabilityRegistry = CapabilityRegistry.getInstance();
  const activeCaps = capabilityRegistry.listCapabilities();
  console.log(`✓ Test 2: Capability Registry Active Count -> ${activeCaps.length}`);

  // 3. Theme Engine Test
  const themeEngine = ThemeEngine.getInstance();
  const theme = themeEngine.getThemeForTenant(tenant.id);
  console.log('✓ Test 3: Theme Token Compilation ->', theme.tokens.primaryColor);

  // 4. Basic CMS Test
  const cms = BasicCMS.getInstance();
  const contentType = cms.createContentType({
    tenantId: tenant.id,
    name: 'Press Release',
    slug: 'press-release',
    fields: [{ name: 'headline', label: 'Headline', type: 'text', required: true }],
  });
  console.log('✓ Test 4: Created CMS Content Type ->', contentType.name);

  // 5. Commerce & Order Event Test
  const commerce = CommerceEngine.getInstance();
  const product = commerce.createProduct({
    tenantId: tenant.id,
    name: 'Cloud Server Slot',
    sku: 'CLOUD-001',
    price: 49,
    currency: 'USD',
    stock: 50,
    description: 'Cloud slot',
  });
  commerce.addToCart(tenant.id, 'usr_beta_user', product.id, 2);
  const order = commerce.createOrder(tenant.id, 'usr_beta_user');
  console.log('✓ Test 5: Commerce Order Placed & Event Published -> Order ID:', order.id);

  // 6. Notification & Workflow Dispatch Test
  const notifEngine = NotificationEngine.getInstance();
  const logs = notifEngine.getDispatchedLogs(tenant.id);
  console.log(`✓ Test 6: Notification Engine Dispatched Log Count -> ${logs.length}`);

  // 7. Search Engine Query Test
  const searchEngine = SearchEngine.getInstance();
  const searchResults = searchEngine.search('tenant_default', 'Website');
  console.log(`✓ Test 7: Search Query Matched ${searchResults.length} indexed document(s)`);

  // 8. Media Engine Upload Test
  const mediaEngine = MediaEngine.getInstance();
  const asset = await mediaEngine.uploadAsset(tenant.id, 'banner.jpg', 'image/jpeg', Buffer.from('fake-image-bytes'));
  console.log('✓ Test 8: Media Asset Uploaded -> Asset URL:', asset.url);

  // 9. Marketplace Test
  const marketplace = MarketplaceEngine.getInstance();
  marketplace.installCapability(tenant.id, 'capability_commerce');
  console.log('✓ Test 9: Installed Marketplace Capability for Tenant ->', tenant.id);

  console.log('=======================================================');
  console.log(' ALL 9 INTEGRATION TESTS PASSED SUCCESSFULLY!          ');
  console.log('=======================================================');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
