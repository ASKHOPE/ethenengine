// Core Platform: Tenant, Org, Workspace, Identity & Permissions Manager

import { EventBus } from '../foundation/EventBus.js';
import { AuditLogger } from '../foundation/AuditLogger.js';
import { PersistenceDriver } from '../foundation/PersistenceDriver.js';

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

    const defaultTenant: Tenant = {
      id: 'tenant_default',
      orgId: org.id,
      name: 'ETHENENGINE Core Tenant',
      slug: 'default',
      domain: process.env.PLATFORM_DOMAIN || 'app.ethenengine.com',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.tenants.set(defaultTenant.id, defaultTenant);

    const workspace: Workspace = {
      id: 'ws_prod',
      tenantId: defaultTenant.id,
      name: 'Production Workspace',
      environment: 'production',
      createdAt: new Date().toISOString(),
    };
    this.workspaces.set(workspace.id, workspace);

    // Rehydrate persisted tenants from disk / DB
    try {
      const persisted = PersistenceDriver.getInstance().getCollection<Tenant>('tenants');
      if (persisted && persisted.length > 0) {
        for (const t of persisted) {
          if (t && t.id && t.slug) {
            this.tenants.set(t.id, t);
          }
        }
      }
    } catch { /* early init fallback */ }
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

    // Save to PersistenceDriver disk snapshot and dual-write to PostgreSQL
    try {
      PersistenceDriver.getInstance().saveCollection('tenants', this.listTenants());
    } catch (e) {
      console.error('[CorePlatformManager] Failed to persist tenant to disk/DB:', e);
    }

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
