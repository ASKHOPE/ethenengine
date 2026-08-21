// ETHENENGINE Native View: Community Admin & Sabbath Agenda Application Suite
// Based on Gospel Agenda Platform Model — Service Architect, Callings Pipeline & Sacred Resource Library

import { escapeHtml } from '../foundation/Sanitizer.js';

export function renderCommunityAdminView(tenantSlug: string = 'lioramedia'): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Community Admin — Gospel Agenda Platform (${escapeHtml(tenantSlug.toUpperCase())})</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap">
  <style>
    :root {
      --color-bg: #070a12;
      --color-panel: #0d1322;
      --color-panel-hover: #111827;
      --color-border: #1f2937;
      --color-primary: #0284c7;
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
      flex-direction: column;
      overflow: hidden;
    }

    /* NAVIGATION BAR */
    .nav-bar {
      height: 60px;
      background: #090e1a;
      border-bottom: 1px solid var(--color-border);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-group { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border-radius: 8px;
      display: grid;
      place-content: center;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.2rem;
    }
    .brand-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.15rem; color: #fff; }

    .nav-tabs { display: flex; gap: 0.5rem; }
    .tab-btn {
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-text-muted);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn:hover { color: #fff; background: rgba(255,255,255,0.04); }
    .tab-btn.active { background: rgba(2, 132, 199, 0.15); color: #38bdf8; border-color: #0284c7; }

    /* CONTENT BODY */
    .content-area { flex: 1; padding: 1.5rem; overflow-y: auto; }
    .card { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; }
    
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card { background: #111827; border: 1px solid var(--color-border); border-radius: 8px; padding: 1rem; }
    .stat-label { font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .stat-val { font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 0.2rem; }

    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; }
    th, td { padding: 0.75rem 0.85rem; border-bottom: 1px solid var(--color-border); }
    th { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.72rem; }

    .badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #065f46; color: #34d399; }
    .badge-amber { background: #78350f; color: #fde047; }
    .badge-blue { background: #1e3a8a; color: #60a5fa; }
    .badge-purple { background: #581c87; color: #c084fc; }

    .btn { padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer; border: none; background: var(--color-primary); color: #fff; text-decoration: none; }
    .btn-sec { background: rgba(255,255,255,0.06); border: 1px solid var(--color-border); color: #e2e8f0; }

    #appToast { position: fixed; bottom: 20px; right: 20px; background: #0369a1; border: 1px solid #38bdf8; color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: none; z-index: 9999; }
  </style>
</head>
<body>

  <!-- NAVIGATION HEADER -->
  <header class="nav-bar">
    <div class="brand-group">
      <div class="brand-icon">⛪</div>
      <div>
        <div class="brand-title">Community Admin</div>
        <div style="font-size:0.7rem; color:#94a3b8;">Gospel Agenda & Roster Platform (${escapeHtml(tenantSlug.toUpperCase())})</div>
      </div>
    </div>

    <nav class="nav-tabs">
      <button onclick="switchTab('agendas')" class="tab-btn active" id="tab-agendas">📅 Service Architect</button>
      <button onclick="switchTab('callings')" class="tab-btn" id="tab-callings">🤝 Callings Pipeline</button>
      <button onclick="switchTab('members')" class="tab-btn" id="tab-members">👥 Member Directory</button>
      <button onclick="switchTab('attendance')" class="tab-btn" id="tab-attendance">📈 Attendance Tracker</button>
      <button onclick="switchTab('vault')" class="tab-btn" id="tab-vault">🔒 Document Vault</button>
      <button onclick="switchTab('library')" class="tab-btn" id="tab-library">📖 Sacred Library & Hymns</button>
      <a href="/admin?tenant=${escapeHtml(tenantSlug)}&view=dashboard" class="btn btn-sec" style="margin-left:0.5rem;">← Platform Admin</a>
    </nav>
  </header>

  <!-- CONTENT CONTAINER -->
  <main class="content-area" id="mainContainer">
    <!-- PANEL 1: SABBATH SERVICE ARCHITECT -->
    <div id="panel-agendas">
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin:0 0 0.2rem;">📅 Sabbath Meeting Itineraries & Service Architect</h2>
            <p style="color:#94a3b8; font-size:0.8rem; margin:0;">Configure sacrament services, hymn selection, speakers & auxiliary lessons.</p>
          </div>
          <button onclick="autoGenerateSundays()" class="btn" style="background:linear-gradient(135deg,#0284c7,#0369a1);">✨ Auto-Generate Sunday Agendas</button>
        </div>

        <div class="grid-4" style="margin-bottom:1.25rem;">
          <div class="stat-card"><div class="stat-label">Active Itineraries</div><div class="stat-val" style="color:#38bdf8;">4 Sundays</div></div>
          <div class="stat-card"><div class="stat-label">Conducting Officers</div><div class="stat-val" style="color:#34d399;">Assigned</div></div>
          <div class="stat-card"><div class="stat-label">Selected Hymns</div><div class="stat-val" style="color:#fde047;">4 Hymns / Mtg</div></div>
          <div class="stat-card"><div class="stat-label">Auxiliary Lessons</div><div class="stat-val" style="color:#c084fc;">Come Follow Me</div></div>
        </div>

        <div id="agendaListArea">
          <table>
            <thead><tr><th>Date</th><th>Service Title</th><th>Type</th><th>Conducting</th><th>Four-Hymn Selection</th><th>Speakers</th><th>Second Hour</th></tr></thead>
            <tbody>
              <tr>
                <td style="font-family:monospace; color:#38bdf8;">2026-08-23</td>
                <td><strong>Sabbath Day Sacrament Service</strong></td>
                <td><span class="badge">SACRAMENT</span></td>
                <td>Pres. David Miller</td>
                <td>#2, #193, #85, #304</td>
                <td>Sister Thorne (10m), Bro. Miller (15m)</td>
                <td>Come Follow Me — Unity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <div id="appToast">✨ Action Completed</div>

  <script>
    function showToast(msg) {
      const toast = document.getElementById('appToast');
      if (toast) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2500);
      }
    }

    async function switchTab(tabKey) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const activeTab = document.getElementById('tab-' + tabKey);
      if (activeTab) activeTab.classList.add('active');

      const container = document.getElementById('mainContainer');
      if (!container) return;

      if (tabKey === 'agendas') {
        const res = await fetch('/api/community-admin/agendas');
        const data = await res.json();
        const agendas = data.agendas || [];
        container.innerHTML = \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div>
                <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin:0 0 0.2rem;">📅 Sabbath Meeting Itineraries & Service Architect</h2>
                <p style="color:#94a3b8; font-size:0.8rem; margin:0;">Configure sacrament services, hymn selection, speakers & auxiliary lessons.</p>
              </div>
              <button onclick="autoGenerateSundays()" class="btn" style="background:linear-gradient(135deg,#0284c7,#0369a1);">✨ Auto-Generate Sunday Agendas</button>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Service Title</th><th>Type</th><th>Conducting</th><th>Hymns</th><th>Speakers</th><th>Second Hour</th></tr></thead>
              <tbody>
                \${agendas.map(a => \`
                  <tr>
                    <td style="font-family:monospace; color:#38bdf8;">\${a.date}</td>
                    <td><strong>\${a.title}</strong></td>
                    <td><span class="badge">\${a.meetingType.toUpperCase()}</span></td>
                    <td>\${a.conductingOfficer}</td>
                    <td>\${a.hymns.opening.split('—')[0]} / \${a.hymns.sacrament.split('—')[0]}</td>
                    <td>\${(a.speakers || []).map(s => s.name).join(', ')}</td>
                    <td>\${a.secondHour.lessonTopic || 'Auxiliary Class'}</td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (tabKey === 'callings') {
        const res = await fetch('/api/community-admin/callings');
        const data = await res.json();
        const callings = data.callings || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin-bottom:1rem;">🤝 Community Callings & Roster Pipeline</h2>
            <table>
              <thead><tr><th>Position Title</th><th>Organization Unit</th><th>Candidate</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                \${callings.map(c => \`
                  <tr>
                    <td><strong>\${c.positionTitle}</strong></td>
                    <td>\${c.orgUnit}</td>
                    <td>\${c.candidateName}</td>
                    <td><span class="badge \${c.status === 'set_apart' ? '' : 'badge-amber'}">\${c.status.toUpperCase()}</span></td>
                    <td><button onclick="updateCallingStatus('\${c.id}', 'set_apart')" class="btn" style="padding:0.2rem 0.5rem; font-size:0.68rem;">Set Apart →</button></td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (tabKey === 'library') {
        const res = await fetch('/api/community-admin/library');
        const data = await res.json();
        const library = data.library || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin-bottom:0.75rem;">📖 Sacred Resource Library & Music Portal</h2>
            <input type="text" id="libSearch" onkeyup="searchLibraryItems()" style="width:100%; padding:0.6rem 0.8rem; background:#111827; border:1px solid #1f2937; color:#fff; border-radius:6px; font-size:0.82rem; margin-bottom:1rem;" placeholder="🔍 Search talks, hymns, principles, or manuals..." />
            <div id="libResultsGrid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1rem;">
              \${library.map(l => \`
                <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:1rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <span class="badge badge-purple">\${l.category}</span>
                    <span style="font-size:0.7rem; color:#64748b;">\${l.author}</span>
                  </div>
                  <h4 style="color:#fff; font-size:0.9rem; font-weight:700; margin-bottom:0.4rem;">\${l.title}</h4>
                  <p style="font-size:0.75rem; color:#94a3b8; line-height:1.4; margin:0 0 0.5rem;">\${l.contentText}</p>
                  <div style="display:flex; gap:0.3rem;">\${(l.tags || []).map(t => \`<span style="font-size:0.65rem; background:rgba(255,255,255,0.06); padding:0.1rem 0.35rem; border-radius:4px; color:#38bdf8;">#\${t}</span>\`).join('')}</div>
                </div>\`).join('')}
            </div>
          </div>\`;
      } else if (tabKey === 'members') {
        const res = await fetch('/api/community-admin/members');
        const data = await res.json();
        const members = data.members || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin-bottom:1rem;">👥 Community Member Directory</h2>
            <table>
              <thead><tr><th>Full Name</th><th>Email</th><th>Phone</th><th>Org Unit</th><th>Current Calling</th><th>Status</th></tr></thead>
              <tbody>
                \${members.map(m => \`
                  <tr>
                    <td><strong>\${m.fullName}</strong></td>
                    <td style="font-family:monospace;">\${m.email}</td>
                    <td>\${m.phone}</td>
                    <td>\${m.orgUnit}</td>
                    <td>\${m.currentCalling}</td>
                    <td><span class="badge">\${m.status.toUpperCase()}</span></td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (tabKey === 'attendance') {
        const res = await fetch('/api/community-admin/attendance');
        const data = await res.json();
        const logs = data.logs || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin-bottom:1rem;">📈 Attendance Headcount Tracker</h2>
            <table>
              <thead><tr><th>Date</th><th>Meeting Type</th><th>Headcount</th><th>Recorded By</th></tr></thead>
              <tbody>
                \${logs.map(a => \`
                  <tr>
                    <td style="font-family:monospace; color:#38bdf8;">\${a.date}</td>
                    <td><strong>\${a.meetingType}</strong></td>
                    <td><span class="badge badge-purple" style="font-size:0.85rem;">\${a.headcount} attendees</span></td>
                    <td>\${a.recordedBy}</td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      } else if (tabKey === 'vault') {
        const res = await fetch('/api/community-admin/vault');
        const data = await res.json();
        const docs = data.documents || [];
        container.innerHTML = \`
          <div class="card">
            <h2 style="font-family:'Outfit'; font-size:1.1rem; color:#38bdf8; margin-bottom:1rem;">🔒 Sacred Document Vault & Handbooks</h2>
            <table>
              <thead><tr><th>Document Title</th><th>Category</th><th>File Size</th><th>Uploaded Date</th><th>Action</th></tr></thead>
              <tbody>
                \${docs.map(d => \`
                  <tr>
                    <td><strong>\${d.title}</strong></td>
                    <td><span class="badge badge-blue">\${d.category}</span></td>
                    <td>\${d.fileSize}</td>
                    <td style="font-family:monospace;">\${d.uploadedAt}</td>
                    <td><button onclick="showToast('📄 Opening Vault Document: ' + '\${d.title}')" class="btn" style="padding:0.2rem 0.5rem; font-size:0.68rem;">View Document ↗</button></td>
                  </tr>\`).join('')}
              </tbody>
            </table>
          </div>\`;
      }
    }

    async function autoGenerateSundays() {
      const res = await fetch('/api/community-admin/agendas/generate-sundays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthLabel: 'September 2026', sundayCount: 4 })
      });
      if (res.ok) {
        showToast('✨ Auto-generated 4 Sunday Meeting Itineraries!');
        switchTab('agendas');
      }
    }

    async function updateCallingStatus(id, status) {
      await fetch('/api/community-admin/callings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      showToast('Status updated to ' + status.toUpperCase());
      switchTab('callings');
    }

    async function searchLibraryItems() {
      const q = document.getElementById('libSearch')?.value || '';
      const res = await fetch('/api/community-admin/search?q=' + encodeURIComponent(q));
      const data = await res.json();
      const results = data.results || [];
      const grid = document.getElementById('libResultsGrid');
      if (grid) {
        grid.innerHTML = results.map(l => \`
          <div style="background:#111827; border:1px solid #1f2937; border-radius:8px; padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span class="badge badge-purple">\${l.category}</span>
              <span style="font-size:0.7rem; color:#64748b;">\${l.author}</span>
            </div>
            <h4 style="color:#fff; font-size:0.9rem; font-weight:700; margin-bottom:0.4rem;">\${l.title}</h4>
            <p style="font-size:0.75rem; color:#94a3b8; line-height:1.4; margin:0 0 0.5rem;">\${l.contentText}</p>
          </div>\`).join('');
      }
    }
  </script>
</body>
</html>`;
}
