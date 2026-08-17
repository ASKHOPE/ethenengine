import { Hono } from 'hono';
import { CRMEngine } from '../capabilities/crm/CRMEngine.js';
import { ERPEngine } from '../capabilities/erp/ERPEngine.js';
import { AccountingEngine } from '../capabilities/accounting/AccountingEngine.js';
import { HREngine } from '../capabilities/hr/HREngine.js';
import { CommunicationEngine } from '../capabilities/communication/CommunicationEngine.js';
import { MarketplaceEngine } from '../capabilities/marketplace/MarketplaceEngine.js';
import { SupportAccessEngine } from '../core/SupportAccessEngine.js';
import { IdentityEngine } from '../core/IdentityEngine.js';
import { MediaEngine } from '../core/MediaEngine.js';
import { CollaborationEngine } from '../capabilities/collab/CollaborationEngine.js';
import { AnalyticsEngine } from '../capabilities/analytics/AnalyticsEngine.js';
import { SearchEngine } from '../core/SearchEngine.js';
import { EventBus } from '../foundation/EventBus.js';

const crm = CRMEngine.getInstance();
const erp = ERPEngine.getInstance();
const accounting = AccountingEngine.getInstance();
const hr = HREngine.getInstance();
const comms = CommunicationEngine.getInstance();
const marketplace = MarketplaceEngine.getInstance();
const supportEngine = SupportAccessEngine.getInstance();
const identityEngine = IdentityEngine.getInstance();
const mediaEngine = MediaEngine.getInstance();
const collabEngine = CollaborationEngine.getInstance();
const analyticsEngine = AnalyticsEngine.getInstance();
const searchEngine = SearchEngine.getInstance();
const eventBus = EventBus.getInstance();

// ============================================================
// CRM Router
// ============================================================
export const crmRouter = new Hono();
crmRouter.get('/leads', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ leads: crm.listLeads(tenant.id) });
});

crmRouter.post('/leads', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const lead = crm.createLead({
    tenantId: tenant.id,
    contactName: body.contactName,
    email: body.email,
    company: body.company || '',
    dealValue: Number(body.dealValue || 0),
    stage: body.stage || 'lead',
  });
  return c.json({ lead }, 201);
});

// ============================================================
// ERP Router
// ============================================================
export const erpRouter = new Hono();
erpRouter.get('/orders', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ procurementOrders: erp.listProcurementOrders(tenant.id) });
});

erpRouter.post('/orders', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const order = erp.createProcurementOrder({
    tenantId: tenant.id,
    vendorName: body.vendorName,
    item: body.item,
    quantity: Number(body.quantity || 1),
    totalCost: Number(body.totalCost || 0),
    status: body.status || 'ordered',
  });
  return c.json({ order }, 201);
});

// ============================================================
// Accounting Router
// ============================================================
export const accountingRouter = new Hono();
accountingRouter.get('/ledger', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ ledger: accounting.getLedger(tenant.id) });
});

accountingRouter.get('/balance-sheet', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json(accounting.getBalanceSheet(tenant.id));
});

accountingRouter.post('/transactions', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const tx = accounting.postTransaction(
    tenant.id,
    body.accountName,
    body.type,
    Number(body.amount || 0),
    body.description || ''
  );
  return c.json({ transaction: tx }, 201);
});

// ============================================================
// HR Router
// ============================================================
export const hrRouter = new Hono();
hrRouter.get('/employees', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ employees: hr.listEmployees(tenant.id) });
});

hrRouter.post('/employees', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const emp = hr.addEmployee({
    tenantId: tenant.id,
    name: body.name,
    email: body.email,
    department: body.department || 'General',
    position: body.position || 'Staff',
    salaryMonthly: Number(body.salaryMonthly || 0),
    status: body.status || 'active',
  });
  return c.json({ employee: emp }, 201);
});

// ============================================================
// Comms & Marketplace Router
// ============================================================
export const commsRouter = new Hono();
commsRouter.get('/messages', (c) => {
  const channelId = c.req.query('channelId') || 'chan_general';
  return c.json({ messages: comms.getMessages(channelId) });
});

commsRouter.post('/messages', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const msg = comms.sendMessage(
    body.channelId || 'chan_general',
    tenant.id,
    body.senderId || 'usr_admin',
    body.senderName || 'Admin',
    body.content
  );
  return c.json({ message: msg }, 201);
});

commsRouter.post('/send-email', async (c) => {
  const body = await c.req.json();
  const { to, subject, content } = body;
  const result = await comms.sendEmailViaPostfix(to || 'admin@lioramedia.com', subject || 'Test Email', content || 'Email dispatched from Postfix Engine');
  return c.json(result);
});

export const marketplaceRouter = new Hono();
marketplaceRouter.get('/listings', (c) => {
  return c.json({ listings: marketplace.listListings() });
});

