import { EventBus } from '../../foundation/EventBus.js';

export type FleetType = 'chauffeur_sedan' | 'luxury_suv' | 'self_drive' | 'passenger_van';

export interface FleetVehicle {
  id: string;
  tenantId: string;
  model: string;
  make: string;
  year: number;
  licensePlate: string;
  fleetType: FleetType;
  dailyRate: number;
  isAvailable: boolean;
  features: string[];
}

export interface CorporateTripPackage {
  id: string;
  tenantId: string;
  title: string;
  targetCompany?: string;
  destination: string;
  durationDays: number;
  maxEmployees: number;
  pricePerEmployee: number;
  inclusions: string[];
  featuredImageUrl: string;
}

export interface FleetBooking {
  id: string;
  tenantId: string;
  customerName: string;
  customerEmail: string;
  bookingType: 'corporate_retreat' | 'chauffeur_deal' | 'self_drive';
  vehicleId?: string;
  packageId?: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface VehicleInspectionLog {
  id: string;
  tenantId: string;
  vehicleId: string;
  inspectorName: string;
  brakesPassed: boolean;
  tiresPassed: boolean;
  cleanlinessScore: number;
  fuelPercent: number;
  inspectionDate: string;
}

export interface CorporateExpenseApproval {
  id: string;
  tenantId: string;
  packageId: string;
  requestingEmployee: string;
  companyName: string;
  employeeCount: number;
  totalExpenseCost: number;
  status: 'pending_manager' | 'approved' | 'rejected';
  approverNotes?: string;
}

export class TravelFleetEngine {
  private vehicles: Map<string, FleetVehicle[]> = new Map();
  private packages: Map<string, CorporateTripPackage[]> = new Map();
  private bookings: Map<string, FleetBooking[]> = new Map();
  private inspectionLogs: Map<string, VehicleInspectionLog[]> = new Map();
  private expenseApprovals: Map<string, CorporateExpenseApproval[]> = new Map();

  constructor() {
    this.seedDefaults('tenant_lioramedia');
  }

