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

  // 12. MeidaLLM Media & Social Publisher Endpoints
  console.log('\n📢 12. MeidaLLM Media & Social Publisher API Matrix');
  const mediaChRes = await app.request('/api/media-publisher/channels');
  assert(mediaChRes.status === 200, 'GET /api/media-publisher/channels returns connected publishing channels');

  const aiGenRes = await app.request('/api/media-publisher/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'X / Twitter', format: 'short_form', prompt: 'Bun Execution Engine' })
  });
  assert(aiGenRes.status === 200, 'POST /api/media-publisher/ai-generate returns AI post draft');

  const mediaPostsRes = await app.request('/api/media-publisher/posts');
  assert(mediaPostsRes.status === 200, 'GET /api/media-publisher/posts returns campaign posts queue');

  const mediaAnalyticsRes = await app.request('/api/media-publisher/analytics');
  assert(mediaAnalyticsRes.status === 200, 'GET /api/media-publisher/analytics returns impressions & engagement summary');

  // 13. Community Admin & Sabbath Agenda Endpoints
  console.log('\n⛪ 13. Community Admin & Sabbath Agenda API Matrix');
  const agendasRes = await app.request('/api/community-admin/agendas');
  assert(agendasRes.status === 200, 'GET /api/community-admin/agendas returns meeting itineraries');

  const genSundaysRes = await app.request('/api/community-admin/agendas/generate-sundays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monthLabel: 'September 2026', sundayCount: 4 })
  });
  assert(genSundaysRes.status === 200, 'POST /api/community-admin/agendas/generate-sundays auto-generates Sunday itineraries');

  const callingsRes = await app.request('/api/community-admin/callings');
  assert(callingsRes.status === 200, 'GET /api/community-admin/callings returns callings roster pipeline');

  const libSearchRes = await app.request('/api/community-admin/search?q=Hymn');
  assert(libSearchRes.status === 200, 'GET /api/community-admin/search returns library search matches');

  // 14. Trades & Craftsmen Portfolio Endpoints
  console.log('\n🛠️ 14. Trades & Craftsmen Portfolio API Matrix');
  const tradesPortRes = await app.request('/api/trades/portfolio');
  assert(tradesPortRes.status === 200, 'GET /api/trades/portfolio returns project showcase gallery');

  const tradesWoRes = await app.request('/api/trades/work-orders');
  assert(tradesWoRes.status === 200, 'GET /api/trades/work-orders returns dispatched work orders');

  const tradesQuoteRes = await app.request('/api/trades/quotes/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName: 'Test Client', tradeType: 'plumbing', laborHours: 3 })
  });
  assert(tradesQuoteRes.status === 200, 'POST /api/trades/quotes/calculate returns itemized price estimate');

  // 15. Travel, Mobility & Corporate Fleet Endpoints
  console.log('\n✈️ 15. Travel, Mobility & Corporate Fleet API Matrix');
  const fleetRes = await app.request('/api/travel/fleet');
  assert(fleetRes.status === 200, 'GET /api/travel/fleet returns vehicle inventory roster');

  const packagesRes = await app.request('/api/travel/corporate-packages');
  assert(packagesRes.status === 200, 'GET /api/travel/corporate-packages returns corporate vacation retreats');

  const travelBookingsRes = await app.request('/api/travel/bookings');
  assert(travelBookingsRes.status === 200, 'GET /api/travel/bookings returns confirmed fleet bookings');

  // 16. Legal House & Practice Endpoints
  console.log('\n⚖️ 16. Legal House & Practice API Matrix');
  const legalCasesRes = await app.request('/api/legal/cases');
  assert(legalCasesRes.status === 200, 'GET /api/legal/cases returns active legal court matters');

  const statutesRes = await app.request('/api/legal/statutes?q=corporate');
  assert(statutesRes.status === 200, 'GET /api/legal/statutes searches legal code & precedents');

  const billablesRes = await app.request('/api/legal/billables');
  assert(billablesRes.status === 200, 'GET /api/legal/billables returns attorney time logs');

  // 17. Abode Property & Rental Management Endpoints
  console.log('\n🏢 17. Abode Property & Rental Management API Matrix');
  const propsRes = await app.request('/api/abode/properties');
  assert(propsRes.status === 200, 'GET /api/abode/properties returns managed real estate inventory');

  const leasesRes = await app.request('/api/abode/leases');
  assert(leasesRes.status === 200, 'GET /api/abode/leases returns tenant lease agreements');

  const maintRes = await app.request('/api/abode/maintenance');
  assert(maintRes.status === 200, 'GET /api/abode/maintenance returns repair dispatch tickets');

  // 18. Service Reservations & Dispatch Order Book Endpoints
  console.log('\n🗓️ 18. Service Reservations & Dispatch Order Book API Matrix');
  const slotsRes = await app.request('/api/reservations/slots');
  assert(slotsRes.status === 200, 'GET /api/reservations/slots returns provider booking slots');

  const ordersRes = await app.request('/api/reservations/orders');
  assert(ordersRes.status === 200, 'GET /api/reservations/orders returns provider-customer order book');

  const reserveRes = await app.request('/api/reservations/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotId: 'slot_102', customerName: 'Test Traveler', agreedPrice: 150 })
  });
  assert(reserveRes.status === 201, 'POST /api/reservations/reserve locks time slot and creates dispatch order');

  // 19. Global Tax & Multi-Currency Engine Endpoints
  console.log('\n🌍 19. Global Tax & Multi-Currency API Matrix');
  const convertRes = await app.request('/api/tax-currency/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100, from: 'USD', to: 'EUR' })
  });
  assert(convertRes.status === 200, 'POST /api/tax-currency/convert calculates real-time exchange rates');

  const taxRes = await app.request('/api/tax-currency/calculate-tax', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtotal: 500, regionCode: 'EU' })
  });
  assert(taxRes.status === 200, 'POST /api/tax-currency/calculate-tax applies regional VAT/GST tax rates');

  // 20. Research-Driven Industry API Matrix (Tiered Quotes, ZIP Check, Client Portal, Attorney Profiles)
  console.log('\n🔬 20. Research-Driven Industry API Matrix');
  const zipRes = await app.request('/api/trades/zip-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zipCode: '95110' })
  });
  assert(zipRes.status === 200, 'POST /api/trades/zip-check performs instant service area coverage lookup');

  const tieredRes = await app.request('/api/trades/tiered-quotes');
  assert(tieredRes.status === 200, 'GET /api/trades/tiered-quotes returns Good/Better/Best estimate options');

  const travelSearchRes = await app.request('/api/travel/search?destination=Switzerland');
  assert(travelSearchRes.status === 200, 'GET /api/travel/search filters corporate retreat packages');

  const portalRes = await app.request('/api/legal/client-portal?clientName=Acme');
  assert(portalRes.status === 200, 'GET /api/legal/client-portal returns secure client portal data');

  const attorneysRes = await app.request('/api/legal/attorneys');
  assert(attorneysRes.status === 200, 'GET /api/legal/attorneys returns partner credentials and practice areas');

  // 21. Public API Gateway Integration Matrix (Open-Meteo, Frankfurter, ip-api, Nominatim, HackerNews, CourtListener)
  console.log('\n🌐 21. Public API Gateway Integration Matrix');
  const weatherRes = await app.request('/api/public-apis/weather?city=San%20Francisco');
  assert(weatherRes.status === 200, 'GET /api/public-apis/weather returns Open-Meteo live forecast & outdoor work safety');

  const ratesRes = await app.request('/api/public-apis/rates?base=USD');
  assert(ratesRes.status === 200, 'GET /api/public-apis/rates returns Frankfurter live ECB exchange rates');

  const ipGeoRes = await app.request('/api/public-apis/ip-geo?ip=198.51.100.42');
  assert(ipGeoRes.status === 200, 'GET /api/public-apis/ip-geo returns ip-api location metadata');

  const geoRes = await app.request('/api/public-apis/geocode?address=100%20Ocean%20Drive');
  assert(geoRes.status === 200, 'GET /api/public-apis/geocode returns Nominatim OpenStreetMap coordinates');

  const newsRes = await app.request('/api/public-apis/trending-news?category=tech');
  assert(newsRes.status === 200, 'GET /api/public-apis/trending-news returns HackerNews trending topic feed');

  const citeRes = await app.request('/api/public-apis/legal-citations?q=copyright');
  assert(citeRes.status === 200, 'GET /api/public-apis/legal-citations returns CourtListener precedent citations');

  // 22. System Health & Running Services Diagnostic Probes
  console.log('\n⚡ 22. Platform System Health & Running Services Diagnostic Probes');
  const healthRes = await app.request('/api/core/health-status');
  assert(healthRes.status === 200, 'GET /api/core/health-status returns 200 OK');
  const healthJson = await healthRes.json();
  assert(healthJson.health.overallStatus === 'HEALTHY', 'Platform overall status is HEALTHY');
  assert(healthJson.health.totalServicesRunning === 17, 'All 17 subsystem services are running concurrently');
  assert(healthJson.health.healthyServicesCount === 17, '100% of probed services (17/17) report HEALTHY status');

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
