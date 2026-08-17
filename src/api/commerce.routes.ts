import { Hono } from 'hono';
import { CommerceEngine } from '../capabilities/commerce/CommerceEngine.js';

export const commerceRouter = new Hono();
const commerce = CommerceEngine.getInstance();

// Products Catalog
commerceRouter.get('/products', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ products: commerce.listProducts(tenant.id) });
});

commerceRouter.post('/products', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const product = commerce.createProduct({
    tenantId: tenant.id,
    name: body.name,
    sku: body.sku || `SKU-${Date.now().toString().slice(-4)}`,
    price: Number(body.price || 0),
    currency: body.currency || 'USD',
    stock: Number(body.stock || 50),
    description: body.description || '',
  });
  return c.json({ product }, 201);
});

// Shopping Cart Subsystem
commerceRouter.get('/cart', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const userId = c.req.query('userId') || 'guest';
  const cart = commerce.getCart(tenant.id, userId);
  const allProducts = commerce.listProducts(tenant.id);
  const itemsWithDetails = cart.items.map(item => {
    const prod = allProducts.find(p => p.id === item.productId);
    return {
      ...item,
      name: prod?.name || 'Product Item',
      price: item.unitPrice,
    };
  });
  const subtotal = itemsWithDetails.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return c.json({ cart: { ...cart, items: itemsWithDetails, subtotal } });
});

commerceRouter.post('/cart/add', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const userId = body.userId || 'guest';
  const cart = commerce.addToCart(tenant.id, userId, body.productId, Number(body.quantity || 1));
  return c.json({ cart, message: 'Item added to cart' });
});

commerceRouter.post('/cart/update', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const userId = body.userId || 'guest';
  const cart = commerce.updateCartItemQuantity(tenant.id, userId, body.productId, Number(body.quantity));
  return c.json({ cart });
});

commerceRouter.post('/cart/clear', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const userId = body.userId || 'guest';
  const cart = commerce.clearCart(tenant.id, userId);
  return c.json({ cart });
});

// Orders & Instant Checkout
commerceRouter.post('/checkout', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const userId = body.userId || 'guest';
  try {
    const order = commerce.createOrder(tenant.id, userId, body.promoCode);
    return c.json({ order, message: 'Order placed successfully!' }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || 'Checkout failed' }, 400);
  }
});

commerceRouter.get('/orders', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ orders: commerce.listOrders(tenant.id) });
});
