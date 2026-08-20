// Capabilities: Reusable Block Component Registry & Dynamic Render Pipeline (DRY Architecture)
// Single Source of Truth for Block Definitions, Schemas, Clean HTML, and Inspector Form Fields
// Styles are extracted to public/blocks.css for browser caching and maximum performance

import { escapeHtml } from '../../foundation/Sanitizer.js';

export interface BlockFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'items_array';
  defaultValue: any;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface BlockComponentDefinition {
  type: string;
  name: string;
  category: 'header' | 'content' | 'social_proof' | 'commerce' | 'conversion';
  icon: string;
  description: string;
  defaultSettings: Record<string, any>;
  fields: BlockFieldSchema[];
  renderHtml: (settings: Record<string, any>, context?: { tenant?: any; themeTokens?: any }) => string;
}

export class BlockRegistry {
  private static instance: BlockRegistry;
  private components: Map<string, BlockComponentDefinition> = new Map();

  private constructor() {
    this.registerStandardComponents();
  }

  public static getInstance(): BlockRegistry {
    if (!BlockRegistry.instance) {
      BlockRegistry.instance = new BlockRegistry();
    }
    return BlockRegistry.instance;
  }

  public register(component: BlockComponentDefinition): void {
    this.components.set(component.type, component);
  }

  public get(type: string): BlockComponentDefinition | undefined {
    return this.components.get(type);
  }

  public list(): BlockComponentDefinition[] {
    return Array.from(this.components.values());
  }

  public renderBlock(type: string, settings: Record<string, any>, context?: any): string {
    const comp = this.components.get(type);
    if (!comp) {
      return `<div class="block-fallback">Component <strong>${escapeHtml(type)}</strong> not found in BlockRegistry.</div>`;
    }
    const mergedSettings = { ...comp.defaultSettings, ...settings };
    return comp.renderHtml(mergedSettings, context);
  }

  private registerStandardComponents() {
    // 1. NAVBAR COMPONENT
    this.register({
      type: 'navbar',
      name: 'Navigation Bar',
      category: 'header',
      icon: '🧭',
      description: 'Brand logo, menu links, CTA action button, and login portal link.',
      defaultSettings: {
        brandName: 'LIORAMEDIA',
        logoInitial: 'L',
        links: [
          { label: 'Capabilities', url: '#features' },
          { label: 'Case Studies', url: '#cms' },
          { label: 'Pricing', url: '#pricing' },
          { label: 'Contact', url: '#contact' },
        ],
        ctaText: 'Sign In / Portal',
        ctaUrl: '/login',
      },
      fields: [
        { name: 'brandName', label: 'Brand Logo Text', type: 'text', defaultValue: 'ETHENENGINE' },
        { name: 'logoInitial', label: 'Logo Badge Letter', type: 'text', defaultValue: 'E' },
        { name: 'ctaText', label: 'Navbar CTA Button', type: 'text', defaultValue: 'Sign In' },
        { name: 'ctaUrl', label: 'Navbar CTA Link', type: 'text', defaultValue: '/login' },
      ],
      renderHtml: (s) => `
        <header class="block-navbar">
          <div class="block-navbar__brand">
            <div class="block-navbar__logo-badge brand-icon">${escapeHtml(s.logoInitial || 'E')}</div>
            <span class="block-navbar__title">${escapeHtml(s.brandName || 'ETHENENGINE')}</span>
          </div>
          <nav class="block-navbar__nav nav-menu">
            ${(s.links || []).map((l: any) => `<a href="${escapeHtml(l.url)}" class="block-navbar__link">${escapeHtml(l.label)}</a>`).join('')}
            <a href="${escapeHtml(s.ctaUrl || '/login')}" class="btn">${escapeHtml(s.ctaText || 'Sign In')}</a>
          </nav>
        </header>
      `,
    });

    // 2. ANNOUNCEMENT TOP BAR
    this.register({
      type: 'announcement_bar',
      name: 'Announcement Top Bar',
      category: 'header',
      icon: '📢',
      description: 'Top promotional ticker for holiday greetings, flash discounts, or press announcements.',
      defaultSettings: {
        message: '🎉 Limited Time Offer: Save 20% on all enterprise subscriptions this week!',
        badgeText: 'SPECIAL',
        linkText: 'Claim Deal →',
        linkUrl: '#pricing',
      },
      fields: [
        { name: 'message', label: 'Ticker Message', type: 'text', defaultValue: 'Special Announcement' },
        { name: 'badgeText', label: 'Badge Label', type: 'text', defaultValue: 'NEW' },
        { name: 'linkText', label: 'Link Text', type: 'text', defaultValue: 'Learn More →' },
        { name: 'linkUrl', label: 'Link Destination', type: 'text', defaultValue: '/' },
      ],
      renderHtml: (s) => `
        <div class="block-announcement">
          <span class="block-announcement__badge">${escapeHtml(s.badgeText || 'SALE')}</span>
          <span>${escapeHtml(s.message)}</span>
          <a href="${escapeHtml(s.linkUrl || '/')}" class="block-announcement__link">${escapeHtml(s.linkText || 'View')}</a>
        </div>
      `,
    });

function parseVideoEmbedHtml(url: string, settings: any = {}): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const autoplay = !!settings.autoplay;
  const muted = !!settings.muted || autoplay;
  const loop = !!settings.loop;
  const controls = settings.controls !== false;
  const poster = settings.posterUrl ? escapeHtml(settings.posterUrl) : '';

  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (muted) params.set('mute', '1');
    if (loop) {
      params.set('loop', '1');
      params.set('playlist', id);
    }
    if (!controls) params.set('controls', '0');
    params.set('rel', '0');
    return `<iframe src="https://www.youtube.com/embed/${id}?${params.toString()}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"></iframe>`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (muted) params.set('muted', '1');
    if (loop) params.set('loop', '1');
    return `<iframe src="https://player.vimeo.com/video/${id}?${params.toString()}" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"></iframe>`;
  }

  // Direct MP4 / WebM / HTML5 video
  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('data:video') || trimmed.includes('/uploads/');
  if (isDirect || !trimmed.startsWith('http')) {
    return `<video src="${escapeHtml(trimmed)}" ${controls ? 'controls' : ''} ${autoplay ? 'autoplay' : ''} ${muted ? 'muted' : ''} ${loop ? 'loop' : ''} ${poster ? `poster="${poster}"` : ''} playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;"></video>`;
  }

