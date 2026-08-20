import { EventBus } from '../../foundation/EventBus.js';

export type TradeType = 'plumbing' | 'carpentry' | 'electrical' | 'construction' | 'hvac' | 'handyman';

export interface TradePortfolioItem {
  id: string;
  tenantId: string;
  title: string;
  tradeType: TradeType;
  description: string;
  beforeAfterUrls: { before?: string; after?: string };
  projectCost: number;
  clientReview?: { rating: number; comment: string; reviewerName: string };
  completionDate: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  tradeType: TradeType;
  serviceDescription: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'emergency';
  estimatedCost: number;
  assignedTechnician?: string;
  scheduledDate: string;
  createdAt: string;
}

export interface EstimateQuote {
  id: string;
  tenantId: string;
  customerName: string;
  customerEmail: string;
  tradeType: TradeType;
  itemizedMaterials: { item: string; cost: number }[];
  laborHours: number;
  hourlyRate: number;
  totalPrice: number;
  status: 'draft' | 'sent' | 'approved' | 'declined';
  createdAt: string;
}

export interface TechnicianGpsTrack {
  technicianId: string;
  technicianName: string;
  currentLat: number;
  currentLng: number;
  currentSpeedMph: number;
  customerEtaMinutes: number;
  lastUpdated: string;
}

export interface SubcontractorRecord {
  id: string;
  tenantId: string;
  subcontractorName: string;
  tradeSpecialty: TradeType;
  taxId1099: string;
  insuranceVerified: boolean;
  totalPayoutsYearToDate: number;
}

export interface DamageInspection {
  id: string;
  tenantId: string;
  photoUrl: string;
  identifiedDamage: string;
  aiConfidenceScore: number;
  estimatedRepairCost: number;
}

export class TradesCraftEngine {
  private portfolioItems: Map<string, TradePortfolioItem[]> = new Map();
  private workOrders: Map<string, WorkOrder[]> = new Map();
  private estimateQuotes: Map<string, EstimateQuote[]> = new Map();
  private gpsTracks: Map<string, TechnicianGpsTrack[]> = new Map();
  private subcontractors: Map<string, SubcontractorRecord[]> = new Map();
  private damageInspections: Map<string, DamageInspection[]> = new Map();

  constructor() {
    this.seedDefaultItems('tenant_lioramedia');
  }

