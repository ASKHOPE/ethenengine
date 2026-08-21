import { Tenant } from '../core/CorePlatformManager.js';
import { LegalHouseEngine } from '../capabilities/legal-house/LegalHouseEngine.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderLegalView(activeTenant: Tenant): string {
  const engine = new LegalHouseEngine();
  const cases = engine.listCases(activeTenant.id);
  const statutes = engine.listStatutes(activeTenant.id);
  const billables = engine.listBillables(activeTenant.id);
  const summaries = engine.listSummaries(activeTenant.id);
  const attorneys = engine.listAttorneyProfiles();
  const portalData = engine.getClientPortalData(activeTenant.id, 'Acme Media');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚖️ Legal House & Practice SaaS (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    :root {
      --color-bg: #0c0a09;
      --color-card: #1c1917;
      --color-subcard: #0c0a09;
      --color-border: #292524;
      --color-heading: #f8fafc;
      --color-text-main: #f8fafc;
      --color-text-muted: #a8a29e;
      --color-primary: #f59e0b;
      --color-accent: #fde047;
    }

    [data-theme="day"] {
      --color-bg: #f8fafc;
      --color-card: #ffffff;
      --color-subcard: #f1f5f9;
      --color-border: #cbd5e1;
      --color-heading: #0f172a;
      --color-text-main: #1e293b;
      --color-text-muted: #64748b;
      --color-primary: #d97706;
      --color-accent: #b45309;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--color-bg); color: var(--color-text-main); display: flex; flex-direction: column; min-height: 100vh; transition: background 0.2s, color 0.2s; }
    .header { background: var(--color-card); border-bottom: 1px solid var(--color-border); padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: var(--color-primary); display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: var(--color-heading); }
    .hero p { color: var(--color-accent); max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card h3 { font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .theme-btn { background: var(--color-subcard); border: 1px solid var(--color-border); color: var(--color-text-main); font-weight: 700; font-size: 0.8rem; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">⚖️ ${escapeHtml(activeTenant.name)} Legal House & Practice Engine</div>
    <div style="display:flex; align-items:center; gap:1rem;">
      <button id="themeToggleBtn" onclick="toggleTheme()" class="theme-btn">☀️ Day Mode</button>
      <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:var(--color-primary); text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
    </div>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Court Case Management & Practice Engine</h1>
      <p>Centralized case tracking, AI contract risk analysis, docketing deadline calendar, IOLTA client trust vaults, and secure client portals.</p>
    </div>

    <!-- SECURE CLIENT PORTAL PREVIEW -->
    <div class="card" style="background:var(--color-card); border:1px solid var(--color-primary);">
      <h3 style="color:var(--color-heading);">🔒 Encrypted Client Portal Preview (Client: Acme Media)</h3>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
        <span style="font-size:0.85rem; color:var(--color-text-muted);">IOLTA Trust Retainer Balance: <strong style="color:#10b981;">$${portalData.trustBalance.toLocaleString()}</strong></span>
        <span class="badge badge-green">AUDITED & COMPLIANT</span>
      </div>
      <div style="margin-top:0.75rem; font-size:0.78rem; color:var(--color-text-muted);">Active Cases Tracked: ${portalData.activeCases.length} | Upcoming Court Deadlines: ${portalData.upcomingDeadlines.length}</div>
    </div>

    <div class="grid-3">
      <!-- ATTORNEY PROFILE DIRECTORY -->
      <div class="card">
        <h3>
          <span>👨‍⚖️ Lead Partners</span>
          <span class="badge badge-amber">${attorneys.length} Attorneys</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${attorneys.map(a => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:0.85rem; border-radius:8px;">
              <strong style="color:var(--color-heading); font-size:0.88rem;">${escapeHtml(a.name)}</strong>
              <div style="font-size:0.72rem; color:var(--color-primary); margin:0.2rem 0;">${escapeHtml(a.title)}</div>
              <p style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.4rem;">${escapeHtml(a.bioSummary)}</p>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.72rem; color:#10b981;">Trial Win Rate: ${a.winRatePercent}%</span>
                <span class="badge badge-amber">${a.practiceAreas[0]}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ACTIVE COURT MATTERS -->
      <div class="card">
        <h3>
          <span>⚖️ Active Court Cases</span>
          <span class="badge badge-amber">${cases.length} Active</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${cases.map(c => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:0.85rem; border-radius:8px;">
              <div style="font-size:0.72rem; color:var(--color-primary);">Case #: ${escapeHtml(c.caseNumber)}</div>
              <strong style="color:var(--color-heading); font-size:0.85rem;">${escapeHtml(c.title)}</strong>
              <div style="font-size:0.72rem; color:var(--color-text-muted); margin-top:0.2rem;">Jurisdiction: ${escapeHtml(c.courtJurisdiction)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.75rem; color:var(--color-primary);">Counsel: ${escapeHtml(c.leadCounsel)}</span>
                <span class="badge badge-amber">${escapeHtml(c.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- LEGAL BRIEF & CONTRACT CLAUSE SUMMARIES -->
      <div class="card">
        <h3>
          <span>📜 AI Contract Summaries</span>
          <span class="badge badge-amber">${summaries.length} Analysis</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${summaries.map(s => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:0.85rem; border-radius:8px;">
              <strong style="color:var(--color-heading); font-size:0.85rem;">${escapeHtml(s.documentTitle)}</strong>
              <div style="margin:0.4rem 0;">
                ${s.aiKeyTakeaways.map(t => `<div style="font-size:0.72rem; color:var(--color-text-muted);">• ${escapeHtml(t)}</div>`).join('')}
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span class="badge badge-green">Risk: ${escapeHtml(s.riskLevel.toUpperCase())}</span>
                <span style="font-size:0.7rem; color:var(--color-text-muted);">Analyzed Today</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>

  <script>
    function toggleTheme() {
      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      const target = isDay ? 'night' : 'day';
      if (target === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
        localStorage.setItem('legal_theme', 'day');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('legal_theme', 'night');
      }
      updateBtn();
    }
    function updateBtn() {
      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = isDay ? '🌙 Night Mode' : '☀️ Day Mode';
    }
    (function() {
      if (localStorage.getItem('legal_theme') === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
      }
      updateBtn();
    })();
  </script>
</body>
</html>`;
}
