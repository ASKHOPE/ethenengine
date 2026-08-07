// Core Platform: Dynamic Tenant Configuration Engine (ADR-005 Compliance)
// Priority: Tenant Dynamic Config -> Blueprint Default -> Global Platform Config

import { ConfigEngine } from '../foundation/ConfigEngine.js';

export interface DynamicTenantSettings {
  tenantId: string;
  themeId?: string;
  customDomain?: string;
  featureToggles: Record<string, boolean>;
  metadata: Record<string, any>;
}

export class ConfigurationEngine {
  private static instance: ConfigurationEngine;
  private tenantConfigs: Map<string, DynamicTenantSettings> = new Map();
  private globalConfig = ConfigEngine.getInstance().getConfig();

  private constructor() {
    this.seedDefaultTenantConfig();
  }

  public static getInstance(): ConfigurationEngine {
    if (!ConfigurationEngine.instance) {
      ConfigurationEngine.instance = new ConfigurationEngine();
    }
    return ConfigurationEngine.instance;
  }

  private seedDefaultTenantConfig() {
    this.tenantConfigs.set('tenant_default', {
      tenantId: 'tenant_default',
      themeId: 'theme_default',
      customDomain: 'acme.localhost',
      featureToggles: {
        enableCommerce: true,
        enableMarketplace: true,
      },
      metadata: { companyName: 'Acme Enterprise' },
    });
  }

  public getTenantSetting<T = any>(tenantId: string, key: string, defaultValue?: T): T {
    const tenantCfg = this.tenantConfigs.get(tenantId);

    // 1. Check Tenant Dynamic Overrides
    if (tenantCfg && tenantCfg.featureToggles[key] !== undefined) {
      return tenantCfg.featureToggles[key] as T;
    }

    // 2. Check Global Config Fallback
    if ((this.globalConfig.featureFlags as any)[key] !== undefined) {
      return (this.globalConfig.featureFlags as any)[key] as T;
    }

    return defaultValue as T;
  }

  public updateTenantConfig(tenantId: string, updates: Partial<DynamicTenantSettings>): DynamicTenantSettings {
    const existing = this.tenantConfigs.get(tenantId) || {
      tenantId,
      featureToggles: {},
      metadata: {},
    };

    const updated: DynamicTenantSettings = {
      ...existing,
      ...updates,
      featureToggles: { ...existing.featureToggles, ...updates.featureToggles },
      metadata: { ...existing.metadata, ...updates.metadata },
    };

    this.tenantConfigs.set(tenantId, updated);
    return updated;
  }
}
