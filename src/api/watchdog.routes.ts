import { Hono } from 'hono';
import { WatchdogEngine } from '../foundation/WatchdogEngine.js';
import { DisasterRecoveryEngine } from '../foundation/DisasterRecoveryEngine.js';
import { DataRecoveryEngine } from '../foundation/DataRecoveryEngine.js';
import { LoadGovernor } from '../foundation/LoadGovernor.js';

export const watchdogRouter = new Hono();

const watchdog = WatchdogEngine.getInstance();
const dr = DisasterRecoveryEngine.getInstance();
const dataRecovery = DataRecoveryEngine.getInstance();
const loadGovernor = LoadGovernor.getInstance();

// ============================================================
// 1. Health, Metrics & Incident Feed
// ============================================================
watchdogRouter.get('/health', (c) => {
  const health = watchdog.getHealthStatus();
  const metrics = watchdog.getMetrics();
  const circuitBreakers = watchdog.getCircuitBreakers();
  const drStatus = {
    isFailoverActive: dr.isFailoverActive(),
    failoverReason: dr.getFailoverReason(),
    serviceProbes: dr.listServiceHealth(),
  };

  return c.json({
    health,
    metrics,
    circuitBreakers,
    disasterRecovery: drStatus,
  });
});

watchdogRouter.get('/incidents', (c) => {
  const limit = Number(c.req.query('limit') || 50);
  return c.json({ incidents: watchdog.listIncidents(limit) });
});

watchdogRouter.get('/metrics', (c) => {
  return c.json(watchdog.getMetrics());
});

watchdogRouter.post('/heal', (c) => {
  const result = watchdog.executeAutoHealing();
  return c.json({
    message: 'Auto-healing sequence executed successfully',
    ...result,
  });
});

// ============================================================
// 2. Disaster Recovery & Outage Failover
// ============================================================
watchdogRouter.get('/dr/status', (c) => {
  return c.json({
    isFailoverActive: dr.isFailoverActive(),
    failoverReason: dr.getFailoverReason(),
    serviceProbes: dr.listServiceHealth(),
  });
});

watchdogRouter.post('/dr/failover', async (c) => {
  const body = await c.req.json();
  const { activate, reason } = body;
  if (activate) {
    dr.triggerFailover(reason || 'Manual disaster recovery failover initiated by administrator');
  } else {
    dr.resolveFailover();
  }
  return c.json({
    message: activate ? 'Failover mode activated' : 'Failover mode resolved to normal operations',
    isFailoverActive: dr.isFailoverActive(),
  });
});

// ============================================================
// 3. Point-in-Time Data Recovery & Snapshots
// ============================================================
watchdogRouter.get('/dr/snapshots', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ snapshots: dataRecovery.listSnapshots(tenant?.id) });
});

watchdogRouter.post('/dr/snapshot', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json().catch(() => ({}));
  const snapshot = dataRecovery.createSnapshot(
    tenant?.id || 'tenant_default',
    body.label || 'Manual On-Demand Recovery Snapshot'
  );
  return c.json({ message: 'Point-in-time snapshot created successfully', snapshot }, 201);
});

watchdogRouter.post('/dr/restore', async (c) => {
  const body = await c.req.json();
  const { snapshotId } = body;
  if (!snapshotId) {
    return c.json({ error: 'Missing snapshotId parameter' }, 400);
  }
  try {
    const result = dataRecovery.restoreSnapshot(snapshotId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message || 'Restoration failed' }, 500);
  }
});

// ============================================================
// 4. Adaptive Load Governor
// ============================================================
watchdogRouter.get('/load/status', (c) => {
  return c.json(loadGovernor.getStats());
});

// Safe test anomaly simulator endpoint
watchdogRouter.post('/simulate-anomaly', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { type, subsystem, message } = body;

  const incident = watchdog.recordIncident({
    severity: 'high',
    type: type || 'unhandled_exception',
    subsystem: subsystem || 'commerce',
    message: message || 'Simulated runtime anomaly for Watchdog verification',
    stack: new Error().stack,
  });

  return c.json({ message: 'Simulated anomaly recorded', incident });
});
