import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { EventBus } from './foundation/EventBus.js';
import { AuditLogger } from './foundation/AuditLogger.js';
import { CorePlatformManager } from './core/CorePlatformManager.js';
import { CapabilityRegistry } from './capability-sdk/CapabilityRegistry.js';
import { FutureCapabilitiesMap } from './capability-sdk/FutureCapabilities.js';
import { ThemeEngine } from './capabilities/theme-engine/ThemeEngine.js';
import { BasicCMS } from './capabilities/basic-cms/BasicCMS.js';
import { WebsiteBuilder } from './capabilities/website-builder/WebsiteBuilder.js';
import { escapeHtml } from './foundation/Sanitizer.js';

import { IdentityEngine } from './core/IdentityEngine.js';
import { AuthTokenEngine } from './core/AuthTokenEngine.js';
import { UnifiedAuthGateway } from './core/UnifiedAuthGateway.js';
import { CommerceEngine } from './capabilities/commerce/CommerceEngine.js';
import { CRMEngine } from './capabilities/crm/CRMEngine.js';
import { AccountingEngine } from './capabilities/accounting/AccountingEngine.js';
import { HREngine } from './capabilities/hr/HREngine.js';
import { CommunicationEngine } from './capabilities/communication/CommunicationEngine.js';
import { seedLioramediaTenant } from './seed/seedLioramedia.js';
import { TelemetryEngine } from './foundation/TelemetryEngine.js';
import { runtimeInputValidator } from './foundation/RuntimeValidator.js';
import { OpenAPIGenerator } from './foundation/OpenAPIGenerator.js';
import { SyncEngine } from './foundation/SyncEngine.js';

type Variables = {
  tenant: any;
  userContext?: any;
};

const app = new Hono<{ Variables: Variables }>();

// Serve Static Assets via Bun (Using Bun File API)
app.use('/*', serveStatic({ root: './public' }));

// Global Security & Telemetry Middleware
app.use('*', runtimeInputValidator);
app.use('*', async (c, next) => {
  TelemetryEngine.getInstance().incrementRequestCount();
  await next();
});

// OpenAPI Spec Endpoint
app.get('/api/openapi.json', (c) => {
  return c.json(OpenAPIGenerator.generateSpec());
});

app.get('/docs', (c) => {
  const html = `<!DOCTYPE html>
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
  </html>`;
  return c.html(html);
});

const core = CorePlatformManager.getInstance();
const capabilityRegistry = CapabilityRegistry.getInstance();
const themeEngine = ThemeEngine.getInstance();
const cms = BasicCMS.getInstance();
const websiteBuilder = WebsiteBuilder.getInstance();
const auditLogger = AuditLogger.getInstance();
const eventBus = EventBus.getInstance();

// Boot SyncEngine — dual-write safety layer (Docker + Aiven)
const syncEngine = SyncEngine.getInstance();

// Sync Status Endpoint
app.get('/api/sync/status', (c) => {
  const stats = syncEngine.getStats();
  return c.json({
    status: 'ok',
    syncEngine: {
      ...stats,
      description: 'Dual-write engine: every mutation is written to both Docker PostgreSQL and Aiven Cloud PostgreSQL concurrently.',
    },
  });
});

// Seed Initial Datasets & Capabilities
seedLioramediaTenant();
capabilityRegistry.registerCapability({
  id: 'capability_website_builder',
  name: 'Website Builder Engine',
  version: '1.0.0',
  description: 'Drag & drop block renderer and site builder engine',
  category: 'experience',
  enabled: true,
  initialize: () => {},
});

capabilityRegistry.registerCapability({
  id: 'capability_theme_engine',
  name: 'Theme Engine',
  version: '1.0.0',
  description: 'Design token compiler and custom css theme renderer',
  category: 'experience',
  enabled: true,
  initialize: () => {},
});

capabilityRegistry.registerCapability({
  id: 'capability_basic_cms',
  name: 'Basic CMS',
  version: '1.0.0',
  description: 'Headless structured content type and entry management engine',
  category: 'business',
  enabled: true,
  initialize: () => {},
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
  c.set('tenant', tenant);
  await next();
});

