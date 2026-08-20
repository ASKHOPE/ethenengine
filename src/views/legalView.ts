import { Tenant } from '../core/TenantManager.js';
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚖️ Legal House & Practice Management SaaS (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #131b2e; border-bottom: 1px solid #1e293b; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #eab308; display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #1e293b, #090d16); border: 1px solid #334155; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #fde047; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #fde047; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    .badge-purple { background: #581c87; color: #c084fc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">⚖️ ${escapeHtml(activeTenant.name)} Legal House Practice Engine</div>
    <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:#fde047; text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Law Firm Practice & Statute Knowledge Vault</h1>
      <p>Manage court motion timelines, search global law precedents, track billable attorney hours, and audit document compliance online.</p>
    </div>

    <div class="grid-3">
      <!-- LEGAL CASES -->
      <div class="card">
        <h3>
          <span>⚖️ Active Legal Matters & Cases</span>
          <span class="badge badge-amber">${cases.length} Active</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${cases.map(c => `
            <div style="background:#090d16; border:1px solid #1e293b; padding:1rem; border-radius:8px;">
              <span class="badge badge-purple" style="font-size:0.65rem; margin-bottom:0.3rem;">${escapeHtml(c.caseNumber)}</span>
              <strong style="color:#f8fafc; font-size:0.92rem; display:block;">${escapeHtml(c.title)}</strong>
              <div style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0;">🏛️ ${escapeHtml(c.courtJurisdiction)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; margin-top:0.4rem;">
                <span style="color:#cbd5e1;">Lead: ${escapeHtml(c.leadCounsel)}</span>
                <span class="badge badge-amber">${escapeHtml(c.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- STATUTES & CASE LAW LIBRARY -->
      <div class="card">
        <h3>
          <span>📚 Statute & Case Law Library</span>
          <span class="badge badge-blue">${statutes.length} Indexed</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${statutes.map(s => `
            <div style="background:#090d16; border:1px solid #1e293b; padding:1rem; border-radius:8px;">
              <strong style="color:#fde047; font-size:0.88rem;">${escapeHtml(s.title)}</strong>
              <div style="font-size:0.75rem; color:#60a5fa; margin:0.2rem 0;">Citation: ${escapeHtml(s.citationNumber)}</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.5rem; font-style:italic;">"${escapeHtml(s.excerptText)}"</p>
              <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                ${s.tags.map(t => `<span class="badge badge-purple" style="font-size:0.62rem;">#${escapeHtml(t)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ATTORNEY BILLABLE TIME LOGS -->
      <div class="card">
        <h3>
          <span>⏱️ Billable Hours & Time Logs</span>
          <span class="badge badge-amber">${billables.length} Unbilled</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${billables.map(b => `
            <div style="background:#090d16; border:1px solid #1e293b; padding:0.85rem; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:#f8fafc; font-size:0.85rem;">${escapeHtml(b.attorneyName)}</strong>
                <span style="font-size:1rem; font-weight:800; color:#fde047;">$${b.totalFee.toLocaleString()}</span>
              </div>
              <div style="font-size:0.78rem; color:#94a3b8; margin-top:0.3rem;">${escapeHtml(b.serviceDescription)}</div>
              <div style="font-size:0.72rem; color:#60a5fa; margin-top:0.4rem;">${b.hoursSpent} hrs @ $${b.hourlyRate}/hr</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