  private seedDefaultItems(tenantId: string): void {
    const defaultPortfolio: TradePortfolioItem[] = [
      {
        id: 'port_001',
        tenantId,
        title: 'Luxury Kitchen Custom Hardwood Cabinetry',
        tradeType: 'carpentry',
        description: 'Complete teardown and custom oak cabinetry installation with hidden soft-close hinges.',
        beforeAfterUrls: { before: '/assets/kitchen_before.jpg', after: '/assets/kitchen_after.jpg' },
        projectCost: 12500,
        clientReview: { rating: 5, comment: 'Master craftsmanship! Transformed our home.', reviewerName: 'Evelyn Vance' },
        completionDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'port_002',
        tenantId,
        title: 'Emergency Mainline Plumbing & Pipe Replacement',
        tradeType: 'plumbing',
        description: 'Subterranean main sewer line repair and copper pipe retrofitting with zero lawn disruption.',
        beforeAfterUrls: { before: '/assets/plumbing_before.jpg', after: '/assets/plumbing_after.jpg' },
        projectCost: 4800,
        clientReview: { rating: 5, comment: 'Arrived within 30 minutes! Fast, clean, professional.', reviewerName: 'David Sterling' },
        completionDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    const defaultWorkOrders: WorkOrder[] = [
      {
        id: 'wo_101',
        tenantId,
        customerName: 'Marcus Aurelius',
        customerPhone: '+1 (555) 234-5678',
        address: '742 Evergreen Terrace, Suite 100',
        tradeType: 'electrical',
        serviceDescription: 'Commercial 200A main panel upgrade and dedicated EV charger installation.',
        status: 'in_progress',
        estimatedCost: 3200,
        assignedTechnician: 'Master Electrician Jake',
        scheduledDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    const defaultQuotes: EstimateQuote[] = [
      {
        id: 'quote_301',
        tenantId,
        customerName: 'Horizon Corp',
        customerEmail: 'facilities@horizon.com',
        tradeType: 'construction',
        itemizedMaterials: [
          { item: 'Drywall & Steel Stud Framing', cost: 2400 },
          { item: 'Acoustic Ceiling Tiles', cost: 1200 }
        ],
        laborHours: 24,
        hourlyRate: 85,
        totalPrice: 5640,
        status: 'approved',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultGps: TechnicianGpsTrack[] = [
      {
        technicianId: 'tech_jake',
        technicianName: 'Master Electrician Jake',
        currentLat: 37.7749,
        currentLng: -122.4194,
        currentSpeedMph: 28,
        customerEtaMinutes: 12,
        lastUpdated: new Date().toISOString()
      }
    ];

    const defaultSubcontractors: SubcontractorRecord[] = [
      {
        id: 'sub_401',
        tenantId,
        subcontractorName: 'Apex Roofing & Waterproofing LLC',
        tradeSpecialty: 'construction',
        taxId1099: 'XX-XXX8921',
        insuranceVerified: true,
        totalPayoutsYearToDate: 42500
      }
    ];

    this.portfolioItems.set(tenantId, defaultPortfolio);
    this.workOrders.set(tenantId, defaultWorkOrders);
    this.estimateQuotes.set(tenantId, defaultQuotes);
    this.gpsTracks.set(tenantId, defaultGps);
    this.subcontractors.set(tenantId, defaultSubcontractors);
  }

  public listPortfolio(tenantId: string): TradePortfolioItem[] {
    return this.portfolioItems.get(tenantId) || [];
  }

  public createPortfolioItem(tenantId: string, item: Omit<TradePortfolioItem, 'id' | 'tenantId' | 'createdAt'>): TradePortfolioItem {
    const newItem: TradePortfolioItem = {
      id: `port_${Date.now()}`,
      tenantId,
      ...item,
      createdAt: new Date().toISOString()
    };
    const existing = this.portfolioItems.get(tenantId) || [];
    existing.push(newItem);
    this.portfolioItems.set(tenantId, existing);
    return newItem;
  }

  public listWorkOrders(tenantId: string): WorkOrder[] {
    return this.workOrders.get(tenantId) || [];
  }

  public createWorkOrder(tenantId: string, wo: Omit<WorkOrder, 'id' | 'tenantId' | 'createdAt'>): WorkOrder {
    const newWo: WorkOrder = {
      id: `wo_${Date.now()}`,
      tenantId,
      ...wo,
      createdAt: new Date().toISOString()
    };
    const existing = this.workOrders.get(tenantId) || [];
    existing.push(newWo);
    this.workOrders.set(tenantId, existing);
    return newWo;
  }

  public updateWorkOrderStatus(tenantId: string, workOrderId: string, status: WorkOrder['status']): WorkOrder | null {
    const list = this.workOrders.get(tenantId) || [];
    const target = list.find(w => w.id === workOrderId);
    if (!target) return null;
    target.status = status;
    return target;
  }

  public listQuotes(tenantId: string): EstimateQuote[] {
    return this.estimateQuotes.get(tenantId) || [];
  }

  public calculateEstimate(
    tenantId: string,
    customerName: string,
    customerEmail: string,
    tradeType: TradeType,
    materials: { item: string; cost: number }[],
    laborHours: number,
    hourlyRate: number = 85
  ): EstimateQuote {
    const materialsTotal = materials.reduce((acc, m) => acc + m.cost, 0);
    const laborTotal = laborHours * hourlyRate;
    const totalPrice = materialsTotal + laborTotal;

    const quote: EstimateQuote = {
      id: `quote_${Date.now()}`,
      tenantId,
      customerName,
      customerEmail,
      tradeType,
      itemizedMaterials: materials,
      laborHours,
      hourlyRate,
      totalPrice,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    const existing = this.estimateQuotes.get(tenantId) || [];
    existing.push(quote);
    this.estimateQuotes.set(tenantId, existing);
    return quote;
  }

  public getGpsTracks(tenantId: string): TechnicianGpsTrack[] {
    return this.gpsTracks.get(tenantId) || [];
  }

  public listSubcontractors(tenantId: string): SubcontractorRecord[] {
    return this.subcontractors.get(tenantId) || [];
  }

  public runAiDamageInspection(tenantId: string, photoUrl: string, identifiedDamage: string): DamageInspection {
    const inspection: DamageInspection = {
      id: `dmg_${Date.now()}`,
      tenantId,
      photoUrl,
      identifiedDamage,
      aiConfidenceScore: 0.96,
      estimatedRepairCost: 1450
    };
    const existing = this.damageInspections.get(tenantId) || [];
    existing.push(inspection);
    this.damageInspections.set(tenantId, existing);
    return inspection;
  }
}
