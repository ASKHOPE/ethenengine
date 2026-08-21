import { Hono } from 'hono';
import { InventoryEngine } from '../capabilities/inventory/InventoryEngine.js';

export const inventoryRouter = new Hono();
const inventory = InventoryEngine.getInstance();

// Warehouses
inventoryRouter.get('/warehouses', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ warehouses: inventory.listWarehouses(tenant.id) });
});

inventoryRouter.post('/warehouses', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const wh = inventory.createWarehouse({
    tenantId: tenant.id,
    name: body.name,
    code: body.code || `WH-${Date.now().toString().slice(-4)}`,
    city: body.city || 'Hub',
    country: body.country || 'USA',
    isPrimary: body.isPrimary ?? false,
    capacityUnits: Number(body.capacityUnits || 10000),
  });
  return c.json({ warehouse: wh }, 201);
});

// Stock Allocations
inventoryRouter.get('/stock', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const whId = c.req.query('warehouseId');
  return c.json({ stock: inventory.listStock(tenant.id, whId) });
});

inventoryRouter.post('/stock/adjust', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const stock = inventory.adjustStock({
    tenantId: tenant.id,
    warehouseId: body.warehouseId,
    sku: body.sku,
    deltaQuantity: Number(body.deltaQuantity || 0),
    reason: body.reason || 'Manual Admin Stock Adjustment',
  });
  return c.json({ stock });
});

// Inter-Warehouse Transfers
inventoryRouter.get('/transfers', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ transfers: inventory.listTransfers(tenant.id) });
});

inventoryRouter.post('/transfers', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const transfer = inventory.createTransferOrder({
    tenantId: tenant.id,
    fromWarehouseId: body.fromWarehouseId,
    toWarehouseId: body.toWarehouseId,
    sku: body.sku,
    quantity: Number(body.quantity || 1),
    status: 'in_transit',
    trackingNumber: body.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
  });
  return c.json({ transfer }, 201);
});
