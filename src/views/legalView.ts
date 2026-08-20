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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0a09; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #1c1917; border-bottom: 1px solid #292524; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #f59e0b; display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #1c1917, #0c0a09); border: 1px solid #292524; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #fde047; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #1c1917; border: 1px solid #292524; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #fde047; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">⚖️ ${escapeHtml(activeTenant.name)} Legal House & Practice Engine</div>
    <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:#fde047; text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Court Case Management & Practice Engine</h1>
      <p>Centralized case tracking, AI contract risk analysis, docketing deadline calendar, IOLTA client trust vaults, and secure client portals.</p>
    </div>

    <!-- SECURE CLIENT PORTAL PREVIEW -->
    <div class="card" style="background:#0c0a09; border:1px solid #f59e0b;">
      <h3 style="color:#fff;">🔒 Encrypted Client Portal Preview (Client: Acme Media)</h3>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
        <span style="font-size:0.85rem; color:#94a3b8;">IOLTA Trust Retainer Balance: <strong style="color:#34d399;">$${portalData.trustBalance.toLocaleString()}</strong></span>
        <span class="badge badge-green">AUDITED & COMPLIANT</span>
      </div>
      <div style="margin-top:0.75rem; font-size:0.78rem; color:#d6d3d1;">Active Cases Tracked: ${portalData.activeCases.length} | Upcoming Court Deadlines: ${portalData.upcomingDeadlines.length}</div>
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
            <div style="background:#0c0a09; border:1px solid #292524; padding:0.85rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.88rem;">${escapeHtml(a.name)}</strong>
              <div style="font-size:0.72rem; color:#fde047; margin:0.2rem 0;">${escapeHtml(a.title)}</div>
              <p style="font-size:0.75rem; color:#a8a29e; margin-bottom:0.4rem;">${escapeHtml(a.bioSummary)}</p>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.72rem; color:#34d399;">Trial Win Rate: ${a.winRatePercent}%</span>
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
            <div style="background:#0c0a09; border:1px solid #292524; padding:0.85rem; border-radius:8px;">
              <div style="font-size:0.72rem; color:#f59e0b;">Case #: ${escapeHtml(c.caseNumber)}</div>
              <strong style="color:#f8fafc; font-size:0.85rem;">${escapeHtml(c.title)}</strong>
              <div style="font-size:0.72rem; color:#a8a29e; margin-top:0.2rem;">Jurisdiction: ${escapeHtml(c.courtJurisdiction)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.75rem; color:#fde047;">Counsel: ${escapeHtml(c.leadCounsel)}</span>
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
            <div style="background:#0c0a09; border:1px solid #292524; padding:0.85rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.85rem;">${escapeHtml(s.documentTitle)}</strong>
              <div style="margin:0.4rem 0;">
                ${s.aiKeyTakeaways.map(t => `<div style="font-size:0.72rem; color:#d6d3d1;">• ${escapeHtml(t)}</div>`).join('')}
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span class="badge badge-green">Risk: ${escapeHtml(s.riskLevel.toUpperCase())}</span>
                <span style="font-size:0.7rem; color:#a8a29e;">Analyzed Today</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
