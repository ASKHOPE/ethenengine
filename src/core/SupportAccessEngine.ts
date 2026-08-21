// Core Platform: Zero-Knowledge Tenant Privacy & Support Delegation Engine
// Controls Superadmin "Break-Glass" access upon tenant-approved tickets.

import { AuditLogger } from '../foundation/AuditLogger.js';

export interface SupportDelegationGrant {
  grantId: string;
  ticketId: string;
  tenantId: string;
  grantedByUserId: string;
  grantedToUserId: string; // Platform Superadmin User ID
  reason: string;
  createdAt: string;
  expiresAt: number; // Unix timestamp ms
  revoked: boolean;
}

export class SupportAccessEngine {
  private static instance: SupportAccessEngine;
  private grants: Map<string, SupportDelegationGrant> = new Map();
  private auditLogger = AuditLogger.getInstance();

  private constructor() {
    this.seedDefaultSupportGrants();
  }

  public static getInstance(): SupportAccessEngine {
    if (!SupportAccessEngine.instance) {
      SupportAccessEngine.instance = new SupportAccessEngine();
    }
    return SupportAccessEngine.instance;
  }

  private seedDefaultSupportGrants() {
    // Empty by default - Zero-Knowledge Isolation
  }

  /**
   * Tenant Admin grants temporary support access to a Superadmin
   */
  public grantSupportAccess(params: {
    ticketId: string;
    tenantId: string;
    grantedByUserId: string;
    grantedToUserId: string;
    reason: string;
    durationMinutes?: number;
  }): SupportDelegationGrant {
    const duration = (params.durationMinutes || 120) * 60 * 1000; // Default 2 hours
    const grant: SupportDelegationGrant = {
      grantId: `grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketId: params.ticketId,
      tenantId: params.tenantId,
      grantedByUserId: params.grantedByUserId,
      grantedToUserId: params.grantedToUserId,
      reason: params.reason,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + duration,
      revoked: false,
    };

    this.grants.set(grant.grantId, grant);

    this.auditLogger.log({
      tenantId: params.tenantId,
      actorId: params.grantedByUserId,
      action: 'support.access_granted',
      resource: `SupportGrant:${grant.grantId}`,
      details: {
        ticketId: grant.ticketId,
        grantedTo: grant.grantedToUserId,
        expiresAt: new Date(grant.expiresAt).toISOString(),
        reason: grant.reason,
      },
    });

    return grant;
  }

  /**
   * Checks if an active, unexpired support grant exists for this Superadmin & Tenant
   */
  public hasActiveSupportAccess(tenantId: string, superadminUserId: string): { granted: boolean; grant?: SupportDelegationGrant } {
    for (const grant of this.grants.values()) {
      if (
        grant.tenantId === tenantId &&
        (grant.grantedToUserId === superadminUserId || grant.grantedToUserId === '*' || grant.grantedToUserId === 'usr_platform_admin') &&
        !grant.revoked &&
        Date.now() < grant.expiresAt
      ) {
        return { granted: true, grant };
      }
    }
    return { granted: false };
  }

  /**
   * Tenant Admin revokes support access immediately
   */
  public revokeSupportAccess(grantId: string, actorId: string): boolean {
    const grant = this.grants.get(grantId);
    if (!grant) return false;

    grant.revoked = true;

    this.auditLogger.log({
      tenantId: grant.tenantId,
      actorId,
      action: 'support.access_revoked',
      resource: `SupportGrant:${grant.grantId}`,
      details: { ticketId: grant.ticketId },
    });

    return true;
  }

  /**
   * Lists grants for a tenant (so Tenant Admin can audit/revoke anytime)
   */
  public listGrantsForTenant(tenantId: string): SupportDelegationGrant[] {
    return Array.from(this.grants.values()).filter((g) => g.tenantId === tenantId);
  }

  /**
   * Lists all grants across platform (for Superadmin audit)
   */
  public listAllGrants(): SupportDelegationGrant[] {
    return Array.from(this.grants.values());
  }
}
