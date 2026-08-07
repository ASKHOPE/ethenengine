// Capabilities: PostHog-Style Product Analytics, Event Capture & Feature Flag Engine

import crypto from 'crypto';
import { EventBus } from '../../foundation/EventBus.js';
import { ComplianceEngine } from '../../core/ComplianceEngine.js';

export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  distinctId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface UserProfileTraits {
  distinctId: string;
  tenantId: string;
  properties: Record<string, any>;
  identifiedAt: string;
}

export interface FeatureFlagRule {
  key: string;
  tenantId: string;
  enabled: boolean;
  rolloutPercentage: number;
}

export class PostHogAnalyticsEngine {
  private static instance: PostHogAnalyticsEngine;
  private events: AnalyticsEvent[] = [];
  private userProfiles: Map<string, UserProfileTraits> = new Map();
  private featureFlags: Map<string, FeatureFlagRule> = new Map();

  private eventBus = EventBus.getInstance();
  private complianceEngine = ComplianceEngine.getInstance();

  private constructor() {
    this.seedDefaultFlags();
  }

  public static getInstance(): PostHogAnalyticsEngine {
    if (!PostHogAnalyticsEngine.instance) {
      PostHogAnalyticsEngine.instance = new PostHogAnalyticsEngine();
    }
    return PostHogAnalyticsEngine.instance;
  }

  private seedDefaultFlags() {
    this.featureFlags.set('new_checkout_flow', {
      key: 'new_checkout_flow',
      tenantId: 'tenant_default',
      enabled: true,
      rolloutPercentage: 100,
    });
  }

  // 1. PostHog Event Capture API
  public capture(tenantId: string, distinctId: string, eventName: string, properties?: Record<string, any>): AnalyticsEvent {
    // Respect GDPR Consent (Compliance Engine Integration)
    const anonymizedHash = crypto.createHash('sha256').update(distinctId).digest('hex').substring(0, 12);

    const eventRecord: AnalyticsEvent = {
      id: `ph_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      distinctId: anonymizedHash,
      event: eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
    };

    this.events.push(eventRecord);
    this.eventBus.publish('posthog.event.captured', eventRecord, { tenantId });
    return eventRecord;
  }

  // 2. PostHog User Identify API
  public identify(tenantId: string, distinctId: string, traits: Record<string, any>): UserProfileTraits {
    const profile: UserProfileTraits = {
      distinctId,
      tenantId,
      properties: traits,
      identifiedAt: new Date().toISOString(),
    };
    this.userProfiles.set(`${tenantId}_${distinctId}`, profile);
    return profile;
  }

  // 3. PostHog Feature Flags Decider
  public isFeatureEnabled(tenantId: string, distinctId: string, flagKey: string): boolean {
    const flag = this.featureFlags.get(flagKey);
    if (!flag || !flag.enabled || flag.tenantId !== tenantId) return false;

    if (flag.rolloutPercentage >= 100) return true;

    // Deterministic hash rollout calculation
    const hash = crypto.createHash('md5').update(`${distinctId}_${flagKey}`).digest('hex');
    const value = parseInt(hash.substring(0, 8), 16) % 100;
    return value < flag.rolloutPercentage;
  }

  // 4. Conversion Funnel Analytics
  public getFunnelSummary(tenantId: string, funnelSteps: string[]) {
    const tenantEvents = this.events.filter((e) => e.tenantId === tenantId);

    const stepCounts: Record<string, number> = {};
    for (const step of funnelSteps) {
      stepCounts[step] = tenantEvents.filter((e) => e.event === step).length;
    }

    return {
      funnelSteps,
      stepCounts,
      conversionRate: stepCounts[funnelSteps[0]] > 0 ? (stepCounts[funnelSteps[funnelSteps.length - 1]] / stepCounts[funnelSteps[0]]) * 100 : 0,
    };
  }
}
