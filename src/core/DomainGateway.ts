// Core Platform: Domain Gateway & Tenant Resolution (ADR-011)

import { HierarchyManager, TenantTier } from './HierarchyManager.js';
import { Logger } from '../foundation/Logger.js';

export interface TenantContext {
  tenant: TenantTier;
  traceId: string;
}

export class DomainGateway {
  private hierarchyManager = HierarchyManager.getInstance();
  private logger = Logger.getInstance();

  public resolveTenant(host: string, tenantHeader?: string, queryTenant?: string): TenantContext {
    const traceId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const domainOrSlug = tenantHeader || queryTenant || host.split(':')[0];

    let tenant = this.hierarchyManager.getTenantByDomain(domainOrSlug);
    if (!tenant) {
      tenant = this.hierarchyManager.getTenant('tenant_default')!;
    }

    this.logger.info(`Resolved tenant context for domain [${host}]`, {
      tenantId: tenant.id,
      traceId,
    });

    return { tenant, traceId };
  }
}
