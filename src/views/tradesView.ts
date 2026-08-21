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
  <style>
    :root {
      --color-bg: #0b1320;
      --color-card: #131f33;
      --color-subcard: #0b1320;
      --color-border: #1e2e48;
      --color-heading: #f8fafc;
      --color-text-main: #f8fafc;
      --color-text-muted: #94a3b8;
      --color-primary: #f59e0b;
      --color-accent: #fbbf24;
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
    
    .cred-bar { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .cred-badge { background: var(--color-subcard); border: 1px solid var(--color-border); padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; color: #10b981; }
    
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card h3 { font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    
    .tier-box { background: var(--color-subcard); border: 1px solid var(--color-border); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
    .zip-form { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .zip-form input { flex: 1; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-subcard); color: var(--color-text-main); }
    .zip-form button { background: var(--color-primary); color: #fff; font-weight: 700; padding: 0.6rem 1rem; border: none; border-radius: 6px; cursor: pointer; }
    .theme-btn { background: var(--color-subcard); border: 1px solid var(--color-border); color: var(--color-text-main); font-weight: 700; font-size: 0.8rem; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">🛠️ ${escapeHtml(activeTenant.name)} Trades & Craftsmen Engine</div>
    <div style="display:flex; align-items:center; gap:1rem;">
      <button id="themeToggleBtn" onclick="toggleTheme()" class="theme-btn">☀️ Day Mode</button>
      <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:var(--color-primary); text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
    </div>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Custom Craftsmanship & Field Service Operations</h1>
      <p>Precision estimates, live work order schedules, verified credentials, and photo proof showcases for enterprise tradesmen.</p>
      <div class="cred-bar">
        <span class="cred-badge">🛡️ ${escapeHtml(credentials.stateJurisdiction)}</span>
        <span class="cred-badge">⭐ ${escapeHtml(credentials.bbbRating)}</span>
        <span class="cred-badge">🔒 Insured Policy: ${escapeHtml(credentials.insurancePolicyNumber)}</span>
      </div>
    </div>

    <!-- ESTIMATE CALCULATOR WIDGET -->
    <div class="card" style="background:var(--color-card); border:1px solid var(--color-primary);">
      <h3 style="color:var(--color-heading);">⚡ Instant Work Order Estimator & Zip Coverage Check</h3>
      <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1rem;">Enter your project details to calculate real-time material costs and service technician availability.</p>
      <div class="zip-form">
        <input type="text" id="estZip" placeholder="Enter Service Zip Code (e.g. 94105)" value="94105" />
        <input type="text" id="estType" placeholder="Job Scope (e.g. Electrical Rewiring)" value="Master Carpentry Build" />
        <button onclick="calcEstimate()">Calculate Estimate ↗</button>
      </div>
      <div id="estResult" style="display:none; margin-top:1rem; padding:1rem; background:var(--color-subcard); border-radius:8px; font-size:0.88rem; color:#10b981; font-weight:700;"></div>
    </div>

    <div class="grid-3">
      <!-- PORTFOLIO SHOWCASE -->
      <div class="card">
        <h3>
          <span>🖼️ Completed Builds</span>
          <span class="badge badge-green">${portfolio.length} Projects</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${portfolio.map(p => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:1rem; border-radius:8px;">
              <strong style="color:var(--color-heading); font-size:0.95rem;">${escapeHtml(p.title)}</strong>
              <div style="font-size:0.75rem; color:var(--color-text-muted); margin:0.3rem 0;">${escapeHtml(p.description)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <span class="badge badge-amber">$${p.projectCost.toLocaleString()}</span>
                <span style="font-size:0.75rem; color:var(--color-primary);">★ ${p.clientReview?.rating || 5}/5 (${escapeHtml(p.clientReview?.reviewerName || 'Client')})</span>
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
            <strong style="font-size:0.9rem; color:var(--color-heading);">Client: ${escapeHtml(q.customerName)} (${escapeHtml(q.tradeType.toUpperCase())})</strong>
            ${q.options.map(opt => `
              <div class="tier-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="badge ${opt.tierName === 'best' ? 'badge-amber' : opt.tierName === 'better' ? 'badge-green' : 'badge-blue'}">${opt.tierName.toUpperCase()} OPTION</span>
                  <span style="font-size:0.9rem; font-weight:700; color:var(--color-primary);">$${opt.totalPrice.toLocaleString()}</span>
                </div>
                <div style="font-weight:600; font-size:0.82rem; color:var(--color-heading); margin:0.3rem 0;">${escapeHtml(opt.title)}</div>
                <div style="font-size:0.72rem; color:var(--color-text-muted);">Warranty: ${escapeHtml(opt.warrantyPeriod)}</div>
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
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:0.85rem; border-radius:8px;">
              <strong style="color:var(--color-heading); font-size:0.88rem;">${escapeHtml(w.customerName)}</strong>
              <div style="font-size:0.75rem; color:var(--color-text-muted); margin:0.2rem 0;">📍 ${escapeHtml(w.address)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.82rem; color:var(--color-primary);">Tech: ${escapeHtml(w.assignedTechnician || 'Unassigned')}</span>
                <span class="badge badge-green">${escapeHtml(w.status)}</span>
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
        localStorage.setItem('trades_theme', 'day');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('trades_theme', 'night');
      }
      updateBtn();
    }
    function updateBtn() {
      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = isDay ? '🌙 Night Mode' : '☀️ Day Mode';
    }
    (function() {
      if (localStorage.getItem('trades_theme') === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
      }
      updateBtn();
    })();

    async function checkZipCoverage() {
      const zip = document.getElementById('estZip')?.value || '94105';
      const res = await fetch('/api/trades/zip-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: zip })
      });
      const data = await res.json();
      const cov = data.coverage;
      const resultDiv = document.getElementById('estResult');
      if (resultDiv && cov) {
        resultDiv.style.display = 'block';
        if (cov.isCovered) {
          resultDiv.style.color = '#10b981';
          resultDiv.innerHTML = '✅ ' + zip + ' is in ' + cov.regionName + ' (Est. Tech Arrival: ' + cov.estimatedArrivalMinutes + ' mins)';
        } else {
          resultDiv.style.color = '#f87171';
          resultDiv.innerHTML = '❌ ' + zip + ' is outside our immediate emergency dispatch radius.';
        }
      }
    }

    function calcEstimate() {
      checkZipCoverage();
    }
  </script>
</body>
</html>`;
}
