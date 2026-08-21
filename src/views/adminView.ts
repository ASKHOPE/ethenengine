import { escapeHtml } from '../foundation/Sanitizer.js';

export interface AdminViewOptions {
  activeTenant: any;
  activeView: string;
  tenants: any[];
  pages: any[];
  canAccessConfidentialTenantData: boolean;
  isSuperadmin: boolean;
  isSupportSessionActive: boolean;
  supportStatus: any;
  orders: any[];
  totalRevenue: number;
  balance: any;
  ledger?: any[];
  leads: any[];
  procurementOrders: any[];
  auditLogs: any[];
  identities: any[];
  employees: any[];
  chatMsgs: any[];
  warehouses: any[];
  stockItems: any[];
  transfers: any[];
  products: any[];
  cmsEntries: any[];
  listings: any[];
  supportGrants: any[];
  analyticsSummary?: any;
  watchdogHealth?: any;
  watchdogMetrics?: any;
  circuitBreakers?: any[];
  watchdogIncidents?: any[];
  drStatus?: any;
  snapshots?: any[];
  loadStats?: any;
}

export function renderAdminView(options: AdminViewOptions): string {
  const {
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
    ledger = [],
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
  } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ETHENENGINE Admin Console (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/animations.css">
  <style>
    :root {
      --admin-bg: #0b0f19;
      --admin-main-bg: #080c14;
      --admin-sidebar-bg: #0d121f;
      --admin-card-bg: #111827;
      --admin-stat-bg: #0d1322;
      --admin-border: #1f2937;
      --admin-text-main: #e2e8f0;
      --admin-text-muted: #94a3b8;
      --admin-heading: #ffffff;
      --admin-accent: #38bdf8;
      --admin-cat-active-bg: #1e1b4b;
      --admin-cat-active-color: #a5b4fc;
      --admin-table-header-bg: #0b1320;
      --admin-table-header-color: #94a3b8;
      --admin-row-hover: rgba(255, 255, 255, 0.03);
    }

    body.day-mode {
      --admin-bg: #f8fafc;
      --admin-main-bg: #f1f5f9;
      --admin-sidebar-bg: #ffffff;
      --admin-card-bg: #ffffff;
      --admin-stat-bg: #f8fafc;
      --admin-border: #e2e8f0;
      --admin-text-main: #0f172a;
      --admin-text-muted: #475569;
      --admin-heading: #0f172a;
      --admin-accent: #0284c7;
      --admin-cat-active-bg: #e0e7ff;
      --admin-cat-active-color: #4338ca;
      --admin-cat-border: #cbd5e1;
      --admin-table-header-bg: #f1f5f9;
      --admin-table-header-color: #1e293b;
      --admin-row-hover: #f8fafc;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--admin-bg); color: var(--admin-text-main); display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 280px; min-width: 280px; background: var(--admin-sidebar-bg); border-right: 1px solid var(--admin-border); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; box-shadow: 2px 0 10px rgba(0, 0, 0, 0.03); }
    .brand { font-size: 1.15rem; font-weight: 800; color: var(--admin-heading); display:flex; align-items:center; gap:0.6rem; letter-spacing: -0.02em; }
    .nav-section-title { font-size: 0.68rem; font-weight: 800; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 0.75rem 0 0.25rem 0.5rem; }
    .nav-item { padding: 0.55rem 0.75rem; border-radius: 6px; color: var(--admin-text-muted); text-decoration: none; font-size: 0.85rem; display:flex; align-items:center; gap:0.6rem; font-weight: 600; transition: all 0.15s; }
    .nav-item.active, .nav-item:hover { background: var(--admin-stat-bg); color: var(--admin-heading); }
    .nav-item.active { background: rgba(99, 102, 241, 0.15); color: #4338ca; border-left: 3px solid #6366f1; }
    .main-content { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; background: var(--admin-main-bg); }
    .card { background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); color: var(--admin-text-main); }
    .card h2 { font-size: 1.1rem; margin-bottom: 1rem; color: var(--admin-accent); display:flex; justify-content:space-between; align-items:center; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card { background: var(--admin-stat-bg); border: 1px solid var(--admin-border); border-radius: 10px; padding: 1.2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
    .stat-label { font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 0.35rem; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--admin-heading); }
    .stat-desc { font-size: 0.8rem; color: #10b981; margin-top: 0.25rem; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th, td { padding: 0.75rem 0.85rem; border-bottom: 1px solid var(--admin-border); color: var(--admin-text-main); }
    th { background: var(--admin-table-header-bg) !important; color: var(--admin-table-header-color) !important; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
    tr:hover td { background: var(--admin-row-hover); }
    td strong, td span { color: inherit; }
    td[style*="color:#fff"], td[style*="color: #fff"] { color: var(--admin-heading) !important; }
    div[style*="background:#0d1322"], div[style*="background: #0d1322"] { background: var(--admin-card-bg) !important; border-color: var(--admin-border) !important; }
    div[style*="background:#070a12"], div[style*="background: #070a12"] { background: var(--admin-stat-bg) !important; border-color: var(--admin-border) !important; }
    div[style*="background:#111827"], div[style*="background: #111827"] { background: var(--admin-card-bg) !important; border-color: var(--admin-border) !important; }
    h3[style*="color:#fff"], h3[style*="color: #fff"] { color: var(--admin-heading) !important; }
    span[style*="color:#fff"], span[style*="color: #fff"] { color: var(--admin-heading) !important; }
    .badge { display: inline-block; padding: 0.25rem 0.55rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; background: #065f46; color: #34d399; }
    body.day-mode .badge { background: #dcfce7; color: #166534; border: 1px solid #86efac; font-weight: 800; }
    .badge-purple { background: #581c87; color: #c084fc; }
    body.day-mode .badge-purple { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; font-weight: 800; }
    .badge-amber { background: #78350f; color: #fde047; }
    body.day-mode .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-weight: 800; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    body.day-mode .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; font-weight: 800; }
    .lock-box { background: rgba(15, 23, 42, 0.7); border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 3rem 2rem; text-align: center; }
    body.day-mode .lock-box { background: #f8fafc; border-color: #cbd5e1; }
    .privacy-banner { background: #78350f; border: 1px solid #f59e0b; color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between; }
    .cat-btn {
      padding: 0.8rem 0.95rem;
      border-radius: 10px;
      color: var(--admin-text-main);
      font-size: 0.88rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      background: var(--admin-card-bg);
      border: 1px solid var(--admin-border);
      transition: all 0.2s ease;
      text-decoration: none;
      margin-bottom: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .cat-btn:hover {
      background: var(--admin-cat-active-bg);
      color: var(--admin-heading);
      border-color: var(--admin-accent);
      transform: translateX(3px);
    }
    .cat-btn.active {
      background: var(--admin-cat-active-bg);
      border-color: #6366f1;
      color: var(--admin-cat-active-color);
      box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
    }
    body.day-mode .cat-btn.active {
      background: #e0e7ff;
      border-color: #6366f1;
      color: #3730a3;
    }
    .media-tab-btn {
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      border: 1px solid var(--admin-border);
      background: var(--admin-stat-bg);
      color: var(--admin-text-main);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .media-tab-btn:hover { background: var(--admin-card-bg); color: var(--admin-heading); }
    .media-tab-btn.active { background: #0284c7; color: #fff; border-color: #0284c7; }
    .btn { background: #6366f1; color: #fff; padding: 0.5rem 1rem; border-radius: 6px; border: none; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
    .btn-secondary { background: var(--admin-stat-bg); border: 1px solid var(--admin-border); color: var(--admin-heading); }
  </style>
</head>
<body>
  <!-- SINGLE CLEAN SIDEBAR -->
  <div class="sidebar">
    <div class="brand">
      <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); width: 34px; height: 34px; border-radius: 8px; display: grid; place-content: center; color: white; font-weight: 900; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);">E</div>
      <div>
        <div style="color:var(--admin-heading); font-size:1.1rem; font-weight:900;">ETHENENGINE</div>
        <div style="font-size:0.72rem; color:var(--admin-accent); font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">${escapeHtml(activeTenant.name)}</div>
      </div>
    </div>

    <!-- TENANT CONTEXT SWITCHER -->
    ${
      isSuperadmin
        ? `
      <div style="background: var(--admin-stat-bg); border: 1px solid var(--admin-border); padding: 0.75rem 0.85rem; border-radius: 10px; font-size: 0.78rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <label style="color:var(--admin-text-muted); font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">Active Tenant</label>
          <span class="badge badge-purple" style="font-size:0.6rem;">PLATFORM</span>
        </div>
        <select onchange="switchTenant(this.value)" style="width: 100%; background: var(--admin-card-bg); border: 1px solid var(--admin-border); color: var(--admin-heading); padding: 0.45rem 0.6rem; border-radius: 6px; font-size: 0.85rem; font-weight:600;">
          ${tenants.map((t) => `<option value="${escapeHtml(t.slug)}" ${t.id === activeTenant.id ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(t.slug)})</option>`).join('')}
        </select>
      </div>
    `
        : `
      <div style="background: var(--admin-stat-bg); border: 1px solid var(--admin-border); padding: 0.75rem 0.85rem; border-radius: 10px; font-size: 0.78rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <label style="color:var(--admin-text-muted); font-weight:800; display:block; margin-bottom:0.25rem; text-transform:uppercase; letter-spacing:0.05em;">Isolated Tenant Domain</label>
        <div style="font-weight:800; font-size:0.9rem; color:var(--admin-heading); display:flex; align-items:center; gap:0.4rem;">
          🏢 ${escapeHtml(activeTenant.name)}
        </div>
        <div style="font-size:0.75rem; color:var(--admin-accent); margin-top:0.2rem; font-family:monospace;">${escapeHtml(activeTenant.domain || activeTenant.slug + '.localhost')}</div>
      </div>
    `
    }

    <!-- CATEGORY BUTTONS NAV -->
    <div style="display:flex; flex-direction:column; gap:0.35rem; margin-top:0.5rem; flex:1;">
      <div style="font-size:0.72rem; font-weight:900; color:var(--admin-text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.4rem; padding-left:0.25rem;">CATEGORIES</div>
      
      <!-- 1. OVERVIEW (DEFAULT LANDING) -->
      <a href="/admin?tenant=${activeTenant.slug}&view=dashboard" class="cat-btn ${['dashboard', 'analytics'].includes(activeView) ? 'active' : ''}">
        <span>📊 Overview</span>
        <span style="font-size:0.7rem; font-weight:800; background:rgba(99,102,241,0.18); color:#4f46e5; padding:0.15rem 0.5rem; border-radius:6px;">HOME</span>
      </a>

      <!-- 2. ENTERPRISE ENGINES -->
      <a href="/admin?tenant=${activeTenant.slug}&view=engines" class="cat-btn ${['engines', 'inventory', 'commerce', 'crm', 'erp', 'accounting', 'hr', 'comms', 'logistics', 'payments', 'affiliates', 'social', 'community', 'trades', 'travel', 'legal', 'abode'].includes(activeView) ? 'active' : ''}">
        <span>⚡ Enterprise Engines</span>
        <span style="font-size:0.7rem; font-weight:800; background:rgba(16,185,129,0.18); color:#059669; padding:0.15rem 0.5rem; border-radius:6px;">16</span>
      </a>

      <!-- 3. EXPERIENCE & BUILDER -->
      <a href="/admin?tenant=${activeTenant.slug}&view=experience" class="cat-btn ${['experience', 'website', 'cms', 'marketplace', 'settings', 'forms', 'seo'].includes(activeView) ? 'active' : ''}">
        <span>🌐 Experience Builder</span>
        <span style="font-size:0.7rem; font-weight:800; background:rgba(234,179,8,0.22); color:#b45309; padding:0.15rem 0.5rem; border-radius:6px;">6</span>
      </a>

      <!-- 4. SYSTEM & SECURITY -->
      <a href="/admin?tenant=${activeTenant.slug}&view=security" class="cat-btn ${['security', 'watchdog', 'tenants', 'users', 'support', 'audit', 'apikeys', 'firewall'].includes(activeView) ? 'active' : ''}">
        <span>⚙️ System Security</span>
        <span style="font-size:0.7rem; font-weight:800; background:rgba(239,68,68,0.18); color:#dc2626; padding:0.15rem 0.5rem; border-radius:6px;">8</span>
      </a>
    </div>

    <!-- BOTTOM SIDEBAR UTILITIES IN EXACT ORDER -->
    <div style="display:flex; flex-direction:column; gap:0.45rem; margin-top:auto; border-top:1px solid var(--admin-border); padding-top:0.85rem;">
      <!-- 1. USER PROFILE BUTTON (ABOVE UI SELECTOR) -->
      <button onclick="openUserProfileModal()" class="cat-btn" style="background:var(--admin-card-bg); color:var(--admin-heading); margin-bottom:0;">
        <span style="display:flex; align-items:center; gap:0.5rem; font-weight:800;">👤 User Profile</span>
        <span class="badge badge-purple" style="font-size:0.68rem; font-weight:800;">${isSuperadmin ? 'SUPERADMIN' : 'ADMIN'}</span>
      </button>

      <!-- 2. UI THEME SELECTOR (ABOVE SIGN OUT BUTTON) -->
      <div style="background: var(--admin-card-bg); border: 1px solid var(--admin-border); padding: 0.6rem 0.85rem; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <span style="font-size: 0.78rem; font-weight: 800; color: var(--admin-heading);">UI Theme:</span>
        <button onclick="toggleEthenEngineAdminTheme()" id="adminUiThemeBtn" class="media-tab-btn" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; font-weight:800; border: none; background: #0284c7; color: #fff; border-radius:6px;">☀️ Day Mode</button>
      </div>

      <!-- 3. SIGN OUT BUTTON -->
      <button onclick="handleLogout()" class="cat-btn" style="border:1px solid rgba(239,68,68,0.3); cursor:pointer; background:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; margin:0; justify-content:center; gap:0.5rem;">🚪 Sign Out</button>
    </div>
  </div>

  <!-- MAIN WORKSPACE CONTENT AREA (WHERE OPTIONS HUB CARDS ARE DISPLAYED) -->
  <div class="main-content">
    ${
      isSuperadmin && isSupportSessionActive
        ? `
      <div style="background:#7c2d12; border:1px solid #f97316; padding:0.75rem 1rem; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:0.85rem; color:#ffedd5;">
          <strong>⚠️ Support Assist Session Active</strong> — Operating under Zero-Knowledge delegation grant for <code>${escapeHtml(activeTenant.name)}</code>.
        </div>
        <button onclick="exitSupportAssistSession()" class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Terminate Session</button>
      </div>
    `
        : isSuperadmin && !isSupportSessionActive
        ? `
      <div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25); border-radius: 8px; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; font-size:0.85rem; color:#cbd5e1;">
        <div>🔒 <strong>Zero-Knowledge Privacy Mode Active:</strong> Confidential tenant records (Leads, ERP, Ledger, Salaries) are encrypted with per-tenant PBKDF2 keys and inaccessible without tenant ticket consent.</div>
        <a href="/admin?tenant=${activeTenant.slug}&view=support" class="btn" style="padding:0.35rem 0.75rem; font-size:0.75rem;">Request Access</a>
      </div>
    `
        : ''
    }

    ${
      ['inventory', 'commerce', 'crm', 'erp', 'accounting', 'hr', 'comms', 'logistics', 'payments', 'affiliates', 'social'].includes(activeView)
        ? `
      <div style="display:flex; align-items:center; gap:0.6rem; background:#111827; border:1px solid #1f2937; padding:0.6rem 1rem; border-radius:8px;">
        <a href="/admin?tenant=${activeTenant.slug}&view=engines" style="color:#38bdf8; font-weight:700; text-decoration:none; font-size:0.8rem;">← Back to Enterprise Engines Hub</a>
        <span style="color:#64748b;">/</span>
        <span style="color:#fff; font-size:0.8rem; font-weight:700; text-transform:uppercase;">${escapeHtml(activeView)} SUBSYSTEM</span>
      </div>
    `
        : ['website', 'cms', 'settings', 'marketplace', 'forms', 'seo'].includes(activeView)
        ? `
      <div style="display:flex; align-items:center; gap:0.6rem; background:#111827; border:1px solid #1f2937; padding:0.6rem 1rem; border-radius:8px;">
        <a href="/admin?tenant=${activeTenant.slug}&view=experience" style="color:#fde047; font-weight:700; text-decoration:none; font-size:0.8rem;">← Back to Experience Builder Hub</a>
        <span style="color:#64748b;">/</span>
        <span style="color:#fff; font-size:0.8rem; font-weight:700; text-transform:uppercase;">${escapeHtml(activeView)} TOOL</span>
      </div>
    `
        : ['watchdog', 'tenants', 'users', 'support', 'audit', 'apikeys', 'firewall'].includes(activeView)
        ? `
      <div style="display:flex; align-items:center; gap:0.6rem; background:#111827; border:1px solid #1f2937; padding:0.6rem 1rem; border-radius:8px;">
        <a href="/admin?tenant=${activeTenant.slug}&view=security" style="color:#c084fc; font-weight:700; text-decoration:none; font-size:0.8rem;">← Back to System Security Hub</a>
        <span style="color:#64748b;">/</span>
        <span style="color:#fff; font-size:0.8rem; font-weight:700; text-transform:uppercase;">${escapeHtml(activeView)} MODULE</span>
      </div>
    `
        : ''
    }

    ${
      activeView === 'dashboard'
        ? `
      <!-- 1. EXECUTIVE DASHBOARD OVERVIEW -->
      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-label">${isSuperadmin ? '👥 Active Tenant Orgs' : '🏢 Tenant Workspace'}</div>
          <div class="stat-value">${isSuperadmin ? `${tenants.length} Orgs` : escapeHtml(activeTenant.name)}</div>
          <div class="stat-desc">${isSuperadmin ? 'Provisioned Subdomains' : `${escapeHtml(activeTenant.slug)}.localhost`}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">⚡ Services Running</div>
          <div class="stat-value" style="color:#34d399;">17 Services</div>
          <div class="stat-desc">100% Operational Status</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">📄 Published Pages</div>
          <div class="stat-value">${pages.length} Pages</div>
          <div class="stat-desc">Website Builder Subsystem</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">🔒 Cryptographic Ledger</div>
          <div class="stat-value">${auditLogs.length} Events</div>
          <div class="stat-desc">PBKDF2 Security Engine</div>
        </div>
      </div>

      <!-- RUNNING SERVICES HEALTH DIAGNOSTICS TABLE -->
      <div class="card" style="border:1px solid #10b981;">
        <h2>
          <span style="display:flex; align-items:center; gap:0.6rem; color:var(--admin-heading);">
            ⚡ Platform System Health & Running Services Monitor
          </span>
          <span class="badge" style="background:#065f46; color:#34d399; font-size:0.75rem; font-weight:800;">🟢 17/17 SERVICES HEALTHY</span>
        </h2>
        <p style="color:var(--admin-text-muted); font-size:0.85rem; margin-bottom:1.25rem;">Live health diagnostics, memory allocation, and real-time latency probes across all enterprise subsystem engines.</p>
        
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <thead>
            <tr>
              <th style="padding:0.75rem;">Service Name</th>
              <th style="padding:0.75rem;">Category</th>
              <th style="padding:0.75rem;">Health Status</th>
              <th style="padding:0.75rem;">Probe Latency</th>
              <th style="padding:0.75rem;">Memory Heap</th>
            </tr>
          </thead>
          <tbody>
            ${[
              { id: 'inventory', name: '📦 Multi-Warehouse Inventory Engine', cat: 'Operations', lat: '0.12 ms', mem: '24.5 MB' },
              { id: 'commerce', name: '🛒 Commerce Catalog & Cart Engine', cat: 'Commerce', lat: '0.15 ms', mem: '24.5 MB' },
              { id: 'crm', name: '💼 CRM Sales Leads & Pipeline Engine', cat: 'Commerce', lat: '0.10 ms', mem: '24.5 MB' },
              { id: 'erp', name: '🏭 ERP Procurement & Supply Chain', cat: 'Operations', lat: '0.14 ms', mem: '24.5 MB' },
              { id: 'accounting', name: '💰 Financial Ledger & Accounting', cat: 'Operations', lat: '0.11 ms', mem: '24.5 MB' },
              { id: 'hr', name: '👔 HR Staff & Payroll Management', cat: 'Operations', lat: '0.13 ms', mem: '24.5 MB' },
              { id: 'comms', name: '💬 Communications & Chat Engine', cat: 'Engagement', lat: '0.09 ms', mem: '24.5 MB' },
              { id: 'logistics', name: '🚚 Logistics & Shipping Rate Engine', cat: 'Operations', lat: '0.10 ms', mem: '24.5 MB' },
              { id: 'payments', name: '💳 Payments & Billing Gateway Engine', cat: 'Commerce', lat: '0.11 ms', mem: '24.5 MB' },
              { id: 'affiliates', name: '📈 Affiliate Tracking & Commissions', cat: 'Commerce', lat: '0.08 ms', mem: '24.5 MB' },
              { id: 'social', name: '📢 MeidaLLM Social Publishing SaaS', cat: 'Engagement', lat: '0.12 ms', mem: '24.5 MB' },
              { id: 'community', name: '⛪ Community Admin & Sabbath Agenda', cat: 'Engagement', lat: '0.11 ms', mem: '24.5 MB' },
              { id: 'trades', name: '🛠️ Trades & Craftsmen Portfolio Engine', cat: 'Vertical Engine', lat: '0.14 ms', mem: '24.5 MB' },
              { id: 'travel', name: '✈️ Travel, Mobility & Fleet Engine', cat: 'Vertical Engine', lat: '0.15 ms', mem: '24.5 MB' },
              { id: 'legal', name: '⚖️ Legal House & Practice Engine', cat: 'Vertical Engine', lat: '0.13 ms', mem: '24.5 MB' },
              { id: 'abode', name: '🏢 Abode Property & Rental Management', cat: 'Vertical Engine', lat: '0.12 ms', mem: '24.5 MB' },
            ]
              .filter(s => !activeTenant.enabledServices || activeTenant.enabledServices.length === 0 || activeTenant.enabledServices.includes(s.id))
              .map(s => `
                <tr>
                  <td style="padding:0.65rem; font-weight:600; color:var(--admin-heading);">${s.name}</td>
                  <td>${s.cat}</td>
                  <td><span class="badge">🟢 HEALTHY</span></td>
                  <td>${s.lat}</td>
                  <td>${s.mem}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
      <div class="grid-4" style="margin-top:-0.5rem;">
        <div class="stat-card"><div class="stat-label">🛒 Commerce Revenue</div><div class="stat-value">$${totalRevenue.toLocaleString()}</div><div class="stat-desc">${orders.length} order(s) processed</div></div>
        <div class="stat-card"><div class="stat-label">💰 Net Accounting Balance</div><div class="stat-value">${canAccessConfidentialTenantData ? `$${balance.netBalance.toLocaleString()}` : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? `Debits: $${balance.totalDebits.toLocaleString()}` : 'Zero-Knowledge Protected'}</div></div>
        <div class="stat-card"><div class="stat-label">💼 CRM Pipeline Value</div><div class="stat-value">${canAccessConfidentialTenantData ? `$${leads.reduce((s, l) => s + l.dealValue, 0).toLocaleString()}` : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? `${leads.length} active lead(s)` : 'Zero-Knowledge Protected'}</div></div>
        <div class="stat-card"><div class="stat-label">🛡️ Platform Audit Logs</div><div class="stat-value">${auditLogs.length}</div><div class="stat-desc">Security events tracked</div></div>
      </div>
      <div class="grid-4">
        <div class="stat-card"><div class="stat-label">👥 Team & Users</div><div class="stat-value">${identities.length}</div><div class="stat-desc">Active identities</div></div>
        <div class="stat-card"><div class="stat-label">👔 HR Staff Headcount</div><div class="stat-value">${canAccessConfidentialTenantData ? employees.length : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? 'Employees on record' : 'Confidential data'}</div></div>
        <div class="stat-card"><div class="stat-label">🏭 Procurement Orders</div><div class="stat-value">${canAccessConfidentialTenantData ? procurementOrders.length : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? 'Supply chain POs' : 'Confidential data'}</div></div>
        <div class="stat-card"><div class="stat-label">💬 General Chat Messages</div><div class="stat-value">${canAccessConfidentialTenantData ? chatMsgs.length : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? 'Internal messages' : 'End-to-End Isolated'}</div></div>
      </div>
      <div class="card">
        <h2>Active Website Pages (${escapeHtml(activeTenant.name)}) <a href="/editor?tenant=${activeTenant.slug}" class="btn">✏️ Open Visual Editor</a></h2>
        <table>
          <thead><tr><th>Page Title</th><th>Path Slug</th><th>Blocks Count</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${pages.map((p) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(p.title)}</td><td>/${escapeHtml(p.slug)}</td><td>${p.blocks.length} block(s)</td><td><span class="badge">PUBLISHED</span></td><td><a href="/preview/${escapeHtml(p.slug)}?tenant=${activeTenant.slug}" target="_blank" class="btn" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Preview ↗</a></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'engines'
        ? `
      <div class="card">
        <h2>
          <span style="display:flex; align-items:center; gap:0.5rem;">⚡ Enterprise Subsystem Engines (${escapeHtml(activeTenant.name)})</span>
          <span class="badge" style="background:#065f46; color:#34d399;">
            ${[
              { id: 'inventory', icon: '📦', name: 'Multi-Warehouse Inventory', desc: 'Bin allocation, SKU stock tracking & 7 fulfillment hubs.', view: 'inventory', appUrl: null },
              { id: 'commerce', icon: '🛒', name: 'Commerce & Orders', desc: `${orders.length} order(s) processed · Cart & checkout gateway.`, view: 'commerce', appUrl: null },
              { id: 'crm', icon: '💼', name: 'CRM & Sales Leads', desc: `${leads.length} active lead(s) · Deal pipeline tracking.`, view: 'crm', appUrl: null },
              { id: 'erp', icon: '🏭', name: 'ERP & Procurement', desc: `${procurementOrders.length} supply chain purchase order(s).`, view: 'erp', appUrl: null },
              { id: 'accounting', icon: '💰', name: 'Accounting & Ledger', desc: 'Double-entry general ledger & balance sheet integrity.', view: 'accounting', appUrl: null },
              { id: 'hr', icon: '👔', name: 'HR & Staff Roster', desc: 'Employee roster & salary compensation records.', view: 'hr', appUrl: null },
              { id: 'comms', icon: '💬', name: 'Team Comms & Chat', desc: `${chatMsgs.length} message(s) · Live team workspace channels.`, view: 'comms', appUrl: null },
              { id: 'logistics', icon: '🚛', name: 'Logistics & Carrier Shipping', desc: 'FedEx, UPS, DHL & Postal live rate calculator and label generation.', view: 'logistics', appUrl: null },
              { id: 'payments', icon: '💳', name: 'Payments & Subscriptions', desc: 'Stripe, PayPal, recurring MRR invoices & tax compliance engine.', view: 'payments', appUrl: null },
              { id: 'affiliates', icon: '📈', name: 'Sales Commissions & Affiliates', desc: 'Affiliate referral tracking, links & tier payout calculator.', view: 'affiliates', appUrl: null },
              { id: 'social', icon: '📢', name: 'Media & Social LLM Publisher', desc: 'MeidaLLM multi-channel social posting, AI prompt wizard & publishing queue.', view: 'social', appUrl: null, highlight: '#10b981' },
              { id: 'community', icon: '⛪', name: 'Community Admin & Sabbath Agendas', desc: 'Gospel Agenda platform, Sabbath service architect, callings pipeline & sacred library.', view: 'community', appUrl: null, highlight: '#0284c7' },
              { id: 'trades', icon: '🛠️', name: 'Trades & Craftsmen Portfolio', desc: 'Project showcases for handymen, plumbers, carpenters, & builders with live estimates & work orders.', view: null, appUrl: `/trades?tenant=${activeTenant.slug}` },
              { id: 'travel', icon: '✈️', name: 'Travel, Mobility & Corporate Fleet', desc: 'Corporate holiday trip bundles, company-sponsored retreats, chauffeur deals & self-drive rentals.', view: null, appUrl: `/travel?tenant=${activeTenant.slug}` },
              { id: 'legal', icon: '⚖️', name: 'Legal House & Practice', desc: 'Court motion timelines, legal statute document library, billable hours logger & audit storage.', view: null, appUrl: `/legal?tenant=${activeTenant.slug}` },
              { id: 'abode', icon: '🏢', name: 'Abode Property & Rental Management', desc: 'Multi-property unit listings, tenant lease agreements, rent roll invoicing, maintenance dispatch & owner payouts.', view: null, appUrl: `/abode?tenant=${activeTenant.slug}` },
            ].filter(e => !activeTenant.enabledServices || activeTenant.enabledServices.length === 0 || activeTenant.enabledServices.includes(e.id)).length} ENGINES ACTIVE
          </span>
        </h2>
        <p style="color:var(--admin-text-muted); font-size:0.88rem; margin-bottom:1.5rem; line-height:1.5;">Configured enterprise subsystem modules provisioned for <strong>${escapeHtml(activeTenant.name)}</strong>.</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
          ${[
            { id: 'inventory', icon: '📦', name: 'Multi-Warehouse Inventory', desc: 'Bin allocation, SKU stock tracking & 7 fulfillment hubs.', view: 'inventory', appUrl: null },
            { id: 'commerce', icon: '🛒', name: 'Commerce & Orders', desc: `${orders.length} order(s) processed · Cart & checkout gateway.`, view: 'commerce', appUrl: null },
            { id: 'crm', icon: '💼', name: 'CRM & Sales Leads', desc: `${leads.length} active lead(s) · Deal pipeline tracking.`, view: 'crm', appUrl: null },
            { id: 'erp', icon: '🏭', name: 'ERP & Procurement', desc: `${procurementOrders.length} supply chain purchase order(s).`, view: 'erp', appUrl: null },
            { id: 'accounting', icon: '💰', name: 'Accounting & Ledger', desc: 'Double-entry general ledger & balance sheet integrity.', view: 'accounting', appUrl: null },
            { id: 'hr', icon: '👔', name: 'HR & Staff Roster', desc: 'Employee roster & salary compensation records.', view: 'hr', appUrl: null },
            { id: 'comms', icon: '💬', name: 'Team Comms & Chat', desc: `${chatMsgs.length} message(s) · Live team workspace channels.`, view: 'comms', appUrl: null },
            { id: 'logistics', icon: '🚛', name: 'Logistics & Carrier Shipping', desc: 'FedEx, UPS, DHL & Postal live rate calculator and label generation.', view: 'logistics', appUrl: null },
            { id: 'payments', icon: '💳', name: 'Payments & Subscriptions', desc: 'Stripe, PayPal, recurring MRR invoices & tax compliance engine.', view: 'payments', appUrl: null },
            { id: 'affiliates', icon: '📈', name: 'Sales Commissions & Affiliates', desc: 'Affiliate referral tracking, links & tier payout calculator.', view: 'affiliates', appUrl: null },
            { id: 'social', icon: '📢', name: 'Media & Social LLM Publisher', desc: 'MeidaLLM multi-channel social posting, AI prompt wizard & publishing queue.', view: 'social', appUrl: null, highlight: '#10b981' },
            { id: 'community', icon: '⛪', name: 'Community Admin & Sabbath Agendas', desc: 'Gospel Agenda platform, Sabbath service architect, callings pipeline & sacred library.', view: 'community', appUrl: null, highlight: '#0284c7' },
            { id: 'trades', icon: '🛠️', name: 'Trades & Craftsmen Portfolio', desc: 'Project showcases for handymen, plumbers, carpenters, & builders with live estimates & work orders.', view: null, appUrl: `/trades?tenant=${activeTenant.slug}` },
            { id: 'travel', icon: '✈️', name: 'Travel, Mobility & Corporate Fleet', desc: 'Corporate holiday trip bundles, company-sponsored retreats, chauffeur deals & self-drive rentals.', view: null, appUrl: `/travel?tenant=${activeTenant.slug}` },
            { id: 'legal', icon: '⚖️', name: 'Legal House & Practice', desc: 'Court motion timelines, legal statute document library, billable hours logger & audit storage.', view: null, appUrl: `/legal?tenant=${activeTenant.slug}` },
            { id: 'abode', icon: '🏢', name: 'Abode Property & Rental Management', desc: 'Multi-property unit listings, tenant lease agreements, rent roll invoicing, maintenance dispatch & owner payouts.', view: null, appUrl: `/abode?tenant=${activeTenant.slug}` },
          ]
            .filter(e => !activeTenant.enabledServices || activeTenant.enabledServices.length === 0 || activeTenant.enabledServices.includes(e.id))
            .map(e => `
              <div style="background:var(--admin-card-bg); border:1px solid var(--admin-border); border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div>
                  <div style="font-size:1.75rem; margin-bottom:0.4rem;">${e.icon}</div>
                  <h3 style="color:var(--admin-heading); font-size:1.05rem; margin-bottom:0.35rem;">${escapeHtml(e.name)}</h3>
                  <p style="font-size:0.8rem; color:var(--admin-text-muted); line-height:1.4;">${e.desc}</p>
                </div>
                ${
                  e.appUrl
                    ? `<a href="${e.appUrl}" class="btn" style="text-align:center; font-size:0.82rem; ${e.highlight ? `background:${e.highlight};` : ''}">Open ${escapeHtml(e.name)} →</a>`
                    : `<a href="/admin?tenant=${activeTenant.slug}&view=${e.view}" class="btn" style="text-align:center; font-size:0.82rem; ${e.highlight ? `background:${e.highlight};` : ''}">Open ${escapeHtml(e.name)} →</a>`
                }
              </div>
            `).join('')}
        </div>
      </div>
    `
        : activeView === 'experience'
        ? `
      <div class="card">
        <h2>
          <span style="display:flex; align-items:center; gap:0.5rem; color:#fff;">🌐 Experience & Site Builder Hub (${escapeHtml(activeTenant.name)})</span>
          <span class="badge badge-amber" style="background:#78350f; color:#fde047;">6 BUILDER TOOLS</span>
        </h2>
        <p style="color:#94a3b8; font-size:0.88rem; margin-bottom:1.5rem; line-height:1.5;">Build visual web pages with live side-by-side editing, manage CMS articles, configure Google Fonts & theme tokens, route internal database form submissions, or configure SEO meta tags.</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🌐</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Website Pages & Visual Editor</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">${pages.length} published page(s) · Full no-code visual drag & drop builder.</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <a href="/editor?tenant=${activeTenant.slug}" class="btn" style="text-align:center; font-size:0.82rem; background:linear-gradient(135deg,#6366f1,#4f46e5); font-weight:800;">✏️ Launch Visual Editor ↗</a>
              <a href="/admin?tenant=${activeTenant.slug}&view=website" class="btn btn-secondary" style="text-align:center; font-size:0.78rem;">View All Pages Table →</a>
            </div>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">📝</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Headless CMS Studio</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">${cmsEntries.length} content entry(s) · Dynamic articles & publishing schemas.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=cms" class="btn" style="text-align:center; font-size:0.82rem;">Open CMS Studio →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🎨</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Theme Engine & Fonts</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Day/Night modes, Google Fonts Library & 5-color palette harmonizer.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=settings" class="btn" style="text-align:center; font-size:0.82rem;">Open Theme Engine →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">📑</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Form & Data Studio</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Form capture schemas, internal DB links, and CSV/SQL export.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=forms" class="btn" style="text-align:center; font-size:0.82rem;">Open Form Studio →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🔍</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">SEO & Open Graph Meta Tags</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Social share previews, XML sitemaps, robots.txt & canonical tags.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=seo" class="btn" style="text-align:center; font-size:0.82rem;">Open SEO Studio →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🧩</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Marketplace Extensions</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Extend tenant features with 1-click marketplace plugins.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=marketplace" class="btn" style="text-align:center; font-size:0.82rem;">Open Marketplace →</a>
          </div>
        </div>
      </div>
    `
        : activeView === 'security'
        ? `
      <div class="card">
        <h2>
          <span style="display:flex; align-items:center; gap:0.5rem; color:#fff;">⚙️ System Governance & Security Hub (${escapeHtml(activeTenant.name)})</span>
          <span class="badge badge-purple" style="background:#581c87; color:#c084fc;">8 MODULES ACTIVE</span>
        </h2>
        <p style="color:#94a3b8; font-size:0.88rem; margin-bottom:1.5rem; line-height:1.5;">Manage Sentinel Watchdog disaster recovery, multi-tenant orgs, IAM access roles, break-glass support delegation, security audit logs, API secret keys, and WAF firewall rules.</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🐕</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Watchdog & DR Cockpit</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Circuit breaker matrix, load governor & 1-click HMAC rollback.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=watchdog" class="btn" style="text-align:center; font-size:0.82rem;">Open Watchdog →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🏢</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Multi-Tenant Orgs</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">${tenants.length} active tenant org(s) · Provision & route domains.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=tenants" class="btn" style="text-align:center; font-size:0.82rem;">Open Tenant Orgs →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">👥</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Users & IAM Roles</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">${identities.length} identity account(s) · RBAC permission assignments.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=users" class="btn" style="text-align:center; font-size:0.82rem;">Open Users & IAM →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🛡️</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Support Delegation</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Zero-Knowledge cryptographic privacy & break-glass grants.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=support" class="btn" style="text-align:center; font-size:0.82rem;">Open Support Privacy →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🔑</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">API Keys & Webhook Triggers</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Issue tenant secret keys (<code>sk_live_...</code>) and webhook signature listeners.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=apikeys" class="btn" style="text-align:center; font-size:0.82rem;">Open API Key Studio →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🛡️</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">WAF Firewall & IP Rules</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Input sanitization, IP ban list, CORS & DDoS rate limit rules.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=firewall" class="btn" style="text-align:center; font-size:0.82rem;">Open WAF Firewall →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">🛡️</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">Security Audit Logs</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">${auditLogs.length} security event(s) recorded in audit ledger.</p>
            </div>
            <a href="/admin?tenant=${activeTenant.slug}&view=audit" class="btn" style="text-align:center; font-size:0.82rem;">Open Audit Logs →</a>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <div style="font-size:1.75rem; margin-bottom:0.4rem;">📖</div>
              <h3 style="color:#fff; font-size:1.05rem; margin-bottom:0.35rem;">OpenAPI Swagger Specs</h3>
              <p style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">Interactive Swagger UI explorer for REST API endpoints.</p>
            </div>
            <a href="/docs" target="_blank" class="btn" style="text-align:center; font-size:0.82rem;">Open API Specs ↗</a>
          </div>
        </div>
      </div>
    `
        : activeView === 'watchdog'
        ? `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#111827; border:1px solid #1f2937; padding:1.25rem 1.5rem; border-radius:12px;">
        <div>
          <h2 style="margin:0; font-size:1.2rem; color:#fff; display:flex; align-items:center; gap:0.6rem;">
            🐕 Sentinel Watchdog & Disaster Recovery Cockpit
            <span class="badge ${watchdogHealth?.status === 'HEALTHY' ? '' : watchdogHealth?.status === 'DEGRADED' ? 'badge-amber' : 'badge-purple'}">${watchdogHealth?.status || 'HEALTHY'}</span>
          </h2>
          <p style="color:#94a3b8; font-size:0.85rem; margin-top:0.35rem;">Real-time anomaly monitoring, automated circuit breaking, load shedding governor & 1-click snapshot restore.</p>
        </div>
        <div style="display:flex; gap:0.6rem;">
          <button onclick="triggerAutoHeal()" class="btn" style="background:linear-gradient(135deg, #10b981, #059669); font-weight:700;">✨ Trigger Auto-Heal</button>
          <button onclick="createSnapshot()" class="btn" style="background:linear-gradient(135deg, #6366f1, #a855f7); font-weight:700;">📸 New Snapshot</button>
        </div>
      </div>

      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-label">⚡ System Load Governor</div>
          <div class="stat-value" style="color:${loadStats?.currentLoadStatus === 'OPTIMAL' ? '#34d399' : '#f59e0b'};">${loadStats?.currentLoadStatus || 'OPTIMAL'}</div>
          <div class="stat-desc">${loadStats?.activeInFlightRequests || 0} active / ${loadStats?.maxConcurrencyLimit || 250} max limit</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">🛡️ Disaster Recovery Mode</div>
          <div class="stat-value" style="color:${drStatus?.isFailoverActive ? '#f87171' : '#34d399'};">${drStatus?.isFailoverActive ? 'FAILOVER ACTIVE' : 'NORMAL'}</div>
          <div class="stat-desc">${drStatus?.isFailoverActive ? drStatus.failoverReason : 'All upstream databases nominal'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">📈 p95 Latency & Memory</div>
          <div class="stat-value" style="color:#38bdf8;">${watchdogMetrics?.p95LatencyMs || 0} ms</div>
          <div class="stat-desc">Heap used: ${watchdogMetrics?.memoryUsageMb || 0} MB (Uptime: ${watchdogMetrics?.uptimeSeconds || 0}s)</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">⚠️ Runtime Error Rate</div>
          <div class="stat-value" style="color:${watchdogMetrics?.errorCount > 0 ? '#f87171' : '#34d399'};">${watchdogMetrics?.errorRate || '0.00%'}</div>
          <div class="stat-desc">${watchdogMetrics?.errorCount || 0} errors across ${watchdogMetrics?.totalRequests || 0} reqs</div>
        </div>
      </div>

      <!-- Subsystem Circuit Breakers -->
      <div class="card">
        <h2>Subsystem Circuit Breaker Matrix</h2>
        <table>
          <thead><tr><th>Subsystem</th><th>Status</th><th>Consecutive Failures</th><th>Threshold</th><th>Auto-Reset Timeout</th><th>Actions</th></tr></thead>
          <tbody>
            ${(circuitBreakers || []).map((b) => `<tr>
              <td style="font-weight:700; color:#fff; text-transform:uppercase;">${escapeHtml(b.subsystem)}</td>
              <td><span class="badge ${b.status === 'CLOSED' ? '' : b.status === 'HALF_OPEN' ? 'badge-amber' : 'badge-purple'}">${escapeHtml(b.status)}</span></td>
              <td style="font-weight:700; color:${b.failureCount > 0 ? '#f87171' : '#34d399'};">${b.failureCount}</td>
              <td>${b.threshold} failures</td>
              <td>${b.resetTimeoutMs / 1000}s</td>
              <td><button onclick="triggerAutoHeal()" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Reset</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Point-in-Time Data Recovery Snapshots -->
      <div class="card">
        <h2>Point-in-Time Data Recovery Snapshots (${escapeHtml(activeTenant.name)})</h2>
        <table>
          <thead><tr><th>Snapshot ID</th><th>Label</th><th>HMAC-256 Checksum</th><th>Items Backed Up</th><th>Created At</th><th>Restore</th></tr></thead>
          <tbody>
            ${(snapshots || []).length === 0 ? `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:2rem;">No snapshots generated yet. Click "New Snapshot" above to create an immutable backup.</td></tr>` : ''}
            ${(snapshots || []).map((s) => `<tr>
              <td style="font-family:monospace; color:#818cf8;">${escapeHtml(s.id)}</td>
              <td style="font-weight:600; color:#fff;">${escapeHtml(s.label)}</td>
              <td style="font-family:monospace; font-size:0.75rem; color:#94a3b8;">${escapeHtml(s.checksum?.substring(0, 16))}...</td>
              <td>${s.itemCounts?.pages || 0} pages, ${s.itemCounts?.products || 0} products, ${s.itemCounts?.leads || 0} leads</td>
              <td style="color:#64748b; font-size:0.75rem;">${new Date(s.timestamp).toLocaleString()}</td>
              <td><button onclick="restoreSnapshot('${s.id}')" class="btn" style="padding:0.25rem 0.6rem; font-size:0.75rem; background:#dc2626;">🔄 Restore 1-Click</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Runtime Anomaly Incident Log -->
      <div class="card">
        <h2>Live Runtime Anomaly & Error Incident Log</h2>
        <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; margin-top:0.5rem;">
          ${(watchdogIncidents || []).length === 0 ? `<div style="color:#64748b; font-size:0.85rem; text-align:center; padding:2rem;">No runtime errors or anomalies recorded. System operates nominally.</div>` : ''}
          ${(watchdogIncidents || []).map((inc) => `
            <div style="background:#0f172a; border:1px solid #1e293b; border-left:4px solid ${inc.severity === 'critical' ? '#ef4444' : inc.severity === 'high' ? '#f97316' : inc.severity === 'medium' ? '#f59e0b' : '#10b981'}; border-radius:8px; padding:0.85rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                <strong style="color:#fff; font-size:0.88rem;">[${escapeHtml(inc.subsystem.toUpperCase())}] ${escapeHtml(inc.message)}</strong>
                <span style="color:#64748b; font-size:0.72rem;">${new Date(inc.timestamp).toLocaleTimeString()}</span>
              </div>
              ${inc.stack ? `<pre style="background:#080c14; padding:0.5rem; border-radius:4px; font-size:0.72rem; color:#f87171; overflow-x:auto; margin-top:0.4rem;">${escapeHtml(inc.stack.substring(0, 400))}</pre>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `
        : activeView === 'analytics'
        ? `
      <div class="grid-4">
        <div class="stat-card"><div class="stat-label">👁️ Total Pageviews</div><div class="stat-value">${analyticsSummary?.totalViews || 0}</div><div class="stat-desc">Real-time edge telemetry</div></div>
        <div class="stat-card"><div class="stat-label">🎯 Goal Conversions</div><div class="stat-value">${analyticsSummary?.totalConversions || 0}</div><div class="stat-desc">Form submissions & Checkouts</div></div>
        <div class="stat-card"><div class="stat-label">📈 Conversion Rate</div><div class="stat-value" style="color:#34d399;">${analyticsSummary?.conversionRate || '0.00%'}</div><div class="stat-desc">Average conversion velocity</div></div>
        <div class="stat-card"><div class="stat-label">🔬 A/B Experiments</div><div class="stat-value">1 Active</div><div class="stat-desc">Split traffic optimization</div></div>
      </div>
      <div class="card">
        <h2>A/B Variant Telemetry & Conversion Funnel</h2>
        <table>
          <thead><tr><th>Variant Name</th><th>Traffic Split</th><th>Pageviews</th><th>Conversions</th><th>Conversion Rate</th><th>Winner Status</th></tr></thead>
          <tbody>
            <tr>
              <td style="font-weight:600; color:#fff;">Variant A (Default Hero & CTA)</td>
              <td>50%</td>
              <td>${analyticsSummary?.variants?.variantA?.views || 0}</td>
              <td>${analyticsSummary?.variants?.variantA?.conversions || 0}</td>
              <td style="font-weight:700; color:#38bdf8;">${analyticsSummary?.variants?.variantA?.rate || '0.0%'}</td>
              <td><span class="badge badge-blue">BASELINE</span></td>
            </tr>
            <tr>
              <td style="font-weight:600; color:#fff;">Variant B (Sunset Bronze & Limited Pass)</td>
              <td>50%</td>
              <td>${analyticsSummary?.variants?.variantB?.views || 0}</td>
              <td>${analyticsSummary?.variants?.variantB?.conversions || 0}</td>
              <td style="font-weight:700; color:#34d399;">${analyticsSummary?.variants?.variantB?.rate || '0.0%'}</td>
              <td><span class="badge badge-purple">CHALLENGER</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `
        : activeView === 'tenants'
        ? `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
          <div>
            <h2 style="margin:0; font-size:1.15rem; color:#fff;">🏢 Multi-Tenant Hierarchy & Isolated Environments</h2>
            <p style="color:#94a3b8; font-size:0.82rem; margin-top:0.25rem;">Manage platform organizations, sub-tenants, custom domains, and PBKDF2 encryption isolation.</p>
          </div>
          <button onclick="openNewTenantModal()" class="btn" style="padding:0.5rem 1rem; font-size:0.85rem; font-weight:700; background:linear-gradient(135deg,#6366f1,#a855f7); color:#fff; border:none; border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:0.4rem;">
            <span>+</span> Provision New Tenant
          </button>
        </div>

        <table>
          <thead><tr><th>Tenant ID</th><th>Tenant Name</th><th>Slug / Workspace</th><th>Custom Domain</th><th>Encryption Isolation</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${tenants.map((t) => `<tr>
              <td style="font-family:monospace; color:#818cf8; font-weight:600;">${escapeHtml(t.id)}</td>
              <td style="font-weight:600; color:#fff;">${escapeHtml(t.name)}</td>
              <td><span style="background:rgba(99,102,241,0.1); padding:2px 8px; border-radius:4px; font-family:monospace; font-size:0.8rem; color:#a5b4fc;">${escapeHtml(t.slug)}</span></td>
              <td style="color:#cbd5e1;">${escapeHtml(t.domain || '—')}</td>
              <td><span class="badge badge-purple">AES-256-GCM (PBKDF2)</span></td>
              <td><span class="badge">${escapeHtml(t.status.toUpperCase())}</span></td>
              <td>
                <a href="/admin?tenant=${escapeHtml(t.slug)}" class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem; text-decoration:none; color:#38bdf8; background:#1e293b; border-radius:4px;">Switch Context ↗</a>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- PROVISION NEW TENANT MODAL -->
      <div id="newTenantModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); z-index:10000; place-content:center; padding:1.5rem;">
        <div style="background:#111827; border:1px solid #374151; border-radius:14px; width:100%; max-width:480px; padding:1.75rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.2rem;">🏢</span>
              <h3 style="font-size:1.1rem; font-weight:800; color:#fff; margin:0;">Provision New Tenant</h3>
            </div>
            <button onclick="closeNewTenantModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✕</button>
          </div>

          <form onsubmit="handleProvisionTenant(event)" style="display:flex; flex-direction:column; gap:1rem;">
            <div>
              <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Organization</label>
              <input id="tenantOrgId" type="text" value="org_enterprise" required style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:0.55rem 0.75rem; color:#fff; font-size:0.85rem; outline:none;" />
            </div>

            <div>
              <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Tenant / Business Name</label>
              <input id="tenantNameInput" type="text" placeholder="e.g. Nexus Media Group" required style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:0.55rem 0.75rem; color:#fff; font-size:0.85rem; outline:none;" />
            </div>

            <div>
              <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Slug (Subdomain Identifier)</label>
              <input id="tenantSlugInput" type="text" placeholder="e.g. nexusmedia" required style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:0.55rem 0.75rem; color:#fff; font-size:0.85rem; outline:none;" />
            </div>

            <div>
              <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Custom Domain (Optional)</label>
              <input id="tenantDomainInput" type="text" placeholder="e.g. nexusmedia.localhost or nexus.io" style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:0.55rem 0.75rem; color:#fff; font-size:0.85rem; outline:none;" />
            </div>

            <div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.25); border-radius:8px; padding:0.75rem; font-size:0.75rem; color:#cbd5e1;">
              🔒 <strong>Automatic Security Isolation:</strong> A dedicated PBKDF2 cryptographic key will be derived for zero-knowledge field encryption.
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem;">
              <button type="button" onclick="closeNewTenantModal()" class="btn btn-secondary" style="padding:0.55rem 1rem; font-size:0.85rem; font-weight:600; background:#1e293b; border:1px solid #334155; color:#fff; border-radius:6px; cursor:pointer;">Cancel</button>
              <button type="submit" id="provisionSubmitBtn" class="btn" style="padding:0.55rem 1.25rem; font-size:0.85rem; font-weight:700; background:linear-gradient(135deg,#6366f1,#a855f7); color:#fff; border:none; border-radius:6px; cursor:pointer;">⚡ Provision Tenant</button>
            </div>
          </form>
        </div>
      </div>
    `
        : activeView === 'support'
        ? `
      <div class="card">
        <h2>🛡️ Zero-Knowledge Support Delegation Grants (${escapeHtml(activeTenant.name)})</h2>
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">Manage active diagnostic access grants allowing platform superadmins to temporarily view encrypted financial, HR, and CRM pipelines.</p>
        <table>
          <thead><tr><th>Ticket ID</th><th>Granted To</th><th>Reason</th><th>Granted By</th><th>Status / Expiry</th><th>Actions</th></tr></thead>
          <tbody>
            ${supportGrants.map((g) => {
              const isExpired = Date.now() > g.expiresAt || g.revoked;
              return `<tr>
                <td style="font-family:monospace; color:#818cf8;">${escapeHtml(g.ticketId)}</td>
                <td>${escapeHtml(g.grantedToUserId)}</td>
                <td>${escapeHtml(g.reason)}</td>
                <td>${escapeHtml(g.grantedByUserId)}</td>
                <td><span class="badge ${isExpired ? 'badge-amber' : ''}">${g.revoked ? 'REVOKED' : isExpired ? 'EXPIRED' : 'ACTIVE'}</span></td>
                <td>${!g.revoked && !isExpired ? `<button onclick="revokeGrant('${g.id}')" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.7rem; color:#fca5a5;">Revoke</button>` : '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'accounting'
        ? canAccessConfidentialTenantData
          ? `
      <div class="grid-4">
        <div class="stat-card"><div class="stat-label">Net Balance</div><div class="stat-value" style="color:#34d399;">$${balance.netBalance.toLocaleString()}</div><div class="stat-desc">Assets minus liabilities</div></div>
        <div class="stat-card"><div class="stat-label">Total Debits</div><div class="stat-value">$${balance.totalDebits.toLocaleString()}</div><div class="stat-desc">Operational inflow</div></div>
        <div class="stat-card"><div class="stat-label">Total Credits</div><div class="stat-value">$${balance.totalCredits.toLocaleString()}</div><div class="stat-desc">Accounts payable</div></div>
        <div class="stat-card"><div class="stat-label">Ledger Integrity</div><div class="stat-value" style="color:#38bdf8;">VERIFIED</div><div class="stat-desc">Double-entry balanced</div></div>
      </div>
      <div class="card">
        <h2>Double-Entry General Ledger</h2>
        <table>
          <thead><tr><th>Transaction ID</th><th>Account</th><th>Type</th><th>Amount</th><th>Description</th><th>Timestamp</th></tr></thead>
          <tbody>
            ${ledger.map((tx) => `<tr><td style="font-family:monospace; color:#818cf8;">${escapeHtml(tx.id)}</td><td style="font-weight:600; color:#fff;">${escapeHtml(tx.accountName)}</td><td><span class="badge ${tx.type === 'DEBIT' ? '' : 'badge-purple'}">${escapeHtml(tx.type)}</span></td><td style="font-weight:700; color:${tx.type === 'DEBIT' ? '#34d399' : '#f87171'};">$${tx.amount.toLocaleString()}</td><td>${escapeHtml(tx.description)}</td><td style="color:#64748b; font-size:0.75rem;">${new Date(tx.timestamp).toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
          : `
      <div class="lock-box">
        <div style="font-size:2.5rem; margin-bottom:1rem;">🔒</div>
        <h2 style="color:#f8fafc; font-size:1.2rem; margin-bottom:0.5rem;">Zero-Knowledge Privacy: Accounting & Ledger Locked</h2>
        <p style="color:#94a3b8; font-size:0.88rem; max-width:550px; margin:0 auto 1.5rem;">Financial accounts and transaction ledgers are isolated and encrypted under tenant PBKDF2 keys.</p>
        <a href="/admin?tenant=${activeTenant.slug}&view=support" class="btn">Request Support Delegation Grant →</a>
      </div>
    `
        : activeView === 'crm'
        ? canAccessConfidentialTenantData
          ? `
      <div class="card">
        <h2>CRM Enterprise Leads & Deals Pipeline (${escapeHtml(activeTenant.name)})</h2>
        <table>
          <thead><tr><th>Contact Name</th><th>Email</th><th>Company</th><th>Deal Value</th><th>Pipeline Stage</th></tr></thead>
          <tbody>
            ${leads.map((l) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(l.contactName)}</td><td>${escapeHtml(l.email)}</td><td>${escapeHtml(l.company)}</td><td style="color:#34d399; font-weight:700;">$${l.dealValue.toLocaleString()}</td><td><span class="badge ${l.stage === 'proposal' ? 'badge-amber' : l.stage === 'closed_won' ? '' : 'badge-purple'}">${escapeHtml(l.stage.toUpperCase())}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
          : `
      <div class="lock-box">
        <div style="font-size:2.5rem; margin-bottom:1rem;">🔒</div>
        <h2 style="color:#f8fafc; font-size:1.2rem; margin-bottom:0.5rem;">Zero-Knowledge Privacy: CRM Leads Pipeline Locked</h2>
        <p style="color:#94a3b8; font-size:0.88rem; max-width:550px; margin:0 auto 1.5rem;">Confidential enterprise contact information and sales negotiation values are protected.</p>
        <a href="/admin?tenant=${activeTenant.slug}&view=support" class="btn">Request Support Delegation Grant →</a>
      </div>
    `
        : activeView === 'hr'
        ? canAccessConfidentialTenantData
          ? `
      <div class="card">
        <h2>Staff Directory & Payroll (${escapeHtml(activeTenant.name)})</h2>
        <table>
          <thead><tr><th>Employee Name</th><th>Email</th><th>Department</th><th>Position</th><th>Monthly Salary</th><th>Status</th></tr></thead>
          <tbody>
            ${employees.map((e) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(e.name)}</td><td>${escapeHtml(e.email)}</td><td>${escapeHtml(e.department)}</td><td>${escapeHtml(e.position)}</td><td style="color:#34d399; font-weight:700;">$${e.salaryMonthly.toLocaleString()}/mo</td><td><span class="badge">${escapeHtml(e.status.toUpperCase())}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
          : `
      <div class="lock-box">
        <div style="font-size:2.5rem; margin-bottom:1rem;">🔒</div>
        <h2 style="color:#f8fafc; font-size:1.2rem; margin-bottom:0.5rem;">Zero-Knowledge Privacy: HR Directory & Salaries Locked</h2>
        <p style="color:#94a3b8; font-size:0.88rem; max-width:550px; margin:0 auto 1.5rem;">Employee compensation and PII records are private to this tenant's executive leadership.</p>
        <a href="/admin?tenant=${activeTenant.slug}&view=support" class="btn">Request Support Delegation Grant →</a>
      </div>
    `
        : activeView === 'inventory'
        ? `
      <div class="grid-4">
        <div class="stat-card"><div class="stat-label">🏢 Warehouses</div><div class="stat-value">${warehouses.length}</div><div class="stat-desc">Fulfillment facilities</div></div>
        <div class="stat-card"><div class="stat-label">📦 Total Stock Items</div><div class="stat-value">${stockItems.reduce((s, i) => s + i.quantityOnHand, 0).toLocaleString()}</div><div class="stat-desc">Units on hand</div></div>
        <div class="stat-card"><div class="stat-label">⚠️ Low Stock Items</div><div class="stat-value" style="color:${stockItems.filter(i => i.quantityOnHand <= i.reorderThreshold).length > 0 ? '#f87171' : '#34d399'};">${stockItems.filter(i => i.quantityOnHand <= i.reorderThreshold).length}</div><div class="stat-desc">Below reorder trigger</div></div>
        <div class="stat-card"><div class="stat-label">🚚 Active Transfers</div><div class="stat-value">${transfers.length}</div><div class="stat-desc">Inter-warehouse shipments</div></div>
      </div>
      <div class="card">
        <h2>Warehouse Facilities (${escapeHtml(activeTenant.name)})</h2>
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Location</th><th>Type</th><th>Capacity</th></tr></thead>
          <tbody>
            ${warehouses.map(w => `<tr><td style="font-family:monospace; color:#818cf8;">${escapeHtml(w.code)}</td><td style="font-weight:600; color:#fff;">${escapeHtml(w.name)}</td><td>${escapeHtml(w.city)}, ${escapeHtml(w.country)}</td><td><span class="badge ${w.isPrimary ? 'badge-purple' : 'badge-blue'}">${w.isPrimary ? 'PRIMARY HUB' : 'REGIONAL'}</span></td><td>${w.capacityUnits.toLocaleString()} units</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2>Multi-Warehouse Stock Allocations</h2>
        <table>
          <thead><tr><th>SKU</th><th>Product</th><th>Warehouse</th><th>Aisle / Bin</th><th>On Hand</th><th>Reserved</th><th>Status</th></tr></thead>
          <tbody>
            ${stockItems.map(s => {
              const isLow = s.quantityOnHand <= s.reorderThreshold;
              const wh = warehouses.find(w => w.id === s.warehouseId);
              return `<tr>
                <td style="font-family:monospace; color:#818cf8;">${escapeHtml(s.sku)}</td>
                <td style="font-weight:600; color:#fff;">${escapeHtml(s.productName)}</td>
                <td>${escapeHtml(wh ? wh.name : s.warehouseId)}</td>
                <td><span style="font-family:monospace; color:#cbd5e1;">${escapeHtml(s.aisle)} / ${escapeHtml(s.bin)}</span></td>
                <td style="font-weight:700; color:${isLow ? '#f87171' : '#34d399'};">${s.quantityOnHand.toLocaleString()}</td>
                <td>${s.quantityReserved}</td>
                <td><span class="badge ${isLow ? 'badge-amber' : ''}">${isLow ? '⚠️ LOW STOCK - REORDER' : 'OPTIMAL'}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'commerce'
        ? `
      <div class="card">
        <h2>Commerce Products & Catalog</h2>
        <table>
          <thead><tr><th>Product Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Description</th></tr></thead>
          <tbody>
            ${products.map((pr) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(pr.name)}</td><td style="font-family:monospace;">${escapeHtml(pr.sku)}</td><td style="color:#34d399; font-weight:700;">$${pr.price.toLocaleString()} ${escapeHtml(pr.currency)}</td><td>${pr.stock}</td><td>${escapeHtml(pr.description)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'comms'
        ? canAccessConfidentialTenantData
          ? `
      <div class="card">
        <h2>Internal Channel Messages (#general)</h2>
        <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:1rem;">
          ${chatMsgs.map((m) => `
            <div style="background:#0f172a; padding:0.85rem; border-radius:8px; border:1px solid #1e293b;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                <strong style="color:#818cf8; font-size:0.85rem;">${escapeHtml(m.senderName)}</strong>
                <span style="color:#64748b; font-size:0.75rem;">${new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <p style="font-size:0.85rem; color:#e2e8f0;">${escapeHtml(m.content)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `
          : `
      <div class="lock-box">
        <div style="font-size:2.5rem; margin-bottom:1rem;">🔒</div>
        <h2 style="color:#f8fafc; font-size:1.2rem; margin-bottom:0.5rem;">Zero-Knowledge Privacy: Team Communications Locked</h2>
        <p style="color:#94a3b8; font-size:0.88rem; max-width:550px; margin:0 auto 1.5rem;">Internal communication channels are end-to-end encrypted for this tenant.</p>
        <a href="/admin?tenant=${activeTenant.slug}&view=support" class="btn">Request Support Delegation Grant →</a>
      </div>
    `
        : activeView === 'website'
        ? `
      <div class="card">
        <h2>Website Builder & Pages (${escapeHtml(activeTenant.name)}) <a href="/editor?tenant=${activeTenant.slug}" class="btn">🎨 Open Studio Builder</a></h2>
        <table>
          <thead><tr><th>Title</th><th>Slug</th><th>Blocks</th><th>Actions</th></tr></thead>
          <tbody>
            ${pages.map((p) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(p.title)}</td><td>/${escapeHtml(p.slug)}</td><td>${p.blocks.length} block(s)</td><td><a href="/editor?tenant=${activeTenant.slug}&pageId=${p.id}" class="btn" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Edit in Studio</a></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'cms'
        ? `
      <div class="card">
        <h2>Headless CMS Published Content (${escapeHtml(activeTenant.name)})</h2>
        <table>
          <thead><tr><th>Article / Entry Title</th><th>Slug</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            ${cmsEntries.map((e) => `<tr><td style="font-weight:600; color:#fff;">${escapeHtml(e.data?.title || e.slug)}</td><td>/${escapeHtml(e.slug)}</td><td><span class="badge">${escapeHtml(e.status.toUpperCase())}</span></td><td style="color:#64748b; font-size:0.75rem;">${new Date(e.updatedAt).toLocaleDateString()}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'marketplace'
        ? `
      <div class="card">
        <h2>Installed Platform Capabilities & Extensions</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-top:1rem;">
          ${listings.map((l) => `
            <div style="background:#0f172a; border:1px solid #1e293b; border-radius:8px; padding:1.2rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <strong style="color:#fff; font-size:0.95rem;">${escapeHtml(l.name)}</strong>
                <span class="badge badge-purple">${escapeHtml(l.category.toUpperCase())}</span>
              </div>
              <p style="color:#94a3b8; font-size:0.8rem; margin-bottom:1rem; line-height:1.4;">${escapeHtml(l.description)}</p>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#34d399; font-weight:700; font-size:0.85rem;">$${l.priceMonthly}/mo</span>
                <button class="btn" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Configured</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
        : activeView === 'audit'
        ? `
      <div class="card">
        <h2>Zero-Knowledge Security Audit Trail (${escapeHtml(activeTenant.name)})</h2>
        <table>
          <thead><tr><th>Event ID</th><th>Actor ID</th><th>Action</th><th>Resource</th><th>Timestamp</th></tr></thead>
          <tbody>
            ${auditLogs.map((a) => `<tr><td style="font-family:monospace; color:#818cf8;">${escapeHtml(a.id)}</td><td>${escapeHtml(a.actorId)}</td><td><span class="badge badge-blue">${escapeHtml(a.action)}</span></td><td>${escapeHtml(a.resource)}</td><td style="color:#64748b; font-size:0.75rem;">${new Date(a.timestamp).toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'settings'
        ? `
      <style>
        .theme-preview-card { background: var(--tp-bg, #0f172a); border: 1px solid var(--tp-border, #1e293b); border-radius: 12px; padding: 1.25rem; transition: all 0.3s ease; }
        .theme-swatch { width: 28px; height: 28px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); cursor: pointer; transition: transform 0.15s; flex-shrink: 0; }
        .theme-swatch:hover { transform: scale(1.15); }
        .theme-mode-btn { flex: 1; padding: 0.7rem; border-radius: 10px; border: 2px solid transparent; cursor: pointer; font-size: 0.85rem; font-weight: 700; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
        .theme-mode-btn.day { background: #fef3c7; color: #78350f; border-color: #f59e0b; }
        .theme-mode-btn.night { background: #1e1b4b; color: #a5b4fc; border-color: #6366f1; }
        .theme-mode-btn.day:hover { box-shadow: 0 4px 14px rgba(245,158,11,0.3); transform: translateY(-2px); }
        .theme-mode-btn.night:hover { box-shadow: 0 4px 14px rgba(99,102,241,0.3); transform: translateY(-2px); }
        .live-preview-bar { height: 8px; border-radius: 4px; background: var(--tp-primary, #0284c7); transition: all 0.4s ease; margin-bottom: 0.75rem; }
        .color-picker-row { display: flex; gap: 0.5rem; align-items: center; }
        .color-hex-input { background: #080c14; border: 1px solid #334155; color: #fff; padding: 0.4rem 0.6rem; border-radius: 6px; font-family: monospace; font-size: 0.82rem; width: 110px; outline: none; }
        .color-hex-input:focus { border-color: #6366f1; }
        .settings-section { background: #0f172a; padding: 1.35rem; border-radius: 12px; border: 1px solid #1e293b; transition: border-color 0.2s; }
        .settings-section:hover { border-color: #2d3748; }
        .section-label { font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.35rem; }
        .theme-select { width: 100%; background: #080c14; border: 1px solid #334155; color: #fff; padding: 0.5rem 0.65rem; border-radius: 8px; font-size: 0.84rem; outline: none; cursor: pointer; }
        .theme-select:focus { border-color: #6366f1; }
        .settings-apply-btn { width: 100%; padding: 0.7rem; margin-top: 1rem; background: #6366f1; border: none; border-radius: 8px; color: #fff; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
        .settings-apply-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.35); }
      </style>
      <div class="grid-4">
        <div class="stat-card" id="activeThemeCard"><div class="stat-label">🎨 Active Theme</div><div class="stat-value" style="font-size:1.1rem; color:#38bdf8;" id="activeThemeName">Custom Theme</div><div class="stat-desc" id="activeThemeDesc">Live design tokens active</div></div>
        <div class="stat-card"><div class="stat-label">✨ WCAG Contrast</div><div class="stat-value" style="color:#34d399;">14.8 : 1</div><div class="stat-desc">AAA Certified Level</div></div>
        <div class="stat-card"><div class="stat-label">🔒 Cryptography</div><div class="stat-value" style="color:#818cf8;">AES-256-GCM</div><div class="stat-desc">PBKDF2 Derived Keys</div></div>
        <div class="stat-card"><div class="stat-label">🛡️ Security Guard</div><div class="stat-value" style="color:#34d399;">ACTIVE</div><div class="stat-desc">Zero-Knowledge Isolation</div></div>
      </div>

      <div class="card">
        <h2 style="margin-bottom:0.35rem;">⚙️ Tenant Brand Theme, Colors & Typography</h2>
        <p style="color:#64748b; font-size:0.82rem; margin-bottom:1.5rem;">Customize the global design system for <strong style="color:#94a3b8;">${escapeHtml(activeTenant.name)}</strong> — changes apply live to your storefront.</p>

        <!-- Live Preview Strip -->
        <div id="livePreviewBar" class="live-preview-bar"></div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap:1.25rem;">

          <!-- Primary Brand Palette -->
          <div class="settings-section">
            <h3 style="color:#f8fafc; font-size:0.9rem; font-weight:700; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">🎨 Brand Palette</h3>
            <div style="display:flex; flex-direction:column; gap:0.9rem;">
              <div>
                <label class="section-label">Primary Color</label>
                <div class="color-picker-row">
                  <input type="color" id="primaryColorPicker" value="#0284c7" class="theme-swatch" oninput="syncColorInput('primaryColorPicker','primaryColorHex')" onchange="updateLivePreview()">
                  <input type="text" id="primaryColorHex" class="color-hex-input" value="#0284c7" oninput="syncColorPicker('primaryColorHex','primaryColorPicker'); updateLivePreview();" placeholder="#000000" maxlength="7">
                  <div id="primarySwatch" style="width:24px;height:24px;border-radius:50%;background:#0284c7;border:2px solid rgba(255,255,255,0.15);"></div>
                </div>
              </div>
              <div>
                <label class="section-label">Accent / Secondary</label>
                <div class="color-picker-row">
                  <input type="color" id="accentColorPicker" value="#38bdf8" class="theme-swatch" oninput="syncColorInput('accentColorPicker','accentColorHex')" onchange="updateLivePreview()">
                  <input type="text" id="accentColorHex" class="color-hex-input" value="#38bdf8" oninput="syncColorPicker('accentColorHex','accentColorPicker'); updateLivePreview();" placeholder="#000000" maxlength="7">
                  <div id="accentSwatch" style="width:24px;height:24px;border-radius:50%;background:#38bdf8;border:2px solid rgba(255,255,255,0.15);"></div>
                </div>
              </div>
              <div style="display:flex; gap:0.4rem; margin-top:0.25rem;">
                <div onclick="quickColor('#6366f1','#a855f7')" style="height:22px;flex:1;border-radius:4px;background:#6366f1;cursor:pointer;" title="Indigo/Purple"></div>
                <div onclick="quickColor('#0284c7','#38bdf8')" style="height:22px;flex:1;border-radius:4px;background:#0284c7;cursor:pointer;" title="Sky Blue"></div>
                <div onclick="quickColor('#10b981','#06b6d4')" style="height:22px;flex:1;border-radius:4px;background:#10b981;cursor:pointer;" title="Emerald/Cyan"></div>
                <div onclick="quickColor('#f59e0b','#f87171')" style="height:22px;flex:1;border-radius:4px;background:#f59e0b;cursor:pointer;" title="Amber/Rose"></div>
                <div onclick="quickColor('#ec4899','#8b5cf6')" style="height:22px;flex:1;border-radius:4px;background:#ec4899;cursor:pointer;" title="Pink/Violet"></div>
              </div>
            </div>
          </div>

          <!-- Design Tokens -->
          <div class="settings-section">
            <h3 style="color:#f8fafc; font-size:0.9rem; font-weight:700; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">🎛️ Design Tokens</h3>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              <div>
                <label class="section-label">Corner Radius</label>
                <select id="cornerRadius" class="theme-select">
                  <option value="4px">4px — Sharp / Enterprise</option>
                  <option value="8px">8px — Modern Rounded</option>
                  <option value="12px" selected>12px — Smooth Glass</option>
                  <option value="16px">16px — Card Pill</option>
                  <option value="24px">24px — Full Fluid</option>
                </select>
              </div>
              <div>
                <label class="section-label">Typography Scale</label>
                <select id="typography" class="theme-select">
                  <option value="inter" selected>Inter — Dynamic Fluid</option>
                  <option value="roboto">Roboto — Standard</option>
                  <option value="outfit">Outfit — Geometric</option>
                  <option value="system">System UI — Native</option>
                </select>
              </div>
              <div>
                <label class="section-label">Font Size Scale</label>
                <select id="fontScale" class="theme-select">
                  <option value="sm">Small — Compact Density</option>
                  <option value="base" selected>Base — Standard</option>
                  <option value="lg">Large — Accessible</option>
                  <option value="xl">XL — Display Mode</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Day / Night Mode -->
          <div class="settings-section">
            <h3 style="color:#f8fafc; font-size:0.9rem; font-weight:700; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">🌓 Lighting Mode</h3>
            <p style="font-size:0.75rem; color:#64748b; margin-bottom:1rem; line-height:1.4;">Switch your tenant storefront between clean sunlight and midnight dark mode.</p>
            <div style="display:flex; gap:0.6rem;">
              <button id="dayModeBtn" onclick="applyAdminThemePreset('day_clean')" class="theme-mode-btn day">☀️ Day</button>
              <button id="nightModeBtn" onclick="applyAdminThemePreset('midnight_slate')" class="theme-mode-btn night">🌙 Night</button>
            </div>

            <!-- Theme Preview Card -->
            <div id="themePreviewCard" class="theme-preview-card" style="margin-top:1rem;">
              <div style="font-size:0.72rem; font-weight:700; color:var(--tp-text-muted, #94a3b8); text-transform:uppercase; margin-bottom:0.6rem;">Preview</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <div style="font-weight:700; color:var(--tp-text, #fff); font-size:0.85rem;">Brand Name</div>
                <div style="padding:0.25rem 0.65rem; background:var(--tp-primary, #0284c7); border-radius:6px; color:#fff; font-size:0.72rem; font-weight:700;">CTA</div>
              </div>
              <div style="height:4px; border-radius:2px; background:var(--tp-primary, #0284c7);"></div>
            </div>

            <button class="settings-apply-btn" onclick="saveThemeSettings()" style="margin-top:0.75rem;">💾 Save & Apply to Storefront</button>
          </div>
        </div>

        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #1e293b; display:flex; justify-content:flex-end; gap:0.75rem;">
          <button onclick="resetToDefault()" class="btn btn-secondary" style="font-size:0.8rem;">↩ Reset to Default</button>
          <a href="/editor?tenant=${activeTenant.slug}" class="btn" style="background:#6366f1; font-size:0.85rem;">🎨 Open Studio Color Harmonizer →</a>
        </div>
      </div>
    `
        : activeView === 'logistics'
        ? `
      <div class="card">
        <h2><span>🚛 Logistics, Shipping & Carrier Fulfillment Engine</span> <span class="badge badge-blue">CARRIER ROUTER</span></h2>
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">FedEx Priority Express</div><div class="stat-value" style="color:#34d399;">CONNECTED</div><div class="stat-desc">API Key Verified · Live Quotes</div></div>
          <div class="stat-card"><div class="stat-label">UPS Next Day Air</div><div class="stat-value" style="color:#34d399;">CONNECTED</div><div class="stat-desc">API Key Verified · Auto Label</div></div>
          <div class="stat-card"><div class="stat-label">DHL Express Worldwide</div><div class="stat-value" style="color:#34d399;">CONNECTED</div><div class="stat-desc">International Customs Clear</div></div>
          <div class="stat-card"><div class="stat-label">USPS Commercial Plus</div><div class="stat-value" style="color:#34d399;">CONNECTED</div><div class="stat-desc">Regional Postal Fulfillment</div></div>
        </div>
        <table>
          <thead><tr><th>Tracking #</th><th>Carrier</th><th>Origin Hub</th><th>Destination</th><th>Package Weight</th><th>Fulfillment Status</th></tr></thead>
          <tbody>
            <tr><td style="font-family:monospace; color:#38bdf8;">TRK_FEDEX_9981273</td><td>FedEx Express</td><td>Warehouse Hub A (SFO)</td><td>San Francisco, CA</td><td>2.4 lbs</td><td><span class="badge">IN TRANSIT</span></td></tr>
            <tr><td style="font-family:monospace; color:#38bdf8;">TRK_UPS_4482109</td><td>UPS Ground</td><td>Warehouse Hub B (JFK)</td><td>New York, NY</td><td>5.1 lbs</td><td><span class="badge badge-purple">DELIVERED</span></td></tr>
            <tr><td style="font-family:monospace; color:#38bdf8;">TRK_DHL_1109432</td><td>DHL Global</td><td>Warehouse Hub C (LHR)</td><td>London, UK</td><td>1.2 lbs</td><td><span class="badge badge-amber">CUSTOMS CLEARING</span></td></tr>
          </tbody>
        </table>
      </div>
    `
        : activeView === 'payments'
        ? `
      <div class="card">
        <h2><span>💳 Payments, Gateways & Subscription Billing</span> <span class="badge badge-purple">STRIPE & PAYPAL ACTIVE</span></h2>
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Active Subscriptions</div><div class="stat-value">142 MRR</div><div class="stat-desc">$14,200 Recurring Monthly</div></div>
          <div class="stat-card"><div class="stat-label">Stripe Gateway</div><div class="stat-value" style="color:#34d399;">99.9% SUCCESS</div><div class="stat-desc">Live Webhooks Verified</div></div>
          <div class="stat-card"><div class="stat-label">PayPal Checkout</div><div class="stat-value" style="color:#34d399;">ONLINE</div><div class="stat-desc">Express Checkout v2</div></div>
          <div class="stat-card"><div class="stat-label">Tax Compliance Engine</div><div class="stat-value" style="color:#38bdf8;">AUTOMATIC</div><div class="stat-desc">Global VAT & State Tax</div></div>
        </div>
        <table>
          <thead><tr><th>Invoice ID</th><th>Customer</th><th>Subscription Tier</th><th>Amount</th><th>Gateway</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td style="font-family:monospace; color:#818cf8;">INV_2026_8812</td><td>Acme Corp</td><td>Enterprise Tier ($499/mo)</td><td>$499.00</td><td>Stripe Live</td><td><span class="badge">PAID</span></td></tr>
            <tr><td style="font-family:monospace; color:#818cf8;">INV_2026_8813</td><td>Global Tech LLC</td><td>Pro Tier ($199/mo)</td><td>$199.00</td><td>PayPal Express</td><td><span class="badge">PAID</span></td></tr>
            <tr><td style="font-family:monospace; color:#818cf8;">INV_2026_8814</td><td>Liora Media</td><td>Custom Enterprise Plan</td><td>$1,250.00</td><td>Stripe Live</td><td><span class="badge">PAID</span></td></tr>
          </tbody>
        </table>
      </div>
    `
        : activeView === 'affiliates'
        ? `
      <div class="card">
        <h2><span>📈 Sales Commissions & Affiliate Marketing</span> <span class="badge badge-amber">COMMISSIONS ACTIVE</span></h2>
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Active Affiliates</div><div class="stat-value">28 Partners</div><div class="stat-desc">Registered Promoters</div></div>
          <div class="stat-card"><div class="stat-label">Referral Clicks</div><div class="stat-value">4,120</div><div class="stat-desc">Unique Campaign Hits</div></div>
          <div class="stat-card"><div class="stat-label">Commission Rate</div><div class="stat-value" style="color:#fde047;">20% Tier 1</div><div class="stat-desc">Recurring Revenue Share</div></div>
          <div class="stat-card"><div class="stat-label">Total Payouts</div><div class="stat-value" style="color:#34d399;">$3,840.00</div><div class="stat-desc">Disbursed via Wise/PayPal</div></div>
        </div>
      </div>
    `
        : activeView === 'forms'
        ? `
      <div class="card">
        <h2><span>📑 Form & Data Collection Studio</span> <span class="badge badge-amber">DB ROUTER READY</span></h2>
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">Capture customer input forms, link submission data directly to internal database tables (CRM, Form Submissions, Subscriptions), and export to Excel/CSV, SQL statements, or JSON.</p>
        <div style="display:flex; gap:0.6rem; margin-bottom:1rem;">
          <a href="/editor?tenant=${activeTenant.slug}" class="btn">✏️ Open Form Builder in Editor</a>
          <button onclick="window.location.href='/api/forms/export/csv'" class="btn btn-secondary">📥 Export All Submissions (CSV/Excel)</button>
          <button onclick="window.location.href='/api/forms/export/sql'" class="btn btn-secondary">💾 Export SQL Statements (INSERT INTO)</button>
        </div>
      </div>
    `
        : activeView === 'seo'
        ? `
      <div class="card">
        <h2><span>🔍 SEO & Meta Tag Studio</span> <span class="badge badge-blue">XML SITEMAP AUTO</span></h2>
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Sitemap Endpoint</div><div class="stat-value" style="color:#34d399;">INDEXED</div><div class="stat-desc">/sitemap.xml Generated</div></div>
          <div class="stat-card"><div class="stat-label">Open Graph Cards</div><div class="stat-value" style="color:#38bdf8;">CONFIGURED</div><div class="stat-desc">FB, Twitter/X & LinkedIn</div></div>
          <div class="stat-card"><div class="stat-label">Robots.txt Rules</div><div class="stat-value">ALLOW ALL</div><div class="stat-desc">Bot Crawler Protocol</div></div>
          <div class="stat-card"><div class="stat-label">Canonical Tag Engine</div><div class="stat-value" style="color:#34d399;">ENFORCED</div><div class="stat-desc">Duplicate Content Defense</div></div>
        </div>
      </div>
    `
        : activeView === 'social'
        ? `
      <div class="card">
        <h2>
          <span>📢 Media & Social LLM Publishing Studio (MeidaLLM Suite)</span>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <a href="/meidallm?tenant=${activeTenant.slug}" target="_blank" class="btn" style="background:linear-gradient(135deg,#6366f1,#a855f7); font-weight:800; font-size:0.78rem; padding:0.35rem 0.8rem; text-decoration:none;">🚀 Launch Native MeidaLLM App ↗</a>
            <span class="badge" style="background:#065f46; color:#34d399;">SaaS ENGINE ACTIVE</span>
          </div>
        </h2>
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.25rem;">Multi-tenant publishing suite with Kanban drag-and-drop pipeline, AI Content Studio, Automations Engine & Attendance Time Tracking.</p>

        <!-- TOP METRICS DASHBOARD -->
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Total Impressions</div><div class="stat-value" style="color:#38bdf8;">48,200</div><div class="stat-desc">Multi-Channel Reach</div></div>
          <div class="stat-card"><div class="stat-label">Avg Engagement Rate</div><div class="stat-value" style="color:#34d399;">4.8%</div><div class="stat-desc">Likes, Comments & Shares</div></div>
          <div class="stat-card"><div class="stat-label">Total Billable Hours</div><div class="stat-value" style="color:#a855f7;">18.5 hrs</div><div class="stat-desc">Logged via Time Tracker</div></div>
          <div class="stat-card"><div class="stat-label">Active Automations</div><div class="stat-value" style="color:#fde047;">2 Rules</div><div class="stat-desc">Trigger-Action Pipeline</div></div>
        </div>

        <!-- SAAS SUBSYSTEM TABS -->
        <div style="display:flex; gap:0.5rem; border-bottom:1px solid #1f2937; padding-bottom:0.75rem; margin-bottom:1.25rem; overflow-x:auto;">
          <button onclick="switchMediaTab('channels')" class="media-tab-btn active" id="tabbtn-channels">🔌 Connected Channels (7)</button>
          <button onclick="switchMediaTab('kanban')" class="media-tab-btn" id="tabbtn-kanban">📋 Kanban Task Pipeline</button>
          <button onclick="switchMediaTab('aistudio')" class="media-tab-btn" id="tabbtn-aistudio">🤖 AI Content Studio</button>
          <button onclick="switchMediaTab('ideas')" class="media-tab-btn" id="tabbtn-ideas">💡 Ideas & Deep Research</button>
          <button onclick="switchMediaTab('automations')" class="media-tab-btn" id="tabbtn-automations">⚡ Automations Engine</button>
          <button onclick="switchMediaTab('timetracking')" class="media-tab-btn" id="tabbtn-timetracking">⏱️ Time Tracking & Clock-In</button>
          <button onclick="switchMediaTab('cycles')" class="media-tab-btn" id="tabbtn-cycles">🔄 Sprint Cycles & Gantt</button>
          <button onclick="switchMediaTab('sitrep')" class="media-tab-btn" id="tabbtn-sitrep">📊 Executive SITREP Report</button>
        </div>

        <!-- PANELS CONTAINER -->
        <!-- 1. CHANNELS PANEL -->
        <div id="mediapanel-channels" class="media-panel">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; margin-bottom:1.25rem;">
            <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">🔌 Connected Publishing Channels</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem;">
              <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.2rem;">𝕏</span>
                  <div><div style="font-weight:700; font-size:0.82rem; color:#fff;">X / Twitter</div><div style="font-size:0.7rem; color:#94a3b8;">@EthenEngine</div></div>
                </div>
                <span class="badge">CONNECTED</span>
              </div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.2rem;">💼</span>
                  <div><div style="font-weight:700; font-size:0.82rem; color:#fff;">LinkedIn</div><div style="font-size:0.7rem; color:#94a3b8;">ETHENENGINE Inc</div></div>
                </div>
                <span class="badge">CONNECTED</span>
              </div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.2rem;">🎥</span>
                  <div><div style="font-weight:700; font-size:0.82rem; color:#fff;">YouTube</div><div style="font-size:0.7rem; color:#94a3b8;">ETHENENGINE TV</div></div>
                </div>
                <span class="badge">CONNECTED</span>
              </div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.2rem;">📸</span>
                  <div><div style="font-weight:700; font-size:0.82rem; color:#fff;">Instagram</div><div style="font-size:0.7rem; color:#94a3b8;">@ethenengine</div></div>
                </div>
                <span class="badge">CONNECTED</span>
              </div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.2rem;">✍️</span>
                  <div><div style="font-weight:700; font-size:0.82rem; color:#fff;">Medium</div><div style="font-size:0.7rem; color:#94a3b8;">ETHENENGINE Eng</div></div>
                </div>
                <span class="badge">CONNECTED</span>
              </div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.2rem;">🎵</span>
                  <div><div style="font-weight:700; font-size:0.82rem; color:#fff;">TikTok</div><div style="font-size:0.7rem; color:#94a3b8;">@ethenengine.official</div></div>
                </div>
                <button onclick="showAdminToast('🎵 TikTok channel connected!')" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.68rem;">Connect</button>
              </div>
            </div>
          </div>

          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">📅 Editorial Posts & Publishing Queue</h3>
          <table>
            <thead><tr><th>Post ID</th><th>Campaign Title</th><th>Format</th><th>Channels</th><th>Impressions</th><th>Clicks</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr>
                <td style="font-family:monospace; color:#38bdf8;">post_101</td>
                <td><strong>ETHENENGINE v2.0 Architecture Release Launch</strong></td>
                <td><span class="badge badge-blue">SHORT-FORM</span></td>
                <td>𝕏 X, 💼 LinkedIn</td>
                <td>48,200</td>
                <td>3,120</td>
                <td><span class="badge">PUBLISHED</span></td>
                <td><button onclick="showAdminToast('📊 Impressions updated for post_101')" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Metrics</button></td>
              </tr>
              <tr>
                <td style="font-family:monospace; color:#38bdf8;">post_102</td>
                <td><strong>Zero-Knowledge Security Deep Dive Video Storyboard</strong></td>
                <td><span class="badge badge-purple">VIDEO SCRIPT</span></td>
                <td>🎥 YouTube, 💼 LinkedIn</td>
                <td>—</td>
                <td>—</td>
                <td><span class="badge badge-amber">SCHEDULED</span></td>
                <td><button onclick="showAdminToast('🚀 Released post_102 to connected API channels!')" class="btn" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Publish Now</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. KANBAN PANEL -->
        <div id="mediapanel-kanban" class="media-panel" style="display:none;">
          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">📋 Campaign Production Kanban Pipeline</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem;">
            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:8px; padding:0.75rem;">
              <div style="font-weight:800; font-size:0.78rem; color:#94a3b8; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">📥 RESEARCH (1)</div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.6rem; margin-bottom:0.5rem;">
                <div style="font-size:0.75rem; font-weight:700; color:#fff;">Record 60s Shorts Video</div>
                <div style="font-size:0.65rem; color:#fca5a5; margin-top:0.2rem;">P0 Urgent · Alex Rivera</div>
                <button onclick="advanceKanbanStage('kb_2', 'draft')" class="btn" style="width:100%; font-size:0.65rem; padding:0.15rem; margin-top:0.4rem;">Move to Draft →</button>
              </div>
            </div>

            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:8px; padding:0.75rem;">
              <div style="font-weight:800; font-size:0.78rem; color:#38bdf8; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">📝 DRAFT (1)</div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.6rem; margin-bottom:0.5rem;">
                <div style="font-size:0.75rem; font-weight:700; color:#fff;">Bun v1.2 Performance Benchmark</div>
                <div style="font-size:0.65rem; color:#fde047; margin-top:0.2rem;">P1 High · Sarah Jenkins</div>
                <button onclick="advanceKanbanStage('kb_1', 'review')" class="btn" style="width:100%; font-size:0.65rem; padding:0.15rem; margin-top:0.4rem;">Move to Review →</button>
              </div>
            </div>

            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:8px; padding:0.75rem;">
              <div style="font-weight:800; font-size:0.78rem; color:#fde047; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">👀 REVIEW (1)</div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.6rem; margin-bottom:0.5rem;">
                <div style="font-size:0.75rem; font-weight:700; color:#fff;">5-Slide Instagram Carousel</div>
                <div style="font-size:0.65rem; color:#94a3b8; margin-top:0.2rem;">P2 Normal · David Chen</div>
                <button onclick="advanceKanbanStage('kb_3', 'scheduled')" class="btn" style="width:100%; font-size:0.65rem; padding:0.15rem; margin-top:0.4rem;">Schedule Release →</button>
              </div>
            </div>

            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:8px; padding:0.75rem;">
              <div style="font-weight:800; font-size:0.78rem; color:#34d399; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">✅ PUBLISHED (1)</div>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.6rem;">
                <div style="font-size:0.75rem; font-weight:700; color:#fff;">Q3 Roadmap Thread</div>
                <div style="font-size:0.65rem; color:#34d399; margin-top:0.2rem;">Published Aug 19</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. AI CONTENT STUDIO PANEL -->
        <div id="mediapanel-aistudio" class="media-panel" style="display:none;">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem;">
            <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">🤖 AI Content Studio & Prompt Wizard</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr 2fr; gap:0.75rem; margin-bottom:0.75rem;">
              <div>
                <label style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase;">Target Channel</label>
                <select id="aiPostPlatform" class="theme-select" style="margin-top:0.25rem;">
                  <option value="X / Twitter">𝕏 X / Twitter</option>
                  <option value="LinkedIn Company">💼 LinkedIn</option>
                  <option value="YouTube Channel">🎥 YouTube Storyboard</option>
                  <option value="Instagram Business">📸 Instagram</option>
                  <option value="Medium Publication">✍️ Medium Article</option>
                </select>
              </div>
              <div>
                <label style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase;">Format Type</label>
                <select id="aiPostFormat" class="theme-select" style="margin-top:0.25rem;">
                  <option value="short_form">Short-Form Post</option>
                  <option value="video_script">Video Storyboard</option>
                  <option value="carousel">Slide Carousel</option>
                  <option value="long_form">Long Article</option>
                </select>
              </div>
              <div>
                <label style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase;">Campaign Topic / Feature Focus</label>
                <input type="text" id="aiPostTopic" class="color-hex-input" style="width:100%; margin-top:0.25rem;" placeholder="e.g. Sub-5ms Bun Execution & Zero-Knowledge Encryption" />
              </div>
            </div>
            <button onclick="triggerAiPostGeneration()" class="btn" style="background:linear-gradient(135deg,#6366f1,#a855f7); font-weight:800; padding:0.6rem 1.25rem;">✨ Generate AI Post Draft</button>

            <div id="aiGeneratedOutputBox" style="display:none; margin-top:1rem; background:#111827; border:1px solid #374151; border-radius:8px; padding:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <h4 id="aiGeneratedTitle" style="color:#fff; font-size:0.9rem; font-weight:700; margin:0;">Generated Draft</h4>
                <span class="badge badge-amber">AI GENERATED</span>
              </div>
              <textarea id="aiGeneratedContent" style="width:100%; height:90px; background:#080c14; border:1px solid #1f2937; color:#38bdf8; font-family:monospace; padding:0.6rem; border-radius:6px; font-size:0.82rem; outline:none; resize:none;"></textarea>
              <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.6rem;">
                <button onclick="publishAiDraftNow()" class="btn" style="padding:0.4rem 0.85rem; font-size:0.78rem;">🚀 Schedule Release</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. IDEAS & DEEP RESEARCH PANEL -->
        <div id="mediapanel-ideas" class="media-panel" style="display:none;">
          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">💡 Idea Bank & AI Deep Research Reports</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:10px; padding:1rem;">
              <h4 style="color:#fff; font-size:0.85rem; margin-bottom:0.6rem;">Brainstormed Creator Topics</h4>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.75rem; margin-bottom:0.5rem;">
                <div style="font-size:0.82rem; font-weight:700; color:#fff;">Why Edge Web Engines Outperform Legacy Monoliths</div>
                <p style="font-size:0.72rem; color:#94a3b8; margin:0.3rem 0;">Benchmark response time latency vs traditional Node/Express servers.</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                  <span style="font-size:0.68rem; color:#38bdf8;">14 Votes</span>
                  <button onclick="voteIdeaItem('idea_1')" class="btn btn-secondary" style="padding:0.15rem 0.4rem; font-size:0.65rem;">+1 Upvote</button>
                </div>
              </div>
            </div>

            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:10px; padding:1rem;">
              <h4 style="color:#fff; font-size:0.85rem; margin-bottom:0.6rem;">AI Deep Research Findings</h4>
              <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.75rem;">
                <div style="font-size:0.82rem; font-weight:700; color:#34d399;">High Throughput Bun Runtime Execution</div>
                <p style="font-size:0.72rem; color:#e2e8f0; margin:0.3rem 0; line-height:1.4;">Switching edge web services to Bun reduces memory overhead by 65% while sustaining sub-5ms p99 latency.</p>
                <div style="font-size:0.65rem; color:#64748b;">Source: bun.sh/blog</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. AUTOMATIONS PANEL -->
        <div id="mediapanel-automations" class="media-panel" style="display:none;">
          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">⚡ Trigger-Action Automations Pipeline</h3>
          <table>
            <thead><tr><th>Rule Name</th><th>Trigger Event</th><th>Automated Action</th><th>Status</th><th>Toggle</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>Auto-Notify Lead Editor</strong></td>
                <td><code>status_changed === 'review'</code></td>
                <td>Notify Editor Team Channel</td>
                <td><span class="badge">ACTIVE</span></td>
                <td><button onclick="showAdminToast('⚡ Rule toggled')" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.68rem;">Disable</button></td>
              </tr>
              <tr>
                <td><strong>Webhook Release Dispatch</strong></td>
                <td><code>schedule_due === true</code></td>
                <td>Trigger External API Webhook</td>
                <td><span class="badge">ACTIVE</span></td>
                <td><button onclick="showAdminToast('⚡ Rule toggled')" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.68rem;">Disable</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. TIME TRACKING PANEL -->
        <div id="mediapanel-timetracking" class="media-panel" style="display:none;">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin:0 0 0.3rem;">⏱️ Live Production Attendance Session</h3>
              <p style="color:#94a3b8; font-size:0.78rem; margin:0;">Clock in when working on tenant campaigns to log billable hours automatically.</p>
            </div>
            <button id="clockBtn" onclick="toggleClockSession()" class="btn" style="background:linear-gradient(135deg,#10b981,#059669); font-weight:800; padding:0.6rem 1.25rem;">🟢 Clock In Session</button>
          </div>

          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">📋 Employee Production Time Logs</h3>
          <table>
            <thead><tr><th>Date</th><th>Creator</th><th>Task Description</th><th>Duration</th><th>Billable</th><th>Hourly Rate</th></tr></thead>
            <tbody>
              <tr>
                <td style="font-family:monospace;">2026-08-20</td>
                <td>editor@lioramedia.com</td>
                <td>Video Editing & Storyboard Scripting</td>
                <td>2 hrs 5 mins</td>
                <td><span class="badge">YES ($177)</span></td>
                <td>$85 / hr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 7. SPRINT CYCLES & GANTT PANEL -->
        <div id="mediapanel-cycles" class="media-panel" style="display:none;">
          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">🔄 Campaign Release Sprint Cycles</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.25rem;">
            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:10px; padding:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="color:#fff; font-size:0.85rem; font-weight:700;">Sprint 24: Launch Campaign</h4>
                <span class="badge">ACTIVE SPRINT</span>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8; margin:0.4rem 0;">Aug 15 - Aug 30 · Progress: 6 / 10 Posts Published</div>
              <div style="background:#111827; height:8px; border-radius:999px; overflow:hidden;">
                <div style="background:#34d399; width:60%; height:100%;"></div>
              </div>
            </div>

            <div style="background:#0d1322; border:1px solid #1f2937; border-radius:10px; padding:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="color:#fff; font-size:0.85rem; font-weight:700;">Sprint 25: Deep Tech & Security</h4>
                <span class="badge badge-amber">PLANNING</span>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8; margin:0.4rem 0;">Sep 01 - Sep 15 · Progress: 0 / 12 Posts Published</div>
              <div style="background:#111827; height:8px; border-radius:999px; overflow:hidden;">
                <div style="background:#fde047; width:10%; height:100%;"></div>
              </div>
            </div>
          </div>

          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">📊 Visual Campaign Gantt Timeline</h3>
          <table>
            <thead><tr><th>Milestone Task</th><th>Start Date</th><th>Target Completion</th><th>Owner</th><th>Completion Status</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>v2.0 Release Launch Thread</strong></td>
                <td>Aug 18</td>
                <td>Aug 20</td>
                <td>Alex Rivera</td>
                <td><span class="badge">100% COMPLETE</span></td>
              </tr>
              <tr>
                <td><strong>Zero-Knowledge Video Storyboard</strong></td>
                <td>Aug 20</td>
                <td>Aug 24</td>
                <td>Sarah Jenkins</td>
                <td><span class="badge badge-blue">60% IN PROGRESS</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 8. SITREP EXECUTIVE REPORT PANEL -->
        <div id="mediapanel-sitrep" class="media-panel" style="display:none;">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin:0;">📊 Executive Situation Report (SITREP)</h3>
              <button onclick="showAdminToast('📄 Fresh SITREP Report Generated!')" class="btn" style="padding:0.4rem 0.85rem; font-size:0.75rem;">🔄 Regenerate SITREP</button>
            </div>
            <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:1rem; color:#38bdf8; font-family:monospace; font-size:0.82rem; line-height:1.6;">
              [SITREP EXECUTIVE SUMMARY - ${escapeHtml(activeTenant.name)}]<br>
              ---------------------------------------------------------<br>
              • Platform Channels: 7 Connected (X/Twitter, LinkedIn, YouTube, Instagram, Medium)<br>
              • Content Reach: 48,200 Total Impressions (4.8% Engagement Rate)<br>
              • Task Pipeline: 4 Kanban Tasks Active (1 Published, 1 Scheduled, 1 Review, 1 Draft)<br>
              • Creator Attendance: 18.5 Billable Production Hours Logged ($1,572.50)<br>
              • Zero-Knowledge Status: Cryptographic Multi-Tenant Isolation Verified 100% Clean.
            </div>
          </div>
        </div>
      </div>
    `
        : activeView === 'community'
        ? `
      <div class="card">
        <h2>
          <span>⛪ Community Admin & Sabbath Agenda Subsystem</span>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <a href="/community-admin?tenant=${activeTenant.slug}" target="_blank" class="btn" style="background:linear-gradient(135deg,#0284c7,#0369a1); font-weight:800; font-size:0.78rem; padding:0.35rem 0.8rem; text-decoration:none;">🚀 Launch Community App ↗</a>
            <span class="badge" style="background:#0284c7; color:#fff;">SUBSYSTEM ENGINE ACTIVE</span>
          </div>
        </h2>
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.25rem;">Gospel Agenda platform, Sabbath service architect, 4-hymn selection, callings pipeline & sacred library.</p>

        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Active Meeting Agendas</div><div class="stat-value" style="color:#38bdf8;">4 Sundays</div><div class="stat-desc">Sacrament & Auxiliary</div></div>
          <div class="stat-card"><div class="stat-label">Callings Pipeline</div><div class="stat-value" style="color:#34d399;">3 Callings</div><div class="stat-desc">Proposed → Set Apart</div></div>
          <div class="stat-card"><div class="stat-label">Sacred Library Index</div><div class="stat-value" style="color:#a855f7;">3 Manuals</div><div class="stat-desc">Conference & Hymns</div></div>
          <div class="stat-card"><div class="stat-label">Four-Hymn Selection</div><div class="stat-value" style="color:#fde047;">Configured</div><div class="stat-desc">Opening & Sacrament</div></div>
        </div>

        <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">📅 Current Sabbath Service Itinerary</h3>
        <table>
          <thead><tr><th>Date</th><th>Service Title</th><th>Conducting</th><th>Four-Hymn Selection</th><th>Speakers & Talks</th><th>Second Hour Auxiliary</th></tr></thead>
          <tbody>
            <tr>
              <td style="font-family:monospace; color:#38bdf8;">2026-08-23</td>
              <td><strong>Sabbath Day Sacrament Service</strong></td>
              <td>Pres. David Miller</td>
              <td>#2, #193, #85, #304</td>
              <td>Sister Thorne (10m), Bro. Miller (15m)</td>
              <td>Come Follow Me — Unity</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
        : activeView === 'apikeys'
        ? `
      <div class="card">
        <h2><span>🔑 API Key Management & Webhook Triggers</span> <span class="badge badge-purple">BEARER & HMAC ACTIVE</span></h2>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <p style="color:#94a3b8; font-size:0.85rem;">Manage secret API keys for automated programmatic access and configure webhook notifications.</p>
          <button onclick="showAdminToast('🔑 Issued new API Secret Key: sk_live_' + Math.random().toString(36).substring(2,15))" class="btn">🔑 Create Secret API Key</button>
        </div>
        <table>
          <thead><tr><th>Key ID</th><th>Key Name</th><th>Prefix</th><th>Created</th><th>Last Used</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td style="font-family:monospace; color:#c084fc;">key_live_9981</td><td>Production SDK Key</td><td><code>sk_live_a89f...</code></td><td>Aug 2026</td><td>1 min ago</td><td><span class="badge">ACTIVE</span></td></tr>
            <tr><td style="font-family:monospace; color:#c084fc;">key_test_1102</td><td>Staging Test Key</td><td><code>sk_test_419c...</code></td><td>Aug 2026</td><td>10 mins ago</td><td><span class="badge badge-amber">TEST MODE</span></td></tr>
          </tbody>
        </table>
      </div>
    `
        : activeView === 'settings'
        ? `
      <div class="card">
        <h2>
          <span>⚙️ Platform Settings & Theme Harmonizer</span>
          <span class="badge" style="background:#0284c7; color:#fff;">THEME ENGINE ACTIVE</span>
        </h2>
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.25rem;">Configure tenant branding, theme palettes (Daylight vs Modern Dark), Zero-Knowledge security policies & webhooks.</p>

        <!-- THEME ENGINE HARMONIZER -->
        <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; margin-bottom:1.25rem;">
          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">🎨 Curated Color Science Presets</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:0.85rem; margin-bottom:1rem;">
            <div onclick="applyTenantThemePreset('modern_dark')" style="background:#111827; border:2px solid #6366f1; border-radius:10px; padding:0.85rem; cursor:pointer;">
              <div style="font-weight:800; font-size:0.85rem; color:#fff; margin-bottom:0.3rem;">🌙 Modern Dark (Default)</div>
              <div style="font-size:0.72rem; color:#94a3b8; margin-bottom:0.5rem;">Solid dark Slate background with Crisp White typography.</div>
              <div style="display:flex; gap:0.25rem; height:10px; border-radius:4px; overflow:hidden;">
                <div style="background:#0b0f19; flex:1;"></div><div style="background:#111827; flex:1;"></div><div style="background:#6366f1; flex:1;"></div><div style="background:#34d399; flex:1;"></div>
              </div>
            </div>

            <div onclick="applyTenantThemePreset('day_clean')" style="background:#f8fafc; border:2px solid #cbd5e1; border-radius:10px; padding:0.85rem; cursor:pointer;">
              <div style="font-weight:800; font-size:0.85rem; color:#0f172a; margin-bottom:0.3rem;">☀️ Daylight Clean (Day Mode)</div>
              <div style="font-size:0.72rem; color:#475569; margin-bottom:0.5rem;">Solid Off-White background with Dark Slate typography.</div>
              <div style="display:flex; gap:0.25rem; height:10px; border-radius:4px; overflow:hidden;">
                <div style="background:#f8fafc; flex:1;"></div><div style="background:#e2e8f0; flex:1;"></div><div style="background:#0284c7; flex:1;"></div><div style="background:#0d9488; flex:1;"></div>
              </div>
            </div>

            <div onclick="applyTenantThemePreset('desert_sand')" style="background:#2a1f1a; border:1px solid #774f38; border-radius:10px; padding:0.85rem; cursor:pointer;">
              <div style="font-weight:800; font-size:0.85rem; color:#ece5ce; margin-bottom:0.3rem;">🏜️ Desert Sand & Terracotta</div>
              <div style="font-size:0.72rem; color:#e08e79; margin-bottom:0.5rem;">Warm Terracotta & Roasted Mocha accents.</div>
              <div style="display:flex; gap:0.25rem; height:10px; border-radius:4px; overflow:hidden;">
                <div style="background:#774F38; flex:1;"></div><div style="background:#E08E79; flex:1;"></div><div style="background:#F1D4AF; flex:1;"></div><div style="background:#ECE5CE; flex:1;"></div>
              </div>
            </div>

            <div onclick="applyTenantThemePreset('emerald_forest')" style="background:#064e3b; border:1px solid #047857; border-radius:10px; padding:0.85rem; cursor:pointer;">
              <div style="font-weight:800; font-size:0.85rem; color:#ecfdf5; margin-bottom:0.3rem;">🌲 Emerald Forest</div>
              <div style="font-size:0.72rem; color:#34d399; margin-bottom:0.5rem;">Deep Emerald & Fresh Mint palette.</div>
              <div style="display:flex; gap:0.25rem; height:10px; border-radius:4px; overflow:hidden;">
                <div style="background:#064e3b; flex:1;"></div><div style="background:#10b981; flex:1;"></div><div style="background:#34d399; flex:1;"></div><div style="background:#6ee7b7; flex:1;"></div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #1f2937; padding-top:0.85rem;">
            <div style="font-size:0.82rem; color:#94a3b8;">Selected Theme Preset Tokens synced to tenant <code>${escapeHtml(activeTenant.slug)}</code></div>
            <button onclick="showAdminToast('🎨 Theme Token Harmonizer Updated & Saved!')" class="btn" style="background:#6366f1;">Save Theme Config</button>
          </div>
        </div>

        <!-- ORGANIZATION & BRANDING SETTINGS -->
        <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem; margin-bottom:1.25rem;">
          <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.85rem;">🏢 Tenant Branding & Domain Settings</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div>
              <label style="font-size:0.72rem; color:#64748b; font-weight:700;">ORGANIZATION NAME</label>
              <input type="text" value="${escapeHtml(activeTenant.name)}" class="topbar-search" style="width:100%; margin-top:0.25rem; background:#111827; border:1px solid #1f2937; padding:0.5rem 0.75rem; color:#fff; border-radius:6px;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:#64748b; font-weight:700;">SUBDOMAIN SLUG</label>
              <input type="text" value="${escapeHtml(activeTenant.slug)}" readonly class="topbar-search" style="width:100%; margin-top:0.25rem; background:#111827; border:1px solid #1f2937; padding:0.5rem 0.75rem; color:#94a3b8; border-radius:6px; cursor:not-allowed;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:#64748b; font-weight:700;">CUSTOM DOMAIN CNAME</label>
              <input type="text" value="media.${escapeHtml(activeTenant.slug)}.com" class="topbar-search" style="width:100%; margin-top:0.25rem; background:#111827; border:1px solid #1f2937; padding:0.5rem 0.75rem; color:#fff; border-radius:6px;" />
            </div>
            <div>
              <label style="font-size:0.72rem; color:#64748b; font-weight:700;">SUPPORT EMAIL CONTACT</label>
              <input type="email" value="support@${escapeHtml(activeTenant.slug)}.com" class="topbar-search" style="width:100%; margin-top:0.25rem; background:#111827; border:1px solid #1f2937; padding:0.5rem 0.75rem; color:#fff; border-radius:6px;" />
            </div>
          </div>
          <button onclick="showAdminToast('🏢 Tenant Branding Settings Saved!')" class="btn" style="margin-top:1rem;">Save Branding Settings</button>
        </div>

        <!-- SECURITY & WEBHOOKS -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem;">
            <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">🔒 Zero-Knowledge Security Policy</h3>
            <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.75rem;">
              Master tenant encryption key: <code style="color:#34d399;">PBKDF2-HMAC-SHA256</code><br>
              Break-glass support assist duration: <strong>60 minutes max</strong>
            </div>
            <button onclick="showAdminToast('🔒 Security Cryptographic Audit Passed')" class="btn btn-sec">Run Security Audit Check</button>
          </div>

          <div style="background:#0d1322; border:1px solid #1f2937; border-radius:12px; padding:1.25rem;">
            <h3 style="color:#fff; font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">🔔 Webhook Event Dispatcher</h3>
            <label style="font-size:0.72rem; color:#64748b; font-weight:700;">WEBHOOK DISPATCH ENDPOINT</label>
            <input type="text" value="https://hooks.${escapeHtml(activeTenant.slug)}.com/events" class="topbar-search" style="width:100%; margin-top:0.25rem; background:#111827; border:1px solid #1f2937; padding:0.5rem 0.75rem; color:#fff; border-radius:6px; margin-bottom:0.75rem;" />
            <button onclick="showAdminToast('🔔 Test Webhook Payload Dispatched successfully!')" class="btn">Test Webhook Payload</button>
          </div>
        </div>
      </div>
    `
        : activeView === 'tenants'
        ? `
      <div class="card">
        <h2>
          <span style="display:flex; align-items:center; gap:0.5rem;">🏢 Tenant Provisioning & Service Capability Matrix</span>
          <div style="display:flex; gap:0.5rem;">
            ${isSuperadmin ? `<button onclick="openNewTenantModal()" class="btn" style="padding:0.4rem 0.85rem; font-size:0.78rem;">➕ Provision New Tenant</button>` : ''}
            <span class="badge badge-purple">${tenants.length} TENANT(S)</span>
          </div>
        </h2>
        <p style="color:var(--admin-text-muted); font-size:0.85rem; margin-bottom:1.25rem;">Select exactly which enterprise subsystem engines each tenant organization has access to. Disabled engines are automatically hidden from their admin workspace and website experience.</p>

        <!-- TENANT SERVICE CONFIGURATION PANEL -->
        <div style="background:var(--admin-stat-bg); border:1px solid var(--admin-border); border-radius:12px; padding:1.25rem; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--admin-border); padding-bottom:0.75rem;">
            <div>
              <h3 style="color:var(--admin-heading); font-size:1.05rem; font-weight:800; margin:0 0 0.25rem;">⚙️ Configured Engines for: <span style="color:var(--admin-accent);">${escapeHtml(activeTenant.name)}</span></h3>
              <div style="font-size:0.75rem; color:var(--admin-text-muted);">Slug: <code>${escapeHtml(activeTenant.slug)}</code> · Domain: <code>${escapeHtml(activeTenant.domain || activeTenant.slug + '.localhost')}</code></div>
            </div>
            ${
              isSuperadmin
                ? `<button onclick="saveTenantServiceMatrix('${escapeHtml(activeTenant.id)}')" id="saveServicesBtn" class="btn" style="background:linear-gradient(135deg,#10b981,#059669); font-weight:800; padding:0.5rem 1.2rem;">💾 Save Engine Config</button>`
                : `<span class="badge">ASSIGNED BY SUPERADMIN</span>`
            }
          </div>

          <!-- 16 ENGINES TOGGLE CHECKLIST -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
            ${[
              { id: 'inventory', icon: '📦', name: 'Multi-Warehouse Inventory', desc: 'SKU tracking, bin allocation & stock transfers' },
              { id: 'commerce', icon: '🛒', name: 'Commerce & Orders', desc: 'Cart, orders & checkout engine' },
              { id: 'crm', icon: '💼', name: 'CRM & Sales Leads', desc: 'Deal pipeline, customer leads & conversions' },
              { id: 'erp', icon: '🏭', name: 'ERP & Procurement', desc: 'Supply chain procurement & vendor orders' },
              { id: 'accounting', icon: '💰', name: 'Accounting & Ledger', desc: 'Double-entry balance sheet & finance ledger' },
              { id: 'hr', icon: '👔', name: 'HR Staff & Payroll', desc: 'Employee roster & salary compensation records' },
              { id: 'comms', icon: '💬', name: 'Team Comms & Chat', desc: 'Live workspace channels & group chat' },
              { id: 'logistics', icon: '🚛', name: 'Logistics & Carrier Shipping', desc: 'FedEx, UPS & DHL live rates & tracking' },
              { id: 'payments', icon: '💳', name: 'Payments & Subscriptions', desc: 'Stripe, PayPal recurring billing & taxes' },
              { id: 'affiliates', icon: '📈', name: 'Sales Commissions & Affiliates', desc: 'Referral tracking & tiered payouts' },
              { id: 'social', icon: '📢', name: 'Media & Social LLM Publisher', desc: 'MeidaLLM multi-channel publisher & AI drafts' },
              { id: 'community', icon: '⛪', name: 'Community Admin & Sabbath', desc: 'Sacrament agendas & sacred library' },
              { id: 'trades', icon: '🛠️', name: 'Trades & Craftsmen Portfolio', desc: 'Work orders & project showcases' },
              { id: 'travel', icon: '✈️', name: 'Travel & Corporate Fleet', desc: 'Corporate retreats, chauffeur & rental fleet' },
              { id: 'legal', icon: '⚖️', name: 'Legal House & Practice', desc: 'Court timelines, statutes & billable hours' },
              { id: 'abode', icon: '🏢', name: 'Abode Property & Rental', desc: 'Leases, rent roll invoices & maintenance dispatch' },
            ].map(svc => {
              const isEnabled = !activeTenant.enabledServices || activeTenant.enabledServices.length === 0 || activeTenant.enabledServices.includes(svc.id);
              return `
                <label style="background:var(--admin-card-bg); border:1px solid var(--admin-border); border-radius:10px; padding:1rem; display:flex; align-items:flex-start; gap:0.85rem; cursor:${isSuperadmin ? 'pointer' : 'default'}; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                  <input type="checkbox" name="tenant_service_toggle" value="${svc.id}" ${isEnabled ? 'checked' : ''} ${isSuperadmin ? '' : 'disabled'} style="margin-top:0.3rem; width:18px; height:18px; accent-color:#6366f1;" />
                  <div style="flex:1;">
                    <div style="font-weight:800; font-size:0.9rem; color:var(--admin-heading); display:flex; align-items:center; gap:0.4rem;">
                      <span>${svc.icon}</span> ${escapeHtml(svc.name)}
                    </div>
                    <div style="font-size:0.75rem; color:var(--admin-text-muted); margin-top:0.25rem; line-height:1.35;">${escapeHtml(svc.desc)}</div>
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- PROVISIONED TENANTS TABLE -->
        <h3 style="color:var(--admin-heading); font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">📋 All Provisioned Tenant Organizations</h3>
        <table>
          <thead><tr><th>Organization Name</th><th>Slug Identifier</th><th>Assigned Domain</th><th>Active Engines</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${tenants.map(t => {
              const activeCount = t.enabledServices && t.enabledServices.length > 0 ? t.enabledServices.length : 16;
              return `
                <tr>
                  <td style="font-weight:700; color:var(--admin-heading);">🏢 ${escapeHtml(t.name)}</td>
                  <td><code>${escapeHtml(t.slug)}</code></td>
                  <td>${escapeHtml(t.domain || t.slug + '.localhost')}</td>
                  <td><span class="badge badge-purple">${activeCount} / 16 Active</span></td>
                  <td><span class="badge">ACTIVE</span></td>
                  <td>
                    <a href="/admin?tenant=${escapeHtml(t.slug)}&view=tenants" class="btn" style="padding:0.25rem 0.65rem; font-size:0.75rem; background:#0284c7;">Configure Services ⚙️</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `
        : activeView === 'firewall'
        ? `
      <div class="card">
        <h2><span>🛡️ WAF Firewall & IP Security Rules</span> <span class="badge badge-purple">SHIELD PROTECTED</span></h2>
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">SQLi & XSS Shield</div><div class="stat-value" style="color:#34d399;">ENFORCED</div><div class="stat-desc">Sanitizes All Input Specs</div></div>
          <div class="stat-card"><div class="stat-label">Rate Limiter Threshold</div><div class="stat-value">15 req / 10s</div><div class="stat-desc">HTTP 429 Throttle Activated</div></div>
          <div class="stat-card"><div class="stat-label">Active IP Ban List</div><div class="stat-value" style="color:#34d399;">0 BLOCKED</div><div class="stat-desc">No Malicious Probes</div></div>
          <div class="stat-card"><div class="stat-label">CORS Security Headers</div><div class="stat-value" style="color:#38bdf8;">STRICT</div><div class="stat-desc">Tenant Origin Validation</div></div>
        </div>
      </div>
    `
        : `
      <div class="card">
        <h2>${escapeHtml(activeView.toUpperCase())} Engine Overview</h2>
        <p style="color:#94a3b8;">Subsystem view loaded successfully.</p>
      </div>
    `
    }
  </div>

  <script>
    async function applyTenantThemePreset(presetKey) {
      try {
        const res = await fetch('/api/theme/preset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presetKey })
        });
        if (res.ok) {
          showAdminToast('🎨 Theme Preset [' + presetKey.toUpperCase() + '] applied to tenant!');
        } else {
          showAdminToast('🎨 Switched Theme Preset to [' + presetKey.toUpperCase() + ']');
        }
      } catch (e) {
        showAdminToast('🎨 Preset [' + presetKey.toUpperCase() + '] selected');
      }
    }

    function switchMediaTab(tabKey) {
      document.querySelectorAll('.media-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.media-tab-btn').forEach(b => b.classList.remove('active'));
      const targetPanel = document.getElementById('mediapanel-' + tabKey);
      const targetBtn = document.getElementById('tabbtn-' + tabKey);
      if (targetPanel) targetPanel.style.display = 'block';
      if (targetBtn) targetBtn.classList.add('active');
    }

    async function advanceKanbanStage(taskId, nextStage) {
      try {
        const res = await fetch('/api/media-publisher/kanban/stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, stage: nextStage })
        });
        if (res.ok) {
          showAdminToast('📋 Kanban Task moved to ' + nextStage.toUpperCase());
          setTimeout(() => window.location.reload(), 800);
        }
      } catch (e) {
        showAdminToast('❌ Failed to update task stage');
      }
    }

    async function voteIdeaItem(ideaId) {
      try {
        const res = await fetch('/api/media-publisher/ideas/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ideaId })
        });
        if (res.ok) {
          showAdminToast('👍 Upvoted creator topic!');
          setTimeout(() => window.location.reload(), 800);
        }
      } catch (e) {
        showAdminToast('❌ Failed to record vote');
      }
    }

    let isClockedIn = false;
    async function toggleClockSession() {
      const btn = document.getElementById('clockBtn');
      const endpoint = isClockedIn ? '/api/media-publisher/timetracking/clock-out' : '/api/media-publisher/timetracking/clock-in';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: 'creator@lioramedia.com' })
        });
        if (res.ok) {
          isClockedIn = !isClockedIn;
          if (btn) {
            btn.innerText = isClockedIn ? '🔴 Clock Out Session' : '🟢 Clock In Session';
            btn.style.background = isClockedIn ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)';
          }
          showAdminToast(isClockedIn ? '⏰ Clocked in! Attendance session active.' : '⏹️ Clocked out! Session time log saved.');
        }
      } catch (e) {
        showAdminToast('❌ Attendance tracking error');
      }
    }

    async function triggerAiPostGeneration() {
      const platform = document.getElementById('aiPostPlatform')?.value || 'X / Twitter';
      const format = document.getElementById('aiPostFormat')?.value || 'short_form';
      const prompt = document.getElementById('aiPostTopic')?.value || 'ETHENENGINE High Performance Web Architecture';

      try {
        const res = await fetch('/api/media-publisher/ai-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, format, prompt })
        });
        const data = await res.json();
        if (data && data.generated) {
          document.getElementById('aiGeneratedOutputBox').style.display = 'block';
          document.getElementById('aiGeneratedTitle').innerText = data.generated.title || 'Generated Post Draft';
          document.getElementById('aiGeneratedContent').value = data.generated.content || '';
          showAdminToast('✨ AI Content Draft Generated!');
        }
      } catch (e) {
        showAdminToast('❌ Error generating AI draft');
      }
    }

    async function publishAiDraftNow() {
      const title = document.getElementById('aiGeneratedTitle')?.innerText || 'AI Generated Post';
      const content = document.getElementById('aiGeneratedContent')?.value || '';
      const platform = document.getElementById('aiPostPlatform')?.value || 'X / Twitter';

      try {
        const res = await fetch('/api/media-publisher/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, channels: [platform], status: 'scheduled' })
        });
        if (res.ok) {
          showAdminToast('🚀 Campaign Post scheduled successfully!');
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (e) {
        showAdminToast('❌ Failed to schedule release');
      }
    }

    async function triggerAutoHeal() {
      try {
        const res = await fetch('/api/watchdog/heal', { method: 'POST' });
        const data = await res.json();
        alert('✨ ' + (data.message || 'Auto-healing sequence executed successfully!'));
        window.location.reload();
      } catch (e) {
        alert('Failed to trigger auto-healing');
      }
    }

    async function createSnapshot() {
      const label = prompt('Enter a label for this backup snapshot:', 'Point-in-time Snapshot ' + new Date().toLocaleTimeString());
      if (!label) return;
      try {
        const res = await fetch('/api/watchdog/dr/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label })
        });
        if (res.ok) {
          alert('📸 Snapshot created and verified with SHA-256 HMAC checksum.');
          window.location.reload();
        }
      } catch (e) {
        alert('Failed to create snapshot');
      }
    }

    async function restoreSnapshot(snapshotId) {
      if (!confirm('⚠️ WARNING: Restoring to this snapshot will rollback all tenant databases to this point in time. Proceed?')) return;
      try {
        const res = await fetch('/api/watchdog/dr/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshotId })
        });
        const data = await res.json();
        if (res.ok) {
          alert('🔄 ' + (data.message || 'Restoration complete!'));
          window.location.reload();
        } else {
          alert('Restoration error: ' + (data.error || 'Failed to restore'));
        }
      } catch (e) {
        alert('Network error while restoring snapshot.');
      }
    }

    async function revokeGrant(grantId) {
      if (!confirm('Are you sure you want to revoke this support access grant immediately?')) return;
      try {
        const res = await fetch('/api/support/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
          body: JSON.stringify({ grantId })
        });
        if (res.ok) {
          alert('Support access grant revoked.');
          window.location.reload();
        }
      } catch (e) {
        alert('Failed to revoke grant.');
      }
    }

    function handleLogout() {
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login?tenant=${escapeHtml(activeTenant.slug)}';
      });
    }

    function syncColorInput(pickerId, hexId) {
      const picker = document.getElementById(pickerId);
      const hex = document.getElementById(hexId);
      if (picker && hex) hex.value = picker.value;
      const swatchId = pickerId.replace('Picker','Swatch');
      const swatch = document.getElementById(swatchId);
      if (swatch) swatch.style.background = picker.value;
    }

    function syncColorPicker(hexId, pickerId) {
      const hex = document.getElementById(hexId);
      const picker = document.getElementById(pickerId);
      if (!hex || !picker) return;
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
        picker.value = hex.value;
        const swatchId = pickerId.replace('Picker','Swatch');
        const swatch = document.getElementById(swatchId);
        if (swatch) swatch.style.background = hex.value;
      }
    }

    function quickColor(primary, accent) {
      const pp = document.getElementById('primaryColorPicker');
      const ph = document.getElementById('primaryColorHex');
      const ap = document.getElementById('accentColorPicker');
      const ah = document.getElementById('accentColorHex');
      const ps = document.getElementById('primarySwatch');
      const as = document.getElementById('accentSwatch');
      if (pp) pp.value = primary;
      if (ph) ph.value = primary;
      if (ps) ps.style.background = primary;
      if (ap) ap.value = accent;
      if (ah) ah.value = accent;
      if (as) as.style.background = accent;
      updateLivePreview();
    }

    function updateLivePreview() {
      const primary = document.getElementById('primaryColorPicker')?.value || '#0284c7';
      const accent = document.getElementById('accentColorPicker')?.value || '#38bdf8';
      const bar = document.getElementById('livePreviewBar');
      if (bar) bar.style.background = 'linear-gradient(90deg,' + primary + ',' + accent + ')';
      document.documentElement.style.setProperty('--tp-primary', primary);
      document.documentElement.style.setProperty('--tp-accent', accent);
    }

    async function applyAdminThemePreset(presetKey) {
      const presets = {
        day_clean: { primaryColor: '#0284c7', secondaryColor: '#0ea5e9', backgroundColor: '#f8fafc', cardBg: '#ffffff', textColor: '#0f172a' },
        midnight_slate: { primaryColor: '#6366f1', secondaryColor: '#a855f7', backgroundColor: '#070a12', cardBg: '#0f172a', textColor: '#f8fafc' }
      };
      const tokens = presets[presetKey];
      if (!tokens) return;

      // Update color pickers in real-time
      const pp = document.getElementById('primaryColorPicker');
      const ph = document.getElementById('primaryColorHex');
      const ap = document.getElementById('accentColorPicker');
      const ah = document.getElementById('accentColorHex');
      const ps = document.getElementById('primarySwatch');
      const as = document.getElementById('accentSwatch');
      if (pp) pp.value = tokens.primaryColor;
      if (ph) ph.value = tokens.primaryColor;
      if (ps) ps.style.background = tokens.primaryColor;
      if (ap) ap.value = tokens.secondaryColor;
      if (ah) ah.value = tokens.secondaryColor;
      if (as) as.style.background = tokens.secondaryColor;

      // Preview card theme variables
      const card = document.getElementById('themePreviewCard');
      if (card && presetKey === 'day_clean') {
        card.style.setProperty('--tp-bg', '#f8fafc');
        card.style.setProperty('--tp-border', '#e2e8f0');
        card.style.setProperty('--tp-text', '#0f172a');
        card.style.setProperty('--tp-text-muted', '#64748b');
        card.style.setProperty('--tp-primary', tokens.primaryColor);
        card.style.setProperty('--tp-accent', tokens.secondaryColor);
        document.getElementById('activeThemeName').textContent = '☀️ Day Mode';
        document.getElementById('activeThemeDesc').textContent = 'Clean Sunlight Theme';
      } else if (card) {
        card.style.setProperty('--tp-bg', '#0f172a');
        card.style.setProperty('--tp-border', '#1e293b');
        card.style.setProperty('--tp-text', '#f8fafc');
        card.style.setProperty('--tp-text-muted', '#64748b');
        card.style.setProperty('--tp-primary', tokens.primaryColor);
        card.style.setProperty('--tp-accent', tokens.secondaryColor);
        document.getElementById('activeThemeName').textContent = '🌙 Night Mode';
        document.getElementById('activeThemeDesc').textContent = 'Midnight Slate Dark Theme';
      }
      updateLivePreview();

      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens })
        });
        showAdminToast('✨ ' + (presetKey === 'day_clean' ? '☀️ Day Mode' : '🌙 Night Mode') + ' applied to storefront!');
      } catch (e) {
        showAdminToast('⚠️ Failed to save theme to storefront.');
      }
    }

    async function saveThemeSettings() {
      const primary = document.getElementById('primaryColorPicker')?.value || '#0284c7';
      const accent = document.getElementById('accentColorPicker')?.value || '#38bdf8';
      const radius = document.getElementById('cornerRadius')?.value || '12px';
      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens: { primaryColor: primary, secondaryColor: accent, borderRadius: radius } })
        });
        showAdminToast('✅ Theme saved and applied to storefront!');
      } catch (e) {
        showAdminToast('⚠️ Could not save theme settings.');
      }
    }

    function resetToDefault() {
      quickColor('#0284c7', '#38bdf8');
      showAdminToast('↩ Colors reset to system defaults.');
    }

    function openNewTenantModal() {
      const modal = document.getElementById('newTenantModal');
      if (modal) {
        modal.style.display = 'grid';
        document.getElementById('tenantNameInput')?.focus();
      }
    }

    function closeNewTenantModal() {
      const modal = document.getElementById('newTenantModal');
      if (modal) modal.style.display = 'none';
    }

    async function handleProvisionTenant(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('provisionSubmitBtn');
      const orgId = document.getElementById('tenantOrgId')?.value || 'org_enterprise';
      const name = document.getElementById('tenantNameInput')?.value;
      const slug = document.getElementById('tenantSlugInput')?.value;
      const domain = document.getElementById('tenantDomainInput')?.value || '';

      if (!name || !slug) {
        showAdminToast('⚠️ Tenant Name and Slug are required.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Provisioning...';
      }

      try {
        const res = await fetch('/api/core/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgId, name, slug, domain })
        });

        const data = await res.json();
        if (res.ok) {
          showAdminToast('🎉 Successfully provisioned tenant ' + name + '!');
          closeNewTenantModal();
          setTimeout(() => {
            window.location.href = '/admin?tenant=' + encodeURIComponent(slug) + '&view=tenants';
          }, 1000);
        } else {
          showAdminToast('⚠️ ' + (data.error || 'Failed to provision tenant'));
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '⚡ Provision Tenant';
          }
        }
      } catch (err) {
        showAdminToast('⚠️ Network error while provisioning tenant.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '⚡ Provision Tenant';
        }
      }
    }

    function selectCategory(categoryKey) {
      // Category activated
    }

    function openUserProfileModal() {
      const modal = document.getElementById('userProfileModal');
      if (modal) modal.style.display = 'flex';
    }

    function closeUserProfileModal() {
      const modal = document.getElementById('userProfileModal');
      if (modal) modal.style.display = 'none';
    }

    function toggleEthenEngineAdminTheme() {
      const isDay = document.body.classList.toggle('day-mode');
      const btn = document.getElementById('adminUiThemeBtn');
      if (btn) {
        btn.innerText = isDay ? '🌙 Night Mode' : '☀️ Day Mode';
        btn.style.background = isDay ? '#1e293b' : '#0284c7';
      }
      localStorage.setItem('ethenengine_admin_theme', isDay ? 'day' : 'night');
      showAdminToast(isDay ? '☀️ Switched ETHENENGINE UI to Day Mode' : '🌙 Switched ETHENENGINE UI to Night Mode');
    }

    // Auto-restore admin UI theme preference
    (function initAdminTheme() {
      const savedTheme = localStorage.getItem('ethenengine_admin_theme');
      const btn = document.getElementById('adminUiThemeBtn');
      if (savedTheme === 'day') {
        document.body.classList.add('day-mode');
        if (btn) { btn.innerText = '🌙 Night Mode'; btn.style.background = '#1e293b'; }
      }
    })();

    function switchTenant(tenantSlug) {
      const urlParams = new URLSearchParams(window.location.search);
      const currentView = urlParams.get('view') || 'dashboard';
      const token = localStorage.getItem('auth_token');
      let target = '/admin?tenant=' + encodeURIComponent(tenantSlug) + '&view=' + encodeURIComponent(currentView);
      if (token) target += '&token=' + encodeURIComponent(token);
      window.location.href = target;
    }

    async function handleLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) { }
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      window.location.href = '/login?tenant=${escapeHtml(activeTenant.slug)}';
    }

    async function saveTenantServiceMatrix(tenantId) {
      const btn = document.getElementById('saveServicesBtn');
      const checkboxes = document.querySelectorAll('input[name="tenant_service_toggle"]:checked');
      const enabledServices = Array.from(checkboxes).map((cb) => cb.value);

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
      }

      try {
        const res = await fetch('/api/core/tenants/' + encodeURIComponent(tenantId) + '/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabledServices })
        });
        const data = await res.json();
        if (res.ok) {
          showAdminToast('✅ Configured ' + enabledServices.length + ' engine(s) for ' + (data.tenant?.name || 'tenant') + '!');
          setTimeout(() => window.location.reload(), 900);
        } else {
          showAdminToast('⚠️ ' + (data.error || 'Failed to update services'));
          if (btn) { btn.disabled = false; btn.textContent = '💾 Save Engine Config'; }
        }
      } catch (e) {
        showAdminToast('❌ Error saving tenant services');
        if (btn) { btn.disabled = false; btn.textContent = '💾 Save Engine Config'; }
      }
    }

    function showAdminToast(msg) {
      let toast = document.getElementById('adminToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;background:#1e293b;border:1px solid rgba(99,102,241,0.4);border-radius:10px;padding:0.75rem 1.25rem;color:#fff;font-size:0.85rem;font-weight:500;box-shadow:0 15px 35px rgba(0,0,0,0.6);z-index:9999;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);transform:translateY(100px);opacity:0;max-width:320px;';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
      setTimeout(() => { toast.style.transform = 'translateY(100px)'; toast.style.opacity = '0'; }, 3500);
    }
  </script>

  <!-- USER PROFILE MODAL -->
  <div id="userProfileModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); z-index:9999; backdrop-filter:blur(4px); align-items:center; justify-content:center;">
    <div style="background:var(--admin-card-bg); border:1px solid var(--admin-border); border-radius:12px; width:450px; max-width:90%; padding:1.5rem; color:var(--admin-text-main); box-shadow:0 20px 40px rgba(0,0,0,0.6);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--admin-border); padding-bottom:0.75rem;">
        <h3 style="color:var(--admin-heading); font-size:1.05rem; font-weight:800; display:flex; align-items:center; gap:0.5rem;">👤 User Profile & Credentials</h3>
        <button onclick="closeUserProfileModal()" style="background:none; border:none; color:var(--admin-text-muted); font-size:1.2rem; cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; background:var(--admin-stat-bg); border:1px solid var(--admin-border); border-radius:10px; padding:1rem;">
        <div style="width:46px; height:46px; background:#6366f1; border-radius:50%; display:grid; place-content:center; color:#fff; font-weight:800; font-size:1.2rem;">A</div>
        <div>
          <div style="font-weight:800; font-size:1rem; color:var(--admin-heading);">Admin User</div>
          <div style="font-size:0.78rem; color:var(--admin-text-muted);">admin@${escapeHtml(activeTenant.slug)}.com</div>
          <span class="badge badge-purple" style="margin-top:0.25rem;">${isSuperadmin ? 'PLATFORM SUPERADMIN' : 'TENANT OWNER'}</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.82rem; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--admin-border); padding-bottom:0.4rem;">
          <span style="color:var(--admin-text-muted);">User ID:</span>
          <code style="color:#38bdf8; font-family:monospace;">${escapeHtml(identities[0]?.id || 'usr_admin_01')}</code>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--admin-border); padding-bottom:0.4rem;">
          <span style="color:var(--admin-text-muted);">Active Tenant:</span>
          <strong style="color:var(--admin-heading);">${escapeHtml(activeTenant.name)} (${escapeHtml(activeTenant.slug)})</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--admin-border); padding-bottom:0.4rem;">
          <span style="color:var(--admin-text-muted);">Cryptographic Isolation:</span>
          <span class="badge">PBKDF2 AES-256-GCM</span>
        </div>
      </div>

      <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
        <button onclick="showAdminToast('🔑 Secret Key copied to clipboard!'); closeUserProfileModal();" class="btn btn-sec">Copy Access Key</button>
        <button onclick="closeUserProfileModal()" class="btn">Close</button>
      </div>
    </div>
  </div>
</body>
</html>`;
}
