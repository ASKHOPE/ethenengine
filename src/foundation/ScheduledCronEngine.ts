// Foundation: Native Bun 1.4 Scheduled Job and Cron Engine

import { Logger } from './Logger.js';
import { DisasterRecoveryEngine } from './DisasterRecoveryEngine.js';
import { TelemetryEngine } from './TelemetryEngine.js';
import { SyncEngine } from './SyncEngine.js';

export interface CronJobStatus {
  name: string;
  expression: string;
  lastRun?: string;
  runCount: number;
  lastStatus: 'success' | 'failed' | 'pending';
}

export class ScheduledCronEngine {
  private static instance: ScheduledCronEngine;
  private logger = Logger.getInstance();
  private jobs: Map<string, CronJobStatus> = new Map();
  private timerHandles: any[] = [];

  private constructor() {}

  public static getInstance(): ScheduledCronEngine {
    if (!ScheduledCronEngine.instance) {
      ScheduledCronEngine.instance = new ScheduledCronEngine();
    }
    return ScheduledCronEngine.instance;
  }

  /**
   * Initialize native Bun 1.4 cron tasks
   */
  public initializeJobs(): void {
    this.logger.info('[ScheduledCronEngine] Booting native Bun 1.4 scheduled cron jobs');

    // 1. Hourly Disaster Recovery Tenant Snapshot drill & backup
    this.registerJob('tenant_snapshot_backup', '0 * * * *', async () => {
      try {
        const dr = DisasterRecoveryEngine.getInstance();
        await dr.createBackup('tenant_default');
        this.logger.info('[ScheduledCronEngine] Automated hourly disaster recovery snapshot complete');
      } catch (err: any) {
        this.logger.error(`[ScheduledCronEngine] Backup job failed: ${err.message}`);
      }
    });

    // 2. Health & Dual-Write DB Sync Check every 10 minutes
    this.registerJob('db_sync_health_check', '*/10 * * * *', async () => {
      try {
        const sync = SyncEngine.getInstance();
        const stats = sync.getStats();
        this.logger.info(`[ScheduledCronEngine] Sync check: ${stats.dockerWrites + stats.aivenWrites} ops, queue ${stats.retryQueueDepth}`);
      } catch (err: any) {
        this.logger.error(`[ScheduledCronEngine] Sync health check failed: ${err.message}`);
      }
    });

    // 3. Telemetry stats logging every 30 minutes
    this.registerJob('telemetry_heartbeat', '*/30 * * * *', async () => {
      try {
        const telemetry = TelemetryEngine.getInstance();
        const stats = telemetry.getTelemetry(1);
        this.logger.info(`[ScheduledCronEngine] Heartbeat Telemetry: ${stats.metrics.totalRequests} reqs served`);
      } catch (err: any) {
        this.logger.error(`[ScheduledCronEngine] Telemetry job failed: ${err.message}`);
      }
    });
  }

  private registerJob(name: string, expression: string, task: () => Promise<void> | void): void {
    const jobStatus: CronJobStatus = {
      name,
      expression,
      runCount: 0,
      lastStatus: 'pending',
    };
    this.jobs.set(name, jobStatus);

    // If native Bun.cron exists (Bun v1.4+)
    if (typeof Bun !== 'undefined' && typeof (Bun as any).cron === 'function') {
      try {
        (Bun as any).cron(expression, async () => {
          jobStatus.lastRun = typeof (globalThis as any).Temporal !== 'undefined'
            ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
            : new Date().toISOString();
          jobStatus.runCount++;
          try {
            await task();
            jobStatus.lastStatus = 'success';
          } catch (err) {
            jobStatus.lastStatus = 'failed';
          }
        });
        this.logger.info(`[ScheduledCronEngine] Registered Bun.cron job [${name}] with schedule [${expression}]`);
        return;
      } catch (e) {
        this.logger.warn(`[ScheduledCronEngine] Bun.cron not available, falling back to interval`);
      }
    }

    // Interval fallback for runtimes where native cron syntax isn't natively bound
    const intervalMs = 60 * 1000 * 5; // 5 minutes fallback
    const handle = setInterval(async () => {
      jobStatus.lastRun = new Date().toISOString();
      jobStatus.runCount++;
      try {
        await task();
        jobStatus.lastStatus = 'success';
      } catch (err) {
        jobStatus.lastStatus = 'failed';
      }
    }, intervalMs);

    this.timerHandles.push(handle);
  }

  public getJobStatuses(): CronJobStatus[] {
    return Array.from(this.jobs.values());
  }

  public stopAll(): void {
    for (const h of this.timerHandles) {
      clearInterval(h);
    }
    this.timerHandles = [];
  }
}
