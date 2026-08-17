// Foundation: Watchdog Sentinel Engine
// Real-Time Anomaly Detection, Stack Trace Aggregator, Circuit Breakers & Auto-Healing

export interface RuntimeIncident {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'unhandled_exception' | 'error_spike' | 'latency_anomaly' | 'circuit_trip' | 'memory_warning';
  subsystem: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  autoHealed?: boolean;
}

export interface CircuitBreakerState {
  subsystem: string;
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  threshold: number;
  resetTimeoutMs: number;
}

export interface AnomalyMetrics {
  totalRequests: number;
  errorCount: number;
  errorRate: string;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  memoryUsageMb: number;
  uptimeSeconds: number;
}

export class WatchdogEngine {
  private static instance: WatchdogEngine;
  private incidents: RuntimeIncident[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private requestLatencies: number[] = [];
  private totalRequests = 0;
  private errorRequests = 0;
  private startTime = Date.now();

  // Circuit breaker configurations
  private readonly DEFAULT_FAILURE_THRESHOLD = 5;
  private readonly DEFAULT_RESET_TIMEOUT = 30000; // 30 seconds

  private constructor() {
    this.initDefaultCircuitBreakers();
    this.setupProcessLevelWatchers();
  }

  public static getInstance(): WatchdogEngine {
    if (!WatchdogEngine.instance) {
      WatchdogEngine.instance = new WatchdogEngine();
    }
    return WatchdogEngine.instance;
  }

  private initDefaultCircuitBreakers(): void {
    const subsystems = ['commerce', 'inventory', 'crm', 'erp', 'accounting', 'cms', 'website', 'sync', 'comms'];
    for (const sub of subsystems) {
      this.circuitBreakers.set(sub, {
        subsystem: sub,
        status: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0,
        threshold: this.DEFAULT_FAILURE_THRESHOLD,
        resetTimeoutMs: this.DEFAULT_RESET_TIMEOUT,
      });
    }
  }

  private setupProcessLevelWatchers(): void {
    // Process-level unhandled rejection watchdog
    process.on('unhandledRejection', (reason: any) => {
      this.recordIncident({
        severity: 'high',
        type: 'unhandled_exception',
        subsystem: 'process_runtime',
        message: `Unhandled Promise Rejection: ${reason?.message || String(reason)}`,
        stack: reason?.stack || 'No stack trace available',
      });
    });

    // Process-level uncaught exception watchdog
    process.on('uncaughtException', (err: Error) => {
      this.recordIncident({
        severity: 'critical',
        type: 'unhandled_exception',
        subsystem: 'process_runtime',
        message: `Uncaught Exception: ${err.message}`,
        stack: err.stack,
      });
    });
  }

  // ============================================================
  // Request Telemetry & Anomaly Tracking
  // ============================================================
  public trackRequest(durationMs: number, statusCode: number, route: string, subsystem = 'core'): void {
    this.totalRequests++;
    this.requestLatencies.push(durationMs);
    if (this.requestLatencies.length > 1000) {
      this.requestLatencies.shift();
    }

    if (statusCode >= 500) {
      this.errorRequests++;
      this.recordSubsystemFailure(subsystem, `HTTP ${statusCode} on ${route}`);
    } else {
      this.recordSubsystemSuccess(subsystem);
    }

    // Latency anomaly detector (>2500ms is flagged as high-latency outlier)
    if (durationMs > 2500) {
      this.recordIncident({
        severity: 'medium',
        type: 'latency_anomaly',
        subsystem,
        message: `High latency detected on ${route}: ${Math.round(durationMs)}ms (Threshold: 2500ms)`,
        context: { durationMs, route, statusCode },
      });
    }
  }

  // ============================================================
  // Incident & Stack Trace Recording
  // ============================================================
  public recordIncident(incident: Omit<RuntimeIncident, 'id' | 'timestamp'>): RuntimeIncident {
    const fullIncident: RuntimeIncident = {
      ...incident,
      id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      autoHealed: false,
    };

    this.incidents.unshift(fullIncident);
    if (this.incidents.length > 200) {
      this.incidents.pop();
    }

    return fullIncident;
  }

  public listIncidents(limit = 50): RuntimeIncident[] {
    return this.incidents.slice(0, limit);
  }

  // ============================================================
  // Subsystem Circuit Breakers
  // ============================================================
  public isCircuitOpen(subsystem: string): boolean {
    const breaker = this.circuitBreakers.get(subsystem);
    if (!breaker) return false;

    if (breaker.status === 'OPEN') {
      const now = Date.now();
      if (now - breaker.lastFailureTime > breaker.resetTimeoutMs) {
        breaker.status = 'HALF_OPEN';
        return false;
      }
      return true;
    }

    return false;
  }

  public recordSubsystemFailure(subsystem: string, reason: string): void {
    const breaker = this.circuitBreakers.get(subsystem);
    if (!breaker) return;

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= breaker.threshold && breaker.status !== 'OPEN') {
      breaker.status = 'OPEN';
      this.recordIncident({
        severity: 'high',
        type: 'circuit_trip',
        subsystem,
        message: `Circuit Breaker TRIPPED for ${subsystem} after ${breaker.failureCount} consecutive failures. Reason: ${reason}`,
      });
    }
  }

