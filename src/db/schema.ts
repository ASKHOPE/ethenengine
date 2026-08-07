// Open-source, Vendor Lock-in Free Database Schema Definition (ADR-009 Compliant)

export interface DbOrganization {
  id: string;
  name: string;
  billingEmail: string;
  subscriptionPlan: string;
  createdAt: string;
}

export interface DbTenant {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  domain: string;
  status: string;
  createdAt: string;
}

export interface DbWorkspace {
  id: string;
  tenantId: string;
  name: string;
  environment: string;
  createdAt: string;
}

export interface DbUser {
  id: string;
  type: string; // PLATFORM_USER | TENANT_USER | PUBLIC_USER
  email: string;
  name: string;
  tenantId?: string;
  orgId?: string;
  roles: string;
  createdAt: string;
}

export interface DbWebsitePage {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  blocksJson: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface DbCmsEntry {
  id: string;
  tenantId: string;
  contentTypeId: string;
  slug: string;
  dataJson: string;
  status: string;
  updatedAt: string;
}

export interface DbProduct {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  stock: number;
  description: string;
}

export interface DbOrder {
  id: string;
  tenantId: string;
  userId: string;
  itemsJson: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DbAuditRecord {
  id: string;
  tenantId: string;
  workspaceId?: string;
  actorId: string;
  action: string;
  resource: string;
  detailsJson: string;
  timestamp: string;
}
