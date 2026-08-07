// Capabilities: CRM Subsystem (Leads, Deals, Contact Pipeline & Interaction History)

import { EventBus } from '../../foundation/EventBus.js';

export interface Lead {
  id: string;
  tenantId: string;
  contactName: string;
  email: string;
  company: string;
  dealValue: number;
  stage: 'lead' | 'contacted' | 'proposal' | 'closed_won' | 'closed_lost';
  createdAt: string;
}

export class CRMEngine {
  private static instance: CRMEngine;
  private leads: Map<string, Lead> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultLeads();
  }

  public static getInstance(): CRMEngine {
    if (!CRMEngine.instance) {
      CRMEngine.instance = new CRMEngine();
    }
    return CRMEngine.instance;
  }

  private seedDefaultLeads() {
    const lead: Lead = {
      id: 'lead_1',
      tenantId: 'tenant_default',
      contactName: 'John Wayne',
      email: 'jwayne@enterprise.com',
      company: 'Enterprise Corp',
      dealValue: 50000,
      stage: 'proposal',
      createdAt: new Date().toISOString(),
    };
    this.leads.set(lead.id, lead);
  }

  public createLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const lead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.leads.set(lead.id, lead);
    this.eventBus.publish('crm.lead.created', lead, { tenantId: leadData.tenantId });
    return lead;
  }

  public listLeads(tenantId: string): Lead[] {
    return Array.from(this.leads.values()).filter((l) => l.tenantId === tenantId);
  }
}