  public recordSubsystemSuccess(subsystem: string): void {
    const breaker = this.circuitBreakers.get(subsystem);
    if (!breaker) return;

    if (breaker.status === 'HALF_OPEN') {
      breaker.status = 'CLOSED';
      breaker.failureCount = 0;
      this.recordIncident({
        severity: 'low',
        type: 'circuit_trip',
        subsystem,
        message: `Circuit Breaker for ${subsystem} recovered to CLOSED state.`,
      });
    } else if (breaker.failureCount > 0) {
      breaker.failureCount = Math.max(0, breaker.failureCount - 1);
    }
  }

  public getCircuitBreakers(): CircuitBreakerState[] {
    return Array.from(this.circuitBreakers.values());
  }

  // ============================================================
  // Metrics & Health Evaluation
  // ============================================================
  public getMetrics(): AnomalyMetrics {
    const sorted = [...this.requestLatencies].sort((a, b) => a - b);
    const count = sorted.length;

    const p50 = count > 0 ? sorted[Math.floor(count * 0.5)] : 0;
    const p95 = count > 0 ? sorted[Math.floor(count * 0.95)] : 0;
    const p99 = count > 0 ? sorted[Math.floor(count * 0.99)] : 0;

    const memoryMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const errorRatePct = this.totalRequests > 0 ? ((this.errorRequests / this.totalRequests) * 100).toFixed(2) + '%' : '0.00%';

    return {
      totalRequests: this.totalRequests,
      errorCount: this.errorRequests,
      errorRate: errorRatePct,
      p50LatencyMs: Math.round(p50),
      p95LatencyMs: Math.round(p95),
      p99LatencyMs: Math.round(p99),
      memoryUsageMb: memoryMb,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  public getHealthStatus(): { status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL'; summary: string; openCircuits: string[] } {
    const openCircuits = Array.from(this.circuitBreakers.values())
      .filter((b) => b.status === 'OPEN')
      .map((b) => b.subsystem);

    const mem = this.getMetrics().memoryUsageMb;
    const isCritical = openCircuits.length >= 3 || mem > 1024;
    const isDegraded = openCircuits.length > 0 || mem > 512;

    const status = isCritical ? 'CRITICAL' : isDegraded ? 'DEGRADED' : 'HEALTHY';
    const summary =
      status === 'HEALTHY'
        ? 'All subsystems running nominally.'
        : status === 'DEGRADED'
        ? `Degraded subsystems detected: ${openCircuits.join(', ')}`
        : `CRITICAL platform state: multiple subsystems failing or memory exhaustion!`;

    return { status, summary, openCircuits };
  }

  // ============================================================
  // Auto-Healing Engine
  // ============================================================
  public executeAutoHealing(): { healedActions: string[]; restoredSubsystems: string[] } {
    const healedActions: string[] = [];
    const restoredSubsystems: string[] = [];

    // 1. Reset Open Circuit Breakers
    for (const [sub, breaker] of this.circuitBreakers.entries()) {
      if (breaker.status !== 'CLOSED') {
        breaker.status = 'CLOSED';
        breaker.failureCount = 0;
        restoredSubsystems.push(sub);
      }
    }
    if (restoredSubsystems.length > 0) {
      healedActions.push(`Reset circuit breakers for: ${restoredSubsystems.join(', ')}`);
    }

    // 2. Garbage Collection Trigger (if available)
    if (typeof (global as any).gc === 'function') {
      (global as any).gc();
      healedActions.push('Forced V8 garbage collection cycle');
    }

    // 3. Clear transient latency buffers
    this.requestLatencies = this.requestLatencies.slice(-100);
    healedActions.push('Flushed transient telemetry sample buffers');

    // 4. Record auto-heal incident
    this.recordIncident({
      severity: 'low',
      type: 'circuit_trip',
      subsystem: 'auto_healer',
      message: `Auto-healing executed successfully. Actions: ${healedActions.join(' | ')}`,
      autoHealed: true,
    });

    return { healedActions, restoredSubsystems };
  }
}
