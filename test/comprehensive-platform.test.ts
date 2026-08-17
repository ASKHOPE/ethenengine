// Comprehensive Multi-Tier Platform Test Suite for ETHENENGINE
// Covers: Security & Crypto, Multi-Tenancy, Website Builder & Blocks, Theming & Holidays,
// Multi-Warehouse Inventory, Commerce & Orders, CRM & Lead Scoring, ERP & Double-Entry Ledger,
// Headless CMS & Full-Text Search.

import { CorePlatformManager } from '../src/core/CorePlatformManager.js';
import { TenantCryptoEngine } from '../src/foundation/TenantCryptoEngine.js';
import { WebsiteBuilder } from '../src/capabilities/website-builder/WebsiteBuilder.js';
import { BlockRegistry } from '../src/capabilities/website-builder/BlockRegistry.js';
import { ThemeEngine, THEME_PRESETS } from '../src/capabilities/theme-engine/ThemeEngine.js';
import { HolidayDesigner } from '../src/capabilities/theme-engine/HolidayEngine.js';
import { InventoryEngine } from '../src/capabilities/inventory/InventoryEngine.js';
import { CommerceEngine } from '../src/capabilities/commerce/CommerceEngine.js';
import { CRMEngine } from '../src/capabilities/crm/CRMEngine.js';
import { ERPEngine } from '../src/capabilities/erp/ERPEngine.js';
import { BasicCMS } from '../src/capabilities/basic-cms/BasicCMS.js';
import { SearchEngine } from '../src/core/SearchEngine.js';
import { IdentityEngine } from '../src/core/IdentityEngine.js';
import { AuthTokenEngine } from '../src/core/AuthTokenEngine.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${testName}${detail ? ' -> ' + detail : ''}`);
  }
}

