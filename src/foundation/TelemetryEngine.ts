// Telemetry Engine for Database Connection Health, Runtime Stats, and Subsystem Metrics

import { AivenPostgresEngine } from '../db/aivenPostgres.js';

export interface SystemTelemetry {
  database: {
    connected: boolean;
    provider: string;
    host: string;
    sslMode: string;
    maxPoolSize: number;
    dbName: string;
  };
  runtime: {
    version: string;
    uptimeSeconds: number;
    memoryUsageMB: number;
    platform: string;
    arch: string;
  };
  metrics: {
    totalRequests: number;
    activeTenantsCount: number;
  };
}

export class TelemetryEngine {
  private static instance: TelemetryEngine;
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private postgres = AivenPostgresEngine.getInstance();

  private constructor() {}

  public static getInstance(): TelemetryEngine {
    if (!TelemetryEngine.instance) {
      TelemetryEngine.instance = new TelemetryEngine();
    }
    return TelemetryEngine.instance;
  }

  public incrementRequestCount() {
    this.requestCount++;
  }

  public getTelemetry(tenantsCount: number = 2): SystemTelemetry {
    const memory = process.memoryUsage();
    const isCloud = this.postgres.isCloudConnected();

    return {
      database: {
        connected: isCloud,
        provider: 'Aiven Cloud PostgreSQL',
        host: 'ethenengineversionone-ethenengine.c.aivencloud.com:17252',
        sslMode: 'TLSv1.3 (SSL Enabled)',
        maxPoolSize: 15,
        dbName: 'defaultdb',
      },
      runtime: {
        version: typeof (globalThis as any).Bun !== 'undefined' ? `Bun v${(globalThis as any).Bun.version}` : `Node ${process.version}`,
        uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
        memoryUsageMB: Math.round(memory.rss / (1024 * 1024)),
        platform: process.platform,
        arch: process.arch,
      },
      metrics: {
        totalRequests: this.requestCount,
        activeTenantsCount: tenantsCount,
      },
    };
  }
}
