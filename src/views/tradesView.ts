import { Tenant } from '../core/TenantManager.js';
import { TradesCraftEngine } from '../capabilities/trades-craft/TradesCraftEngine.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderTradesView(activeTenant: Tenant): string {
  const engine = new TradesCraftEngine();
  const portfolio = engine.listPortfolio(activeTenant.id);
  const workOrders = engine.listWorkOrders(activeTenant.id);
  const quotes = engine.listQuotes(activeTenant.id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛠️ Trades & Craftsmen SaaS Hub (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #1e293b; border-bottom: 1px solid #334155; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 0.6rem; }
    .nav-links { display: flex; gap: 1rem; }
    .nav-links a { color: #94a3b8; text-decoration: none; font-size: 0.88rem; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 6px; }
    .nav-links a:hover { background: #334155; color: #fff; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #94a3b8; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #38bdf8; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    .btn { background: #0284c7; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-decoration: none; }
    .btn:hover { background: #0369a1; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; margin-top: 0.5rem; }
    th, td { padding: 0.75rem; border-bottom: 1px solid #334155; }
    th { color: #64748b; font-size: 0.75rem; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">🛠️ ${escapeHtml(activeTenant.name)} Trades & Craftsmen SaaS</div>
    <div class="nav-links">
      <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}">← Back to Admin Console</a>
    </div>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Master Craftsmanship & Trades Portfolio Platform</h1>
      <p>Showcase completed projects, dispatch work orders, issue live estimates, and capture emergency customer service calls instantly.</p>
      <button onclick="alert('⚡ Emergency Dispatch Hotline Active!')" class="btn" style="background:#dc2626;">🚨 Request Emergency Service</button>
    </div>

    <div class="grid-3">
      <!-- PORTFOLIO SHOWCASE -->
      <div class="card">
        <h3>
          <span>🖼️ Project Portfolio</span>
          <span class="badge badge-blue">${portfolio.length} Projects</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${portfolio.map(p => `
            <div style="background:#0f172a; border:1px solid #334155; padding:1rem; border-radius:8px;">
              <strong style="color:#f8fafc; display:block; margin-bottom:0.25rem;">${escapeHtml(p.title)}</strong>
              <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:0.5rem;">${escapeHtml(p.description)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
                <span class="badge badge-amber">$${p.projectCost.toLocaleString()}</span>
                <span style="color:#10b981; font-weight:700;">★ ${p.clientReview?.rating || 5}.0 (${escapeHtml(p.clientReview?.reviewerName || 'Client')})</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- WORK ORDERS -->
      <div class="card">
        <h3>
          <span>📋 Active Work Orders</span>
          <span class="badge badge-green">${workOrders.length} Scheduled</span>
        </h3>
        <table>
          <thead>
            <tr><th>Customer</th><th>Trade</th><th>Cost</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${workOrders.map(w => `
              <tr>
                <td><strong>${escapeHtml(w.customerName)}</strong><br><small style="color:#64748b;">${escapeHtml(w.address)}</small></td>
                <td><span class="badge badge-blue">${escapeHtml(w.tradeType)}</span></td>
                <td>$${w.estimatedCost}</td>
                <td><span class="badge badge-amber">${escapeHtml(w.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- ESTIMATES & QUOTES -->
      <div class="card">
        <h3>
          <span>🧮 Estimates & Quotes</span>
          <span class="badge badge-amber">${quotes.length} Quotes</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${quotes.map(q => `
            <div style="background:#0f172a; border:1px solid #334155; padding:0.85rem; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#f8fafc; font-size:0.85rem;">${escapeHtml(q.customerName)}</strong>
                <div style="font-size:0.75rem; color:#94a3b8;">${q.laborHours} hrs @ $${q.hourlyRate}/hr</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1rem; font-weight:800; color:#38bdf8;">$${q.totalPrice.toLocaleString()}</div>
                <span class="badge badge-green" style="font-size:0.65rem;">${escapeHtml(q.status)}</span>
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
