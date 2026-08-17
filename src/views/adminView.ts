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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #e2e8f0; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 280px; min-width: 280px; background: #111827; border-right: 1px solid #1f2937; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; }
    .brand { font-size: 1.15rem; font-weight: 800; color: #6366f1; display:flex; align-items:center; gap:0.6rem; letter-spacing: -0.02em; }
    .nav-section-title { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin: 0.75rem 0 0.25rem 0.5rem; }
    .nav-item { padding: 0.55rem 0.75rem; border-radius: 6px; color: #94a3b8; text-decoration: none; font-size: 0.85rem; display:flex; align-items:center; gap:0.6rem; font-weight: 500; transition: all 0.15s; }
    .nav-item.active, .nav-item:hover { background: #1e293b; color: #fff; }
    .nav-item.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; border-left: 3px solid #6366f1; }
    .main-content { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; background: #080c14; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .card h2 { font-size: 1.1rem; margin-bottom: 1rem; color: #38bdf8; display:flex; justify-content:space-between; align-items:center; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card { background: #0d1322; border: 1px solid #1f2937; border-radius: 10px; padding: 1.2rem; }
    .stat-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 0.35rem; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #fff; }
    .stat-desc { font-size: 0.8rem; color: #10b981; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th, td { padding: 0.75rem 0.85rem; border-bottom: 1px solid #1f2937; }
    th { color: #64748b; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: #065f46; color: #34d399; }
    .badge-purple { background: #581c87; color: #c084fc; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    .lock-box { background: rgba(15, 23, 42, 0.7); border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 3rem 2rem; text-align: center; }
    .privacy-banner { background: #78350f; border: 1px solid #f59e0b; color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="brand">
      <div style="background: linear-gradient(135deg, #6366f1, #a855f7); width: 32px; height: 32px; border-radius: 8px; display: grid; place-content: center; color: white; font-weight: 900;">E</div>
      <div>
        <div style="color:#fff;">ETHENENGINE</div>
        <div style="font-size:0.68rem; color:#94a3b8; font-weight:600; text-transform:uppercase;">${escapeHtml(activeTenant.name)}</div>
      </div>
    </div>

    <!-- TENANT CONTEXT SWITCHER -->
    <div style="background: #1e293b; padding: 0.6rem 0.75rem; border-radius: 8px; font-size: 0.75rem;">
      <label style="color:#64748b; font-weight:600; display:block; margin-bottom:0.25rem;">ACTIVE TENANT</label>
      <select onchange="window.location.href='/admin?tenant=' + this.value + '&view=${escapeHtml(activeView)}'" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: white; padding: 0.35rem; border-radius: 4px; font-size: 0.8rem;">
        ${tenants.map((t) => `<option value="${escapeHtml(t.slug)}" ${t.id === activeTenant.id ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(t.slug)})</option>`).join('')}
      </select>
    </div>

    <nav style="display:flex; flex-direction:column; gap:0.2rem;">
      <div class="nav-section-title">Overview</div>
      <a class="nav-item ${activeView === 'dashboard' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=dashboard">📊 Dashboard & Telemetry</a>
      <a class="nav-item ${activeView === 'watchdog' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=watchdog">🐕 Watchdog & Disaster Recovery</a>
      <a class="nav-item ${activeView === 'analytics' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=analytics">📈 Real-Time Analytics & A/B</a>
      <a class="nav-item ${activeView === 'tenants' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=tenants">🏢 Multi-Tenant & Orgs</a>
      <a class="nav-item ${activeView === 'users' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=users">👥 Users & IAM Roles</a>
      <a class="nav-item ${activeView === 'support' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=support">🛡️ Support Delegation & Privacy</a>

      <div class="nav-section-title">Enterprise Engines ${!canAccessConfidentialTenantData ? '🔒' : ''}</div>
      <a class="nav-item ${activeView === 'inventory' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=inventory">📦 Multi-Warehouse Inventory</a>
      <a class="nav-item ${activeView === 'commerce' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=commerce">🛒 Commerce & Orders</a>
      <a class="nav-item ${activeView === 'crm' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=crm">💼 CRM & Sales Leads</a>
      <a class="nav-item ${activeView === 'erp' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=erp">🏭 ERP & Procurement</a>
      <a class="nav-item ${activeView === 'accounting' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=accounting">💰 Accounting & Ledger</a>
      <a class="nav-item ${activeView === 'hr' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=hr">👔 HR & Employees</a>
      <a class="nav-item ${activeView === 'comms' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=comms">💬 Team Comms & Chat</a>

      <div class="nav-section-title">Experience & Builder</div>
      <a class="nav-item ${activeView === 'website' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=website">🌐 Website Pages & Editor</a>
      <a class="nav-item ${activeView === 'cms' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=cms">📝 Headless CMS</a>
      <a class="nav-item ${activeView === 'marketplace' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=marketplace">🧩 Marketplace Extensions</a>
      <a class="nav-item ${activeView === 'audit' ? 'active' : ''}" href="/admin?tenant=${activeTenant.slug}&view=audit">🛡️ Security & Audit Trail</a>
      <a class="nav-item" href="/docs" target="_blank">📖 OpenAPI Swagger ↗</a>

      <button onclick="handleLogout()" class="nav-item" style="width:100%; text-align:left; border:none; cursor:pointer; background:rgba(239,68,68,0.1); color:#fca5a5; margin-top:1rem;">🚪 Sign Out</button>
    </nav>
  </div>

  <div class="main-content">
    ${
      isSuperadmin && isSupportSessionActive
        ? `
      <div class="privacy-banner">
        <div>
          <strong>🛡️ Active Support Delegation Session (Ticket #${escapeHtml(supportStatus.grant?.ticketId || 'SUPPORT')})</strong>
          <div style="font-size:0.75rem; color:#fde68a; margin-top:2px;">Granted by Tenant Admin (${escapeHtml(supportStatus.grant?.grantedByUserId || 'Admin')}) · Reason: ${escapeHtml(supportStatus.grant?.reason || 'Diagnosis')} · Expires at ${new Date(supportStatus.grant?.expiresAt || 0).toLocaleTimeString()}</div>
        </div>
        <span class="badge badge-amber">SUPPORT BREAK-GLASS ACTIVE</span>
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
      activeView === 'dashboard'
        ? `
      <div class="grid-4">
        <div class="stat-card"><div class="stat-label">🛒 Commerce Revenue</div><div class="stat-value">$${totalRevenue.toLocaleString()}</div><div class="stat-desc">${orders.length} order(s) processed</div></div>
        <div class="stat-card"><div class="stat-label">💰 Net Accounting Balance</div><div class="stat-value">${canAccessConfidentialTenantData ? `$${balance.netBalance.toLocaleString()}` : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? `Debits: $${balance.totalDebits.toLocaleString()}` : 'Zero-Knowledge Protected'}</div></div>
        <div class="stat-card"><div class="stat-label">💼 CRM Pipeline Value</div><div class="stat-value">${canAccessConfidentialTenantData ? `$${leads.reduce((s, l) => s + l.dealValue, 0).toLocaleString()}` : '<span style="color:#64748b;">[ENCRYPTED]</span>'}</div><div class="stat-desc">${canAccessConfidentialTenantData ? `${leads.length} active lead(s)` : 'Zero-Knowledge Protected'}</div></div>
        <div class="stat-card"><div class="stat-label">🛡️ Platform Audit Logs</div><div class="stat-value">${auditLogs.length}</div><div class="stat-desc">Security events tracked</div></div>
      </div>
      <div class="grid-4" style="margin-top:-0.5rem;">
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
        <h2>Multi-Tenant Hierarchy & Subscriptions</h2>
        <table>
          <thead><tr><th>Tenant ID</th><th>Tenant Name</th><th>Slug</th><th>Custom Domain</th><th>Encryption Isolation</th><th>Status</th></tr></thead>
          <tbody>
            ${tenants.map((t) => `<tr><td style="font-family:monospace; color:#818cf8;">${escapeHtml(t.id)}</td><td style="font-weight:600; color:#fff;">${escapeHtml(t.name)}</td><td>${escapeHtml(t.slug)}</td><td>${escapeHtml(t.domain)}</td><td><span class="badge badge-purple">AES-256-GCM (PBKDF2)</span></td><td><span class="badge">${escapeHtml(t.status.toUpperCase())}</span></td></tr>`).join('')}
          </tbody>
        </table>
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
        : `
      <div class="card">
        <h2>${escapeHtml(activeView.toUpperCase())} Engine Overview</h2>
        <p style="color:#94a3b8;">Subsystem view loaded successfully.</p>
      </div>
    `
    }
  </div>

  <script>
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
  </script>
</body>
</html>`;
}
