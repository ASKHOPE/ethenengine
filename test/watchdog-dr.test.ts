// Automated Test Suite: Sentinel Watchdog, Disaster Recovery, Data Snapshots & Load Shedding

import { app } from '../src/index.js';
import { WatchdogEngine } from '../src/foundation/WatchdogEngine.js';
import { DisasterRecoveryEngine } from '../src/foundation/DisasterRecoveryEngine.js';
import { DataRecoveryEngine } from '../src/foundation/DataRecoveryEngine.js';
import { LoadGovernor } from '../src/foundation/LoadGovernor.js';
import { WebsiteBuilder } from '../src/capabilities/website-builder/WebsiteBuilder.js';

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

async function runWatchdogDrTests() {
  console.log('\n======================================================================');
  console.log(' 🐕 RUNNING SENTINEL WATCHDOG & DISASTER RECOVERY TEST MATRIX');
  console.log('======================================================================\n');

  const watchdog = WatchdogEngine.getInstance();
  const dr = DisasterRecoveryEngine.getInstance();
  const dataRecovery = DataRecoveryEngine.getInstance();
  const loadGovernor = LoadGovernor.getInstance();

  // 1. Watchdog Anomaly & Error Incident Recording
  console.log('🔍 1. Watchdog Runtime Error & Anomaly Incident Capture');
  const testIncident = watchdog.recordIncident({
    severity: 'high',
    type: 'unhandled_exception',
    subsystem: 'commerce',
    message: 'Test simulated unhandled database timeout on order checkout',
    stack: 'Error: Database timeout at CheckoutService.process (line 42)',
  });
  assert(typeof testIncident.id === 'string' && testIncident.id.startsWith('inc_'), 'Incident recorded with unique ID');

  const incidents = watchdog.listIncidents(10);
  assert(incidents.length > 0 && incidents[0].subsystem === 'commerce', 'Incident retrieved in Watchdog feed');

  // 2. Subsystem Circuit Breakers
  console.log('\n⚡ 2. Subsystem Circuit Breakers & Trip State');
  for (let i = 0; i < 5; i++) {
    watchdog.recordSubsystemFailure('comms', 'SMTP Relay Gateway unreachable');
  }
  assert(watchdog.isCircuitOpen('comms') === true, 'Circuit Breaker for comms TRIPPED to OPEN after 5 failures');

  // 3. Auto-Healing Execution
  console.log('\n✨ 3. Auto-Healing & Circuit Breaker Recovery');
  const healResult = watchdog.executeAutoHealing();
  assert(healResult.restoredSubsystems.includes('comms'), 'Auto-healing reset tripped comms circuit breaker');
  assert(watchdog.isCircuitOpen('comms') === false, 'Circuit Breaker for comms restored to CLOSED');

  // 4. Disaster Recovery (DR) & Outage Failover
  console.log('\n🛡️ 4. Disaster Recovery & Outage Failover Probes');
  dr.updateServiceStatus('primary_database', false, 'Aiven Cloud connection drop');
  assert(dr.isFailoverActive() === true, 'Disaster Recovery automatic failover triggered on primary DB outage');
  assert(dr.getFailoverReason().includes('Primary database unavailable'), 'Failover reason recorded accurately');

  dr.updateServiceStatus('primary_database', true);
  assert(dr.isFailoverActive() === false, 'Disaster Recovery automatically resolved when primary DB resumed');

  // 5. Point-in-Time Data Recovery & Cryptographic Snapshots
  console.log('\n💾 5. Point-in-Time Data Recovery & HMAC Integrity Rollback');
  const { seedLioramediaTenant } = await import('../src/seed/seedLioramedia.js');
  await seedLioramediaTenant();

  const snapshot = dataRecovery.createSnapshot('tenant_lioramedia', 'Pre-Mutation Safe Snapshot');
  assert(typeof snapshot.checksum === 'string' && snapshot.checksum.length === 64, 'Snapshot generated with SHA-256 HMAC checksum');
  assert(snapshot.itemCounts.pages >= 1, `Snapshot stored ${snapshot.itemCounts.pages} page(s) and associated entities`);

  // Intentionally mutate state
  const websiteBuilder = WebsiteBuilder.getInstance();
  const originalPagesCount = websiteBuilder.listPages('tenant_lioramedia').length;
  const pagesMap = (websiteBuilder as any).pages as Map<string, any>;
  for (const [id, p] of Array.from(pagesMap.entries())) {
    if (p.tenantId === 'tenant_lioramedia') {
      pagesMap.delete(id);
    }
  }
  assert(websiteBuilder.listPages('tenant_lioramedia').length === 0, 'Simulated disastrous data loss / tenant pages wiped');

  // 1-Click Snapshot Restore
  const restoreResult = dataRecovery.restoreSnapshot(snapshot.id);
  assert(restoreResult.success === true, 'Point-in-time recovery executed successfully');
  assert(websiteBuilder.listPages('tenant_lioramedia').length === originalPagesCount, `All ${originalPagesCount} page(s) fully restored from cryptographic snapshot`);

  // 6. Adaptive Load Governor & Traffic Shedding
  console.log('\n🚦 6. Adaptive Load Governor & Request Prioritization');
  assert(loadGovernor.getRequestTier('/api/auth/login') === 1, 'Auth route classified as Tier 1 (Critical)');
  assert(loadGovernor.getRequestTier('/api/commerce/checkout') === 1, 'Checkout route classified as Tier 1 (Critical)');
  assert(loadGovernor.getRequestTier('/api/analytics/pageview') === 3, 'Analytics telemetry classified as Tier 3 (Non-Critical)');

  assert(loadGovernor.shouldShedRequest('/api/auth/login') === false, 'Tier 1 critical request NEVER shed under load');

  // 7. Watchdog & DR REST API Endpoints
  console.log('\n🌐 7. Watchdog & DR REST API Endpoints');
  const healthRes = await app.request('/api/watchdog/health');
  assert(healthRes.status === 200, 'GET /api/watchdog/health returns 200 OK');
  const healthData = await healthRes.json();
  assert(healthData.health.status !== undefined, 'Health check returned system status');

  const incidentsRes = await app.request('/api/watchdog/incidents');
  assert(incidentsRes.status === 200, 'GET /api/watchdog/incidents lists runtime incident log');

  const healRes = await app.request('/api/watchdog/heal', { method: 'POST' });
  assert(healRes.status === 200, 'POST /api/watchdog/heal triggers auto-heal routine');

  const snapshotRes = await app.request('/api/watchdog/dr/snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'API Triggered Snapshot' }),
  });
  assert(snapshotRes.status === 201, 'POST /api/watchdog/dr/snapshot creates on-demand snapshot');

  const loadStatusRes = await app.request('/api/watchdog/load/status');
  assert(loadStatusRes.status === 200, 'GET /api/watchdog/load/status returns concurrency stats');

  console.log('\n======================================================================');
  console.log(` 🏁 WATCHDOG & DR TEST COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWatchdogDrTests().catch((err) => {
  console.error('Fatal Watchdog & DR test error:', err);
  process.exit(1);
});
