// ETHENENGINE Native View: Full MeidaLLM SaaS Application Suite
// High-Fidelity Native UI with Sidebar Groups, Multi-Project Switcher, Kanban, AI Studio, Automations & Time Tracking

import { escapeHtml } from '../foundation/Sanitizer.js';

export function renderMeidaLLMView(tenantSlug: string = 'lioramedia'): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MeidaLLM Studio — Enterprise Creator Engine (${escapeHtml(tenantSlug.toUpperCase())})</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap">
  <style>
    :root {
      --color-bg: #070a12;
      --color-panel: #0d1322;
      --color-panel-hover: #111827;
      --color-sidebar-bg: #090e1a;
      --color-topbar-bg: #090e1a;
      --color-stat-bg: #111827;
      --color-subcard-bg: #090e1a;
      --color-border: #1f2937;
      --color-primary: #6366f1;
      --color-primary-hover: #4f46e5;
      --color-accent: #34d399;
      --color-heading: #ffffff;
      --color-text-main: #f8fafc;
      --color-text-muted: #94a3b8;
      --color-nav-hover: #111827;
      --color-input-bg: #0d1322;
    }

    [data-theme="day"] {
      --color-bg: #f1f5f9;
      --color-panel: #ffffff;
      --color-panel-hover: #f8fafc;
      --color-sidebar-bg: #ffffff;
      --color-topbar-bg: #ffffff;
      --color-stat-bg: #f8fafc;
      --color-subcard-bg: #f8fafc;
      --color-border: #e2e8f0;
      --color-primary: #4f46e5;
      --color-primary-hover: #4338ca;
      --color-accent: #059669;
      --color-heading: #0f172a;
      --color-text-main: #1e293b;
      --color-text-muted: #64748b;
      --color-nav-hover: #f1f5f9;
      --color-input-bg: #f8fafc;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--color-bg);
      color: var(--color-text-main);
      height: 100vh;
      display: flex;
      overflow: hidden;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* SIDEBAR */
    .sidebar {
      width: 270px;
      min-width: 270px;
      background: var(--color-sidebar-bg);
      border-right: 1px solid var(--color-border);
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      overflow-y: auto;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border);
    }
    .brand-logo {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 8px;
      display: grid;
      place-content: center;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.1rem;
    }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-heading);
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 0.7rem;
      color: var(--color-text-muted);
    }

    /* PROJECT SELECTOR */
    .project-selector {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.55rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-heading);
      cursor: pointer;
    }

    /* NAV GROUPS */
    .nav-group-title {
      font-size: 0.65rem;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0.85rem 0 0.3rem 0.4rem;
    }
    .nav-link {
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--color-text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .nav-link:hover {
      background: var(--color-nav-hover);
      color: var(--color-heading);
    }
    .nav-link.active {
      background: rgba(99, 102, 241, 0.15);
      color: var(--color-primary);
      border-left: 3px solid var(--color-primary);
      font-weight: 700;
    }

    /* MAIN CONTAINER */
    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--color-bg);
      overflow: hidden;
      transition: background-color 0.2s ease;
    }

    /* TOP BAR */
    .topbar {
      height: 56px;
      background: var(--color-topbar-bg);
      border-bottom: 1px solid var(--color-border);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .topbar-search {
      background: var(--color-input-bg);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 0.4rem 0.8rem;
      color: var(--color-text-main);
      font-size: 0.8rem;
      width: 280px;
      outline: none;
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn-create {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
      font-weight: 700;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      border: none;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .theme-toggle-btn {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      color: var(--color-text-main);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }
    .theme-toggle-btn:hover {
      background: var(--color-nav-hover);
    }

    /* CONTENT BODY */
    .view-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }

    /* SAAS CARDS & TABLES */
    .card {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card {
      background: var(--color-stat-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1rem;
    }
    .stat-label { font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; }
    .stat-val { font-size: 1.5rem; font-weight: 800; color: var(--color-heading); margin-top: 0.2rem; }
    .stat-sub { font-size: 0.75rem; color: var(--color-accent); margin-top: 0.2rem; }

    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; }
    th, td { padding: 0.75rem 0.85rem; border-bottom: 1px solid var(--color-border); color: var(--color-text-main); }
    th { color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.72rem; }
    
    .badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .badge-purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
    .badge-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    
    .btn { padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer; border: none; background: var(--color-primary); color: #fff; text-decoration: none; }
    .btn-sec { background: rgba(255,255,255,0.06); border: 1px solid var(--color-border); color: var(--color-text-main); }

    /* TOAST */
    #adminToast { position: fixed; bottom: 20px; right: 20px; background: var(--color-panel); border: 1px solid var(--color-primary); color: var(--color-text-main); padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: none; z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
  </style>
</head>
<body>

  <!-- SIDEBAR NAVIGATION MATRIX -->
  <aside class="sidebar">
    <div class="brand-header">
      <div class="brand-logo">M</div>
      <div>
        <div class="brand-title">MeidaLLM</div>
        <div class="brand-sub">Native Engine SaaS Suite</div>
      </div>
    </div>

    <!-- WORKSPACE SELECTOR -->
    <div class="project-selector">
      <span>📁 LIORAMEDIA Enterprise</span>
      <span style="color:#64748b;">▼</span>
    </div>

    <!-- 1. CORE HUBS & WORKSPACES -->
    <div class="nav-group-title">Hubs & Workspaces</div>
    <a onclick="showView('overview')" class="nav-link active" id="nav-overview"><span>📊 Executive Overview</span></a>
    <a onclick="showView('projects')" class="nav-link" id="nav-projects"><span>📁 Projects & Campaigns</span></a>
    <a onclick="showView('kanban')" class="nav-link" id="nav-kanban"><span>📋 Production Kanban</span></a>
    <a onclick="showView('goals')" class="nav-link" id="nav-goals"><span>🎯 OKRs & Campaign Goals</span></a>
    <a onclick="showView('ideas')" class="nav-link" id="nav-ideas"><span>💡 Idea Bank & Research</span></a>

    <!-- 2. CONTENT & CREATIVE STUDIO -->
    <div class="nav-group-title">Content & Creative</div>
    <a onclick="showView('aistudio')" class="nav-link" id="nav-aistudio"><span>🤖 AI Creative Wizard</span></a>
    <a onclick="showView('drafts')" class="nav-link" id="nav-drafts"><span>📝 Drafts & Long-Form</span></a>
    <a onclick="showView('database')" class="nav-link" id="nav-database"><span>🗄️ Collaborative Database</span></a>
    <a onclick="showView('media')" class="nav-link" id="nav-media"><span>🖼️ Media Asset Manager</span></a>

    <!-- 3. BUSINESS & OPERATIONS -->
    <div class="nav-group-title">Business & CRM</div>
    <a onclick="showView('crm')" class="nav-link" id="nav-crm"><span>🤝 Sponsor & Creator CRM</span></a>
    <a onclick="showView('erp')" class="nav-link" id="nav-erp"><span>💰 Studio ERP & Budget</span></a>
    <a onclick="showView('payroll')" class="nav-link" id="nav-payroll"><span>💵 Payroll & Payslips</span></a>
    <a onclick="showView('leaves')" class="nav-link" id="nav-leaves"><span>🏖️ PTO & Leave Balances</span></a>
    <a onclick="showView('team')" class="nav-link" id="nav-team"><span>👥 Team Office & Members</span></a>
    <a onclick="showView('inbox')" class="nav-link" id="nav-inbox"><span>📥 Direct Inbox & Chat</span></a>
    <a onclick="showView('helpdesk')" class="nav-link" id="nav-helpdesk"><span>🎫 Support & Helpdesk</span></a>

    <!-- 4. DISTRIBUTION & PERFORMANCE -->
    <div class="nav-group-title">Publishing & Delivery</div>
    <a onclick="showView('calendar')" class="nav-link" id="nav-calendar"><span>📅 Production Calendar</span></a>
    <a onclick="showView('channels')" class="nav-link" id="nav-channels"><span>🔌 Connected Channels</span></a>
    <a onclick="showView('clientportal')" class="nav-link" id="nav-clientportal"><span>🤝 Client Approvals</span></a>
    <a onclick="showView('analytics')" class="nav-link" id="nav-analytics"><span>📈 Reach & Performance</span></a>
    <a onclick="showView('performance')" class="nav-link" id="nav-performance"><span>📊 Creator KPI Scorecard</span></a>
    <a onclick="showView('timetracking')" class="nav-link" id="nav-timetracking"><span>⏱️ Time & Attendance</span></a>
    <a onclick="showView('sprints')" class="nav-link" id="nav-sprints"><span>🔄 Sprints & Gantt</span></a>

    <!-- 5. SYSTEM & AUTOMATION -->
    <div class="nav-group-title">System & Settings</div>
    <a onclick="showView('automations')" class="nav-link" id="nav-automations"><span>⚡ Automations Engine</span></a>
    <a onclick="showView('sitrep')" class="nav-link" id="nav-sitrep"><span>📄 Executive SITREP</span></a>
    <a onclick="showView('settings')" class="nav-link" id="nav-settings"><span>⚙️ Theme & Settings</span></a>
    <a href="/admin?tenant=${escapeHtml(tenantSlug)}&view=dashboard" class="nav-link" style="margin-top:auto; background:rgba(99,102,241,0.1); color:var(--color-primary); font-weight:700;"><span>← Back to Platform Admin</span></a>
  </aside>

  <!-- MAIN VIEW AREA -->
  <main class="app-main">
    <div class="topbar">
      <input type="text" class="topbar-search" placeholder="🔍 Search posts, scripts, tasks, ideas..." />
      <div class="topbar-actions">
        <button id="themeToggleBtn" onclick="toggleMeidaTheme()" class="theme-toggle-btn" title="Toggle Day/Night Mode">
          <span>☀️ Day Mode</span>
        </button>
        <button onclick="triggerAiPostGenerationModal()" class="btn-create">✨ New AI Content Draft</button>
        <div style="font-size:0.8rem; font-weight:700; color:var(--color-primary);">👤 Admin User</div>
      </div>
    </div>

    <div class="view-content" id="viewContentArea">
      <!-- DEFAULT VIEW: EXECUTIVE OVERVIEW -->
      <div class="card">
        <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem; font-family:'Outfit'; font-weight:800;">
          📊 MeidaLLM Executive Overview (${escapeHtml(tenantSlug.toUpperCase())})
        </h2>
        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Multi-Channel Reach</div><div class="stat-val" style="color:#38bdf8;">48,200</div><div class="stat-sub">Total Impressions</div></div>
          <div class="stat-card"><div class="stat-label">Engagement Rate</div><div class="stat-val" style="color:#34d399;">4.8%</div><div class="stat-sub">Likes & Retweets</div></div>
          <div class="stat-card"><div class="stat-label">Production Hours</div><div class="stat-val" style="color:#a855f7;">18.5 hrs</div><div class="stat-sub">$1,572 Billable</div></div>
          <div class="stat-card"><div class="stat-label">Connected Platforms</div><div class="stat-val" style="color:#fde047;">5 / 7 Active</div><div class="stat-sub">X, LinkedIn, YouTube</div></div>
        </div>

        <h3 style="font-size:0.95rem; font-weight:800; color:#fff; margin-bottom:0.75rem;">⚡ Active Campaign Releases</h3>
        <table>
          <thead><tr><th>Post ID</th><th>Title</th><th>Format</th><th>Channels</th><th>Status</th><th>Performance</th></tr></thead>
          <tbody>
            <tr>
              <td style="font-family:monospace; color:#38bdf8;">post_101</td>
              <td><strong>ETHENENGINE v2.0 Architecture Release Launch</strong></td>
              <td><span class="badge badge-blue">SHORT-FORM</span></td>
              <td>𝕏 X, 💼 LinkedIn</td>
              <td><span class="badge">PUBLISHED</span></td>
              <td>48,200 Impressions · 3,120 Clicks</td>
            </tr>
            <tr>
              <td style="font-family:monospace; color:#38bdf8;">post_102</td>
              <td><strong>Zero-Knowledge Security Deep Dive Video Storyboard</strong></td>
              <td><span class="badge badge-purple">VIDEO SCRIPT</span></td>
              <td>🎥 YouTube, 💼 LinkedIn</td>
              <td><span class="badge badge-amber">SCHEDULED</span></td>
              <td>Release set for Aug 22, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <div id="adminToast">✨ MeidaLLM Action Completed</div>

  <script>
    function showToast(msg) {
      const toast = document.getElementById('adminToast');
      if (toast) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2500);
      }
    }

    async function showView(viewKey) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeNav = document.getElementById('nav-' + viewKey);
      if (activeNav) activeNav.classList.add('active');

      const container = document.getElementById('viewContentArea');
      if (!container) return;

      if (viewKey === 'overview') {
        const res = await fetch('/api/media-publisher/analytics/summary');
        const summary = (await res.json()).summary || { totalImpressions: 48200, avgEngagementRate: 4.8, totalBillableHours: 18.5, connectedChannels: 5, totalPipelineValue: 25000, cac: 150, mrr: 12500, ltv: 48000 };
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; margin-bottom:1rem; font-family:'Outfit'; font-weight:800;">📊 MeidaLLM Executive Overview</h2>
            <div class="grid-4" style="margin-bottom:1.25rem;">
              <div class="stat-card"><div class="stat-label">Multi-Channel Reach</div><div class="stat-val" style="color:var(--color-primary);">\${summary.totalImpressions?.toLocaleString() || '48,200'}</div><div class="stat-sub">Total Impressions</div></div>
              <div class="stat-card"><div class="stat-label">Engagement Rate</div><div class="stat-val" style="color:var(--color-accent);">\${summary.avgEngagementRate || '4.8'}%</div><div class="stat-sub">Likes, Shares & Clicks</div></div>
              <div class="stat-card"><div class="stat-label">Monthly Recurring (MRR)</div><div class="stat-val" style="color:#a855f7;">$\${(summary.mrr || 12500).toLocaleString()}</div><div class="stat-sub">LTV: $\${(summary.ltv || 48000).toLocaleString()} · CAC: $\${summary.cac || 150}</div></div>
              <div class="stat-card"><div class="stat-label">Connected Platforms</div><div class="stat-val" style="color:#f59e0b;">\${summary.connectedChannels || 5} Active</div><div class="stat-sub">X, LinkedIn, YouTube, IG</div></div>
            </div>

            <h3 style="font-size:0.95rem; font-weight:800; color:var(--color-heading); margin-bottom:0.75rem;">⚡ Recent Campaign Releases</h3>
            <table>
              <thead><tr><th>Post ID</th><th>Title</th><th>Format</th><th>Channels</th><th>Status</th><th>Performance</th></tr></thead>
              <tbody>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">post_101</td>
                  <td><strong>ETHENENGINE v2.0 Architecture Release Launch</strong></td>
                  <td><span class="badge badge-blue">SHORT-FORM</span></td>
                  <td>𝕏 X, 💼 LinkedIn</td>
                  <td><span class="badge">PUBLISHED</span></td>
                  <td>48,200 Impressions · 3,120 Clicks</td>
                </tr>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">post_102</td>
                  <td><strong>Zero-Knowledge Security Deep Dive Video Storyboard</strong></td>
                  <td><span class="badge badge-purple">VIDEO SCRIPT</span></td>
                  <td>🎥 YouTube, 💼 LinkedIn</td>
                  <td><span class="badge badge-amber">SCHEDULED</span></td>
                  <td>Release set for Aug 22, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'projects') {
        const res = await fetch('/api/media-publisher/projects');
        const projects = (await res.json()).projects || [];
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">📁 Projects & Active Workspaces</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Manage creator workspaces, budget caps, and content focus areas.</p>
              </div>
              <button onclick="promptCreateProject()" class="btn" style="background:var(--color-primary);">+ New Campaign Project</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;">
              \${projects.map(p => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <h3 style="font-size:1rem; font-weight:800; color:var(--color-heading); margin:0;">\${p.name}</h3>
                    <span class="badge">\${p.status.toUpperCase()}</span>
                  </div>
                  <p style="font-size:0.8rem; color:var(--color-text-muted); line-height:1.4; margin-bottom:0.85rem;">\${p.description}</p>
                  <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.4rem;">
                    <span>Budget Spent</span>
                    <strong style="color:var(--color-heading);">$\${(p.spent || 0).toLocaleString()} / $\${(p.budgetLimit || 0).toLocaleString()}</strong>
                  </div>
                  <div style="width:100%; height:6px; background:var(--color-border); border-radius:3px; overflow:hidden; margin-bottom:0.85rem;">
                    <div style="width:\${Math.min(100, Math.round(((p.spent || 0)/(p.budgetLimit || 1))*100))}%; height:100%; background:var(--color-accent);"></div>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                    \${(p.contentFormats || []).map(f => \`<span class="badge badge-purple" style="font-size:0.65rem;">\${f}</span>\`).join('')}
                  </div>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'crm') {
        const res = await fetch('/api/media-publisher/crm');
        const leads = (await res.json()).leads || [];
        const totalPipeline = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">🤝 Sponsor & Creator CRM Pipeline</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Track brand sponsorships, creator collabs, and talent deals.</p>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); padding:0.4rem 0.8rem; border-radius:8px; font-size:0.8rem;">
                  Pipeline: <strong style="color:var(--color-accent); font-size:0.95rem;">$\${totalPipeline.toLocaleString()}</strong>
                </div>
                <button onclick="promptCreateLead()" class="btn" style="background:var(--color-primary);">+ Add Lead Deal</button>
              </div>
            </div>
            <table>
              <thead><tr><th>Prospect / Brand</th><th>Company</th><th>Creator Type</th><th>Deal Value</th><th>Stage</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                \${leads.map(l => \`
                  <tr>
                    <td><strong>\${l.name}</strong></td>
                    <td style="color:var(--color-text-muted);">\${l.company}</td>
                    <td><span class="badge badge-purple">\${l.creatorType.toUpperCase()}</span></td>
                    <td style="font-weight:700; color:var(--color-accent);">$\${l.dealValue.toLocaleString()}</td>
                    <td>
                      <select onchange="updateLeadStage('\${l.id}', this.value)" style="background:var(--color-stat-bg); border:1px solid var(--color-border); color:var(--color-text-main); font-size:0.75rem; padding:0.25rem 0.5rem; border-radius:4px;">
                        <option value="lead" \${l.dealStage === 'lead' ? 'selected' : ''}>Leads</option>
                        <option value="connected" \${l.dealStage === 'connected' ? 'selected' : ''}>Connected</option>
                        <option value="discussion" \${l.dealStage === 'discussion' ? 'selected' : ''}>Discussion</option>
                        <option value="active" \${l.dealStage === 'active' ? 'selected' : ''}>Active (Closed)</option>
                      </select>
                    </td>
                    <td><span class="badge \${l.statusTag === 'hot' ? 'badge-amber' : ''}">\${l.statusTag.toUpperCase()}</span></td>
                    <td><button onclick="showToast('Lead details: \${l.notes || 'No extra notes'}')" class="btn btn-sec" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Notes</button></td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'drafts') {
        const res = await fetch('/api/media-publisher/drafts');
        const drafts = (await res.json()).drafts || [];
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">📝 Structured Drafts & Long-Form Scripts</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Complete draft repository with SEO metadata, thesis hooks, and multi-channel copy.</p>
              </div>
              <button onclick="showView('aistudio')" class="btn" style="background:linear-gradient(135deg,#6366f1,#a855f7);">✨ Generate AI Script</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              \${drafts.map(d => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                    <div>
                      <h3 style="font-size:1rem; font-weight:800; color:var(--color-heading); margin:0 0 0.25rem;">\${d.title}</h3>
                      <div style="font-size:0.75rem; color:var(--color-text-muted);">Author: \${d.author} · Target Audience: \${d.audience} · Tone: \${d.tone}</div>
                    </div>
                    <span class="badge \${d.status === 'approved' ? '' : 'badge-amber'}">\${d.status.toUpperCase()}</span>
                  </div>
                  <div style="background:var(--color-panel); border:1px solid var(--color-border); border-radius:6px; padding:0.75rem; font-size:0.8rem; color:var(--color-text-main); margin:0.6rem 0;">
                    <strong>🪝 Hook:</strong> \${d.hook}<br/>
                    <strong style="margin-top:0.3rem; display:inline-block;">🎯 Thesis:</strong> \${d.thesis}
                  </div>
                  <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
                    <button onclick="showToast('SEO Title: \${d.seoTitle}')" class="btn btn-sec" style="font-size:0.72rem; padding:0.25rem 0.6rem;">🔍 SEO Meta</button>
                    <button onclick="showToast('𝕏 Caption: \${d.socialCaptionX}')" class="btn btn-sec" style="font-size:0.72rem; padding:0.25rem 0.6rem;">𝕏 Post Copy</button>
                    <button onclick="showToast('Draft scheduled for publication!')" class="btn" style="font-size:0.72rem; padding:0.25rem 0.6rem; background:var(--color-primary);">Publish →</button>
                  </div>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'erp') {
        const res = await fetch('/api/media-publisher/erp');
        const txs = (await res.json()).transactions || [];
        const totalExp = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalRev = txs.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">💰 Studio ERP & Budget Ledger</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Track campaign expenses, sponsor billing, GPU inference costs, and contractor fees.</p>
              </div>
              <div style="display:flex; gap:0.75rem;">
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); padding:0.4rem 0.8rem; border-radius:8px; font-size:0.8rem;">
                  Revenue: <strong style="color:var(--color-accent);">$\${totalRev.toLocaleString()}</strong> · Spend: <strong style="color:#ef4444;">$\${totalExp.toLocaleString()}</strong>
                </div>
                <button onclick="promptAddExpense()" class="btn" style="background:var(--color-primary);">+ Add Entry</button>
              </div>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead>
              <tbody>
                \${txs.map(t => \`
                  <tr>
                    <td style="font-family:monospace; font-size:0.78rem;">\${t.date}</td>
                    <td><span class="badge badge-purple">\${t.category}</span></td>
                    <td><strong>\${t.description}</strong></td>
                    <td><span class="badge \${t.type === 'revenue' ? '' : 'badge-amber'}">\${t.type.toUpperCase()}</span></td>
                    <td style="font-weight:800; color:\${t.type === 'revenue' ? 'var(--color-accent)' : '#f87171'};">$\${t.amount.toLocaleString()}</td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'ideas') {
        const res = await fetch('/api/media-publisher/ideas');
        const ideas = (await res.json()).ideas || [];
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">💡 Idea Bank & Research Vault</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Vote on viral topics and store deep research reports.</p>
              </div>
              <button onclick="promptCreateIdea()" class="btn" style="background:var(--color-primary);">+ Submit Idea</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
              \${ideas.map(i => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <span class="badge badge-purple">\${i.category}</span>
                    <button onclick="voteIdea('\${i.id}')" class="btn btn-sec" style="padding:0.2rem 0.5rem; font-size:0.72rem;">▲ Upvote (\${i.votes})</button>
                  </div>
                  <h3 style="font-size:0.95rem; font-weight:800; color:var(--color-heading); margin:0 0 0.4rem;">\${i.title}</h3>
                  <p style="font-size:0.78rem; color:var(--color-text-muted); line-height:1.4;">\${i.notes}</p>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'automations') {
        const res = await fetch('/api/media-publisher/automations');
        const rules = (await res.json()).rules || [];
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">⚡ Automations & Workflow Triggers</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Event-driven auto assignment, auto notifications, and scheduled webhook triggers.</p>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              \${rules.map(r => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="color:var(--color-heading); font-size:0.9rem;">\${r.name}</strong>
                    <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:2px;">Trigger: <code>\${r.triggerType || 'status_changed'}</code> → Action: <code>\${r.actionType || 'notify_team'}</code></div>
                  </div>
                  <button onclick="toggleRule('\${r.id}', \${!r.enabled})" class="btn \${r.enabled ? '' : 'btn-sec'}" style="padding:0.35rem 0.8rem; font-size:0.75rem;">
                    \${r.enabled ? '🟢 ENABLED' : '⚪ DISABLED'}
                  </button>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'sprints') {
        const [resCycles, resGantt] = await Promise.all([
          fetch('/api/media-publisher/sprint-cycles'),
          fetch('/api/media-publisher/gantt')
        ]);
        const cycles = (await resCycles.json()).cycles || [];
        const milestones = (await resGantt.json()).milestones || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800; margin-bottom:1rem;">🔄 Sprint Cycles & Production Gantt Timeline</h2>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
              \${cycles.map(c => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <h3 style="font-size:0.95rem; font-weight:800; color:var(--color-heading); margin:0;">\${c.name}</h3>
                    <span class="badge \${c.status === 'active' ? '' : 'badge-amber'}">\${c.status.toUpperCase()}</span>
                  </div>
                  <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.6rem;">\${c.startDate} → \${c.endDate}</div>
                  <div style="font-size:0.8rem; color:var(--color-heading); font-weight:700;">\${c.completedPostsCount} / \${c.goalPostsCount} Posts Completed</div>
                </div>\`).join('')}
            </div>

            <h3 style="font-size:0.95rem; font-weight:800; color:var(--color-heading); margin-bottom:0.75rem;">📅 Production Milestones</h3>
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              \${milestones.map(m => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:8px; padding:0.85rem;">
                  <div style="display:flex; justify-content:space-between; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">
                    <span>\${m.taskName} (\${m.owner})</span>
                    <span style="color:var(--color-accent);">\${m.completionPercent}%</span>
                  </div>
                  <div style="width:100%; height:6px; background:var(--color-border); border-radius:3px; overflow:hidden;">
                    <div style="width:\${m.completionPercent}%; height:100%; background:var(--color-primary);"></div>
                  </div>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'clientportal') {
        const res = await fetch('/api/media-publisher/client-reviews');
        const reviews = (await res.json()).reviews || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800; margin-bottom:1rem;">🤝 Client Review & Approval Portal</h2>
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              \${reviews.map(r => \`
                <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <strong style="color:var(--color-heading); font-size:0.95rem;">\${r.postTitle}</strong>
                    <span class="badge \${r.status === 'approved' ? '' : 'badge-amber'}">\${r.status.toUpperCase()}</span>
                  </div>
                  <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.5rem;">Reviewer: \${r.clientName} (\${r.clientEmail})</div>
                  <div style="background:var(--color-panel); border:1px solid var(--color-border); border-radius:6px; padding:0.6rem; font-size:0.8rem; color:var(--color-text-main); margin-bottom:0.75rem;">
                    💬 \${r.feedback || 'Pending client feedback.'}
                  </div>
                  <div style="display:flex; gap:0.4rem; justify-content:flex-end;">
                    <button onclick="respondReview('\${r.id}', 'approved')" class="btn" style="font-size:0.72rem; padding:0.25rem 0.6rem; background:var(--color-accent);">Approve ✓</button>
                    <button onclick="respondReview('\${r.id}', 'rejected')" class="btn btn-sec" style="font-size:0.72rem; padding:0.25rem 0.6rem; color:#f87171;">Request Changes</button>
                  </div>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'analytics') {
        const res = await fetch('/api/media-publisher/sitrep');
        const r = (await res.json()).report || {};
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800; margin-bottom:1rem;">📈 Reach, Performance & Business Metrics</h2>
            <div class="grid-4" style="margin-bottom:1.5rem;">
              <div class="stat-card"><div class="stat-label">Customer Acquisition (CAC)</div><div class="stat-val" style="color:var(--color-primary);">$150</div><div class="stat-sub">Spend per Customer</div></div>
              <div class="stat-card"><div class="stat-label">Monthly Recurring (MRR)</div><div class="stat-val" style="color:var(--color-accent);">$12,500</div><div class="stat-sub">+18% MoM</div></div>
              <div class="stat-card"><div class="stat-label">Customer Lifetime (LTV)</div><div class="stat-val" style="color:#a855f7;">$48,000</div><div class="stat-sub">LTV:CAC Ratio: 320x</div></div>
              <div class="stat-card"><div class="stat-label">Time to Value (TTV)</div><div class="stat-val" style="color:#f59e0b;">4.2 mins</div><div class="stat-sub">Telemetry Onboarding</div></div>
            </div>
            <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:8px; padding:1.25rem; color:var(--color-accent); font-family:monospace; font-size:0.85rem; line-height:1.6;">
              \${r.summary || 'Operations normal.'}
            </div>
          </div>\`;
      } else if (viewKey === 'goals') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">🎯 OKRs, Milestones & Campaign Goals</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Track strategic growth metrics, audience milestones, and sponsor deliverables.</p>
              </div>
              <button onclick="promptCreateGoal()" class="btn" style="background:var(--color-primary);">+ Add Goal</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <strong style="color:var(--color-heading); font-size:0.95rem;">Reach 100k Multi-Channel Impressions</strong>
                  <span class="badge" style="background:#065f46; color:#34d399;">ON TRACK</span>
                </div>
                <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.4rem;">Target: 100,000 Impressions by Sept 30, 2026</div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:var(--color-accent); margin-bottom:0.3rem;">
                  <span>Progress</span><span>48.2%</span>
                </div>
                <div style="width:100%; height:6px; background:var(--color-border); border-radius:3px; overflow:hidden;">
                  <div style="width:48.2%; height:100%; background:var(--color-accent);"></div>
                </div>
              </div>

              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <strong style="color:var(--color-heading); font-size:0.95rem;">Sign 3 Premium SaaS Brand Sponsors</strong>
                  <span class="badge badge-purple">2 / 3 SIGNED</span>
                </div>
                <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.4rem;">Target: $25,000 Pipeline MRR</div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:var(--color-primary); margin-bottom:0.3rem;">
                  <span>Progress</span><span>66.7%</span>
                </div>
                <div style="width:100%; height:6px; background:var(--color-border); border-radius:3px; overflow:hidden;">
                  <div style="width:66.7%; height:100%; background:var(--color-primary);"></div>
                </div>
              </div>

              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <strong style="color:var(--color-heading); font-size:0.95rem;">Complete 50 Long-Form Video Scripts</strong>
                  <span class="badge badge-amber">BEHIND</span>
                </div>
                <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.4rem;">Target: 50 Structured Scripts</div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:#f59e0b; margin-bottom:0.3rem;">
                  <span>Progress</span><span>24.0%</span>
                </div>
                <div style="width:100%; height:6px; background:var(--color-border); border-radius:3px; overflow:hidden;">
                  <div style="width:24%; height:100%; background:#f59e0b;"></div>
                </div>
              </div>
            </div>
          </div>\`;
      } else if (viewKey === 'database') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">🗄️ Collaborative Campaign Database</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Custom relational tables, creator rosters, outreach lists, and gear inventory.</p>
              </div>
              <button onclick="promptCreateTableRow()" class="btn" style="background:var(--color-primary);">+ Add Record</button>
            </div>
            <table>
              <thead><tr><th>Record ID</th><th>Resource / Talent</th><th>Category</th><th>Assigned Workspace</th><th>Status</th><th>Rate / Cost</th></tr></thead>
              <tbody>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">rec_01</td>
                  <td><strong>Alex Rivera (Senior Tech Writer)</strong></td>
                  <td><span class="badge badge-purple">CREATOR</span></td>
                  <td>LIORAMEDIA Core Studio</td>
                  <td><span class="badge">ACTIVE</span></td>
                  <td style="font-weight:700; color:var(--color-accent);">$85 / hr</td>
                </tr>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">rec_02</td>
                  <td><strong>Sony A7S III Studio Camera & Lens Kit</strong></td>
                  <td><span class="badge badge-blue">HARDWARE</span></td>
                  <td>Video Production Hub</td>
                  <td><span class="badge">DEPLOYED</span></td>
                  <td style="font-weight:700;">Asset #CAM-402</td>
                </tr>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">rec_03</td>
                  <td><strong>NVIDIA A100 GPU Inference Cluster</strong></td>
                  <td><span class="badge badge-amber">INFRASTRUCTURE</span></td>
                  <td>AI Creative Wizard Studio</td>
                  <td><span class="badge">ONLINE</span></td>
                  <td style="font-weight:700; color:var(--color-accent);">$1,850 / mo</td>
                </tr>
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'team') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">👥 Team Office & Studio Members</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Manage creator accounts, agency staff roles, and collaborator permissions.</p>
              </div>
              <button onclick="showToast('Inviting team member...')" class="btn" style="background:var(--color-primary);">+ Invite Member</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem; display:flex; align-items:center; gap:1rem;">
                <div style="width:44px; height:44px; border-radius:50%; background:#6366f1; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem;">A</div>
                <div>
                  <strong style="color:var(--color-heading); font-size:0.95rem;">Alex Rivera</strong>
                  <div style="font-size:0.75rem; color:var(--color-text-muted);">Lead Media Producer · alex@lioramedia.com</div>
                  <span class="badge" style="margin-top:0.3rem;">STUDIO ADMIN</span>
                </div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem; display:flex; align-items:center; gap:1rem;">
                <div style="width:44px; height:44px; border-radius:50%; background:#a855f7; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem;">S</div>
                <div>
                  <strong style="color:var(--color-heading); font-size:0.95rem;">Sarah Jenkins</strong>
                  <div style="font-size:0.75rem; color:var(--color-text-muted);">Motion Designer · sarah@lioramedia.com</div>
                  <span class="badge badge-purple" style="margin-top:0.3rem;">CREATOR</span>
                </div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1.25rem; display:flex; align-items:center; gap:1rem;">
                <div style="width:44px; height:44px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem;">D</div>
                <div>
                  <strong style="color:var(--color-heading); font-size:0.95rem;">David Chen</strong>
                  <div style="font-size:0.75rem; color:var(--color-text-muted);">Growth Engineer · david@lioramedia.com</div>
                  <span class="badge badge-blue" style="margin-top:0.3rem;">GROWTH</span>
                </div>
              </div>
            </div>
          </div>\`;
      } else if (viewKey === 'inbox') {
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800; margin-bottom:1rem;">📥 Direct Studio Inbox & Threaded Notes</h2>
            <div style="display:grid; grid-template-columns: 280px 1fr; gap:1rem; min-height:350px;">
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:8px; padding:0.75rem; display:flex; flex-direction:column; gap:0.5rem;">
                <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); text-transform:uppercase;">Recent Conversations</div>
                <div style="background:var(--color-panel); border:1px solid var(--color-primary); border-radius:6px; padding:0.6rem; cursor:pointer;">
                  <div style="font-weight:700; font-size:0.85rem; color:var(--color-heading);">Acme Cloud Sponsor</div>
                  <div style="font-size:0.72rem; color:var(--color-text-muted); margin-top:2px;">Draft review approved for YouTube...</div>
                </div>
                <div style="background:var(--color-panel); border:1px solid var(--color-border); border-radius:6px; padding:0.6rem; cursor:pointer;">
                  <div style="font-weight:700; font-size:0.85rem; color:var(--color-heading);">Alex Rivera</div>
                  <div style="font-size:0.72rem; color:var(--color-text-muted); margin-top:2px;">Zero-Knowledge storyboard updated.</div>
                </div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:8px; padding:1rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--color-heading); margin-bottom:0.75rem; border-bottom:1px solid var(--color-border); padding-bottom:0.5rem;">
                    💬 Acme Cloud Sponsor Thread
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.5rem;">
                    <div style="background:var(--color-panel); padding:0.6rem; border-radius:6px; font-size:0.8rem; color:var(--color-text-main); max-width:80%;">
                      <strong>Acme Cloud:</strong> We loved the script outline! Can you ensure the 10s mid-roll CTA is highlighted?
                    </div>
                    <div style="background:rgba(99,102,241,0.15); padding:0.6rem; border-radius:6px; font-size:0.8rem; color:var(--color-text-main); max-width:80%; align-self:flex-end;">
                      <strong>You:</strong> Absolutely, the CTA has been revised and placed at 02:45 in the storyboard!
                    </div>
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                  <input type="text" id="inboxMsg" class="topbar-search" style="flex:1;" placeholder="Type your reply..." />
                  <button onclick="sendInboxMessage()" class="btn" style="background:var(--color-primary);">Send</button>
                </div>
              </div>
            </div>
          </div>\`;
      } else if (viewKey === 'helpdesk') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">🎫 Enterprise Support & Helpdesk</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Ticket triage, SLA tracking, client escalations, and issue resolution.</p>
              </div>
              <button onclick="promptCreateTicket()" class="btn" style="background:var(--color-primary);">+ Open Support Ticket</button>
            </div>
            <table>
              <thead><tr><th>Ticket ID</th><th>Subject</th><th>Requester</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">TICK-801</td>
                  <td><strong>LinkedIn API Access Token Refresh Expired</strong></td>
                  <td>Alex Rivera</td>
                  <td><span class="badge badge-amber">HIGH</span></td>
                  <td><span class="badge">IN PROGRESS</span></td>
                  <td><button onclick="showToast('Re-authorizing LinkedIn OAuth connection...')" class="btn btn-sec" style="font-size:0.72rem; padding:0.2rem 0.5rem;">Resolve</button></td>
                </tr>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">TICK-802</td>
                  <td><strong>Client Portal Access Link Reset for Acme Cloud</strong></td>
                  <td>Acme Cloud Sponsor</td>
                  <td><span class="badge badge-blue">NORMAL</span></td>
                  <td><span class="badge">OPEN</span></td>
                  <td><button onclick="showToast('Access link regenerated & sent to client.')" class="btn btn-sec" style="font-size:0.72rem; padding:0.2rem 0.5rem;">Resolve</button></td>
                </tr>
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'calendar') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">📅 Master Production & Team Calendar</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Scheduled social drops, video recording shoots, standups, and PTO leaves.</p>
              </div>
              <button onclick="showToast('Opening event booking modal...')" class="btn" style="background:var(--color-primary);">+ Schedule Event</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:0.5rem; text-align:center;">
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">SUN</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">MON</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">TUE</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">WED</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">THU</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">FRI</div>
              <div style="font-size:0.75rem; font-weight:800; color:var(--color-text-muted); padding:0.4rem;">SAT</div>

              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:700;">17</div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:700;">18</div>
                <div style="background:rgba(99,102,241,0.2); color:var(--color-primary); font-size:0.65rem; padding:2px 4px; border-radius:3px; margin-top:2px;">Launch Thread</div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:700;">19</div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:700;">20</div>
                <div style="background:rgba(168,85,247,0.2); color:#a855f7; font-size:0.65rem; padding:2px 4px; border-radius:3px; margin-top:2px;">🎬 Studio Shoot</div>
              </div>
              <div style="background:var(--color-stat-bg); border:2px solid var(--color-primary); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-primary); font-weight:800;">21 (TODAY)</div>
                <div style="background:rgba(16,185,129,0.2); color:#34d399; font-size:0.65rem; padding:2px 4px; border-radius:3px; margin-top:2px;">🎥 YouTube Drop</div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:700;">22</div>
              </div>
              <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:6px; min-height:80px; padding:0.4rem; text-align:left;">
                <div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:700;">23</div>
              </div>
            </div>
          </div>\`;
      } else if (viewKey === 'payroll') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">💵 Creator Payroll & Payslip Statements</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Automated monthly contractor payments, tax withholdings, and hourly disbursements.</p>
              </div>
              <button onclick="showToast('Executing monthly payroll cycle...')" class="btn" style="background:var(--color-accent);">Run Monthly Payroll</button>
            </div>
            <div class="grid-4" style="margin-bottom:1.25rem;">
              <div class="stat-card"><div class="stat-label">Gross Payroll Distributed</div><div class="stat-val" style="color:var(--color-primary);">$14,200.00</div><div class="stat-sub">Monthly Cycle</div></div>
              <div class="stat-card"><div class="stat-label">Net Creator Earnings</div><div class="stat-val" style="color:var(--color-accent);">$12,780.00</div><div class="stat-sub">Disbursed via Stripe P2P</div></div>
              <div class="stat-card"><div class="stat-label">Tax & Withholdings</div><div class="stat-val" style="color:#f59e0b;">$1,420.00</div><div class="stat-sub">10.0% Standard Withholding</div></div>
              <div class="stat-card"><div class="stat-label">Active Contractors</div><div class="stat-val" style="color:var(--color-heading);">3 Paid</div><div class="stat-sub">100% On-Time Payouts</div></div>
            </div>
            <table>
              <thead><tr><th>Payslip ID</th><th>Member</th><th>Role</th><th>Hours Logged</th><th>Gross Pay</th><th>Status</th></tr></thead>
              <tbody>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">PS-2026-08-01</td>
                  <td>Alex Rivera</td>
                  <td>Lead Media Producer</td>
                  <td>120.5 hrs</td>
                  <td style="font-weight:700; color:var(--color-accent);">$10,242.50</td>
                  <td><span class="badge">PAID</span></td>
                </tr>
                <tr>
                  <td style="font-family:monospace; color:var(--color-primary);">PS-2026-08-02</td>
                  <td>Sarah Jenkins</td>
                  <td>Motion Designer</td>
                  <td>45.0 hrs</td>
                  <td style="font-weight:700; color:var(--color-accent);">$2,925.00</td>
                  <td><span class="badge">PAID</span></td>
                </tr>
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'leaves') {
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <div>
                <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800;">🏖️ PTO & Leave Balances</h2>
                <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:2px;">Submit time-off requests, view accrued leave quotas, and track approvals.</p>
              </div>
              <button onclick="promptCreateLeave()" class="btn" style="background:var(--color-primary);">+ Request Leave</button>
            </div>
            <div class="grid-4" style="margin-bottom:1.25rem;">
              <div class="stat-card"><div class="stat-label">Annual Quota</div><div class="stat-val" style="color:var(--color-primary);">25 Days</div><div class="stat-sub">Standard Full-Time Policy</div></div>
              <div class="stat-card"><div class="stat-label">Used PTO</div><div class="stat-val" style="color:#f59e0b;">5 Days</div><div class="stat-sub">Approved Leaves</div></div>
              <div class="stat-card"><div class="stat-label">Available Balance</div><div class="stat-val" style="color:var(--color-accent);">20 Days</div><div class="stat-sub">Remaining This Year</div></div>
              <div class="stat-card"><div class="stat-label">Pending Requests</div><div class="stat-val" style="color:var(--color-heading);">0 Pending</div><div class="stat-sub">Up to date</div></div>
            </div>
          </div>\`;
      } else if (viewKey === 'performance') {
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800; margin-bottom:1rem;">📊 Creator KPI & Performance Scorecard</h2>
            <div class="grid-4" style="margin-bottom:1.25rem;">
              <div class="stat-card"><div class="stat-label">On-Time Deliverables</div><div class="stat-val" style="color:var(--color-accent);">98.2%</div><div class="stat-sub">+2.1% vs Studio Average</div></div>
              <div class="stat-card"><div class="stat-label">Production Efficiency</div><div class="stat-val" style="color:var(--color-primary);">1.4 hrs / post</div><div class="stat-sub">Target: < 2.0 hrs</div></div>
              <div class="stat-card"><div class="stat-label">Audience Growth Driver</div><div class="stat-val" style="color:#a855f7;">+48,200</div><div class="stat-sub">Reach Generated This Month</div></div>
              <div class="stat-card"><div class="stat-label">Quality Score</div><div class="stat-val" style="color:#f59e0b;">9.8 / 10</div><div class="stat-sub">Client Approval Rating</div></div>
            </div>
          </div>\`;
      } else if (viewKey === 'settings') {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'night';
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.15rem; font-family:'Outfit'; font-weight:800; margin-bottom:0.4rem;">
              ⚙️ Studio Appearance & Theme Harmonizer
            </h2>
            <p style="color:var(--color-text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
              Choose between Daylight Crisp or Deep Midnight themes. Your preference is automatically persisted for your creator workspace.
            </p>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:1.5rem;">
              <!-- DAY MODE CARD -->
              <div onclick="setMeidaTheme('day')" style="background:#ffffff; border:2px solid \${currentTheme === 'day' ? '#4f46e5' : '#e2e8f0'}; border-radius:12px; padding:1.25rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.05); transition:all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                  <div style="font-weight:800; font-size:1rem; color:#0f172a; display:flex; align-items:center; gap:0.4rem;">
                    ☀️ Daylight Clean
                  </div>
                  \${currentTheme === 'day' ? '<span class="badge" style="background:#dcfce7; color:#15803d;">ACTIVE</span>' : ''}
                </div>
                <div style="font-size:0.78rem; color:#64748b; line-height:1.4; margin-bottom:0.75rem;">
                  High-contrast crisp white background with dark slate typography and vibrant indigo highlights. Ideal for daytime content operations.
                </div>
                <div style="display:flex; gap:0.3rem; height:12px; border-radius:4px; overflow:hidden;">
                  <div style="background:#f1f5f9; flex:1;"></div>
                  <div style="background:#ffffff; flex:1;"></div>
                  <div style="background:#4f46e5; flex:1;"></div>
                  <div style="background:#059669; flex:1;"></div>
                </div>
              </div>

              <!-- NIGHT MODE CARD -->
              <div onclick="setMeidaTheme('night')" style="background:#0d1322; border:2px solid \${currentTheme === 'night' ? '#6366f1' : '#1f2937'}; border-radius:12px; padding:1.25rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.4); transition:all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                  <div style="font-weight:800; font-size:1rem; color:#ffffff; display:flex; align-items:center; gap:0.4rem;">
                    🌙 Deep Midnight (Default)
                  </div>
                  \${currentTheme === 'night' ? '<span class="badge" style="background:#065f46; color:#34d399;">ACTIVE</span>' : ''}
                </div>
                <div style="font-size:0.78rem; color:#94a3b8; line-height:1.4; margin-bottom:0.75rem;">
                  Sleek dark slate background with glowing neon accents. Designed for low-light editing and focused creation sprints.
                </div>
                <div style="display:flex; gap:0.3rem; height:12px; border-radius:4px; overflow:hidden;">
                  <div style="background:#070a12; flex:1;"></div>
                  <div style="background:#0d1322; flex:1;"></div>
                  <div style="background:#6366f1; flex:1;"></div>
                  <div style="background:#34d399; flex:1;"></div>
                </div>
              </div>
            </div>

            <!-- THEME PREFERENCE ACTIONS -->
            <div style="background:var(--color-stat-bg); border:1px solid var(--color-border); border-radius:10px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:0.85rem; color:var(--color-heading);">Workspace Theme State</div>
                <div style="font-size:0.75rem; color:var(--color-text-muted);">Current Active Mode: <strong>\${currentTheme.toUpperCase()} MODE</strong></div>
              </div>
              <button onclick="toggleMeidaTheme()" class="btn" style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-hover)); padding:0.5rem 1.2rem;">
                Toggle to \${currentTheme === 'day' ? '🌙 Night Mode' : '☀️ Day Mode'}
              </button>
            </div>
          </div>\`;
      } else {
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:var(--color-heading); font-size:1.1rem; margin-bottom:0.5rem;">\${viewKey.toUpperCase()} View</h2>
            <p style="color:var(--color-text-muted); font-size:0.85rem;">MeidaLLM SaaS View loaded and synchronized with ETHENENGINE.</p>
          </div>\`;
      }
    }

    // CRUD HELPER PROMPTS FOR MEIDALLM
    async function promptCreateProject() {
      const name = prompt('Enter Campaign / Project Name:', 'SaaS Product Launch');
      if (!name) return;
      await fetch('/api/media-publisher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: 'Creator marketing campaign', budgetLimit: 30000 })
      });
      showToast('Project created!');
      showView('projects');
    }

    async function promptCreateLead() {
      const name = prompt('Sponsor / Contact Name:', 'Apex Tech Brand');
      if (!name) return;
      const dealValue = Number(prompt('Deal Value ($):', '7500')) || 5000;
      await fetch('/api/media-publisher/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company: name + ' Inc', dealValue, dealStage: 'lead' })
      });
      showToast('Lead added to CRM pipeline!');
      showView('crm');
    }

    async function updateLeadStage(id, dealStage) {
      await fetch('/api/media-publisher/crm/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dealStage })
      });
      showToast('Lead stage updated to ' + dealStage.toUpperCase());
    }

    async function promptAddExpense() {
      const description = prompt('Expense / Revenue Description:', 'AI Voiceover & Video Rendering');
      if (!description) return;
      const amount = Number(prompt('Amount ($):', '450')) || 100;
      await fetch('/api/media-publisher/erp/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount, category: 'Tooling & APIs', type: 'expense' })
      });
      showToast('Budget transaction logged!');
      showView('erp');
    }

    async function promptCreateIdea() {
      const title = prompt('Content Topic / Idea Title:', 'Why Edge SQLite is replacing Postgres for Micro-Tenants');
      if (!title) return;
      await fetch('/api/media-publisher/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: 'Thought Leadership', notes: 'Benchmark write latency & edge sync speeds.' })
      });
      showToast('Idea added to vault!');
      showView('ideas');
    }

    async function voteIdea(id) {
      await fetch('/api/media-publisher/ideas/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      showToast('Vote counted!');
      showView('ideas');
    }

    async function toggleRule(id, enabled) {
      await fetch('/api/media-publisher/automations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled })
      });
      showToast('Rule ' + (enabled ? 'enabled' : 'disabled'));
      showView('automations');
    }

    async function respondReview(id, status) {
      await fetch('/api/media-publisher/client-reviews/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, feedback: status === 'approved' ? 'Approved by client.' : 'Changes requested.' })
      });
      showToast('Client review updated: ' + status.toUpperCase());
      showView('clientportal');
    }

    // THEME CONTROLLER & PERSISTENCE
    function setMeidaTheme(theme) {
      const isDay = theme === 'day';
      if (isDay) {
        document.documentElement.setAttribute('data-theme', 'day');
        localStorage.setItem('meidallm_theme', 'day');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('meidallm_theme', 'night');
      }
      updateThemeButtonUI(isDay);
      showToast(isDay ? '☀️ Switched to Day Mode' : '🌙 Switched to Night Mode');
      
      const activeSettings = document.getElementById('nav-settings')?.classList.contains('active');
      if (activeSettings) {
        showView('settings');
      }
    }

    function toggleMeidaTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'night';
      setMeidaTheme(currentTheme === 'day' ? 'night' : 'day');
    }

    function updateThemeButtonUI(isDay) {
      const btn = document.getElementById('themeToggleBtn');
      if (btn) {
        btn.innerHTML = isDay ? '<span>🌙 Night Mode</span>' : '<span>☀️ Day Mode</span>';
      }
    }

    // Initialize Theme on Page Load
    (function initMeidaTheme() {
      const saved = localStorage.getItem('meidallm_theme');
      const isDay = saved === 'day';
      if (isDay) {
        document.documentElement.setAttribute('data-theme', 'day');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      updateThemeButtonUI(isDay);
    })();

    async function advanceTask(id, stage) {
      await fetch('/api/media-publisher/kanban/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage })
      });
      showToast('Task advanced to ' + stage.toUpperCase());
      showView('kanban');
    }

    async function generateAiDraft() {
      const platform = document.getElementById('mPlatform')?.value || 'X / Twitter';
      const format = document.getElementById('mFormat')?.value || 'short_form';
      const prompt = document.getElementById('mTopic')?.value || 'ETHENENGINE High Performance Web Engine';

      const res = await fetch('/api/media-publisher/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, format, prompt })
      });
      const data = await res.json();
      if (data && data.generated) {
        document.getElementById('mOutput').style.display = 'block';
        document.getElementById('mTitle').innerText = data.generated.title || 'Generated Draft';
        document.getElementById('mContent').value = data.generated.content || '';
        showToast('✨ AI Post Draft Generated!');
      }
    }

    async function saveAiDraft() {
      const title = document.getElementById('mTitle')?.innerText || 'AI Generated Post';
      const content = document.getElementById('mContent')?.value || '';
      const platform = document.getElementById('mPlatform')?.value || 'X / Twitter';

      await fetch('/api/media-publisher/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, channels: [platform], status: 'scheduled' })
      });
      showToast('🚀 Release scheduled!');
      showView('overview');
    }

    function triggerAiPostGenerationModal() {
      showView('aistudio');
    }
  </script>
</body>
</html>`;
}
