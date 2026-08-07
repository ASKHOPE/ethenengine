// Core Platform: 5-Tier Hierarchy Manager (Volume 4, Chapter 2 & ADR-003)
// Platform -> Organization -> Tenant -> Workspace -> Team -> Users

export interface OrganizationTier {
  id: string;
  name: string;
  billingEmail: string;
  subscriptionPlan: 'pro' | 'enterprise';
  createdAt: string;
}

export interface TenantTier {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  domain: string;
  installedCapabilityIds: string[];
  createdAt: string;
}

export interface WorkspaceTier {
  id: string;
  tenantId: string;
  name: string;
  environment: 'production' | 'staging' | 'dev';
  createdAt: string;
}

export interface TeamTier {
  id: string;
  workspaceId: string;
  name: string;
  memberUserIds: string[];
}

export class HierarchyManager {
  private static instance: HierarchyManager;

  private orgs: Map<string, OrganizationTier> = new Map();
  private tenants: Map<string, TenantTier> = new Map();
  private workspaces: Map<string, WorkspaceTier> = new Map();
  private teams: Map<string, TeamTier> = new Map();

  private constructor() {
    this.seedDefaultHierarchy();
  }

  public static getInstance(): HierarchyManager {
    if (!HierarchyManager.instance) {
      HierarchyManager.instance = new HierarchyManager();
    }
    return HierarchyManager.instance;
  }

  private seedDefaultHierarchy() {
    const orgDefault: OrganizationTier = {
      id: 'org_default',
      name: 'Default Platform Org',
      billingEmail: 'billing@platform.local',
      subscriptionPlan: 'pro',
      createdAt: new Date().toISOString(),
    };
    this.orgs.set(orgDefault.id, orgDefault);

    const orgAcme: OrganizationTier = {
      id: 'org_acme',
      name: 'Acme Global Corp',
      billingEmail: 'billing@acme.com',
      subscriptionPlan: 'enterprise',
      createdAt: new Date().toISOString(),
    };
    this.orgs.set(orgAcme.id, orgAcme);

    const tenant: TenantTier = {
      id: 'tenant_default',
      orgId: orgAcme.id,
      name: 'Acme Enterprise Website',
      slug: 'acme',
      domain: 'acme.localhost',
      installedCapabilityIds: ['capability_website_builder', 'capability_theme_engine', 'capability_basic_cms'],
      createdAt: new Date().toISOString(),
    };
    this.tenants.set(tenant.id, tenant);

    const workspace: WorkspaceTier = {
      id: 'ws_main',
      tenantId: tenant.id,
      name: 'Main Production Environment',
      environment: 'production',
      createdAt: new Date().toISOString(),
    };
    this.workspaces.set(workspace.id, workspace);

    const team: TeamTier = {
      id: 'team_marketing',
      workspaceId: workspace.id,
      name: 'Marketing & Content Team',
      memberUserIds: ['usr_admin'],
    };
    this.teams.set(team.id, team);
  }

  public createOrganization(name: string, billingEmail: string, plan: OrganizationTier['subscriptionPlan']): OrganizationTier {
    const org: OrganizationTier = {
      id: `org_${Date.now()}`,
      name,
      billingEmail,
      subscriptionPlan: plan,
      createdAt: new Date().toISOString(),
    };
    this.orgs.set(org.id, org);
    return org;
  }

  public getOrganization(id: string): OrganizationTier | undefined {
    return this.orgs.get(id);
  }

  public createTenant(orgId: string, name: string, slug: string, domain: string): TenantTier {
    const tenant: TenantTier = {
      id: `tenant_${slug}`,
      orgId,
      name,
      slug,
      domain,
      installedCapabilityIds: [],
      createdAt: new Date().toISOString(),
    };
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  public getTenant(id: string): TenantTier | undefined {
    return this.tenants.get(id);
  }

  public getTenantByDomain(domain: string): TenantTier | undefined {
    for (const tenant of this.tenants.values()) {
      if (tenant.domain === domain || tenant.slug === domain) return tenant;
    }
    return undefined;
  }

  public listTenantsForOrg(orgId: string): TenantTier[] {
    return Array.from(this.tenants.values()).filter((t) => t.orgId === orgId);
  }
}
