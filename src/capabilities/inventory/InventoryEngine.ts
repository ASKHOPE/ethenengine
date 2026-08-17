// Capabilities: Advanced Multi-Warehouse Inventory Subsystem (ADR-014)
// Multi-location stock allocation, Bin/Aisle management, low-stock threshold triggers & transfer orders

import { EventBus } from '../../foundation/EventBus.js';

export interface WarehouseLocation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  city: string;
  country: string;
  isPrimary: boolean;
  capacityUnits: number;
}

export interface InventoryStockItem {
  id: string;
  tenantId: string;
  warehouseId: string;
  productId: string;
  sku: string;
  productName: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderThreshold: number;
  reorderQuantity: number;
  aisle: string;
  bin: string;
  updatedAt: string;
}

export interface StockTransferOrder {
  id: string;
  tenantId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  sku: string;
  quantity: number;
  status: 'draft' | 'in_transit' | 'received' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export class InventoryEngine {
  private static instance: InventoryEngine;
  private warehouses: Map<string, WarehouseLocation> = new Map();
  private stockItems: Map<string, InventoryStockItem> = new Map();
  private transferOrders: Map<string, StockTransferOrder> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultInventory();
  }

  public static getInstance(): InventoryEngine {
    if (!InventoryEngine.instance) {
      InventoryEngine.instance = new InventoryEngine();
    }
    return InventoryEngine.instance;
  }

  private seedDefaultInventory() {
    // 1. Primary Hub & Regional Facility
    const whPrimary: WarehouseLocation = {
      id: 'wh_us_east',
      tenantId: 'tenant_default',
      name: 'North America Central Distribution Hub',
      code: 'WH-USEAST-01',
      city: 'Newark, NJ',
      country: 'USA',
      isPrimary: true,
      capacityUnits: 50000,
    };
    const whSecondary: WarehouseLocation = {
      id: 'wh_eu_west',
      tenantId: 'tenant_default',
      name: 'European Fulfillment Center',
      code: 'WH-EUWEST-01',
      city: 'Frankfurt',
      country: 'Germany',
      isPrimary: false,
      capacityUnits: 30000,
    };

    this.warehouses.set(whPrimary.id, whPrimary);
    this.warehouses.set(whSecondary.id, whSecondary);

    // Lioramedia studio warehouse
    const whLiora: WarehouseLocation = {
      id: 'wh_liora_studio',
      tenantId: 'tenant_lioramedia',
      name: 'LIORAMEDIA Studio Equipment Vault',
      code: 'WH-LIORA-01',
      city: 'Los Angeles, CA',
      country: 'USA',
      isPrimary: true,
      capacityUnits: 5000,
    };
    this.warehouses.set(whLiora.id, whLiora);

    // 2. Default Stocks
    const stock1: InventoryStockItem = {
      id: 'stock_1',
      tenantId: 'tenant_default',
      warehouseId: whPrimary.id,
      productId: 'prod_1',
      sku: 'PLATFORM-ENT-001',
      productName: 'Enterprise Platform License Box',
      quantityOnHand: 450,
      quantityReserved: 12,
      reorderThreshold: 100,
      reorderQuantity: 200,
      aisle: 'Aisle A',
      bin: 'Bin 104',
      updatedAt: new Date().toISOString(),
    };
    const stock2: InventoryStockItem = {
      id: 'stock_2',
      tenantId: 'tenant_default',
      warehouseId: whSecondary.id,
      productId: 'prod_1',
      sku: 'PLATFORM-ENT-001',
      productName: 'Enterprise Platform License Box',
      quantityOnHand: 85, // Below threshold -> triggers low stock!
      quantityReserved: 5,
      reorderThreshold: 100,
      reorderQuantity: 250,
      aisle: 'Aisle B',
      bin: 'Bin 201',
      updatedAt: new Date().toISOString(),
    };
    const stockLiora: InventoryStockItem = {
      id: 'stock_liora_1',
      tenantId: 'tenant_lioramedia',
      warehouseId: whLiora.id,
      productId: 'prod_liora_cam',
      sku: 'CAM-ARRI-ALEXA35',
      productName: 'ARRI Alexa 35 Cinema Camera Package',
      quantityOnHand: 4,
      quantityReserved: 1,
      reorderThreshold: 2,
      reorderQuantity: 2,
      aisle: 'Vault Alpha',
      bin: 'Locker 01',
      updatedAt: new Date().toISOString(),
    };

    this.stockItems.set(stock1.id, stock1);
    this.stockItems.set(stock2.id, stock2);
    this.stockItems.set(stockLiora.id, stockLiora);
  }