// Middleware: Strict Authenticated Route Protection
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('authorization');
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromQuery = c.req.query('token') || c.req.query('session_state');
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
// Visual Login & Authentication Portal Page
// GET /login
// ============================================================
app.get('/login', (c) => {
  const tenantSlug = c.req.query('tenant') || 'lioramedia';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login — ETHENENGINE Enterprise Platform</title>
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/animations.css" />
  <style>
    body {
      margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%);
      font-family: system-ui, -apple-system, sans-serif; color: #f8fafc;
    }
    .login-card {
      width: 100%; max-width: 440px; padding: 2.5rem; background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .brand-header { text-align: center; margin-bottom: 2rem; }
    .brand-logo {
      width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.5rem; color: white; margin: 0 auto 1rem;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }
    .input-group { margin-bottom: 1.25rem; }
    .input-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #94a3b8; margin-bottom: 0.5rem; }
    .input-control {
      width: 100%; padding: 0.75rem 1rem; background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; color: white;
      font-size: 0.95rem; box-sizing: border-box; transition: all 0.2s;
    }
    .input-control:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
    .btn-submit {
      width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #6366f1, #4f46e5);
      border: none; border-radius: 0.5rem; color: white; font-weight: 600; font-size: 1rem;
      cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }
    .sso-divider { display: flex; align-items: center; margin: 1.5rem 0; color: #64748b; font-size: 0.8rem; }
    .sso-divider::before, .sso-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255, 255, 255, 0.1); }
    .sso-divider span { padding: 0 0.75rem; }
    .btn-keycloak {
      width: 100%; padding: 0.85rem; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; color: #e2e8f0;
      font-weight: 600; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 0.75rem; transition: background 0.2s; text-decoration: none; box-sizing: border-box;
    }
    .btn-keycloak:hover { background: rgba(255, 255, 255, 0.1); }
    .alert-msg { padding: 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin-bottom: 1.25rem; display: none; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
    .alert-success { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #86efac; }
  </style>
</head>
<body>
  <div class="login-card animate-fade-in">
    <div class="brand-header">
      <div class="brand-logo">E</div>
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">ETHENENGINE</h2>
      <p style="margin: 0.4rem 0 0; color: #94a3b8; font-size: 0.85rem;">Enterprise Multi-Tenant Platform</p>
    </div>

    <div id="alertBox" class="alert-msg"></div>

    <form id="loginForm" onsubmit="handleLogin(event)">
      <div class="input-group">
        <label>Email Address</label>
        <input type="email" id="email" class="input-control" placeholder="john.doe@enterprise.com" required value="admin@lioramedia.com" />
      </div>

      <div class="input-group">
        <label>Password</label>
        <input type="password" id="password" class="input-control" placeholder="••••••••" required value="Password123!" />
      </div>

      <button type="submit" class="btn-submit">Sign In</button>
    </form>

    <div class="sso-divider">
      <span>OR ENTERPRISE SSO</span>
    </div>

    <a href="http://localhost:8080/realms/ethenengine/protocol/openid-connect/auth?client_id=ethenengine-app&response_type=code&redirect_uri=http://localhost:3000/admin" class="btn-keycloak">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      Continue with Keycloak SSO
    </a>
  </div>

  <script>
    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const alertBox = document.getElementById('alertBox');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-tenant-id': '${escapeHtml(tenantSlug)}' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
          alertBox.className = 'alert-msg alert-success';
          alertBox.style.display = 'block';
          alertBox.innerText = 'Login successful! Redirecting...';
          localStorage.setItem('auth_token', data.token);
          document.cookie = 'auth_token=' + data.token + '; path=/; SameSite=Lax';
          setTimeout(() => { window.location.href = '/admin?tenant=${escapeHtml(tenantSlug)}'; }, 1000);
        } else {
          alertBox.className = 'alert-msg alert-error';
          alertBox.style.display = 'block';
          alertBox.innerText = data.error || 'Authentication failed';
        }
      } catch (err) {
        alertBox.className = 'alert-msg alert-error';
        alertBox.style.display = 'block';
        alertBox.innerText = 'Network error during login.';
      }
    }
  </script>
