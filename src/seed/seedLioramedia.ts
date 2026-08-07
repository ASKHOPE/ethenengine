// Seed Module: LIORAMEDIA Enterprise Tenant & All 11 Platform Subsystems

import { CorePlatformManager } from '../core/CorePlatformManager.js';
import { IdentityEngine, UserIdentity } from '../core/IdentityEngine.js';
import { ThemeEngine } from '../capabilities/theme-engine/ThemeEngine.js';
import { WebsiteBuilder, WebsitePage } from '../capabilities/website-builder/WebsiteBuilder.js';
import { BasicCMS } from '../capabilities/basic-cms/BasicCMS.js';
import { CommerceEngine } from '../capabilities/commerce/CommerceEngine.js';
import { CRMEngine } from '../capabilities/crm/CRMEngine.js';
import { ERPEngine } from '../capabilities/erp/ERPEngine.js';
import { AccountingEngine } from '../capabilities/accounting/AccountingEngine.js';
import { HREngine } from '../capabilities/hr/HREngine.js';
import { CommunicationEngine } from '../capabilities/communication/CommunicationEngine.js';
import { AutomationWorkflowEngine } from '../core/AutomationWorkflowEngine.js';
import { MarketplaceEngine } from '../capabilities/marketplace/MarketplaceEngine.js';
import { PersistenceDriver } from '../foundation/PersistenceDriver.js';

