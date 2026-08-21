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
import { MediaPublishingEngine } from '../capabilities/media-publishing/MediaPublishingEngine.js';
import { CommunityAdminEngine } from '../capabilities/community-admin/CommunityAdminEngine.js';
import { TradesCraftEngine } from '../capabilities/trades-craft/TradesCraftEngine.js';
import { TravelFleetEngine } from '../capabilities/travel-fleet/TravelFleetEngine.js';
import { LegalHouseEngine } from '../capabilities/legal-house/LegalHouseEngine.js';
import { AbodePropertyEngine } from '../capabilities/abode-property/AbodePropertyEngine.js';
import { ServiceReservationEngine } from '../capabilities/reservations/ServiceReservationEngine.js';
import { GlobalTaxCurrencyEngine } from '../capabilities/tax-currency/GlobalTaxCurrencyEngine.js';
import { PublicApiGatewayEngine } from '../capabilities/public-api/PublicApiGatewayEngine.js';
import { SystemHealthEngine } from '../capabilities/health/SystemHealthEngine.js';
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
const mediaPublisher = MediaPublishingEngine.getInstance();
const communityAdmin = CommunityAdminEngine.getInstance();
const tradesCraftEngine = new TradesCraftEngine();
const travelFleetEngine = new TravelFleetEngine();
const legalHouseEngine = new LegalHouseEngine();
const abodePropertyEngine = new AbodePropertyEngine();
const reservationEngine = new ServiceReservationEngine();
const taxCurrencyEngine = GlobalTaxCurrencyEngine.getInstance();
const publicApiEngine = PublicApiGatewayEngine.getInstance();
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

export interface FormSubmissionRecord {
  id: string;
  tenantId: string;
  targetTable: string;
  contactName: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  fields: Record<string, any>;
  createdAt: string;
}

export const formSubmissionsStore: FormSubmissionRecord[] = [
  {
    id: 'sub_seed_1',
    tenantId: 'tenant_lioramedia',
    targetTable: 'crm_leads',
    contactName: 'Alexander Wright',
    email: 'alexander@apexglobal.io',
    company: 'Apex Global Technologies',
    phone: '+1 (555) 234-5678',
    message: 'Requesting Enterprise Zero-Knowledge Cloud deployment pricing.',
    fields: { role: 'VP of Infrastructure', budget: '$100k+' },
    createdAt: new Date().toISOString()
  }
];

export const formsRouter = new Hono();

formsRouter.post('/submit', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  
  const targetTable = body.targetTable || 'crm_leads';
  const submissionRecord: FormSubmissionRecord = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    tenantId: tenant.id,
    targetTable: targetTable,
    contactName: body.contactName || body.name || body.fullName || 'Anonymous Prospect',
    email: body.email || body.workEmail || 'prospect@enterprise.com',
    company: body.company || '',
    phone: body.phone || '',
    message: body.message || body.notes || body.subtitle || '',
    fields: body.fields || body,
    createdAt: new Date().toISOString()
  };

  formSubmissionsStore.push(submissionRecord);

  const lead = crm.createLead({
    tenantId: tenant.id,
    contactName: submissionRecord.contactName,
    email: submissionRecord.email,
    company: submissionRecord.company || '',
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

  eventBus.publish('form.lead.submitted', { lead, submissionRecord }, { tenantId: tenant.id });
  return c.json({ lead, submissionRecord, message: 'Form submitted and saved to internal database table [' + targetTable + ']!' }, 201);
});

formsRouter.get('/submissions', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const records = formSubmissionsStore.filter(s => s.tenantId === tenant.id);
  return c.json({ count: records.length, submissions: records });
});

