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
    
    /* Studio Layout & Split View */
    .editor-layout {
      display: flex;
      height: calc(100vh - 54px);
      overflow: hidden;
      background: #070a14;
    }

    .workspace-viewport {
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;
      background: #05070e;
    }

    .canvas-viewport {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      justify-content: center;
    }

    .preview-viewport {
      flex: 1;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      background: #060913;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .preview-frame-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: auto;
      padding: 1rem;
      background: radial-gradient(circle at 50% 30%, rgba(99,102,241,0.05), transparent 70%), #04060a;
    }

    .preview-frame {
      width: 100%;
      height: 100%;
      min-height: 100%;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: #070a12;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      transition: width 0.25s ease, height 0.25s ease;
    }

    /* Inspector Sub-Item Cards */
    .inspector-item-card {
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.85rem;
      margin-bottom: 0.85rem;
      position: relative;
    }
    .inspector-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 800;
      color: #94a3b8;
      margin-bottom: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .inspector-del-btn {
      background: transparent;
      border: none;
      color: #f87171;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .inspector-del-btn:hover {
      background: rgba(239, 68, 68, 0.15);
    }
    .inspector-add-btn {
      width: 100%;
      padding: 0.55rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px dashed rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-top: 0.4rem;
    }
    .inspector-add-btn:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #fff;
    }
  </style>
  <style id="dynamicHolidayStyle">
    ${holidayCss}
  </style>
