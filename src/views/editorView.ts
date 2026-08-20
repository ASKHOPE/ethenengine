import { escapeHtml } from '../foundation/Sanitizer.js';
import { THEME_PRESETS } from '../capabilities/theme-engine/ThemeEngine.js';
import { HolidayDesigner } from '../capabilities/theme-engine/HolidayEngine.js';

export interface EditorViewOptions {
  tenantSlug: string;
  page: any;
  pages: any[];
  theme: any;
}

export function renderEditorView(options: EditorViewOptions): string {
  const { tenantSlug } = options;
  const page = options.page || { id: 'page_home', title: 'Home', slug: 'home', blocks: [], isPublished: true, seo: { title: 'Home', description: '' } };
  const pages = options.pages && options.pages.length > 0 ? options.pages : [page];
  const theme = options.theme || { tokens: { primaryColor: '#6366f1', secondaryColor: '#a855f7', backgroundColor: '#070a12', cardBg: '#0f172a', textColor: '#f8fafc', borderRadius: '10px' } };

  const holidayDesigner = HolidayDesigner.getInstance();
  const holidayCss = theme.tokens?.holidayEffect ? holidayDesigner.compileHolidayCSS(theme.tokens.holidayEffect) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Studio Builder — ${escapeHtml(page.title || 'Home')} (${escapeHtml(tenantSlug || 'default')})</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/blocks.css">
  <link rel="stylesheet" href="/animations.css">
  <link rel="stylesheet" href="/editor.css">
  <style>
    :root {
      --primary: ${theme.tokens?.primaryColor || '#6366f1'};
      --secondary: ${theme.tokens?.secondaryColor || '#a855f7'};
      --bg: ${theme.tokens?.backgroundColor || '#070a12'};
      --card-bg: ${theme.tokens?.cardBg || '#0f172a'};
      --glow: ${theme.tokens?.accentGlow || 'rgba(99,102,241,0.25)'};
      --text: ${theme.tokens?.textColor || '#f8fafc'};
      --radius: ${theme.tokens?.borderRadius || '10px'};
    }
  </style>
  <style id="dynamicHolidayStyle">
    ${holidayCss}
  </style>
</head>
<body>
  <!-- TOP STUDIO TOOLBAR -->
  <div class="editor-toolbar" style="height:54px; background:#070a14; border-bottom:1px solid rgba(255,255,255,0.08); padding:0 1.25rem; display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:0.85rem;">
      <div class="toolbar-brand" style="font-weight:900; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
        <div class="brand-icon" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); width:28px; height:28px; border-radius:6px; display:grid; place-content:center; color:#fff; font-weight:900; font-size:0.85rem; position:relative;">E</div>
        <span style="letter-spacing:-0.02em;">ETHENENGINE STUDIO</span>
      </div>
      <a href="/admin?tenant=${escapeHtml(tenantSlug)}&view=website" class="btn btn-secondary" style="padding:0.3rem 0.65rem; font-size:0.75rem;">← Admin</a>
      
      <select onchange="window.location.href='/editor?tenant=${escapeHtml(tenantSlug)}&pageId=' + this.value" class="field-input" style="width:210px; padding:0.35rem 0.65rem; font-size:0.8rem;">
        ${pages.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === page.id ? 'selected' : ''}>${escapeHtml(p.title)} (/${escapeHtml(p.slug)})</option>`).join('')}
      </select>
    </div>

    <!-- RESPONSIVE BREAKPOINT SWITCHER -->
    <div style="display:flex; align-items:center; background:#101524; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:2px;">
      <button class="btn btn-secondary" id="btnDesktop" onclick="setDevice('desktop')" style="padding:0.3rem 0.6rem; font-size:0.75rem; border:none; background:rgba(99,102,241,0.2); color:#fff;">🖥️ Desktop</button>
      <button class="btn btn-secondary" id="btnTablet" onclick="setDevice('tablet')" style="padding:0.3rem 0.6rem; font-size:0.75rem; border:none; background:transparent; color:#94a3b8;">📱 Tablet</button>
      <button class="btn btn-secondary" id="btnMobile" onclick="setDevice('mobile')" style="padding:0.3rem 0.6rem; font-size:0.75rem; border:none; background:transparent; color:#94a3b8;">📲 Mobile</button>
    </div>

    <!-- REAL-TIME COLLABORATORS & PRESENCE BAR -->
    <div style="display:flex; align-items:center; gap:0.75rem;">
      <div class="presence-badge-pulse" id="presenceLiveBadge">
        <span class="presence-pulse-dot"></span>
        <span id="presenceCountText">1 Live</span>
      </div>

      <div class="presence-avatar-stack" id="collaboratorAvatarStack">
        <!-- Rendered dynamically via Collab Presence loop -->
      </div>

      <button id="savePageBtn" class="btn" onclick="savePage()" style="background:linear-gradient(135deg,#6366f1,#4f46e5); font-weight:700; padding:0.45rem 1rem;">💾 Save Page</button>
      <a id="livePreviewBtn" href="/preview/${escapeHtml(page.slug)}?tenant=${escapeHtml(tenantSlug)}" target="_blank" class="btn btn-secondary" style="padding:0.45rem 0.9rem;">👁️ Preview ↗</a>
    </div>
  </div>

  <div class="editor-layout">
    <!-- LEFT DRAWER: TABS FOR BLOCKS, PAGES, MEDIA & THEME -->
    <div class="component-drawer">
      <div class="drawer-tabs">
        <button class="drawer-tab-btn active" id="tabBlocksBtn" onclick="switchDrawerTab('blocks')">📦 Blocks</button>
        <button class="drawer-tab-btn" id="tabPagesBtn" onclick="switchDrawerTab('pages')">📄 Pages</button>
        <button class="drawer-tab-btn" id="tabMediaBtn" onclick="switchDrawerTab('media')">🖼️ Media</button>
        <button class="drawer-tab-btn" id="tabTemplatesBtn" onclick="switchDrawerTab('templates')">✨ Layouts</button>
        <button class="drawer-tab-btn" id="tabThemeBtn" onclick="switchDrawerTab('theme')">🎨 Theme</button>
      </div>

      <!-- MEDIA ASSET LIBRARY TAB -->
      <div class="drawer-content" id="drawerMediaTab" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:0;">Asset Library</h4>
          <button onclick="triggerAssetUpload()" class="btn" style="padding:0.25rem 0.6rem; font-size:0.72rem; font-weight:700;">+ Upload</button>
        </div>

        <div class="media-upload-dropzone" onclick="triggerAssetUpload()">
          <div style="font-size:1.5rem; margin-bottom:0.3rem;">☁️</div>
          <div style="font-size:0.78rem; font-weight:700; color:#fff;">Click or Drop File</div>
          <div style="font-size:0.68rem; color:#94a3b8;">PNG, JPG, SVG, WebP</div>
        </div>

        <div class="media-grid" id="drawerMediaGrid">
          <!-- Loaded dynamically via loadMediaAssets() -->
        </div>
      </div>

      <!-- PAGES MANAGER TAB -->
      <div class="drawer-content" id="drawerPagesTab" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:0;">Tenant Pages (${pages.length})</h4>
          <button onclick="promptCreatePage()" class="btn" style="padding:0.25rem 0.6rem; font-size:0.72rem; font-weight:700;">+ New Page</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${pages.map(p => `
            <div style="background:${p.id === page.id ? 'rgba(99,102,241,0.18)' : '#101524'}; border:1px solid ${p.id === page.id ? '#6366f1' : 'rgba(255,255,255,0.06)'}; border-radius:8px; padding:0.65rem 0.85rem; display:flex; justify-content:space-between; align-items:center;">
              <div style="cursor:pointer;" onclick="window.location.href='/editor?tenant=${escapeHtml(tenantSlug)}&pageId=${escapeHtml(p.id)}'">
                <div style="font-weight:700; font-size:0.85rem; color:#fff;">${escapeHtml(p.title)}</div>
                <div style="font-size:0.72rem; color:#94a3b8; font-family:monospace;">/${escapeHtml(p.slug)} · ${p.blocks.length} blocks</div>
              </div>
              <div style="display:flex; gap:0.3rem;">
                <a href="/preview/${escapeHtml(p.slug)}?tenant=${escapeHtml(tenantSlug)}" target="_blank" class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.7rem;">👁️</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 1-CLICK STARTER TEMPLATES TAB -->
      <div class="drawer-content" id="drawerTemplatesTab" style="display:none;">
        <p style="font-size:0.75rem; color:#94a3b8; line-height:1.4; margin-bottom:0.25rem;">
          Select a pre-built industry template to instantly scaffold a high-converting website layout:
        </p>

        <div class="block-card" onclick="loadStarterTemplate('saas_landing')">
          <div class="block-card-icon">🚀</div>
          <div><div style="font-weight:700; font-size:0.85rem; color:#fff;">SaaS Product Launch</div><div style="font-size:0.72rem; color:#94a3b8;">Hero + Stats + Features + Pricing + CTA</div></div>
        </div>

        <div class="block-card" onclick="loadStarterTemplate('agency_studio')">
          <div class="block-card-icon">🎬</div>
          <div><div style="font-weight:700; font-size:0.85rem; color:#fff;">Creative Studio / VFX</div><div style="font-size:0.72rem; color:#94a3b8;">Hero + CMS Showcases + Reviews + CTA</div></div>
        </div>

        <div class="block-card" onclick="loadStarterTemplate('consulting_lead')">
          <div class="block-card-icon">💼</div>
          <div><div style="font-weight:700; font-size:0.85rem; color:#fff;">Executive Consulting</div><div style="font-size:0.72rem; color:#94a3b8;">Authority Hero + Metrics + Testimonials + Consultation</div></div>
        </div>

        <div class="block-card" onclick="loadStarterTemplate('minimal_docs')">
          <div class="block-card-icon">📚</div>
          <div><div style="font-weight:700; font-size:0.85rem; color:#fff;">Product Hub & Blog</div><div style="font-size:0.72rem; color:#94a3b8;">Headline + CMS Feed + Newsletter CTA</div></div>
        </div>
      </div>

      <!-- BLOCKS TAB -->
      <div class="drawer-content" id="drawerBlocksTab">
        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:0.75rem;">Navigation & Announcement</h4>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'navbar')" onclick="addBlock('navbar')">
          <div class="block-card-icon">🧭</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Navigation Bar</div><div style="font-size:0.72rem; color:#94a3b8;">Brand logo, navigation links & CTA</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'announcement_bar')" onclick="addBlock('announcement_bar')">
          <div class="block-card-icon">📢</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Announcement Banner</div><div style="font-size:0.72rem; color:#94a3b8;">Top sale announcement bar</div></div>
        </div>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:1.25rem 0 0.75rem;">Core Sections</h4>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'hero')" onclick="addBlock('hero')">
          <div class="block-card-icon">⚡</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Hero Banner</div><div style="font-size:0.72rem; color:#94a3b8;">High-impact headline & CTA</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'stats')" onclick="addBlock('stats')">
          <div class="block-card-icon">📊</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Key Metrics / Stats</div><div style="font-size:0.72rem; color:#94a3b8;">3-column proof & SLA metrics</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'features')" onclick="addBlock('features')">
          <div class="block-card-icon">✨</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Features Grid</div><div style="font-size:0.72rem; color:#94a3b8;">Multi-column capability cards</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'product_grid')" onclick="addBlock('product_grid')">
          <div class="block-card-icon">🛍️</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Products / Merch Grid</div><div style="font-size:0.72rem; color:#94a3b8;">Live inventory merchandise items</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'pricing')" onclick="addBlock('pricing')">
          <div class="block-card-icon">💳</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Pricing Table</div><div style="font-size:0.72rem; color:#94a3b8;">Tiered subscription plans</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'testimonials')" onclick="addBlock('testimonials')">
          <div class="block-card-icon">💬</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Customer Quotes</div><div style="font-size:0.72rem; color:#94a3b8;">Testimonial proof review</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'cms_feed')" onclick="addBlock('cms_feed')">
          <div class="block-card-icon">📝</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Headless CMS Feed</div><div style="font-size:0.72rem; color:#94a3b8;">Dynamic case studies / articles</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'cta')" onclick="addBlock('cta')">
          <div class="block-card-icon">🎯</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">CTA Banner</div><div style="font-size:0.72rem; color:#94a3b8;">Conversion gradient callout</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'pagination')" onclick="addBlock('pagination')">
          <div class="block-card-icon">🔢</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Pagination Controls</div><div style="font-size:0.72rem; color:#94a3b8;">Numbered page buttons & next/prev</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'form_builder')" onclick="addBlock('form_builder')">
          <div class="block-card-icon">📋</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Lead Capture Form</div><div style="font-size:0.72rem; color:#94a3b8;">Inquiry form synced with CRM</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'footer')" onclick="addBlock('footer')">
          <div class="block-card-icon">⚓</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Site Footer</div><div style="font-size:0.72rem; color:#94a3b8;">Sitemap, copyright & links</div></div>
        </div>
      </div>

      <!-- THEME & DESIGN TOKENS TAB -->
      <div class="drawer-content" id="drawerThemeTab" style="display:none;">
        <!-- DAY / NIGHT MODE SWITCH -->
        <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.75rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div style="font-size:0.8rem; font-weight:700; color:#fff;">🌗 Day / Night Mode</div>
          <div style="display:flex; gap:0.35rem;">
            <button onclick="applyDayMode()" class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" title="Clean Sunlight / Light mode">☀️ Day</button>
            <button onclick="applyNightMode()" class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" title="Midnight Dark Slate">🌙 Night</button>
          </div>
        </div>

        <!-- COOLORS 5-COLOR HARMONIZER & SHUFFLE -->
        <div style="margin-bottom:1rem; background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase;">🎨 5-Color Harmonizer</span>
            <button onclick="randomizePalette()" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.7rem; font-weight:700;">🎲 Shuffle</button>
          </div>
          <div class="palette-harmonizer-strip" id="harmonizerStrip"></div>
        </div>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:0.75rem;">Curated Theme Palettes</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:1.25rem;">
          ${Object.entries(THEME_PRESETS).map(([k, p]: [string, any]) => `
            <button onclick="applyPreset('${k}')" class="btn btn-secondary" style="font-size:0.75rem; padding:0.5rem; display:flex; align-items:center; gap:0.4rem; justify-content:flex-start; text-align:left;">
              <span style="width:14px; height:14px; border-radius:3px; background:${p.tokens.primaryColor}; display:inline-block; border:1px solid rgba(255,255,255,0.2);"></span>
              ${escapeHtml(p.name)}
            </button>
          `).join('')}
        </div>

        <!-- HOLIDAY & CELEBRATION EFFECTS -->
        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:0.75rem;">🎉 Holiday & Sales Overlays</h4>
        <div style="display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1.25rem;">
          ${holidayDesigner.listHolidays().map((eff: any) => `
            <div class="holiday-card ${theme.tokens.holidayEffect === eff.id ? 'active' : ''}" onclick="applyHolidayEffect('${eff.id}')">
              <div style="font-size:1.1rem;">${eff.icon || '🎉'}</div>
              <div>
                <div style="font-weight:700; font-size:0.8rem; color:#fff;">${escapeHtml(eff.name)}</div>
                <div style="font-size:0.68rem; color:#94a3b8;">${escapeHtml(eff.description)}</div>
              </div>
            </div>
          `).join('')}
          <button onclick="applyHolidayEffect('none')" class="btn btn-secondary" style="font-size:0.72rem; padding:0.35rem;">Clear Holiday Overlays</button>
        </div>

        <!-- WCAG CONTRAST RATIO AUDIT BADGE -->
        <div style="margin-bottom:1rem; background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.65rem 0.75rem; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase;">WCAG 2.2 Contrast</span>
          <span id="wcagBadge" class="wcag-badge wcag-pass">✓ AAA Pass (8.4:1)</span>
        </div>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:0.75rem;">Design Tokens</h4>
        <div class="field-group">
          <label class="field-label">Primary Brand Color</label>
          <input type="color" class="field-input" style="height:38px; padding:2px;" value="${theme.tokens.primaryColor || '#6366f1'}" onchange="updateThemeToken('primaryColor', this.value)" />
        </div>
        <div class="field-group">
          <label class="field-label">Secondary Color</label>
          <input type="color" class="field-input" style="height:38px; padding:2px;" value="${theme.tokens.secondaryColor || '#a855f7'}" onchange="updateThemeToken('secondaryColor', this.value)" />
        </div>
        <div class="field-group">
          <label class="field-label">Canvas Background</label>
          <input type="color" class="field-input" style="height:38px; padding:2px;" value="${theme.tokens.backgroundColor || '#070a12'}" onchange="updateThemeToken('backgroundColor', this.value)" />
        </div>
        <div class="field-group">
          <label class="field-label">Card Background</label>
          <input type="color" class="field-input" style="height:38px; padding:2px;" value="${theme.tokens.cardBg || '#0f172a'}" onchange="updateThemeToken('cardBg', this.value)" />
        </div>
        <div class="field-group">
          <label class="field-label">Border Radius</label>
          <select class="field-input" onchange="updateThemeToken('borderRadius', this.value)">
            <option value="4px" ${theme.tokens.borderRadius === '4px' ? 'selected' : ''}>4px (Sharp / Enterprise)</option>
            <option value="8px" ${theme.tokens.borderRadius === '8px' ? 'selected' : ''}>8px (Medium Modern)</option>
            <option value="12px" ${theme.tokens.borderRadius === '12px' ? 'selected' : ''}>12px (Smooth Modern)</option>
            <option value="20px" ${theme.tokens.borderRadius === '20px' ? 'selected' : ''}>20px (Pill / Fluid)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- CANVAS VIEWPORT -->
    <div class="canvas-viewport">
      <div class="canvas-container" id="canvasContainer">
        <!-- Rendered dynamically via renderCanvas() -->
      </div>
    </div>

    <!-- RIGHT INSPECTOR DRAWER -->
    <div class="property-inspector">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
        <span style="font-weight:700; font-size:0.85rem; color:#fff;">Inspector</span>
        <span class="inspector-badge" id="inspectorBadge">SELECT BLOCK</span>
      </div>

      <div id="inspectorContent">
        <div style="color:#64748b; font-size:0.85rem; text-align:center; padding:3rem 0;">
          Select any block on the canvas to configure its settings.
        </div>
      </div>
    </div>
  </div>

  <script>
    let pageData = ${JSON.stringify(page)};
    let selectedBlockIndex = 0;
    let draggedCanvasBlockIdx = null;
    let draggedBlockType = null;

    function setDevice(device) {
      const container = document.getElementById('canvasContainer');
      const btnD = document.getElementById('btnDesktop');
      const btnT = document.getElementById('btnTablet');
      const btnM = document.getElementById('btnMobile');

      container.className = 'canvas-container ' + (device === 'desktop' ? '' : device + '-mode');
      [btnD, btnT, btnM].forEach(b => { b.style.background = 'transparent'; b.style.color = '#94a3b8'; });
      
      const activeBtn = device === 'desktop' ? btnD : device === 'tablet' ? btnT : btnM;
      activeBtn.style.background = 'rgba(99,102,241,0.2)';
      activeBtn.style.color = '#fff';
    }

    function switchDrawerTab(tab) {
      document.getElementById('drawerBlocksTab').style.display = tab === 'blocks' ? 'block' : 'none';
      document.getElementById('drawerPagesTab').style.display = tab === 'pages' ? 'block' : 'none';
      document.getElementById('drawerMediaTab').style.display = tab === 'media' ? 'block' : 'none';
      document.getElementById('drawerTemplatesTab').style.display = tab === 'templates' ? 'block' : 'none';
      document.getElementById('drawerThemeTab').style.display = tab === 'theme' ? 'block' : 'none';

      ['tabBlocksBtn', 'tabPagesBtn', 'tabMediaBtn', 'tabTemplatesBtn', 'tabThemeBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      const activeBtn = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Btn');
      if (activeBtn) activeBtn.classList.add('active');

      if (tab === 'media') {
        loadMediaAssets();
      }
    }

    async function loadMediaAssets() {
      const grid = document.getElementById('drawerMediaGrid');
      if (!grid) return;
      grid.innerHTML = '<div style="color:#64748b; font-size:0.75rem; grid-column:span 2; text-align:center; padding:1rem;">Loading assets...</div>';
      try {
        const res = await fetch('/api/media/assets', {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') }
        });
        const data = await res.json();
        if (data.assets && data.assets.length > 0) {
          grid.innerHTML = data.assets.map(a => \`
            <div class="media-asset-card" onclick="copyAssetUrl('\${a.url}')" title="Click to copy image URL">
              <div style="font-size:1.4rem; margin-bottom:0.2rem;">🖼️</div>
              <div style="font-size:0.68rem; font-weight:700; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${escapeText(a.filename)}</div>
              <div style="font-size:0.6rem; color:#94a3b8;">\${(a.sizeBytes / 1024).toFixed(1)} KB</div>
            </div>
          \`).join('');
        } else {
          grid.innerHTML = '<div style="color:#64748b; font-size:0.75rem; grid-column:span 2; text-align:center; padding:1rem;">No assets uploaded yet.</div>';
        }
      } catch (e) {
        grid.innerHTML = '<div style="color:#f87171; font-size:0.75rem; grid-column:span 2; text-align:center;">Failed to load assets.</div>';
      }
    }

    function copyAssetUrl(url) {
      navigator.clipboard.writeText(url);
      showToast('Asset URL copied to clipboard!');
    }

    async function triggerAssetUpload() {
      const filename = prompt('Enter image filename or asset title (e.g. hero-banner.png):', 'production_showcase.png');
      if (!filename) return;

      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
          body: JSON.stringify({
            filename: filename,
            mimeType: 'image/png',
            data: 'data:image/png;base64,mock'
          })
        });
        if (res.ok) {
          showToast('Asset uploaded to media library!');
          loadMediaAssets();
        } else {
          alert('Failed to upload asset.');
        }
      } catch (e) {
        alert('Network error during upload.');
      }
    }

    function promptCreatePage() {
      const title = prompt('Enter new page title:');
      if (!title) return;
      const slug = prompt('Enter URL slug (e.g. pricing, about, blog):', title.toLowerCase().replace(/\\s+/g, '-'));
      if (!slug) return;

      fetch('/api/website/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
        body: JSON.stringify({ title, slug })
      }).then(r => r.json()).then(data => {
        if (data.page) {
          window.location.href = '/editor?tenant=${escapeHtml(tenantSlug)}&pageId=' + data.page.id;
        }
      });
    }

    function loadStarterTemplate(templateKey) {
      undoHistory = JSON.parse(JSON.stringify(pageData.blocks));
      if (templateKey === 'saas_landing') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'CYBERCLOUD', logoInitial: 'C', ctaText: 'Launch App' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'Enterprise Intelligence Distributed to the Edge', subtitle: 'Real-time multi-tenant runtime engine with zero-knowledge cryptographic isolation.', ctaText: 'Get Started' } },
          { id: 'blk_' + Date.now() + '_3', type: 'stats', settings: { stat1Val: '99.999%', stat1Label: 'SLA Availability', stat2Val: '< 2.4ms', stat2Label: 'Edge Latency', stat3Val: '100%', stat3Label: 'Zero-Knowledge' } },
          { id: 'blk_' + Date.now() + '_4', type: 'pricing', settings: { title: 'Scalable Platform Tiers', planName: 'Enterprise Cloud', price: '199' } },
          { id: 'blk_' + Date.now() + '_5', type: 'cta', settings: { headline: 'Ready to Deploy in Seconds?', buttonText: 'Create Your Workspace' } },
          { id: 'blk_' + Date.now() + '_6', type: 'footer', settings: { brandName: 'CYBERCLOUD', copyrightText: '© 2026 CYBERCLOUD INC. All rights reserved.' } }
        ];
        showToast('Scaffolded SaaS Product Launch Template!', true);
      } else if (templateKey === 'agency_studio') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'LIORAMEDIA', logoInitial: 'L', ctaText: 'Client Portal' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'Virtual Production & Cinematic VFX Studio', subtitle: 'Leading the future of procedural CGI, LED volume stages, and high-impact digital storytelling.', ctaText: 'Explore Productions' } },
          { id: 'blk_' + Date.now() + '_3', type: 'cms_feed', settings: { title: 'Featured Cinematic Productions & Releases', contentTypeSlug: 'blog-article' } },
          { id: 'blk_' + Date.now() + '_4', type: 'testimonials', settings: { quote: 'LIORAMEDIA produced the visual campaign of the decade for our brand.', author: 'Creative Director, Universal Arts' } },
          { id: 'blk_' + Date.now() + '_5', type: 'cta', settings: { headline: 'Produce Your Next Campaign with Us', buttonText: 'Book Studio Time' } },
          { id: 'blk_' + Date.now() + '_6', type: 'footer', settings: { brandName: 'LIORAMEDIA', copyrightText: '© 2026 LIORAMEDIA VFX STUDIO. All rights reserved.' } }
        ];
        showToast('Scaffolded Creative Studio Template!', true);
      } else if (templateKey === 'consulting_lead') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'VERTEX ADVISORY', logoInitial: 'V', ctaText: 'Schedule Call' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'Strategic Architecture for Global Enterprises', subtitle: 'We help Fortune 500 engineering organizations streamline their multi-cloud data infrastructure.', ctaText: 'Request Consultation' } },
          { id: 'blk_' + Date.now() + '_3', type: 'stats', settings: { stat1Val: '$4.2B+', stat1Label: 'Assets Managed', stat2Val: '45+', stat2Label: 'Global Enterprise Clients', stat3Val: '14 Days', stat3Label: 'Avg Setup' } },
          { id: 'blk_' + Date.now() + '_4', type: 'form_builder', settings: { title: 'Request Executive Consultation', subtitle: 'Connect directly with our senior partners.' } },
          { id: 'blk_' + Date.now() + '_5', type: 'footer', settings: { brandName: 'VERTEX ADVISORY', copyrightText: '© 2026 VERTEX ADVISORY GROUP. All rights reserved.' } }
        ];
        showToast('Scaffolded Executive Consulting Template!', true);
      } else if (templateKey === 'minimal_docs') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'DOCS HUB', logoInitial: 'D', ctaText: 'API Specs' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'ETHENENGINE Developer Documentation', subtitle: 'Guides, architectural blueprints, and REST API references.', ctaText: 'Explore APIs' } },
          { id: 'blk_' + Date.now() + '_3', type: 'cms_feed', settings: { title: 'Engineering Guides & Release Notes', contentTypeSlug: 'blog-article' } },
          { id: 'blk_' + Date.now() + '_4', type: 'pagination', settings: { totalPages: 4, currentPage: 1 } },
          { id: 'blk_' + Date.now() + '_5', type: 'footer', settings: { brandName: 'DOCS HUB', copyrightText: '© 2026 ETHENENGINE Open Documentation.' } }
        ];
        showToast('Scaffolded Product Hub Template!', true);
      }
      renderCanvas(true);
    }

    function renderCanvas(updateInspector = true) {
      const container = document.getElementById('canvasContainer');
      if (!container) return;
      if (!pageData.blocks || pageData.blocks.length === 0) {
        container.innerHTML = '<div style="color:#64748b; padding:4rem 0; text-align:center; font-size:1.1rem;">Your page is empty. Click or drag components from the left drawer!</div>';
        if (updateInspector) renderInspector();
        return;
      }

      container.innerHTML = pageData.blocks.map((block, idx) => {
        let previewHtml = '';
        if (block.type === 'hero') {
          previewHtml = \`<div style="text-align:center; padding:1.5rem 0;">
            <h1 style="font-size:1.85rem; font-weight:900; color:#fff; margin-bottom:0.75rem; letter-spacing:-0.02em;">\${escapeText(block.settings.title || 'Hero Headline')}</h1>
            <p style="color:#94a3b8; font-size:0.95rem; max-width:600px; margin:0 auto 1.25rem; line-height:1.5;">\${escapeText(block.settings.subtitle || 'Subtitle content')}</p>
            <span class="btn" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); padding:0.6rem 1.4rem; font-weight:700;">\${escapeText(block.settings.ctaText || 'Get Started')}</span>
          </div>\`;
        } else if (block.type === 'stats') {
          previewHtml = \`<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; text-align:center; padding:1rem 0;">
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:1rem; border-radius:var(--radius);">
              <div style="font-size:1.5rem; font-weight:900; color:var(--primary);">\${escapeText(block.settings.stat1Val || '99.9%')}</div>
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-top:0.25rem;">\${escapeText(block.settings.stat1Label || 'Metric 1')}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:1rem; border-radius:var(--radius);">
              <div style="font-size:1.5rem; font-weight:900; color:#38bdf8;">\${escapeText(block.settings.stat2Val || '< 5ms')}</div>
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-top:0.25rem;">\${escapeText(block.settings.stat2Label || 'Metric 2')}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:1rem; border-radius:var(--radius);">
              <div style="font-size:1.5rem; font-weight:900; color:var(--secondary);">\${escapeText(block.settings.stat3Val || '100%')}</div>
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-top:0.25rem;">\${escapeText(block.settings.stat3Label || 'Metric 3')}</div>
            </div>
          </div>\`;
        } else if (block.type === 'features') {
          previewHtml = \`<div>
            <h3 style="text-align:center; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:1.25rem;">\${escapeText(block.settings.title || 'Key Features')}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;">
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius); padding:1.25rem;">
                <div style="font-size:1.3rem; margin-bottom:0.4rem;">⚡</div>
                <div style="font-weight:700; color:#fff; font-size:0.95rem; margin-bottom:0.3rem;">Ultra Fast Performance</div>
                <div style="color:#94a3b8; font-size:0.8rem; line-height:1.4;">Sub-5ms Bun execution with verified low latency.</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius); padding:1.25rem;">
                <div style="font-size:1.3rem; margin-bottom:0.4rem;">🔒</div>
                <div style="font-weight:700; color:#fff; font-size:0.95rem; margin-bottom:0.3rem;">Zero-Knowledge Cryptography</div>
                <div style="color:#94a3b8; font-size:0.8rem; line-height:1.4;">AES-256-GCM PBKDF2 field level security isolation.</div>
              </div>
            </div>
          </div>\`;
        } else if (block.type === 'pricing') {
          previewHtml = \`<div style="text-align:center;">
            <h3 style="font-size:1.35rem; color:#fff; margin-bottom:1.2rem; font-weight:800;">\${escapeText(block.settings.title || 'Enterprise Pricing')}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;">
              <div style="background:#111827; border:1px solid var(--primary); border-radius:var(--radius); padding:1.5rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
                <div style="font-size:1.1rem; font-weight:800; color:#fff;">\${escapeText(block.settings.planName || 'Enterprise Tier')}</div>
                <div style="font-size:1.8rem; font-weight:900; color:#34d399; margin:0.4rem 0;">$\${escapeText(block.settings.price || '99')}<span style="font-size:0.85rem; color:#94a3b8; font-weight:400;">/mo</span></div>
                <button class="btn" style="width:100%; margin-top:0.75rem; background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); font-weight:700;">Select Plan</button>
              </div>
            </div>
          </div>\`;
        } else if (block.type === 'testimonials') {
          previewHtml = \`<div style="text-align:center; padding:1rem 0;">
            <blockquote style="font-size:1.1rem; color:#e2e8f0; font-style:italic; line-height:1.55; max-width:650px; margin:0 auto;">"\${escapeText(block.settings.quote || 'ETHENENGINE completely transformed our digital architecture.')}"</blockquote>
            <div style="margin-top:0.75rem; font-weight:700; color:var(--primary); font-size:0.88rem;">— \${escapeText(block.settings.author || 'CTO, Fortune 500')}</div>
          </div>\`;
        } else if (block.type === 'cta') {
          previewHtml = \`<div style="background:linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.18)); border:1px solid rgba(255,255,255,0.12); border-radius:var(--radius); padding:2rem; text-align:center;">
            <h3 style="font-size:1.4rem; font-weight:900; color:#fff; margin-bottom:0.75rem; letter-spacing:-0.02em;">\${escapeText(block.settings.headline || 'Ready to produce your next campaign?')}</h3>
            <span class="btn" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); padding:0.65rem 1.6rem; font-weight:700;">\${escapeText(block.settings.buttonText || 'Book Consultation')}</span>
          </div>\`;
        } else if (block.type === 'navbar') {
          previewHtml = \`<div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius);">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <div class="brand-icon" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); width:30px; height:30px; border-radius:6px; display:grid; place-content:center; color:#fff; font-weight:900; font-size:0.85rem; position:relative;">\${escapeText(block.settings.logoInitial || 'E')}</div>
              <span style="font-weight:800; font-size:1.05rem; color:#fff;">\${escapeText(block.settings.brandName || 'BRAND')}</span>
            </div>
            <div style="display:flex; align-items:center; gap:1rem; font-size:0.82rem; color:#94a3b8;">
              <span>Features</span><span>Pricing</span><span>Contact</span>
              <span class="btn" style="padding:0.35rem 0.9rem; font-size:0.78rem; font-weight:700;">\${escapeText(block.settings.ctaText || 'Sign In')}</span>
            </div>
          </div>\`;
        } else if (block.type === 'announcement_bar') {
          previewHtml = \`<div style="background:linear-gradient(90deg,var(--primary),var(--secondary)); color:#fff; padding:0.5rem 1rem; border-radius:6px; display:flex; justify-content:center; align-items:center; gap:0.6rem; font-size:0.82rem; font-weight:700;">
            <span style="background:rgba(0,0,0,0.25); padding:0.1rem 0.4rem; border-radius:4px; font-size:0.7rem;">\${escapeText(block.settings.badgeText || 'SPECIAL')}</span>
            <span>\${escapeText(block.settings.message || 'Limited time promotional announcement banner.')}</span>
          </div>\`;
        } else if (block.type === 'product_grid') {
          previewHtml = \`<div>
            <div style="text-align:center; margin-bottom:1.25rem;">
              <h3 style="font-size:1.3rem; font-weight:800; color:#fff; margin:0 0 0.3rem;">\${escapeText(block.settings.title || 'Store Merchandise')}</h3>
              <p style="color:#94a3b8; font-size:0.85rem; margin:0;">\${escapeText(block.settings.subtitle || 'Available items shipped from warehouses.')}</p>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem;">
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); padding:1rem; border-radius:var(--radius); text-align:center;">
                <div style="font-size:2rem; margin-bottom:0.4rem;">🎬</div>
                <div style="font-weight:700; font-size:0.9rem; color:#fff;">8K Virtual Stage Pass</div>
                <div style="color:#34d399; font-weight:900; margin-top:0.35rem;">$499</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); padding:1rem; border-radius:var(--radius); text-align:center;">
                <div style="font-size:2rem; margin-bottom:0.4rem;">💎</div>
                <div style="font-weight:700; font-size:0.9rem; color:#fff;">Procedural VFX Suite</div>
                <div style="color:#34d399; font-weight:900; margin-top:0.35rem;">$249</div>
              </div>
            </div>
          </div>\`;
        } else if (block.type === 'pagination') {
          previewHtml = \`<div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem 0;">
            <span class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.78rem;">\${escapeText(block.settings.prevText || '← Previous')}</span>
            <span class="btn" style="width:30px; height:30px; padding:0; display:grid; place-content:center; font-size:0.82rem; font-weight:700;">1</span>
            <span class="btn btn-secondary" style="width:30px; height:30px; padding:0; display:grid; place-content:center; font-size:0.82rem; font-weight:700;">2</span>
            <span class="btn btn-secondary" style="width:30px; height:30px; padding:0; display:grid; place-content:center; font-size:0.82rem; font-weight:700;">3</span>
            <span class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.78rem;">\${escapeText(block.settings.nextText || 'Next →')}</span>
          </div>\`;
        } else if (block.type === 'form_builder') {
          previewHtml = \`<div style="max-width:550px; margin:0 auto; padding:1.5rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius);">
            <div style="text-align:center; margin-bottom:1rem;">
              <h3 style="font-size:1.25rem; color:#fff; font-weight:800; margin:0 0 0.3rem;">\${escapeText(block.settings.title || 'Request Consultation')}</h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0;">\${escapeText(block.settings.subtitle || 'Connect with solutions architecture.')}</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              <input class="field-input" placeholder="Full Name *" disabled style="opacity:0.7;" />
              <input class="field-input" placeholder="Work Email *" disabled style="opacity:0.7;" />
              <button class="btn" style="width:100%; margin-top:0.4rem; background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); font-weight:700;">\${escapeText(block.settings.buttonText || 'Submit Inquiry')}</button>
            </div>
          </div>\`;
        } else if (block.type === 'footer') {
          previewHtml = \`<div style="padding:1.5rem 0 0.5rem; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
            <div style="font-weight:800; font-size:1rem; color:#fff; margin-bottom:0.4rem;">\${escapeText(block.settings.brandName || 'BRAND')}</div>
            <p style="color:#64748b; font-size:0.78rem;">\${escapeText(block.settings.copyrightText || '© 2026 All Rights Reserved.')}</p>
          </div>\`;
        } else {
          previewHtml = \`<div style="color:#94a3b8; font-size:0.85rem;">Block Type: <strong>\${escapeText(block.type)}</strong></div>\`;
        }

        return \`
          <div class="canvas-block \${idx === selectedBlockIndex ? 'selected' : ''}" 
               id="canvasBlock_\${idx}"
               draggable="true"
               ondragstart="onCanvasBlockDragStart(event, \${idx})"
               ondragover="onCanvasBlockDragOver(event, \${idx})"
               ondragleave="onCanvasBlockDragLeave(event, \${idx})"
               ondrop="onCanvasBlockDrop(event, \${idx})"
               onclick="selectBlock(\${idx})">
            <!-- FLOATING INLINE QUICK ACTIONS TOOLBAR -->
            <div class="floating-action-toolbar">
              <button onclick="duplicateBlock(\${idx}); event.stopPropagation();" class="floating-action-btn" title="Duplicate Block">📄 Duplicate</button>
              <button onclick="moveBlock(\${idx}, -1); event.stopPropagation();" class="floating-action-btn" title="Move Up">▲ Up</button>
              <button onclick="moveBlock(\${idx}, 1); event.stopPropagation();" class="floating-action-btn" title="Move Down">▼ Down</button>
              <button onclick="deleteBlock(\${idx}); event.stopPropagation();" class="floating-action-btn delete-btn" title="Delete Block">✕ Delete</button>
            </div>
            \${previewHtml}
          </div>
        \`;
      }).join('');

      if (updateInspector) {
        renderInspector();
      }
    }

    function selectBlock(idx) {
      if (selectedBlockIndex === idx) return;
      selectedBlockIndex = idx;
      renderCanvas(true);
    }

    let undoHistory = null;

    function showToast(message, canUndo = false) {
      const toast = document.getElementById('studioToast');
      const msgEl = document.getElementById('studioToastMsg');
      const undoBtn = document.getElementById('studioToastUndoBtn');
      if (!toast) return;

      msgEl.innerText = message;
      undoBtn.style.display = canUndo ? 'inline-block' : 'none';
      toast.classList.add('show');

      clearTimeout(window._toastTimeout);
      window._toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }

    function triggerUndo() {
      if (!undoHistory) return;
      pageData.blocks = JSON.parse(JSON.stringify(undoHistory));
      undoHistory = null;
      renderCanvas();
      showToast('Action Undone!');
    }

    function duplicateBlock(idx) {
      if (!pageData.blocks[idx]) return;
      undoHistory = JSON.parse(JSON.stringify(pageData.blocks));
      const cloned = JSON.parse(JSON.stringify(pageData.blocks[idx]));
      cloned.id = 'blk_' + Date.now();
      pageData.blocks.splice(idx + 1, 0, cloned);
      selectedBlockIndex = idx + 1;
      renderCanvas();
      showToast('Block duplicated successfully!', true);
    }

    function addBlock(type) {
      undoHistory = JSON.parse(JSON.stringify(pageData.blocks));
      const newBlock = {
        id: 'blk_' + Date.now(),
        type,
        settings: type === 'navbar' ? { brandName: 'LIORAMEDIA', logoInitial: 'L', ctaText: 'Client Portal', ctaUrl: '/login' }
                : type === 'announcement_bar' ? { message: '🎉 Limited Time Offer: 20% off all production packages!', badgeText: 'SALE', linkText: 'View Deals', linkUrl: '#pricing' }
                : type === 'product_grid' ? { title: 'Merchandise & Virtual Passes', subtitle: 'Shipped from multi-warehouse inventory.', price: 199 }
                : type === 'pagination' ? { totalPages: 5, currentPage: 1, prevText: '← Previous', nextText: 'Next →' }
                : type === 'footer' ? { brandName: 'LIORAMEDIA', copyrightText: '© 2026 ETHENENGINE All rights reserved.' }
                : type === 'hero' ? { title: 'New Hero Headline', subtitle: 'Describe your high-impact value proposition here.', ctaText: 'Get Started', ctaUrl: '/' }
                : type === 'features' ? { title: 'Core Features', items: [{ name: 'High Speed', desc: 'Sub-5ms execution runtime' }, { name: 'Secure Isolation', desc: 'Zero knowledge cryptographic privacy' }] }
                : type === 'stats' ? { stat1Val: '99.99%', stat1Label: 'SLA Uptime', stat2Val: '< 5ms', stat2Label: 'Edge Latency', stat3Val: '100%', stat3Label: 'Zero-Knowledge' }
                : type === 'cms_feed' ? { title: 'Latest Case Studies & News', contentTypeSlug: 'blog-article', limit: 3 }
                : type === 'pricing' ? { title: 'Pricing & Plans', planName: 'Professional', price: '49' }
                : type === 'testimonials' ? { quote: 'Best platform architecture we have ever deployed.', author: 'Lead Architect' }
                : type === 'cta' ? { headline: 'Start Your Free Enterprise Trial', buttonText: 'Get Started Today' }
                : type === 'form_builder' ? { title: 'Request Enterprise Demo & Consultation', subtitle: 'Connect directly with our solutions team.', buttonText: 'Submit Inquiry' }
                : {}
      };
      pageData.blocks.push(newBlock);
      selectedBlockIndex = pageData.blocks.length - 1;
      renderCanvas();
      showToast('Block added to page!', true);
    }

    function deleteBlock(idx) {
      if (!pageData.blocks[idx]) return;
      undoHistory = JSON.parse(JSON.stringify(pageData.blocks));
      const deletedType = pageData.blocks[idx].type;
      pageData.blocks.splice(idx, 1);
      selectedBlockIndex = Math.max(0, idx - 1);
      renderCanvas();
      showToast(\`Block '\${deletedType}' deleted\`, true);
    }

    function moveBlock(idx, dir) {
      const target = idx + dir;
      if (target < 0 || target >= pageData.blocks.length) return;
      undoHistory = JSON.parse(JSON.stringify(pageData.blocks));
      const temp = pageData.blocks[idx];
      pageData.blocks[idx] = pageData.blocks[target];
      pageData.blocks[target] = temp;
      selectedBlockIndex = target;
      renderCanvas();
      showToast('Block moved ' + (dir < 0 ? 'Up' : 'Down'), true);
    }

    function onDrawerDragStart(e, type) {
      draggedBlockType = type;
      draggedCanvasBlockIdx = null;
      e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'drawer', type }));
      e.dataTransfer.effectAllowed = 'copy';
    }

    function onCanvasBlockDragStart(e, idx) {
      draggedCanvasBlockIdx = idx;
      draggedBlockType = null;
      e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'canvas', index: idx }));
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => {
        const el = document.getElementById('canvasBlock_' + idx);
        if (el) el.classList.add('dragging-item');
      }, 0);
    }

    function onCanvasBlockDragOver(e, idx) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const el = document.getElementById('canvasBlock_' + idx);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        el.classList.add('drag-over-top');
        el.classList.remove('drag-over-bottom');
      } else {
        el.classList.add('drag-over-bottom');
        el.classList.remove('drag-over-top');
      }
    }

    function onCanvasBlockDragLeave(e, idx) {
      const el = document.getElementById('canvasBlock_' + idx);
      if (el) {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      }
    }

    function onCanvasBlockDrop(e, targetIdx) {
      e.preventDefault();
      const el = document.getElementById('canvasBlock_' + targetIdx);
      const isTop = el ? el.classList.contains('drag-over-top') : true;
      if (el) el.classList.remove('drag-over-top', 'drag-over-bottom');

      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
        undoHistory = JSON.parse(JSON.stringify(pageData.blocks));

        if (data.source === 'drawer' && data.type) {
          const newBlock = {
            id: 'blk_' + Date.now(),
            type: data.type,
            settings: data.type === 'navbar' ? { brandName: 'LIORAMEDIA', logoInitial: 'L', ctaText: 'Client Portal', ctaUrl: '/login' }
                    : data.type === 'hero' ? { title: 'New Hero Headline', subtitle: 'High impact value proposition.', ctaText: 'Get Started', ctaUrl: '/' }
                    : data.type === 'features' ? { title: 'Core Features', items: [{ name: 'High Speed', desc: 'Sub-5ms execution runtime' }] }
                    : data.type === 'product_grid' ? { title: 'Merchandise Showcase', subtitle: 'Shipped from inventory.', price: 199 }
                    : data.type === 'pricing' ? { title: 'Pricing Plans', planName: 'Pro Tier', price: '49' }
                    : data.type === 'testimonials' ? { quote: 'Superb architecture.', author: 'Lead Architect' }
                    : data.type === 'cta' ? { headline: 'Start Your Enterprise Trial', buttonText: 'Get Started' }
                    : data.type === 'form_builder' ? { title: 'Request Enterprise Demo & Consultation', subtitle: 'Connect directly with our solutions team.', buttonText: 'Submit Inquiry' }
                    : {}
          };
          const insertPos = isTop ? targetIdx : targetIdx + 1;
          pageData.blocks.splice(insertPos, 0, newBlock);
          selectedBlockIndex = insertPos;
          renderCanvas();
          showToast(\`Inserted '\${data.type}' via Drag & Drop!\`, true);
        } else if (data.source === 'canvas' && typeof data.index === 'number') {
          const sourceIdx = data.index;
          if (sourceIdx === targetIdx) return;
          const [moved] = pageData.blocks.splice(sourceIdx, 1);
          let newTarget = isTop ? targetIdx : targetIdx + 1;
          if (sourceIdx < newTarget) newTarget -= 1;
          pageData.blocks.splice(newTarget, 0, moved);
          selectedBlockIndex = newTarget;
          renderCanvas();
          showToast('Block position reordered!', true);
        }
      } catch (err) {
        console.error('Drop error:', err);
      }
    }

    /* WCAG 2.2 Luminance & Contrast Ratio Calculator */
    function getLuminance(hex) {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function calculateContrastRatio(hex1, hex2) {
      const l1 = getLuminance(hex1);
      const l2 = getLuminance(hex2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function updateWcagBadges() {
      const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#070a12';
      const ratio = calculateContrastRatio(primary, bg).toFixed(1);

      const badge = document.getElementById('wcagBadge');
      if (!badge) return;

      if (ratio >= 7.0) {
        badge.className = 'wcag-badge wcag-pass';
        badge.innerText = \`✓ AAA Pass (\${ratio}:1)\`;
      } else if (ratio >= 4.5) {
        badge.className = 'wcag-badge wcag-pass';
        badge.innerText = \`✓ AA Pass (\${ratio}:1)\`;
      } else {
        badge.className = 'wcag-badge wcag-fail';
        badge.innerText = \`✕ Fail (\${ratio}:1)\`;
      }
    }

    async function applyPreset(presetKey) {
      try {
        const res = await fetch('/api/theme/presets/' + presetKey, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') }
        });
        const data = await res.json();
        if (res.ok) {
          applyThemeTokensLocally(data.theme.tokens);
          showToast('Applied ' + presetKey + ' theme preset!');
        }
      } catch (e) {
        alert('Failed to apply preset.');
      }
    }

    async function applyHolidayEffect(effKey) {
      try {
        const res = await fetch('/api/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
          body: JSON.stringify({ tokens: { holidayEffect: effKey === 'none' ? undefined : effKey } })
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch (e) {
        alert('Failed to update holiday overlay.');
      }
    }

    function applyDayMode() {
      applyPreset('day_clean');
    }

    function applyNightMode() {
      applyPreset('midnight_slate');
    }

    function applyThemeTokensLocally(tokens) {
      if (tokens.primaryColor) document.documentElement.style.setProperty('--primary', tokens.primaryColor);
      if (tokens.secondaryColor) document.documentElement.style.setProperty('--secondary', tokens.secondaryColor);
      if (tokens.backgroundColor) document.documentElement.style.setProperty('--bg', tokens.backgroundColor);
      if (tokens.cardBg) document.documentElement.style.setProperty('--card-bg', tokens.cardBg);
      if (tokens.borderRadius) document.documentElement.style.setProperty('--radius', tokens.borderRadius);
      updateWcagBadges();
    }

    async function updateThemeToken(tokenKey, value) {
      document.documentElement.style.setProperty(
        tokenKey === 'primaryColor' ? '--primary' :
        tokenKey === 'secondaryColor' ? '--secondary' :
        tokenKey === 'backgroundColor' ? '--bg' :
        tokenKey === 'cardBg' ? '--card-bg' :
        tokenKey === 'borderRadius' ? '--radius' : tokenKey,
        value
      );
      updateWcagBadges();

      const tokens = {};
      tokens[tokenKey] = value;
      try {
        await fetch('/api/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
          body: JSON.stringify({ tokens })
        });
      } catch (e) {}
    }

    /* Coolors 5-Color Harmonizer Generator State */
    let harmonizerColors = [
      { hex: '#2E4057', locked: false },
      { hex: '#048A81', locked: false },
      { hex: '#06D6A0', locked: false },
      { hex: '#ECE5CE', locked: false },
      { hex: '#C5E0DC', locked: false }
    ];

    function renderHarmonizer() {
      const container = document.getElementById('harmonizerStrip');
      if (!container) return;
      container.innerHTML = harmonizerColors.map((c, i) => \`
        <div class="palette-harmonizer-cell" style="background:\${c.hex};" onclick="applyHarmonizerColor(\${i})">
          <button onclick="toggleColorLock(\${i}); event.stopPropagation();" class="palette-lock-btn \${c.locked ? 'locked' : ''}">
            \${c.locked ? '🔒' : '🔓'}
          </button>
          <span style="font-size:0.58rem; color:#fff; font-weight:800; text-shadow:0 1px 3px #000; margin-top:2px;">\${c.hex}</span>
        </div>
      \`).join('');
    }

    function toggleColorLock(i) {
      harmonizerColors[i].locked = !harmonizerColors[i].locked;
      renderHarmonizer();
    }

    function applyHarmonizerColor(i) {
      updateThemeToken('primaryColor', harmonizerColors[i].hex);
      showToast('Applied ' + harmonizerColors[i].hex + ' as Primary!');
    }

    function randomizePalette() {
      const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
      harmonizerColors = harmonizerColors.map(c => c.locked ? c : { ...c, hex: randomHex() });
      renderHarmonizer();
      const unlocked = harmonizerColors.find(c => !c.locked) || harmonizerColors[0];
      updateThemeToken('primaryColor', unlocked.hex);
      showToast('🎲 Palette harmonized & updated!');
    }

    function renderInspector() {
      const block = pageData.blocks[selectedBlockIndex];
      const inspector = document.getElementById('inspectorContent');
      const badge = document.getElementById('inspectorBadge');
      if (!block) {
        inspector.innerHTML = '<div style="color:#64748b; padding:3rem 0; text-align:center;">Select a block to inspect.</div>';
        if (badge) badge.innerText = 'NONE';
        return;
      }

      if (badge) badge.innerText = block.type.toUpperCase();
      let fieldsHtml = \`<div style="font-weight:800; color:#38bdf8; margin-bottom:0.75rem; font-size:0.85rem;">\${block.type.toUpperCase()} SETTINGS</div>\`;

      if (block.type === 'navbar') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Brand Logo Text</label>
            <input class="field-input" value="\${escapeText(block.settings.brandName || '')}" oninput="updateSetting('brandName', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Logo Badge Letter</label>
            <input class="field-input" value="\${escapeText(block.settings.logoInitial || 'E')}" oninput="updateSetting('logoInitial', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">CTA Button Text</label>
            <input class="field-input" value="\${escapeText(block.settings.ctaText || '')}" oninput="updateSetting('ctaText', this.value)" />
          </div>
        \`;
      } else if (block.type === 'announcement_bar') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Announcement Text</label>
            <input class="field-input" value="\${escapeText(block.settings.message || '')}" oninput="updateSetting('message', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Badge Label</label>
            <input class="field-input" value="\${escapeText(block.settings.badgeText || '')}" oninput="updateSetting('badgeText', this.value)" />
          </div>
        \`;
      } else if (block.type === 'product_grid') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Catalog Headline</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Catalog Subtitle</label>
            <input class="field-input" value="\${escapeText(block.settings.subtitle || '')}" oninput="updateSetting('subtitle', this.value)" />
          </div>
        \`;
      } else if (block.type === 'pagination') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Total Pages Count</label>
            <input type="number" class="field-input" value="\${escapeText(block.settings.totalPages || 5)}" oninput="updateSetting('totalPages', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Current Active Page</label>
            <input type="number" class="field-input" value="\${escapeText(block.settings.currentPage || 1)}" oninput="updateSetting('currentPage', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Previous Button Text</label>
            <input class="field-input" value="\${escapeText(block.settings.prevText || '← Previous')}" oninput="updateSetting('prevText', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Next Button Text</label>
            <input class="field-input" value="\${escapeText(block.settings.nextText || 'Next →')}" oninput="updateSetting('nextText', this.value)" />
          </div>
        \`;
      } else if (block.type === 'footer') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Brand Name</label>
            <input class="field-input" value="\${escapeText(block.settings.brandName || '')}" oninput="updateSetting('brandName', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Copyright Notice</label>
            <input class="field-input" value="\${escapeText(block.settings.copyrightText || '')}" oninput="updateSetting('copyrightText', this.value)" />
          </div>
        \`;
      } else if (block.type === 'hero') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Headline Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Subtitle</label>
            <textarea class="field-input" rows="3" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div class="field-group">
            <label class="field-label">Button CTA Text</label>
            <input class="field-input" value="\${escapeText(block.settings.ctaText || '')}" oninput="updateSetting('ctaText', this.value)" />
          </div>
        \`;
      } else if (block.type === 'stats') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Stat 1 (Value / Label)</label>
            <div style="display:flex; gap:0.5rem;">
              <input class="field-input" placeholder="99.9%" value="\${escapeText(block.settings.stat1Val || '')}" oninput="updateSetting('stat1Label', this.value)" />
              <input class="field-input" placeholder="Uptime" value="\${escapeText(block.settings.stat1Label || '')}" oninput="updateSetting('stat1Label', this.value)" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Stat 2 (Value / Label)</label>
            <div style="display:flex; gap:0.5rem;">
              <input class="field-input" placeholder="< 5ms" value="\${escapeText(block.settings.stat2Val || '')}" oninput="updateSetting('stat2Val', this.value)" />
              <input class="field-input" placeholder="Latency" value="\${escapeText(block.settings.stat2Label || '')}" oninput="updateSetting('stat2Label', this.value)" />
            </div>
          </div>
        \`;
      } else if (block.type === 'cta') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Banner Headline</label>
            <input class="field-input" value="\${escapeText(block.settings.headline || '')}" oninput="updateSetting('headline', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Button Label</label>
            <input class="field-input" value="\${escapeText(block.settings.buttonText || '')}" oninput="updateSetting('buttonText', this.value)" />
          </div>
        \`;
      } else if (block.type === 'pricing') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Plan Name</label>
            <input class="field-input" value="\${escapeText(block.settings.planName || '')}" oninput="updateSetting('planName', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Monthly Price ($)</label>
            <input class="field-input" value="\${escapeText(block.settings.price || '')}" oninput="updateSetting('price', this.value)" />
          </div>
        \`;
      } else if (block.type === 'testimonials') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Quote Text</label>
            <textarea class="field-input" rows="3" oninput="updateSetting('quote', this.value)">\${escapeText(block.settings.quote || '')}</textarea>
          </div>
          <div class="field-group">
            <label class="field-label">Author / Role</label>
            <input class="field-input" value="\${escapeText(block.settings.author || '')}" oninput="updateSetting('author', this.value)" />
          </div>
        \`;
      } else if (block.type === 'cms_feed') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Feed Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Content Type Slug</label>
            <input class="field-input" value="\${escapeText(block.settings.contentTypeSlug || 'blog-article')}" oninput="updateSetting('contentTypeSlug', this.value)" />
          </div>
        \`;
      } else if (block.type === 'form_builder') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Form Headline</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Form Subtitle</label>
            <input class="field-input" value="\${escapeText(block.settings.subtitle || '')}" oninput="updateSetting('subtitle', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Submit Button Label</label>
            <input class="field-input" value="\${escapeText(block.settings.buttonText || '')}" oninput="updateSetting('buttonText', this.value)" />
          </div>
        \`;
      } else {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Section Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
        \`;
      }

      inspector.innerHTML = fieldsHtml;
    }

    function updateSetting(key, val) {
      if (!pageData.blocks || !pageData.blocks[selectedBlockIndex]) return;
      pageData.blocks[selectedBlockIndex].settings[key] = val;
      renderCanvas(false); // Update canvas visual preview without blowing away the active focused input!
    }

    async function savePage() {
      const saveBtn = document.getElementById('savePageBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = '💾 Saving...';
      }
      try {
        const tenantSlug = '${escapeHtml(tenantSlug)}';
        const res = await fetch('/api/website/pages/' + encodeURIComponent(pageData.id) + '/blocks?tenant=' + encodeURIComponent(tenantSlug), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantSlug,
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
          },
          body: JSON.stringify({ blocks: pageData.blocks })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('✅ Page saved successfully!');
        } else {
          showToast('⚠️ ' + (data.error || 'Failed to save page.'));
        }
      } catch (e) {
        showToast('⚠️ Network error while saving page.');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerText = '💾 Save Page';
        }
      }
    }

    function escapeText(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Real-Time Collaboration & Presence Client Sync Engine
    const collabUser = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      name: localStorage.getItem('collab_username') || ('Designer ' + Math.floor(100 + Math.random() * 900)),
      avatarColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#38bdf8', '#a855f7'][Math.floor(Math.random() * 6)],
      cursor: { x: 0, y: 0 },
      lastOperationTimestamp: 0
    };

    const canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
      canvasContainer.addEventListener('mousemove', (e) => {
        const rect = canvasContainer.getBoundingClientRect();
        collabUser.cursor.x = Math.round(e.clientX - rect.left);
        collabUser.cursor.y = Math.round(e.clientY - rect.top);
      });
    }

    async function syncCollabPresence() {
      try {
        const res = await fetch('/api/collab/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
          body: JSON.stringify({
            id: collabUser.id,
            name: collabUser.name,
            avatarColor: collabUser.avatarColor,
            pageId: pageData.id,
            cursor: collabUser.cursor,
            selectedBlockIndex: selectedBlockIndex,
            sinceTimestamp: collabUser.lastOperationTimestamp
          })
        });
        const data = await res.json();
        if (data.collaborators) {
          renderCollaboratorAvatars(data.collaborators);
          renderRemoteCursors(data.collaborators.filter(c => c.id !== collabUser.id));
        }
      } catch (e) {
        // Silent presence reconnect
      }
    }

    function renderCollaboratorAvatars(collaborators) {
      const stack = document.getElementById('collaboratorAvatarStack');
      const countEl = document.getElementById('presenceCountText');
      if (countEl) countEl.innerText = collaborators.length + (collaborators.length === 1 ? ' Live' : ' Live');
      if (!stack) return;

      stack.innerHTML = collaborators.map(c => \`
        <div class="presence-avatar-pill" style="background:\${c.avatarColor};" title="\${escapeText(c.name)} \${c.id === collabUser.id ? '(You)' : ''}">
          \${escapeText(c.name.charAt(0).toUpperCase())}
        </div>
      \`).join('');
    }

    function renderRemoteCursors(remoteUsers) {
      const container = document.getElementById('canvasContainer');
      if (!container) return;

      // Remove existing remote cursors
      document.querySelectorAll('.remote-cursor').forEach(el => el.remove());
      document.querySelectorAll('.canvas-block').forEach(el => {
        el.classList.remove('co-editing');
        el.removeAttribute('data-co-editor');
      });

      remoteUsers.forEach(user => {
        if (user.cursor && (user.cursor.x > 0 || user.cursor.y > 0)) {
          const cursorEl = document.createElement('div');
          cursorEl.className = 'remote-cursor';
          cursorEl.style.left = user.cursor.x + 'px';
          cursorEl.style.top = user.cursor.y + 'px';
          cursorEl.innerHTML = \`
            <svg class="remote-cursor-pointer" viewBox="0 0 24 24" fill="\${user.avatarColor}">
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36z"/>
            </svg>
            <span class="remote-cursor-label" style="background:\${user.avatarColor};">\${escapeText(user.name)}</span>
          \`;
          container.appendChild(cursorEl);
        }

        // Highlight block if being co-edited by remote teammate
        if (typeof user.selectedBlockIndex === 'number') {
          const blockEl = document.getElementById('canvasBlock_' + user.selectedBlockIndex);
          if (blockEl) {
            blockEl.classList.add('co-editing');
            blockEl.setAttribute('data-co-editor', user.name + ' editing');
            blockEl.style.setProperty('--co-edit-color', user.avatarColor);
          }
        }
      });
    }

    // Start Real-Time Presence Heartbeat (every 2.5 seconds)
    syncCollabPresence();
    setInterval(syncCollabPresence, 2500);

    // Initial Render
    renderCanvas();
    renderHarmonizer();
    updateWcagBadges();
  </script>

  <!-- INTERACTIVE TOAST NOTIFICATION CONTAINER -->
  <div id="studioToast" class="studio-toast">
    <span id="studioToastMsg">Action completed!</span>
    <button id="studioToastUndoBtn" onclick="triggerUndo()" class="studio-toast-undo" style="display:none;">↩ Undo</button>
  </div>
</body>
</html>`;
}
