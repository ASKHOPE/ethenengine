import { Tenant } from '../core/TenantManager.js';
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>✈️ Travel, Mobility & Corporate Fleet SaaS (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #16203a; border-bottom: 1px solid #233258; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #a855f7; display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #1e1b4b, #0b1329); border: 1px solid #3730a3; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #a5b4fc; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #16203a; border: 1px solid #233258; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #c084fc; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-purple { background: #581c87; color: #c084fc; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-amber { background: #78350f; color: #fde047; }
    .btn { background: #8b5cf6; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-decoration: none; }
    .btn:hover { background: #7c3aed; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">✈️ ${escapeHtml(activeTenant.name)} Travel & Fleet Operations</div>
    <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:#a5b4fc; text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Corporate Vacation Trips & Chauffeur Fleet Operations</h1>
      <p>Company-sponsored retreats, executive chauffeur services, self-driving rentals, and customized employee holiday trip bundles.</p>
    </div>

    <div class="grid-3">
      <!-- CORPORATE PACKAGES -->
      <div class="card">
        <h3>
          <span>🌴 Corporate Trip Packages</span>
          <span class="badge badge-purple">${packages.length} Destinations</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${packages.map(p => `
            <div style="background:#0b1329; border:1px solid #233258; padding:1rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(p.title)}</strong>
              <div style="font-size:0.78rem; color:#a5b4fc; margin:0.3rem 0;">📍 ${escapeHtml(p.destination)} • ${p.durationDays} Days</div>
              <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.6rem;">Includes: ${p.inclusions.slice(0, 2).join(', ')}</div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge badge-green">$${p.pricePerEmployee}/employee</span>
                <span style="font-size:0.75rem; color:#cbd5e1;">Max ${p.maxEmployees} guests</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- VEHICLE FLEET -->
      <div class="card">
        <h3>
          <span>🚘 Luxury Vehicle Fleet</span>
          <span class="badge badge-green">${fleet.length} Available</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${fleet.map(v => `
            <div style="background:#0b1329; border:1px solid #233258; padding:1rem; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <strong style="color:#f8fafc;">${escapeHtml(v.make)} ${escapeHtml(v.model)} (${v.year})</strong>
                <span class="badge badge-amber">$${v.dailyRate}/day</span>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.4rem;">Plate: ${escapeHtml(v.licensePlate)} • Type: ${escapeHtml(v.fleetType)}</div>
              <div style="font-size:0.72rem; color:#a5b4fc;">✨ ${v.features.join(' • ')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- FLEET BOOKINGS -->
      <div class="card">
        <h3>
          <span>📅 Corporate & Fleet Bookings</span>
          <span class="badge badge-amber">${bookings.length} Confirmed</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${bookings.map(b => `
            <div style="background:#0b1329; border:1px solid #233258; padding:0.85rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.9rem;">${escapeHtml(b.customerName)}</strong>
              <div style="font-size:0.78rem; color:#a5b4fc; margin-top:0.2rem;">Dates: ${b.startDate} to ${b.endDate}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <span class="badge badge-purple">$${b.totalCost.toLocaleString()}</span>
                <span class="badge badge-green">${escapeHtml(b.status)}</span>
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
