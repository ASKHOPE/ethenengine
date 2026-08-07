// Foundation: Event Bus implementation according to Architecture Spec v1

export interface PlatformEvent<T = any> {
  id: string;
  eventName: string;
  timestamp: string;
  tenantId?: string;
  workspaceId?: string;
  actorId?: string;
  payload: T;
}

export type EventHandler<T = any> = (event: PlatformEvent<T>) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventLog: PlatformEvent[] = [];

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventName)?.delete(handler);
    };
  }

  public async publish<T = any>(
    eventName: string,
    payload: T,
    meta?: { tenantId?: string; workspaceId?: string; actorId?: string }
  ): Promise<PlatformEvent<T>> {
    const event: PlatformEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      eventName,
      timestamp: new Date().toISOString(),
      tenantId: meta?.tenantId,
      workspaceId: meta?.workspaceId,
      actorId: meta?.actorId,
      payload,
    };

    this.eventLog.push(event);

    const subscribers = this.handlers.get(eventName);
    if (subscribers) {
      for (const handler of subscribers) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Error in event handler for ${eventName}:`, err);
        }
      }
    }

    return event;
  }

  public getEventHistory(tenantId?: string): PlatformEvent[] {
    if (!tenantId) return [...this.eventLog];
    return this.eventLog.filter((e) => e.tenantId === tenantId);
  }
}
