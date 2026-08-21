import { EventBus } from '../../foundation/EventBus.js';

export type ServiceDomain = 'trades' | 'travel' | 'legal' | 'property';

export interface ReservationSlot {
  id: string;
  tenantId: string;
  providerId: string;
  providerName: string;
  serviceDomain: ServiceDomain;
  serviceTitle: string;
  slotStart: string;
  slotEnd: string;
  hourlyRate: number;
  status: 'open' | 'reserved' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface OrderChatMessage {
  id: string;
  sender: 'customer' | 'provider' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ServiceOrderBook {
  id: string;
  tenantId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  providerName: string;
  serviceDomain: ServiceDomain;
  serviceTitle: string;
  agreedPrice: number;
  status: 'pending_accept' | 'accepted' | 'in_fulfillment' | 'fulfilled' | 'declined';
  messages: OrderChatMessage[];
  createdAt: string;
}

export class ServiceReservationEngine {
  private slots: Map<string, ReservationSlot[]> = new Map();
  private orders: Map<string, ServiceOrderBook[]> = new Map();

  constructor() {
    this.seedDefaults('tenant_lioramedia');
  }

  private seedDefaults(tenantId: string): void {
    if (this.slots.has(tenantId)) return;

    const defaultSlots: ReservationSlot[] = [
      {
        id: 'slot_101',
        tenantId,
        providerId: 'prov_handyman_jake',
        providerName: 'Master Electrician & Plumbing Jake',
        serviceDomain: 'trades',
        serviceTitle: '200A Electrical Panel Inspection & Fault Diagnosis',
        slotStart: '2026-09-02T09:00:00Z',
        slotEnd: '2026-09-02T11:00:00Z',
        hourlyRate: 95,
        status: 'reserved',
        createdAt: new Date().toISOString()
      },
      {
        id: 'slot_102',
        tenantId,
        providerId: 'prov_driver_marco',
        providerName: 'Marco S. Executive Chauffeur',
        serviceDomain: 'travel',
        serviceTitle: 'Private Maybach Airport Transfer & City Escort',
        slotStart: '2026-09-05T14:00:00Z',
        slotEnd: '2026-09-05T18:00:00Z',
        hourlyRate: 150,
        status: 'open',
        createdAt: new Date().toISOString()
      },
      {
        id: 'slot_103',
        tenantId,
        providerId: 'prov_attorney_sarah',
        providerName: 'Attorney Sarah Jenkins, Esq.',
        serviceDomain: 'legal',
        serviceTitle: 'Corporate Merger & Patent Litigation Consultation',
        slotStart: '2026-09-08T10:00:00Z',
        slotEnd: '2026-09-08T11:30:00Z',
        hourlyRate: 450,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultOrders: ServiceOrderBook[] = [
      {
        id: 'ord_701',
        tenantId,
        slotId: 'slot_101',
        customerName: 'Marcus Aurelius',
        customerEmail: 'marcus@emperor.com',
        providerName: 'Master Electrician & Plumbing Jake',
        serviceDomain: 'trades',
        serviceTitle: '200A Electrical Panel Inspection & Fault Diagnosis',
        agreedPrice: 190,
        status: 'accepted',
        messages: [
          { id: 'm1', sender: 'customer', senderName: 'Marcus Aurelius', text: 'Hi Jake, please bring a 200A breaker tester for our sub-panel.', timestamp: new Date().toISOString() },
          { id: 'm2', sender: 'provider', senderName: 'Master Electrician & Plumbing Jake', text: 'Will do Marcus! I have all diagnostic equipment staged.', timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    this.slots.set(tenantId, defaultSlots);
    this.orders.set(tenantId, defaultOrders);
  }

  public listSlots(tenantId: string, domain?: ServiceDomain): ReservationSlot[] {
    this.seedDefaults(tenantId);
    const list = this.slots.get(tenantId) || [];
    if (!domain) return list;
    return list.filter(s => s.serviceDomain === domain);
  }

  public getProviderSchedule(tenantId: string, providerId: string): ReservationSlot[] {
    this.seedDefaults(tenantId);
    const list = this.slots.get(tenantId) || [];
    return list.filter(s => s.providerId === providerId);
  }

  public hasSlotCollision(tenantId: string, providerId: string, slotStart: string, slotEnd: string): boolean {
    const existing = this.getProviderSchedule(tenantId, providerId);
    const startMs = new Date(slotStart).getTime();
    const endMs = new Date(slotEnd).getTime();

    return existing.some(s => {
      if (s.status === 'cancelled') return false;
      const sStart = new Date(s.slotStart).getTime();
      const sEnd = new Date(s.slotEnd).getTime();
      return (startMs < sEnd && endMs > sStart);
    });
  }

  public createSlot(tenantId: string, slot: Omit<ReservationSlot, 'id' | 'tenantId' | 'status' | 'createdAt'>): ReservationSlot {
    this.seedDefaults(tenantId);
    const newSlot: ReservationSlot = {
      id: `slot_${Date.now()}`,
      tenantId,
      ...slot,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    const existing = this.slots.get(tenantId) || [];
    existing.push(newSlot);
    this.slots.set(tenantId, existing);
    return newSlot;
  }

  public listOrders(tenantId: string): ServiceOrderBook[] {
    this.seedDefaults(tenantId);
    return this.orders.get(tenantId) || [];
  }

  public reserveSlotAndCreateOrder(
    tenantId: string,
    slotId: string,
    customerName: string,
    customerEmail: string,
    agreedPrice: number,
    initialMessage?: string
  ): ServiceOrderBook | null {
    this.seedDefaults(tenantId);
    const slots = this.slots.get(tenantId) || [];
    const targetSlot = slots.find(s => s.id === slotId);
    if (!targetSlot) return null;

    targetSlot.status = 'reserved';

    const newOrder: ServiceOrderBook = {
      id: `ord_${Date.now()}`,
      tenantId,
      slotId,
      customerName,
      customerEmail,
      providerName: targetSlot.providerName,
      serviceDomain: targetSlot.serviceDomain,
      serviceTitle: targetSlot.serviceTitle,
      agreedPrice,
      status: 'pending_accept',
      messages: initialMessage ? [
        { id: `m_${Date.now()}`, sender: 'customer', senderName: customerName, text: initialMessage, timestamp: new Date().toISOString() }
      ] : [],
      createdAt: new Date().toISOString()
    };

    const existing = this.orders.get(tenantId) || [];
    existing.push(newOrder);
    this.orders.set(tenantId, existing);
    return newOrder;
  }

  public addOrderMessage(tenantId: string, orderId: string, sender: 'customer' | 'provider', senderName: string, text: string): ServiceOrderBook | null {
    this.seedDefaults(tenantId);
    const orders = this.orders.get(tenantId) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.messages.push({
      id: `m_${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString()
    });
    return order;
  }

  public updateOrderStatus(tenantId: string, orderId: string, status: ServiceOrderBook['status']): ServiceOrderBook | null {
    this.seedDefaults(tenantId);
    const orders = this.orders.get(tenantId) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    return order;
  }
}
