// Phase 3 Capability: Telemetry, Web Analytics & A/B Split Testing Engine

export interface PageviewEvent {
  id: string;
  tenantId: string;
  pageSlug: string;
  variantId?: 'A' | 'B';
  referrer: string;
  userAgent: string;
  timestamp: number;
}

export interface ConversionEvent {
  id: string;
  tenantId: string;
  pageSlug: string;
  variantId?: 'A' | 'B';
  goalType: 'form_submit' | 'cart_checkout' | 'cta_click';
  value?: number;
  timestamp: number;
}

export interface ABExperiment {
  id: string;
  tenantId: string;
  pageSlug: string;
  name: string;
  variantA_Name: string;
  variantB_Name: string;
  trafficSplitRatio: number; // e.g. 0.5 for 50/50
  status: 'active' | 'paused' | 'concluded';
  createdAt: string;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private pageviews: PageviewEvent[] = [];
  private conversions: ConversionEvent[] = [];
  private experiments: Map<string, ABExperiment> = new Map();

  private constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  private seedDefaultData() {
    const exp: ABExperiment = {
      id: 'exp_homepage_cta',
      tenantId: 'tenant_default',
      pageSlug: 'home',
      name: 'Homepage Hero CTA Optimization',
      variantA_Name: 'Start 14-Day Enterprise Trial (Indigo Glow)',
      variantB_Name: 'Claim 20% Off Limited Pass (Sunset Bronze)',
      trafficSplitRatio: 0.5,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.experiments.set(exp.id, exp);
  }

  public trackPageview(event: Omit<PageviewEvent, 'id' | 'timestamp'>): PageviewEvent {
    const pageview: PageviewEvent = {
      ...event,
      id: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    this.pageviews.push(pageview);
    if (this.pageviews.length > 5000) this.pageviews.shift();
    return pageview;
  }

  public trackConversion(event: Omit<ConversionEvent, 'id' | 'timestamp'>): ConversionEvent {
    const conversion: ConversionEvent = {
      ...event,
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    this.conversions.push(conversion);
    if (this.conversions.length > 2000) this.conversions.shift();
    return conversion;
  }

  public getSummary(tenantId: string, pageSlug?: string) {
    const filteredViews = this.pageviews.filter(p => p.tenantId === tenantId && (!pageSlug || p.pageSlug === pageSlug));
    const filteredConvs = this.conversions.filter(c => c.tenantId === tenantId && (!pageSlug || c.pageSlug === pageSlug));

    const totalViews = filteredViews.length;
    const totalConversions = filteredConvs.length;
    const conversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) + '%' : '0.00%';

    // Breakdown by A/B Variants
    const variantA_Views = filteredViews.filter(v => v.variantId === 'A').length;
    const variantA_Convs = filteredConvs.filter(c => c.variantId === 'A').length;
    const variantA_Rate = variantA_Views > 0 ? ((variantA_Convs / variantA_Views) * 100).toFixed(1) + '%' : '0.0%';

    const variantB_Views = filteredViews.filter(v => v.variantId === 'B').length;
    const variantB_Convs = filteredConvs.filter(c => c.variantId === 'B').length;
    const variantB_Rate = variantB_Views > 0 ? ((variantB_Convs / variantB_Views) * 100).toFixed(1) + '%' : '0.0%';

    return {
      totalViews,
      totalConversions,
      conversionRate,
      variants: {
        variantA: { views: variantA_Views, conversions: variantA_Convs, rate: variantA_Rate },
        variantB: { views: variantB_Views, conversions: variantB_Convs, rate: variantB_Rate },
      },
    };
  }

  public listExperiments(tenantId: string): ABExperiment[] {
    return Array.from(this.experiments.values()).filter(e => e.tenantId === tenantId);
  }

  public createExperiment(exp: Omit<ABExperiment, 'id' | 'createdAt'>): ABExperiment {
    const experiment: ABExperiment = {
      ...exp,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.experiments.set(experiment.id, experiment);
    return experiment;
  }
}