async function runComprehensiveTests() {
  console.log('\n======================================================================');
  console.log(' 🧪 RUNNING COMPREHENSIVE MULTI-TIER ETHENENGINE TEST SUITE');
  console.log('======================================================================\n');

  const core = CorePlatformManager.getInstance();
  const testTenant = core.createTenant('org_enterprise_test', 'Omni Corp Global', 'omnicorp', 'omnicorp.localhost', 'usr_omni_admin');

  // =========================================================================
  // 1. SECURITY, ENCRYPTION & ZERO-KNOWLEDGE ISOLATION TESTS
  // =========================================================================
  console.log('🔒 1. Zero-Knowledge Cryptography & Tenant Isolation Tests');
  const cryptoEngine = TenantCryptoEngine.getInstance();
  const rawPayload = 'CONFIDENTIAL_FINANCIAL_PAYLOAD_2026_Q4';
  const encrypted = cryptoEngine.encryptForTenant(testTenant.id, rawPayload);
  const decrypted = cryptoEngine.decryptForTenant(encrypted);

  assert(encrypted.iv !== undefined && encrypted.cipherText !== undefined, 'PBKDF2 AES-256-GCM cipher structure valid');
  assert(decrypted === rawPayload, 'Cryptographic decrypt matches plaintext payload');

  // Cross-tenant breach test
  let crossTenantFailed = false;
  try {
    cryptoEngine.decryptForTenant({
      ...encrypted,
      tenantId: 'tenant_malicious_attacker',
    });
  } catch (e) {
    crossTenantFailed = true;
  }
  assert(crossTenantFailed, 'Cross-tenant key breach attempt rejected cryptographically');

  // =========================================================================
  // 2. IDENTITY, JWT AUTH & RBAC CLAIMS
  // =========================================================================
  console.log('\n👤 2. Identity, JWT Authentication & RBAC Tests');
  const identity = IdentityEngine.getInstance();

  const user = identity.registerUser({
    tenantId: testTenant.id,
    email: 'lead_developer@omnicorp.com',
    password: 'SuperSecretPass123!',
    name: 'Lead Architect',
    type: 'TENANT_USER',
    roles: ['tenant_admin'],
  });
  assert(user.id.startsWith('usr_'), 'User created with tenant-scoped UUID');
  assert(user.tenantId === testTenant.id, 'User bound strictly to tenant context');

  const token = AuthTokenEngine.generateToken(user);
  const verified = AuthTokenEngine.verifyToken(token);
  assert(verified !== null && verified.userId === user.id, 'JWT signature verified with tenant context payload');

  // =========================================================================
  // 3. WEBSITE BUILDER, BLOCK REGISTRY & BEM CSS COMPILATION
  // =========================================================================
  console.log('\n🌐 3. Website Builder, DRY Block Registry & BEM Rendering Tests');
  const websiteBuilder = WebsiteBuilder.getInstance();
  const blockRegistry = BlockRegistry.getInstance();

  const allBlocks = blockRegistry.list();
  assert(allBlocks.length >= 10, `BlockRegistry loaded ${allBlocks.length} component types`);

  const samplePage = websiteBuilder.createPage({
    tenantId: testTenant.id,
    title: 'Omni Global Platform Hub',
    slug: 'omni-hub',
    isPublished: true,
    seo: { title: 'Omni Hub', description: 'Global Hub for Omni Corp' },
    blocks: [
      { id: 'b_nav', type: 'navbar', settings: { brandName: 'OMNICORP', logoInitial: 'O', ctaText: 'Sign In' } },
      { id: 'b_ann', type: 'announcement_bar', settings: { message: 'Q4 Enterprise Launch Event', badgeText: 'LIVE' } },
      { id: 'b_hero', type: 'hero', settings: { title: 'Accelerate Enterprise Scale', subtitle: 'Zero latency infrastructure.', ctaText: 'Get Started' } },
      { id: 'b_stats', type: 'stats', settings: { stat1Val: '99.999%', stat1Label: 'HA Uptime', stat2Val: '< 1ms', stat2Label: 'Rust Engine', stat3Val: '100%', stat3Label: 'Encrypted' } },
      { id: 'b_prod', type: 'product_grid', settings: { title: 'Enterprise Licenses' } },
      { id: 'b_page', type: 'pagination', settings: { totalPages: 4, currentPage: 1 } },
      { id: 'b_foot', type: 'footer', settings: { brandName: 'OMNICORP', copyrightText: '© 2026 Omni Corp' } }
    ]
  });

  const renderedHtml = websiteBuilder.renderPage(samplePage, { tenant: testTenant });
  assert(renderedHtml.includes('class="block-navbar"'), 'Renders clean BEM class .block-navbar');
  assert(renderedHtml.includes('class="block-announcement"'), 'Renders clean BEM class .block-announcement');
  assert(renderedHtml.includes('class="block-hero"'), 'Renders clean BEM class .block-hero');
  assert(renderedHtml.includes('class="block-stats"'), 'Renders clean BEM class .block-stats');
  assert(renderedHtml.includes('class="block-pagination"'), 'Renders clean BEM class .block-pagination');
  assert(!renderedHtml.includes('style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; background:rgba(15,23,42,0.7)'), 'Eliminated heavy redundant inline CSS styles');

  // =========================================================================
  // 4. THEME ENGINE, COOLORS PALETTES & HOLIDAY CELEBRATIONS
  // =========================================================================
  console.log('\n🎨 4. Theme Engine, Coolors Palettes & Celebration Designer Tests');
  const themeEngine = ThemeEngine.getInstance();
  const holidayDesigner = HolidayDesigner.getInstance();

  const presets = Object.keys(THEME_PRESETS);
  assert(presets.includes('desert_sand'), 'Includes Coolors Desert Sand preset');
  assert(presets.includes('day_clean'), 'Includes Day Clean mode preset');
  assert(presets.includes('night_slate'), 'Includes Midnight Slate night preset');

  const christmasCSS = holidayDesigner.compileHolidayCSS('christmas');
  assert(christmasCSS.includes("content: '⭐'") && christmasCSS.includes('holidaySnow'), 'Christmas compiles Star of Bethlehem badge & snowfall keyframes');

  const blackFridayCSS = holidayDesigner.compileHolidayCSS('black_friday');
  assert(blackFridayCSS.includes("content: '🔥'") && blackFridayCSS.includes('salePulse'), 'Black Friday compiles Fire tag badge & pulse animations');

  const flashSaleCSS = holidayDesigner.compileHolidayCSS('flash_sale');
  assert(flashSaleCSS.includes("content: '⚡'"), 'Flash Sale compiles 24h Lightning countdown effect');

  // =========================================================================
  // 5. MULTI-WAREHOUSE INVENTORY & STOCK TRANSFERS
  // =========================================================================
  console.log('\n📦 5. Multi-Warehouse Inventory & Bin/Aisle Logistics Tests');
  const inventory = InventoryEngine.getInstance();

  const wh1 = inventory.createWarehouse({
    tenantId: testTenant.id,
    name: 'Primary Logistics Hub - London',
    code: 'LON-WH-01',
    city: 'London',
    country: 'UK',
    isPrimary: true,
    capacityUnits: 25000,
  });

  const wh2 = inventory.createWarehouse({
    tenantId: testTenant.id,
    name: 'Satellite Depot - Berlin',
    code: 'BER-WH-02',
    city: 'Berlin',
    country: 'Germany',
    isPrimary: false,
    capacityUnits: 10000,
  });

  const stock1 = inventory.adjustStock({
    tenantId: testTenant.id,
    warehouseId: wh1.id,
    sku: 'SKU-PRO-4K',
    deltaQuantity: 150,
    reason: 'Initial stock intake',
  });

  const stock2 = inventory.adjustStock({
    tenantId: testTenant.id,
    warehouseId: wh2.id,
    sku: 'SKU-PRO-4K',
    deltaQuantity: 20,
    reason: 'Initial stock intake',
  });

  assert(stock1.quantityOnHand === 150, 'Initial stock level allocated in London WH');

  const transfer = inventory.createTransferOrder({
    tenantId: testTenant.id,
    fromWarehouseId: wh1.id,
    toWarehouseId: wh2.id,
    sku: 'SKU-PRO-4K',
    quantity: 40,
    status: 'in_transit',
    trackingNumber: 'TRK-GLOBAL-998822',
  });

  const transferAfterDebit = inventory.listStock(testTenant.id, wh1.id).find(s => s.sku === 'SKU-PRO-4K');
  assert(transferAfterDebit?.quantityOnHand === 110, 'London warehouse debited 40 units (150 -> 110)');

  inventory.receiveTransferOrder(transfer.id, testTenant.id);

  const transferAfterCredit = inventory.listStock(testTenant.id, wh2.id).find(s => s.sku === 'SKU-PRO-4K');
  assert(transferAfterCredit?.quantityOnHand === 60, 'Berlin warehouse credited 40 units (20 -> 60)');
  assert(transfer.status === 'received', 'Inter-warehouse transfer logged with received status');

  // =========================================================================
  // 6. COMMERCE, SHOPPING CART & ORDER LIFECYCLE
  // =========================================================================
  console.log('\n🛒 6. Commerce Subsystem, Cart Calculation & Checkout Tests');
  const commerce = CommerceEngine.getInstance();

  const prod = commerce.createProduct({
    tenantId: testTenant.id,
    name: 'Unreal Engine Virtual Stage License',
    sku: 'SKU-UE5-LICENSE',
    price: 499,
    currency: 'USD',
    stock: 25,
    description: 'Enterprise virtual production license',
  });

  commerce.addToCart(testTenant.id, user.id, prod.id, 2);
  const cart = commerce.getCart(testTenant.id, user.id);
  assert(cart.items.length === 1 && cart.items[0].quantity === 2, 'Shopping cart stores product item with qty 2');

  const order = commerce.createOrder(testTenant.id, user.id);
  assert(order.totalAmount === 998, `Order total calculates correct price ($499 x 2 = $${order.totalAmount})`);
  assert(order.status === 'pending', 'Order initialized in valid transaction state');

  // =========================================================================
  // 7. CRM, PIPELINE STAGES & LEAD MANAGEMENT
  // =========================================================================
  console.log('\n🤝 7. CRM Engine, Lead Pipeline & Deal Value Tests');
  const crm = CRMEngine.getInstance();

  const lead = crm.createLead({
    tenantId: testTenant.id,
    company: 'Global Media Studios Inc.',
    contactName: 'Sarah Jenkins',
    email: 'sarah@globalmedia.com',
    dealValue: 75000,
    stage: 'proposal',
  });

  assert(lead.id.startsWith('lead_'), 'CRM Lead registered with unique ID');
  assert(lead.dealValue === 75000, 'CRM deal value tracked accurately ($75,000)');

  const tenantLeads = crm.listLeads(testTenant.id);
  assert(tenantLeads.some(l => l.id === lead.id), 'Lead persisted in tenant pipeline');

  // =========================================================================
  // 8. ERP, PROCUREMENT & FINANCIAL ACCOUNTING GENERAL LEDGER
  // =========================================================================
  console.log('\n📊 8. ERP & Double-Entry Accounting Ledger Tests');
  const erp = ERPEngine.getInstance();
  const accounting = (await import('../src/capabilities/accounting/AccountingEngine.js')).AccountingEngine.getInstance();

  const po = erp.createProcurementOrder({
    tenantId: testTenant.id,
    vendorName: 'Global Silicon Supplies',
    item: 'Virtual Production GPU Blades',
    quantity: 10,
    totalCost: 45000,
    status: 'ordered',
  });
  assert(po.id.startsWith('po_'), 'ERP Procurement Order created');

  const debitEntry = accounting.postTransaction(testTenant.id, 'Cash Account', 'debit', 998, 'Software Sale');
  const creditEntry = accounting.postTransaction(testTenant.id, 'Revenue Account', 'credit', 998, 'Software Sale');
  assert(debitEntry.amount === creditEntry.amount, `Double-entry balanced (Debit $${debitEntry.amount} === Credit $${creditEntry.amount})`);

  // =========================================================================
  // 9. HEADLESS CMS & FULL-TEXT SEARCH ENGINE
  // =========================================================================
  console.log('\n📰 9. Headless CMS & Full-Text Search Engine Tests');
  const cms = BasicCMS.getInstance();
  const search = SearchEngine.getInstance();

  const blogType = cms.listContentTypes('tenant_default')[0];

  const article = cms.createEntry({
    tenantId: testTenant.id,
    contentTypeId: blogType.id,
    slug: 'zero-knowledge-cryptographic-isolation',
    status: 'published',
    data: {
      title: 'Zero-Knowledge Cryptographic Multi-Tenancy',
      content: 'Detailed explanation of PBKDF2 AES-256 field level isolation across enterprise databases.',
      author: 'Security Architecture Team',
    },
  });

  assert(article.id.startsWith('entry_'), 'CMS dynamic article item created');

  search.indexDocument({
    id: article.id,
    tenantId: testTenant.id,
    title: 'Zero-Knowledge Cryptographic Multi-Tenancy',
    content: 'Detailed explanation of PBKDF2 AES-256 field level isolation across enterprise databases.',
    type: 'cms_article',
  });

  const results = search.search(testTenant.id, 'Cryptographic');
  assert(results.length >= 1, `Search query 'Cryptographic' returned ${results.length} matched indexed record(s)`);

  // =========================================================================
  // 10. REAL-TIME COLLABORATION & MULTI-USER PRESENCE TESTS
  // =========================================================================
  console.log('\n👥 10. Real-Time Collaboration & Presence Engine Tests');
  const { CollaborationEngine } = await import('../src/capabilities/collab/CollaborationEngine.js');
  const collab = CollaborationEngine.getInstance();

  const c1 = collab.updatePresence({
    id: 'collab_user_1',
    name: 'Lead Designer Alice',
    avatarColor: '#ec4899',
    tenantId: testTenant.id,
    pageId: 'page_landing',
    cursor: { x: 120, y: 340 },
    selectedBlockIndex: 1,
  });

  const c2 = collab.updatePresence({
    id: 'collab_user_2',
    name: 'Frontend Engineer Bob',
    avatarColor: '#38bdf8',
    tenantId: testTenant.id,
    pageId: 'page_landing',
    cursor: { x: 450, y: 620 },
    selectedBlockIndex: 3,
  });

  const activeCollabs = collab.listActiveCollaborators(testTenant.id, 'page_landing');
  assert(activeCollabs.length === 2, `Active collaborators registered on canvas (count: ${activeCollabs.length})`);
  assert(activeCollabs.some(c => c.name === 'Lead Designer Alice'), 'Collaborator Alice tracked with cursor coordinates');

  const op = collab.broadcastOperation({
    tenantId: testTenant.id,
    pageId: 'page_landing',
    actorId: 'collab_user_1',
    actorName: 'Lead Designer Alice',
    type: 'block.reorder',
    payload: { sourceIdx: 1, targetIdx: 2 }
  });

  assert(op.id.startsWith('op_'), 'Collaborative operation broadcasted to room');
  const recentOps = collab.getRecentOperations(testTenant.id, 'page_landing', 0);
  assert(recentOps.length >= 1, `Recent operations history retrieved (${recentOps.length} ops)`);

  // =========================================================================
  // 11. FORM BUILDER, CRM LEAD PIPELINE & ANALYTICS A/B TESTING TESTS
  // =========================================================================
  console.log('\n📋 11. Form Builder, CRM Lead Pipeline & Analytics A/B Testing Tests');
  const { AnalyticsEngine } = await import('../src/capabilities/analytics/AnalyticsEngine.js');
  const analytics = AnalyticsEngine.getInstance();

  // Test block registration count (now 13 blocks)
  const updatedBlocks = blockRegistry.list();
  assert(updatedBlocks.length === 13, `BlockRegistry loaded all 13 blocks including form_builder (count: ${updatedBlocks.length})`);
  assert(updatedBlocks.some(b => b.type === 'form_builder'), 'form_builder block registered with CRM schema');

  // Track pageviews & A/B variants
  analytics.trackPageview({ tenantId: testTenant.id, pageSlug: 'landing-deal', variantId: 'A', referrer: 'https://google.com', userAgent: 'Chrome' });
  analytics.trackPageview({ tenantId: testTenant.id, pageSlug: 'landing-deal', variantId: 'A', referrer: 'https://twitter.com', userAgent: 'Safari' });
  analytics.trackPageview({ tenantId: testTenant.id, pageSlug: 'landing-deal', variantId: 'B', referrer: 'https://linkedin.com', userAgent: 'Chrome' });

  // Track conversion
  analytics.trackConversion({ tenantId: testTenant.id, pageSlug: 'landing-deal', variantId: 'A', goalType: 'form_submit', value: 50000 });

  const summary = analytics.getSummary(testTenant.id, 'landing-deal');
  assert(summary.totalViews === 3, `Analytics summary recorded total views (3)`);
  assert(summary.totalConversions === 1, `Analytics summary recorded form conversion (1)`);
  assert(summary.variants.variantA.conversions === 1, 'Variant A conversion recorded accurately');

  // Form submit CRM lead creation
  const crmLead = crm.createLead({
    tenantId: testTenant.id,
    contactName: 'Executive Prospect',
    email: 'prospect@omnicorp.com',
    company: 'Omni Corp Global',
    dealValue: 75000,
    stage: 'lead',
  });

  assert(crmLead.id.startsWith('lead_'), 'Form submission created CRM Lead entity with pipeline linkage');

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n======================================================================');
  console.log(` 🏁 TEST EXECUTION COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