  // Fallback generic iframe
  return `<iframe src="${escapeHtml(trimmed)}" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"></iframe>`;
}

    // 3. HERO SECTION
    this.register({
      type: 'hero',
      name: 'Hero Section',
      category: 'header',
      icon: '⚡',
      description: 'High-impact headline, subtitle, primary/secondary action buttons, and media showcase.',
      defaultSettings: {
        title: 'Empower Your Business Velocity',
        subtitle: 'The unified multi-tenant operating system for enterprise commerce, CRM, and publishing.',
        badgeText: '⚡ NEXT-GEN V2.0',
        ctaText: 'Get Started Today',
        ctaUrl: '#pricing',
        secondaryCtaText: 'Learn More →',
        secondaryCtaUrl: '#features',
        imageUrl: '',
        imageAlt: 'Platform Interface Showcase',
      },
      fields: [
        { name: 'title', label: 'Headline Title', type: 'text', defaultValue: 'Hero Headline' },
        { name: 'subtitle', label: 'Subtitle Description', type: 'textarea', defaultValue: 'Hero subtitle text description.' },
        { name: 'badgeText', label: 'Eyebrow Badge Text', type: 'text', defaultValue: '⚡ NEXT-GEN' },
        { name: 'ctaText', label: 'Primary CTA Text', type: 'text', defaultValue: 'Get Started' },
        { name: 'ctaUrl', label: 'Primary CTA Link', type: 'text', defaultValue: '#pricing' },
        { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', defaultValue: 'Learn More →' },
        { name: 'secondaryCtaUrl', label: 'Secondary CTA Link', type: 'text', defaultValue: '#features' },
        { name: 'imageUrl', label: 'Mockup / Image URL', type: 'text', defaultValue: '' },
      ],
      renderHtml: (s) => `
        <section class="block-hero">
          ${s.badgeText ? `<div style="margin-bottom:1rem;"><span class="badge" style="background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); font-weight:800; padding:0.35rem 0.85rem; border-radius:999px; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.5px;">${escapeHtml(s.badgeText)}</span></div>` : ''}
          <h1 class="block-hero__title">${escapeHtml(s.title)}</h1>
          <p class="block-hero__subtitle">${escapeHtml(s.subtitle)}</p>
          <div class="block-hero__actions" style="display:flex; justify-content:center; align-items:center; gap:0.85rem; flex-wrap:wrap; margin-top:1.5rem;">
            <a href="${escapeHtml(s.ctaUrl || '/')}" class="btn" style="padding:0.75rem 1.75rem; font-weight:800;">${escapeHtml(s.ctaText || 'Get Started')}</a>
            ${s.secondaryCtaText ? `<a href="${escapeHtml(s.secondaryCtaUrl || '#')}" class="btn btn-secondary" style="padding:0.75rem 1.5rem; font-weight:700;">${escapeHtml(s.secondaryCtaText)}</a>` : ''}
          </div>
          ${s.imageUrl ? `
            <div style="margin-top:2.5rem; max-width:820px; margin-left:auto; margin-right:auto; border-radius:var(--radius, 12px); overflow:hidden; border:1px solid rgba(255,255,255,0.12); box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
              <img src="${escapeHtml(s.imageUrl)}" alt="${escapeHtml(s.imageAlt || 'Hero visual')}" style="width:100%; height:auto; display:block;" />
            </div>
          ` : ''}
        </section>
      `,
    });

    // 4. FEATURES GRID
    this.register({
      type: 'features',
      name: 'Features Grid',
      category: 'content',
      icon: '✨',
      description: 'Multi-column card layout displaying platform features or value props.',
      defaultSettings: {
        title: 'Built for Unrivaled Performance',
        items: [
          { name: 'Zero-Knowledge Security', desc: 'Per-tenant PBKDF2 AES-256-GCM field encryption isolated across all databases.' },
          { name: 'Visual No-Code Builder', desc: 'Compose dynamic layouts and publishing portals with instant live preview.' },
          { name: 'Multi-Warehouse Inventory', desc: 'Real-time stock tracking, bin/aisle coordinates, and low stock reorder triggers.' },
          { name: 'Sub-5ms Rust Microservices', desc: 'Tokio/Axum powered vector search and real-time image processing.' },
        ],
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Core Capabilities' },
        { name: 'items', label: 'Feature Cards', type: 'items_array', defaultValue: [] },
      ],
      renderHtml: (s) => `
        <section class="block-features">
          <h2 class="block-features__title">${escapeHtml(s.title)}</h2>
          <div class="block-features__grid">
            ${(s.items || []).map((item: any) => `
              <div class="glass-panel block-features__card">
                <div class="block-features__card-title">${escapeHtml(item.name)}</div>
                <p class="block-features__card-desc">${escapeHtml(item.desc)}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `,
    });

    // 5. STATS & METRICS
    this.register({
      type: 'stats',
      name: 'Stats & Metrics',
      category: 'social_proof',
      icon: '📊',
      description: 'Key performance indicators and trust numbers.',
      defaultSettings: {
        stat1Val: '99.99%',
        stat1Label: 'Uptime SLA',
        stat2Val: '< 3ms',
        stat2Label: 'Rust Latency',
        stat3Val: '100%',
        stat3Label: 'Zero-Knowledge Isolation',
      },
      fields: [
        { name: 'stat1Val', label: 'Stat 1 Value', type: 'text', defaultValue: '99.99%' },
        { name: 'stat1Label', label: 'Stat 1 Label', type: 'text', defaultValue: 'Uptime SLA' },
        { name: 'stat2Val', label: 'Stat 2 Value', type: 'text', defaultValue: '< 3ms' },
        { name: 'stat2Label', label: 'Stat 2 Label', type: 'text', defaultValue: 'Edge Latency' },
        { name: 'stat3Val', label: 'Stat 3 Value', type: 'text', defaultValue: '100%' },
        { name: 'stat3Label', label: 'Stat 3 Label', type: 'text', defaultValue: 'Zero-Knowledge' },
      ],
      renderHtml: (s) => `
        <section class="block-stats">
          <div class="glass-panel block-stats__item">
            <div class="block-stats__value">${escapeHtml(s.stat1Val)}</div>
            <div class="block-stats__label">${escapeHtml(s.stat1Label)}</div>
          </div>
          <div class="glass-panel block-stats__item">
            <div class="block-stats__value block-stats__value--secondary">${escapeHtml(s.stat2Val)}</div>
            <div class="block-stats__label">${escapeHtml(s.stat2Label)}</div>
          </div>
          <div class="glass-panel block-stats__item">
            <div class="block-stats__value block-stats__value--accent">${escapeHtml(s.stat3Val)}</div>
            <div class="block-stats__label">${escapeHtml(s.stat3Label)}</div>
          </div>
        </section>
      `,
    });

    // 6. PRODUCT / COMMERCE CATALOG SHOWCASE
    this.register({
      type: 'product_grid',
      name: 'Product Showcase',
      category: 'commerce',
      icon: '🛍️',
      description: 'E-commerce product cards with inventory tags, prices, and instant cart actions.',
      defaultSettings: {
        title: 'Featured Store Merchandise',
        subtitle: 'Shipped instantly across all distributed warehouse facilities.',
        items: [
          { name: '8K Volumetric Stage Pass', price: 499, tag: 'IN STOCK', image: '🎬' },
          { name: 'Procedural VFX Master Suite', price: 249, tag: 'DIGITAL', image: '💎' },
          { name: 'Unreal Engine Virtual Asset Pack', price: 89, tag: 'BESTSELLER', image: '📦' },
        ],
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Products & Store' },
        { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Explore merchandise.' },
      ],
      renderHtml: (s) => `
        <section class="block-products">
          <div class="block-products__header">
            <h2 class="block-products__title">${escapeHtml(s.title)}</h2>
            <p class="block-products__subtitle">${escapeHtml(s.subtitle || '')}</p>
          </div>
          <div class="block-products__grid">
            ${(s.items || []).map((item: any, itemIdx: number) => `
              <div class="glass-panel block-products__card">
                <div>
                  <div class="block-products__card-img">${escapeHtml(item.image || '📦')}</div>
                  <div class="block-products__card-tag">${escapeHtml(item.tag || 'AVAILABLE')}</div>
                  <div class="block-products__card-name">${escapeHtml(item.name)}</div>
                </div>
                <div class="block-products__card-footer">
                  <span class="block-products__card-price">$${escapeHtml(String(item.price))}</span>
                  <button onclick="window.addToStoreCart && window.addToStoreCart('${escapeHtml(item.name)}', ${Number(item.price) || 99})" class="btn" style="padding:0.35rem 0.85rem; font-size:0.8rem; font-weight:700; cursor:pointer;">🛍️ Add to Cart</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `,
    });

    // 7. PRICING TIERS
    this.register({
      type: 'pricing',
      name: 'Pricing Plans & Comparison',
      category: 'commerce',
      icon: '💎',
      description: 'Multi-tier pricing comparison cards with feature checkmarks, badges, and CTA buttons.',
      defaultSettings: {
        title: 'Simple, Transparent Enterprise Pricing',
        subtitle: 'Scale smoothly with predictable pricing. No hidden fees or lock-ins.',
        currency: '$',
        billingPeriod: '/month',
        tiers: [
          {
            name: 'Starter Tier',
            price: '29',
            period: '/mo',
            badge: '',
            description: 'Essential tools for indie builders and creators.',
            features: ['Single Tenant Workspace', 'Up to 10 Pages & Blocks', 'Standard Analytics Feed', 'Community Support'],
            ctaText: 'Start Free Trial',
            ctaUrl: '/login',
            isHighlighted: false,
          },
          {
            name: 'Professional Business',
            price: '99',
            period: '/mo',
            badge: 'MOST POPULAR',
            description: 'Powerful multi-org capabilities for fast-scaling companies.',
            features: ['Up to 5 Multi-Org Workspaces', 'Unlimited Dynamic Blocks & CMS', 'Zero-Knowledge Security Vault', 'Real-Time Collab Sync', 'Priority 24/7 Support'],
            ctaText: 'Deploy Pro Tier',
            ctaUrl: '/login',
            isHighlighted: true,
          },
          {
            name: 'Enterprise Sovereign',
            price: '299',
            period: '/mo',
            badge: 'BEST VALUE',
            description: 'Dedicated infrastructure, custom SLAs, and infinite multi-tenancy.',
            features: ['Infinite Tenant Provisioning', 'Multi-Warehouse ERP Logistics', 'Custom Domain & SSL Gateway', 'Sentinel Auto-Healing Watchdog', 'Dedicated Account Architect'],
            ctaText: 'Talk to Solutions Team',
            ctaUrl: '/login',
            isHighlighted: false,
          },
        ],
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Pricing Plans' },
        { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Predictable pricing for every business scale.' },
        { name: 'currency', label: 'Currency Symbol', type: 'text', defaultValue: '$' },
        { name: 'billingPeriod', label: 'Billing Cycle Text', type: 'text', defaultValue: '/month' },
      ],
      renderHtml: (s) => {
        const currency = s.currency || '$';
        const tiers = Array.isArray(s.tiers) && s.tiers.length > 0 ? s.tiers : [
          {
            name: s.planName || 'Enterprise Cloud',
            price: s.price || '99',
            period: s.billingPeriod || '/mo',
            badge: 'POPULAR',
            description: 'Unified multi-tenant operating system.',
            features: ['Zero-Knowledge Cryptography', 'Visual Website Builder', 'CRM & Commerce Sync'],
            ctaText: 'Select Plan',
            ctaUrl: '/login',
            isHighlighted: true,
          }
        ];

        return `
          <section class="block-pricing" style="padding:clamp(2.5rem,5vw,4.5rem) 1.5rem; max-width:1160px; margin:0 auto;">
            <div style="text-align:center; margin-bottom:2.5rem;">
              <h2 class="block-pricing__title" style="font-size:clamp(1.6rem,3.2vw,2.4rem); font-weight:900; color:#fff; margin:0 0 0.5rem; letter-spacing:-0.02em;">${escapeHtml(s.title || 'Transparent Pricing')}</h2>
              <p style="color:#94a3b8; font-size:clamp(0.9rem,1.2vw,1.05rem); max-width:620px; margin:0 auto; line-height:1.5;">${escapeHtml(s.subtitle || '')}</p>
            </div>
            
            <div class="block-pricing__grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.75rem; align-items:stretch;">
              ${tiers.map((t: any) => {
                const isHigh = Boolean(t.isHighlighted);
                const feats = Array.isArray(t.features) ? t.features : String(t.features || '').split('\n').filter(Boolean);
                return `
                  <div class="block-pricing__card glass-panel" style="background:${isHigh ? 'linear-gradient(180deg,rgba(99,102,241,0.14),rgba(15,23,42,0.85))' : 'rgba(15,23,42,0.6)'}; border:${isHigh ? '2px solid var(--color-primary,#6366f1)' : '1px solid rgba(255,255,255,0.08)'}; border-radius:var(--radius, 14px); padding:2rem 1.75rem; display:flex; flex-direction:column; justify-content:space-between; position:relative; box-shadow:${isHigh ? '0 20px 40px -10px rgba(99,102,241,0.3)' : '0 10px 25px -5px rgba(0,0,0,0.5)'};">
                    ${t.badge ? `<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,var(--color-primary,#6366f1),var(--color-secondary,#a855f7)); color:#fff; font-size:0.68rem; font-weight:800; padding:0.2rem 0.75rem; border-radius:999px; letter-spacing:0.05em; text-transform:uppercase; box-shadow:0 4px 12px rgba(99,102,241,0.4);">${escapeHtml(t.badge)}</div>` : ''}
                    <div>
                      <div style="font-size:1.15rem; font-weight:800; color:#fff; margin-bottom:0.35rem;">${escapeHtml(t.name || 'Tier Plan')}</div>
                      <p style="color:#94a3b8; font-size:0.8rem; line-height:1.4; margin-bottom:1.25rem; min-height:2.4em;">${escapeHtml(t.description || '')}</p>
                      <div style="display:flex; align-items:baseline; gap:0.25rem; margin-bottom:1.5rem; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:1.25rem;">
                        <span style="font-size:1.4rem; font-weight:700; color:#94a3b8;">${escapeHtml(currency)}</span>
                        <span style="font-size:2.8rem; font-weight:900; color:#34d399; letter-spacing:-0.03em;">${escapeHtml(String(t.price || '0'))}</span>
                        <span style="font-size:0.85rem; color:#94a3b8; font-weight:500;">${escapeHtml(t.period || s.billingPeriod || '/mo')}</span>
                      </div>
                      <ul style="list-style:none; padding:0; margin:0 0 1.5rem; display:flex; flex-direction:column; gap:0.65rem;">
                        ${feats.map((f: string) => `
                          <li style="display:flex; align-items:flex-start; gap:0.6rem; font-size:0.85rem; color:#e2e8f0; line-height:1.4;">
                            <span style="color:#34d399; font-weight:900; font-size:0.95rem; line-height:1.2;">✓</span>
                            <span>${escapeHtml(String(f).trim())}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                    <a href="${escapeHtml(t.ctaUrl || '/login')}" class="btn" style="width:100%; box-sizing:border-box; padding:0.75rem; text-align:center; font-weight:800; font-size:0.9rem; background:${isHigh ? 'linear-gradient(135deg,var(--color-primary,#6366f1),var(--color-secondary,#a855f7))' : 'rgba(255,255,255,0.08)'}; border:${isHigh ? 'none' : '1px solid rgba(255,255,255,0.15)'}; border-radius:var(--radius, 8px);">
                      ${escapeHtml(t.ctaText || 'Get Started')}
                    </a>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        `;
      },
    });

    // 8. TESTIMONIALS & SOCIAL PROOF
    this.register({
      type: 'testimonials',
      name: 'Testimonials & Reviews',
      category: 'social_proof',
      icon: '💬',
      description: 'Client reviews, ratings, executive quotes, and endorsements.',
      defaultSettings: {
        title: 'Trusted by Industry Leaders Worldwide',
        subtitle: 'Hear how fast-moving organizations scale their operations with ETHENENGINE.',
        testimonials: [
          {
            quote: 'ETHENENGINE completely transformed our digital architecture with per-tenant zero-knowledge cryptography.',
            author: 'Elena Rostova',
            role: 'VP of Technology',
            company: 'Nexus Media Labs',
            rating: 5,
            avatarEmoji: '👩‍💼',
          },
          {
            quote: 'The sub-5ms Bun execution and multi-warehouse logistics gave our enterprise an undeniable competitive edge.',
            author: 'Marcus Vance',
            role: 'Chief Technology Officer',
            company: 'HyperScale Systems',
            rating: 5,
            avatarEmoji: '👨‍💻',
          },
          {
            quote: 'Provisioning isolated multi-tenant workspaces in seconds with real-time live preview is pure magic.',
            author: 'Sarah Lin',
            role: 'Lead Solutions Architect',
            company: 'Vertex Digital Agency',
            rating: 5,
            avatarEmoji: '🚀',
          },
        ],
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Trusted by Leaders' },
        { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Verified customer feedback.' },
      ],
      renderHtml: (s) => {
        const list = Array.isArray(s.testimonials) && s.testimonials.length > 0 ? s.testimonials : [
          {
            quote: s.quote || 'ETHENENGINE completely transformed our digital architecture.',
            author: s.author || 'Lead Architect',
            role: 'Enterprise Client',
            company: 'Global SaaS',
            rating: 5,
            avatarEmoji: '⭐',
          }
        ];

        return `
          <section class="block-testimonial" style="padding:clamp(2.5rem,5vw,4.5rem) 1.5rem; max-width:1160px; margin:0 auto;">
            <div style="text-align:center; margin-bottom:2.5rem;">
              <h2 style="font-size:clamp(1.6rem,3.2vw,2.4rem); font-weight:900; color:#fff; margin:0 0 0.5rem; letter-spacing:-0.02em;">${escapeHtml(s.title || 'Client Testimonials')}</h2>
              <p style="color:#94a3b8; font-size:clamp(0.9rem,1.2vw,1.05rem); max-width:600px; margin:0 auto; line-height:1.5;">${escapeHtml(s.subtitle || '')}</p>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:1.5rem;">
              ${list.map((t: any) => `
                <div class="glass-panel" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius, 12px); padding:1.75rem; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="color:#fbbf24; font-size:1.1rem; margin-bottom:0.75rem; letter-spacing:2px;">${'★'.repeat(Number(t.rating) || 5)}</div>
                    <blockquote style="font-size:0.95rem; color:#e2e8f0; font-style:italic; line-height:1.6; margin:0 0 1.25rem;">"${escapeHtml(t.quote || '')}"</blockquote>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.75rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.85rem;">
                    <div style="font-size:1.6rem; width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.05); display:grid; place-content:center; flex-shrink:0;">${escapeHtml(t.avatarEmoji || '👤')}</div>
                    <div>
                      <div style="font-weight:800; font-size:0.9rem; color:#fff;">${escapeHtml(t.author || 'Anonymous')}</div>
                      <div style="font-size:0.75rem; color:#94a3b8;">${escapeHtml([t.role, t.company].filter(Boolean).join(' · '))}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      },
    });

    // 9. FAQ ACCORDION COMPONENT
    this.register({
      type: 'faq',
      name: 'FAQ Accordion',
      category: 'content',
      icon: '❓',
      description: 'Frequently asked questions with expandable question cards.',
      defaultSettings: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about our multi-tenant platform.',
        faqs: [
          {
            question: 'How does per-tenant zero-knowledge cryptography work?',
            answer: 'Every tenant has an isolated PBKDF2 encryption key derived with SHA-256 and AES-256-GCM. Database records are encrypted at the field level before persistence.',
          },
          {
            question: 'Can I connect custom domains and white-label the storefront?',
            answer: 'Yes, ETHENENGINE supports full custom CNAME routing with automated SSL certificates and dynamic theme token injection per domain.',
          },
          {
            question: 'How does live preview and side-by-side editing sync?',
            answer: 'The studio builder communicates via real-time WebSocket state synchronizers, rendering live changes with sub-millisecond edge latency.',
          },
        ],
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Frequently Asked Questions' },
        { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Find answers to common inquiries.' },
      ],
      renderHtml: (s) => {
        const faqs = Array.isArray(s.faqs) && s.faqs.length > 0 ? s.faqs : [];
        return `
          <section class="block-faq" style="padding:clamp(2.5rem,5vw,4.5rem) 1.5rem; max-width:860px; margin:0 auto;">
            <div style="text-align:center; margin-bottom:2.25rem;">
              <h2 style="font-size:clamp(1.6rem,3.2vw,2.4rem); font-weight:900; color:#fff; margin:0 0 0.5rem; letter-spacing:-0.02em;">${escapeHtml(s.title || 'FAQ')}</h2>
              <p style="color:#94a3b8; font-size:clamp(0.9rem,1.2vw,1.05rem); max-width:580px; margin:0 auto; line-height:1.5;">${escapeHtml(s.subtitle || '')}</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${faqs.map((f: any, idx: number) => `
                <details class="glass-panel" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius, 10px); padding:1rem 1.25rem; cursor:pointer;" ${idx === 0 ? 'open' : ''}>
                  <summary style="font-weight:700; font-size:1rem; color:#fff; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                    <span>${escapeHtml(f.question || 'Question')}</span>
                    <span style="color:var(--color-primary,#6366f1); font-weight:900; font-size:1.1rem; margin-left:0.5rem;">▾</span>
                  </summary>
                  <p style="margin-top:0.75rem; font-size:0.9rem; color:#94a3b8; line-height:1.6; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.75rem;">
                    ${escapeHtml(f.answer || '')}
                  </p>
                </details>
              `).join('')}
            </div>
          </section>
        `;
      },
    });

    // 9. CMS FEED
    this.register({
      type: 'cms_feed',
      name: 'Headless CMS Feed',
      category: 'content',
      icon: '📝',
      description: 'Dynamic blog articles, press releases, or case studies.',
      defaultSettings: {
        title: 'Latest Publications & Case Studies',
        contentTypeSlug: 'blog-article',
        limit: 3,
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Latest Case Studies' },
        { name: 'contentTypeSlug', label: 'Content Type Slug', type: 'text', defaultValue: 'blog-article' },
      ],
      renderHtml: (s) => `
        <section class="block-cms">
          <div class="block-cms__header">
            <h2 class="block-cms__title">${escapeHtml(s.title)}</h2>
            <span class="badge" style="background:rgba(168,85,247,0.15); color:#d8b4fe; border:1px solid rgba(168,85,247,0.3);">Headless CMS Feed</span>
          </div>
          <div class="block-cms__grid">
            <div class="glass-panel block-cms__card">
              <div class="block-cms__card-category">CASE STUDY · ARCHITECTURE</div>
              <div class="block-cms__card-heading">Multi-Tenant Zero-Knowledge Data Isolation</div>
              <p class="block-cms__card-summary">In-depth technical review of per-tenant PBKDF2 AES-256-GCM key derivation.</p>
            </div>
            <div class="glass-panel block-cms__card">
              <div class="block-cms__card-category">RELEASE · VELOCITY</div>
              <div class="block-cms__card-heading">Real-Time Multi-Warehouse Inventory Subsystems</div>
              <p class="block-cms__card-summary">Automating inter-warehouse transfer orders and bin coordinate mapping.</p>
            </div>
          </div>
        </section>
      `,
    });

    // 10. CALL TO ACTION BANNER
    this.register({
      type: 'cta',
      name: 'Call to Action',
      category: 'conversion',
      icon: '🎯',
      description: 'Full-width gradient callout banner with conversion action.',
      defaultSettings: {
        headline: 'Ready to Transform Your Digital Architecture?',
        buttonText: 'Get Started with ETHENENGINE',
        buttonUrl: '/login',
      },
      fields: [
        { name: 'headline', label: 'Banner Headline', type: 'text', defaultValue: 'Ready to Get Started?' },
        { name: 'buttonText', label: 'Button Label', type: 'text', defaultValue: 'Start Free Trial' },
        { name: 'buttonUrl', label: 'Button Link URL', type: 'text', defaultValue: '/login' },
      ],
      renderHtml: (s) => `
        <section class="block-cta">
          <div class="block-cta__container">
            <h2 class="block-cta__headline">${escapeHtml(s.headline)}</h2>
            <a href="${escapeHtml(s.buttonUrl || '/login')}" class="btn" style="padding:0.85rem 2.25rem; font-size:1.1rem; font-weight:700;">${escapeHtml(s.buttonText)}</a>
          </div>
        </section>
      `,
    });

    // 11. FOOTER & COPYRIGHT
    this.register({
      type: 'footer',
      name: 'Site Footer',
      category: 'conversion',
      icon: '⚓',
      description: 'Bottom navigation links, social badges, newsletter subscription, and copyright notice.',
      defaultSettings: {
        brandName: 'LIORAMEDIA',
        copyrightText: '© 2026 ETHENENGINE All rights reserved. Zero-knowledge cryptographic architecture.',
        col1Title: 'Platform',
        col1Links: ['Virtual Production', 'Zero-Knowledge Security', 'Multi-Warehouse ERP'],
        col2Title: 'Company',
        col2Links: ['About Us', 'Case Studies', 'Security Whitepaper'],
      },
      fields: [
        { name: 'brandName', label: 'Brand Footer Text', type: 'text', defaultValue: 'ETHENENGINE' },
        { name: 'copyrightText', label: 'Copyright Notice', type: 'text', defaultValue: '© 2026 All Rights Reserved.' },
      ],
      renderHtml: (s) => `
        <footer class="block-footer">
          <div class="block-footer__grid">
            <div>
              <div class="block-footer__brand">${escapeHtml(s.brandName || 'ETHENENGINE')}</div>
              <p class="block-footer__brand-tagline">Enterprise modular business operating system with verified tenant isolation.</p>
            </div>
            <div>
              <div class="block-footer__col-title">${escapeHtml(s.col1Title || 'Solutions')}</div>
              <ul class="block-footer__list">
                ${(s.col1Links || ['Capabilities', 'Security']).map((l: string) => `<li><a href="#" class="block-footer__link">${escapeHtml(l)}</a></li>`).join('')}
              </ul>
            </div>
            <div>
              <div class="block-footer__col-title">${escapeHtml(s.col2Title || 'Enterprise')}</div>
              <ul class="block-footer__list">
                ${(s.col2Links || ['Privacy', 'Docs']).map((l: string) => `<li><a href="#" class="block-footer__link">${escapeHtml(l)}</a></li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="block-footer__copyright">
            ${escapeHtml(s.copyrightText)}
          </div>
        </footer>
      `,
    });

    // 12. PAGINATION CONTROLS & MANAGER
    this.register({
      type: 'pagination',
      name: 'Pagination Manager',
      category: 'content',
      icon: '🔢',
      description: 'Dynamic page numbering, next/prev controls, item counter, and query parameter manager.',
      defaultSettings: {
        totalPages: 5,
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 60,
        prevText: '← Previous',
        nextText: 'Next →',
        firstText: '« First',
        lastText: 'Last »',
        showFirstLast: true,
        layout: 'pills',
        baseUrl: '?page=',
        align: 'center',
      },
      fields: [
        { name: 'totalPages', label: 'Total Pages Count', type: 'number', defaultValue: 5 },
        { name: 'currentPage', label: 'Active Page Number', type: 'number', defaultValue: 1 },
        { name: 'prevText', label: 'Previous Button Text', type: 'text', defaultValue: '← Previous' },
        { name: 'nextText', label: 'Next Button Text', type: 'text', defaultValue: 'Next →' },
        { name: 'baseUrl', label: 'URL Query / Target Route', type: 'text', defaultValue: '?page=' },
        { name: 'layout', label: 'Pagination Style', type: 'select', defaultValue: 'pills', options: [
          { label: 'Numbered Pills (Glow Active)', value: 'pills' },
          { label: 'Button Group', value: 'buttons' },
          { label: 'Minimal Summary (Page X of Y)', value: 'minimal' },
        ]},
      ],
      renderHtml: (s) => {
        const total = Math.max(1, Number(s.totalPages || 5));
        const current = Math.max(1, Math.min(total, Number(s.currentPage || 1)));
        const baseUrl = s.baseUrl || '?page=';
        const alignClass = s.align === 'start' ? 'block-pagination--start' : s.align === 'end' ? 'block-pagination--end' : s.align === 'between' ? 'block-pagination--between' : '';
        const prevUrl = `${baseUrl}${Math.max(1, current - 1)}`;
        const nextUrl = `${baseUrl}${Math.min(total, current + 1)}`;

        const cls = alignClass ? `block-pagination ${alignClass}` : 'block-pagination';

        if (s.layout === 'minimal') {
          return `
            <div class="${cls}">
              <a href="${escapeHtml(prevUrl)}" class="btn btn-secondary" style="font-size:0.85rem; padding:0.45rem 1rem;">${escapeHtml(s.prevText || '← Previous')}</a>
              <span class="block-pagination__info">Page <strong style="color:#fff;">${current}</strong> of <strong style="color:#fff;">${total}</strong></span>
              <a href="${escapeHtml(nextUrl)}" class="btn btn-secondary" style="font-size:0.85rem; padding:0.45rem 1rem;">${escapeHtml(s.nextText || 'Next →')}</a>
            </div>
          `;
        }

        return `
          <div class="${cls}">
            ${s.showFirstLast && total > 3 ? `<a href="${escapeHtml(`${baseUrl}1`)}" class="btn btn-secondary" style="font-size:0.85rem; padding:0.45rem 0.85rem;">${escapeHtml(s.firstText || '« First')}</a>` : ''}
            <a href="${escapeHtml(prevUrl)}" class="btn btn-secondary" style="font-size:0.85rem; padding:0.45rem 1rem;">${escapeHtml(s.prevText || '← Previous')}</a>
            ${Array.from({ length: total }, (_, i) => i + 1).map(p => `
              <a href="${escapeHtml(`${baseUrl}${p}`)}" class="btn block-pagination__pill ${p === current ? 'block-pagination__pill--active' : 'btn-secondary'}">${p}</a>
            `).join('')}
            <a href="${escapeHtml(nextUrl)}" class="btn btn-secondary" style="font-size:0.85rem; padding:0.45rem 1rem;">${escapeHtml(s.nextText || 'Next →')}</a>
            ${s.showFirstLast && total > 3 ? `<a href="${escapeHtml(`${baseUrl}${total}`)}" class="btn btn-secondary" style="font-size:0.85rem; padding:0.45rem 0.85rem;">${escapeHtml(s.lastText || 'Last »')}</a>` : ''}
          </div>
        `;
      },
    });

    // 13. INTERACTIVE FORM BUILDER & LEAD CAPTURE
    this.register({
      type: 'form_builder',
      name: 'Lead Capture Form',
      category: 'conversion',
      icon: '📋',
      description: 'Customizable multi-field inquiry and lead capture forms that synchronize directly into the CRM pipeline.',
      defaultSettings: {
        title: 'Request Enterprise Demo & Consultation',
        subtitle: 'Connect directly with our solutions architecture team.',
        buttonText: 'Submit Inquiry',
        companyField: true,
        phoneField: true,
        budgetField: true,
      },
      fields: [
        { name: 'title', label: 'Form Headline', type: 'text', defaultValue: 'Get in Touch' },
        { name: 'subtitle', label: 'Form Subtitle', type: 'textarea', defaultValue: 'Fill out the form below.' },
        { name: 'buttonText', label: 'Submit Button Label', type: 'text', defaultValue: 'Send Message' },
      ],
      renderHtml: (s) => `
        <section class="block-form-builder" style="padding:3.5rem 1.5rem; max-width:680px; margin:0 auto;">
          <div class="glass-panel" style="padding:2.25rem; border-radius:var(--border-radius, 12px); border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.65); box-shadow:0 20px 40px -15px rgba(0,0,0,0.6);">
            <div style="text-align:center; margin-bottom:1.75rem;">
              <h2 style="font-size:1.6rem; font-weight:800; color:#fff; margin:0 0 0.4rem; letter-spacing:-0.02em;">${escapeHtml(s.title || 'Contact Us')}</h2>
              <p style="color:#94a3b8; font-size:0.9rem; margin:0; line-height:1.4;">${escapeHtml(s.subtitle || '')}</p>
            </div>
            
            <form onsubmit="window.handleFormSubmit && window.handleFormSubmit(event)" style="display:flex; flex-direction:column; gap:1rem;">
              <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;">
                <div>
                  <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Full Name *</label>
                  <input name="contactName" required placeholder="Jane Doe" style="width:100%; box-sizing:border-box; background:#070a14; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:0.6rem 0.85rem; color:#fff; font-size:0.88rem; outline:none;" />
                </div>
                <div>
                  <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Work Email *</label>
                  <input name="email" type="email" required placeholder="jane@company.com" style="width:100%; box-sizing:border-box; background:#070a14; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:0.6rem 0.85rem; color:#fff; font-size:0.88rem; outline:none;" />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;">
                <div>
                  <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Company Name</label>
                  <input name="company" placeholder="Acme Inc." style="width:100%; box-sizing:border-box; background:#070a14; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:0.6rem 0.85rem; color:#fff; font-size:0.88rem; outline:none;" />
                </div>
                <div>
                  <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Estimated Budget</label>
                  <select name="dealValue" style="width:100%; box-sizing:border-box; background:#070a14; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:0.6rem 0.85rem; color:#fff; font-size:0.88rem; outline:none;">
                    <option value="10000">$10k - $25k</option>
                    <option value="50000" selected>$50k - $100k</option>
                    <option value="250000">$250k+ Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.35rem;">Project Requirements</label>
                <textarea name="notes" rows="3" placeholder="Describe your technical objectives and timeline..." style="width:100%; box-sizing:border-box; background:#070a14; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:0.6rem 0.85rem; color:#fff; font-size:0.88rem; outline:none; resize:vertical;"></textarea>
              </div>

              <button type="submit" class="btn" style="width:100%; padding:0.75rem; font-weight:800; font-size:0.95rem; background:linear-gradient(135deg,var(--color-primary,#6366f1),var(--color-secondary,#a855f7)); border-radius:8px; margin-top:0.5rem; cursor:pointer;">
                ${escapeHtml(s.buttonText || 'Submit Inquiry')}
              </button>
            </form>
          </div>
        </section>
      `,
    });

    // 14. UNIVERSAL VIDEO PLAYER & EMBED
    this.register({
      type: 'video_player',
      name: 'Video Player / Embed',
      category: 'content',
      icon: '🎬',
      description: 'Responsive video player for YouTube, Vimeo, and direct MP4/WebM video streams with custom controls and poster.',
      defaultSettings: {
        title: 'Platform Architecture Deep Dive',
        caption: 'Watch the full walkthrough of our zero-knowledge multi-tenant runtime engine.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        posterUrl: '',
        aspectRatio: '16-9',
        maxWidth: '900px',
        autoplay: false,
        muted: true,
        loop: false,
        controls: true,
      },
      fields: [
        { name: 'title', label: 'Video Title (Optional)', type: 'text', defaultValue: 'Video Title' },
        { name: 'caption', label: 'Video Caption / Subtitle', type: 'textarea', defaultValue: 'Video description or notes.' },
        { name: 'videoUrl', label: 'Video URL (YouTube, Vimeo, MP4)', type: 'text', defaultValue: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { name: 'posterUrl', label: 'Thumbnail / Poster Image URL', type: 'text', defaultValue: '' },
        { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', defaultValue: '16-9', options: [
          { label: 'Widescreen (16:9)', value: '16-9' },
          { label: 'Cinematic Ultrawide (21:9)', value: '21-9' },
          { label: 'Classic TV (4:3)', value: '4-3' },
          { label: 'Square (1:1)', value: '1-1' },
        ]},
        { name: 'maxWidth', label: 'Container Width', type: 'select', defaultValue: '900px', options: [
          { label: 'Standard Container (900px)', value: '900px' },
          { label: 'Wide Container (1100px)', value: '1100px' },
          { label: 'Compact Box (680px)', value: '680px' },
          { label: 'Full Width (100%)', value: '100%' },
        ]},
      ],
      renderHtml: (s) => {
        const ratioClass = `block-video__ratio-${s.aspectRatio || '16-9'}`;
        const maxW = s.maxWidth || '900px';
        const embedHtml = parseVideoEmbedHtml(s.videoUrl || '', s);

        return `
          <section class="block-video" style="max-width:${maxW};">
            ${s.title ? `
              <div class="block-video__header">
                <h2 class="block-video__title">${escapeHtml(s.title)}</h2>
              </div>
            ` : ''}
            <div class="block-video__container ${ratioClass}">
              ${embedHtml || '<div style="position:absolute; inset:0; display:grid; place-content:center; color:#64748b; font-size:0.9rem;">No video URL specified</div>'}
            </div>
            ${s.caption ? `<p class="block-video__caption">${escapeHtml(s.caption)}</p>` : ''}
          </section>
        `;
      },
    });

    // 15. IMAGE SHOWCASE & BANNER
    this.register({
      type: 'image_showcase',
      name: 'Image Banner & Showcase',
      category: 'content',
      icon: '🖼️',
      description: 'Single high-impact responsive image card with clickable link destination, badge, and gradient overlay caption.',
      defaultSettings: {
        title: 'Next-Gen Cloud Dashboard Experience',
        caption: 'Engineered for extreme performance, cryptographic data isolation, and instant real-time telemetry.',
        badgeText: 'PRODUCT HIGHLIGHT',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
        altText: 'Interactive Analytics Dashboard UI',
        linkUrl: '#pricing',
        maxWidth: '1000px',
        hasOverlay: true,
      },
      fields: [
        { name: 'imageUrl', label: 'Image URL', type: 'text', defaultValue: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80' },
        { name: 'altText', label: 'Alt Text (Accessibility)', type: 'text', defaultValue: 'Product showcase visual' },
        { name: 'badgeText', label: 'Eyebrow Ribbon Badge', type: 'text', defaultValue: 'NEW RELEASE' },
        { name: 'title', label: 'Image Title / Heading', type: 'text', defaultValue: 'Showcase Heading' },
        { name: 'caption', label: 'Caption Subtitle', type: 'textarea', defaultValue: 'Detailed description of the visual.' },
        { name: 'linkUrl', label: 'Click Destination URL', type: 'text', defaultValue: '#pricing' },
      ],
      renderHtml: (s) => {
        const maxW = s.maxWidth || '1000px';
        const imgTag = `<img src="${escapeHtml(s.imageUrl || '')}" alt="${escapeHtml(s.altText || 'Showcase image')}" class="block-image__img" />`;
        const contentOverlay = (s.hasOverlay !== false && (s.title || s.caption || s.badgeText)) ? `
          <div class="block-image__overlay">
            ${s.badgeText ? `<span class="block-image__badge">${escapeHtml(s.badgeText)}</span>` : ''}
            ${s.title ? `<h3 class="block-image__title">${escapeHtml(s.title)}</h3>` : ''}
            ${s.caption ? `<p class="block-image__caption">${escapeHtml(s.caption)}</p>` : ''}
          </div>
        ` : '';

        const inner = `
          <div class="block-image__card">
            ${imgTag}
            ${contentOverlay}
          </div>
        `;

        if (s.linkUrl) {
          return `
            <section class="block-image" style="max-width:${maxW};">
              <a href="${escapeHtml(s.linkUrl)}" style="display:block; text-decoration:none;">${inner}</a>
            </section>
          `;
        }

        return `
          <section class="block-image" style="max-width:${maxW};">
            ${inner}
          </section>
        `;
      },
    });

    // 16. MULTI-IMAGE GALLERY
    this.register({
      type: 'gallery',
      name: 'Media Gallery Grid',
      category: 'content',
      icon: '📸',
      description: 'Responsive multi-image showcase grid with link triggers, image captions, and column layout controls.',
      defaultSettings: {
        title: 'Platform Visual Portfolio',
        subtitle: 'Explore screenshots, system dashboards, and architectural schematics.',
        columns: '3',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
            alt: 'Financial Analytics Engine',
            title: 'Real-Time Telemetry',
            caption: 'Edge analytics and latency tracing.',
            linkUrl: '#features',
          },
          {
            url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80',
            alt: 'Global Infrastructure Map',
            title: 'Zero-Knowledge Crypto',
            caption: 'Per-tenant PBKDF2 cipher isolation.',
            linkUrl: '#security',
          },
          {
            url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
            alt: 'Collaboration Canvas',
            title: 'Presence Engine',
            caption: 'Live multi-user cursor tracking.',
            linkUrl: '#pricing',
          },
        ],
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Image Gallery' },
        { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Browse our visual showcase.' },
        { name: 'columns', label: 'Grid Columns', type: 'select', defaultValue: '3', options: [
          { label: '2 Columns (Large Cards)', value: '2' },
          { label: '3 Columns (Balanced Grid)', value: '3' },
          { label: '4 Columns (Compact Gallery)', value: '4' },
        ]},
      ],
      renderHtml: (s) => {
        const images = Array.isArray(s.images) && s.images.length > 0 ? s.images : [];
        const colsClass = `block-gallery__grid--cols-${s.columns || '3'}`;

        return `
          <section class="block-gallery">
            <div class="block-gallery__header">
              <h2 class="block-gallery__title">${escapeHtml(s.title || 'Gallery')}</h2>
              ${s.subtitle ? `<p class="block-gallery__subtitle">${escapeHtml(s.subtitle)}</p>` : ''}
            </div>
            <div class="block-gallery__grid ${colsClass}">
              ${images.map((img: any) => {
                const innerCard = `
                  <img src="${escapeHtml(img.url || '')}" alt="${escapeHtml(img.alt || 'Gallery photo')}" class="block-gallery__img" loading="lazy" />
                  ${(img.title || img.caption) ? `
                    <div class="block-gallery__meta">
                      ${img.title ? `<div class="block-gallery__item-title">${escapeHtml(img.title)}</div>` : ''}
                      ${img.caption ? `<div class="block-gallery__item-desc">${escapeHtml(img.caption)}</div>` : ''}
                    </div>
                  ` : ''}
                `;

                if (img.linkUrl) {
                  return `<a href="${escapeHtml(img.linkUrl)}" class="block-gallery__item">${innerCard}</a>`;
                }
                return `<div class="block-gallery__item">${innerCard}</div>`;
              }).join('')}
            </div>
          </section>
        `;
      },
    });
  }
}