formsRouter.get('/export/csv', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const records = formSubmissionsStore.filter(s => s.tenantId === tenant.id);
  
  const headers = ['ID', 'Target Table', 'Contact Name', 'Email', 'Company', 'Phone', 'Message', 'Submitted At'];
  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.targetTable}"`,
    `"${(r.contactName || '').replace(/"/g, '""')}"`,
    `"${(r.email || '').replace(/"/g, '""')}"`,
    `"${(r.company || '').replace(/"/g, '""')}"`,
    `"${(r.phone || '').replace(/"/g, '""')}"`,
    `"${(r.message || '').replace(/"/g, '""')}"`,
    `"${r.createdAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  c.header('Content-Type', 'text/csv');
  c.header('Content-Disposition', `attachment; filename="${tenant.id}_form_submissions.csv"`);
  return c.text(csvContent);
});

formsRouter.get('/export/sql', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const records = formSubmissionsStore.filter(s => s.tenantId === tenant.id);

  let sqlStatements = `-- ETHENENGINE AUTOMATED DATABASE FORM SUBMISSIONS EXPORT\n`;
  sqlStatements += `-- TENANT ID: ${tenant.id}\n`;
  sqlStatements += `-- GENERATED AT: ${new Date().toISOString()}\n\n`;
  sqlStatements += `CREATE TABLE IF NOT EXISTS form_submissions (\n`;
  sqlStatements += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sqlStatements += `  tenant_id VARCHAR(64) NOT NULL,\n`;
  sqlStatements += `  target_table VARCHAR(64) NOT NULL,\n`;
  sqlStatements += `  contact_name VARCHAR(255),\n`;
  sqlStatements += `  email VARCHAR(255),\n`;
  sqlStatements += `  company VARCHAR(255),\n`;
  sqlStatements += `  phone VARCHAR(64),\n`;
  sqlStatements += `  message TEXT,\n`;
  sqlStatements += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sqlStatements += `);\n\n`;

  records.forEach(r => {
    const esc = (val: string) => (val || '').replace(/'/g, "''");
    sqlStatements += `INSERT INTO form_submissions (id, tenant_id, target_table, contact_name, email, company, phone, message, created_at)\n`;
    sqlStatements += `VALUES ('${esc(r.id)}', '${esc(r.tenantId)}', '${esc(r.targetTable)}', '${esc(r.contactName)}', '${esc(r.email)}', '${esc(r.company || '')}', '${esc(r.phone || '')}', '${esc(r.message || '')}', '${r.createdAt}');\n`;
  });

  c.header('Content-Type', 'text/plain');
  c.header('Content-Disposition', `attachment; filename="${tenant.id}_form_submissions.sql"`);
  return c.text(sqlStatements);
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

// ============================================================
// Media & Social LLM Publisher Router (MeidaLLM Integration)
// ============================================================
export const mediaPublisherRouter = new Hono();

mediaPublisherRouter.get('/channels', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ channels: mediaPublisher.listChannels(tenant.id) });
});

mediaPublisherRouter.post('/channels/toggle', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const ch = mediaPublisher.toggleChannelConnection(tenant.id, body.channelId, Boolean(body.connected));
  return c.json({ channel: ch });
});

mediaPublisherRouter.get('/posts', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ posts: mediaPublisher.listPosts(tenant.id) });
});

mediaPublisherRouter.post('/posts', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const post = mediaPublisher.createPost({
    tenantId: tenant.id,
    title: body.title || 'Untitled Campaign Post',
    content: body.content || '',
    format: body.format || 'short_form',
    channels: body.channels || ['X / Twitter'],
    status: body.status || 'draft',
    scheduledAt: body.scheduledAt,
  });
  return c.json({ post }, 201);
});

mediaPublisherRouter.post('/posts/status', async (c) => {
  const body = await c.req.json();
  const post = mediaPublisher.updatePostStatus(body.id, body.status);
  return c.json({ post });
});

mediaPublisherRouter.post('/ai-generate', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const result = mediaPublisher.aiGeneratePost(tenant.id, body.prompt || '', body.format || 'short_form', body.platform || 'X / Twitter');
  return c.json({ generated: result });
});

mediaPublisherRouter.get('/analytics', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ summary: mediaPublisher.getAnalyticsSummary(tenant.id) });
});

// Kanban Task Pipeline
mediaPublisherRouter.get('/kanban', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ tasks: mediaPublisher.listKanbanTasks(tenant.id) });
});

mediaPublisherRouter.post('/kanban', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const task = mediaPublisher.createKanbanTask({
    tenantId: tenant.id,
    title: body.title || 'Untitled Task',
    stage: body.stage || 'backlog',
    priority: body.priority || 'P2 Normal',
    assignee: body.assignee || 'Unassigned',
    dueDate: body.dueDate || new Date().toISOString().split('T')[0],
    channel: body.channel || 'X / Twitter'
  });
  return c.json({ task }, 201);
});

mediaPublisherRouter.post('/kanban/stage', async (c) => {
  const body = await c.req.json();
  const task = mediaPublisher.moveKanbanTaskStage(body.id, body.stage);
  return c.json({ task });
});

// Ideas & Research
mediaPublisherRouter.get('/ideas', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ ideas: mediaPublisher.listIdeas(tenant.id) });
});

mediaPublisherRouter.post('/ideas', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const idea = mediaPublisher.createIdea({
    tenantId: tenant.id,
    title: body.title || 'New Content Topic',
    category: body.category || 'General',
    notes: body.notes || ''
  });
  return c.json({ idea }, 201);
});

mediaPublisherRouter.post('/ideas/vote', async (c) => {
  const body = await c.req.json();
  const idea = mediaPublisher.voteIdea(body.id);
  return c.json({ idea });
});

mediaPublisherRouter.get('/research', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ reports: mediaPublisher.listResearchReports(tenant.id) });
});

mediaPublisherRouter.post('/research', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const report = mediaPublisher.createResearchReport({
    tenantId: tenant.id,
    topic: body.topic || 'Market Analysis',
    findings: body.findings || '',
    sources: body.sources || [],
    aiSummary: body.aiSummary || ''
  });
  return c.json({ report }, 201);
});

// Automations Engine
mediaPublisherRouter.get('/automations', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ rules: mediaPublisher.listAutomationRules(tenant.id) });
});

mediaPublisherRouter.post('/automations/toggle', async (c) => {
  const body = await c.req.json();
  const rule = mediaPublisher.toggleAutomationRule(body.id, Boolean(body.enabled));
  return c.json({ rule });
});

// Time Tracking & Attendance
mediaPublisherRouter.get('/timetracking', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ logs: mediaPublisher.listTimeLogs(tenant.id) });
});

mediaPublisherRouter.post('/timetracking/clock-in', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const session = mediaPublisher.clockIn(tenant.id, body.userEmail || 'creator@lioramedia.com');
  return c.json({ session });
});

mediaPublisherRouter.post('/timetracking/clock-out', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const session = mediaPublisher.clockOut(tenant.id, body.userEmail || 'creator@lioramedia.com');
  return c.json({ session });
});

// Client Reviews
mediaPublisherRouter.get('/client-reviews', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ reviews: mediaPublisher.listClientReviews(tenant.id) });
});

mediaPublisherRouter.post('/client-reviews/respond', async (c) => {
  const body = await c.req.json();
  const review = mediaPublisher.respondToClientReview(body.id, body.status, body.feedback);
  return c.json({ review });
});

// Sprint Cycles, SITREP & Gantt
mediaPublisherRouter.get('/sprint-cycles', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ cycles: mediaPublisher.listSprintCycles(tenant.id) });
});

mediaPublisherRouter.get('/sitrep', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ report: mediaPublisher.generateSitrep(tenant.id) });
});

mediaPublisherRouter.get('/gantt', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ milestones: mediaPublisher.listGanttMilestones(tenant.id) });
});

// ============================================================
// Community Admin & Sabbath Agenda Router (Gospel Platform Subsystem)
// ============================================================
export const communityAdminRouter = new Hono();

communityAdminRouter.get('/agendas', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ agendas: communityAdmin.listAgendas(tenant.id) });
});

communityAdminRouter.post('/agendas', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const agenda = communityAdmin.createAgenda({
    tenantId: tenant.id,
    title: body.title || 'Sabbath Service & Auxiliary Meetings',
    date: body.date || new Date().toISOString().split('T')[0],
    meetingType: body.meetingType || 'sacrament',
    timeframe: body.timeframe || '1_month',
    conductingOfficer: body.conductingOfficer || 'Presidency Member',
    organist: body.organist || 'Accompanist',
    chorister: body.chorister || 'Chorister',
    hymns: body.hymns || {
      opening: '#2 — The Spirit of God',
      sacrament: '#193 — I Stand All Amazed',
      intermediate: '#85 — How Firm a Foundation',
      closing: '#304 — Teach Me to Walk in the Light'
    },
    speakers: body.speakers || [{ name: 'Assigned Speaker', topic: 'Faith & Service', durationMinutes: 12 }],
    secondHour: body.secondHour || { teacher: 'Instructor', lessonTopic: 'Come Follow Me Study', auxiliaryGroup: 'All Classes' },
    announcements: body.announcements || ['Community activity this week.']
  });
  return c.json({ agenda }, 201);
});

communityAdminRouter.post('/agendas/generate-sundays', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const generated = communityAdmin.generateSundayItinerary(tenant.id, body.monthLabel || 'Current Month', Number(body.sundayCount || 4));
  return c.json({ generated, count: generated.length });
});

communityAdminRouter.get('/callings', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ callings: communityAdmin.listCallings(tenant.id) });
});

communityAdminRouter.post('/callings', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const calling = communityAdmin.createCalling({
    tenantId: tenant.id,
    positionTitle: body.positionTitle || 'Auxiliary Instructor',
    orgUnit: body.orgUnit || 'Sunday School',
    candidateName: body.candidateName || 'Member Name',
    status: body.status || 'proposed'
  });
  return c.json({ calling }, 201);
});

communityAdminRouter.post('/callings/status', async (c) => {
  const body = await c.req.json();
  const calling = communityAdmin.updateCallingStatus(body.id, body.status);
  return c.json({ calling });
});

communityAdminRouter.get('/library', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ library: communityAdmin.listLibraryResources(tenant.id) });
});

communityAdminRouter.get('/members', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ members: communityAdmin.listMembers(tenant.id) });
});

communityAdminRouter.post('/members', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const member = communityAdmin.createMember({
    tenantId: tenant.id,
    fullName: body.fullName || 'Member Name',
    email: body.email || 'member@community.org',
    phone: body.phone || '+1-555-0000',
    orgUnit: body.orgUnit || 'General Member',
    currentCalling: body.currentCalling || 'Member',
    status: 'active'
  });
  return c.json({ member }, 201);
});

communityAdminRouter.get('/attendance', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ logs: communityAdmin.listAttendance(tenant.id) });
});

communityAdminRouter.post('/attendance', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const log = communityAdmin.recordAttendance({
    tenantId: tenant.id,
    date: body.date || new Date().toISOString().split('T')[0],
    meetingType: body.meetingType || 'Sacrament Service',
    headcount: Number(body.headcount || 0),
    recordedBy: body.recordedBy || 'Leader'
  });
  return c.json({ log }, 201);
});

communityAdminRouter.get('/vault', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ documents: communityAdmin.listVaultDocuments(tenant.id) });
});

communityAdminRouter.post('/vault', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const doc = communityAdmin.uploadVaultDocument({
    tenantId: tenant.id,
    title: body.title || 'Sacred Policy Handbook',
    category: body.category || 'Handbooks',
    fileSize: body.fileSize || '1.5 MB'
  });
  return c.json({ doc }, 201);
});

communityAdminRouter.get('/search', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const q = c.req.query('q') || '';
  const results = communityAdmin.searchLibrary(tenant.id, q);
  return c.json({ query: q, results, count: results.length });
});

// ============================================================
// Trades & Craftsmen Engine Router
// ============================================================
export const tradesCraftRouter = new Hono();

tradesCraftRouter.get('/portfolio', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ items: tradesCraftEngine.listPortfolio(tenant.id) });
});

tradesCraftRouter.post('/portfolio', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const item = tradesCraftEngine.createPortfolioItem(tenant.id, {
    title: body.title || 'New Craftsmanship Project',
    tradeType: body.tradeType || 'handyman',
    description: body.description || '',
    beforeAfterUrls: body.beforeAfterUrls || {},
    projectCost: Number(body.projectCost || 0),
    completionDate: body.completionDate || new Date().toISOString()
  });
  return c.json({ item }, 201);
});

tradesCraftRouter.get('/work-orders', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ workOrders: tradesCraftEngine.listWorkOrders(tenant.id) });
});

tradesCraftRouter.post('/work-orders', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const wo = tradesCraftEngine.createWorkOrder(tenant.id, {
    customerName: body.customerName || 'Customer',
    customerPhone: body.customerPhone || '+1-555-0000',
    address: body.address || 'Service Location',
    tradeType: body.tradeType || 'handyman',
    serviceDescription: body.serviceDescription || 'Service Request',
    status: body.status || 'scheduled',
    estimatedCost: Number(body.estimatedCost || 0),
    scheduledDate: body.scheduledDate || new Date().toISOString()
  });
  return c.json({ workOrder: wo }, 201);
});

tradesCraftRouter.post('/work-orders/status', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const wo = tradesCraftEngine.updateWorkOrderStatus(tenant.id, body.id, body.status);
  return c.json({ workOrder: wo });
});

tradesCraftRouter.post('/quotes/calculate', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const quote = tradesCraftEngine.calculateEstimate(
    tenant.id,
    body.customerName || 'Valued Customer',
    body.customerEmail || 'customer@example.com',
    body.tradeType || 'plumbing',
    body.materials || [{ item: 'Standard Fitting Set', cost: 150 }],
    Number(body.laborHours || 2),
    Number(body.hourlyRate || 85)
  );
  return c.json({ quote });
});

tradesCraftRouter.get('/tiered-quotes', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ tieredQuotes: tradesCraftEngine.listTieredQuotes(tenant.id) });
});

tradesCraftRouter.post('/zip-check', async (c) => {
  const body = await c.req.json();
  const coverage = tradesCraftEngine.checkZipCodeCoverage(body.zipCode || '');
  return c.json({ coverage });
});

// ============================================================
// Travel, Mobility & Corporate Fleet Router
// ============================================================
export const travelFleetRouter = new Hono();

travelFleetRouter.get('/fleet', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ vehicles: travelFleetEngine.listFleet(tenant.id) });
});

travelFleetRouter.post('/fleet', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const vehicle = travelFleetEngine.addVehicle(tenant.id, {
    make: body.make || 'Toyota',
    model: body.model || 'Camry',
    year: Number(body.year || 2026),
    licensePlate: body.licensePlate || 'FLEET-001',
    fleetType: body.fleetType || 'self_drive',
    dailyRate: Number(body.dailyRate || 100),
    isAvailable: true,
    features: body.features || []
  });
  return c.json({ vehicle }, 201);
});

travelFleetRouter.get('/corporate-packages', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ packages: travelFleetEngine.listCorporatePackages(tenant.id) });
});

travelFleetRouter.post('/corporate-packages', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const pkg = travelFleetEngine.addCorporatePackage(tenant.id, {
    title: body.title || 'Corporate Retreat Package',
    destination: body.destination || 'Resort Island',
    durationDays: Number(body.durationDays || 3),
    maxEmployees: Number(body.maxEmployees || 20),
    pricePerEmployee: Number(body.pricePerEmployee || 1500),
    inclusions: body.inclusions || ['All Inclusive Resort', 'Guided Tours'],
    featuredImageUrl: body.featuredImageUrl || '/assets/retreat.jpg'
  });
  return c.json({ package: pkg }, 201);
});

travelFleetRouter.get('/bookings', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ bookings: travelFleetEngine.listBookings(tenant.id) });
});

travelFleetRouter.post('/bookings', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const booking = travelFleetEngine.createBooking(tenant.id, {
    customerName: body.customerName || 'Corporate Client',
    customerEmail: body.customerEmail || 'booking@corporate.com',
    bookingType: body.bookingType || 'corporate_retreat',
    startDate: body.startDate || '2026-10-01',
    endDate: body.endDate || '2026-10-05',
    totalCost: Number(body.totalCost || 5000),
    status: 'confirmed'
  });
  return c.json({ booking }, 201);
});

travelFleetRouter.get('/search', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const dest = c.req.query('destination');
  const maxPrice = c.req.query('maxPrice');
  const category = c.req.query('category');

  const packages = travelFleetEngine.searchPackages(tenant.id, {
    destination: dest || undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    category: category || undefined
  });
  return c.json({ packages });
});

travelFleetRouter.get('/addons', (c) => {
  return c.json({ addons: travelFleetEngine.listRentalAddons() });
});

travelFleetRouter.get('/reviews', (c) => {
  return c.json({ reviews: travelFleetEngine.listSocialReviews() });
});

// ============================================================
// Legal House & Practice Router
// ============================================================
export const legalHouseRouter = new Hono();

legalHouseRouter.get('/cases', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ cases: legalHouseEngine.listCases(tenant.id) });
});

legalHouseRouter.get('/client-portal', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const clientName = c.req.query('clientName') || 'Acme Media';
  const portalData = legalHouseEngine.getClientPortalData(tenant.id, clientName);
  return c.json({ portalData });
});

legalHouseRouter.get('/attorneys', (c) => {
  return c.json({ attorneys: legalHouseEngine.listAttorneyProfiles() });
});

legalHouseRouter.post('/cases', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const legalCase = legalHouseEngine.createCase(tenant.id, {
    caseNumber: body.caseNumber || `CV-${Date.now()}`,
    title: body.title || 'Legal Matter',
    courtJurisdiction: body.courtJurisdiction || 'Federal District Court',
    clientName: body.clientName || 'Client Name',
    opposingParty: body.opposingParty || 'Opposing Party',
    caseType: body.caseType || 'corporate',
    status: 'active',
    leadCounsel: body.leadCounsel || 'Lead Counsel, Esq.'
  });
  return c.json({ case: legalCase }, 201);
});

legalHouseRouter.post('/cases/status', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const legalCase = legalHouseEngine.updateCaseStatus(tenant.id, body.id, body.status);
  return c.json({ case: legalCase });
});

legalHouseRouter.get('/statutes', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const q = c.req.query('q') || '';
  const statutes = legalHouseEngine.searchStatutes(tenant.id, q);
  return c.json({ query: q, statutes, count: statutes.length });
});

legalHouseRouter.post('/statutes', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const statute = legalHouseEngine.addStatute(tenant.id, {
    title: body.title || 'Legal Precedent Document',
    statuteCategory: body.statuteCategory || 'corporate_code',
    jurisdiction: body.jurisdiction || 'State Chancery',
    citationNumber: body.citationNumber || 'Statute § 101',
    excerptText: body.excerptText || 'Legal excerpt content...',
    tags: body.tags || ['legal']
  });
  return c.json({ statute }, 201);
});

legalHouseRouter.get('/billables', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ billables: legalHouseEngine.listBillables(tenant.id) });
});

legalHouseRouter.post('/billables/log', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const log = legalHouseEngine.logBillableTime(
    tenant.id,
    body.caseId || 'case_general',
    body.attorneyName || 'Lead Counsel, Esq.',
    body.serviceDescription || 'Legal Consultation & Research',
    Number(body.hoursSpent || 1),
    Number(body.hourlyRate || 450)
  );
  return c.json({ log }, 201);
});

// ============================================================
// Abode Property & Rental Management Router
// ============================================================
export const abodePropertyRouter = new Hono();

abodePropertyRouter.get('/properties', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ properties: abodePropertyEngine.listProperties(tenant.id) });
});

abodePropertyRouter.post('/properties', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const property = abodePropertyEngine.createProperty(tenant.id, {
    title: body.title || 'New Managed Property',
    address: body.address || 'Property Location',
    propertyType: body.propertyType || 'apartment',
    totalUnits: Number(body.totalUnits || 1),
    monthlyRent: Number(body.monthlyRent || 1500),
    depositAmount: Number(body.depositAmount || 1500),
    status: 'vacant',
    ownerName: body.ownerName || 'Property Owner'
  });
  return c.json({ property }, 201);
});

abodePropertyRouter.get('/leases', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ leases: abodePropertyEngine.listLeases(tenant.id) });
});

abodePropertyRouter.post('/leases', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const lease = abodePropertyEngine.createLease(tenant.id, {
    propertyId: body.propertyId || 'prop_general',
    propertyTitle: body.propertyTitle || 'Property Unit',
    tenantName: body.tenantName || 'Tenant Name',
    tenantEmail: body.tenantEmail || 'tenant@abode.com',
    tenantPhone: body.tenantPhone || '+1-555-0000',
    startDate: body.startDate || '2026-01-01',
    endDate: body.endDate || '2026-12-31',
    monthlyRent: Number(body.monthlyRent || 1500),
    securityDeposit: Number(body.securityDeposit || 1500),
    status: 'active'
  });
  return c.json({ lease }, 201);
});

abodePropertyRouter.get('/invoices', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ invoices: abodePropertyEngine.listInvoices(tenant.id) });
});

abodePropertyRouter.get('/maintenance', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ tickets: abodePropertyEngine.listMaintenanceTickets(tenant.id) });
});

abodePropertyRouter.post('/maintenance', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const ticket = abodePropertyEngine.createMaintenanceTicket(tenant.id, {
    propertyId: body.propertyId || 'prop_general',
    propertyTitle: body.propertyTitle || 'Property Unit',
    tenantName: body.tenantName || 'Tenant Name',
    category: body.category || 'general',
    issueDescription: body.issueDescription || 'Maintenance request',
    priority: body.priority || 'medium',
    status: 'open'
  });
  return c.json({ ticket }, 201);
});

abodePropertyRouter.get('/payouts', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ payouts: abodePropertyEngine.listOwnerPayouts(tenant.id) });
});

// ============================================================
// Service Reservations & Order Book Router
// ============================================================
export const reservationsRouter = new Hono();

reservationsRouter.get('/slots', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const domain = c.req.query('domain') as any;
  return c.json({ slots: reservationEngine.listSlots(tenant.id, domain) });
});

reservationsRouter.post('/slots', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const slot = reservationEngine.createSlot(tenant.id, {
    providerId: body.providerId || 'prov_general',
    providerName: body.providerName || 'Service Provider',
    serviceDomain: body.serviceDomain || 'trades',
    serviceTitle: body.serviceTitle || 'Professional Service Slot',
    slotStart: body.slotStart || new Date().toISOString(),
    slotEnd: body.slotEnd || new Date().toISOString(),
    hourlyRate: Number(body.hourlyRate || 100)
  });
  return c.json({ slot }, 201);
});

reservationsRouter.get('/orders', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ orders: reservationEngine.listOrders(tenant.id) });
});

reservationsRouter.post('/reserve', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const order = reservationEngine.reserveSlotAndCreateOrder(
    tenant.id,
    body.slotId,
    body.customerName || 'Customer',
    body.customerEmail || 'customer@example.com',
    Number(body.agreedPrice || 100),
    body.initialMessage
  );
  if (!order) return c.json({ error: 'Slot not found' }, 404);
  return c.json({ order }, 201);
});

reservationsRouter.post('/orders/message', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const order = reservationEngine.addOrderMessage(
    tenant.id,
    body.orderId,
    body.sender || 'customer',
    body.senderName || 'User',
    body.text || ''
  );
  return c.json({ order });
});

// ============================================================
// Global Tax & Multi-Currency Router
// ============================================================
export const taxCurrencyRouter = new Hono();

taxCurrencyRouter.post('/convert', async (c) => {
  const body = await c.req.json();
  const converted = taxCurrencyEngine.convertAmount(
    Number(body.amount || 0),
    body.from || 'USD',
    body.to || 'EUR'
  );
  return c.json({ amount: body.amount, from: body.from, to: body.to, converted });
});

taxCurrencyRouter.post('/calculate-tax', async (c) => {
  const body = await c.req.json();
  const result = taxCurrencyEngine.calculateTax(
    Number(body.subtotal || 0),
    body.regionCode || 'US'
  );
  return c.json({ result });
});

// ============================================================
// Public API Gateway Integration Router (from public-apis list)
// ============================================================
export const publicApiRouter = new Hono();

publicApiRouter.get('/weather', async (c) => {
  const city = c.req.query('city') || 'San Francisco';
  const weather = await publicApiEngine.getWeatherForecast(city);
  return c.json({ weather });
});

publicApiRouter.get('/rates', async (c) => {
  const base = c.req.query('base') || 'USD';
  const rates = await publicApiEngine.getLiveExchangeRates(base);
  return c.json({ rates });
});

publicApiRouter.get('/ip-geo', async (c) => {
  const ip = c.req.query('ip') || '198.51.100.42';
  const geo = await publicApiEngine.lookupIpLocation(ip);
  return c.json({ geo });
});

publicApiRouter.get('/geocode', async (c) => {
  const address = c.req.query('address') || '100 Ocean Drive, Miami FL';
  const location = await publicApiEngine.geocodeAddress(address);
  return c.json({ location });
});

publicApiRouter.get('/trending-news', async (c) => {
  const category = (c.req.query('category') as any) || 'tech';
  const news = await publicApiEngine.fetchTrendingNews(category);
  return c.json({ news });
});

publicApiRouter.get('/legal-citations', async (c) => {
  const q = c.req.query('q') || 'copyright';
  const citations = await publicApiEngine.searchLegalCitations(q);
  return c.json({ citations });
});



