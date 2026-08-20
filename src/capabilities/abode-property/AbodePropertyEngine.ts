import { EventBus } from '../../foundation/EventBus.js';

export type PropertyType = 'apartment' | 'single_family' | 'commercial' | 'vacation_rental';

export interface PropertyListing {
  id: string;
  tenantId: string;
  title: string;
  address: string;
  propertyType: PropertyType;
  totalUnits: number;
  monthlyRent: number;
  depositAmount: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  ownerName: string;
  imageUrl?: string;
  createdAt: string;
}

export interface TenantLease {
  id: string;
  tenantId: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'active' | 'pending' | 'expired';
  createdAt: string;
}

export interface RentInvoice {
  id: string;
  tenantId: string;
  leaseId: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  lateFee: number;
  paidDate?: string;
}

export interface MaintenanceTicket {
  id: string;
  tenantId: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  category: 'plumbing' | 'hvac' | 'electrical' | 'appliance' | 'general';
  issueDescription: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  assignedVendorName?: string;
  createdAt: string;
}

export interface OwnerPayout {
  id: string;
  tenantId: string;
  ownerName: string;
  propertyId: string;
  grossRent: number;
  managementFeePercent: number;
  managementFeeDeduction: number;
  netPayoutAmount: number;
  payoutDate: string;
}

export class AbodePropertyEngine {
  private properties: Map<string, PropertyListing[]> = new Map();
  private leases: Map<string, TenantLease[]> = new Map();
  private invoices: Map<string, RentInvoice[]> = new Map();
  private maintenanceTickets: Map<string, MaintenanceTicket[]> = new Map();
  private ownerPayouts: Map<string, OwnerPayout[]> = new Map();

  constructor() {
    this.seedDefaults('tenant_lioramedia');
  }