</body>
</html>`;
  return c.html(html);
});

// API Routes
app.post('/api/auth/register', async (c) => {
  const body = await c.req.json();
  const { email, name, password, securityQuestions, type } = body;
  const tenant = c.get('tenant') as any;

  if (!email || !name || !password) {
    return c.json({ error: 'Missing required fields: email, name, password' }, 400);
  }

  try {
    const identityEngine = IdentityEngine.getInstance();
    const user = identityEngine.registerUser({
      email,
      name,
      password,
      securityQuestions,
      type: type || 'PUBLIC_USER',
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
  const pages = websiteBuilder.listPages(tenant.id);
  const page = pageId ? pages.find((p) => p.id === pageId || p.slug === pageId) : pages[0];

  if (!page) {
    return c.html('<h1>Page not found</h1><a href="/admin?tenant=' + tenantSlug + '">← Back to Admin</a>', 404);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Visual Editor — ${escapeHtml(page.title)} | ETHENENGINE Studio</title>
  <link rel="stylesheet" href="/editor.css" />
</head>
<body>
<div class="editor-toolbar" id="editorToolbar">
  <div style="display:flex; align-items:center; gap:0.75rem;">
    <div class="toolbar-brand"><div class="toolbar-brand-icon">E</div><span style="color:#6366f1;">STUDIO</span></div>
    <a href="/admin?tenant=${escapeHtml(tenantSlug)}" class="btn btn-ghost" style="padding:0.3rem 0.6rem; font-size:0.74rem;">← Admin</a>
    <input type="text" class="page-title-input" id="pageTitleInput" value="${escapeHtml(page.title)}" />
  </div>
  <div class="toolbar-right">
    <button class="btn btn-primary" onclick="savePage()">💾 Save</button>
    <button class="btn btn-ghost" onclick="handleLogout()" style="color:#fca5a5;">🚪 Sign Out</button>
  </div>
</div>
<script>
  async function handleLogout() {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login?tenant=${escapeHtml(tenantSlug)}';
  }
</script>
</body>
</html>`;
  return c.html(html);
});

