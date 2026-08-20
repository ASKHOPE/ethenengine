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
  <link rel="stylesheet" href="/styles.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b101d; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #131b2e; border-bottom: 1px solid #1e293b; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #a78bfa; display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #131b2e, #0b101d); border: 1px solid #1e293b; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #c4b5fd; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #c4b5fd; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-purple { background: #5b21b6; color: #ddd6fe; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-amber { background: #78350f; color: #fde047; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">✈️ ${escapeHtml(activeTenant.name)} Travel, Mobility & Fleet Engine</div>
    <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:#c4b5fd; text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Corporate Vacation Retreats & Executive Chauffeur Fleet</h1>
      <p>Inspiring destination itineraries, transparent corporate pricing, luxury chauffeur deals, and self-drive rentals.</p>
    </div>

    <!-- TRIP & RETREAT SEARCH FILTER -->
    <div class="card" style="background:#0b101d; border:1px solid #8b5cf6;">
      <h3 style="color:#fff;">🔍 Destination & Budget Search Portal</h3>
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:0.75rem;">
        <input type="text" id="destInput" placeholder="Filter Destination (e.g. Switzerland, California)..." style="flex:1; padding:0.6rem; border-radius:6px; background:#131b2e; border:1px solid #1e293b; color:#fff;" />
        <select id="catSelect" style="padding:0.6rem; border-radius:6px; background:#131b2e; border:1px solid #1e293b; color:#fff;">
          <option value="">All Trip Categories</option>
          <option value="leadership">Leadership Retreat</option>
          <option value="tech_retreat">Tech Team Outing</option>
        </select>
        <button onclick="filterPackages()" style="background:#8b5cf6; color:#fff; font-weight:700; padding:0.6rem 1.2rem; border:none; border-radius:6px; cursor:pointer;">Search Packages</button>
      </div>
    </div>

    <div class="grid-3">
      <!-- CORPORATE TRIP PACKAGES -->
      <div class="card">
        <h3>
          <span>🏝️ Corporate Retreats</span>
          <span class="badge badge-purple">${packages.length} Active</span>
        </h3>
        <div id="pkgList" style="display:flex; flex-direction:column; gap:1rem;">
          ${packages.map(p => `
            <div style="background:#0b101d; border:1px solid #1e293b; padding:1rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(p.title)}</strong>
              <div style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0;">📍 ${escapeHtml(p.destination)} (${p.durationDays} Days)</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <span class="badge badge-green">$${p.pricePerEmployee.toLocaleString()}/person</span>
                <span class="badge badge-purple">Max ${p.maxEmployees} Employees</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- LUXURY FLEET INVENTORY & ADDONS -->
      <div class="card">
        <h3>
          <span>🚘 Executive Chauffeur Fleet</span>
          <span class="badge badge-green">${fleet.length} Vehicles</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${fleet.map(v => `
            <div style="background:#0b101d; border:1px solid #1e293b; padding:0.85rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.88rem;">${escapeHtml(v.make)} ${escapeHtml(v.model)} (${v.year})</strong>
              <div style="font-size:0.72rem; color:#94a3b8; margin:0.2rem 0;">Plate: ${escapeHtml(v.licensePlate)} | ${v.features.join(', ')}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.85rem; font-weight:700; color:#34d399;">$${v.dailyRate}/day</span>
                <span class="badge badge-green">${v.isAvailable ? 'AVAILABLE' : 'BOOKED'}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <h4 style="color:#c4b5fd; margin-top:1.25rem; font-size:0.85rem;">✨ VIP Rental Add-Ons</h4>
        <div style="display:flex; flex-direction:column; gap:0.4rem; margin-top:0.5rem;">
          ${addons.map(a => `
            <div style="font-size:0.75rem; background:#0b101d; padding:0.4rem 0.6rem; border-radius:4px; display:flex; justify-content:space-between;">
              <span style="color:#fff;">${escapeHtml(a.name)}</span>
              <span style="color:#34d399;">+$${a.dailyPrice}/day</span>
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
            <div style="background:#0b101d; border:1px solid #1e293b; padding:0.85rem; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:#fff; font-size:0.85rem;">${escapeHtml(r.reviewerName)}</strong>
                <span class="badge badge-amber">${escapeHtml(r.source)}</span>
              </div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0;">"${escapeHtml(r.comment)}"</p>
              <div style="font-size:0.7rem; color:#fde047;">★★★★★ Verified Corporate Trip</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>

  <script>
    async function filterPackages() {
      const dest = document.getElementById('destInput').value;
      const cat = document.getElementById('catSelect').value;
      const res = await fetch('/api/travel/search?destination=' + encodeURIComponent(dest) + '&category=' + encodeURIComponent(cat));
      const data = await res.json();
      const listDiv = document.getElementById('pkgList');
      listDiv.innerHTML = data.packages.map(p => \`
        <div style="background:#0b101d; border:1px solid #1e293b; padding:1rem; border-radius:8px;">
          <strong style="color:#f8fafc; font-size:0.95rem;">\${p.title}</strong>
          <div style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0;">📍 \${p.destination} (\${p.durationDays} Days)</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
            <span class="badge badge-green">$\${p.pricePerEmployee.toLocaleString()}/person</span>
            <span class="badge badge-purple">Max \${p.maxEmployees} Employees</span>
          </div>
        </div>
      \`).join('');
    }
  </script>
</body>
</html>`;
}