  private seedDefaults(tenantId: string): void {
    const defaultProperties: PropertyListing[] = [
      {
        id: 'prop_101',
        tenantId,
        title: 'Grand Bay Executive Penthouse Suite 404',
        address: '100 Ocean Drive, Suite 404, Miami FL',
        propertyType: 'apartment',
        totalUnits: 1,
        monthlyRent: 3800,
        depositAmount: 3800,
        status: 'occupied',
        ownerName: 'Vance Capital Real Estate LLC',
        imageUrl: '/assets/penthouse.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prop_102',
        tenantId,
        title: 'Silicon Commercial Innovation Park — Suite 200',
        address: '500 Technology Way, San Jose CA',
        propertyType: 'commercial',
        totalUnits: 4,
        monthlyRent: 8500,
        depositAmount: 17000,
        status: 'occupied',
        ownerName: 'Stark Real Estate Ventures',
        imageUrl: '/assets/office_park.jpg',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultLeases: TenantLease[] = [
      {
        id: 'lease_301',
        tenantId,
        propertyId: 'prop_101',
        propertyTitle: 'Grand Bay Executive Penthouse Suite 404',
        tenantName: 'Evelyn Vance',
        tenantEmail: 'evelyn@vance.com',
        tenantPhone: '+1-555-901-2345',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        monthlyRent: 3800,
        securityDeposit: 3800,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultInvoices: RentInvoice[] = [
      {
        id: 'inv_801',
        tenantId,
        leaseId: 'lease_301',
        tenantName: 'Evelyn Vance',
        amount: 3800,
        dueDate: '2026-09-01',
        status: 'paid',
        lateFee: 0,
        paidDate: '2026-08-28'
      }
    ];

    const defaultTickets: MaintenanceTicket[] = [
      {
        id: 'maint_501',
        tenantId,
        propertyId: 'prop_101',
        propertyTitle: 'Grand Bay Executive Penthouse Suite 404',
        tenantName: 'Evelyn Vance',
        category: 'hvac',
        issueDescription: 'Master suite AC thermostat reporting Error Code E-42.',
        priority: 'high',
        status: 'assigned',
        assignedVendorName: 'Apex HVAC & Refrigeration Service',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultPayouts: OwnerPayout[] = [
      {
        id: 'payout_901',
        tenantId,
        ownerName: 'Vance Capital Real Estate LLC',
        propertyId: 'prop_101',
        grossRent: 3800,
        managementFeePercent: 8,
        managementFeeDeduction: 304,
        netPayoutAmount: 3496,
        payoutDate: '2026-08-30'
      }
    ];

    this.properties.set(tenantId, defaultProperties);
    this.leases.set(tenantId, defaultLeases);
    this.invoices.set(tenantId, defaultInvoices);
    this.maintenanceTickets.set(tenantId, defaultTickets);
    this.ownerPayouts.set(tenantId, defaultPayouts);
  }

  public listProperties(tenantId: string): PropertyListing[] {
    return this.properties.get(tenantId) || [];
  }

  public createProperty(tenantId: string, property: Omit<PropertyListing, 'id' | 'tenantId' | 'createdAt'>): PropertyListing {
    const newProp: PropertyListing = {
      id: `prop_${Date.now()}`,
      tenantId,
      ...property,
      createdAt: new Date().toISOString()
    };
    const existing = this.properties.get(tenantId) || [];
    existing.push(newProp);
    this.properties.set(tenantId, existing);
    return newProp;
  }

  public listLeases(tenantId: string): TenantLease[] {
    return this.leases.get(tenantId) || [];
  }

  public createLease(tenantId: string, lease: Omit<TenantLease, 'id' | 'tenantId' | 'createdAt'>): TenantLease {
    const newLease: TenantLease = {
      id: `lease_${Date.now()}`,
      tenantId,
      ...lease,
      createdAt: new Date().toISOString()
    };
    const existing = this.leases.get(tenantId) || [];
    existing.push(newLease);
    this.leases.set(tenantId, existing);
    return newLease;
  }

  public listInvoices(tenantId: string): RentInvoice[] {
    return this.invoices.get(tenantId) || [];
  }

  public generateRentInvoice(tenantId: string, leaseId: string, amount: number, dueDate: string): RentInvoice {
    const leases = this.listLeases(tenantId);
    const targetLease = leases.find(l => l.id === leaseId);
    const invoice: RentInvoice = {
      id: `inv_${Date.now()}`,
      tenantId,
      leaseId,
      tenantName: targetLease?.tenantName || 'Tenant',
      amount,
      dueDate,
      status: 'unpaid',
      lateFee: 0
    };
    const existing = this.invoices.get(tenantId) || [];
    existing.push(invoice);
    this.invoices.set(tenantId, existing);
    return invoice;
  }

  public listMaintenanceTickets(tenantId: string): MaintenanceTicket[] {
    return this.maintenanceTickets.get(tenantId) || [];
  }

  public createMaintenanceTicket(tenantId: string, ticket: Omit<MaintenanceTicket, 'id' | 'tenantId' | 'createdAt'>): MaintenanceTicket {
    const newTicket: MaintenanceTicket = {
      id: `maint_${Date.now()}`,
      tenantId,
      ...ticket,
      createdAt: new Date().toISOString()
    };
    const existing = this.maintenanceTickets.get(tenantId) || [];
    existing.push(newTicket);
    this.maintenanceTickets.set(tenantId, existing);
    return newTicket;
  }

  public listOwnerPayouts(tenantId: string): OwnerPayout[] {
    return this.ownerPayouts.get(tenantId) || [];
  }

  public calculateOwnerPayout(tenantId: string, ownerName: string, propertyId: string, grossRent: number, feePercent: number = 8): OwnerPayout {
    const managementFeeDeduction = (grossRent * feePercent) / 100;
    const netPayoutAmount = grossRent - managementFeeDeduction;

    const payout: OwnerPayout = {
      id: `payout_${Date.now()}`,
      tenantId,
      ownerName,
      propertyId,
      grossRent,
      managementFeePercent: feePercent,
      managementFeeDeduction,
      netPayoutAmount,
      payoutDate: new Date().toISOString()
    };

    const existing = this.ownerPayouts.get(tenantId) || [];
    existing.push(payout);
    this.ownerPayouts.set(tenantId, existing);
    return payout;
  }
}
