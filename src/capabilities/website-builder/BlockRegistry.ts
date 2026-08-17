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

    // 3. HERO SECTION
    this.register({
      type: 'hero',
      name: 'Hero Section',
      category: 'header',
      icon: '⚡',
      description: 'High-impact headline, subtitle, and primary call-to-action button.',
      defaultSettings: {
        title: 'Empower Your Business Velocity',
        subtitle: 'The unified multi-tenant operating system for enterprise commerce, CRM, and publishing.',
        ctaText: 'Get Started Today',
        ctaUrl: '/',
      },
      fields: [
        { name: 'title', label: 'Headline Title', type: 'text', defaultValue: 'Hero Headline' },
        { name: 'subtitle', label: 'Subtitle Description', type: 'textarea', defaultValue: 'Hero subtitle text description.' },
        { name: 'ctaText', label: 'Button CTA Text', type: 'text', defaultValue: 'Get Started' },
        { name: 'ctaUrl', label: 'Button Link URL', type: 'text', defaultValue: '/' },
      ],
      renderHtml: (s) => `
        <section class="block-hero">
          <h1 class="block-hero__title">${escapeHtml(s.title)}</h1>
          <p class="block-hero__subtitle">${escapeHtml(s.subtitle)}</p>
          <div class="block-hero__actions">
            <a href="${escapeHtml(s.ctaUrl || '/')}" class="btn">${escapeHtml(s.ctaText || 'Get Started')}</a>
          </div>
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
      name: 'Pricing Plans',
      category: 'commerce',
      icon: '💎',
      description: 'Transparent recurring tier cards with highlighted feature lists.',
      defaultSettings: {
        title: 'Predictable Cloud Pricing',
        planName: 'Enterprise Cloud',
        price: '149',
      },
      fields: [
        { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Pricing Plans' },
        { name: 'planName', label: 'Plan Name', type: 'text', defaultValue: 'Enterprise Cloud' },
        { name: 'price', label: 'Monthly Price ($)', type: 'text', defaultValue: '149' },
      ],
      renderHtml: (s) => `
        <section class="block-pricing">
          <h2 class="block-pricing__title">${escapeHtml(s.title)}</h2>
          <div class="block-pricing__card">
            <div class="block-pricing__plan-name">${escapeHtml(s.planName)}</div>
            <div class="block-pricing__price">$${escapeHtml(s.price)}<span class="block-pricing__frequency">/mo</span></div>
            <a href="/login" class="btn" style="display:block; width:100%; box-sizing:border-box;">Select Enterprise Tier</a>
          </div>
        </section>
      `,
    });

    // 8. TESTIMONIALS
    this.register({
      type: 'testimonials',
      name: 'Testimonials',
      category: 'social_proof',
      icon: '💬',
      description: 'Client reviews, executive quotes, and endorsements.',
      defaultSettings: {
        quote: 'ETHENENGINE completely transformed our digital architecture with zero-knowledge data privacy.',
        author: 'Lead Architect, Fortune 500 Enterprise',
      },
      fields: [
        { name: 'quote', label: 'Quote Body', type: 'textarea', defaultValue: 'Best platform architecture.' },
        { name: 'author', label: 'Author & Credential', type: 'text', defaultValue: 'CTO, Global SaaS' },
      ],
      renderHtml: (s) => `
        <section class="block-testimonial">
          <blockquote class="block-testimonial__quote">"${escapeHtml(s.quote)}"</blockquote>
          <div class="block-testimonial__author">— ${escapeHtml(s.author)}</div>
        </section>
      `,
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

    // 12. PAGINATION & NAVIGATION CONTROLS
    this.register({
      type: 'pagination',
      name: 'Pagination Controls',
      category: 'content',
      icon: '🔢',
      description: 'Page numbers, next/prev navigation controls, and page indicator pills.',
      defaultSettings: {
        totalPages: 5,
        currentPage: 1,
        prevText: '← Previous',
        nextText: 'Next →',
      },
      fields: [
        { name: 'totalPages', label: 'Total Pages Count', type: 'number', defaultValue: 5 },
        { name: 'currentPage', label: 'Active Page Number', type: 'number', defaultValue: 1 },
        { name: 'prevText', label: 'Previous Button Text', type: 'text', defaultValue: '← Previous' },
        { name: 'nextText', label: 'Next Button Text', type: 'text', defaultValue: 'Next →' },
      ],
      renderHtml: (s) => `
        <div class="block-pagination">
          <a href="?page=${Math.max(1, (s.currentPage || 1) - 1)}" class="btn btn-secondary">${escapeHtml(s.prevText || '← Previous')}</a>
          ${Array.from({ length: Number(s.totalPages || 5) }, (_, i) => i + 1).map(p => `
            <a href="?page=${p}" class="btn block-pagination__pill ${p === Number(s.currentPage || 1) ? '' : 'btn-secondary'}">${p}</a>
          `).join('')}
          <a href="?page=${Math.min(Number(s.totalPages || 5), (s.currentPage || 1) + 1)}" class="btn btn-secondary">${escapeHtml(s.nextText || 'Next →')}</a>
        </div>
      `,
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
  }
}
