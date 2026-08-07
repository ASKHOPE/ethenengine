// Foundation: Static Cache & Node Failover Snapshot Store

import fs from 'fs';
import path from 'path';

export interface FailoverSnapshot {
  tenantId: string;
  timestamp: string;
  themeCss: string;
  renderedHtml: Record<string, string>;
  fallbackApiResponses: Record<string, any>;
}

export class FailoverSnapshotStore {
  private static instance: FailoverSnapshotStore;
  private snapshotDir: string;

  private constructor() {
    this.snapshotDir = path.resolve(process.cwd(), 'snapshots');
    if (!fs.existsSync(this.snapshotDir)) {
      fs.mkdirSync(this.snapshotDir, { recursive: true });
    }
  }

  public static getInstance(): FailoverSnapshotStore {
    if (!FailoverSnapshotStore.instance) {
      FailoverSnapshotStore.instance = new FailoverSnapshotStore();
    }
    return FailoverSnapshotStore.instance;
  }

  public saveSnapshot(tenantId: string, snapshot: Omit<FailoverSnapshot, 'tenantId' | 'timestamp'>) {
    const fullSnapshot: FailoverSnapshot = {
      tenantId,
      timestamp: new Date().toISOString(),

      ...snapshot,
    };

    const filePath = path.join(this.snapshotDir, `snapshot_${tenantId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullSnapshot, null, 2), 'utf-8');
  }

  public getSnapshot(tenantId: string): FailoverSnapshot | null {
    const filePath = path.join(this.snapshotDir, `snapshot_${tenantId}.json`);
    if (!fs.existsSync(filePath)) return null;

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as FailoverSnapshot;
    } catch (e) {
      return null;
    }
  }
}