export async function seedLioramediaTenant() {
  const tenantId = 'tenant_lioramedia';
  const orgId = 'org_lioramedia';
  const slug = 'lioramedia';

  // 1. Core Platform Tenant & Hierarchy
  const core = CorePlatformManager.getInstance();
  const existingTenants = core.listTenants();
  if (!existingTenants.some(t => t.slug === slug)) {
    core.createTenant(orgId, 'LIORAMEDIA Studios Inc', slug, 'lioramedia.localhost', 'usr_liora_admin');
  }

  // 2. Identity Engine Users
  const identityEngine = IdentityEngine.getInstance();
  const defaultPasswordHash = (await import('../foundation/SecurityCrypto.js')).SecurityCrypto.hashPassword('Password123!').hash;

  const lioraAdmin: UserIdentity = {
    id: 'usr_liora_admin',
    type: 'TENANT_USER',
    email: 'admin@lioramedia.com',
    name: 'LIORAMEDIA Executive Admin',
    passwordHash: defaultPasswordHash,
    orgId,
    tenantId,
    roles: ['tenant_admin', 'creative_director'],
  };
  const lioraDirector: UserIdentity = {
    id: 'usr_liora_director',
    type: 'TENANT_USER',
    email: 'director@lioramedia.com',
    name: 'Elena Rostova (Creative Director)',
    passwordHash: defaultPasswordHash,
    orgId,
    tenantId,
    roles: ['creative_lead'],
  };
  (identityEngine as any).identities.set(lioraAdmin.id, lioraAdmin);
  (identityEngine as any).identities.set(lioraDirector.id, lioraDirector);

  // 3. Theme Engine Branding Tokens
  const themeEngine = ThemeEngine.getInstance();
  const theme = themeEngine.getThemeForTenant(tenantId);
  themeEngine.updateThemeTokens(theme.id, {
    primaryColor: '#ec4899',   // Vibrant Fuchsia Pink
    secondaryColor: '#8b5cf6', // Electric Purple
  });

  // 4. Website Builder Pages
  const websiteBuilder = WebsiteBuilder.getInstance();

  const homePage: WebsitePage = {
    id: `page_liora_home`,
    tenantId,
    title: 'LIORAMEDIA Studios - Next-Gen Motion & AI Video Production',
    slug: 'home',
    isPublished: true,
    seo: {
      title: 'LIORAMEDIA Studios - 3D Motion & AI Commercial Production',
      description: 'World-class virtual production, 3D motion design, and AI commercial pipelines.',
    },
    blocks: [
      {
        id: 'blk_liora_hero',
        type: 'hero',
        settings: {
          title: 'LIORAMEDIA Studios',
          subtitle: 'High-Impact 3D Motion Design, Virtual Production & AI Video Pipelines for Global Brands.',
          ctaText: 'Explore Media Portfolio',
          ctaUrl: '/lioramedia/portfolio',
        },
      },
      {
        id: 'blk_liora_features',
        type: 'features',
        settings: {
          title: 'LIORAMEDIA Production Capabilities',
          items: [
            { name: '8K Virtual LED Stages', desc: 'Real-time camera tracking and Unreal Engine 5 stage rendering.' },
            { name: 'Generative AI Pipelines', desc: 'Custom trained Diffusion & Video AI models for instant ad variations.' },
            { name: '3D VFX & Motion Graphics', desc: 'Procedural Houdini VFX and Cinema 4D commercial animation.' },
            { name: 'Global Asset Store', desc: 'Instant licensing of procedural shaders and 3D motion templates.' },
          ],
        },
      },
      {
        id: 'blk_liora_cms',
        type: 'cms_feed',
        settings: {
          title: 'Featured Case Studies & Media Releases',
          contentTypeSlug: 'case-study',
          limit: 3,
        },
      },
      {
        id: 'blk_liora_cta',
        type: 'cta',
        settings: {
          headline: 'Ready to produce your next global ad campaign with LIORAMEDIA?',
          buttonText: 'Book Studio Consultation',
        },
      },
    ],
  };

  const portfolioPage: WebsitePage = {
    id: `page_liora_portfolio`,
    tenantId,
    title: 'Media Portfolio & Case Studies',
    slug: 'portfolio',
    isPublished: true,
    seo: {
      title: 'LIORAMEDIA Portfolio - Global Campaigns',
      description: 'Explore high-profile 3D motion and virtual production projects for Nike, Warner Bros, and Red Bull.',
    },
    blocks: [
      {
        id: 'blk_port_hero',
        type: 'hero',
        settings: {
          title: 'LIORAMEDIA Global Portfolio',
          subtitle: 'Award-winning commercial campaigns, 3D billboards, and AI video innovations.',
          ctaText: 'View Commercial Services',
          ctaUrl: '/lioramedia/home',
        },
      },
      {
        id: 'blk_port_feed',
        type: 'cms_feed',
        settings: {
          title: 'Selected Campaign Showcases',
          contentTypeSlug: 'case-study',
          limit: 6,
        },
      },
    ],
  };

  (websiteBuilder as any).pages.set(homePage.id, homePage);
  (websiteBuilder as any).pages.set(portfolioPage.id, portfolioPage);

  // 5. Basic CMS Content Types & Entries
  const cms = BasicCMS.getInstance();
  const caseStudyType = cms.createContentType({
    tenantId,
    name: 'Client Case Study',
    slug: 'case-study',
    fields: [
      { name: 'title', label: 'Campaign Title', type: 'text', required: true },
      { name: 'content', label: 'Production Breakdown', type: 'rich-text', required: true },
      { name: 'client', label: 'Client Brand', type: 'text', required: false },
    ],
  });

  cms.createEntry({
    tenantId,
    contentTypeId: caseStudyType.id,
    slug: 'nike-3d-billboard',
    data: {
      title: 'Nike Air Max 3D Anamorphic Billboard (Tokyo Times Square)',
      content: 'Designed and rendered an 8K anamorphic 3D sneaker animation using Unreal Engine 5 and Houdini procedural particles.',
      author: 'Elena Rostova (Creative Director)',
      client: 'Nike Global',
    },
    status: 'published',
  });

  cms.createEntry({
    tenantId,
    contentTypeId: caseStudyType.id,
    slug: 'warner-bros-virtual-stage',
    data: {
      title: 'Warner Bros Sci-Fi Feature Virtual Production Stage',
      content: 'Operated 120-panel LED volume stage with real-time camera tracking, reducing post-production VFX timelines by 40%.',
      author: 'VFX Supervisor',
      client: 'Warner Bros Discovery',
    },
    status: 'published',
  });

  cms.createEntry({
    tenantId,
    contentTypeId: caseStudyType.id,
    slug: 'ai-commercial-pipeline',
    data: {
      title: 'AI-Powered Personalization Pipeline for Luxury Automotive',
      content: 'Generated 500 localized 4K commercial variations in 2 hours using custom trained Flux video diffusion models.',
      author: 'AI Tech Lead',
      client: 'Porsche Digital',
    },
    status: 'published',
  });

  // 6. Commerce Subsystem
  const commerce = CommerceEngine.getInstance();
  const prod1 = commerce.createProduct({
    tenantId,
    name: '8K Virtual LED Production Package (Full Day)',
    sku: 'LIO-STUDIO-8K',
    price: 15000,
    currency: 'USD',
    stock: 20,
    description: 'Full-day access to 120-panel LED volume studio, tracking crew, and unreal engine technicians.',
  });

  commerce.createProduct({
    tenantId,
    name: 'Monthly AI Commercial Ad Retainer',
    sku: 'LIO-AI-RETAINER',
    price: 4500,
    currency: 'USD',
    stock: 50,
    description: 'Up to 50 localized AI commercial variations generated monthly with dedicated render queue priority.',
  });

  commerce.addToCart(tenantId, lioraDirector.id, prod1.id, 1);
  commerce.createOrder(tenantId, lioraDirector.id);

  // 7. CRM Pipeline
  const crm = CRMEngine.getInstance();
  crm.createLead({
    tenantId,
    contactName: 'Sarah Jenkins',
    email: 'sjenkins@warnerbros.com',
    company: 'Warner Bros Discovery',
    dealValue: 150000,
    stage: 'proposal',
  });

  crm.createLead({
    tenantId,
    contactName: 'David Kross',
    email: 'dkross@nike.com',
    company: 'Nike Digital Global',
    dealValue: 85000,
    stage: 'closed_won',
  });

  crm.createLead({
    tenantId,
    contactName: 'Felix Baum',
    email: 'fbaum@redbull.com',
    company: 'Red Bull Media House',
    dealValue: 45000,
    stage: 'contacted',
  });

  // 8. ERP & Manufacturing
  const erp = ERPEngine.getInstance();
  erp.createProcurementOrder({
    tenantId,
    vendorName: 'RED Cinema Digital',
    item: 'RED V-Raptor 8K Camera Rigs (x2)',
    quantity: 2,
    totalCost: 48000,
    status: 'ordered',
  });

  erp.createProcurementOrder({
    tenantId,
    vendorName: 'NVIDIA Enterprise Systems',
    item: 'H100 GPU Render Workstation Node',
    quantity: 1,
    totalCost: 35000,
    status: 'received',
  });

  // 9. Accounting & Financial General Ledger
  const accounting = AccountingEngine.getInstance();
  accounting.postTransaction(tenantId, 'Bank Capital Account', 'debit', 250000, 'LIORAMEDIA Corporate Treasury Deposit');
  accounting.postTransaction(tenantId, 'Nike Campaign Revenue', 'debit', 85000, 'Commercial Production Retainer Payment');
  accounting.postTransaction(tenantId, 'Studio Rent & Lease', 'credit', 12000, 'Monthly Virtual Stage Lease');
  accounting.postTransaction(tenantId, 'GPU Cloud Render Compute', 'credit', 8500, 'AWS Deadline Cloud GPU Nodes');

  // 10. HR & Employee Directory
  const hr = HREngine.getInstance();
  hr.addEmployee({
    tenantId,
    name: 'Elena Rostova',
    email: 'elena@lioramedia.com',
    position: 'Creative Director',
    department: 'Design & VFX',
    salaryMonthly: 11666,
    status: 'active',
  });
  hr.addEmployee({
    tenantId,
    name: 'Marcus Vance',
    email: 'marcus@lioramedia.com',
    position: 'Lead 3D & Procedural Artist',
    department: 'Production',
    salaryMonthly: 9583,
    status: 'active',
  });
  hr.addEmployee({
    tenantId,
    name: 'Sophia Chen',
    email: 'sophia@lioramedia.com',
    position: 'VP of Client Relations',
    department: 'Sales & CRM',
    salaryMonthly: 10833,
    status: 'active',
  });

  // 11. Communication Engine (Chat Channels)
  const comms = CommunicationEngine.getInstance();
  const genChan = comms.createChannel({
    tenantId,
    name: '#liora-general',
    type: 'public_channel',
    memberUserIds: ['usr_liora_admin', 'usr_liora_director'],
  });
  const vfxChan = comms.createChannel({
    tenantId,
    name: '#vfx-pipeline',
    type: 'private_team',
    memberUserIds: ['usr_liora_admin', 'usr_liora_director'],
  });

  comms.sendMessage(tenantId, genChan.id, lioraAdmin.id, lioraAdmin.name, 'Welcome to LIORAMEDIA Studios tenant workspace on ETHENENGINE!');
  comms.sendMessage(tenantId, vfxChan.id, lioraDirector.id, lioraDirector.name, 'Nike Air Max 3D render pipeline finished with 0 errors.');

  // 12. Marketplace Capabilities & Aiven PostgreSQL Sync
  const marketplace = MarketplaceEngine.getInstance();
  marketplace.installCapability(tenantId, 'capability_commerce');
  marketplace.installCapability(tenantId, 'capability_theme_engine');

  // Trigger Live Aiven Cloud PostgreSQL Database Persistence
  const persistence = PersistenceDriver.getInstance();
  await persistence.saveCollection('tenants', core.listTenants());
  await persistence.saveCollection('pages', websiteBuilder.listPages(tenantId));
  await persistence.saveCollection('cms_entries', cms.listEntries(tenantId));
  await persistence.saveCollection('products', commerce.listProducts(tenantId));
  await persistence.saveCollection('leads', crm.listLeads(tenantId));

  console.log(`[SeedEngine] Successfully populated LIORAMEDIA Enterprise Tenant (${tenantId}) across all 11 platform subsystems & synced to Aiven PostgreSQL tables!`);
}
