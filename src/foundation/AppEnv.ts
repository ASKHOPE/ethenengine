import { Tenant } from '../core/CorePlatformManager.js';
import { UnifiedAuthContext } from '../core/UnifiedAuthGateway.js';

export type AppEnv = {
  Variables: {
    tenant: Tenant;
    userContext?: UnifiedAuthContext;
    [key: string]: any;
  };
};