  // --- Warehouse Operations ---
  public createWarehouse(data: Omit<WarehouseLocation, 'id'>): WarehouseLocation {
    const wh: WarehouseLocation = {
      ...data,
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.warehouses.set(wh.id, wh);
    this.eventBus.publish('inventory.warehouse.created', wh, { tenantId: wh.tenantId });
    return wh;
  }

  public listWarehouses(tenantId: string): WarehouseLocation[] {
    return Array.from(this.warehouses.values()).filter((w) => w.tenantId === tenantId);
  }

  // --- Stock Operations ---
  public adjustStock(params: {
    tenantId: string;
    warehouseId: string;
    sku: string;
    deltaQuantity: number;
    reason: string;
  }): InventoryStockItem {
    const cleanTenantId = params.tenantId.replace('tenant_', '');
    let stock = Array.from(this.stockItems.values()).find(
      (s) => (s.tenantId === params.tenantId || s.tenantId === cleanTenantId || s.tenantId === `tenant_${cleanTenantId}`) && s.warehouseId === params.warehouseId && s.sku === params.sku
    );

    if (!stock) {
      stock = {
        id: `stock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tenantId: params.tenantId,
        warehouseId: params.warehouseId,
        productId: `prod_${params.sku.toLowerCase()}`,
        sku: params.sku,
        productName: params.sku,
        quantityOnHand: Math.max(0, params.deltaQuantity),
        quantityReserved: 0,
        reorderThreshold: 50,
        reorderQuantity: 100,
        aisle: 'General',
        bin: 'Bay 01',
        updatedAt: new Date().toISOString(),
      };
      this.stockItems.set(stock.id, stock);
    } else {
      stock.quantityOnHand = Math.max(0, stock.quantityOnHand + params.deltaQuantity);
      stock.updatedAt = new Date().toISOString();
    }

    // Check low stock trigger
    if (stock.quantityOnHand <= stock.reorderThreshold) {
      this.eventBus.publish('inventory.low_stock', {
        tenantId: params.tenantId,
        sku: stock.sku,
        warehouseId: stock.warehouseId,
        quantityOnHand: stock.quantityOnHand,
        reorderQuantity: stock.reorderQuantity,
      });
    }

    this.eventBus.publish('inventory.stock.adjusted', stock, { tenantId: params.tenantId });
    return stock;
  }

  public listStock(tenantId: string, warehouseId?: string): InventoryStockItem[] {
    const cleanTenantId = tenantId.replace('tenant_', '');
    return Array.from(this.stockItems.values()).filter(
      (s) => (s.tenantId === tenantId || s.tenantId === cleanTenantId || s.tenantId === `tenant_${cleanTenantId}`) && (!warehouseId || s.warehouseId === warehouseId)
    );
  }

  // --- Stock Transfer Operations ---
  public createTransferOrder(data: Omit<StockTransferOrder, 'id' | 'createdAt'>): StockTransferOrder {
    const transfer: StockTransferOrder = {
      ...data,
      id: `trf_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock from source warehouse
    this.adjustStock({
      tenantId: data.tenantId,
      warehouseId: data.fromWarehouseId,
      sku: data.sku,
      deltaQuantity: -data.quantity,
      reason: `Inter-warehouse transfer ${transfer.id}`,
    });

    this.transferOrders.set(transfer.id, transfer);
    this.eventBus.publish('inventory.transfer.created', transfer, { tenantId: data.tenantId });
    return transfer;
  }

  public receiveTransferOrder(transferId: string, tenantId: string): StockTransferOrder {
    const transfer = this.transferOrders.get(transferId);
    if (!transfer || transfer.tenantId !== tenantId) {
      throw new Error(`Transfer order ${transferId} not found`);
    }

    transfer.status = 'received';

    // Credit stock to destination warehouse
    this.adjustStock({
      tenantId,
      warehouseId: transfer.toWarehouseId,
      sku: transfer.sku,
      deltaQuantity: transfer.quantity,
      reason: `Received transfer ${transfer.id}`,
    });

    this.eventBus.publish('inventory.transfer.received', transfer, { tenantId });
    return transfer;
  }

  public listTransfers(tenantId: string): StockTransferOrder[] {
    return Array.from(this.transferOrders.values()).filter((t) => t.tenantId === tenantId);
  }
}
