// Phase 3 Capability: Real-Time Multi-User Collaboration & Presence Engine

export interface Collaborator {
  id: string;
  name: string;
  avatarColor: string;
  tenantId: string;
  pageId: string;
  cursor: { x: number; y: number };
  selectedBlockIndex: number | null;
  lastActive: number;
}

export interface CollabOperation {
  id: string;
  tenantId: string;
  pageId: string;
  actorId: string;
  actorName: string;
  type: 'block.reorder' | 'block.update' | 'block.add' | 'block.delete' | 'theme.update';
  payload: any;
  timestamp: number;
}

export class CollaborationEngine {
  private static instance: CollaborationEngine;
  private collaborators: Map<string, Collaborator> = new Map();
  private history: CollabOperation[] = [];

  private constructor() {
    // Cleanup inactive collaborators periodically
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [id, collab] of this.collaborators.entries()) {
        if (now - collab.lastActive > 60000) { // 60s timeout
          this.collaborators.delete(id);
        }
      }
    }, 15000);
    timer.unref?.();
  }

  public static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  public updatePresence(collab: Omit<Collaborator, 'lastActive'>): Collaborator {
    const updated: Collaborator = {
      ...collab,
      lastActive: Date.now(),
    };
    this.collaborators.set(collab.id, updated);
    return updated;
  }

  public removeCollaborator(id: string): void {
    this.collaborators.delete(id);
  }

  public listActiveCollaborators(tenantId: string, pageId: string): Collaborator[] {
    const now = Date.now();
    return Array.from(this.collaborators.values()).filter(
      c => c.tenantId === tenantId && c.pageId === pageId && now - c.lastActive < 45000
    );
  }

  public broadcastOperation(op: Omit<CollabOperation, 'id' | 'timestamp'>): CollabOperation {
    const operation: CollabOperation = {
      ...op,
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    this.history.push(operation);
    if (this.history.length > 500) this.history.shift();
    return operation;
  }

  public getRecentOperations(tenantId: string, pageId: string, sinceTimestamp: number = 0): CollabOperation[] {
    return this.history.filter(
      op => op.tenantId === tenantId && op.pageId === pageId && op.timestamp > sinceTimestamp
    );
  }
}
