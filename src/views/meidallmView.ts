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
      --color-border: #1f2937;
      --color-primary: #6366f1;
      --color-primary-hover: #4f46e5;
      --color-accent: #34d399;
      --color-text-main: #f8fafc;
      --color-text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--color-bg);
      color: var(--color-text-main);
      height: 100vh;
      display: flex;
      overflow: hidden;
    }

    /* SIDEBAR */
    .sidebar {
      width: 270px;
      min-width: 270px;
      background: #090e1a;
      border-right: 1px solid var(--color-border);
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
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
      color: #fff;
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
      color: #fff;
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
    .nav-link:hover, .nav-link.active {
      background: var(--color-panel-hover);
      color: #fff;
    }
    .nav-link.active {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border-left: 3px solid var(--color-primary);
    }

    /* MAIN CONTAINER */
    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--color-bg);
      overflow: hidden;
    }

    /* TOP BAR */
    .topbar {
      height: 56px;
      background: #090e1a;
      border-bottom: 1px solid var(--color-border);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .topbar-search {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 0.4rem 0.8rem;
      color: #fff;
      font-size: 0.8rem;
      width: 280px;
      outline: none;
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
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
    }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card { background: #111827; border: 1px solid var(--color-border); border-radius: 8px; padding: 1rem; }
    .stat-label { font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .stat-val { font-size: 1.5rem; font-weight: 800; color: #fff; margin-top: 0.2rem; }
    .stat-sub { font-size: 0.75rem; color: #34d399; margin-top: 0.2rem; }

    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; }
    th, td { padding: 0.75rem 0.85rem; border-bottom: 1px solid var(--color-border); }
    th { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.72rem; }
    
    .badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #065f46; color: #34d399; }
    .badge-purple { background: #581c87; color: #c084fc; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    
    .btn { padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer; border: none; background: var(--color-primary); color: #fff; text-decoration: none; }
    .btn-sec { background: rgba(255,255,255,0.06); border: 1px solid var(--color-border); color: #e2e8f0; }

    /* TOAST */
    #adminToast { position: fixed; bottom: 20px; right: 20px; background: #1e1b4b; border: 1px solid #6366f1; color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: none; z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
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

    <!-- 1. CORE WORKSPACE -->
    <div class="nav-group-title">Core Workspace</div>
    <a onclick="showView('overview')" class="nav-link active" id="nav-overview"><span>📊 Executive Overview</span></a>
    <a onclick="showView('projects')" class="nav-link" id="nav-projects"><span>📁 Projects & Campaigns</span></a>
    <a onclick="showView('kanban')" class="nav-link" id="nav-kanban"><span>📋 Production Kanban</span></a>
    <a onclick="showView('ideas')" class="nav-link" id="nav-ideas"><span>💡 Idea Bank & Research</span></a>

    <!-- 2. CONTENT & CREATIVE STUDIO -->
    <div class="nav-group-title">Content & Creative</div>
    <a onclick="showView('aistudio')" class="nav-link" id="nav-aistudio"><span>🤖 AI Creative Wizard</span></a>
    <a onclick="showView('drafts')" class="nav-link" id="nav-drafts"><span>📝 Drafts & Scripts</span></a>
    <a onclick="showView('scheduler')" class="nav-link" id="nav-scheduler"><span>📅 Release Scheduler</span></a>
    <a onclick="showView('media')" class="nav-link" id="nav-media"><span>🖼️ Media Asset Manager</span></a>

    <!-- 3. PUBLISHING & API DISTRIBUTION -->
    <div class="nav-group-title">Publishing & Distribution</div>
    <a onclick="showView('channels')" class="nav-link" id="nav-channels"><span>🔌 Connected Channels</span></a>
    <a onclick="showView('clientportal')" class="nav-link" id="nav-clientportal"><span>🤝 Client Approvals</span></a>
    <a onclick="showView('analytics')" class="nav-link" id="nav-analytics"><span>📈 Reach & Performance</span></a>

    <!-- 4. TEAM OPS & ATTENDANCE -->
    <div class="nav-group-title">Team Ops & Attendance</div>
    <a onclick="showView('timetracking')" class="nav-link" id="nav-timetracking"><span>⏱️ Time & Attendance</span></a>
    <a onclick="showView('sprints')" class="nav-link" id="nav-sprints"><span>🔄 Sprints & Gantt</span></a>

    <!-- 5. SYSTEM & AUTOMATION -->
    <div class="nav-group-title">System & Security</div>
    <a onclick="showView('automations')" class="nav-link" id="nav-automations"><span>⚡ Automations Engine</span></a>
    <a onclick="showView('sitrep')" class="nav-link" id="nav-sitrep"><span>📄 Executive SITREP</span></a>
    <a href="/admin?tenant=${escapeHtml(tenantSlug)}&view=dashboard" class="nav-link" style="margin-top:auto; background:rgba(99,102,241,0.1); color:#818cf8;"><span>← Back to Platform Admin</span></a>
  </aside>

  <!-- MAIN VIEW AREA -->
  <main class="app-main">
    <div class="topbar">
      <input type="text" class="topbar-search" placeholder="🔍 Search posts, scripts, tasks, ideas..." />
      <div class="topbar-actions">
        <button onclick="triggerAiPostGenerationModal()" class="btn-create">✨ New AI Content Draft</button>
        <div style="font-size:0.8rem; font-weight:700; color:#38bdf8;">👤 Admin User</div>
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
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem; font-family:'Outfit'; font-weight:800;">📊 MeidaLLM Executive Overview</h2>
            <div class="grid-4" style="margin-bottom:1.25rem;">
              <div class="stat-card"><div class="stat-label">Multi-Channel Reach</div><div class="stat-val" style="color:#38bdf8;">48,200</div><div class="stat-sub">Total Impressions</div></div>
              <div class="stat-card"><div class="stat-label">Engagement Rate</div><div class="stat-val" style="color:#34d399;">4.8%</div><div class="stat-sub">Likes & Retweets</div></div>
              <div class="stat-card"><div class="stat-label">Production Hours</div><div class="stat-val" style="color:#a855f7;">18.5 hrs</div><div class="stat-sub">$1,572 Billable</div></div>
              <div class="stat-card"><div class="stat-label">Connected Platforms</div><div class="stat-val" style="color:#fde047;">5 / 7 Active</div><div class="stat-sub">X, LinkedIn, YouTube</div></div>
            </div>
          </div>\`;
      } else if (viewKey === 'kanban') {
        try {
          const res = await fetch('/api/media-publisher/kanban');
          const data = await res.json();
          const tasks = data.tasks || [];
          container.innerHTML = \`
            <div class="card">
              <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem;">📋 Production Kanban Pipeline</h2>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                <div style="background:#090e1a; border:1px solid #1f2937; border-radius:8px; padding:0.85rem;">
                  <div style="font-weight:800; font-size:0.8rem; color:#94a3b8; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">📥 RESEARCH</div>
                  \${tasks.filter(t => t.stage === 'research').map(t => \`
                    <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.75rem; margin-bottom:0.5rem;">
                      <div style="font-weight:700; font-size:0.8rem; color:#fff;">\${t.title}</div>
                      <div style="font-size:0.7rem; color:#fca5a5; margin-top:0.25rem;">\${t.priority} · \${t.assignee}</div>
                      <button onclick="advanceTask('\${t.id}', 'draft')" class="btn" style="width:100%; margin-top:0.4rem; font-size:0.68rem; padding:0.2rem;">Move to Draft →</button>
                    </div>\`).join('')}
                </div>

                <div style="background:#090e1a; border:1px solid #1f2937; border-radius:8px; padding:0.85rem;">
                  <div style="font-weight:800; font-size:0.8rem; color:#38bdf8; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">📝 DRAFT</div>
                  \${tasks.filter(t => t.stage === 'draft').map(t => \`
                    <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.75rem; margin-bottom:0.5rem;">
                      <div style="font-weight:700; font-size:0.8rem; color:#fff;">\${t.title}</div>
                      <div style="font-size:0.7rem; color:#fde047; margin-top:0.25rem;">\${t.priority} · \${t.assignee}</div>
                      <button onclick="advanceTask('\${t.id}', 'review')" class="btn" style="width:100%; margin-top:0.4rem; font-size:0.68rem; padding:0.2rem;">Move to Review →</button>
                    </div>\`).join('')}
                </div>

                <div style="background:#090e1a; border:1px solid #1f2937; border-radius:8px; padding:0.85rem;">
                  <div style="font-weight:800; font-size:0.8rem; color:#fde047; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">👀 REVIEW</div>
                  \${tasks.filter(t => t.stage === 'review').map(t => \`
                    <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.75rem; margin-bottom:0.5rem;">
                      <div style="font-weight:700; font-size:0.8rem; color:#fff;">\${t.title}</div>
                      <div style="font-size:0.7rem; color:#94a3b8; margin-top:0.25rem;">\${t.priority} · \${t.assignee}</div>
                      <button onclick="advanceTask('\${t.id}', 'scheduled')" class="btn" style="width:100%; margin-top:0.4rem; font-size:0.68rem; padding:0.2rem;">Schedule Release →</button>
                    </div>\`).join('')}
                </div>

                <div style="background:#090e1a; border:1px solid #1f2937; border-radius:8px; padding:0.85rem;">
                  <div style="font-weight:800; font-size:0.8rem; color:#34d399; margin-bottom:0.6rem; border-bottom:1px solid #1f2937; padding-bottom:0.3rem;">✅ PUBLISHED</div>
                  \${tasks.filter(t => t.stage === 'published').map(t => \`
                    <div style="background:#111827; border:1px solid #1f2937; border-radius:6px; padding:0.75rem; margin-bottom:0.5rem;">
                      <div style="font-weight:700; font-size:0.8rem; color:#fff;">\${t.title}</div>
                      <div style="font-size:0.7rem; color:#34d399; margin-top:0.25rem;">Published</div>
                    </div>\`).join('')}
                </div>
              </div>
            </div>\`;
        } catch (e) { showToast('Error loading Kanban'); }
      } else if (viewKey === 'aistudio') {
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem;">🤖 AI Creative Studio & Prompt Wizard</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr 2fr; gap:0.75rem; margin-bottom:0.75rem;">
              <div>
                <label style="font-size:0.72rem; color:#64748b; font-weight:700;">CHANNEL</label>
                <select id="mPlatform" class="topbar-search" style="width:100%; margin-top:0.25rem;">
                  <option value="X / Twitter">𝕏 X / Twitter</option>
                  <option value="LinkedIn Company">💼 LinkedIn</option>
                  <option value="YouTube Channel">🎥 YouTube Storyboard</option>
                  <option value="Medium Publication">✍️ Medium Article</option>
                </select>
              </div>
              <div>
                <label style="font-size:0.72rem; color:#64748b; font-weight:700;">FORMAT</label>
                <select id="mFormat" class="topbar-search" style="width:100%; margin-top:0.25rem;">
                  <option value="short_form">Short Post</option>
                  <option value="video_script">Video Script</option>
                  <option value="carousel">Carousel</option>
                  <option value="long_form">Long Article</option>
                </select>
              </div>
              <div>
                <label style="font-size:0.72rem; color:#64748b; font-weight:700;">TOPIC PROMPT</label>
                <input type="text" id="mTopic" class="topbar-search" style="width:100%; margin-top:0.25rem;" placeholder="e.g. Sub-5ms Bun Execution Benchmark" />
              </div>
            </div>
            <button onclick="generateAiDraft()" class="btn" style="background:linear-gradient(135deg,#6366f1,#a855f7); padding:0.6rem 1.25rem;">✨ Generate AI Draft</button>

            <div id="mOutput" style="display:none; margin-top:1rem; background:#090e1a; border:1px solid #374151; border-radius:8px; padding:1rem;">
              <h4 id="mTitle" style="color:#fff; font-size:0.9rem; margin-bottom:0.5rem;">Draft Title</h4>
              <textarea id="mContent" style="width:100%; height:100px; background:#04070d; border:1px solid #1f2937; color:#38bdf8; font-family:monospace; padding:0.6rem; border-radius:6px; font-size:0.82rem; outline:none; resize:none;"></textarea>
              <button onclick="saveAiDraft()" class="btn" style="margin-top:0.5rem;">🚀 Schedule Campaign Release</button>
            </div>
          </div>\`;
      } else if (viewKey === 'channels') {
        const res = await fetch('/api/media-publisher/channels');
        const data = await res.json();
        const channels = data.channels || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem;">🔌 Connected Publishing API Channels</h2>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:0.85rem;">
              \${channels.map(c => \`
                <div style="background:#090e1a; border:1px solid #1f2937; border-radius:8px; padding:0.85rem; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-weight:700; font-size:0.85rem; color:#fff;">\${c.icon} \${c.name}</div>
                    <div style="font-size:0.72rem; color:#94a3b8;">\${c.accountName || ''}</div>
                  </div>
                  <span class="badge \${c.connected ? '' : 'badge-amber'}">\${c.connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (viewKey === 'timetracking') {
        const res = await fetch('/api/media-publisher/timetracking');
        const data = await res.json();
        const logs = data.logs || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem;">⏱️ Creator Time Tracking & Attendance Logs</h2>
            <table>
              <thead><tr><th>Date</th><th>User</th><th>Task</th><th>Duration</th><th>Billable</th></tr></thead>
              <tbody>
                \${logs.map(l => \`
                  <tr>
                    <td style="font-family:monospace;">\${l.date}</td>
                    <td>\${l.userEmail}</td>
                    <td>\${l.taskName}</td>
                    <td>\${l.durationMinutes} mins</td>
                    <td><span class="badge">YES ($\${Math.round(l.durationMinutes / 60 * l.hourlyRate)})</span></td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (viewKey === 'sitrep') {
        const res = await fetch('/api/media-publisher/sitrep');
        const data = await res.json();
        const r = data.report || {};
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:1rem;">📄 Executive Situation Report (SITREP)</h2>
            <div style="background:#090e1a; border:1px solid #1f2937; border-radius:8px; padding:1.25rem; color:#38bdf8; font-family:monospace; font-size:0.85rem; line-height:1.6;">
              \${r.summary || 'Operations normal.'}
            </div>
          </div>\`;
      } else {
        container.innerHTML = \`
          <div class="card">
            <h2 style="color:#38bdf8; font-size:1.1rem; margin-bottom:0.5rem;">\${viewKey.toUpperCase()} View</h2>
            <p style="color:#94a3b8; font-size:0.85rem;">MeidaLLM SaaS View loaded and synchronized with ETHENENGINE.</p>
          </div>\`;
      }
    }

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
