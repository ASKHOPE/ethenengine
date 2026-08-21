// Foundation: Adaptive Load Governor & Traffic Shedding Middleware
// Request Tier Prioritization, Concurrency Control & Graceful Degradation

import type { MiddlewareHandler } from 'hono';

export interface LoadGovernorStats {
  activeInFlightRequests: number;
  maxConcurrencyLimit: number;
  shedRequestsCount: number;
  currentLoadStatus: 'OPTIMAL' | 'ELEVATED' | 'SATURATED';
  tierSheddingThresholds: {
    tier1CriticalPct: number;    // Never shed (Auth, Checkout, Page View)
    tier2OperationalPct: number; // Shed at >85% capacity
    tier3NonCriticalPct: number; // Shed at >60% capacity (Analytics, Presence cursor, Sync logs)
  };
}

export class LoadGovernor {
  private static instance: LoadGovernor;
  private activeRequests = 0;
  private readonly MAX_CONCURRENT_REQUESTS = 250;
  private totalShedRequests = 0;

  private constructor() {}

  public static getInstance(): LoadGovernor {
    if (!LoadGovernor.instance) {
      LoadGovernor.instance = new LoadGovernor();
    }
    return LoadGovernor.instance;
  }

  public getRequestTier(path: string): 1 | 2 | 3 {
    // Tier 1: Mission Critical (Never drop)
    if (
      path.startsWith('/api/auth') ||
      path.startsWith('/api/commerce/checkout') ||
      path === '/' ||
      path.startsWith('/preview') ||
      path.startsWith('/login')
    ) {
      return 1;
    }

    // Tier 3: Non-Critical (Shed first under load)
    if (
      path.startsWith('/api/analytics') ||
      path.startsWith('/api/collab/heartbeat') ||
      path.startsWith('/api/core/sync-status') ||
      path.startsWith('/public')
    ) {
      return 3;
    }

    // Tier 2: Operational (Default CRUD)
    return 2;
  }

  public shouldShedRequest(path: string): boolean {
    const tier = this.getRequestTier(path);
    if (tier === 1) return false; // Never shed Tier 1

    const saturationPct = (this.activeRequests / this.MAX_CONCURRENT_REQUESTS) * 100;

    if (tier === 3 && saturationPct > 60) {
      this.totalShedRequests++;
      return true;
    }

    if (tier === 2 && saturationPct > 85) {
      this.totalShedRequests++;
      return true;
    }

    return false;
  }

  public getStats(): LoadGovernorStats {
    const saturationPct = (this.activeRequests / this.MAX_CONCURRENT_REQUESTS) * 100;
    const status = saturationPct > 85 ? 'SATURATED' : saturationPct > 60 ? 'ELEVATED' : 'OPTIMAL';

    return {
      activeInFlightRequests: this.activeRequests,
      maxConcurrencyLimit: this.MAX_CONCURRENT_REQUESTS,
      shedRequestsCount: this.totalShedRequests,
      currentLoadStatus: status,
      tierSheddingThresholds: {
        tier1CriticalPct: 100,
        tier2OperationalPct: 85,
        tier3NonCriticalPct: 60,
      },
    };
  }

  // Middleware generator
  public static middleware(): MiddlewareHandler {
    const governor = LoadGovernor.getInstance();

    return async (c, next) => {
      const path = c.req.path;

      if (governor.shouldShedRequest(path)) {
        return c.json(
          {
            error: 'Service Overloaded / Load Shed Active',
            message: 'Adaptive load shedding in effect. Non-critical telemetry/background requests are throttled to preserve core platform stability.',
            retryAfterSeconds: 5,
          },
          429
        );
      }

      governor.activeRequests++;
      try {
        await next();
      } finally {
        governor.activeRequests = Math.max(0, governor.activeRequests - 1);
      }
    };
  }
}
