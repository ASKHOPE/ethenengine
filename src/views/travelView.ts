import { Tenant } from '../core/CorePlatformManager.js';
import { TravelFleetEngine } from '../capabilities/travel-fleet/TravelFleetEngine.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderTravelView(activeTenant: Tenant): string {
  const engine = new TravelFleetEngine();
  const fleet = engine.listFleet(activeTenant.id);
  const packages = engine.listCorporatePackages(activeTenant.id);
  const bookings = engine.listBookings(activeTenant.id);
  const addons = engine.listRentalAddons();
  const reviews = engine.listSocialReviews();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>✈️ Travel, Mobility & Corporate Fleet SaaS (${escapeHtml(activeTenant.name)})</title>
  <style>
    :root {
      --color-bg: #0b101d;
      --color-card: #131b2e;
      --color-subcard: #0b101d;
      --color-border: #1e293b;
      --color-heading: #f8fafc;
      --color-text-main: #f8fafc;
      --color-text-muted: #94a3b8;
      --color-primary: #8b5cf6;
      --color-accent: #c4b5fd;
    }

    [data-theme="day"] {
      --color-bg: #f8fafc;
      --color-card: #ffffff;
      --color-subcard: #f1f5f9;
      --color-border: #cbd5e1;
      --color-heading: #0f172a;
      --color-text-main: #1e293b;
      --color-text-muted: #64748b;
      --color-primary: #7c3aed;
      --color-accent: #6d28d9;
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
    .badge-purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .badge-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .theme-btn { background: var(--color-subcard); border: 1px solid var(--color-border); color: var(--color-text-main); font-weight: 700; font-size: 0.8rem; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">✈️ ${escapeHtml(activeTenant.name)} Travel, Mobility & Fleet Engine</div>
    <div style="display:flex; align-items:center; gap:1rem;">
      <button id="themeToggleBtn" onclick="toggleTheme()" class="theme-btn">☀️ Day Mode</button>
      <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:var(--color-primary); text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
    </div>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Corporate Vacation Retreats & Executive Chauffeur Fleet</h1>
      <p>Inspiring destination itineraries, transparent corporate pricing, luxury chauffeur deals, and self-drive rentals.</p>
    </div>

    <!-- TRIP & RETREAT SEARCH FILTER -->
    <div class="card" style="background:var(--color-card); border:1px solid var(--color-primary);">
      <h3 style="color:var(--color-heading);">🔍 Destination & Budget Search Portal</h3>
      <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1rem;">
        <input type="text" id="destInput" placeholder="Search Destination (e.g. Hawaii, Lake Tahoe, Swiss Alps)..." style="flex:2; padding:0.6rem; border-radius:6px; border:1px solid var(--color-border); background:var(--color-subcard); color:var(--color-text-main);" />
        <select id="catSelect" style="flex:1; padding:0.6rem; border-radius:6px; border:1px solid var(--color-border); background:var(--color-subcard); color:var(--color-text-main);">
          <option value="all">All Trip Categories</option>
          <option value="Executive Retreat">Executive Retreat</option>
          <option value="Team Building">Team Building</option>
          <option value="Incentive Travel">Incentive Travel</option>
        </select>
        <button onclick="filterPackages()" style="background:var(--color-primary); color:#fff; font-weight:700; padding:0.6rem 1.25rem; border:none; border-radius:6px; cursor:pointer;">Search Itineraries</button>
      </div>
    </div>

    <div class="grid-3">
      <!-- CORPORATE PACKAGES -->
      <div class="card">
        <h3>
          <span>🏝️ Corporate Retreats</span>
          <span class="badge badge-purple">${packages.length} Itineraries</span>
        </h3>
        <div id="pkgList" style="display:flex; flex-direction:column; gap:1rem;">
          ${packages.map(p => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:1rem; border-radius:8px;">
              <strong style="color:var(--color-heading); font-size:0.95rem;">${escapeHtml(p.title)}</strong>
              <div style="font-size:0.75rem; color:var(--color-text-muted); margin:0.3rem 0;">📍 ${escapeHtml(p.destination)} (${p.durationDays} Days)</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <span class="badge badge-green">$${p.pricePerEmployee.toLocaleString()}/person</span>
                <span class="badge badge-purple">Max ${p.maxEmployees} Employees</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MOBILITY & CHAUFFEUR FLEET -->
      <div class="card">
        <h3>
          <span>🚗 Chauffeur & Mobility Fleet</span>
          <span class="badge badge-green">${fleet.length} Vehicles</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${fleet.map(v => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:0.85rem; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--color-heading); font-size:0.88rem;">${escapeHtml(v.make)} ${escapeHtml(v.model)} (${v.year})</strong>
                <span class="badge ${v.isAvailable ? 'badge-green' : 'badge-amber'}">${v.isAvailable ? 'AVAILABLE' : 'BOOKED'}</span>
              </div>
              <div style="font-size:0.75rem; color:var(--color-text-muted); margin:0.25rem 0;">Type: ${escapeHtml(v.fleetType.replace('_', ' ').toUpperCase())} · Plate: ${escapeHtml(v.licensePlate)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.85rem; font-weight:700; color:var(--color-primary);">$${v.dailyRate}/day</span>
                <span style="font-size:0.72rem; color:var(--color-text-muted);">${escapeHtml(v.features.join(', '))}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- TRIPADVISOR SOCIAL PROOF REVIEWS -->
      <div class="card">
        <h3>
          <span>⭐ TripAdvisor Social Proof</span>
          <span class="badge badge-amber">5.0 Star Rating</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${reviews.map(r => `
            <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:0.85rem; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--color-heading); font-size:0.85rem;">${escapeHtml(r.reviewerName)}</strong>
                <span class="badge badge-amber">${escapeHtml(r.source)}</span>
              </div>
              <p style="font-size:0.75rem; color:var(--color-text-muted); margin:0.3rem 0;">"${escapeHtml(r.comment)}"</p>
              <div style="font-size:0.7rem; color:#f59e0b;">★★★★★ Verified Corporate Trip</div>
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
        localStorage.setItem('travel_theme', 'day');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('travel_theme', 'night');
      }
      updateBtn();
    }
    function updateBtn() {
      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = isDay ? '🌙 Night Mode' : '☀️ Day Mode';
    }
    (function() {
      if (localStorage.getItem('travel_theme') === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
      }
      updateBtn();
    })();

    async function filterPackages() {
      const dest = document.getElementById('destInput')?.value || '';
      const cat = document.getElementById('catSelect')?.value || 'all';
      const res = await fetch('/api/travel/search?destination=' + encodeURIComponent(dest) + '&category=' + encodeURIComponent(cat));
      const data = await res.json();
      const listDiv = document.getElementById('pkgList');
      if (listDiv && data.packages) {
        listDiv.innerHTML = data.packages.map(p => \`
          <div style="background:var(--color-subcard); border:1px solid var(--color-border); padding:1rem; border-radius:8px;">
            <strong style="color:var(--color-heading); font-size:0.95rem;">\${p.title}</strong>
            <div style="font-size:0.75rem; color:var(--color-text-muted); margin:0.3rem 0;">📍 \${p.destination} (\${p.durationDays} Days)</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
              <span class="badge badge-green">$\${p.pricePerEmployee.toLocaleString()}/person</span>
              <span class="badge badge-purple">Max \${p.maxEmployees} Employees</span>
            </div>
          </div>
        \`).join('');
      }
    }
  </script>
</body>
</html>`;
}
