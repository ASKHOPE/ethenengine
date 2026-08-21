// ETHENENGINE: Enterprise Multi-Tenant Platform Core Entrypoint
// Architecture: Clean Modular Bootstrap with Hono, Zero-Knowledge Crypto, and Subsystem Routers

import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

declare const Bun: any;
import { CorePlatformManager } from './core/CorePlatformManager.js';
import { CapabilityRegistry, FutureCapabilitiesMap } from './capability-sdk/CapabilityRegistry.js';
import { ThemeEngine } from './capabilities/theme-engine/ThemeEngine.js';
import { BasicCMS } from './capabilities/basic-cms/BasicCMS.js';
import { WebsiteBuilder } from './capabilities/website-builder/WebsiteBuilder.js';
import { AuditLogger } from './foundation/AuditLogger.js';
import { EventBus } from './foundation/EventBus.js';
import { SyncEngine } from './foundation/SyncEngine.js';
import { OpenAPIGenerator } from './foundation/OpenAPIGenerator.js';
import { SecurityGuard } from './foundation/SecurityGuard.js';
import { WatchdogEngine } from './foundation/WatchdogEngine.js';
import { watchdogMiddleware } from './foundation/WatchdogMiddleware.js';
import { LoadGovernor } from './foundation/LoadGovernor.js';
import { DisasterRecoveryEngine } from './foundation/DisasterRecoveryEngine.js';
import { DataRecoveryEngine } from './foundation/DataRecoveryEngine.js';
import { UnifiedAuthGateway } from './core/UnifiedAuthGateway.js';
import { SupportAccessEngine } from './core/SupportAccessEngine.js';
import { escapeHtml } from './foundation/Sanitizer.js';
import { seedLioramediaTenant } from './seed/seedLioramedia.js';

// Modular Subsystem Routers
import { authRouter } from './api/auth.routes.js';
import { coreRouter } from './api/core.routes.js';
import { cmsRouter } from './api/cms.routes.js';
import { websiteRouter, themeRouter } from './api/website.routes.js';
import { commerceRouter } from './api/commerce.routes.js';
import { inventoryRouter } from './api/inventory.routes.js';
import { watchdogRouter } from './api/watchdog.routes.js';
import {
  crmRouter,
  erpRouter,
  accountingRouter,
  hrRouter,
  commsRouter,
  marketplaceRouter,
  supportRouter,
  mediaRouter,
  collabRouter,
  analyticsRouter,
  formsRouter,
  searchRouter,
  mediaPublisherRouter,
  communityAdminRouter,
  tradesCraftRouter,
  travelFleetRouter,
  legalHouseRouter,
  abodePropertyRouter,
  reservationsRouter,
  taxCurrencyRouter,
  publicApiRouter
} from './api/subsystems.routes.js';

// Modular HTML View Controllers
import { renderLoginView } from './views/loginView.js';
import { renderEditorView } from './views/editorView.js';
import { renderAdminView } from './views/adminView.js';
import { renderPreviewView } from './views/previewView.js';
import { renderMeidaLLMView } from './views/meidallmView.js';
import { renderCommunityAdminView } from './views/communityAdminView.js';
import { renderTradesView } from './views/tradesView.js';
import { renderTravelView } from './views/travelView.js';
import { renderLegalView } from './views/legalView.js';
import { renderAbodeView } from './views/abodeView.js';

// Capabilities for Views
import { CommerceEngine } from './capabilities/commerce/CommerceEngine.js';
import { CRMEngine } from './capabilities/crm/CRMEngine.js';
import { ERPEngine } from './capabilities/erp/ERPEngine.js';
import { AccountingEngine } from './capabilities/accounting/AccountingEngine.js';
import { HREngine } from './capabilities/hr/HREngine.js';
import { CommunicationEngine } from './capabilities/communication/CommunicationEngine.js';
import { MarketplaceEngine } from './capabilities/marketplace/MarketplaceEngine.js';
import { InventoryEngine } from './capabilities/inventory/InventoryEngine.js';
import { IdentityEngine } from './core/IdentityEngine.js';
import { TelemetryEngine } from './foundation/TelemetryEngine.js';
import { runtimeInputValidator } from './foundation/RuntimeValidator.js';
import { OpenAPIGenerator } from './foundation/OpenAPIGenerator.js';
import { SyncEngine } from './foundation/SyncEngine.js';

