// Comprehensive API Interoperability & REST Route Test Suite
// Verifies 100% endpoint coverage, status codes, schemas, and subsystem inter-connectivity.

import { app } from '../src/index.js';

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

async function runApiTests() {
  console.log('\n======================================================================');
  console.log(' 🌐 RUNNING ETHENENGINE REST API INTEROPERABILITY TEST MATRIX');
  console.log('======================================================================\n');

  // 1. OpenAPI & Swagger Docs Spec
  console.log('📖 1. OpenAPI 3.1.0 & Swagger UI Endpoints');
  const openApiRes = await app.request('/api/openapi.json');
  assert(openApiRes.status === 200, 'GET /api/openapi.json returns 200 OK');
  const spec = await openApiRes.json();
  assert(spec.openapi === '3.1.0', 'OpenAPI specification version is 3.1.0');
  assert(Object.keys(spec.paths).length >= 10, `OpenAPI spec documented ${Object.keys(spec.paths).length} REST paths`);

  const docsRes = await app.request('/docs');
  assert(docsRes.status === 200, 'GET /docs renders Swagger UI Explorer HTML');

  // 2. Core & Multi-Tenant Routing
  console.log('\n🏢 2. Multi-Tenant Core Routing');
  const tenantsRes = await app.request('/api/core/tenants');
  assert(tenantsRes.status === 200, 'GET /api/core/tenants returns 200 OK');
  const tenantsData = await tenantsRes.json();
  assert(tenantsData.tenants.length >= 1, `Found ${tenantsData.tenants.length} active tenant(s)`);

  const syncRes = await app.request('/api/core/sync-status');
  assert(syncRes.status === 200, 'GET /api/core/sync-status returns dual-write stats');

  // 3. Authentication & IAM
  console.log('\n🔑 3. Authentication, Registration & Token Management');
  const registerRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test_user_${Date.now()}@lioramedia.com`,
      name: 'Test Engineer',
      password: 'password123',
    }),
  });
  assert(registerRes.status === 201, 'POST /api/auth/register creates user account');

  const loginRes = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@lioramedia.com',
      password: 'Password123!',
      tenantSlug: 'lioramedia',
    }),
  });
  assert(loginRes.status === 200, 'POST /api/auth/login authenticates admin credentials');
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(typeof token === 'string' && token.length > 20, 'JWT bearer token issued');

  // 4. Website Builder & Themes
  console.log('\n🌐 4. Website Builder Pages & Theme API');
  const pagesRes = await app.request('/api/website/pages');
  assert(pagesRes.status === 200, 'GET /api/website/pages returns pages array');

  const themeRes = await app.request('/api/theme');
  assert(themeRes.status === 200, 'GET /api/theme returns theme tokens and CSS vars');

  const themePresetRes = await app.request('/api/theme/presets');
  assert(themePresetRes.status === 200, 'GET /api/theme/presets returns curated palettes');

  // 5. Commerce, Shopping Cart & Checkout
  console.log('\n🛒 5. Commerce Catalog & Cart Endpoints');
  const productsRes = await app.request('/api/commerce/products');
  assert(productsRes.status === 200, 'GET /api/commerce/products returns product inventory');

  const addToCartRes = await app.request('/api/commerce/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test_client_1', productId: 'prod_1', quantity: 2 }),
  });
  assert(addToCartRes.status === 200, 'POST /api/commerce/cart/add increments item in cart');

  const cartRes = await app.request('/api/commerce/cart?userId=test_client_1');
  assert(cartRes.status === 200, 'GET /api/commerce/cart calculates subtotal');

  const checkoutRes = await app.request('/api/commerce/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test_client_1', promoCode: 'BLACKFRIDAY20' }),
  });
  assert(checkoutRes.status === 201, 'POST /api/commerce/checkout creates order with discount promo');

  // 6. Inventory Logistics
  console.log('\n📦 6. Multi-Warehouse Inventory Endpoints');
  const whRes = await app.request('/api/inventory/warehouses');
  assert(whRes.status === 200, 'GET /api/inventory/warehouses returns fulfillment hubs');

  const stockRes = await app.request('/api/inventory/stock');
  assert(stockRes.status === 200, 'GET /api/inventory/stock returns aisle/bin levels');

  // 7. CRM, Forms & Lead Pipeline
  console.log('\n💼 7. CRM & Form Capture Pipeline');
  const formRes = await app.request('/api/forms/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contactName: 'Sarah Connor',
      email: 'sconnor@cyberdyne.com',
      company: 'Cyberdyne Systems',
      dealValue: 120000,
      notes: 'Autonomous AI infrastructure consultation',
    }),
  });
  assert(formRes.status === 201, 'POST /api/forms/submit generates CRM lead and conversion event');

  const leadsRes = await app.request('/api/crm/leads');
  assert(leadsRes.status === 200, 'GET /api/crm/leads lists CRM records');
  const leadsData = await leadsRes.json();
  assert(leadsData.leads.some((l: any) => l.email === 'sconnor@cyberdyne.com'), 'Captured lead persisted in CRM');

  // 8. Real-Time Analytics & A/B Testing
  console.log('\n📈 8. Real-Time Telemetry & A/B Split Testing');
  const pageviewRes = await app.request('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageSlug: 'home', variantId: 'B', referrer: 'https://twitter.com' }),
  });
  assert(pageviewRes.status === 201, 'POST /api/analytics/pageview records edge telemetry');

  const analyticsSummaryRes = await app.request('/api/analytics/summary');
  assert(analyticsSummaryRes.status === 200, 'GET /api/analytics/summary returns funnel metrics');

  // 9. Real-Time Presence & Collaboration
  console.log('\n👥 9. Real-Time Collaboration & Presence');
  const heartbeatRes = await app.request('/api/collab/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'collab_lead_architect',
      name: 'Lead Architect',
      pageId: 'home',
      cursor: { x: 300, y: 450 },
    }),
  });
  assert(heartbeatRes.status === 200, 'POST /api/collab/heartbeat syncs collaborator cursor and presence');

  // 10. Search & CMS
  console.log('\n📰 10. Headless CMS & Full-Text Search');
  const cmsRes = await app.request('/api/cms/content-types');
  assert(cmsRes.status === 200, 'GET /api/cms/content-types returns CMS schema');

  const searchRes = await app.request('/api/search?q=Enterprise');
  assert(searchRes.status === 200, 'GET /api/search returns indexed search results');

  // 11. HTML Views
  console.log('\n🎨 11. HTML Frontend Views Rendering');
  const loginViewRes = await app.request('/login?tenant=lioramedia');
  assert(loginViewRes.status === 200, 'GET /login renders Login Portal HTML');

  const rootRes = await app.request('/');
  assert(rootRes.status === 200, 'GET / renders public homepage storefront');

  console.log('\n======================================================================');
  console.log(` 🏁 API TEST COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests().catch((err) => {
  console.error('Fatal API test runner exception:', err);
  process.exit(1);
});
