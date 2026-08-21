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

coreRouter.put('/tenants/:id/services', async (c) => {
  const tenantId = c.req.param('id');
  const body = await c.req.json();
  const { enabledServices } = body;
  const userContext = c.get('userContext' as any) as any;
  const actorId = userContext?.user?.userId || 'usr_superadmin';
  
  const updatedTenant = core.updateTenantServices(tenantId, enabledServices || [], actorId);
  if (!updatedTenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }
  return c.json({ tenant: updatedTenant, message: 'Tenant active services configured successfully' });
});