import { MediaEngine } from './capabilities/media/MediaEngine.js';
import { ScheduledCronEngine } from './foundation/ScheduledCronEngine.js';

type Variables = {
  tenant: any;
  userContext?: any;
};

const app = new Hono<{ Variables: Variables }>();

// Boot Scheduled Cron Engine (Automated Backups & Telemetry via Bun.cron)
const cronEngine = ScheduledCronEngine.getInstance();
cronEngine.initializeJobs();

// Listen to OS-level Memory Pressure notification (Bun 1.4 kernel event)
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('memoryPressure' as any, (level: string) => {
    console.warn(`[ETHENENGINE Kernel Alert] Memory pressure: ${level}. Evicting in-memory media & query caches.`);
    MediaEngine.getInstance().clearCache();
  });
}

// Global Security, Watchdog & Load Defense Pipeline
app.use('*', SecurityGuard.securityMiddleware());
app.use('*', watchdogMiddleware());
app.use('*', LoadGovernor.middleware());
app.use('/public/*', serveStatic({ root: './' }));
// Direct CSS/JS asset serving — serveStatic root resolution fix for Bun
const servePublicFile = (filename: string, contentType: string) => async (c: any) => {
  const file = Bun.file(`./public/${filename}`);
  const content = await file.text();
  return c.text(content, 200, { 'Content-Type': contentType });
};
app.get('/styles.css', servePublicFile('styles.css', 'text/css'));
app.get('/editor.css', servePublicFile('editor.css', 'text/css'));
app.get('/blocks.css', servePublicFile('blocks.css', 'text/css'));
app.get('/animations.css', servePublicFile('animations.css', 'text/css'));


// OpenAPI Spec & Swagger UI
app.get('/api/openapi.json', (c) => c.json(OpenAPIGenerator.generateSpec()));
app.get('/docs', (c) => {
  return c.html(`<!DOCTYPE html>
  <html>
  <head>
    <title>ETHENENGINE Platform API Explorer</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' });
    </script>
  </body>
  </html>`);
});

// Singletons & Initialization
const core = CorePlatformManager.getInstance();
const capabilityRegistry = CapabilityRegistry.getInstance();
const themeEngine = ThemeEngine.getInstance();
const cms = BasicCMS.getInstance();
const websiteBuilder = WebsiteBuilder.getInstance();
const mediaEngine = MediaEngine.getInstance();
const auditLogger = AuditLogger.getInstance();
const eventBus = EventBus.getInstance();
const syncEngine = SyncEngine.getInstance();

seedLioramediaTenant();
capabilityRegistry.registerCapability({
  id: 'capability_website_builder',
  name: 'Website Builder Engine',
  version: '1.0.0',
  description: 'Drag & drop block renderer and site builder engine',
  category: 'experience',
  enabled: true,
  initialize: () => { },
});

capabilityRegistry.registerCapability({
  id: 'capability_theme_engine',
  name: 'Theme Engine',
  version: '1.0.0',
  description: 'Design token compiler and custom css theme renderer',
  category: 'experience',
  enabled: true,
  initialize: () => { },
});

capabilityRegistry.registerCapability({
  id: 'capability_basic_cms',
  name: 'Basic CMS',
  version: '1.0.0',
  description: 'Headless structured content type and entry management engine',
  category: 'business',
  enabled: true,
  initialize: () => { },
});

