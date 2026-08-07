// Foundation: AuditLogger subsystem

import { EventBus } from './EventBus.js';

export interface AuditRecord {
  id: string;
  tenantId: string;
  workspaceId?: string;
  actorId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  timestamp: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private auditLog: AuditRecord[] = [];
  private eventBus = EventBus.getInstance();

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public async log(record: Omit<AuditRecord, 'id' | 'timestamp'>): Promise<AuditRecord> {
    const fullRecord: AuditRecord = {

      ...record,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.auditLog.push(fullRecord);

    await this.eventBus.publish('audit.created', fullRecord, {
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
      actorId: record.actorId,
    });

    return fullRecord;
  }

  public getAuditTrail(tenantId: string): AuditRecord[] {
    return this.auditLog.filter((record) => record.tenantId === tenantId);
  }
}
