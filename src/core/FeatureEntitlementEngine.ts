// Core Platform: Subscription Feature Entitlement Manager
// Tier Entitlements:
// - Pro: Website Builder, Theme Engine, Basic CMS, Commerce & Order Pipeline, CRM Funnel
// - Enterprise: Pro features + ERP, General Ledger Accounting, HR & Payroll, Automation Workflows, Keycloak SSO

import { HierarchyManager } from './HierarchyManager.js';

export type FeatureKey =
  | 'website_builder'
  | 'theme_engine'
  | 'basic_cms'
  | 'commerce'
  | 'crm'
  | 'erp'
  | 'accounting'
  | 'hr'
  | 'automation_workflows'
  | 'enterprise_sso';

export class FeatureEntitlementEngine {
  private static instance: FeatureEntitlementEngine;
  private hierarchyManager = HierarchyManager.getInstance();

  private planEntitlements: Record<'pro' | 'enterprise', FeatureKey[]> = {
    pro: ['website_builder', 'theme_engine', 'basic_cms', 'commerce', 'crm'],
    enterprise: [
      'website_builder',
      'theme_engine',
      'basic_cms',
      'commerce',
      'crm',
      'erp',
      'accounting',
      'hr',
      'automation_workflows',
      'enterprise_sso',
    ],
  };

  private constructor() {}

  public static getInstance(): FeatureEntitlementEngine {
    if (!FeatureEntitlementEngine.instance) {
      FeatureEntitlementEngine.instance = new FeatureEntitlementEngine();
    }
    return FeatureEntitlementEngine.instance;
  }

  public isFeatureAllowed(tenantId: string, feature: FeatureKey): boolean {
    const tenant = this.hierarchyManager.getTenant(tenantId);
    const org = tenant ? this.hierarchyManager.getOrganization(tenant.orgId) : undefined;
    const plan = org ? org.subscriptionPlan : 'pro';

    const allowedFeatures = this.planEntitlements[plan] || this.planEntitlements.pro;
    const result = allowedFeatures.includes(feature);
    if (process.env.DEBUG_ENTITLEMENT) {
      console.log(`[Entitlement] Tenant: ${tenantId} | Org: ${tenant?.orgId} | Plan: ${plan} | Feature: ${feature} => ${result}`);
    }
    return result;
  }

  public checkFeatureEntitlement(tenantId: string, feature: FeatureKey): { allowed: boolean; currentPlan: string } {
    const tenant = this.hierarchyManager.getTenant(tenantId);
    const org = tenant ? this.hierarchyManager.getOrganization(tenant.orgId) : undefined;
    const currentPlan = org ? org.subscriptionPlan : 'pro';

    return {
      allowed: this.isFeatureAllowed(tenantId, feature),
      currentPlan,
    };
  }
}