// Context Middleware: Multi-Tenant & Context Resolver
app.use('*', async (c, next) => {
  let tenantParam = c.req.header('x-tenant-id') || c.req.query('tenant');
  if (!tenantParam) {
    const url = new URL(c.req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length > 0 && core.getTenantByDomainOrSlug(parts[0])) {
      tenantParam = parts[0];
    }
  }

  const tenant = core.getTenantByDomainOrSlug(tenantParam || 'default') || core.getTenantByDomainOrSlug('tenant_default');
  c.set('tenant' as any, tenant);

  const authHeader = c.req.header('authorization');
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieHeader = c.req.header('cookie');
  const tokenFromCookie = cookieHeader ? cookieHeader.split('; ').find((row: string) => row.startsWith('auth_token='))?.split('=')[1] : null;
  const token = tokenFromHeader || tokenFromCookie;

  if (token) {
    const context = UnifiedAuthGateway.getInstance().verifyTokenAndResolveContext(token);
    if (context) c.set('userContext' as any, context);
  }

  await next();
});

// Auth Guard Middleware for Admin & Protected Views
const requireAuth = async (c: any, next: any) => {
  const userContext = c.get('userContext');
  if (userContext) return await next();

  const tokenFromQuery = c.req.query('token');
  const authHeader = c.req.header('authorization');
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieHeader = c.req.header('cookie');
  const tokenFromCookie = cookieHeader ? cookieHeader.split('; ').find((row: string) => row.startsWith('auth_token='))?.split('=')[1] : null;
  const token = tokenFromHeader || tokenFromCookie || tokenFromQuery;

  if (token) {
    const context = UnifiedAuthGateway.getInstance().verifyTokenAndResolveContext(token);
    if (context) {
      c.set('userContext', context);
      return await next();
    }
  }

  if (c.req.query('session_state') && c.req.query('code')) {
    return await next();
  }

  const tenant = c.get('tenant') as any;
  const tenantSlug = tenant?.slug || 'lioramedia';
  return c.redirect(`/login?tenant=${tenantSlug}`);
};

// ============================================================
// MOUNT MODULAR API ROUTERS
// ============================================================
app.route('/api/auth', authRouter);
app.route('/api/core', coreRouter);
app.route('/api/cms', cmsRouter);
app.route('/api/website', websiteRouter);
app.route('/api/theme', themeRouter);
app.route('/api/commerce', commerceRouter);
app.route('/api/inventory', inventoryRouter);
app.route('/api/watchdog', watchdogRouter);
app.route('/api/crm', crmRouter);
app.route('/api/erp', erpRouter);
app.route('/api/accounting', accountingRouter);
app.route('/api/hr', hrRouter);
app.route('/api/comms', commsRouter);
app.route('/api/marketplace', marketplaceRouter);
app.route('/api/support', supportRouter);
app.route('/api/media', mediaRouter);
app.route('/api/collab', collabRouter);
app.route('/api/analytics', analyticsRouter);
app.route('/api/forms', formsRouter);
app.route('/api/search', searchRouter);
app.route('/api/media-publisher', mediaPublisherRouter);
app.route('/api/community-admin', communityAdminRouter);
app.route('/api/trades', tradesCraftRouter);
app.route('/api/travel', travelFleetRouter);
app.route('/api/legal', legalHouseRouter);
import { SystemHealthEngine } from './capabilities/health/SystemHealthEngine.js';

app.route('/api/abode', abodePropertyRouter);
app.route('/api/reservations', reservationsRouter);
app.route('/api/tax-currency', taxCurrencyRouter);
app.route('/api/public-apis', publicApiRouter);

app.get('/api/core/health-status', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const health = await SystemHealthEngine.getInstance().runSystemHealthCheck(tenant?.id || 'tenant_lioramedia');
  return c.json({ health });
});

app.get('/api/identities', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ identities: IdentityEngine.getInstance().listIdentities(tenant.id) });
});

// ============================================================
// MOUNT HTML VIEW CONTROLLERS
// ============================================================
app.get('/login', (c) => {
  const tenantSlug = c.req.query('tenant') || 'lioramedia';
  return c.html(renderLoginView(tenantSlug));
});

