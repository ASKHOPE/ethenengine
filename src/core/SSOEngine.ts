// Core Platform: SAML 2.0 & OIDC Enterprise SSO Engine

import { EventBus } from '../foundation/EventBus.js';

export type SSOProtocol = 'SAML2' | 'OIDC';

export interface IdentityProviderConfig {
  id: string;
  tenantId: string;
  providerName: string; // Okta, Azure AD, Google Workspace
  protocol: SSOProtocol;
  entryPointUrl: string;
  certificateIssuer: string;
  enabled: boolean;
}

export class SSOEngine {
  private static instance: SSOEngine;
  private idpConfigs: Map<string, IdentityProviderConfig> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultIdP();
  }

  public static getInstance(): SSOEngine {
    if (!SSOEngine.instance) {
      SSOEngine.instance = new SSOEngine();
    }
    return SSOEngine.instance;
  }

  private seedDefaultIdP() {
    const defaultIdP: IdentityProviderConfig = {
      id: 'idp_okta',
      tenantId: 'tenant_default',
      providerName: 'Okta Enterprise SSO',
      protocol: 'SAML2',
      entryPointUrl: 'https://acme.okta.com/app/sso/saml',
      certificateIssuer: 'http://www.okta.com/exk123',
      enabled: true,
    };
    this.idpConfigs.set(defaultIdP.id, defaultIdP);
  }

  public registerIdP(config: Omit<IdentityProviderConfig, 'id'>): IdentityProviderConfig {
    const idp: IdentityProviderConfig = {
      ...config,
      id: `idp_${Date.now()}`,
    };
    this.idpConfigs.set(idp.id, idp);
    this.eventBus.publish('enterprise.sso.registered', idp, { tenantId: config.tenantId });
    return idp;
  }

  public getIdPConfig(tenantId: string): IdentityProviderConfig | undefined {
    for (const idp of this.idpConfigs.values()) {
      if (idp.tenantId === tenantId && idp.enabled) return idp;
    }
    return undefined;
  }
}