</head>
<body>
  <!-- TOP STUDIO TOOLBAR -->
  <div class="editor-toolbar" style="height:54px; background:#070a14; border-bottom:1px solid rgba(255,255,255,0.08); padding:0 1.25rem; display:flex; align-items:center; justify-content:space-between; z-index:100;">
    <div style="display:flex; align-items:center; gap:0.85rem;">
      <div class="toolbar-brand" style="font-weight:900; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
        <div class="brand-icon" style="background:var(--primary, #6366f1); width:28px; height:28px; border-radius:6px; display:grid; place-content:center; color:#fff; font-weight:900; font-size:0.85rem; position:relative;">E</div>
        <span style="letter-spacing:-0.02em;">ETHENENGINE STUDIO</span>
      </div>
      <a href="/admin?tenant=${escapeHtml(tenantSlug)}&view=website" class="btn btn-secondary" style="padding:0.3rem 0.65rem; font-size:0.75rem;">← Admin</a>
      
      <select onchange="window.location.href='/editor?tenant=${escapeHtml(tenantSlug)}&pageId=' + this.value" class="field-input" style="width:200px; padding:0.35rem 0.65rem; font-size:0.8rem;">
        ${pages.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === page.id ? 'selected' : ''}>${escapeHtml(p.title)} (/${escapeHtml(p.slug)})</option>`).join('')}
      </select>
    </div>

    <!-- VIEW MODE SWITCHER & RESPONSIVE BREAKPOINT SWITCHER -->
    <div style="display:flex; align-items:center; gap:0.75rem;">
      <!-- STUDIO VIEW MODES: CANVAS ONLY | SIDE-BY-SIDE SPLIT | FULL PREVIEW -->
      <div style="display:flex; align-items:center; background:#101524; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:2px;">
        <button class="btn btn-secondary" id="btnModeCanvas" onclick="setStudioViewMode('canvas')" style="padding:0.3rem 0.65rem; font-size:0.75rem; border:none; background:transparent; color:#94a3b8;" title="Focus on canvas editing">🛠️ Canvas</button>
        <button class="btn btn-secondary" id="btnModeSplit" onclick="setStudioViewMode('split')" style="padding:0.3rem 0.65rem; font-size:0.75rem; border:none; background:rgba(99,102,241,0.25); color:#fff; font-weight:700;" title="Edit and watch live preview simultaneously">🪟 Side-by-Side</button>
        <button class="btn btn-secondary" id="btnModePreview" onclick="setStudioViewMode('preview')" style="padding:0.3rem 0.65rem; font-size:0.75rem; border:none; background:transparent; color:#94a3b8;" title="Full storefront preview">🌐 Preview</button>
      </div>

      <!-- DEVICE BREAKPOINTS -->
      <div style="display:flex; align-items:center; background:#101524; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:2px;">
        <button class="btn btn-secondary" id="btnDesktop" onclick="setDevice('desktop')" style="padding:0.3rem 0.6rem; font-size:0.75rem; border:none; background:rgba(99,102,241,0.2); color:#fff;">🖥️ Desktop</button>
        <button class="btn btn-secondary" id="btnTablet" onclick="setDevice('tablet')" style="padding:0.3rem 0.6rem; font-size:0.75rem; border:none; background:transparent; color:#94a3b8;">📱 Tablet</button>
        <button class="btn btn-secondary" id="btnMobile" onclick="setDevice('mobile')" style="padding:0.3rem 0.6rem; font-size:0.75rem; border:none; background:transparent; color:#94a3b8;">📲 Mobile</button>
      </div>
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

      <button id="savePageBtn" class="btn" onclick="savePage()" style="background:#6366f1; font-weight:700; padding:0.45rem 1rem;">💾 Save Page</button>
      <a id="livePreviewBtn" href="/preview/${escapeHtml(page.slug)}?tenant=${escapeHtml(tenantSlug)}" target="_blank" class="btn btn-secondary" style="padding:0.45rem 0.9rem;">👁️ Pop Out ↗</a>
    </div>
  </div>

  <div class="editor-layout" id="editorLayout">
    <!-- LEFT DRAWER: TABS FOR BLOCKS, PAGES, MEDIA & THEME -->
    <div class="component-drawer" id="componentDrawer">
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
          <button onclick="openCreatePageModal()" class="btn" style="padding:0.25rem 0.6rem; font-size:0.72rem; font-weight:700;">+ New Page</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${pages.map(p => `
            <div style="background:${p.id === page.id ? 'rgba(99,102,241,0.18)' : '#101524'}; border:1px solid ${p.id === page.id ? '#6366f1' : 'rgba(255,255,255,0.06)'}; border-radius:8px; padding:0.65rem 0.85rem; display:flex; justify-content:space-between; align-items:center;">
              <div style="cursor:pointer;" onclick="window.location.href='/editor?tenant=${escapeHtml(tenantSlug)}&pageId=${escapeHtml(p.id)}'">
                <div style="font-weight:700; font-size:0.85rem; color:#fff;">${escapeHtml(p.title)}</div>
                <div style="font-size:0.72rem; color:#94a3b8; font-family:monospace;">/${escapeHtml(p.slug)} · ${(p.blocks || []).length} blocks</div>
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
        <p style="font-size:0.75rem; color:#94a3b8; line-height:1.4; margin-bottom:0.75rem;">
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
        <button onclick="openBlockLibraryModal('all')" class="btn" style="width:100%; margin-bottom:1.1rem; padding:0.65rem; background:var(--primary, #6366f1); font-weight:800; font-size:0.82rem; border-radius:8px; display:flex; justify-content:center; align-items:center; gap:0.5rem;">
          <span>🧩 Open Block Selector Window</span>
        </button>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:0.75rem;">Navigation & Header</h4>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'navbar')" onclick="addBlock('navbar')">
          <div class="block-card-icon">🧭</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Navigation Bar</div><div style="font-size:0.72rem; color:#94a3b8;">Brand logo, menu links & CTA</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'announcement_bar')" onclick="addBlock('announcement_bar')">
          <div class="block-card-icon">📢</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Announcement Banner</div><div style="font-size:0.72rem; color:#94a3b8;">Top sale announcement ticker</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'hero')" onclick="addBlock('hero')">
          <div class="block-card-icon">⚡</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Hero Banner</div><div style="font-size:0.72rem; color:#94a3b8;">Headline, CTAs & visual mockup</div></div>
        </div>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:1.25rem 0 0.75rem;">Rich Media & Visuals</h4>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'image_showcase')" onclick="addBlock('image_showcase')">
          <div class="block-card-icon">🖼️</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Image Banner & Showcase</div><div style="font-size:0.72rem; color:#94a3b8;">Single image, caption & destination link</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'video_player')" onclick="addBlock('video_player')">
          <div class="block-card-icon">🎬</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Video Player & Embed</div><div style="font-size:0.72rem; color:#94a3b8;">YouTube, Vimeo & MP4 video player</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'gallery')" onclick="addBlock('gallery')">
          <div class="block-card-icon">📸</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Media Gallery Grid</div><div style="font-size:0.72rem; color:#94a3b8;">Multi-image showcase grid with links</div></div>
        </div>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:1.25rem 0 0.75rem;">Content & Social Proof</h4>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'stats')" onclick="addBlock('stats')">
          <div class="block-card-icon">📊</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Key Metrics / Stats</div><div style="font-size:0.72rem; color:#94a3b8;">Multi-column metrics & proof</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'features')" onclick="addBlock('features')">
          <div class="block-card-icon">✨</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Features Grid</div><div style="font-size:0.72rem; color:#94a3b8;">Configurable cards with icons</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'pricing')" onclick="addBlock('pricing')">
          <div class="block-card-icon">💎</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Pricing Comparison</div><div style="font-size:0.72rem; color:#94a3b8;">Multi-tier comparison tables</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'testimonials')" onclick="addBlock('testimonials')">
          <div class="block-card-icon">💬</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Customer Reviews</div><div style="font-size:0.72rem; color:#94a3b8;">Ratings & client quotes</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'faq')" onclick="addBlock('faq')">
          <div class="block-card-icon">❓</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">FAQ Accordion</div><div style="font-size:0.72rem; color:#94a3b8;">Expandable Q&A accordion cards</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'cms_feed')" onclick="addBlock('cms_feed')">
          <div class="block-card-icon">📝</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Headless CMS Feed</div><div style="font-size:0.72rem; color:#94a3b8;">Dynamic articles & releases</div></div>
        </div>

        <h4 style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:1.25rem 0 0.75rem;">Conversion & Actions</h4>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'product_grid')" onclick="addBlock('product_grid')">
          <div class="block-card-icon">🛍️</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Store Showcase</div><div style="font-size:0.72rem; color:#94a3b8;">Product merchandise catalog</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'cta')" onclick="addBlock('cta')">
          <div class="block-card-icon">🎯</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">CTA Callout Banner</div><div style="font-size:0.72rem; color:#94a3b8;">Gradient conversion block</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'form_builder')" onclick="addBlock('form_builder')">
          <div class="block-card-icon">📋</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Lead Capture Form</div><div style="font-size:0.72rem; color:#94a3b8;">Inquiry form with CRM pipeline</div></div>
        </div>
        <div class="block-card" draggable="true" ondragstart="onDrawerDragStart(event, 'pagination')" onclick="addBlock('pagination')">
          <div class="block-card-icon">🔢</div>
          <div><div style="font-weight:600; font-size:0.85rem; color:#fff;">Pagination Manager</div><div style="font-size:0.72rem; color:#94a3b8;">Numbered page buttons & range controls</div></div>
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
          <div style="font-size:0.8rem; font-weight:700; color:#fff;">🌗 Day / Night Theme Mode</div>
          <div style="display:flex; gap:0.35rem;">
            <button onclick="applyDayMode()" class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" title="Clean Sunlight mode">☀️ Day</button>
            <button onclick="applyNightMode()" class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" title="Midnight Dark Slate">🌙 Night</button>
          </div>
        </div>

        <!-- EXTENSIVE FREE OPEN GOOGLE FONTS LIBRARY -->
        <div style="margin-bottom:1rem; background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.75rem;">
          <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
            <span>🔤 Google Open Fonts Library</span>
          </div>
          <div class="field-group" style="margin-bottom:0.5rem;">
            <label class="field-label">Heading Font Family</label>
            <select class="field-input" onchange="changeFontHeading(this.value)">
              <option value="Inter">Inter (Clean Tech Sans)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Geometric)</option>
              <option value="Outfit">Outfit (Bold Contemporary)</option>
              <option value="Poppins">Poppins (Rounded Geometric)</option>
              <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
              <option value="Space Grotesk">Space Grotesk (Futuristic Tech)</option>
              <option value="Cinzel">Cinzel (Classical Luxury Serif)</option>
              <option value="Fira Code">Fira Code (Monospace Code)</option>
              <option value="Lora">Lora (Literary Warm Serif)</option>
              <option value="Montserrat">Montserrat (Architectural Sans)</option>
              <option value="Urbanist">Urbanist (Minimalist Geometric)</option>
            </select>
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label class="field-label">Body Text Font Family</label>
            <select class="field-input" onchange="changeFontBody(this.value)">
              <option value="Inter">Inter (Readable Neutral)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto (Clean Universal)</option>
              <option value="Lora">Lora (Serif Body)</option>
              <option value="Fira Code">Fira Code (Monospace)</option>
            </select>
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

    <!-- CENTER WORKSPACE: CANVAS VIEWPORT & SIDE-BY-SIDE LIVE PREVIEW -->
    <div class="workspace-viewport" id="workspaceViewport">
      <!-- 1. INTERACTIVE VISUAL CANVAS -->
      <div class="canvas-viewport" id="canvasViewport">
        <div class="canvas-container" id="canvasContainer" style="width:100%; max-width:860px;">
          <!-- Rendered dynamically via renderCanvas() -->
        </div>
      </div>

      <!-- 2. SIDE-BY-SIDE LIVE STOREFRONT PREVIEW -->
      <div class="preview-viewport" id="previewViewport">
        <div style="height:38px; background:#0c101d; border-bottom:1px solid rgba(255,255,255,0.06); padding:0 0.85rem; display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; color:#94a3b8;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
            <span style="font-weight:700; color:#fff;">Live Storefront Mirror</span>
            <span style="font-size:0.7rem; color:#64748b; font-family:monospace;">/preview/${escapeHtml(page.slug)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <button onclick="refreshPreviewIframe()" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.7rem;" title="Refresh live preview">🔄 Sync</button>
            <a href="/preview/${escapeHtml(page.slug)}?tenant=${escapeHtml(tenantSlug)}" target="_blank" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.7rem;" title="Open in new tab">↗ Pop Out</a>
          </div>
        </div>
        <div class="preview-frame-container" id="previewFrameContainer">
          <iframe id="livePreviewIframe" class="preview-frame" src="/preview/${escapeHtml(page.slug)}?tenant=${escapeHtml(tenantSlug)}"></iframe>
        </div>
      </div>
    </div>

    <!-- RIGHT INSPECTOR DRAWER -->
    <div class="property-inspector" id="propertyInspector" style="width:340px; min-width:300px; max-width:380px; background:#0b0f19; border-left:1px solid rgba(255,255,255,0.08); padding:1rem; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
        <span style="font-weight:800; font-size:0.85rem; color:#fff; letter-spacing:0.5px;">INSPECTOR</span>
        <span class="inspector-badge" id="inspectorBadge" style="background:rgba(99,102,241,0.2); color:#818cf8; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.7rem; font-weight:800;">SELECT BLOCK</span>
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
    let studioViewMode = 'split'; // 'canvas' | 'split' | 'preview'
    let currentDevice = 'desktop';

    function setStudioViewMode(mode) {
      studioViewMode = mode;
      const canvasView = document.getElementById('canvasViewport');
      const previewView = document.getElementById('previewViewport');
      const btnC = document.getElementById('btnModeCanvas');
      const btnS = document.getElementById('btnModeSplit');
      const btnP = document.getElementById('btnModePreview');

      [btnC, btnS, btnP].forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#94a3b8';
        b.style.fontWeight = 'normal';
      });

      if (mode === 'canvas') {
        canvasView.style.display = 'flex';
        canvasView.style.flex = '1';
        previewView.style.display = 'none';
        btnC.style.background = 'rgba(99,102,241,0.25)';
        btnC.style.color = '#fff';
        btnC.style.fontWeight = '700';
      } else if (mode === 'preview') {
        canvasView.style.display = 'none';
        previewView.style.display = 'flex';
        previewView.style.flex = '1';
        btnP.style.background = 'rgba(99,102,241,0.25)';
        btnP.style.color = '#fff';
        btnP.style.fontWeight = '700';
        refreshPreviewIframe();
      } else { // 'split'
        canvasView.style.display = 'flex';
        canvasView.style.flex = '1';
        previewView.style.display = 'flex';
        previewView.style.flex = '1';
        btnS.style.background = 'rgba(99,102,241,0.25)';
        btnS.style.color = '#fff';
        btnS.style.fontWeight = '700';
      }
    }

    function setDevice(device) {
      currentDevice = device;
      const canvasContainer = document.getElementById('canvasContainer');
      const previewIframe = document.getElementById('livePreviewIframe');
      const btnD = document.getElementById('btnDesktop');
      const btnT = document.getElementById('btnTablet');
      const btnM = document.getElementById('btnMobile');

      [btnD, btnT, btnM].forEach(b => { b.style.background = 'transparent'; b.style.color = '#94a3b8'; });
      const activeBtn = device === 'desktop' ? btnD : device === 'tablet' ? btnT : btnM;
      activeBtn.style.background = 'rgba(99,102,241,0.2)';
      activeBtn.style.color = '#fff';

      if (device === 'mobile') {
        canvasContainer.style.maxWidth = '390px';
        if (previewIframe) { previewIframe.style.width = '390px'; previewIframe.style.height = '844px'; }
      } else if (device === 'tablet') {
        canvasContainer.style.maxWidth = '768px';
        if (previewIframe) { previewIframe.style.width = '768px'; previewIframe.style.height = '1024px'; }
      } else {
        canvasContainer.style.maxWidth = '860px';
        if (previewIframe) { previewIframe.style.width = '100%'; previewIframe.style.height = '100%'; }
      }
    }

    function refreshPreviewIframe() {
      const iframe = document.getElementById('livePreviewIframe');
      if (iframe) {
        iframe.src = '/preview/${escapeHtml(page.slug)}?tenant=${escapeHtml(tenantSlug)}&t=' + Date.now();
      }
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
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'Enterprise Intelligence Distributed to the Edge', subtitle: 'Real-time multi-tenant runtime engine with zero-knowledge cryptographic isolation.', badgeText: '⚡ NEXT-GEN V2.0', ctaText: 'Get Started', ctaUrl: '#pricing' } },
          { id: 'blk_' + Date.now() + '_3', type: 'stats', settings: { stat1Val: '99.999%', stat1Label: 'SLA Availability', stat2Val: '< 2.4ms', stat2Label: 'Edge Latency', stat3Val: '100%', stat3Label: 'Zero-Knowledge' } },
          { id: 'blk_' + Date.now() + '_4', type: 'features', settings: { title: 'Architected for High Scale', items: [{ icon: '⚡', name: 'Ultra-Fast Performance', desc: 'Sub-5ms execution latency powered by Bun runtime.' }, { icon: '🔒', name: 'Zero-Knowledge Security', desc: 'PBKDF2 AES-256-GCM field encryption isolation.' }, { icon: '🌐', name: 'Infinite Multi-Tenancy', desc: 'Provision enterprise organizations in milliseconds.' }] } },
          { id: 'blk_' + Date.now() + '_5', type: 'pricing', settings: { title: 'Scalable Platform Tiers', currency: '$', billingPeriod: '/month', tiers: [ { name: 'Starter', price: '29', period: '/mo', badge: '', description: 'For creators and solo developers.', features: ['1 Tenant Org', '10 Dynamic Pages', 'Community Support'], ctaText: 'Start Free', ctaUrl: '/login', isHighlighted: false }, { name: 'Pro Business', price: '99', period: '/mo', badge: 'MOST POPULAR', description: 'For fast scaling enterprises.', features: ['Unlimited Workspaces', 'Zero-Knowledge Cryptography', 'Real-Time Sync', '24/7 Priority Support'], ctaText: 'Upgrade to Pro', ctaUrl: '/login', isHighlighted: true }, { name: 'Enterprise', price: '299', period: '/mo', badge: 'SOVEREIGN', description: 'Dedicated enterprise infrastructure.', features: ['Custom CNAME & SSL', 'Sentinel Watchdog DR', 'Dedicated Account Manager'], ctaText: 'Contact Sales', ctaUrl: '/login', isHighlighted: false } ] } },
          { id: 'blk_' + Date.now() + '_6', type: 'faq', settings: { title: 'Frequently Asked Questions', faqs: [{ question: 'How is data isolated between tenants?', answer: 'Each tenant has independent encryption keys with zero cross-tenant leakage.' }, { question: 'Can I map custom domains?', answer: 'Yes, full custom CNAME routing with automated SSL.' }] } },
          { id: 'blk_' + Date.now() + '_7', type: 'cta', settings: { headline: 'Ready to Deploy in Seconds?', buttonText: 'Create Your Workspace', buttonUrl: '/login' } },
          { id: 'blk_' + Date.now() + '_8', type: 'footer', settings: { brandName: 'CYBERCLOUD', copyrightText: '© 2026 CYBERCLOUD INC. All rights reserved.' } }
        ];
        showToast('Scaffolded SaaS Product Launch Template!', true);
      } else if (templateKey === 'agency_studio') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'LIORAMEDIA', logoInitial: 'L', ctaText: 'Client Portal', ctaUrl: '/login' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'Virtual Production & Cinematic VFX Studio', subtitle: 'Leading the future of procedural CGI, LED volume stages, and high-impact digital storytelling.', badgeText: '🎬 8K VOLUME STAGES', ctaText: 'Explore Productions', ctaUrl: '#cms' } },
          { id: 'blk_' + Date.now() + '_3', type: 'cms_feed', settings: { title: 'Featured Cinematic Productions & Releases', contentTypeSlug: 'blog-article' } },
          { id: 'blk_' + Date.now() + '_4', type: 'testimonials', settings: { title: 'Client Reviews & Endorsements', testimonials: [{ quote: 'LIORAMEDIA produced the visual campaign of the decade for our brand.', author: 'Creative Director, Universal Arts', role: 'Executive Producer', company: 'Universal Studios', rating: 5, avatarEmoji: '🎬' }] } },
          { id: 'blk_' + Date.now() + '_5', type: 'cta', settings: { headline: 'Produce Your Next Campaign with Us', buttonText: 'Book Studio Time', buttonUrl: '/login' } },
          { id: 'blk_' + Date.now() + '_6', type: 'footer', settings: { brandName: 'LIORAMEDIA', copyrightText: '© 2026 LIORAMEDIA VFX STUDIO. All rights reserved.' } }
        ];
        showToast('Scaffolded Creative Studio Template!', true);
      } else if (templateKey === 'consulting_lead') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'VERTEX ADVISORY', logoInitial: 'V', ctaText: 'Schedule Call', ctaUrl: '#contact' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'Strategic Architecture for Global Enterprises', subtitle: 'We help Fortune 500 engineering organizations streamline their multi-cloud data infrastructure.', badgeText: '💼 EXECUTIVE CONSULTING', ctaText: 'Request Consultation', ctaUrl: '#contact' } },
          { id: 'blk_' + Date.now() + '_3', type: 'stats', settings: { stat1Val: '$4.2B+', stat1Label: 'Assets Managed', stat2Val: '45+', stat2Label: 'Enterprise Clients', stat3Val: '14 Days', stat3Label: 'Avg Setup' } },
          { id: 'blk_' + Date.now() + '_4', type: 'form_builder', settings: { title: 'Request Executive Consultation', subtitle: 'Connect directly with our senior partners.', buttonText: 'Submit Consultation Request' } },
          { id: 'blk_' + Date.now() + '_5', type: 'footer', settings: { brandName: 'VERTEX ADVISORY', copyrightText: '© 2026 VERTEX ADVISORY GROUP. All rights reserved.' } }
        ];
        showToast('Scaffolded Executive Consulting Template!', true);
      } else if (templateKey === 'minimal_docs') {
        pageData.blocks = [
          { id: 'blk_' + Date.now() + '_1', type: 'navbar', settings: { brandName: 'DOCS HUB', logoInitial: 'D', ctaText: 'API Specs' } },
          { id: 'blk_' + Date.now() + '_2', type: 'hero', settings: { title: 'ETHENENGINE Developer Documentation', subtitle: 'Guides, architectural blueprints, and REST API references.', ctaText: 'Explore APIs' } },
          { id: 'blk_' + Date.now() + '_3', type: 'cms_feed', settings: { title: 'Engineering Guides & Release Notes', contentTypeSlug: 'blog-article' } },
          { id: 'blk_' + Date.now() + '_4', type: 'faq', settings: { title: 'Documentation FAQ', faqs: [{ question: 'Where is the OpenAPI schema?', answer: 'Available at /api/openapi.json and interactive Swagger at /docs' }] } },
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
          previewHtml = \`<div style="text-align:\${block.settings.align === 'left' ? 'left' : 'center'}; padding:1.5rem 0;">
            \${block.settings.badgeText ? \`<div style="display:inline-block; background:rgba(99,102,241,0.2); border:1px solid rgba(99,102,241,0.4); color:#a5b4fc; font-size:0.72rem; font-weight:800; padding:0.2rem 0.65rem; border-radius:999px; margin-bottom:0.75rem;">\${escapeText(block.settings.badgeText)}</div>\` : ''}
            <h1 style="font-size:1.85rem; font-weight:900; color:#fff; margin-bottom:0.75rem; letter-spacing:-0.02em;">\${escapeText(block.settings.title || 'Hero Headline')}</h1>
            <p style="color:#94a3b8; font-size:0.95rem; max-width:600px; margin:\${block.settings.align === 'left' ? '0 0 1.25rem' : '0 auto 1.25rem'}; line-height:1.5;">\${escapeText(block.settings.subtitle || 'Subtitle content')}</p>
            <div style="display:flex; gap:0.6rem; justify-content:\${block.settings.align === 'left' ? 'flex-start' : 'center'}; flex-wrap:wrap;">
              <span class="btn" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); padding:0.6rem 1.4rem; font-weight:700;">\${escapeText(block.settings.ctaText || 'Get Started')}</span>
              \${block.settings.secondaryCtaText ? \`<span class="btn btn-secondary" style="border-radius:var(--radius); padding:0.6rem 1.2rem; font-weight:700;">\${escapeText(block.settings.secondaryCtaText)}</span>\` : ''}
            </div>
            \${block.settings.imageUrl ? \`
              <div style="margin-top:1.5rem; border-radius:var(--radius); overflow:hidden; border:1px solid rgba(255,255,255,0.12); box-shadow:0 15px 35px rgba(0,0,0,0.6); max-width:700px; margin-left:auto; margin-right:auto;">
                <img src="\${escapeText(block.settings.imageUrl)}" alt="\${escapeText(block.settings.imageAlt || 'Hero visual')}" style="width:100%; height:auto; display:block;" />
              </div>
            \` : ''}
          </div>\`;
        } else if (block.type === 'video_player') {
          const maxW = block.settings.maxWidth || '900px';
          previewHtml = \`<div style="max-width:\${maxW}; margin:0 auto; padding:0.5rem 0;">
            \${block.settings.title ? \`<h3 style="font-size:1.3rem; font-weight:800; color:#fff; text-align:center; margin-bottom:0.75rem;">\${escapeText(block.settings.title)}</h3>\` : ''}
            <div style="position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:var(--radius); overflow:hidden; border:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; justify-content:center; align-items:center; box-shadow:0 15px 35px rgba(0,0,0,0.7);">
              \${block.settings.posterUrl ? \`<img src="\${escapeText(block.settings.posterUrl)}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.45;" />\` : ''}
              <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--secondary)); display:grid; place-content:center; color:#fff; font-size:1.4rem; z-index:2; box-shadow:0 0 20px rgba(99,102,241,0.6);">▶</div>
              <div style="z-index:2; margin-top:0.6rem; font-size:0.75rem; color:#cbd5e1; font-family:monospace; background:rgba(0,0,0,0.6); padding:0.2rem 0.6rem; border-radius:4px; max-width:85%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${escapeText(block.settings.videoUrl || 'No video source')}</div>
            </div>
            \${block.settings.caption ? \`<p style="color:#94a3b8; font-size:0.8rem; text-align:center; margin-top:0.5rem;">\${escapeText(block.settings.caption)}</p>\` : ''}
          </div>\`;
        } else if (block.type === 'image_showcase') {
          const maxW = block.settings.maxWidth || '1000px';
          previewHtml = \`<div style="max-width:\${maxW}; margin:0 auto; padding:0.5rem 0;">
            <div style="position:relative; border-radius:var(--radius); overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow:0 15px 35px rgba(0,0,0,0.6); aspect-ratio:16/9; background:#0f172a;">
              <img src="\${escapeText(block.settings.imageUrl || '')}" style="width:100%; height:100%; object-fit:cover; display:block;" />
              \${(block.settings.title || block.settings.badgeText || block.settings.caption) ? \`
                <div style="position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(10,15,30,0.9) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:1.25rem;">
                  \${block.settings.badgeText ? \`<span style="background:var(--primary); color:#fff; padding:0.15rem 0.5rem; border-radius:4px; font-size:0.65rem; font-weight:800; align-self:flex-start; margin-bottom:0.4rem;">\${escapeText(block.settings.badgeText)}</span>\` : ''}
                  \${block.settings.title ? \`<h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 0.2rem;">\${escapeText(block.settings.title)}</h3>\` : ''}
                  \${block.settings.caption ? \`<p style="font-size:0.8rem; color:#cbd5e1; margin:0;">\${escapeText(block.settings.caption)}</p>\` : ''}
                </div>
              \` : ''}
            </div>
          </div>\`;
        } else if (block.type === 'gallery') {
          const images = Array.isArray(block.settings.images) && block.settings.images.length > 0 ? block.settings.images : [];
          const cols = block.settings.columns || '3';
          previewHtml = \`<div>
            <h3 style="font-size:1.35rem; font-weight:900; color:#fff; text-align:center; margin:0 0 0.3rem;">\${escapeText(block.settings.title || 'Visual Gallery')}</h3>
            \${block.settings.subtitle ? \`<p style="color:#94a3b8; font-size:0.85rem; text-align:center; margin:0 0 1rem;">\${escapeText(block.settings.subtitle)}</p>\` : ''}
            <div style="display:grid; grid-template-columns:repeat(\${cols}, 1fr); gap:0.75rem;">
              \${images.map(img => \`
                <div style="position:relative; aspect-ratio:4/3; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); background:#0f172a;">
                  <img src="\${escapeText(img.url || '')}" style="width:100%; height:100%; object-fit:cover;" />
                  \${img.title ? \`<div style="position:absolute; bottom:0; inset-inline:0; padding:0.5rem; background:linear-gradient(180deg,transparent,rgba(0,0,0,0.85)); font-size:0.75rem; font-weight:700; color:#fff;">\${escapeText(img.title)}</div>\` : ''}
                </div>
              \`).join('')}
            </div>
          </div>\`;
        } else if (block.type === 'pagination') {
          const total = Math.max(1, Number(block.settings.totalPages || 5));
          const current = Math.max(1, Math.min(total, Number(block.settings.currentPage || 1)));
          const layout = block.settings.layout || 'pills';
          if (layout === 'minimal') {
            previewHtml = \`<div style="display:flex; justify-content:center; align-items:center; gap:0.75rem; padding:0.75rem 0;">
              <span class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.85rem;">\${escapeText(block.settings.prevText || '← Previous')}</span>
              <span style="font-size:0.85rem; color:#94a3b8;">Page <strong style="color:#fff;">\${current}</strong> of <strong style="color:#fff;">\${total}</strong></span>
              <span class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.85rem;">\${escapeText(block.settings.nextText || 'Next →')}</span>
            </div>\`;
          } else {
            previewHtml = \`<div style="display:flex; justify-content:center; align-items:center; gap:0.4rem; padding:0.75rem 0; flex-wrap:wrap;">
              \${block.settings.showFirstLast && total > 3 ? \`<span class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.7rem;">\${escapeText(block.settings.firstText || '« First')}</span>\` : ''}
              <span class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.85rem;">\${escapeText(block.settings.prevText || '← Previous')}</span>
              \${Array.from({ length: total }, (_, i) => i + 1).map(p => \`
                <span class="btn \${p === current ? '' : 'btn-secondary'}" style="min-width:34px; height:34px; padding:0; display:inline-grid; place-content:center; font-size:0.82rem; font-weight:700; \${p === current ? 'background:var(--primary); color:#fff; box-shadow:0 0 12px rgba(99,102,241,0.5);' : ''}">\${p}</span>
              \`).join('')}
              <span class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.85rem;">\${escapeText(block.settings.nextText || 'Next →')}</span>
              \${block.settings.showFirstLast && total > 3 ? \`<span class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.7rem;">\${escapeText(block.settings.lastText || 'Last »')}</span>\` : ''}
            </div>\`;
          }
        } else if (block.type === 'stats') {
          previewHtml = \`<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; text-align:center; padding:1rem 0;">
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
          const items = Array.isArray(block.settings.items) && block.settings.items.length > 0 ? block.settings.items : [
            { icon: '⚡', name: 'Ultra Fast Performance', desc: 'Sub-5ms Bun execution with verified low latency.' },
            { icon: '🔒', name: 'Zero-Knowledge Security', desc: 'AES-256-GCM PBKDF2 field level security isolation.' }
          ];
          previewHtml = \`<div>
            <h3 style="text-align:center; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:1.25rem;">\${escapeText(block.settings.title || 'Key Features')}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;">
              \${items.map(item => \`
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius); padding:1.25rem;">
                  <div style="font-size:1.4rem; margin-bottom:0.4rem;">\${escapeText(item.icon || '⚡')}</div>
                  <div style="font-weight:700; color:#fff; font-size:0.95rem; margin-bottom:0.3rem;">\${escapeText(item.name || 'Feature')}</div>
                  <div style="color:#94a3b8; font-size:0.8rem; line-height:1.4;">\${escapeText(item.desc || '')}</div>
                </div>
              \`).join('')}
            </div>
          </div>\`;
        } else if (block.type === 'pricing') {
          const currency = block.settings.currency || '$';
          const tiers = Array.isArray(block.settings.tiers) && block.settings.tiers.length > 0 ? block.settings.tiers : [
            { name: block.settings.planName || 'Enterprise Plan', price: block.settings.price || '99', period: '/mo', badge: 'POPULAR', description: 'Complete platform suite', features: ['Zero-Knowledge Cryptography', 'Visual Website Builder', 'Multi-Warehouse Inventory'], ctaText: 'Select Plan', isHighlighted: true }
          ];
          previewHtml = \`<div>
            <div style="text-align:center; margin-bottom:1.5rem;">
              <h3 style="font-size:1.35rem; color:#fff; margin:0 0 0.3rem; font-weight:800;">\${escapeText(block.settings.title || 'Enterprise Pricing')}</h3>
              <p style="color:#94a3b8; font-size:0.85rem; margin:0;">\${escapeText(block.settings.subtitle || '')}</p>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1rem;">
              \${tiers.map(t => {
                const isHigh = Boolean(t.isHighlighted);
                const feats = Array.isArray(t.features) ? t.features : String(t.features || '').split('\\n').filter(Boolean);
                return \`
                  <div style="background:\${isHigh ? 'rgba(99,102,241,0.12)' : '#111827'}; border:\${isHigh ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)'}; border-radius:var(--radius); padding:1.25rem; position:relative; display:flex; flex-direction:column; justify-content:space-between;">
                    \${t.badge ? \`<div style="position:absolute; top:-9px; left:50%; transform:translateX(-50%); background:var(--primary); color:#fff; font-size:0.6rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:999px;">\${escapeText(t.badge)}</div>\` : ''}
                    <div>
                      <div style="font-size:1rem; font-weight:800; color:#fff;">\${escapeText(t.name || 'Tier')}</div>
                      <div style="font-size:1.6rem; font-weight:900; color:#34d399; margin:0.3rem 0;">\${escapeText(currency)}\${escapeText(String(t.price || '0'))}<span style="font-size:0.75rem; color:#94a3b8; font-weight:400;">\${escapeText(t.period || '/mo')}</span></div>
                      <p style="color:#94a3b8; font-size:0.75rem; margin-bottom:0.75rem;">\${escapeText(t.description || '')}</p>
                      <ul style="list-style:none; padding:0; margin:0 0 1rem; display:flex; flex-direction:column; gap:0.35rem; font-size:0.75rem; color:#e2e8f0;">
                        \${feats.map(f => \`<li style="display:flex; gap:0.4rem; align-items:center;"><span style="color:#34d399; font-weight:900;">✓</span>\${escapeText(f)}</li>\`).join('')}
                      </ul>
                    </div>
                    <button class="btn" style="width:100%; padding:0.5rem; font-size:0.8rem; background:\${isHigh ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; border-radius:var(--radius); font-weight:700;">\${escapeText(t.ctaText || 'Select Plan')}</button>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>\`;
        } else if (block.type === 'testimonials') {
          const list = Array.isArray(block.settings.testimonials) && block.settings.testimonials.length > 0 ? block.settings.testimonials : [
            { quote: block.settings.quote || 'ETHENENGINE completely transformed our digital architecture.', author: block.settings.author || 'Lead Architect', rating: 5, avatarEmoji: '⭐' }
          ];
          previewHtml = \`<div>
            <h3 style="text-align:center; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:1.25rem;">\${escapeText(block.settings.title || 'Client Reviews')}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem;">
              \${list.map(t => \`
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius); padding:1.25rem;">
                  <div style="color:#fbbf24; font-size:0.9rem; margin-bottom:0.4rem;">\${'★'.repeat(Number(t.rating) || 5)}</div>
                  <blockquote style="font-size:0.85rem; color:#e2e8f0; font-style:italic; line-height:1.5; margin:0 0 0.75rem;">"\${escapeText(t.quote || '')}"</blockquote>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div style="font-size:1.2rem;">\${escapeText(t.avatarEmoji || '👤')}</div>
                    <div>
                      <div style="font-weight:700; font-size:0.8rem; color:#fff;">\${escapeText(t.author || 'Anonymous')}</div>
                      <div style="font-size:0.7rem; color:#94a3b8;">\${escapeText(t.role || t.company || '')}</div>
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>\`;
        } else if (block.type === 'faq') {
          const faqs = Array.isArray(block.settings.faqs) && block.settings.faqs.length > 0 ? block.settings.faqs : [
            { question: 'How is data secured?', answer: 'Zero-knowledge AES-256-GCM tenant encryption.' }
          ];
          previewHtml = \`<div>
            <h3 style="text-align:center; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:1rem;">\${escapeText(block.settings.title || 'FAQ')}</h3>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              \${faqs.map(f => \`
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.85rem 1rem;">
                  <div style="font-weight:700; font-size:0.9rem; color:#fff;">\${escapeText(f.question || 'Question')}</div>
                  <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.35rem;">\${escapeText(f.answer || '')}</div>
                </div>
              \`).join('')}
            </div>
          </div>\`;
        } else if (block.type === 'cta') {
          previewHtml = \`<div style="background:rgba(99,102,241,0.12); border:1px solid rgba(255,255,255,0.12); border-radius:var(--radius); padding:2rem; text-align:center;">
            <h3 style="font-size:1.4rem; font-weight:900; color:#fff; margin-bottom:0.75rem; letter-spacing:-0.02em;">\${escapeText(block.settings.headline || 'Ready to produce your next campaign?')}</h3>
            <span class="btn" style="background:var(--primary); border-radius:var(--radius); padding:0.65rem 1.6rem; font-weight:700;">\${escapeText(block.settings.buttonText || 'Book Consultation')}</span>
          </div>\`;
        } else if (block.type === 'navbar') {
          previewHtml = \`<div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius);">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <div class="brand-icon" style="background:var(--primary); width:30px; height:30px; border-radius:6px; display:grid; place-content:center; color:#fff; font-weight:900; font-size:0.85rem; position:relative;">\${escapeText(block.settings.logoInitial || 'E')}</div>
              <span style="font-weight:800; font-size:1.05rem; color:#fff;">\${escapeText(block.settings.brandName || 'BRAND')}</span>
            </div>
            <div style="display:flex; align-items:center; gap:1rem; font-size:0.82rem; color:#94a3b8;">
              <span>Features</span><span>Pricing</span><span>Contact</span>
              <span class="btn" style="padding:0.35rem 0.9rem; font-size:0.78rem; font-weight:700;">\${escapeText(block.settings.ctaText || 'Sign In')}</span>
            </div>
          </div>\`;
        } else if (block.type === 'announcement_bar') {
          previewHtml = \`<div style="background:var(--primary); color:#fff; padding:0.5rem 1rem; border-radius:6px; display:flex; justify-content:center; align-items:center; gap:0.6rem; font-size:0.82rem; font-weight:700;">
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
        } else if (block.type === 'form_builder') {
          previewHtml = \`<div style="max-width:550px; margin:0 auto; padding:1.5rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius);">
            <div style="text-align:center; margin-bottom:1rem;">
              <h3 style="font-size:1.25rem; color:#fff; font-weight:800; margin:0 0 0.3rem;">\${escapeText(block.settings.title || 'Request Consultation')}</h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0;">\${escapeText(block.settings.subtitle || 'Connect with solutions architecture.')}</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              <input class="field-input" placeholder="Full Name *" disabled style="opacity:0.7;" />
              <input class="field-input" placeholder="Work Email *" disabled style="opacity:0.7;" />
              <button class="btn" style="width:100%; margin-top:0.4rem; background:var(--primary); border-radius:var(--radius); font-weight:700;">\${escapeText(block.settings.buttonText || 'Submit Inquiry')}</button>
            </div>
          </div>\`;
        } else if (block.type === 'footer') {
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
        settings: type === 'navbar' ? { brandName: 'LIORAMEDIA', logoInitial: 'L', links: [{ label: 'Capabilities', url: '#features' }, { label: 'Pricing', url: '#pricing' }, { label: 'Contact', url: '#contact' }], ctaText: 'Client Portal', ctaUrl: '/login' }
                : type === 'announcement_bar' ? { message: '🎉 Limited Time Offer: 20% off all packages!', badgeText: 'SALE', linkText: 'View Deals', linkUrl: '#pricing' }
                : type === 'hero' ? { title: 'New Hero Headline', subtitle: 'Describe your high-impact value proposition here.', badgeText: '⚡ NEXT-GEN', ctaText: 'Get Started', ctaUrl: '#pricing', secondaryCtaText: 'Learn More →', secondaryCtaUrl: '#features', imageUrl: '' }
                : type === 'image_showcase' ? { title: 'Next-Gen Cloud Dashboard', caption: 'High-performance real-time telemetry and isolation.', badgeText: 'FEATURED', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80', altText: 'Cloud dashboard preview', linkUrl: '#pricing', maxWidth: '1000px', hasOverlay: true }
                : type === 'video_player' ? { title: 'Platform Architecture Deep Dive', caption: 'Watch the zero-knowledge multi-tenant runtime engine in action.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', posterUrl: '', aspectRatio: '16-9', maxWidth: '900px', autoplay: false, muted: true, loop: false, controls: true }
                : type === 'gallery' ? { title: 'Visual Portfolio & Showcase', subtitle: 'Explore screenshots, system dashboards, and schematics.', columns: '3', images: [{ url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', alt: 'Analytics Engine', title: 'Real-Time Telemetry', caption: 'Edge analytics and latency tracing.', linkUrl: '#features' }, { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80', alt: 'Global Infrastructure Map', title: 'Zero-Knowledge Crypto', caption: 'Per-tenant cipher isolation.', linkUrl: '#security' }, { url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80', alt: 'Collaboration Canvas', title: 'Presence Engine', caption: 'Live cursor tracking.', linkUrl: '#pricing' }] }
                : type === 'pagination' ? { totalPages: 5, currentPage: 1, itemsPerPage: 12, totalItems: 60, prevText: '← Previous', nextText: 'Next →', firstText: '« First', lastText: 'Last »', showFirstLast: true, layout: 'pills', baseUrl: '?page=', align: 'center' }
                : type === 'product_grid' ? { title: 'Merchandise & Virtual Passes', subtitle: 'Shipped from multi-warehouse inventory.', items: [{ name: 'Virtual Pass', price: 199, tag: 'IN STOCK', image: '🎬' }, { name: 'VFX Plugin', price: 99, tag: 'DIGITAL', image: '💎' }] }
                : type === 'footer' ? { brandName: 'LIORAMEDIA', copyrightText: '© 2026 ETHENENGINE All rights reserved.' }
                : type === 'features' ? { title: 'Core Features', items: [{ icon: '⚡', name: 'High Speed', desc: 'Sub-5ms execution runtime' }, { icon: '🔒', name: 'Secure Isolation', desc: 'Zero knowledge cryptographic privacy' }] }
                : type === 'stats' ? { stat1Val: '99.99%', stat1Label: 'SLA Uptime', stat2Val: '< 5ms', stat2Label: 'Edge Latency', stat3Val: '100%', stat3Label: 'Zero-Knowledge' }
                : type === 'cms_feed' ? { title: 'Latest Case Studies & News', contentTypeSlug: 'blog-article', limit: 3 }
                : type === 'pricing' ? { title: 'Pricing & Plans', subtitle: 'Transparent tiers for every business scale.', currency: '$', billingPeriod: '/month', tiers: [{ name: 'Starter', price: '29', period: '/mo', badge: '', description: 'For individuals and creators', features: ['1 Tenant Org', 'Standard Analytics'], ctaText: 'Start Free', ctaUrl: '/login', isHighlighted: false }, { name: 'Pro Business', price: '99', period: '/mo', badge: 'POPULAR', description: 'For growing companies', features: ['Unlimited Workspaces', 'Zero-Knowledge Security', '24/7 Priority Support'], ctaText: 'Upgrade to Pro', ctaUrl: '/login', isHighlighted: true }] }
                : type === 'testimonials' ? { title: 'Client Reviews', testimonials: [{ quote: 'Best platform architecture we have ever deployed.', author: 'Lead Architect', role: 'Enterprise CTO', rating: 5, avatarEmoji: '⭐' }] }
                : type === 'faq' ? { title: 'Frequently Asked Questions', faqs: [{ question: 'How is data encrypted?', answer: 'Per-tenant PBKDF2 AES-256-GCM zero-knowledge keys.' }] }
                : type === 'cta' ? { headline: 'Start Your Free Enterprise Trial', buttonText: 'Get Started Today', buttonUrl: '/login' }
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
      el.classList.add('drag-over-target');
    }

    function onCanvasBlockDragLeave(e, idx) {
      const el = document.getElementById('canvasBlock_' + idx);
      if (el) el.classList.remove('drag-over-target');
    }

    function onCanvasBlockDrop(e, targetIdx) {
      e.preventDefault();
      document.querySelectorAll('.canvas-block').forEach(el => {
        el.classList.remove('drag-over-target');
        el.classList.remove('dragging-item');
      });

      if (draggedBlockType) {
        addBlock(draggedBlockType);
        draggedBlockType = null;
      } else if (draggedCanvasBlockIdx !== null && draggedCanvasBlockIdx !== targetIdx) {
        undoHistory = JSON.parse(JSON.stringify(pageData.blocks));
        const movedItem = pageData.blocks.splice(draggedCanvasBlockIdx, 1)[0];
        pageData.blocks.splice(targetIdx, 0, movedItem);
        selectedBlockIndex = targetIdx;
        renderCanvas();
        showToast('Block reordered successfully!', true);
      }
      draggedCanvasBlockIdx = null;
    }

    function applyHolidayEffect(effectId) {
      const tokens = { holidayEffect: effectId === 'none' ? null : effectId };
      const styleEl = document.getElementById('dynamicHolidayStyle');
      
      if (effectId === 'none') {
        if (styleEl) styleEl.innerHTML = '';
      } else if (effectId === 'snow') {
        if (styleEl) styleEl.innerHTML = '.canvas-container::before { content:"❄ ❅ ❆ ❄ ❅"; position:fixed; top:0; left:0; width:100%; pointer-events:none; font-size:1.5rem; color:rgba(255,255,255,0.7); animation: snowfall 10s linear infinite; }';
      } else if (effectId === 'fireworks') {
        if (styleEl) styleEl.innerHTML = '.canvas-container::before { content:"✨ 🎆 ✨ 🎇"; position:fixed; top:10px; right:20px; pointer-events:none; font-size:1.8rem; animation: pulse 2s ease-in-out infinite; }';
      } else if (effectId === 'cyber_sale') {
        if (styleEl) styleEl.innerHTML = '.canvas-container { border:2px solid #22d3ee; box-shadow:0 0 30px rgba(34,211,238,0.3); }';
      }

      fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') },
        body: JSON.stringify({ tokens })
      });
      showToast('Holiday effect applied!');
    }

    function calculateLuminance(hex) {
      const c = hex.replace('#', '');
      const rgb = parseInt(c, 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.2126 * (r/255) + 0.7152 * (g/255) + 0.0722 * (b/255);
    }

    function updateWcagBadges() {
      const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#070a12';
      
      const l1 = calculateLuminance(primary);
      const l2 = calculateLuminance(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      const badge = document.getElementById('wcagBadge');
      if (!badge) return;

      if (ratio >= 7.0) {
        badge.className = 'wcag-badge wcag-pass';
        badge.innerText = '✓ AAA Pass (' + ratio.toFixed(1) + ':1)';
      } else if (ratio >= 4.5) {
        badge.className = 'wcag-badge wcag-pass';
        badge.innerText = '✓ AA Pass (' + ratio.toFixed(1) + ':1)';
      } else {
        badge.className = 'wcag-badge wcag-warn';
        badge.innerText = '⚠️ Low Contrast (' + ratio.toFixed(1) + ':1)';
      }
    }

    function applyDayMode() {
      updateThemeToken('backgroundColor', '#f8fafc');
      updateThemeToken('cardBg', '#ffffff');
      updateThemeToken('primaryColor', '#4f46e5');
      document.documentElement.style.setProperty('--text', '#0f172a');
      showToast('☀️ Clean Day Mode applied!');
    }

    function applyNightMode() {
      updateThemeToken('backgroundColor', '#070a12');
      updateThemeToken('cardBg', '#0f172a');
      updateThemeToken('primaryColor', '#6366f1');
      document.documentElement.style.setProperty('--text', '#f8fafc');
      showToast('🌙 Midnight Slate Night Mode applied!');
    }

    function applyPreset(presetKey) {
      const presets = ${JSON.stringify(THEME_PRESETS)};
      const p = presets[presetKey];
      if (!p) return;
      const tokens = p.tokens;
      if (tokens.primaryColor) updateThemeToken('primaryColor', tokens.primaryColor);
      if (tokens.secondaryColor) updateThemeToken('secondaryColor', tokens.secondaryColor);
      if (tokens.backgroundColor) updateThemeToken('backgroundColor', tokens.backgroundColor);
      if (tokens.cardBg) updateThemeToken('cardBg', tokens.cardBg);
      if (tokens.borderRadius) document.documentElement.style.setProperty('--radius', tokens.borderRadius);
      updateWcagBadges();
      showToast('Preset "' + p.name + '" applied!');
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

    /* Deep Inspector Form Engine for All Components */
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
      let fieldsHtml = \`<div style="font-weight:800; color:#38bdf8; margin-bottom:0.85rem; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
        <span>\${block.type.toUpperCase()} CONFIGURATION</span>
        <span style="color:#64748b; font-size:0.7rem; font-family:monospace;">#\${selectedBlockIndex + 1}</span>
      </div>\`;

      if (block.type === 'pricing') {
        const currency = block.settings.currency || '$';
        const billingPeriod = block.settings.billingPeriod || '/month';
        const tiers = Array.isArray(block.settings.tiers) ? block.settings.tiers : [];

        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Section Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Section Subtitle</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <div class="field-group">
              <label class="field-label">Currency</label>
              <input class="field-input" value="\${escapeText(currency)}" oninput="updateSetting('currency', this.value)" />
            </div>
            <div class="field-group">
              <label class="field-label">Billing Cycle</label>
              <input class="field-input" value="\${escapeText(billingPeriod)}" oninput="updateSetting('billingPeriod', this.value)" />
            </div>
          </div>

          <div style="margin-top:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.6rem;">Pricing Tiers (\${tiers.length})</div>
            \${tiers.map((t, tIdx) => {
              const featsText = Array.isArray(t.features) ? t.features.join('\\n') : String(t.features || '');
              return \`
                <div class="inspector-item-card">
                  <div class="inspector-item-header">
                    <span>Tier \${tIdx + 1}: \${escapeText(t.name || 'Plan')}</span>
                    <button class="inspector-del-btn" onclick="removeArrayItem('tiers', \${tIdx})">✕ Delete</button>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Tier Name</label>
                    <input class="field-input" value="\${escapeText(t.name || '')}" oninput="updateArrayItem('tiers', \${tIdx}, 'name', this.value)" />
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                    <div class="field-group">
                      <label class="field-label">Price Amount</label>
                      <input class="field-input" value="\${escapeText(String(t.price || ''))}" oninput="updateArrayItem('tiers', \${tIdx}, 'price', this.value)" />
                    </div>
                    <div class="field-group">
                      <label class="field-label">Badge Ribbon</label>
                      <input class="field-input" placeholder="POPULAR" value="\${escapeText(t.badge || '')}" oninput="updateArrayItem('tiers', \${tIdx}, 'badge', this.value)" />
                    </div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Short Description</label>
                    <input class="field-input" value="\${escapeText(t.description || '')}" oninput="updateArrayItem('tiers', \${tIdx}, 'description', this.value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Features (1 per line)</label>
                    <textarea class="field-input" rows="3" oninput="updateArrayItem('tiers', \${tIdx}, 'features', this.value.split('\\n'))">\${escapeText(featsText)}</textarea>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                    <div class="field-group">
                      <label class="field-label">Button Text</label>
                      <input class="field-input" value="\${escapeText(t.ctaText || 'Get Started')}" oninput="updateArrayItem('tiers', \${tIdx}, 'ctaText', this.value)" />
                    </div>
                    <div class="field-group">
                      <label class="field-label">Button Link</label>
                      <input class="field-input" value="\${escapeText(t.ctaUrl || '/login')}" oninput="updateArrayItem('tiers', \${tIdx}, 'ctaUrl', this.value)" />
                    </div>
                  </div>
                  <div style="margin-top:0.4rem; display:flex; align-items:center; gap:0.4rem;">
                    <input type="checkbox" id="tierHigh_\${tIdx}" \${t.isHighlighted ? 'checked' : ''} onchange="updateArrayItem('tiers', \${tIdx}, 'isHighlighted', this.checked)" />
                    <label for="tierHigh_\${tIdx}" style="font-size:0.75rem; color:#fff; font-weight:700; cursor:pointer;">⭐ Highlight as Most Popular / Featured</label>
                  </div>
                </div>
              \`;
            }).join('')}
            <button class="inspector-add-btn" onclick="addArrayItem('tiers', { name: 'New Tier', price: '49', period: '/mo', badge: '', description: 'Tier description', features: ['Feature 1', 'Feature 2'], ctaText: 'Select Plan', ctaUrl: '/login', isHighlighted: false })">+ Add Pricing Tier</button>
          </div>
        \`;
      } else if (block.type === 'features') {
        const items = Array.isArray(block.settings.items) ? block.settings.items : [];
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Section Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Section Subtitle</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div style="margin-top:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.6rem;">Feature Cards (\${items.length})</div>
            \${items.map((it, iIdx) => \`
              <div class="inspector-item-card">
                <div class="inspector-item-header">
                  <span>Card \${iIdx + 1}</span>
                  <button class="inspector-del-btn" onclick="removeArrayItem('items', \${iIdx})">✕ Delete</button>
                </div>
                <div style="display:grid; grid-template-columns:50px 1fr; gap:0.4rem;">
                  <div class="field-group">
                    <label class="field-label">Icon</label>
                    <input class="field-input" value="\${escapeText(it.icon || '⚡')}" oninput="updateArrayItem('items', \${iIdx}, 'icon', this.value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Feature Name</label>
                    <input class="field-input" value="\${escapeText(it.name || '')}" oninput="updateArrayItem('items', \${iIdx}, 'name', this.value)" />
                  </div>
                </div>
                <div class="field-group" style="margin-top:0.4rem;">
                  <label class="field-label">Description</label>
                  <textarea class="field-input" rows="2" oninput="updateArrayItem('items', \${iIdx}, 'desc', this.value)">\${escapeText(it.desc || '')}</textarea>
                </div>
              </div>
            \`).join('')}
            <button class="inspector-add-btn" onclick="addArrayItem('items', { icon: '✨', name: 'New Capability', desc: 'Detailed explanation of feature benefit.' })">+ Add Feature Card</button>
          </div>
        \`;
      } else if (block.type === 'testimonials') {
        const list = Array.isArray(block.settings.testimonials) ? block.settings.testimonials : [];
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Section Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Section Subtitle</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div style="margin-top:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.6rem;">Customer Reviews (\${list.length})</div>
            \${list.map((t, tIdx) => \`
              <div class="inspector-item-card">
                <div class="inspector-item-header">
                  <span>Review \${tIdx + 1}</span>
                  <button class="inspector-del-btn" onclick="removeArrayItem('testimonials', \${tIdx})">✕ Delete</button>
                </div>
                <div class="field-group">
                  <label class="field-label">Quote Body</label>
                  <textarea class="field-input" rows="2" oninput="updateArrayItem('testimonials', \${tIdx}, 'quote', this.value)">\${escapeText(t.quote || '')}</textarea>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                  <div class="field-group">
                    <label class="field-label">Author Name</label>
                    <input class="field-input" value="\${escapeText(t.author || '')}" oninput="updateArrayItem('testimonials', \${tIdx}, 'author', this.value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Role / Company</label>
                    <input class="field-input" value="\${escapeText(t.role || t.company || '')}" oninput="updateArrayItem('testimonials', \${tIdx}, 'role', this.value)" />
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:60px 1fr; gap:0.4rem; margin-top:0.4rem;">
                  <div class="field-group">
                    <label class="field-label">Avatar</label>
                    <input class="field-input" value="\${escapeText(t.avatarEmoji || '⭐')}" oninput="updateArrayItem('testimonials', \${tIdx}, 'avatarEmoji', this.value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Rating Stars</label>
                    <select class="field-input" onchange="updateArrayItem('testimonials', \${tIdx}, 'rating', parseInt(this.value, 10))">
                      <option value="5" \${t.rating === 5 ? 'selected' : ''}>★★★★★ (5 Stars)</option>
                      <option value="4" \${t.rating === 4 ? 'selected' : ''}>★★★★☆ (4 Stars)</option>
                      <option value="3" \${t.rating === 3 ? 'selected' : ''}>★★★☆☆ (3 Stars)</option>
                    </select>
                  </div>
                </div>
              </div>
            \`).join('')}
            <button class="inspector-add-btn" onclick="addArrayItem('testimonials', { quote: 'Incredible platform that scaled our operations.', author: 'Alex Morgan', role: 'VP of Engineering', rating: 5, avatarEmoji: '👤' })">+ Add Testimonial</button>
          </div>
        \`;
      } else if (block.type === 'faq') {
        const faqs = Array.isArray(block.settings.faqs) ? block.settings.faqs : [];
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Section Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Section Subtitle</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div style="margin-top:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.6rem;">Questions & Answers (\${faqs.length})</div>
            \${faqs.map((f, fIdx) => \`
              <div class="inspector-item-card">
                <div class="inspector-item-header">
                  <span>Q\${fIdx + 1}</span>
                  <button class="inspector-del-btn" onclick="removeArrayItem('faqs', \${fIdx})">✕ Delete</button>
                </div>
                <div class="field-group">
                  <label class="field-label">Question</label>
                  <input class="field-input" value="\${escapeText(f.question || '')}" oninput="updateArrayItem('faqs', \${fIdx}, 'question', this.value)" />
                </div>
                <div class="field-group">
                  <label class="field-label">Answer</label>
                  <textarea class="field-input" rows="2" oninput="updateArrayItem('faqs', \${fIdx}, 'answer', this.value)">\${escapeText(f.answer || '')}</textarea>
                </div>
              </div>
            \`).join('')}
            <button class="inspector-add-btn" onclick="addArrayItem('faqs', { question: 'New Question?', answer: 'Detailed response here.' })">+ Add Question</button>
          </div>
        \`;
      } else if (block.type === 'video_player') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Video Title (Optional)</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="field-label" style="margin:0;">Video URL (YouTube, Vimeo, MP4)</label>
              <button type="button" class="btn btn-secondary" onclick="openMediaPicker('setting', 'videoUrl', 0, '', true)" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(168,85,247,0.18); border-color:rgba(168,85,247,0.3); color:#d8b4fe;">🎬 Pick Video</button>
            </div>
            <input class="field-input" placeholder="https://www.youtube.com/watch?v=..." value="\${escapeText(block.settings.videoUrl || '')}" oninput="updateSetting('videoUrl', this.value)" />
          </div>
          <div class="field-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="field-label" style="margin:0;">Poster / Thumbnail Image</label>
              <button type="button" class="btn btn-secondary" onclick="openMediaPicker('setting', 'posterUrl', 0, '', false)" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🖼️ Pick Image</button>
            </div>
            <input class="field-input" placeholder="https://..." value="\${escapeText(block.settings.posterUrl || '')}" oninput="updateSetting('posterUrl', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Caption / Description</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('caption', this.value)">\${escapeText(block.settings.caption || '')}</textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Aspect Ratio</label>
              <select class="field-input" onchange="updateSetting('aspectRatio', this.value)">
                <option value="16-9" \${block.settings.aspectRatio === '16-9' ? 'selected' : ''}>16:9 Widescreen</option>
                <option value="21-9" \${block.settings.aspectRatio === '21-9' ? 'selected' : ''}>21:9 Cinematic</option>
                <option value="4-3" \${block.settings.aspectRatio === '4-3' ? 'selected' : ''}>4:3 Standard</option>
                <option value="1-1" \${block.settings.aspectRatio === '1-1' ? 'selected' : ''}>1:1 Square</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Max Width</label>
              <select class="field-input" onchange="updateSetting('maxWidth', this.value)">
                <option value="900px" \${block.settings.maxWidth === '900px' ? 'selected' : ''}>900px Container</option>
                <option value="1100px" \${block.settings.maxWidth === '1100px' ? 'selected' : ''}>1100px Wide</option>
                <option value="680px" \${block.settings.maxWidth === '680px' ? 'selected' : ''}>680px Compact</option>
                <option value="100%" \${block.settings.maxWidth === '100%' ? 'selected' : ''}>100% Full Width</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem; margin-top:0.4rem;">
            <label style="font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
              <input type="checkbox" \${block.settings.autoplay ? 'checked' : ''} onchange="updateSetting('autoplay', this.checked)" /> Autoplay
            </label>
            <label style="font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
              <input type="checkbox" \${block.settings.muted !== false ? 'checked' : ''} onchange="updateSetting('muted', this.checked)" /> Muted
            </label>
            <label style="font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
              <input type="checkbox" \${block.settings.loop ? 'checked' : ''} onchange="updateSetting('loop', this.checked)" /> Loop Video
            </label>
            <label style="font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
              <input type="checkbox" \${block.settings.controls !== false ? 'checked' : ''} onchange="updateSetting('controls', this.checked)" /> Player Controls
            </label>
          </div>
        \`;
      } else if (block.type === 'image_showcase') {
        fieldsHtml += \`
          <div class="field-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="field-label" style="margin:0;">Image URL</label>
              <button type="button" class="btn btn-secondary" onclick="openMediaPicker('setting', 'imageUrl', 0, '', false)" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🖼️ Pick Image</button>
            </div>
            <input class="field-input" placeholder="https://..." value="\${escapeText(block.settings.imageUrl || '')}" oninput="updateSetting('imageUrl', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Alt Text (Accessibility)</label>
            <input class="field-input" value="\${escapeText(block.settings.altText || '')}" oninput="updateSetting('altText', this.value)" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Ribbon Badge</label>
              <input class="field-input" placeholder="FEATURED" value="\${escapeText(block.settings.badgeText || '')}" oninput="updateSetting('badgeText', this.value)" />
            </div>
            <div class="field-group">
              <label class="field-label">Max Width</label>
              <select class="field-input" onchange="updateSetting('maxWidth', this.value)">
                <option value="1000px" \${block.settings.maxWidth === '1000px' ? 'selected' : ''}>1000px Standard</option>
                <option value="1200px" \${block.settings.maxWidth === '1200px' ? 'selected' : ''}>1200px Wide</option>
                <option value="760px" \${block.settings.maxWidth === '760px' ? 'selected' : ''}>760px Medium</option>
                <option value="100%" \${block.settings.maxWidth === '100%' ? 'selected' : ''}>100% Full</option>
              </select>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Heading Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Caption Description</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('caption', this.value)">\${escapeText(block.settings.caption || '')}</textarea>
          </div>
          <div class="field-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="field-label" style="margin:0;">Click Destination Link</label>
              <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'linkUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick Link</button>
            </div>
            <input class="field-input" placeholder="#pricing" value="\${escapeText(block.settings.linkUrl || '')}" oninput="updateSetting('linkUrl', this.value)" />
          </div>
          <div style="margin-top:0.4rem;">
            <label style="font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
              <input type="checkbox" \${block.settings.hasOverlay !== false ? 'checked' : ''} onchange="updateSetting('hasOverlay', this.checked)" /> Gradient Caption Overlay
            </label>
          </div>
        \`;
      } else if (block.type === 'gallery') {
        const images = Array.isArray(block.settings.images) ? block.settings.images : [];
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Gallery Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Gallery Subtitle</label>
            <textarea class="field-input" rows="2" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div class="field-group">
            <label class="field-label">Grid Columns</label>
            <select class="field-input" onchange="updateSetting('columns', this.value)">
              <option value="2" \${block.settings.columns === '2' ? 'selected' : ''}>2 Columns (Large Cards)</option>
              <option value="3" \${block.settings.columns === '3' ? 'selected' : ''}>3 Columns (Balanced Grid)</option>
              <option value="4" \${block.settings.columns === '4' ? 'selected' : ''}>4 Columns (Compact Showcase)</option>
            </select>
          </div>
          <div style="margin-top:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.6rem;">Gallery Photos (\${images.length})</div>
            \${images.map((img, iIdx) => \`
              <div class="inspector-item-card">
                <div class="inspector-item-header">
                  <span>Photo \${iIdx + 1}</span>
                  <button class="inspector-del-btn" onclick="removeArrayItem('images', \${iIdx})">✕ Delete</button>
                </div>
                <div class="field-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <label class="field-label" style="margin:0;">Image URL</label>
                    <button type="button" class="btn btn-secondary" onclick="openMediaPicker('array', 'images', \${iIdx}, 'url', false)" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🖼️ Pick</button>
                  </div>
                  <input class="field-input" value="\${escapeText(img.url || '')}" oninput="updateArrayItem('images', \${iIdx}, 'url', this.value)" />
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                  <div class="field-group">
                    <label class="field-label">Title</label>
                    <input class="field-input" value="\${escapeText(img.title || '')}" oninput="updateArrayItem('images', \${iIdx}, 'title', this.value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Alt Text</label>
                    <input class="field-input" value="\${escapeText(img.alt || '')}" oninput="updateArrayItem('images', \${iIdx}, 'alt', this.value)" />
                  </div>
                </div>
                <div class="field-group" style="margin-top:0.4rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <label class="field-label" style="margin:0;">Click Link URL</label>
                    <button type="button" class="btn btn-secondary" onclick="openLinkPicker('array', 'images', \${iIdx}, 'linkUrl')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick Link</button>
                  </div>
                  <input class="field-input" placeholder="#features" value="\${escapeText(img.linkUrl || '')}" oninput="updateArrayItem('images', \${iIdx}, 'linkUrl', this.value)" />
                </div>
              </div>
            \`).join('')}
            <button class="inspector-add-btn" onclick="addArrayItem('images', { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', title: 'New Photo', caption: 'Photo caption', alt: 'Showcase visual', linkUrl: '' })">+ Add Image to Gallery</button>
          </div>
        \`;
      } else if (block.type === 'pagination') {
        fieldsHtml += \`
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Total Pages</label>
              <input class="field-input" type="number" min="1" max="50" value="\${escapeText(String(block.settings.totalPages || 5))}" oninput="updateSetting('totalPages', parseInt(this.value, 10) || 1)" />
            </div>
            <div class="field-group">
              <label class="field-label">Active Page</label>
              <input class="field-input" type="number" min="1" max="50" value="\${escapeText(String(block.settings.currentPage || 1))}" oninput="updateSetting('currentPage', parseInt(this.value, 10) || 1)" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Pagination Style</label>
            <select class="field-input" onchange="updateSetting('layout', this.value)">
              <option value="pills" \${block.settings.layout === 'pills' ? 'selected' : ''}>Numbered Pills (Glow Active)</option>
              <option value="buttons" \${block.settings.layout === 'buttons' ? 'selected' : ''}>Button Group</option>
              <option value="minimal" \${block.settings.layout === 'minimal' ? 'selected' : ''}>Minimal Summary (Page X of Y)</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Previous Label</label>
              <input class="field-input" value="\${escapeText(block.settings.prevText || '← Previous')}" oninput="updateSetting('prevText', this.value)" />
            </div>
            <div class="field-group">
              <label class="field-label">Next Label</label>
              <input class="field-input" value="\${escapeText(block.settings.nextText || 'Next →')}" oninput="updateSetting('nextText', this.value)" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">First Label</label>
              <input class="field-input" value="\${escapeText(block.settings.firstText || '« First')}" oninput="updateSetting('firstText', this.value)" />
            </div>
            <div class="field-group">
              <label class="field-label">Last Label</label>
              <input class="field-input" value="\${escapeText(block.settings.lastText || 'Last »')}" oninput="updateSetting('lastText', this.value)" />
            </div>
          </div>
          <div class="field-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="field-label" style="margin:0;">Target URL Base / Query</label>
              <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'baseUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick Route</button>
            </div>
            <input class="field-input" placeholder="?page=" value="\${escapeText(block.settings.baseUrl || '?page=')}" oninput="updateSetting('baseUrl', this.value)" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem; margin-top:0.4rem;">
            <div class="field-group">
              <label class="field-label">Alignment</label>
              <select class="field-input" onchange="updateSetting('align', this.value)">
                <option value="center" \${block.settings.align === 'center' ? 'selected' : ''}>Center</option>
                <option value="start" \${block.settings.align === 'start' ? 'selected' : ''}>Left (Start)</option>
                <option value="end" \${block.settings.align === 'end' ? 'selected' : ''}>Right (End)</option>
                <option value="between" \${block.settings.align === 'between' ? 'selected' : ''}>Space Between</option>
              </select>
            </div>
            <div style="display:flex; align-items:center; margin-top:1.1rem;">
              <label style="font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:0.35rem; cursor:pointer;">
                <input type="checkbox" \${block.settings.showFirstLast ? 'checked' : ''} onchange="updateSetting('showFirstLast', this.checked)" /> First / Last
              </label>
            </div>
          </div>
        \`;
      } else if (block.type === 'hero') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Badge / Eyebrow Text</label>
            <input class="field-input" placeholder="⚡ NEXT-GEN PLATFORM" value="\${escapeText(block.settings.badgeText || '')}" oninput="updateSetting('badgeText', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Headline Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Subtitle</label>
            <textarea class="field-input" rows="3" oninput="updateSetting('subtitle', this.value)">\${escapeText(block.settings.subtitle || '')}</textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Primary CTA Text</label>
              <input class="field-input" value="\${escapeText(block.settings.ctaText || '')}" oninput="updateSetting('ctaText', this.value)" />
            </div>
            <div class="field-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <label class="field-label" style="margin:0;">Primary CTA Link</label>
                <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'ctaUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick</button>
              </div>
              <input class="field-input" value="\${escapeText(block.settings.ctaUrl || '#pricing')}" oninput="updateSetting('ctaUrl', this.value)" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Secondary CTA Text</label>
              <input class="field-input" placeholder="Learn More" value="\${escapeText(block.settings.secondaryCtaText || '')}" oninput="updateSetting('secondaryCtaText', this.value)" />
            </div>
            <div class="field-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <label class="field-label" style="margin:0;">Secondary CTA Link</label>
                <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'secondaryCtaUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick</button>
              </div>
              <input class="field-input" value="\${escapeText(block.settings.secondaryCtaUrl || '#features')}" oninput="updateSetting('secondaryCtaUrl', this.value)" />
            </div>
          </div>
          <div class="field-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <label class="field-label" style="margin:0;">Mockup / Illustration URL</label>
              <button type="button" class="btn btn-secondary" onclick="openMediaPicker('setting', 'imageUrl', 0, '', false)" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🖼️ Pick Image</button>
            </div>
            <input class="field-input" placeholder="https://..." value="\${escapeText(block.settings.imageUrl || '')}" oninput="updateSetting('imageUrl', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Alignment</label>
            <select class="field-input" onchange="updateSetting('align', this.value)">
              <option value="center" \${block.settings.align !== 'left' ? 'selected' : ''}>Center</option>
              <option value="left" \${block.settings.align === 'left' ? 'selected' : ''}>Left</option>
            </select>
          </div>
        \`;
      } else if (block.type === 'navbar') {
        const navLinks = Array.isArray(block.settings.links) ? block.settings.links : [];
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Brand Logo Text</label>
            <input class="field-input" value="\${escapeText(block.settings.brandName || '')}" oninput="updateSetting('brandName', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Logo Badge Letter</label>
            <input class="field-input" value="\${escapeText(block.settings.logoInitial || 'E')}" oninput="updateSetting('logoInitial', this.value)" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">CTA Button Text</label>
              <input class="field-input" value="\${escapeText(block.settings.ctaText || '')}" oninput="updateSetting('ctaText', this.value)" />
            </div>
            <div class="field-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <label class="field-label" style="margin:0;">CTA Link</label>
                <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'ctaUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick</button>
              </div>
              <input class="field-input" value="\${escapeText(block.settings.ctaUrl || '/login')}" oninput="updateSetting('ctaUrl', this.value)" />
            </div>
          </div>
          <div style="margin-top:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.75rem; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:0.6rem;">Nav Menu Links (\${navLinks.length})</div>
            \${navLinks.map((nl, nIdx) => \`
              <div class="inspector-item-card">
                <div class="inspector-item-header">
                  <span>Link \${nIdx + 1}</span>
                  <button class="inspector-del-btn" onclick="removeArrayItem('links', \${nIdx})">✕ Delete</button>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                  <div class="field-group">
                    <label class="field-label">Label</label>
                    <input class="field-input" value="\${escapeText(nl.label || '')}" oninput="updateArrayItem('links', \${nIdx}, 'label', this.value)" />
                  </div>
                  <div class="field-group">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                      <label class="field-label" style="margin:0;">URL</label>
                      <button type="button" class="btn btn-secondary" onclick="openLinkPicker('array', 'links', \${nIdx}, 'url')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗</button>
                    </div>
                    <input class="field-input" value="\${escapeText(nl.url || '')}" oninput="updateArrayItem('links', \${nIdx}, 'url', this.value)" />
                  </div>
                </div>
              </div>
            \`).join('')}
            <button class="inspector-add-btn" onclick="addArrayItem('links', { label: 'New Link', url: '#features' })">+ Add Nav Link</button>
          </div>
        \`;
      } else if (block.type === 'stats') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Section Title</label>
            <input class="field-input" value="\${escapeText(block.settings.title || '')}" oninput="updateSetting('title', this.value)" />
          </div>
          <div class="field-group">
            <label class="field-label">Stat 1 (Value / Label)</label>
            <div style="display:flex; gap:0.4rem;">
              <input class="field-input" placeholder="99.9%" value="\${escapeText(block.settings.stat1Val || '')}" oninput="updateSetting('stat1Val', this.value)" />
              <input class="field-input" placeholder="Uptime SLA" value="\${escapeText(block.settings.stat1Label || '')}" oninput="updateSetting('stat1Label', this.value)" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Stat 2 (Value / Label)</label>
            <div style="display:flex; gap:0.4rem;">
              <input class="field-input" placeholder="< 5ms" value="\${escapeText(block.settings.stat2Val || '')}" oninput="updateSetting('stat2Val', this.value)" />
              <input class="field-input" placeholder="Edge Latency" value="\${escapeText(block.settings.stat2Label || '')}" oninput="updateSetting('stat2Label', this.value)" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Stat 3 (Value / Label)</label>
            <div style="display:flex; gap:0.4rem;">
              <input class="field-input" placeholder="100%" value="\${escapeText(block.settings.stat3Val || '')}" oninput="updateSetting('stat3Val', this.value)" />
              <input class="field-input" placeholder="Zero-Knowledge" value="\${escapeText(block.settings.stat3Label || '')}" oninput="updateSetting('stat3Label', this.value)" />
            </div>
          </div>
        \`;
      } else if (block.type === 'announcement_bar') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Announcement Text</label>
            <input class="field-input" value="\${escapeText(block.settings.message || '')}" oninput="updateSetting('message', this.value)" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Badge Label</label>
              <input class="field-input" value="\${escapeText(block.settings.badgeText || '')}" oninput="updateSetting('badgeText', this.value)" />
            </div>
            <div class="field-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <label class="field-label" style="margin:0;">Target Link</label>
                <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'linkUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick</button>
              </div>
              <input class="field-input" value="\${escapeText(block.settings.linkUrl || '#pricing')}" oninput="updateSetting('linkUrl', this.value)" />
            </div>
          </div>
        \`;
      } else if (block.type === 'cta') {
        fieldsHtml += \`
          <div class="field-group">
            <label class="field-label">Banner Headline</label>
            <input class="field-input" value="\${escapeText(block.settings.headline || '')}" oninput="updateSetting('headline', this.value)" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
            <div class="field-group">
              <label class="field-label">Button Label</label>
              <input class="field-input" value="\${escapeText(block.settings.buttonText || '')}" oninput="updateSetting('buttonText', this.value)" />
            </div>
            <div class="field-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <label class="field-label" style="margin:0;">Button Link URL</label>
                <button type="button" class="btn btn-secondary" onclick="openLinkPicker('setting', 'buttonUrl', 0, '')" style="padding:0.15rem 0.5rem; font-size:0.68rem; font-weight:700; background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); color:#a5b4fc;">🔗 Pick</button>
              </div>
              <input class="field-input" value="\${escapeText(block.settings.buttonUrl || '/login')}" oninput="updateSetting('buttonUrl', this.value)" />
            </div>
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

          <div style="margin-top:1rem; padding:0.75rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:8px;">
            <div style="font-size:0.72rem; font-weight:800; color:#34d399; text-transform:uppercase; margin-bottom:0.4rem;">🗄️ Internal Database Mapping</div>
            <div class="field-group" style="margin-bottom:0.5rem;">
              <label class="field-label">Target Storage Table</label>
              <select class="field-input" onchange="updateSetting('targetTable', this.value)" style="background:#0f172a;">
                <option value="crm_leads" \${(block.settings.targetTable || 'crm_leads') === 'crm_leads' ? 'selected' : ''}>crm_leads (CRM Lead Pipeline)</option>
                <option value="form_submissions" \${block.settings.targetTable === 'form_submissions' ? 'selected' : ''}>form_submissions (General Inquiries Table)</option>
                <option value="email_subscriptions" \${block.settings.targetTable === 'email_subscriptions' ? 'selected' : ''}>email_subscriptions (Newsletter List)</option>
              </select>
            </div>
            <button onclick="openFormExportModal('\${block.settings.targetTable || 'crm_leads'}')" class="btn" style="width:100%; margin-top:0.4rem; background:linear-gradient(135deg,#10b981,#059669); font-weight:800; font-size:0.78rem; border-radius:6px; padding:0.55rem; display:flex; justify-content:center; align-items:center; gap:0.4rem; box-shadow:0 4px 12px rgba(16,185,129,0.35);">🗄️ Open Database & Data Export</button>
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
      renderCanvas(false);
    }

    function updateArrayItem(arrayKey, itemIdx, field, val) {
      if (!pageData.blocks || !pageData.blocks[selectedBlockIndex]) return;
      const settings = pageData.blocks[selectedBlockIndex].settings;
      if (!Array.isArray(settings[arrayKey])) settings[arrayKey] = [];
      if (!settings[arrayKey][itemIdx]) settings[arrayKey][itemIdx] = {};
      settings[arrayKey][itemIdx][field] = val;
      renderCanvas(false);
    }

    function addArrayItem(arrayKey, defaultItem) {
      if (!pageData.blocks || !pageData.blocks[selectedBlockIndex]) return;
      const settings = pageData.blocks[selectedBlockIndex].settings;
      if (!Array.isArray(settings[arrayKey])) settings[arrayKey] = [];
      settings[arrayKey].push(defaultItem);
      renderCanvas(true);
      showToast('Item added!');
    }

    function removeArrayItem(arrayKey, itemIdx) {
      if (!pageData.blocks || !pageData.blocks[selectedBlockIndex]) return;
      const settings = pageData.blocks[selectedBlockIndex].settings;
      if (!Array.isArray(settings[arrayKey])) return;
      settings[arrayKey].splice(itemIdx, 1);
      renderCanvas(true);
      showToast('Item removed!');
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
          refreshPreviewIframe();
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
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Real-Time Collaboration & Presence Client Sync Engine
    const collabUser = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      name: localStorage.getItem('collab_username') || ('Designer ' + Math.floor(100 + Math.random() * 900)),
      avatarColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 6)],
      cursor: { x: 0, y: 0 },
      lastOperationTimestamp: Date.now()
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
        }
      } catch (e) {
        // Silent presence reconnect
      }
    }

    function renderCollaboratorAvatars(collaborators) {
      const stack = document.getElementById('collaboratorAvatarStack');
      const countEl = document.getElementById('presenceCountText');
      if (countEl) countEl.innerText = collaborators.length + ' Live';
      if (!stack) return;

      stack.innerHTML = collaborators.map(c => \`
        <div class="presence-avatar-pill" style="background:\${c.avatarColor};" title="\${escapeText(c.name)} \${c.id === collabUser.id ? '(You)' : ''}">
          \${escapeText(c.name.charAt(0).toUpperCase())}
        </div>
      \`).join('');
    }

    // ================= LINK & MEDIA PICKER CONTROLLER =================
    let activeLinkTarget = null;
    let activeMediaTarget = null;

    function openLinkPicker(targetType, keyOrArrayKey, idx, field) {
      activeLinkTarget = { targetType, keyOrArrayKey, idx, field };
      const modal = document.getElementById('linkPickerModal');
      if (modal) modal.style.display = 'flex';
      switchLinkTab('pages');
    }

    function closeLinkPicker() {
      const modal = document.getElementById('linkPickerModal');
      if (modal) modal.style.display = 'none';
      activeLinkTarget = null;
    }

    function switchLinkTab(tabId) {
      document.querySelectorAll('.link-tab-btn').forEach(btn => {
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = '#94a3b8';
      });
      document.querySelectorAll('.link-tab-content').forEach(content => {
        content.style.display = 'none';
      });

      const activeBtn = document.getElementById('linkTab_' + tabId);
      const activeContent = document.getElementById('linkTabContent_' + tabId);
      if (activeBtn) {
        activeBtn.style.borderBottomColor = 'var(--primary)';
        activeBtn.style.color = '#fff';
      }
      if (activeContent) activeContent.style.display = 'block';
    }

    function applyLinkValue(val) {
      if (!activeLinkTarget || !pageData.blocks || !pageData.blocks[selectedBlockIndex]) {
        closeLinkPicker();
        return;
      }
      const { targetType, keyOrArrayKey, idx, field } = activeLinkTarget;
      if (targetType === 'setting') {
        updateSetting(keyOrArrayKey, val);
      } else if (targetType === 'array') {
        updateArrayItem(keyOrArrayKey, idx, field, val);
      }
      closeLinkPicker();
      renderInspector();
      showToast('🔗 Link updated to: ' + val, true);
    }

    function openMediaPicker(targetType, keyOrArrayKey, idx, field, isVideo = false) {
      activeMediaTarget = { targetType, keyOrArrayKey, idx, field, isVideo };
      const modal = document.getElementById('mediaPickerModal');
      const title = document.getElementById('mediaPickerTitle');
      if (title) title.innerText = isVideo ? 'Video Source Selector' : 'Media Asset Library';
      if (modal) modal.style.display = 'flex';
      switchMediaTab(isVideo ? 'stockVideos' : 'stockImages');
      loadTenantMediaAssets();
    }

    function closeMediaPicker() {
      const modal = document.getElementById('mediaPickerModal');
      if (modal) modal.style.display = 'none';
      activeMediaTarget = null;
    }

    function switchMediaTab(tabId) {
      document.querySelectorAll('.media-tab-btn').forEach(btn => {
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = '#94a3b8';
      });
      document.querySelectorAll('.media-tab-content').forEach(content => {
        content.style.display = 'none';
      });

      const activeBtn = document.getElementById('mediaTab_' + tabId);
      const activeContent = document.getElementById('mediaTabContent_' + tabId);
      if (activeBtn) {
        activeBtn.style.borderBottomColor = 'var(--primary)';
        activeBtn.style.color = '#fff';
      }
      if (activeContent) activeContent.style.display = 'block';
    }

    function selectMediaAsset(url, alt = '') {
      if (!activeMediaTarget || !pageData.blocks || !pageData.blocks[selectedBlockIndex]) {
        closeMediaPicker();
        return;
      }
      const { targetType, keyOrArrayKey, idx, field, isVideo } = activeMediaTarget;
      if (targetType === 'setting') {
        updateSetting(keyOrArrayKey, url);
        if (!isVideo && field === '' && alt) {
          const currentBlock = pageData.blocks[selectedBlockIndex];
          if (currentBlock && currentBlock.settings && !currentBlock.settings.altText) {
            updateSetting('altText', alt);
          }
        }
      } else if (targetType === 'array') {
        updateArrayItem(keyOrArrayKey, idx, field, url);
        if (!isVideo && alt) {
          updateArrayItem(keyOrArrayKey, idx, 'alt', alt);
        }
      }
      closeMediaPicker();
      renderInspector();
      showToast('Media asset selected!', true);
    }

    async function loadTenantMediaAssets() {
      const container = document.getElementById('tenantAssetsContainer');
      if (!container) return;
      try {
        const tenantSlug = '${escapeHtml(tenantSlug)}';
        const res = await fetch('/api/media/assets?tenant=' + encodeURIComponent(tenantSlug), {
          headers: {
            'x-tenant-id': tenantSlug,
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
          }
        });
        const data = await res.json();
        const assets = data.assets || [];
        if (assets.length === 0) {
          container.innerHTML = '<div style="color:#64748b; font-size:0.85rem; grid-column:1/-1; text-align:center; padding:2rem 0;">No media uploaded yet. Use Direct Upload to add files.</div>';
          return;
        }
        container.innerHTML = assets.map(a => \`
          <div onclick="selectMediaAsset('\${escapeText(a.url || a.path)}', '\${escapeText(a.title || a.name || 'Asset')}')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
            <img src="\${escapeText(a.url || a.path)}" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect fill=\\'%231e293b\\' width=\\'100\\' height=\\'100\\'/><text fill=\\'%2394a3b8\\' x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'12\\'>FILE</text></svg>';" />
            <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${escapeText(a.title || a.name || 'File')}</div>
          </div>
        \`).join('');
      } catch (e) {
        container.innerHTML = '<div style="color:#ef4444; font-size:0.85rem; grid-column:1/-1; text-align:center; padding:2rem 0;">Failed to load tenant assets.</div>';
      }
    }

    async function handleDirectMediaUpload(files) {
      if (!files || files.length === 0) return;
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      showToast('Uploading asset ' + file.name + '...');
      try {
        const tenantSlug = '${escapeHtml(tenantSlug)}';
        const res = await fetch('/api/media/upload?tenant=' + encodeURIComponent(tenantSlug), {
          method: 'POST',
          headers: {
            'x-tenant-id': tenantSlug,
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
          },
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.asset) {
          selectMediaAsset(data.asset.url || data.asset.path, file.name);
          showToast('Asset uploaded and inserted successfully!', true);
        } else {
          showToast('⚠️ Upload failed: ' + (data.error || 'Unknown error'));
        }
    // --- DAY & NIGHT THEME MODE FUNCTIONS ---
    let activeThemeMode = 'dark';
    function applyDayMode() {
      activeThemeMode = 'light';
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      const canvasContainer = document.getElementById('canvasContainer');
      if (canvasContainer) {
        canvasContainer.classList.remove('theme-dark');
        canvasContainer.classList.add('theme-light');
      }
      const iframe = document.getElementById('livePreviewIframe');
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        iframe.contentDocument.body.classList.remove('theme-dark');
        iframe.contentDocument.body.classList.add('theme-light');
      }
      showToast('☀️ Daylight Clean Light Theme Applied!');
    }

    function applyNightMode() {
      activeThemeMode = 'dark';
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      const canvasContainer = document.getElementById('canvasContainer');
      if (canvasContainer) {
        canvasContainer.classList.remove('theme-light');
        canvasContainer.classList.add('theme-dark');
      }
      const iframe = document.getElementById('livePreviewIframe');
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        iframe.contentDocument.body.classList.remove('theme-light');
        iframe.contentDocument.body.classList.add('theme-dark');
      }
      showToast('🌙 Midnight Dark Slate Theme Applied!');
    }

    // --- GOOGLE OPEN FONTS LIBRARY LOADER ---
    function loadGoogleFont(fontName) {
      if (!fontName) return;
      const fontSlug = fontName.replace(/\s+/g, '+');
      const fontId = 'googleFont_' + fontName.replace(/\s+/g, '_');
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + fontSlug + ':wght@400;600;700;800;900&display=swap';
        document.head.appendChild(link);
      }
      const iframe = document.getElementById('livePreviewIframe');
      if (iframe && iframe.contentDocument && iframe.contentDocument.head) {
        if (!iframe.contentDocument.getElementById(fontId)) {
          const iframeLink = document.createElement('link');
          iframeLink.id = fontId;
          iframeLink.rel = 'stylesheet';
          iframeLink.href = 'https://fonts.googleapis.com/css2?family=' + fontSlug + ':wght@400;600;700;800;900&display=swap';
          iframe.contentDocument.head.appendChild(iframeLink);
        }
      }
    }

    function changeFontHeading(fontName) {
      loadGoogleFont(fontName);
      document.documentElement.style.setProperty('--font-heading', "'" + fontName + "', sans-serif");
      const iframe = document.getElementById('livePreviewIframe');
      if (iframe && iframe.contentDocument && iframe.contentDocument.documentElement) {
        iframe.contentDocument.documentElement.style.setProperty('--font-heading', "'" + fontName + "', sans-serif");
      }
      showToast('🔤 Heading Font updated to ' + fontName + '!');
    }

    function changeFontBody(fontName) {
      loadGoogleFont(fontName);
      document.documentElement.style.setProperty('--font-body', "'" + fontName + "', sans-serif");
      const iframe = document.getElementById('livePreviewIframe');
      if (iframe && iframe.contentDocument && iframe.contentDocument.documentElement) {
        iframe.contentDocument.documentElement.style.setProperty('--font-body', "'" + fontName + "', sans-serif");
      }
      showToast('🔤 Body Font updated to ' + fontName + '!');
    }

    // --- CATEGORIZED BLOCK SELECTOR POPUP MODAL ---
    function openBlockLibraryModal(category) {
      const modal = document.getElementById('blockLibraryModal');
      if (!modal) return;
      modal.style.display = 'flex';
      switchBlockCategoryTab(category || 'all');
    }

    function closeBlockLibraryModal() {
      const modal = document.getElementById('blockLibraryModal');
      if (modal) modal.style.display = 'none';
    }

    function switchBlockCategoryTab(category) {
      ['all', 'basics', 'social', 'media', 'forms'].forEach(cat => {
        const btn = document.getElementById('blockCatTab_' + cat);
        const content = document.getElementById('blockCatContent_' + cat);
        if (btn) {
          btn.style.borderBottomColor = cat === category ? 'var(--primary)' : 'transparent';
          btn.style.color = cat === category ? '#fff' : '#94a3b8';
        }
        if (content) {
          content.style.display = (category === 'all' || cat === category) ? 'grid' : 'none';
        }
      });
    }

    function filterBlockLibraryCards(query) {
      const q = (query || '').toLowerCase();
      const cards = document.querySelectorAll('.block-library-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }

    // --- IN-APP CREATE PAGE MODAL ---
    function openCreatePageModal() {
      const modal = document.getElementById('createPageModal');
      if (!modal) return;
      modal.style.display = 'flex';
      const titleInput = document.getElementById('newPageTitleInput');
      const slugInput = document.getElementById('newPageSlugInput');
      if (titleInput) titleInput.value = '';
      if (slugInput) slugInput.value = '';
    }

    function closeCreatePageModal() {
      const modal = document.getElementById('createPageModal');
      if (modal) modal.style.display = 'none';
    }

    async function handleCreatePageSubmit(event) {
      if (event) event.preventDefault();
      const titleInput = document.getElementById('newPageTitleInput');
      const slugInput = document.getElementById('newPageSlugInput');
      const templateSelect = document.getElementById('newPageTemplateSelect');
      
      const title = titleInput ? titleInput.value.trim() : '';
      let slug = slugInput ? slugInput.value.trim() : '';
      const template = templateSelect ? templateSelect.value : 'blank';

      if (!title) {
        showToast('⚠️ Please enter a page title!');
        return;
      }
      if (!slug) {
        slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      showToast('Creating new page [' + title + ']...');
      try {
        const tenantSlug = '${escapeHtml(tenantSlug)}';
        const res = await fetch('/api/website/pages?tenant=' + encodeURIComponent(tenantSlug), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
          },
          body: JSON.stringify({ title, slug, template })
        });
        const data = await res.json();
        if (res.ok && data.page) {
          closeCreatePageModal();
          showToast('Page created! Redirecting to editor...', true);
          window.location.href = '/editor?tenant=' + encodeURIComponent(tenantSlug) + '&pageId=' + data.page.id;
        } else {
          showToast('⚠️ Failed to create page: ' + (data.error || 'Unknown error'));
        }
      } catch (e) {
        showToast('⚠️ Network error while creating page.');
      }
    }

    // --- FORM SUBMISSION DATABASE & DATA EXPORT MODAL ---
    function openFormExportModal(targetTable) {
      const modal = document.getElementById('formExportModal');
      if (!modal) return;
      modal.style.display = 'flex';
      loadFormSubmissionsSummary(targetTable || 'crm_leads');
    }

    function closeFormExportModal() {
      const modal = document.getElementById('formExportModal');
      if (modal) modal.style.display = 'none';
    }

    async function loadFormSubmissionsSummary(targetTable) {
      const countEl = document.getElementById('formSubmissionsCount');
      if (!countEl) return;
      try {
        const tenantSlug = '${escapeHtml(tenantSlug)}';
        const res = await fetch('/api/forms/submissions?tenant=' + encodeURIComponent(tenantSlug), {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') }
        });
        const data = await res.json();
        const total = data.count || 0;
        countEl.innerText = total + ' Record(s) stored in table [' + (targetTable || 'crm_leads') + ']';
      } catch (e) {
        countEl.innerText = 'Submissions ready for download.';
      }
    }

    function downloadFormExport(format) {
      const tenantSlug = '${escapeHtml(tenantSlug)}';
      if (format === 'csv') {
        window.open('/api/forms/export/csv?tenant=' + encodeURIComponent(tenantSlug), '_blank');
      } else if (format === 'sql') {
        window.open('/api/forms/export/sql?tenant=' + encodeURIComponent(tenantSlug), '_blank');
      } else if (format === 'json') {
        window.open('/api/forms/submissions?tenant=' + encodeURIComponent(tenantSlug), '_blank');
      }
      showToast('📥 Export initiated for format: ' + format.toUpperCase());
    }

    // Initial Render & Setup Split Mode
    renderCanvas();
    renderHarmonizer();
    updateWcagBadges();
    setStudioViewMode('split');
  </script>

  <!-- ================= LINK PICKER MODAL ================= -->
  <div id="linkPickerModal" class="studio-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:99999; justify-content:center; align-items:center;">
    <div class="studio-modal-card" style="background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:14px; width:92%; max-width:600px; max-height:85vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.2rem;">🔗</span>
          <span style="font-weight:800; font-size:1.05rem; color:#fff;">Insert Link & Destination</span>
        </div>
        <button onclick="closeLinkPicker()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer; padding:0.2rem 0.5rem;">✕</button>
      </div>

      <!-- Link Tabs -->
      <div style="display:flex; gap:0.25rem; padding:0.75rem 1.25rem 0; border-bottom:1px solid rgba(255,255,255,0.08); background:#090d16;">
        <button class="link-tab-btn active" id="linkTab_pages" onclick="switchLinkTab('pages')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid var(--primary); color:#fff; cursor:pointer;">📄 Pages</button>
        <button class="link-tab-btn" id="linkTab_sections" onclick="switchLinkTab('sections')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid transparent; color:#94a3b8; cursor:pointer;">⚓ Section Anchors</button>
        <button class="link-tab-btn" id="linkTab_custom" onclick="switchLinkTab('custom')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid transparent; color:#94a3b8; cursor:pointer;">🌐 External URL</button>
        <button class="link-tab-btn" id="linkTab_actions" onclick="switchLinkTab('actions')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid transparent; color:#94a3b8; cursor:pointer;">⚡ Quick Actions</button>
      </div>

      <!-- Tab Contents -->
      <div style="padding:1.25rem; overflow-y:auto; flex:1;">
        <!-- Tab 1: Pages -->
        <div id="linkTabContent_pages" class="link-tab-content">
          <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:0.75rem;">Select a page within this tenant:</div>
          <div style="display:flex; flex-direction:column; gap:0.5rem;" id="tenantPagesList">
            <div onclick="applyLinkValue('/preview/home')" class="link-picker-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">🏠 Home Page</div>
                <div style="font-size:0.72rem; color:#64748b; font-family:monospace;">/preview/home</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
            <div onclick="applyLinkValue('/preview/pricing')" class="link-picker-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">💎 Pricing & Plans</div>
                <div style="font-size:0.72rem; color:#64748b; font-family:monospace;">/preview/pricing</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
            <div onclick="applyLinkValue('/preview/about')" class="link-picker-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">🏢 About & Team</div>
                <div style="font-size:0.72rem; color:#64748b; font-family:monospace;">/preview/about</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
            <div onclick="applyLinkValue('/preview/contact')" class="link-picker-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">✉️ Contact & Demo</div>
                <div style="font-size:0.72rem; color:#64748b; font-family:monospace;">/preview/contact</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
          </div>
        </div>

        <!-- Tab 2: Section Anchors -->
        <div id="linkTabContent_sections" class="link-tab-content" style="display:none;">
          <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:0.75rem;">Scroll smoothly to an on-page section:</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <div onclick="applyLinkValue('#hero')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">⚡ #hero</div>
              <div style="font-size:0.7rem; color:#64748b;">Top Hero Banner</div>
            </div>
            <div onclick="applyLinkValue('#features')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">✨ #features</div>
              <div style="font-size:0.7rem; color:#64748b;">Feature Highlights</div>
            </div>
            <div onclick="applyLinkValue('#pricing')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">💳 #pricing</div>
              <div style="font-size:0.7rem; color:#64748b;">Pricing Table</div>
            </div>
            <div onclick="applyLinkValue('#testimonials')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">💬 #testimonials</div>
              <div style="font-size:0.7rem; color:#64748b;">Client Reviews</div>
            </div>
            <div onclick="applyLinkValue('#gallery')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">🖼️ #gallery</div>
              <div style="font-size:0.7rem; color:#64748b;">Visual Grid</div>
            </div>
            <div onclick="applyLinkValue('#video')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">🎬 #video</div>
              <div style="font-size:0.7rem; color:#64748b;">Video Player</div>
            </div>
            <div onclick="applyLinkValue('#faq')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">❓ #faq</div>
              <div style="font-size:0.7rem; color:#64748b;">Questions & Answers</div>
            </div>
            <div onclick="applyLinkValue('#contact')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">📝 #contact</div>
              <div style="font-size:0.7rem; color:#64748b;">Contact Form</div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Custom URL -->
        <div id="linkTabContent_custom" class="link-tab-content" style="display:none;">
          <div class="field-group">
            <label class="field-label">Custom External URL</label>
            <input id="customLinkInput" class="field-input" placeholder="https://example.com/portal" />
          </div>
          <button onclick="applyLinkValue(document.getElementById('customLinkInput').value)" class="btn" style="width:100%; margin-top:0.75rem; background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); font-weight:700; padding:0.65rem;">Apply Custom URL</button>
        </div>

        <!-- Tab 4: Actions -->
        <div id="linkTabContent_actions" class="link-tab-content" style="display:none;">
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <div onclick="applyLinkValue('/login')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">🔐 Client Portal / Sign In</div>
              <div style="font-size:0.7rem; color:#64748b; font-family:monospace;">/login</div>
            </div>
            <div onclick="applyLinkValue('mailto:hello@' + '${escapeHtml(tenantSlug)}' + '.com')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">📧 Email Action (mailto:)</div>
              <div style="font-size:0.7rem; color:#64748b; font-family:monospace;">mailto:hello@${escapeHtml(tenantSlug)}.com</div>
            </div>
            <div onclick="applyLinkValue('tel:+18005550199')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">📞 Phone Call (tel:)</div>
              <div style="font-size:0.7rem; color:#64748b; font-family:monospace;">tel:+18005550199</div>
            </div>
            <div onclick="applyLinkValue('#top')" class="link-picker-item" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;">
              <div style="font-weight:700; color:#fff; font-size:0.85rem;">⬆️ Scroll to Top of Page</div>
              <div style="font-size:0.7rem; color:#64748b; font-family:monospace;">#top</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= MEDIA / VIDEO PICKER MODAL ================= -->
  <div id="mediaPickerModal" class="studio-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:99999; justify-content:center; align-items:center;">
    <div class="studio-modal-card" style="background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:14px; width:92%; max-width:760px; max-height:85vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.2rem;">🖼️</span>
          <span id="mediaPickerTitle" style="font-weight:800; font-size:1.05rem; color:#fff;">Media Asset Library</span>
        </div>
        <button onclick="closeMediaPicker()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer; padding:0.2rem 0.5rem;">✕</button>
      </div>

      <!-- Media Tabs -->
      <div style="display:flex; gap:0.25rem; padding:0.75rem 1.25rem 0; border-bottom:1px solid rgba(255,255,255,0.08); background:#090d16;">
        <button class="media-tab-btn active" id="mediaTab_stockImages" onclick="switchMediaTab('stockImages')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid var(--primary); color:#fff; cursor:pointer;">📸 Stock Photos</button>
        <button class="media-tab-btn" id="mediaTab_stockVideos" onclick="switchMediaTab('stockVideos')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid transparent; color:#94a3b8; cursor:pointer;">🎬 Videos & Loops</button>
        <button class="media-tab-btn" id="mediaTab_library" onclick="switchMediaTab('library')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid transparent; color:#94a3b8; cursor:pointer;">☁️ Tenant Assets</button>
        <button class="media-tab-btn" id="mediaTab_upload" onclick="switchMediaTab('upload')" style="padding:0.5rem 0.9rem; font-size:0.8rem; font-weight:700; background:none; border:none; border-bottom:2px solid transparent; color:#94a3b8; cursor:pointer;">⬆️ Direct Upload</button>
      </div>

      <!-- Tab Contents -->
      <div style="padding:1.25rem; overflow-y:auto; flex:1;">
        <!-- Stock Photos -->
        <div id="mediaTabContent_stockImages" class="media-tab-content">
          <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:0.75rem;">Click any royalty-free HD asset to insert:</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:0.75rem;">
            <div onclick="selectMediaAsset('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Cloud Analytics Dashboard')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" />
              <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">SaaS Analytics UI</div>
            </div>
            <div onclick="selectMediaAsset('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Modern High-Tech Workflow')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" />
              <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Tech Dashboard</div>
            </div>
            <div onclick="selectMediaAsset('https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80', 'Data Analytics Visualization')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
              <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=400&q=80" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" />
              <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Data Visuals</div>
            </div>
            <div onclick="selectMediaAsset('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80', 'Enterprise Team Collaboration')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" />
              <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Team Collaboration</div>
            </div>
            <div onclick="selectMediaAsset('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'Microprocessor Hardware')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" />
              <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Silicon Chip Architecture</div>
            </div>
            <div onclick="selectMediaAsset('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', 'Zero-Knowledge Security Matrix')" class="media-grid-item" style="border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; background:#1e293b;">
              <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80" style="width:100%; aspect-ratio:4/3; object-fit:cover; display:block;" />
              <div style="padding:0.4rem; font-size:0.7rem; font-weight:700; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Cyber Security Code</div>
            </div>
          </div>
        </div>

        <!-- Stock Videos -->
        <div id="mediaTabContent_stockVideos" class="media-tab-content" style="display:none;">
          <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:0.75rem;">Click any video embed or stream link to insert:</div>
          <div style="display:flex; flex-direction:column; gap:0.6rem;">
            <div onclick="selectMediaAsset('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'YouTube Video Stream')" class="media-grid-item" style="padding:0.85rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1e293b; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">🎬 SaaS Platform Overview (YouTube)</div>
                <div style="font-size:0.72rem; color:#94a3b8; font-family:monospace;">https://www.youtube.com/watch?v=dQw4w9WgXcQ</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
            <div onclick="selectMediaAsset('https://vimeo.com/76979871', 'Vimeo Cinematic Showcase')" class="media-grid-item" style="padding:0.85rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1e293b; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">🎥 4K Cinematic Reel (Vimeo)</div>
                <div style="font-size:0.72rem; color:#94a3b8; font-family:monospace;">https://vimeo.com/76979871</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
            <div onclick="selectMediaAsset('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'HTML5 MP4 Stream')" class="media-grid-item" style="padding:0.85rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#1e293b; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.88rem;">⚡ Direct HTML5 MP4 Stream</div>
                <div style="font-size:0.72rem; color:#94a3b8; font-family:monospace;">https://commondatastorage.googleapis.com/.../sample.mp4</div>
              </div>
              <span class="btn btn-secondary" style="font-size:0.72rem; padding:0.25rem 0.6rem;">Select</span>
            </div>
          </div>
        </div>

        <!-- Tenant Library -->
        <div id="mediaTabContent_library" class="media-tab-content" style="display:none;">
          <div id="tenantAssetsContainer" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:0.75rem;">
            <div style="color:#64748b; font-size:0.85rem; grid-column:1/-1; text-align:center; padding:2rem 0;">Loading tenant media files...</div>
          </div>
        </div>

        <!-- Direct Upload -->
        <div id="mediaTabContent_upload" class="media-tab-content" style="display:none;">
          <div style="border:2px dashed rgba(255,255,255,0.15); border-radius:12px; padding:2.5rem 1.5rem; text-align:center; background:rgba(255,255,255,0.01);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">⬆️</div>
            <div style="font-weight:700; font-size:0.95rem; color:#fff; margin-bottom:0.3rem;">Upload Image or Video File</div>
            <p style="color:#94a3b8; font-size:0.8rem; margin:0 0 1.25rem;">Supported formats: PNG, JPG, WebP, SVG, MP4, WebM (Max 50MB)</p>
            <input type="file" id="mediaUploadFileInput" style="display:none;" onchange="handleDirectMediaUpload(this.files)" />
            <button onclick="document.getElementById('mediaUploadFileInput').click()" class="btn" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:var(--radius); font-weight:700; padding:0.6rem 1.4rem;">Browse Local File</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= CATEGORIZED BLOCK SELECTOR POPUP WINDOW ================= -->
  <div id="blockLibraryModal" class="studio-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:99999; justify-content:center; align-items:center;">
    <div class="studio-modal-card" style="background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:16px; width:94%; max-width:850px; max-height:88vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px -15px rgba(0,0,0,0.9);">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.4rem;">🧩</span>
          <div>
            <span style="font-weight:900; font-size:1.1rem; color:#fff;">Component Block Library</span>
            <div style="font-size:0.72rem; color:#94a3b8;">Choose code-less building blocks to implement on your page</div>
          </div>
        </div>
        <button onclick="closeBlockLibraryModal()" style="background:none; border:none; color:#94a3b8; font-size:1.3rem; cursor:pointer; padding:0.2rem 0.5rem;">✕</button>
      </div>

      <!-- Search & Category Tabs Bar -->
      <div style="padding:0.85rem 1.5rem; background:#090d16; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:0.75rem;">
        <input class="field-input" placeholder="🔍 Search building blocks (e.g. Hero, Video, Pricing, Form)..." oninput="filterBlockLibraryCards(this.value)" style="background:#131d31; font-size:0.85rem;" />
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="blockCatTab_all" onclick="switchBlockCategoryTab('all')" style="padding:0.4rem 0.85rem; font-size:0.78rem; font-weight:700;">All Blocks (17)</button>
          <button class="btn btn-secondary" id="blockCatTab_basics" onclick="switchBlockCategoryTab('basics')" style="padding:0.4rem 0.85rem; font-size:0.78rem; font-weight:700;">🧱 Basics & Structure</button>
          <button class="btn btn-secondary" id="blockCatTab_social" onclick="switchBlockCategoryTab('social')" style="padding:0.4rem 0.85rem; font-size:0.78rem; font-weight:700;">🤝 Social & Conversion</button>
          <button class="btn btn-secondary" id="blockCatTab_media" onclick="switchBlockCategoryTab('media')" style="padding:0.4rem 0.85rem; font-size:0.78rem; font-weight:700;">🎬 Media & Visuals</button>
          <button class="btn btn-secondary" id="blockCatTab_forms" onclick="switchBlockCategoryTab('forms')" style="padding:0.4rem 0.85rem; font-size:0.78rem; font-weight:700;">📋 Forms & Data</button>
        </div>
      </div>

      <!-- Modal Body Grid -->
      <div style="padding:1.5rem; overflow-y:auto; flex:1;">
        <div id="blockCatContent_all" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:1rem;">
          <!-- 1. BASICS & STRUCTURE -->
          <div class="block-library-card" onclick="addBlock('navbar'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">🧭</span>
                <span style="font-size:0.65rem; background:rgba(99,102,241,0.2); color:#a5b4fc; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">BASICS</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Navigation Bar</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Header branding, monogram logo, responsive links & action CTA button.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Navigation</button>
          </div>

          <div class="block-library-card" onclick="addBlock('hero'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">⚡</span>
                <span style="font-size:0.65rem; background:rgba(99,102,241,0.2); color:#a5b4fc; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">BASICS</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Hero Section</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Eyebrow badge, high-impact title, subtitle, dual CTAs, & device mockup.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Hero</button>
          </div>

          <div class="block-library-card" onclick="addBlock('announcement_bar'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">📢</span>
                <span style="font-size:0.65rem; background:rgba(99,102,241,0.2); color:#a5b4fc; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">BASICS</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Announcement Bar</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Top notification ticker for promotional sales, deals, and announcements.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Announcement</button>
          </div>

          <div class="block-library-card" onclick="addBlock('footer'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">⚓</span>
                <span style="font-size:0.65rem; background:rgba(99,102,241,0.2); color:#a5b4fc; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">BASICS</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Site Footer</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Brand copyright notice, sitemap links, social icons & footer layout.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Footer</button>
          </div>

          <div class="block-library-card" onclick="addBlock('stats'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">📊</span>
                <span style="font-size:0.65rem; background:rgba(99,102,241,0.2); color:#a5b4fc; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">BASICS</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Metrics & Stats</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Highlight SLA uptime, latency benchmarks, customer count & key proof stats.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Metrics</button>
          </div>

          <!-- 2. SOCIAL & CONVERSION -->
          <div class="block-library-card" onclick="addBlock('testimonials'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">💬</span>
                <span style="font-size:0.65rem; background:rgba(234,179,8,0.2); color:#fde047; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">SOCIAL</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Customer Reviews</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Star ratings, executive quotes, avatar monograms & social proof cards.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Testimonials</button>
          </div>

          <div class="block-library-card" onclick="addBlock('pricing'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">💎</span>
                <span style="font-size:0.65rem; background:rgba(234,179,8,0.2); color:#fde047; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">SOCIAL</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Pricing Tiers</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Multi-tier plan cards, popular badges, feature lists & billing period toggles.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Pricing</button>
          </div>

          <div class="block-library-card" onclick="addBlock('faq'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">❓</span>
                <span style="font-size:0.65rem; background:rgba(234,179,8,0.2); color:#fde047; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">SOCIAL</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">FAQ Accordion</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Expandable question and answer cards for customer objection handling.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert FAQ</button>
          </div>

          <div class="block-library-card" onclick="addBlock('cta'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">🎯</span>
                <span style="font-size:0.65rem; background:rgba(234,179,8,0.2); color:#fde047; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">SOCIAL</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">CTA Banner</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">High-impact gradient call-to-action block for sign-ups and leads.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert CTA</button>
          </div>

          <div class="block-library-card" onclick="addBlock('product_grid'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">🛍️</span>
                <span style="font-size:0.65rem; background:rgba(234,179,8,0.2); color:#fde047; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">SOCIAL</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Store Showcase</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Merchandise catalog with pricing, stock tags & cart actions.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Store</button>
          </div>

          <!-- 3. MEDIA & VISUALS -->
          <div class="block-library-card" onclick="addBlock('image_showcase'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">🖼️</span>
                <span style="font-size:0.65rem; background:rgba(168,85,247,0.2); color:#d8b4fe; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">MEDIA</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Image Showcase</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">HD image hero with gradient overlays, ribbon badges & links.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Image Showcase</button>
          </div>

          <div class="block-library-card" onclick="addBlock('video_player'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">🎬</span>
                <span style="font-size:0.65rem; background:rgba(168,85,247,0.2); color:#d8b4fe; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">MEDIA</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Video Player & Embed</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Embed YouTube, Vimeo, or direct MP4 videos with custom aspect ratios.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Video Player</button>
          </div>

          <div class="block-library-card" onclick="addBlock('gallery'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">📸</span>
                <span style="font-size:0.65rem; background:rgba(168,85,247,0.2); color:#d8b4fe; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">MEDIA</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Visual Portfolio Gallery</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Multi-column image grid (2, 3, or 4 columns) with title overlays and link pickers.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Gallery</button>
          </div>

          <!-- 4. FORMS & DATA -->
          <div class="block-library-card" onclick="addBlock('form_builder'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">📋</span>
                <span style="font-size:0.65rem; background:rgba(52,211,153,0.2); color:#6ee7b7; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">FORMS & DATA</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Form Builder & DB Storage</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Lead capture form linked to internal database tables with XLS/SQL export.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Form Builder</button>
          </div>

          <div class="block-library-card" onclick="addBlock('pagination'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">🔢</span>
                <span style="font-size:0.65rem; background:rgba(52,211,153,0.2); color:#6ee7b7; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">FORMS & DATA</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Pagination Manager</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Page numbers, pills, button groups, and route base URL query manager.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert Pagination</button>
          </div>

          <div class="block-library-card" onclick="addBlock('cms_feed'); closeBlockLibraryModal();" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1.1rem; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-size:1.6rem;">📝</span>
                <span style="font-size:0.65rem; background:rgba(52,211,153,0.2); color:#6ee7b7; padding:0.15rem 0.45rem; border-radius:4px; font-weight:800;">FORMS & DATA</span>
              </div>
              <div style="font-weight:800; color:#fff; font-size:0.95rem;">Headless CMS Feed</div>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.3rem 0 1rem; line-height:1.4;">Dynamic blog articles, releases, and full-text search indexing feed.</p>
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; font-weight:700;">+ Insert CMS Feed</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= IN-APP CREATE PAGE MODAL ================= -->
  <div id="createPageModal" class="studio-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:99999; justify-content:center; align-items:center;">
    <div class="studio-modal-card" style="background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:16px; width:90%; max-width:520px; padding:1.5rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.3rem;">📄</span>
          <span style="font-weight:800; font-size:1.1rem; color:#fff;">Create New Page</span>
        </div>
        <button onclick="closeCreatePageModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✕</button>
      </div>

      <form onsubmit="handleCreatePageSubmit(event)">
        <div class="field-group" style="margin-bottom:1rem;">
          <label class="field-label">Page Title *</label>
          <input id="newPageTitleInput" class="field-input" placeholder="e.g. Enterprise Pricing & Plans" required />
        </div>
        <div class="field-group" style="margin-bottom:1rem;">
          <label class="field-label">URL Slug (e.g. pricing, about, contact)</label>
          <input id="newPageSlugInput" class="field-input" placeholder="pricing" />
        </div>
        <div class="field-group" style="margin-bottom:1.5rem;">
          <label class="field-label">Starter Layout Preset</label>
          <select id="newPageTemplateSelect" class="field-input">
            <option value="blank">Blank Page (Start from scratch)</option>
            <option value="saas_landing">SaaS Product Launch (Hero + Features + Pricing)</option>
            <option value="agency_studio">Creative Studio (Hero + CMS Showcases + Reviews)</option>
            <option value="consulting_lead">Executive Consulting (Hero + Metrics + Lead Form)</option>
            <option value="minimal_docs">Product Hub & Blog (Hero + CMS Feed + FAQ)</option>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.6rem;">
          <button type="button" onclick="closeCreatePageModal()" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn" style="background:linear-gradient(135deg,var(--primary),var(--secondary)); font-weight:800; padding:0.65rem 1.4rem;">🚀 Create Page</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= FORM DATABASE LINKAGE & DATA EXPORT MODAL ================= -->
  <div id="formExportModal" class="studio-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:99999; justify-content:center; align-items:center;">
    <div class="studio-modal-card" style="background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:16px; width:90%; max-width:580px; padding:1.5rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.4rem;">🗄️</span>
          <div>
            <span style="font-weight:800; font-size:1.1rem; color:#fff;">Form Database & Data Export Manager</span>
            <div style="font-size:0.72rem; color:#94a3b8;">Manage internal DB table linkage & export structured form data</div>
          </div>
        </div>
        <button onclick="closeFormExportModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✕</button>
      </div>

      <div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.25); border-radius:10px; padding:0.85rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.6rem;">
        <span style="font-size:1.2rem;">📊</span>
        <div style="font-size:0.8rem; font-weight:700; color:#a5b4fc;" id="formSubmissionsCount">Loading form records...</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">
        <div onclick="downloadFormExport('csv')" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.85rem 1.1rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.2rem;">📈</span>
            <div>
              <div style="font-weight:700; font-size:0.88rem; color:#fff;">Export to Excel / CSV (.csv)</div>
              <div style="font-size:0.72rem; color:#94a3b8;">Download tabular spreadsheet format for Excel, Sheets, & BI tools.</div>
            </div>
          </div>
          <span class="btn btn-secondary" style="font-size:0.75rem; font-weight:700;">Download CSV</span>
        </div>

        <div onclick="downloadFormExport('sql')" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.85rem 1.1rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.2rem;">🗄️</span>
            <div>
              <div style="font-weight:700; font-size:0.88rem; color:#fff;">Export to SQL Statements (.sql)</div>
              <div style="font-size:0.72rem; color:#94a3b8;">Generates PostgreSQL/MySQL INSERT INTO table queries for database migration.</div>
            </div>
          </div>
          <span class="btn btn-secondary" style="font-size:0.75rem; font-weight:700;">Download SQL</span>
        </div>

        <div onclick="downloadFormExport('json')" style="background:#131d31; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.85rem 1.1rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.2rem;">📄</span>
            <div>
              <div style="font-weight:700; font-size:0.88rem; color:#fff;">Export to JSON Data (.json)</div>
              <div style="font-size:0.72rem; color:#94a3b8;">Structured JSON payload array for REST API & webhooks integration.</div>
            </div>
          </div>
          <span class="btn btn-secondary" style="font-size:0.75rem; font-weight:700;">View JSON</span>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button type="button" onclick="closeFormExportModal()" class="btn btn-secondary">Close Window</button>
      </div>
    </div>
  </div>

  <!-- INTERACTIVE TOAST NOTIFICATION CONTAINER -->
  <div id="studioToast" class="studio-toast">
    <span id="studioToastMsg">Action completed!</span>
    <button id="studioToastUndoBtn" onclick="triggerUndo()" class="studio-toast-undo" style="display:none;">↩ Undo</button>
  </div>
</body>
</html>`;
}
