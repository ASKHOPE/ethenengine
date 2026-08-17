// Capabilities: Website Builder Subsystem

import { EventBus } from '../../foundation/EventBus.js';

export interface PageBlock {
  id: string;
  type: 'hero' | 'features' | 'cms_feed' | 'cta' | 'footer' | 'custom_html' | 'pricing' | 'testimonials' | 'stats' | 'gallery';
  settings: Record<string, any>;
}

export interface WebsitePage {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  blocks: PageBlock[];
  isPublished: boolean;
  seo: {
    title: string;
    description: string;
  };
}

export class WebsiteBuilder {
  private static instance: WebsiteBuilder;
  private pages: Map<string, WebsitePage> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultPage();
  }

  public static getInstance(): WebsiteBuilder {
    if (!WebsiteBuilder.instance) {
      WebsiteBuilder.instance = new WebsiteBuilder();
    }
    return WebsiteBuilder.instance;
  }

  private seedDefaultPage() {
    // 1. Home Page
    const homePage: WebsitePage = {
      id: 'page_home',
      tenantId: 'tenant_default',
      title: 'Home',
      slug: 'home',
      isPublished: true,
      seo: {
        title: 'ETHENENGINE Enterprise - Modular Multi-Tenant Platform Solution',
        description: 'Next generation business platform powered by modular architecture and Bun runtime.',
      },
      blocks: [
        {
          id: 'blk_hero',
          type: 'hero',
          settings: {
            title: 'Empower Your Enterprise with ETHENENGINE',
            subtitle: 'One configurable multi-tenant platform for all your website, portal, and CMS needs.',
            ctaText: 'Discover Core Features',
            ctaUrl: '/features',
          },
        },
        {
          id: 'blk_features',
          type: 'features',
          settings: {
            title: 'ETHENENGINE Core Capabilities',
            items: [
              { name: '5-Tier Multi-Tenant Isolation', desc: 'Isolate organizations seamlessly with zero build queue overhead.' },
              { name: 'Visual Website Builder', desc: 'Compose dynamic layouts effortlessly with in-memory block rendering.' },
              { name: 'Headless CMS', desc: 'Define structured content types & publish instant REST/GraphQL updates.' },
              { name: 'Rust Microservices', desc: 'High performance vector search and sub-5ms image transformations.' },
            ],
          },
        },
        {
          id: 'blk_cms',
          type: 'cms_feed',
          settings: {
            title: 'ETHENENGINE Latest Articles & Updates',
            contentTypeSlug: 'blog-article',
            limit: 3,
          },
        },
        {
          id: 'blk_cta',
          type: 'cta',
          settings: {
            headline: 'Ready to scale your business capabilities with ETHENENGINE?',
            buttonText: 'Explore Enterprise Solutions',
          },
        },
      ],
    };

    // 2. Dedicated Features Page
    const featuresPage: WebsitePage = {
      id: 'page_features',
      tenantId: 'tenant_default',
      title: 'Platform Features & Subsystems',
      slug: 'features',
      isPublished: true,
      seo: {
        title: 'ETHENENGINE Features - Architectural Subsystems',
        description: 'Explore the full power of ETHENENGINE multi-tenancy, Rust microservices, and workflow automation.',
      },
      blocks: [
        {
          id: 'blk_features_hero',
          type: 'hero',
          settings: {
            title: 'ETHENENGINE Architecture & Features',
            subtitle: 'Discover high-throughput event pipelines, zero-JS rendering, and enterprise governance.',
            ctaText: 'Explore Headless CMS',
            ctaUrl: '/cms',
          },
        },
        {
          id: 'blk_features_matrix',
          type: 'features',
          settings: {
            title: 'Deep-Dive Feature Subsystems',
            items: [
              { name: '5-Tier Hierarchy Manager', desc: 'Platform -> Org -> Tenant -> Workspace -> Team -> User tenant isolation.' },
              { name: 'AES-256-GCM Field Encryption', desc: 'Field-level database cryptographic protection operating at 400,000+ ops/sec.' },
              { name: 'Async EventBus Pipeline', desc: 'In-memory async event distribution processing over 1.2 Million events/sec.' },
              { name: 'Automation Workflow Engine', desc: 'n8n-style graph automation triggers, conditions, and action execution.' },
              { name: 'Rust Vector Search', desc: 'Sub-5ms vector search indexing and instant query matching.' },
              { name: 'Enterprise SSO & SAML 2.0', desc: 'Seamless integration with Okta, Azure AD, and Google Workspace.' },
            ],
          },
        },
        {
          id: 'blk_features_cta',
          type: 'cta',
          settings: {
            headline: 'Experience ETHENENGINE Performance Firsthand',
            buttonText: 'View Enterprise Solutions',
          },
        },
      ],
    };

    // 3. Dedicated CMS Page
    const cmsPage: WebsitePage = {
      id: 'page_cms',
      tenantId: 'tenant_default',
      title: 'Headless CMS Showcase',
      slug: 'cms',
      isPublished: true,
      seo: {
        title: 'ETHENENGINE Headless CMS - Structured Content Management',
        description: 'Manage content types, dynamic schemas, and entries with REST API integration.',
      },
      blocks: [
        {
          id: 'blk_cms_hero',
          type: 'hero',
          settings: {
            title: 'ETHENENGINE Headless CMS',
            subtitle: 'Structured content types, dynamic JSON fields, and instant REST API endpoint generation.',
            ctaText: 'Open API Spec',
            ctaUrl: '/docs',
          },
        },
        {
          id: 'blk_cms_feed_page',
          type: 'cms_feed',
          settings: {
            title: 'Live Published Content Entries',
            contentTypeSlug: 'blog-article',
            limit: 10,
          },
        },
        {
          id: 'blk_cms_cta',
          type: 'cta',
          settings: {
            headline: 'Create Custom Content Types in ETHENENGINE Console',
            buttonText: 'Launch Admin Console',
          },
        },
      ],
    };

    // 4. Dedicated Solutions Page
    const solutionsPage: WebsitePage = {
      id: 'page_solutions',
      tenantId: 'tenant_default',
      title: 'Enterprise Solutions',
      slug: 'solutions',
      isPublished: true,
      seo: {
        title: 'ETHENENGINE Solutions - Enterprise Governance & Disaster Recovery',
        description: 'Subsidiary management, cost centers, point-in-time restores, and 99.99% SLA availability.',
      },
      blocks: [
        {
          id: 'blk_solutions_hero',
          type: 'hero',
          settings: {
            title: 'Enterprise Solutions & Governance',
            subtitle: 'Built for large-scale enterprise subsidiaries, multi-region failover, and strict data compliance.',
            ctaText: 'Back to Home',
            ctaUrl: '/',
          },
        },
        {
          id: 'blk_solutions_matrix',
          type: 'features',
          settings: {
            title: 'Enterprise Platform Modules',
            items: [
              { name: 'Subsidiary & Budgeting', desc: 'Cost center allocation and multi-department budget controls.' },
              { name: 'Disaster Recovery Engine', desc: 'Automated disk snapshot backups and point-in-time tenant restores.' },
              { name: 'GDPR Compliance Registry', desc: 'Built-in Right of Access data export & Right to be Forgotten erasure.' },
              { name: 'Commerce & Financial General Ledger', desc: 'Integrated ERP, general ledger posting, and procurement workflows.' },
            ],
          },
        },
        {
          id: 'blk_solutions_cta',
          type: 'cta',
          settings: {
            headline: 'Deploy ETHENENGINE for your Enterprise Today',
            buttonText: 'Access Admin Portal',
          },
        },
      ],
    };

    this.pages.set(homePage.id, homePage);
    this.pages.set(featuresPage.id, featuresPage);
    this.pages.set(cmsPage.id, cmsPage);
    this.pages.set(solutionsPage.id, solutionsPage);
  }

  public createPage(page: Omit<WebsitePage, 'id'>): WebsitePage {
    const newPage: WebsitePage = {
      ...page,
      id: `page_${Date.now()}`,
    };
    this.pages.set(newPage.id, newPage);
    this.eventBus.publish('website.page.created', newPage, { tenantId: page.tenantId });
    return newPage;
  }

  public updatePageBlocks(pageId: string, blocks: PageBlock[]): WebsitePage {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page ${pageId} not found`);
    page.blocks = blocks;
    this.eventBus.publish('website.page.updated', page, { tenantId: page.tenantId });
    return page;
  }

  public updatePage(pageId: string, updates: Partial<Omit<WebsitePage, 'id'>>): WebsitePage {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page ${pageId} not found`);
    if (updates.slug) {
      updates.slug = updates.slug.replace(/^\/+/, ''); // Trim leading slashes
    }
    Object.assign(page, updates);
    this.eventBus.publish('website.page.updated', page, { tenantId: page.tenantId });
    return page;
  }

  public deletePage(pageId: string): boolean {
    const page = this.pages.get(pageId);
    if (!page) return false;
    this.pages.delete(pageId);
    this.eventBus.publish('website.page.deleted', { pageId }, { tenantId: page.tenantId });
    return true;
  }

  public listPages(tenantId: string): WebsitePage[] {
    const cleanId = tenantId.replace('tenant_', '');
    return Array.from(this.pages.values()).filter((p) => p.tenantId === tenantId || p.tenantId === cleanId || p.tenantId === `tenant_${cleanId}`);
  }

  public renderPage(page: WebsitePage, context?: any): string {
    const registry = (require('./BlockRegistry.js') as any).BlockRegistry.getInstance();
    return page.blocks.map(b => registry.renderBlock(b.type, b.settings, context)).join('\n');
  }

  public getPageBySlug(tenantId: string, slug: string): WebsitePage | undefined {
    const cleanId = tenantId.replace('tenant_', '');
    const cleanSlug = slug.replace(/^\/+/, '');
    return Array.from(this.pages.values()).find((p) => (p.tenantId === tenantId || p.tenantId === cleanId || p.tenantId === `tenant_${cleanId}`) && (p.slug === cleanSlug || p.slug === slug));
  }
}
