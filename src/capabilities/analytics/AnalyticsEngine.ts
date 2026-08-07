// Capabilities: Privacy-Preserving Analytics Subsystem

import crypto from 'crypto';
import { EventBus } from '../../foundation/EventBus.js';

export interface PageviewMetric {
  id: string;
  tenantId: string;
  path: string;
  anonymizedVisitorHash: string;
  timestamp: string;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private metrics: Map<string, PageviewMetric> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultMetrics();
  }

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  private seedDefaultMetrics() {
    this.trackPageview('tenant_default', '/preview/home', '127.0.0.1', 'Mozilla/5.0');
  }

  public trackPageview(tenantId: string, path: string, ipAddress: string, userAgent: string): PageviewMetric {
    // GDPR Compliance: Hash IP address + userAgent with salt so PII is never stored
    const salt = 'privacy_salt_2026';
    const anonymizedVisitorHash = crypto
      .createHash('sha256')
      .update(`${ipAddress}_${userAgent}_${salt}`)
      .digest('hex')
      .substring(0, 16);

    const metric: PageviewMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      path,
      anonymizedVisitorHash,
      timestamp: new Date().toISOString(),
    };

    this.metrics.set(metric.id, metric);
    this.eventBus.publish('analytics.pageview.tracked', metric, { tenantId });
    return metric;
  }

  public getSummary(tenantId: string) {
    const tenantMetrics = Array.from(this.metrics.values()).filter((m) => m.tenantId === tenantId);
    const totalViews = tenantMetrics.length;
    const uniqueVisitors = new Set(tenantMetrics.map((m) => m.anonymizedVisitorHash)).size;

    return {
      totalViews,
      uniqueVisitors,
      metrics: tenantMetrics,
    };
  }
}
