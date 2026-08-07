// Core Platform: Tenant, Org, Workspace, Identity & Permissions Manager

import { EventBus } from '../foundation/EventBus.js';
import { AuditLogger } from '../foundation/AuditLogger.js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'tenant_admin' | 'editor' | 'viewer';
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Workspace {
  id: string;
  tenantId: string;
  name: string;
  environment: 'production' | 'staging' | 'dev';
  createdAt: string;
}

export class CorePlatformManager {
  private static instance: CorePlatformManager;
  private users: Map<string, User> = new Map();
  private orgs: Map<string, Organization> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private workspaces: Map<string, Workspace> = new Map();

  private eventBus = EventBus.getInstance();
  private auditLogger = AuditLogger.getInstance();

  private constructor() {
    this.seedDefaultTenant();
  }

  public static getInstance(): CorePlatformManager {
    if (!CorePlatformManager.instance) {
      CorePlatformManager.instance = new CorePlatformManager();
    }
    return CorePlatformManager.instance;
  }

  private seedDefaultTenant() {
    const admin: User = {
      id: 'usr_admin',
      email: 'admin@platform.local',
      name: 'Default Admin',
      role: 'superadmin',
    };
    this.users.set(admin.id, admin);

    const org: Organization = {
      id: 'org_default',
      name: 'Default Org',
      ownerId: admin.id,
      createdAt: new Date().toISOString(),
    };
    this.orgs.set(org.id, org);

    const tenant: Tenant = {
      id: 'tenant_default',
      orgId: org.id,
      name: 'ETHENENGINE Core Tenant',
      slug: 'default',
      domain: 'ethenengine.com',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.tenants.set(tenant.id, tenant);

    const workspace: Workspace = {
      id: 'ws_prod',
      tenantId: tenant.id,
      name: 'Production Workspace',
      environment: 'production',
      createdAt: new Date().toISOString(),
    };
    this.workspaces.set(workspace.id, workspace);
  }

  // Identity & Auth
  public getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  public createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Tenant Operations
  public createTenant(orgId: string, name: string, slug: string, domain: string, actorId: string): Tenant {
    const tenant: Tenant = {
      id: `tenant_${slug}`,
      orgId,
      name,
      slug,
      domain,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.tenants.set(tenant.id, tenant);

    // Auto-create default production workspace
    const ws: Workspace = {
      id: `ws_${Date.now()}`,
      tenantId: tenant.id,
      name: 'Main Workspace',
      environment: 'production',
      createdAt: new Date().toISOString(),
    };
    this.workspaces.set(ws.id, ws);

    this.eventBus.publish('tenant.created', tenant, { tenantId: tenant.id, actorId });
    this.auditLogger.log({
      tenantId: tenant.id,
      actorId,
      action: 'tenant.create',
      resource: `Tenant:${tenant.id}`,
      details: { name, slug, domain },
    });

    return tenant;
  }

  public getTenantByDomainOrSlug(identifier: string): Tenant | undefined {
    for (const tenant of this.tenants.values()) {
      if (tenant.domain === identifier || tenant.slug === identifier || tenant.id === identifier) {
        return tenant;
      }
    }
    return undefined;
  }

  public listTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  // Workspaces
  public getWorkspacesByTenant(tenantId: string): Workspace[] {
    return Array.from(this.workspaces.values()).filter((w) => w.tenantId === tenantId);
  }

  // Permissions Engine (RBAC)
  public checkPermission(user: User, action: string): boolean {
    if (user.role === 'superadmin' || user.role === 'tenant_admin') return true;
    if (user.role === 'editor') {
      return action.startsWith('read') || action.startsWith('write') || action.startsWith('publish');
    }
    if (user.role === 'viewer') {
      return action.startsWith('read');
    }
    return false;
  }
}
