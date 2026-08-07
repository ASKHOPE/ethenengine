// Core Platform: Enterprise Governance & Multi-Subsidiary Cost Center Engine

import { EventBus } from '../foundation/EventBus.js';

export interface CostCenter {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  budgetAnnual: number;
}

export interface Subsidiary {
  id: string;
  orgId: string;
  name: string;
  country: string;
  currency: string;
}

export class EnterpriseOrgEngine {
  private static instance: EnterpriseOrgEngine;
  private subsidiaries: Map<string, Subsidiary> = new Map();
  private costCenters: Map<string, CostCenter> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultEnterprise();
  }

  public static getInstance(): EnterpriseOrgEngine {
    if (!EnterpriseOrgEngine.instance) {
      EnterpriseOrgEngine.instance = new EnterpriseOrgEngine();
    }
    return EnterpriseOrgEngine.instance;
  }

  private seedDefaultEnterprise() {
    const sub: Subsidiary = {
      id: 'sub_us',
      orgId: 'org_acme',
      name: 'Acme Americas Inc.',
      country: 'USA',
      currency: 'USD',
    };
    this.subsidiaries.set(sub.id, sub);

    const cc: CostCenter = {
      id: 'cc_eng',
      tenantId: 'tenant_default',
      name: 'Engineering Cost Center',
      code: 'CC-101',
      budgetAnnual: 5000000,
    };
    this.costCenters.set(cc.id, cc);
  }

  public createSubsidiary(orgId: string, name: string, country: string, currency: string): Subsidiary {
    const sub: Subsidiary = {
      id: `sub_${Date.now()}`,
      orgId,
      name,
      country,
      currency,
    };
    this.subsidiaries.set(sub.id, sub);
    this.eventBus.publish('enterprise.subsidiary.created', sub);
    return sub;
  }

  public listSubsidiaries(orgId: string): Subsidiary[] {
    return Array.from(this.subsidiaries.values()).filter((s) => s.orgId === orgId);
  }
}
