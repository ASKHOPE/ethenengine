// Capability Framework & Blueprint Engine

import { EventBus } from '../foundation/EventBus.js';

export interface PlatformCapability {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'core' | 'experience' | 'business' | 'integration';
  enabled: boolean;
  initialize: (context: any) => Promise<void> | void;
}

export interface WorkspaceBlueprint {
  id: string;
  name: string;
  description: string;
  capabilities: string[]; // Capability IDs required
  defaultConfigurations: Record<string, any>;
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, PlatformCapability> = new Map();
  private blueprints: Map<string, WorkspaceBlueprint> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.registerDefaultBlueprints();
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  public registerCapability(capability: PlatformCapability) {
    this.capabilities.set(capability.id, capability);
    this.eventBus.publish('capability.registered', { id: capability.id, name: capability.name });
  }

  public getCapability(id: string): PlatformCapability | undefined {
    return this.capabilities.get(id);
  }

  public listCapabilities(): PlatformCapability[] {
    return Array.from(this.capabilities.values());
  }

  // Blueprint engine
  private registerDefaultBlueprints() {
    const webBlueprint: WorkspaceBlueprint = {
      id: 'blueprint_website_cms',
      name: 'Website & CMS Portal',
      description: 'Foundational digital presence blueprint containing Website Builder, Theme Engine, and Basic CMS',
      capabilities: ['capability_website_builder', 'capability_theme_engine', 'capability_basic_cms'],
      defaultConfigurations: {
        theme: 'modern_dark',
        seoEnabled: true,
      },
    };
    this.blueprints.set(webBlueprint.id, webBlueprint);
  }

  public getBlueprint(id: string): WorkspaceBlueprint | undefined {
    return this.blueprints.get(id);
  }

  public listBlueprints(): WorkspaceBlueprint[] {
    return Array.from(this.blueprints.values());
  }
}

export const FutureCapabilitiesMap: Record<string, any> = {
  ai_copilot: { name: 'AI Studio Copilot', status: 'ready', category: 'experience' },
  i18n_multi_currency: { name: 'i18n & Multi-Currency Engine', status: 'ready', category: 'business' },
  aiven_postgres_sync: { name: 'Aiven Cloud PostgreSQL Sync', status: 'active', category: 'core' },
};

