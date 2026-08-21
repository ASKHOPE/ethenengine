// Phase 2 Capability: Commerce Subsystem (Products, Cart & Orders)

import { EventBus } from '../../foundation/EventBus.js';

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  stock: number;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  tenantId: string;
  userId?: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  tenantId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

export class CommerceEngine {
  private static instance: CommerceEngine;
  private products: Map<string, Product> = new Map();
  private carts: Map<string, Cart> = new Map();
  private orders: Map<string, Order> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultProducts();
  }

  public static getInstance(): CommerceEngine {
    if (!CommerceEngine.instance) {
      CommerceEngine.instance = new CommerceEngine();
    }
    return CommerceEngine.instance;
  }

  private seedDefaultProducts() {
    const defaultProduct: Product = {
      id: 'prod_1',
      tenantId: 'tenant_default',
      name: 'Enterprise Platform License',
      sku: 'PLATFORM-ENT-001',
      price: 2999,
      currency: 'USD',
      stock: 100,
      description: 'Annual enterprise subscription tier for full platform capabilities.',
    };
    this.products.set(defaultProduct.id, defaultProduct);
  }

  public createProduct(prod: Omit<Product, 'id'>): Product {
    const product: Product = {
      ...prod,
      id: `prod_${Date.now()}`,
    };
    this.products.set(product.id, product);
    this.eventBus.publish('commerce.product.created', product, { tenantId: prod.tenantId });
    return product;
  }

  public listProducts(tenantId: string): Product[] {
    return Array.from(this.products.values()).filter((p) => p.tenantId === tenantId);
  }

  // Cart operations
  public getCart(tenantId: string, userId?: string): Cart {
    const key = `${tenantId}_${userId || 'anonymous'}`;
    if (!this.carts.has(key)) {
      this.carts.set(key, { tenantId, userId, items: [] });
    }
    return this.carts.get(key)!;
  }

  public addToCart(tenantId: string, userId: string | undefined, productId: string, quantity: number): Cart {
    const cart = this.getCart(tenantId, userId);
    const product = this.products.get(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const existingIndex = cart.items.findIndex((item) => item.productId === productId);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, unitPrice: product.price });
    }
    return cart;
  }

  public updateCartItemQuantity(tenantId: string, userId: string | undefined, productId: string, quantity: number): Cart {
    const cart = this.getCart(tenantId, userId);
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      const item = cart.items.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
    }
    return cart;
  }

  public clearCart(tenantId: string, userId?: string): Cart {
    const cart = this.getCart(tenantId, userId);
    cart.items = [];
    return cart;
  }

  // Order Placement with Promo Code / Discount Support
  public createOrder(tenantId: string, userId: string, promoCode?: string): Order {
    const cart = this.getCart(tenantId, userId);
    if (cart.items.length === 0) throw new Error('Cannot checkout empty cart');

    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    
    // Promo calculation (e.g. BLACKFRIDAY20 = 20% off, SPECIAL10 = 10% off)
    let discountAmount = 0;
    const cleanPromo = (promoCode || '').trim().toUpperCase();
    if (cleanPromo === 'BLACKFRIDAY20' || cleanPromo === 'SALE20') {
      discountAmount = Math.round(subtotal * 0.2);
    } else if (cleanPromo === 'SPECIAL10' || cleanPromo === 'WELCOME10') {
      discountAmount = Math.round(subtotal * 0.1);
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const now = typeof (globalThis as any).Temporal !== 'undefined'
      ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
      : new Date().toISOString();

    const order: Order = {
      id: `ord_${Date.now()}`,
      tenantId,
      userId,
      items: [...cart.items],
      subtotal,
      discountAmount,
      promoCode: discountAmount > 0 ? cleanPromo : undefined,
      totalAmount,
      status: 'pending',
      createdAt: now,
    };

    this.orders.set(order.id, order);

    // Reset cart
    cart.items = [];

    // Publish event
    this.eventBus.publish('order.created', order, { tenantId, actorId: userId });

    return order;
  }

  public listOrders(tenantId: string): Order[] {
    return Array.from(this.orders.values()).filter((o) => o.tenantId === tenantId);
  }
}