// ============================================================
// Support Delegation Router
// ============================================================
export const supportRouter = new Hono();
supportRouter.get('/grants', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const userContext = c.get('userContext' as any) as any;
  if (userContext?.user?.type === 'PLATFORM_USER') {
    return c.json({ grants: supportEngine.listAllGrants() });
  }
  return c.json({ grants: supportEngine.listGrantsForTenant(tenant.id) });
});

supportRouter.post('/grant', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const userContext = c.get('userContext' as any) as any;
  const body = await c.req.json();
  const grant = supportEngine.grantSupportAccess({
    ticketId: body.ticketId || `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: tenant.id,
    grantedByUserId: userContext?.user?.userId || 'usr_tenant_admin',
    grantedToUserId: body.grantedToUserId || 'usr_platform_admin',
    reason: body.reason || 'Technical Assistance & Diagnostic Support',
    durationMinutes: Number(body.durationMinutes || 120),
  });
  return c.json({ message: 'Support access granted successfully', grant }, 201);
});

supportRouter.post('/revoke', async (c) => {
  const userContext = c.get('userContext' as any) as any;
  const body = await c.req.json();
  const success = supportEngine.revokeSupportAccess(body.grantId, userContext?.user?.userId || 'usr_tenant_admin');
  return c.json({ success, message: 'Support access revoked' });
});

// ============================================================
// Media & Collaboration Routers
// ============================================================
export const mediaRouter = new Hono();
mediaRouter.get('/assets', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ assets: mediaEngine.listAssets(tenant.id) });
});

mediaRouter.post('/upload', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const filename = body.filename || `asset_${Date.now()}.png`;
  const mimeType = body.mimeType || 'image/png';
  const data = body.data || 'data:image/png;base64,mock';
  const asset = await mediaEngine.uploadAsset(tenant.id, filename, mimeType, data);
  return c.json({ asset, message: 'Asset uploaded successfully' }, 201);
});

export const collabRouter = new Hono();
collabRouter.post('/heartbeat', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  
  const updated = collabEngine.updatePresence({
    id: body.id || `collab_${Date.now()}`,
    name: body.name || 'Anonymous Designer',
    avatarColor: body.avatarColor || '#6366f1',
    tenantId: tenant.id,
    pageId: body.pageId || 'home',
    cursor: body.cursor || { x: 0, y: 0 },
    selectedBlockIndex: typeof body.selectedBlockIndex === 'number' ? body.selectedBlockIndex : null,
  });

  const activeCollaborators = collabEngine.listActiveCollaborators(tenant.id, body.pageId || 'home');
  const operations = collabEngine.getRecentOperations(tenant.id, body.pageId || 'home', Number(body.sinceTimestamp || 0));

  return c.json({
    self: updated,
    collaborators: activeCollaborators,
    operations,
  });
});

collabRouter.post('/operation', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();

  const operation = collabEngine.broadcastOperation({
    tenantId: tenant.id,
    pageId: body.pageId || 'home',
    actorId: body.actorId,
    actorName: body.actorName || 'Teammate',
    type: body.type,
    payload: body.payload,
  });

  return c.json({ operation }, 201);
});

// ============================================================
// Analytics & Form Routers
// ============================================================
export const analyticsRouter = new Hono();
analyticsRouter.post('/pageview', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const pageview = analyticsEngine.trackPageview({
    tenantId: tenant.id,
    pageSlug: body.pageSlug || 'home',
    variantId: body.variantId || 'A',
    referrer: body.referrer || '',
    userAgent: c.req.header('user-agent') || '',
  });
  return c.json({ pageview }, 201);
});

analyticsRouter.post('/conversion', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const conv = analyticsEngine.trackConversion({
    tenantId: tenant.id,
    pageSlug: body.pageSlug || 'home',
    variantId: body.variantId || 'A',
    goalType: body.goalType || 'cta_click',
    value: Number(body.value || 0),
  });
  return c.json({ conversion: conv }, 201);
});

analyticsRouter.get('/summary', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const pageSlug = c.req.query('pageSlug');
  return c.json(analyticsEngine.getSummary(tenant.id, pageSlug));
});

export const formsRouter = new Hono();
formsRouter.post('/submit', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  
  const lead = crm.createLead({
    tenantId: tenant.id,
    contactName: body.contactName || 'Anonymous Prospect',
    email: body.email || 'prospect@enterprise.com',
    company: body.company || '',
    dealValue: Number(body.dealValue || 25000),
    stage: 'lead',
  });

  analyticsEngine.trackConversion({
    tenantId: tenant.id,
    pageSlug: body.pageSlug || 'home',
    variantId: body.variantId || 'A',
    goalType: 'form_submit',
    value: Number(body.dealValue || 25000),
  });

  eventBus.publish('form.lead.submitted', { lead, notes: body.notes }, { tenantId: tenant.id });
  return c.json({ lead, message: 'Inquiry submitted and CRM lead pipeline updated successfully!' }, 201);
});

// ============================================================
// Search Router
// ============================================================
export const searchRouter = new Hono();
searchRouter.get('/', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const q = c.req.query('q') || '';
  const results = searchEngine.search(tenant.id, q);
  return c.json({ query: q, results, count: results.length });
});
