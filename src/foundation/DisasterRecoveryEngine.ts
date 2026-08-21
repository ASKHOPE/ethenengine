// Foundation: Disaster Recovery & Service Outage Failover Engine
// High-Availability Outage Detection, Degraded Read-Only Failover & Health Probing

export interface OutageStatus {
  serviceName: string;
  isAvailable: boolean;
  lastChecked: number;
  failureReason?: string;
}

export class DisasterRecoveryEngine {
  private static instance: DisasterRecoveryEngine;
  private isFailoverModeActive = false;
  private failoverReason = '';
  private serviceProbes: Map<string, OutageStatus> = new Map();
  private inMemoryFailoverCache: Map<string, any> = new Map();

  private constructor() {
    this.initDefaultProbes();
  }

  public static getInstance(): DisasterRecoveryEngine {
    if (!DisasterRecoveryEngine.instance) {
      DisasterRecoveryEngine.instance = new DisasterRecoveryEngine();
    }
    return DisasterRecoveryEngine.instance;
  }

  private initDefaultProbes(): void {
    const services = [
      'primary_database',
      'search_indexer',
      'media_cdn',
      'email_gateway',
      'payment_processor',
      'event_stream',
    ];
    for (const s of services) {
      this.serviceProbes.set(s, {
        serviceName: s,
        isAvailable: true,
        lastChecked: Date.now(),
      });
    }
  }

  public isFailoverActive(): boolean {
    return this.isFailoverModeActive;
  }

  public getFailoverReason(): string {
    return this.failoverReason;
  }

  public triggerFailover(reason: string): void {
    this.isFailoverModeActive = true;
    this.failoverReason = reason;
  }

  public resolveFailover(): void {
    this.isFailoverModeActive = false;
    this.failoverReason = '';
  }

  public updateServiceHealth(service: string, available: boolean, failureReason?: string): void {
    const current = this.serviceProbes.get(service) || {
      serviceName: service,
      isAvailable: available,
      lastChecked: Date.now(),
    };
    current.isAvailable = available;
    current.lastChecked = Date.now();
    current.failureReason = failureReason;
    this.serviceProbes.set(service, current);

    // Auto-trigger DR failover if primary storage goes down
    if (service === 'primary_database' && !available && !this.isFailoverModeActive) {
      this.triggerFailover(`Automatic DR Failover triggered: Primary database unavailable (${failureReason || 'Connection timeout'})`);
    } else if (service === 'primary_database' && available && this.isFailoverModeActive) {
      this.resolveFailover();
    }
  }

  public listServiceHealth(): OutageStatus[] {
    return Array.from(this.serviceProbes.values());
  }

  // ============================================================
  // In-Memory Failover Cache (Graceful Read-Only Degradation)
  // ============================================================
  public cacheSnapshot(key: string, data: any): void {
    this.inMemoryFailoverCache.set(key, {
      data,
      cachedAt: Date.now(),
    });
  }

  public getCachedFallback(key: string): any {
    const entry = this.inMemoryFailoverCache.get(key);
    return entry ? entry.data : null;
  }
}
