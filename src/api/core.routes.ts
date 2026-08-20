import { Hono } from 'hono';
import { CorePlatformManager } from '../core/CorePlatformManager.js';
import { CapabilityRegistry, FutureCapabilitiesMap } from '../capability-sdk/CapabilityRegistry.js';
import { AuditLogger } from '../foundation/AuditLogger.js';
import { EventBus } from '../foundation/EventBus.js';
import { SyncEngine } from '../foundation/SyncEngine.js';

export const coreRouter = new Hono<{ Variables: Record<string, any> }>();
const core = CorePlatformManager.getInstance();
const capabilityRegistry = CapabilityRegistry.getInstance();
const auditLogger = AuditLogger.getInstance();
const eventBus = EventBus.getInstance();
const syncEngine = SyncEngine.getInstance();

coreRouter.get('/tenants', (c) => {
  return c.json({ tenants: core.listTenants() });
});

coreRouter.post('/tenants', async (c) => {
  const body = await c.req.json();
  const { name, slug, domain } = body;
  const tenant = core.createTenant('org_default', name, slug, domain, 'usr_admin');
  return c.json({ tenant }, 201);
});

coreRouter.get('/capabilities', (c) => {
  return c.json({
    activeCapabilities: capabilityRegistry.listCapabilities(),
    futureCapabilities: FutureCapabilitiesMap,
  });
});

coreRouter.get('/audit-trail', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ auditTrail: auditLogger.getAuditTrail(tenant.id) });
});

coreRouter.get('/events', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ events: eventBus.getEventHistory(tenant.id) });
});

coreRouter.get('/sync-status', (c) => {
  return c.json({
    status: 'ok',
    syncEngine: {
      ...syncEngine.getStats(),
      description: 'Dual-write engine: writes concurrently to local PostgreSQL and Aiven Cloud DB.',
    },
  });
});