// Admin Experience Dashboard API/HTML UI
app.get('/admin', requireAuth, (c) => {
  const tenants = core.listTenants();
  const activeTenant = c.get('tenant') as any;
  const activeView = c.req.query('view') || 'dashboard';

  const pages = websiteBuilder.listPages(activeTenant.id);
  const theme = themeEngine.getThemeForTenant(activeTenant.id);
  const cmsEntries = cms.listEntries(activeTenant.id);
  const commerce = CommerceEngine.getInstance();
  const crm = CRMEngine.getInstance();
  const accounting = AccountingEngine.getInstance();
  const comms = CommunicationEngine.getInstance();
  const hr = HREngine.getInstance();
  const identityEngine = IdentityEngine.getInstance();

  const products = commerce.listProducts(activeTenant.id);
  const orders = commerce.listOrders(activeTenant.id);
  const leads = crm.listLeads(activeTenant.id);
  const balance = accounting.getBalanceSheet(activeTenant.id);
  const chatMsgs = comms.getMessages('chan_general');
  const auditLogs = auditLogger.getAuditTrail(activeTenant.id);
  const identities = (identityEngine as any).listIdentities ? (identityEngine as any).listIdentities() : Array.from((identityEngine as any).identities.values());

  const telemetry = TelemetryEngine.getInstance().getTelemetry(tenants.length);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ETHENENGINE Admin Console (${escapeHtml(activeTenant.name)})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #e2e8f0; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 280px; background: #111827; border-right: 1px solid #1f2937; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; }
    .brand { font-size: 1.2rem; font-weight: 700; color: #6366f1; display:flex; align-items:center; gap:0.5rem; }
    .nav-item { padding: 0.65rem 0.85rem; border-radius: 6px; color: #9ca3af; text-decoration: none; font-size: 0.85rem; display:flex; align-items:center; gap:0.5rem; }
    .nav-item.active, .nav-item:hover { background: #1f2937; color: #fff; }
    .main-content { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 1.5rem; }
    .card h2 { font-size: 1.1rem; margin-bottom: 1rem; color: #38bdf8; display:flex; justify-content:space-between; align-items:center; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card { background: #070a12; border: 1px solid #1f2937; border-radius: 8px; padding: 1rem; }
    .stat-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.4rem; font-weight: 700; color: #fff; }
    .stat-desc { font-size: 0.8rem; color: #10b981; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th, td { padding: 0.65rem 0.75rem; border-bottom: 1px solid #1f2937; }
    th { color: #6b7280; font-weight: 600; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: #065f46; color: #34d399; }
    .btn { background: #6366f1; color: #fff; padding: 0.5rem 1rem; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; text-decoration: none; }
  </style>
  <script>
    (function() {
      const token = localStorage.getItem('auth_token');
      const isKeycloakSession = document.referrer.includes('8080') || window.location.search.includes('session_state') || window.location.search.includes('code');
      if (!token && !isKeycloakSession) {
        window.location.href = '/login?tenant=${activeTenant.slug}';
      }
    })();
  </script>
</head>
<body>
  <div class="sidebar">
    <div class="brand">
      <div style="background:#6366f1; width:28px; height:28px; border-radius:6px; display:grid; place-content:center; color:#fff; font-weight:900;">E</div>
      ETHENENGINE ADMIN
    </div>
    <nav style="display:flex; flex-direction:column; gap:0.2rem;">
      <a class="nav-item ${activeView === 'dashboard' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=dashboard">📊 Dashboard & Telemetry</a>
      <a class="nav-item" href="/docs" target="_blank">📖 OpenAPI Specs ↗</a>
      <button onclick="handleLogout()" class="nav-item" style="width:100%; text-align:left; border:none; cursor:pointer; background:rgba(239,68,68,0.15); color:#fca5a5; margin-top:1rem;">🚪 Sign Out / Logout</button>
    </nav>
  </div>
  <div class="main-content">
    <div class="grid-4">
      <div class="stat-card"><div class="stat-label">🛒 Commerce Revenue</div><div class="stat-value">$${totalRevenue.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">💰 Net Balance</div><div class="stat-value">$${balance.netBalance.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">🛡️ Audit Logs</div><div class="stat-value">${auditLogs.length}</div></div>
      <div class="stat-card"><div class="stat-label">💬 Messages</div><div class="stat-value">${chatMsgs.length}</div></div>
    </div>
    <div class="card">
      <h2>Website Pages (${escapeHtml(activeTenant.name)})</h2>
      <table>
        <thead><tr><th>Page Title</th><th>Path Slug</th><th>Status</th></tr></thead>
        <tbody>
          ${pages.map((p) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(p.title)}</td><td>/${escapeHtml(p.slug)}</td><td><span class="badge">PUBLISHED</span></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <script>
    async function handleLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') } });
      } catch (e) {}
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login?tenant=${activeTenant.slug}';
    }
  </script>
</body>
</html>`;
  return c.html(html);
});

app.put('/api/website/pages/:id/blocks', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const updatedPage = websiteBuilder.updatePageBlocks(id, body.blocks);
  return c.json({ page: updatedPage });
});

app.get('/preview/:slug', (c) => {
  const tenant = c.get('tenant') as any;
  const slug = c.req.param('slug');
  const page = websiteBuilder.getPageBySlug(tenant.id, slug) || websiteBuilder.getPageBySlug('tenant_default', slug);

  if (!page) return c.html('<h1>Page Not Found</h1>', 404);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ETHENENGINE Enterprise — ${escapeHtml(page.title)}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="hero">
    <h1>${escapeHtml(page.title)}</h1>
  </div>
</body>
</html>`;
  return c.html(html);
});

// Render Public Landing Page
app.get('/', (c) => {
  const activeTenant = c.get('tenant') as any;
  const page = websiteBuilder.getPageBySlug(activeTenant.id, 'home') || websiteBuilder.listPages(activeTenant.id)[0];
  const theme = themeEngine.getThemeForTenant(activeTenant.id);
  const cssVariables = themeEngine.generateCssVariables(theme.tokens);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(activeTenant.name)} — Enterprise Multi-Tenant Platform</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/animations.css">
  <style>
    ${cssVariables}
    body { background: #030712; color: #f9fafb; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
    .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2.5rem; max-width: 1200px; margin: 0 auto; }
    .nav-logo { font-size: 1.5rem; font-weight: 800; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 0.6rem; }
    .nav-links { display: flex; items-center; gap: 1.5rem; }
    .nav-link { color: #9ca3af; text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
    .nav-link:hover { color: #ffffff; }
    .btn-login { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 0.6rem 1.4rem; border-radius: 8px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
    .hero-section { text-align: center; padding: 6rem 1.5rem 4rem; max-width: 900px; margin: 0 auto; }
    .hero-title { font-size: 3.5rem; font-weight: 900; line-height: 1.15; background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1.5rem; }
    .hero-sub { font-size: 1.25rem; color: #94a3b8; max-width: 700px; margin: 0 auto 2.5rem; line-height: 1.6; }
    .hero-cta { display: flex; gap: 1rem; justify-content: center; align-items: center; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 0.85rem 2rem; border-radius: 10px; font-weight: 700; font-size: 1.05rem; text-decoration: none; box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
    .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: white; padding: 0.85rem 2rem; border-radius: 10px; font-weight: 600; font-size: 1.05rem; text-decoration: none; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 1100px; margin: 4rem auto; padding: 0 1.5rem; }
    .feature-card { background: rgba(17, 24, 39, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 2rem; }
    .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
    .feature-card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #f3f4f6; }
    .feature-card p { font-size: 0.9rem; color: #9ca3af; line-height: 1.5; }
  </style>
</head>
<body>
  <nav class="navbar">
    <a href="/" class="nav-logo">
      <div style="background:#6366f1; width:32px; height:32px; border-radius:8px; display:grid; place-content:center; color:#fff; font-weight:900;">E</div>
      ${escapeHtml(activeTenant.name)}
    </a>
    <div class="nav-links">
      <a href="#features" class="nav-link">Platform Features</a>
      <a href="/docs" target="_blank" class="nav-link">API Specs ↗</a>
      <a href="/login?tenant=${escapeHtml(activeTenant.slug)}" class="btn-login">🔑 Sign In / Login</a>
    </div>
  </nav>

  <section class="hero-section">
    <h1 class="hero-title">${escapeHtml(page ? page.title : 'Empowering Business Operations')}</h1>
    <p class="hero-sub">Enterprise multi-tenant platform architecture engineered for high speed, real-time analytics, commerce, and security.</p>
    <div class="hero-cta">
      <a href="/login?tenant=${escapeHtml(activeTenant.slug)}" class="btn-primary">Get Started / Sign In →</a>
      <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" class="btn-secondary">Explore Admin Portal</a>
    </div>
  </section>

  <section id="features" class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Bun & Hono Engine</h3>
      <p>Blazing fast server response times powered natively by Bun JavaScript runtime and Hono framework.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🛡️</div>
      <h3>Multi-Tenant Security</h3>
      <p>Isolated data layers, JWT claim contracts, and Keycloak SSO integration for total enterprise compliance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🛒</div>
      <h3>Commerce & CMS</h3>
      <p>Built-in headless CMS, product catalog management, accounting general ledger, and CRM pipeline engines.</p>
    </div>
  </section>
</body>
</html>`;
  return c.html(html);
});

export default {
  port: parseInt(process.env.PORT || '3000', 10),
  fetch: app.fetch,
};
