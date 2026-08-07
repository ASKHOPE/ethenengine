// Marketplace Subsystem: Extension Store & Capability Installer

import { EventBus } from '../../foundation/EventBus.js';
import { CapabilityRegistry, PlatformCapability } from '../../capability-sdk/CapabilityRegistry.js';

export interface MarketplaceListing {
  id: string;
  name: string;
  version: string;
  category: 'core' | 'business' | 'experience' | 'integration';
  author: string;
  description: string;
  price: number; // 0 for free
  installedTenants: string[];
}

export class MarketplaceEngine {
  private static instance: MarketplaceEngine;
  private listings: Map<string, MarketplaceListing> = new Map();
  private eventBus = EventBus.getInstance();
  private capabilityRegistry = CapabilityRegistry.getInstance();

  private constructor() {
    this.seedMarketplaceListings();
  }

  public static getInstance(): MarketplaceEngine {
    if (!MarketplaceEngine.instance) {
      MarketplaceEngine.instance = new MarketplaceEngine();
    }
    return MarketplaceEngine.instance;
  }

  private seedMarketplaceListings() {
    const defaultListings: MarketplaceListing[] = [
      {
        id: 'capability_website_builder',
        name: 'Visual Website Builder',
        version: '1.0.0',
        category: 'experience',
        author: 'Platform Core Team',
        description: 'Drag & drop block renderer and layout management engine.',
        price: 0,
        installedTenants: ['tenant_default'],
      },
      {
        id: 'capability_theme_engine',
        name: 'Dynamic Theme Engine',
        version: '1.0.0',
        category: 'experience',
        author: 'Platform Core Team',
        description: 'Design token compiler and custom CSS variable generator.',
        price: 0,
        installedTenants: ['tenant_default'],
      },
      {
        id: 'capability_basic_cms',
        name: 'Headless Basic CMS',
        version: '1.0.0',
        category: 'business',
        author: 'Platform Core Team',
        description: 'Structured content types and entries with versioning.',
        price: 0,
        installedTenants: ['tenant_default'],
      },
      {
        id: 'capability_commerce',
        name: 'Commerce & Order Pipeline',
        version: '1.0.0',
        category: 'business',
        author: 'Platform Core Team',
        description: 'Product catalog, shopping cart, and order checkout capability.',
        price: 99,
        installedTenants: ['tenant_default'],
      },
    ];

    for (const listing of defaultListings) {
      this.listings.set(listing.id, listing);
    }
  }

  public listListings(): MarketplaceListing[] {
    return Array.from(this.listings.values());
  }

  public installCapability(tenantId: string, listingId: string): boolean {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    if (!listing.installedTenants.includes(tenantId)) {
      listing.installedTenants.push(tenantId);
      this.eventBus.publish('marketplace.capability.installed', { tenantId, capabilityId: listingId });
    }
    return true;
  }

  public uninstallCapability(tenantId: string, listingId: string): boolean {
    const listing = this.listings.get(listingId);
    if (!listing) return false;

    listing.installedTenants = listing.installedTenants.filter((t) => t !== tenantId);
    this.eventBus.publish('marketplace.capability.uninstalled', { tenantId, capabilityId: listingId });
    return true;
  }
}