app.get('/editor', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  const pageId = c.req.query('pageId');
  let pages = websiteBuilder.listPages(tenant.id);

  // If a newly created tenant has no pages yet, auto-provision default starter home page
  if (pages.length === 0) {
    const defaultPage = websiteBuilder.createPage({
      tenantId: tenant.id,
    });

    const token = AuthTokenEngine.generateToken(user);
    auditLogger.log({
      tenantId: tenant.id,
      actorId: user.id,
      action: 'user.register',
      resource: `User:${user.id}`,
      details: { email: user.email, type: user.type },
    });

    return c.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        tenantId: user.tenantId,
        roles: user.roles,
      },
      token,
    }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || 'Registration failed' }, 400);
  }
});

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;
  const tenant = c.get('tenant') as any;

  if (!email) {
    return c.json({ error: 'Missing required field: email' }, 400);
  }

  try {
    const authGateway = UnifiedAuthGateway.getInstance();
    const result = authGateway.processLoginRequest({
      email,
      password,
      tenantId: tenant.id,
    });

    if (result.action === 'REDIRECT_TO_KEYCLOAK') {
      return c.json({
        message: 'Enterprise SSO required. Redirecting to Keycloak Provider.',
        action: 'REDIRECT_TO_KEYCLOAK',
        ssoUrl: result.ssoUrl,
        subscriptionPlan: result.subscriptionPlan,
      });
    }

    auditLogger.log({
      tenantId: tenant.id,
      actorId: result.user!.id!,
      action: 'user.login',
      resource: `User:${result.user!.id!}`,
      details: { email, subscriptionPlan: result.subscriptionPlan },
    });

    return c.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
      subscriptionPlan: result.subscriptionPlan,
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Authentication failed' }, 401);
  }
});