  private seedDefaults(tenantId: string): void {
    const defaultVehicles: FleetVehicle[] = [
      {
        id: 'veh_101',
        tenantId,
        make: 'Mercedes-Benz',
        model: 'S-Class Maybach S580',
        year: 2026,
        licensePlate: 'EXEC-777',
        fleetType: 'chauffeur_sedan',
        dailyRate: 450,
        isAvailable: true,
        features: ['Executive Rear Lounge', 'Private Wifi Hotspot', 'Chauffeur Partition', 'Chilled Refreshments']
      },
      {
        id: 'veh_102',
        tenantId,
        make: 'Tesla',
        model: 'Model X Plaid Dual Motor',
        year: 2026,
        licensePlate: 'DRIVE-999',
        fleetType: 'self_drive',
        dailyRate: 220,
        isAvailable: true,
        features: ['Full Self-Driving Beta', 'Falcon Wing Doors', 'Unlimited Supercharging', '330 mi Range']
      }
    ];

    const defaultPackages: CorporateTripPackage[] = [
      {
        id: 'pkg_501',
        tenantId,
        title: 'Executive Leadership Swiss Alps Mountain Retreat',
        targetCompany: 'Acme Corp Executives',
        destination: 'St. Moritz, Switzerland',
        durationDays: 5,
        maxEmployees: 25,
        pricePerEmployee: 2400,
        inclusions: ['Private Jet Charter Transport', '5-Star Alpine Chalet Lodge', 'Guided Helicopter Skiing', 'Corporate Strategy Workshops'],
        featuredImageUrl: '/assets/swiss_alps.jpg'
      },
      {
        id: 'pkg_502',
        tenantId,
        title: 'Silicon Valley Innovation & Tech Team Outing',
        destination: 'Napa Valley & Big Sur, California',
        durationDays: 3,
        maxEmployees: 50,
        pricePerEmployee: 1100,
        inclusions: ['Luxury Mercedes Coach Fleet', 'Vineyard Private Dining', 'Team Bonding Adventure Rally'],
        featuredImageUrl: '/assets/napa_retreat.jpg'
      }
    ];

    const defaultBookings: FleetBooking[] = [
      {
        id: 'book_801',
        tenantId,
        customerName: 'Stark Industries Corporate',
        customerEmail: 'travel@stark.com',
        bookingType: 'corporate_retreat',
        packageId: 'pkg_501',
        startDate: '2026-09-10',
        endDate: '2026-09-15',
        totalCost: 48000,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultInspections: VehicleInspectionLog[] = [
      {
        id: 'insp_101',
        tenantId,
        vehicleId: 'veh_101',
        inspectorName: 'Fleet Manager Alex',
        brakesPassed: true,
        tiresPassed: true,
        cleanlinessScore: 10,
        fuelPercent: 100,
        inspectionDate: new Date().toISOString()
      }
    ];

    const defaultApprovals: CorporateExpenseApproval[] = [
      {
        id: 'exp_301',
        tenantId,
        packageId: 'pkg_501',
        requestingEmployee: 'VP Operations Sarah',
        companyName: 'Acme Corp',
        employeeCount: 20,
        totalExpenseCost: 48000,
        status: 'approved',
        approverNotes: 'Approved under Q3 Leadership Retreat Budget.'
      }
    ];

    this.vehicles.set(tenantId, defaultVehicles);
    this.packages.set(tenantId, defaultPackages);
    this.bookings.set(tenantId, defaultBookings);
    this.inspectionLogs.set(tenantId, defaultInspections);
    this.expenseApprovals.set(tenantId, defaultApprovals);
  }

  public listFleet(tenantId: string): FleetVehicle[] {
    return this.vehicles.get(tenantId) || [];
  }

  public addVehicle(tenantId: string, vehicle: Omit<FleetVehicle, 'id' | 'tenantId'>): FleetVehicle {
    const newVeh: FleetVehicle = {
      id: `veh_${Date.now()}`,
      tenantId,
      ...vehicle
    };
    const existing = this.vehicles.get(tenantId) || [];
    existing.push(newVeh);
    this.vehicles.set(tenantId, existing);
    return newVeh;
  }

  public listCorporatePackages(tenantId: string): CorporateTripPackage[] {
    return this.packages.get(tenantId) || [];
  }

  public addCorporatePackage(tenantId: string, pkg: Omit<CorporateTripPackage, 'id' | 'tenantId'>): CorporateTripPackage {
    const newPkg: CorporateTripPackage = {
      id: `pkg_${Date.now()}`,
      tenantId,
      ...pkg
    };
    const existing = this.packages.get(tenantId) || [];
    existing.push(newPkg);
    this.packages.set(tenantId, existing);
    return newPkg;
  }

  public listBookings(tenantId: string): FleetBooking[] {
    return this.bookings.get(tenantId) || [];
  }

  public createBooking(tenantId: string, booking: Omit<FleetBooking, 'id' | 'tenantId' | 'createdAt'>): FleetBooking {
    const newBooking: FleetBooking = {
      id: `book_${Date.now()}`,
      tenantId,
      ...booking,
      createdAt: new Date().toISOString()
    };
    const existing = this.bookings.get(tenantId) || [];
    existing.push(newBooking);
    this.bookings.set(tenantId, existing);
    return newBooking;
  }

  public updateBookingStatus(tenantId: string, bookingId: string, status: FleetBooking['status']): FleetBooking | null {
    const list = this.bookings.get(tenantId) || [];
    const target = list.find(b => b.id === bookingId);
    if (!target) return null;
    target.status = status;
    return target;
  }

  public listInspectionLogs(tenantId: string): VehicleInspectionLog[] {
    return this.inspectionLogs.get(tenantId) || [];
  }

  public listExpenseApprovals(tenantId: string): CorporateExpenseApproval[] {
    return this.expenseApprovals.get(tenantId) || [];
  }
}
