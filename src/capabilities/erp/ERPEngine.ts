// Capabilities: ERP Subsystem (Manufacturing, Supply Chain, BOM & Resource Planning)

import { EventBus } from '../../foundation/EventBus.js';

export interface ProcurementOrder {
  id: string;
  tenantId: string;
  vendorName: string;
  item: string;
  quantity: number;
  totalCost: number;
  status: 'draft' | 'ordered' | 'received';
  createdAt: string;
}

export interface BillOfMaterials {
  id: string;
  tenantId: string;
  productName: string;
  rawMaterials: Array<{ materialName: string; quantityNeeded: number }>;
}

export class ERPEngine {
  private static instance: ERPEngine;
  private procurementOrders: Map<string, ProcurementOrder> = new Map();
  private boms: Map<string, BillOfMaterials> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultERP();
  }

  public static getInstance(): ERPEngine {
    if (!ERPEngine.instance) {
      ERPEngine.instance = new ERPEngine();
    }
    return ERPEngine.instance;
  }

  private seedDefaultERP() {
    const defaultOrder: ProcurementOrder = {
      id: 'po_1',
      tenantId: 'tenant_default',
      vendorName: 'Global Silicon Supplies',
      item: 'Server Motherboards',
      quantity: 50,
      totalCost: 15000,
      status: 'ordered',
      createdAt: new Date().toISOString(),
    };
    this.procurementOrders.set(defaultOrder.id, defaultOrder);
  }

  public createProcurementOrder(order: Omit<ProcurementOrder, 'id' | 'createdAt'>): ProcurementOrder {
    const po: ProcurementOrder = {
      ...order,
      id: `po_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.procurementOrders.set(po.id, po);
    this.eventBus.publish('erp.procurement.created', po, { tenantId: order.tenantId });
    return po;
  }

  public listProcurementOrders(tenantId: string): ProcurementOrder[] {
    return Array.from(this.procurementOrders.values()).filter((p) => p.tenantId === tenantId);
  }
}