app.post('/api/auth/logout', async (c) => {
  const authHeader = c.req.header('authorization');
  const cookieHeader = c.req.header('cookie');
  const tokenFromCookie = cookieHeader ? cookieHeader.split('; ').find((row: string) => row.startsWith('auth_token='))?.split('=')[1] : null;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = tokenFromHeader || tokenFromCookie;
  const tenant = c.get('tenant') as any;

  if (token) {
    // Revoke token on server-side
    AuthTokenEngine.revokeToken(token);

    const authGateway = UnifiedAuthGateway.getInstance();
    const context = authGateway.verifyTokenAndResolveContext(token);
    if (context) {
      auditLogger.log({
        tenantId: tenant.id,
        actorId: context.user.userId,
        action: 'user.logout',
        resource: `User:${context.user.userId}`,
        details: { email: context.user.email, provider: context.provider },
      });
    }
  }

  // Clear HTTP Cookie on response header
  c.header('Set-Cookie', 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  return c.json({ message: 'Logged out successfully' });
});

app.get('/api/core/tenants', (c) => {
  return c.json({ tenants: core.listTenants() });
});

app.post('/api/core/tenants', async (c) => {
  const body = await c.req.json();
  const { name, slug, domain } = body;
  const tenant = core.createTenant('org_default', name, slug, domain, 'usr_admin');
  return c.json({ tenant }, 201);
});

app.get('/api/core/capabilities', (c) => {
  return c.json({
    activeCapabilities: capabilityRegistry.listCapabilities(),
    futureCapabilities: FutureCapabilitiesMap,
  });
});

app.get('/api/core/audit-trail', (c) => {
  const tenant = c.get('tenant') as any;
  return c.json({ auditTrail: auditLogger.getAuditTrail(tenant.id) });
});

app.post('/api/comms/send-email', async (c) => {
  const body = await c.req.json();
  const { to, subject, content } = body;
  const comms = CommunicationEngine.getInstance();
  const result = await comms.sendEmailViaPostfix(to || 'admin@lioramedia.com', subject || 'Test Email', content || 'Email dispatched from Mailcow Engine');
  return c.json(result);
});

app.get('/api/core/events', (c) => {
  const tenant = c.get('tenant') as any;
  return c.json({ events: eventBus.getEventHistory(tenant.id) });
});

app.get('/api/cms/content-types', (c) => {
  const tenant = c.get('tenant') as any;
  return c.json({ contentTypes: cms.listContentTypes(tenant.id) });
});

app.post('/api/cms/content-types', async (c) => {
  const tenant = c.get('tenant') as any;
  const body = await c.req.json();
  const { name, slug, fields } = body;
  const contentType = cms.createContentType({ tenantId: tenant.id, name, slug, fields });
  return c.json({ contentType }, 201);
});

app.get('/api/cms/entries', (c) => {
  const tenant = c.get('tenant') as any;
  const contentTypeId = c.req.query('contentTypeId');
  return c.json({ entries: cms.listEntries(tenant.id, contentTypeId) });
});

app.post('/api/cms/entries', async (c) => {
  const tenant = c.get('tenant') as any;
  const body = await c.req.json();
  const { contentTypeId, slug, data, status } = body;
  const entry = cms.createEntry({ tenantId: tenant.id, contentTypeId, slug, data, status: status || 'published' });
  return c.json({ entry }, 201);
});

app.get('/api/theme', (c) => {
  const tenant = c.get('tenant') as any;
  const theme = themeEngine.getThemeForTenant(tenant.id);
  const cssVariables = themeEngine.generateCssVariables(theme.tokens);
  return c.json({ theme, cssVariables });
});

app.put('/api/theme', async (c) => {
  const tenant = c.get('tenant') as any;
  const body = await c.req.json();
  const theme = themeEngine.getThemeForTenant(tenant.id);
  const updatedTheme = themeEngine.updateThemeTokens(theme.id, body.tokens);
  return c.json({ theme: updatedTheme });
});

app.get('/api/website/pages', (c) => {
  const tenant = c.get('tenant') as any;
  return c.json({ pages: websiteBuilder.listPages(tenant.id) });
});

app.post('/api/website/pages', async (c) => {
  const tenant = c.get('tenant') as any;
  const body = await c.req.json();
  const { title, slug, blocks, isPublished } = body;
  const cleanSlug = (slug || `page-${Date.now()}`).replace(/^\/+/, '');

  const newPage = websiteBuilder.createPage({
    tenantId: tenant.id,
    title: title || 'New Page',
    slug: cleanSlug,
    blocks: blocks || [
      {
        id: `blk_${Date.now()}`,
        type: 'hero',
        settings: { title: title || 'New Page', subtitle: 'Created via ETHENENGINE Admin Builder', ctaText: 'Home', ctaUrl: '/' },
      },
    ],
    isPublished: isPublished ?? true,
    seo: { title: title || 'New Page', description: 'Enterprise page rendered via ETHENENGINE' },
  });

  const persistence = (await import('./foundation/PersistenceDriver.js')).PersistenceDriver.getInstance();
  await persistence.saveCollection('pages', websiteBuilder.listPages(tenant.id));
  return c.json({ page: newPage }, 201);
});

app.get('/api/website/pages/:slug', (c) => {
  const tenant = c.get('tenant') as any;
  const slug = c.req.param('slug');
  const page = websiteBuilder.getPageBySlug(tenant.id, slug);
  if (!page) return c.json({ error: 'Page not found' }, 404);
  return c.json({ page });
});

app.put('/api/website/pages/:id', async (c) => {
  const tenant = c.get('tenant') as any;
  const id = c.req.param('id');
  const body = await c.req.json();
  const { title, slug, isPublished, seoTitle, seoDescription, heroTitle, heroSubtitle, ctaText, ctaUrl } = body;

  try {
    const page = websiteBuilder.listPages(tenant.id).find(p => p.id === id || p.slug === id) || websiteBuilder.getPageBySlug(tenant.id, id);
    if (!page) return c.json({ error: 'Page not found' }, 404);

    const cleanSlug = slug ? slug.replace(/^\/+/, '') : page.slug;
    let blocks = page.blocks;
    if (heroTitle || heroSubtitle || ctaText || ctaUrl) {
      blocks = blocks.map(b => {
        if (b.type === 'hero') {
          return {
            ...b,
            settings: {
              ...b.settings,
              title: heroTitle || b.settings.title,
              subtitle: heroSubtitle || b.settings.subtitle,
              ctaText: ctaText || b.settings.ctaText,
              ctaUrl: ctaUrl || b.settings.ctaUrl,
            }
          };
        }
        return b;
      });
    }

    const updatedPage = websiteBuilder.updatePage(page.id, {
      title: title || page.title,
      slug: cleanSlug,
      blocks,
      isPublished: isPublished ?? page.isPublished,
      seo: {
        title: seoTitle || page.seo.title,
        description: seoDescription || page.seo.description,
      }
    });

    const persistence = (await import('./foundation/PersistenceDriver.js')).PersistenceDriver.getInstance();
    await persistence.saveCollection('pages', websiteBuilder.listPages(tenant.id));
    return c.json({ page: updatedPage });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/website/pages/:id', async (c) => {
  const tenant = c.get('tenant') as any;
  const id = c.req.param('id');
  const page = websiteBuilder.listPages(tenant.id).find(p => p.id === id || p.slug === id);
  if (!page) return c.json({ error: 'Page not found' }, 404);

  websiteBuilder.deletePage(page.id);
  const persistence = (await import('./foundation/PersistenceDriver.js')).PersistenceDriver.getInstance();
  await persistence.saveCollection('pages', websiteBuilder.listPages(tenant.id));
  return c.json({ message: 'Page deleted successfully', pageId: page.id });
});

app.get('/editor', (c) => {
  const tenantSlug = c.req.query('tenant') || 'default';
  const pageId = c.req.query('pageId') || '';
  const tenants = core.listTenants();
  const tenant = tenants.find((t) => t.slug === tenantSlug) || tenants.find((t) => t.slug === 'default')!;
  const theme = themeEngine.getThemeForTenant(tenant.id);
  return c.html(renderEditorView({ tenantSlug: tenant.slug, page, pages, theme }));
});

app.get('/admin', requireAuth, (c) => {
  const tenants = core.listTenants();
  const activeTenant = c.get('tenant' as any) as any;
  const activeView = c.req.query('view') || 'dashboard';
  const userContext = c.get('userContext' as any) as any;
  const isSuperadmin = userContext?.user?.type === 'PLATFORM_USER';
  const currentUserId = userContext?.user?.userId || (isSuperadmin ? 'usr_platform_admin' : 'usr_tenant_admin');

  const supportEngine = SupportAccessEngine.getInstance();
  const supportStatus = supportEngine.hasActiveSupportAccess(activeTenant.id, currentUserId);
  const isSupportSessionActive = isSuperadmin && supportStatus.granted;
  const canAccessConfidentialTenantData = !isSuperadmin || isSupportSessionActive;

  const pages = websiteBuilder.listPages(activeTenant.id);
  const cmsEntries = cms.listEntries(activeTenant.id);
  const commerce = CommerceEngine.getInstance();
  const crm = CRMEngine.getInstance();
  const erp = ERPEngine.getInstance();
  const accounting = AccountingEngine.getInstance();
  const comms = CommunicationEngine.getInstance();
  const hr = HREngine.getInstance();
  const marketplace = MarketplaceEngine.getInstance();
  const inventory = InventoryEngine.getInstance();

  const products = commerce.listProducts(activeTenant.id);
  const orders = commerce.listOrders(activeTenant.id);
  const warehouses = inventory.listWarehouses(activeTenant.id);
  const stockItems = inventory.listStock(activeTenant.id);
  const transfers = inventory.listTransfers(activeTenant.id);
  const leads = canAccessConfidentialTenantData ? crm.listLeads(activeTenant.id) : [];
  const procurementOrders = canAccessConfidentialTenantData ? erp.listProcurementOrders(activeTenant.id) : [];
  const balance = canAccessConfidentialTenantData ? accounting.getBalanceSheet(activeTenant.id) : { netBalance: 0, totalDebits: 0, totalCredits: 0 };
  const employees = canAccessConfidentialTenantData ? hr.listEmployees(activeTenant.id) : [];
  const chatMsgs = canAccessConfidentialTenantData ? comms.getMessages('chan_general') : [];
  const auditLogs = auditLogger.getAuditTrail(activeTenant.id);
  const identities = IdentityEngine.getInstance().listIdentities(activeTenant.id);
  const listings = marketplace.listListings();
  const supportGrants = supportEngine.listGrantsForTenant(activeTenant.id);
  const analyticsSummary = AnalyticsEngine.getInstance().getSummary(activeTenant.id);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Watchdog & Disaster Recovery Telemetry
  const watchdog = WatchdogEngine.getInstance();
  const dr = DisasterRecoveryEngine.getInstance();
  const dataRecovery = DataRecoveryEngine.getInstance();
  const loadGovernor = LoadGovernor.getInstance();

  const watchdogHealth = watchdog.getHealthStatus();
  const watchdogMetrics = watchdog.getMetrics();
  const circuitBreakers = watchdog.getCircuitBreakers();
  const watchdogIncidents = watchdog.listIncidents(30);
  const drStatus = {
    isFailoverActive: dr.isFailoverActive(),
    failoverReason: dr.getFailoverReason(),
    serviceProbes: dr.listServiceHealth(),
  };
  const snapshots = dataRecovery.listSnapshots(activeTenant.id);
  const loadStats = loadGovernor.getStats();

  return c.html(renderAdminView({
    activeTenant,
    activeView,
    tenants,
    pages,
    canAccessConfidentialTenantData,
    isSuperadmin,
    isSupportSessionActive,
    supportStatus,
    orders,
    totalRevenue,
    balance,
    leads,
    procurementOrders,
    auditLogs,
    identities,
    employees,
    chatMsgs,
    warehouses,
    stockItems,
    transfers,
    products,
    cmsEntries,
    listings,
    supportGrants,
    analyticsSummary,
    watchdogHealth,
    watchdogMetrics,
    circuitBreakers,
    watchdogIncidents,
    drStatus,
    snapshots,
    loadStats,
  }));
});

app.get('/meidallm', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  const tenantSlug = tenant?.slug || 'lioramedia';
  return c.html(renderMeidaLLMView(tenantSlug));
});

app.get('/community-admin', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.html(renderCommunityAdminView(tenant));
});

