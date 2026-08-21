// Foundation: Disaster Recovery & Backup Subsystem

import fs from 'fs';
import path from 'path';
import { EventBus } from './EventBus.js';
import { Logger } from './Logger.js';
import { PersistenceDriver } from './PersistenceDriver.js';

export interface BackupMetadata {
  backupId: string;
  tenantId: string;
  createdAt: string;
  sizeBytes: number;
  rpoSeconds: number;
  rtoSeconds: number;
  status: 'completed' | 'failed';
}

export class DisasterRecoveryEngine {
  private static instance: DisasterRecoveryEngine;
  private backupDir: string;
  private eventBus = EventBus.getInstance();
  private logger = Logger.getInstance();
  private persistenceDriver = PersistenceDriver.getInstance();

  private constructor() {
    this.backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  public static getInstance(): DisasterRecoveryEngine {
    if (!DisasterRecoveryEngine.instance) {
      DisasterRecoveryEngine.instance = new DisasterRecoveryEngine();
    }
    return DisasterRecoveryEngine.instance;
  }

  public async createBackup(tenantId: string): Promise<BackupMetadata> {
    const startTime = Date.now();
    const backupId = `bkp_${tenantId}_${Date.now()}`;
    const now = typeof (globalThis as any).Temporal !== 'undefined'
      ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
      : new Date().toISOString();

    // Collect snapshot data
    const snapshot = {
      tenantId,
      timestamp: now,
      databaseData: this.persistenceDriver.getCollection(tenantId),
    };

    const filePath = path.join(this.backupDir, `${backupId}.json`);
    const jsonStr = JSON.stringify(snapshot, null, 2);

    if (typeof Bun !== 'undefined' && typeof Bun.write === 'function') {
      await Bun.write(filePath, jsonStr);
    } else {
      fs.writeFileSync(filePath, jsonStr, 'utf-8');
    }

    const durationMs = Date.now() - startTime;

    const meta: BackupMetadata = {
      backupId,
      tenantId,
      createdAt: now,
      sizeBytes: Buffer.byteLength(jsonStr),
      rpoSeconds: 0, // Real-time snapshot
      rtoSeconds: Math.ceil(durationMs / 1000),
      status: 'completed',
    };

    this.logger.info(`[DisasterRecoveryEngine] Created backup [${backupId}] for tenant [${tenantId}]`, { tenantId }, { meta });

    await this.eventBus.publish('disaster.backup.created', meta, { tenantId });
    return meta;
  }

  public async restoreBackup(backupId: string): Promise<boolean> {
    const filePath = path.join(this.backupDir, `${backupId}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup archive ${backupId} not found`);
    }

    let snapshot: any;
    if (typeof Bun !== 'undefined' && typeof Bun.file === 'function') {
      snapshot = await Bun.file(filePath).json();
    } else {
      const raw = fs.readFileSync(filePath, 'utf-8');
      snapshot = JSON.parse(raw);
    }

    // Restore collection to persistence store
    this.persistenceDriver.saveCollection(snapshot.tenantId, snapshot.databaseData);

    this.logger.info(`[DisasterRecoveryEngine] Restored tenant [${snapshot.tenantId}] from backup [${backupId}]`, {
      tenantId: snapshot.tenantId,
    });

    await this.eventBus.publish('disaster.backup.restored', { backupId, tenantId: snapshot.tenantId });
    return true;
  }

  public async runDrill(tenantId: string): Promise<{ rpo: string; rto: string; pass: boolean }> {
    const backup = await this.createBackup(tenantId);
    const restored = await this.restoreBackup(backup.backupId);

    return {
      rpo: `${backup.rpoSeconds}s`,
      rto: `${backup.rtoSeconds}s`,
      pass: restored && backup.status === 'completed',
    };
  }
}
