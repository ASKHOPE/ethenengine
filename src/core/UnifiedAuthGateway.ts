// Core Platform: Unified Multi-Tenant Subscription & Auth Gateway
// Unified Claims Contract: Both In-House Auth and Keycloak OIDC issue identical JWT Claims.

import jwt from 'jsonwebtoken';
import { AuthTokenEngine, AuthTokenPayload } from './AuthTokenEngine.js';
import { HierarchyManager } from './HierarchyManager.js';
import { SSOEngine } from './SSOEngine.js';
import { IdentityEngine, UserIdentity } from './IdentityEngine.js';

export interface UnifiedAuthContext {
  user: AuthTokenPayload;
  provider: 'IN_HOUSE' | 'KEYCLOAK_OIDC' | 'ENTERPRISE_SAML';
  subscriptionPlan: 'pro' | 'enterprise';
}

export class UnifiedAuthGateway {
  private static instance: UnifiedAuthGateway;
  private hierarchyManager = HierarchyManager.getInstance();
  private ssoEngine = SSOEngine.getInstance();
  private identityEngine = IdentityEngine.getInstance();

  private constructor() {}

  public static getInstance(): UnifiedAuthGateway {
    if (!UnifiedAuthGateway.instance) {
      UnifiedAuthGateway.instance = new UnifiedAuthGateway();
    }
    return UnifiedAuthGateway.instance;
  }

  // Unified Token Verification Middleware (Accepts both In-House and Keycloak Tokens)
  public verifyTokenAndResolveContext(token: string): UnifiedAuthContext | null {
    // 1. Try In-House Token Verification
    const inHousePayload = AuthTokenEngine.verifyToken(token);
    if (inHousePayload) {
      const tenant = inHousePayload.tenantId ? this.hierarchyManager.getTenant(inHousePayload.tenantId) : undefined;
      const org = tenant ? this.hierarchyManager.getOrganization(tenant.orgId) : undefined;
      const plan = org ? org.subscriptionPlan : 'pro';

      return {
        user: inHousePayload,
        provider: 'IN_HOUSE',
        subscriptionPlan: plan,
      };
    }

    // 2. Try Keycloak / OIDC Decoding (Decodes Keycloak JWT claims into standard AuthTokenPayload)
    try {
      const decodedKeycloak = jwt.decode(token) as any;
      if (decodedKeycloak && (decodedKeycloak.iss?.includes('keycloak') || decodedKeycloak.preferred_username)) {
        const payload: AuthTokenPayload = {
          userId: decodedKeycloak.sub || decodedKeycloak.preferred_username,
          type: 'TENANT_USER',
          email: decodedKeycloak.email || `${decodedKeycloak.preferred_username}@enterprise.local`,
          tenantId: decodedKeycloak.tenantId || 'tenant_default',
          orgId: decodedKeycloak.orgId || 'org_acme',
          roles: decodedKeycloak.realm_access?.roles || ['enterprise_user'],
        };

        return {
          user: payload,
          provider: 'KEYCLOAK_OIDC',
          subscriptionPlan: 'enterprise',
        };
      }
    } catch (err) {
      // Token decode failed
    }

    return null;
  }

  // Smart Login Gateway Router (Enforces Enterprise SSO when enabled for tenant)
  public processLoginRequest(params: {
    email: string;
    password?: string;
    tenantId: string;
  }): {
    action: 'AUTHENTICATED' | 'REDIRECT_TO_KEYCLOAK';
    token?: string;
    user?: Partial<UserIdentity>;
    ssoUrl?: string;
    subscriptionPlan: 'pro' | 'enterprise';
  } {
    const tenant = this.hierarchyManager.getTenant(params.tenantId);
    const org = tenant ? this.hierarchyManager.getOrganization(tenant.orgId) : undefined;
    const subscriptionPlan = org ? org.subscriptionPlan : 'pro';

    // 1. Enterprise Plan Check: If Enterprise tenant has SSO configured and user requests SSO redirect
    if (subscriptionPlan === 'enterprise') {
      const idPConfig = this.ssoEngine.getIdPConfig(params.tenantId);
      if (idPConfig && idPConfig.enabled && !params.password) {
        return {
          action: 'REDIRECT_TO_KEYCLOAK',
          ssoUrl: `${idPConfig.entryPointUrl}?tenant=${params.tenantId}&email=${encodeURIComponent(params.email)}`,
          subscriptionPlan: 'enterprise',
        };
      }
    }

    // 2. Free / Pro Plan: Execute In-House Password Check
    if (!params.password) {
      throw new Error('Password required for standard authentication.');
    }

    const user = this.identityEngine.authenticateWithPassword(params.email, params.password);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const token = AuthTokenEngine.generateToken(user);
    return {
      action: 'AUTHENTICATED',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        tenantId: user.tenantId,
        roles: user.roles,
      },
      subscriptionPlan,
    };
  }
}