app.get('/trades', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.html(renderTradesView(tenant));
});

app.get('/travel', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.html(renderTravelView(tenant));
});

app.get('/legal', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.html(renderLegalView(tenant));
});

app.get('/abode', requireAuth, (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.html(renderAbodeView(tenant));
});

app.get('/preview/:slug', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const slug = c.req.param('slug');
  const page = websiteBuilder.getPageBySlug(tenant.id, slug);
  if (!page) return c.text('Page not found', 404);

  const theme = themeEngine.getThemeForTenant(tenant.id);
  const cssVariables = themeEngine.generateCssVariables(theme.tokens);
  const renderedContent = websiteBuilder.renderPage(page, { tenant, themeTokens: theme.tokens });
  return c.html(renderPreviewView({ page, tenant, cssVariables, renderedContent }));
});

app.get('/', (c) => {
  const activeTenant = c.get('tenant' as any) as any;
  const page = websiteBuilder.getPageBySlug(activeTenant.id, 'home') || websiteBuilder.listPages(activeTenant.id)[0];
  const theme = themeEngine.getThemeForTenant(activeTenant.id);
  const cssVariables = themeEngine.generateCssVariables(theme.tokens);
  const renderedContent = page ? websiteBuilder.renderPage(page, { tenant: activeTenant, themeTokens: theme.tokens }) : '';
  return c.html(renderPreviewView({ page, tenant: activeTenant, cssVariables, renderedContent, isRoot: true }));
});

export default {
  port: parseInt(process.env.PORT || '3000', 10),
  fetch: app.fetch,
};
