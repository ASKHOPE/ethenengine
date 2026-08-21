import { Tenant } from '../core/CorePlatformManager.js';
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
  const tieredQuotes = engine.listTieredQuotes(activeTenant.id);
  const credentials = engine.getCredentials(activeTenant.id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛠️ Tradesmen & Craftsmen Portfolio SaaS (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1320; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #131f33; border-bottom: 1px solid #1e2e48; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #f59e0b; display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #131f33, #0b1320); border: 1px solid #1e2e48; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #fbbf24; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    
    .cred-bar { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .cred-badge { background: #1e2e48; border: 1px solid #2d4366; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; color: #34d399; }
    
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #131f33; border: 1px solid #1e2e48; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #fbbf24; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    
    .tier-box { background: #0b1320; border: 1px solid #1e2e48; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
    .zip-form { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .zip-form input { flex: 1; padding: 0.6rem; border-radius: 6px; border: 1px solid #1e2e48; background: #0b1320; color: #fff; }
    .zip-form button { background: #f59e0b; color: #000; font-weight: 700; padding: 0.6rem 1rem; border: none; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">🛠️ ${escapeHtml(activeTenant.name)} Trades & Craftsmen Engine</div>
    <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:#fbbf24; text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Master Craftsman Showcase & Field Dispatch Engine</h1>
      <p>Showcase verified trade qualifications, before/after project galleries, tiered estimates (Good/Better/Best), and emergency dispatching.</p>

      <div class="cred-bar">
        <span class="cred-badge">🛡️ ${escapeHtml(credentials.stateJurisdiction)}</span>
        <span class="cred-badge">⭐ ${escapeHtml(credentials.bbbRating)}</span>
        <span class="cred-badge">🔒 Insured Policy: ${escapeHtml(credentials.insurancePolicyNumber)}</span>
      </div>
    </div>

    <!-- ZIP CODE COVERAGE CHECKER -->
    <div class="card" style="background:#0b1320; border:1px solid #f59e0b;">
      <h3 style="color:#fff;">📍 Instant Service Area Coverage Checker</h3>
      <p style="font-size:0.85rem; color:#94a3b8;">Enter your local ZIP code to check emergency dispatch availability in your area.</p>
      <div class="zip-form">
        <input type="text" id="zipInput" placeholder="Enter ZIP Code (e.g. 95110, 94107, 90210)..." value="95110" />
        <button onclick="checkZipCoverage()">Check Coverage</button>
      </div>
      <div id="zipResult" style="margin-top:0.75rem; font-size:0.85rem; font-weight:600; color:#34d399;">✅ 95110 is in Primary Dispatch Zone (Estimated Tech Arrival: 25 mins)</div>
    </div>

    <div class="grid-3">
      <!-- PORTFOLIO SHOWCASE -->
      <div class="card">
        <h3>
          <span>🖼️ Project Gallery</span>
          <span class="badge badge-green">${portfolio.length} Projects</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${portfolio.map(p => `
            <div style="background:#0b1320; border:1px solid #1e2e48; padding:1rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(p.title)}</strong>
              <p style="font-size:0.78rem; color:#94a3b8; margin:0.4rem 0;">${escapeHtml(p.description)}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <span class="badge badge-amber">$${p.projectCost.toLocaleString()}</span>
                <span style="font-size:0.75rem; color:#fde047;">★ ${p.clientReview?.rating || 5}/5 (${escapeHtml(p.clientReview?.reviewerName || 'Client')})</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- TIERED GOOD / BETTER / BEST ESTIMATES -->
      <div class="card">
        <h3>
          <span>📊 Good / Better / Best Proposals</span>
          <span class="badge badge-amber">${tieredQuotes.length} Tiered Quotes</span>
        </h3>
        ${tieredQuotes.map(q => `
          <div style="margin-bottom:1rem;">
            <strong style="font-size:0.9rem; color:#fff;">Client: ${escapeHtml(q.customerName)} (${escapeHtml(q.tradeType.toUpperCase())})</strong>
            ${q.options.map(opt => `
              <div class="tier-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="badge ${opt.tierName === 'best' ? 'badge-amber' : opt.tierName === 'better' ? 'badge-green' : 'badge-blue'}">${opt.tierName.toUpperCase()} OPTION</span>
                  <span style="font-size:0.9rem; font-weight:700; color:#34d399;">$${opt.totalPrice.toLocaleString()}</span>
                </div>
                <div style="font-weight:600; font-size:0.82rem; color:#fff; margin:0.3rem 0;">${escapeHtml(opt.title)}</div>
                <div style="font-size:0.72rem; color:#94a3b8;">Warranty: ${escapeHtml(opt.warrantyPeriod)}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <!-- DISPATCHED WORK ORDERS -->
      <div class="card">
        <h3>
          <span>📋 Active Work Orders</span>
          <span class="badge badge-blue">${workOrders.length} Dispatched</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${workOrders.map(w => `
            <div style="background:#0b1320; border:1px solid #1e2e48; padding:0.85rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.88rem;">${escapeHtml(w.customerName)}</strong>
              <div style="font-size:0.75rem; color:#94a3b8; margin:0.2rem 0;">📍 ${escapeHtml(w.address)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.82rem; color:#fbbf24;">Tech: ${escapeHtml(w.assignedTechnician || 'Unassigned')}</span>
                <span class="badge badge-green">${escapeHtml(w.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>

  <script>
    async function checkZipCoverage() {
      const zip = document.getElementById('zipInput').value;
      const res = await fetch('/api/trades/zip-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: zip })
      });
      const data = await res.json();
      const cov = data.coverage;
      const resultDiv = document.getElementById('zipResult');
      if (cov.isCovered) {
        resultDiv.style.color = '#34d399';
        resultDiv.innerHTML = '✅ ' + zip + ' is in ' + cov.regionName + ' (Est. Tech Arrival: ' + cov.estimatedArrivalMinutes + ' mins)';
      } else {
        resultDiv.style.color = '#f87171';
        resultDiv.innerHTML = '❌ ' + zip + ' is outside our immediate emergency dispatch radius. Contact support for scheduling.';
      }
    }
  </script>
</body>
</html>`;
}
