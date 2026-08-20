import { Tenant } from '../core/TenantManager.js';
import { AbodePropertyEngine } from '../capabilities/abode-property/AbodePropertyEngine.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderAbodeView(activeTenant: Tenant): string {
  const engine = new AbodePropertyEngine();
  const properties = engine.listProperties(activeTenant.id);
  const leases = engine.listLeases(activeTenant.id);
  const invoices = engine.listInvoices(activeTenant.id);
  const tickets = engine.listMaintenanceTickets(activeTenant.id);
  const payouts = engine.listOwnerPayouts(activeTenant.id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏢 Abode Rental & Property Management SaaS (${escapeHtml(activeTenant.name)})</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #06101e; color: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #0f1c30; border-bottom: 1px solid #1e2e48; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 0.6rem; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero { background: linear-gradient(135deg, #0f1c30, #06101e); border: 1px solid #1e2e48; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.75rem; color: #f8fafc; }
    .hero p { color: #34d399; max-width: 650px; margin: 0 auto 1.5rem auto; font-size: 0.95rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: #0f1c30; border: 1px solid #1e2e48; border-radius: 12px; padding: 1.5rem; }
    .card h3 { font-size: 1.1rem; color: #34d399; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">🏢 ${escapeHtml(activeTenant.name)} Abode Rental & Property Management</div>
    <a href="/admin?tenant=${escapeHtml(activeTenant.slug)}" style="color:#34d399; text-decoration:none; font-weight:600; font-size:0.85rem;">← Back to Admin Console</a>
  </div>

  <div class="container">
    <div class="hero">
      <h1>Multi-Property Rental & Tenant Management Engine</h1>
      <p>Oversee residential & commercial unit listings, digital tenant lease agreements, rent roll invoicing, maintenance dispatch tickets, and net owner payouts.</p>
    </div>

    <div class="grid-3">
      <!-- PROPERTY LISTINGS -->
      <div class="card">
        <h3>
          <span>🏠 Managed Properties</span>
          <span class="badge badge-green">${properties.length} Active</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${properties.map(p => `
            <div style="background:#06101e; border:1px solid #1e2e48; padding:1rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(p.title)}</strong>
              <div style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0;">📍 ${escapeHtml(p.address)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <span class="badge badge-green">$${p.monthlyRent.toLocaleString()}/mo</span>
                <span class="badge badge-blue">${escapeHtml(p.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- LEASES & RENT INVOICES -->
      <div class="card">
        <h3>
          <span>📄 Tenant Leases & Invoices</span>
          <span class="badge badge-amber">${invoices.length} Invoices</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${leases.map(l => `
            <div style="background:#06101e; border:1px solid #1e2e48; padding:0.85rem; border-radius:8px;">
              <strong style="color:#f8fafc; font-size:0.88rem;">${escapeHtml(l.tenantName)}</strong>
              <div style="font-size:0.75rem; color:#94a3b8; margin-top:0.2rem;">Lease: ${l.startDate} to ${l.endDate}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span style="font-size:0.85rem; font-weight:700; color:#34d399;">$${l.monthlyRent.toLocaleString()}/mo</span>
                <span class="badge badge-green">${escapeHtml(l.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MAINTENANCE DISPATCH TICKETS -->
      <div class="card">
        <h3>
          <span>🔧 Maintenance Tickets</span>
          <span class="badge badge-amber">${tickets.length} Active</span>
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${tickets.map(t => `
            <div style="background:#06101e; border:1px solid #1e2e48; padding:0.85rem; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                <strong style="color:#f8fafc; font-size:0.85rem;">${escapeHtml(t.category.toUpperCase())} Repair</strong>
                <span class="badge badge-amber">${escapeHtml(t.priority)}</span>
              </div>
              <p style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.4rem;">${escapeHtml(t.issueDescription)}</p>
              <div style="font-size:0.72rem; color:#34d399;">Vendor: ${escapeHtml(t.assignedVendorName || 'Dispatching...')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
