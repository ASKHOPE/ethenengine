import { EventBus } from '../../foundation/EventBus.js';

export type CaseType = 'corporate' | 'civil' | 'criminal' | 'ip' | 'family';

export interface LegalCase {
  id: string;
  tenantId: string;
  caseNumber: string;
  title: string;
  courtJurisdiction: string;
  clientName: string;
  opposingParty: string;
  caseType: CaseType;
  status: 'active' | 'pending_motion' | 'settlement' | 'closed';
  leadCounsel: string;
  nextHearingDate?: string;
  createdAt: string;
}

export interface StatuteDocument {
  id: string;
  tenantId: string;
  title: string;
  statuteCategory: 'corporate_code' | 'case_law' | 'regulatory' | 'audit_report' | 'contract_precedent';
  jurisdiction: string;
  citationNumber: string;
  excerptText: string;
  fileVaultUrl?: string;
  tags: string[];
}

export interface LegalBillableLog {
  id: string;
  tenantId: string;
  caseId: string;
  attorneyName: string;
  serviceDescription: string;
  hoursSpent: number;
  hourlyRate: number;
  totalFee: number;
  isBilled: boolean;
  logDate: string;
}

export interface LegalBriefSummary {
  id: string;
  tenantId: string;
  documentTitle: string;
  aiKeyTakeaways: string[];
  riskLevel: 'low' | 'medium' | 'high';
  highlightedClauses: { clauseName: string; text: string; recommendation: string }[];
  summaryDate: string;
}

export interface TrustAccountLedger {
  id: string;
  tenantId: string;
  clientName: string;
  caseId: string;
  retainerDepositAmount: number;
  currentTrustBalance: number;
  ioltaCompliant: boolean;
  lastAuditedDate: string;
}

export interface CourtDeadline {
  id: string;
  tenantId: string;
  caseId: string;
  motionTitle: string;
  filingDeadlineDate: string;
  ruleCitation: string;
  isCompleted: boolean;
}

export interface AttorneyProfile {
  id: string;
  name: string;
  title: string;
  practiceAreas: string[];
  barAdmissions: string[];
  winRatePercent: number;
  photoUrl: string;
  bioSummary: string;
}

export interface DocumentVersionAudit {
  id: string;
  documentId: string;
  versionNumber: number;
  editorName: string;
  changeSummary: string;
  timestamp: string;
}

export interface ClientPortalData {
  clientName: string;
  activeCases: LegalCase[];
  upcomingDeadlines: CourtDeadline[];
  trustBalance: number;
  vaultFiles: StatuteDocument[];
}

export class LegalHouseEngine {
  private cases: Map<string, LegalCase[]> = new Map();
  private statutes: Map<string, StatuteDocument[]> = new Map();
  private billables: Map<string, LegalBillableLog[]> = new Map();
  private summaries: Map<string, LegalBriefSummary[]> = new Map();
  private trustLedgers: Map<string, TrustAccountLedger[]> = new Map();
  private courtDeadlines: Map<string, CourtDeadline[]> = new Map();

  constructor() {
    this.seedDefaults('tenant_lioramedia');
  }

  private seedDefaults(tenantId: string): void {
    if (this.cases.has(tenantId)) return;

    const defaultCases: LegalCase[] = [
      {
        id: 'case_701',
        tenantId,
        caseNumber: 'CV-2026-00492-FED',
        title: 'Acme Media vs. Cyberdyne Data Corp — IP Patent Infringement',
        courtJurisdiction: 'U.S. Federal District Court for Northern California',
        clientName: 'Acme Media Holdings',
        opposingParty: 'Cyberdyne Data Corp',
        caseType: 'ip',
        status: 'pending_motion',
        leadCounsel: 'Attorney Sarah Jenkins, Esq.',
        nextHearingDate: '2026-10-14',
        createdAt: new Date().toISOString()
      },
      {
        id: 'case_702',
        tenantId,
        caseNumber: 'CORP-2026-9918',
        title: 'Liora Media International Merger & Regulatory Compliance Audit',
        courtJurisdiction: 'Delaware Court of Chancery',
        clientName: 'Liora Media Enterprise',
        opposingParty: 'FTC Regulatory Board Probe',
        caseType: 'corporate',
        status: 'active',
        leadCounsel: 'Senior Partner Robert Sterling, Esq.',
        nextHearingDate: '2026-11-02',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultStatutes: StatuteDocument[] = [
      {
        id: 'stat_101',
        tenantId,
        title: 'Delaware General Corporation Law (DGCL) § 141(a) Board Authority',
        statuteCategory: 'corporate_code',
        jurisdiction: 'Delaware Chancery Statute',
        citationNumber: '8 Del. C. § 141',
        excerptText: 'The business and affairs of every corporation organized under this chapter shall be managed by or under the direction of a board of directors...',
        fileVaultUrl: '/vault/statutes/dgcl_sec141.pdf',
        tags: ['corporate', 'fiduciary_duty', 'board_governance']
      },
      {
        id: 'stat_102',
        tenantId,
        title: 'Digital Millennium Copyright Act (DMCA) Safe Harbor Provision',
        statuteCategory: 'case_law',
        jurisdiction: 'US Federal Copyright Act',
        citationNumber: '17 U.S.C. § 512(c)',
        excerptText: 'A service provider shall not be liable for monetary relief for infringement of copyright by reason of the storage at the direction of a user...',
        fileVaultUrl: '/vault/statutes/dmca_512.pdf',
        tags: ['copyright', 'ip', 'safe_harbor', 'media']
      }
    ];

    const defaultBillables: LegalBillableLog[] = [
      {
        id: 'bill_301',
        tenantId,
        caseId: 'case_701',
        attorneyName: 'Sarah Jenkins, Esq.',
        serviceDescription: 'Drafted Summary Judgment Motion Brief and Exhibit Indexing',
        hoursSpent: 4.5,
        hourlyRate: 450,
        totalFee: 2025,
        isBilled: false,
        logDate: new Date().toISOString()
      }
    ];

    const defaultSummaries: LegalBriefSummary[] = [
      {
        id: 'brief_101',
        tenantId,
        documentTitle: 'Cross-Border Media Distribution Contract Agreement v4.2',
        aiKeyTakeaways: [
          'Indemnification liability capped at $2.5M per breach event.',
          'Arbitration venue designated in London Court of International Arbitration (LCIA).',
          'Notice termination window reduced to 30 days.'
        ],
        riskLevel: 'medium',
        highlightedClauses: [
          { clauseName: 'Section 12.4 Unlimited Consequential Damages Waiver', text: 'Neither party shall be liable for indirect, special, or punitive damages...', recommendation: 'Acceptable standard clause.' }
        ],
        summaryDate: new Date().toISOString()
      }
    ];

    const defaultTrustLedgers: TrustAccountLedger[] = [
      {
        id: 'trust_501',
        tenantId,
        clientName: 'Acme Media Holdings',
        caseId: 'case_701',
        retainerDepositAmount: 25000,
        currentTrustBalance: 22975,
        ioltaCompliant: true,
        lastAuditedDate: new Date().toISOString()
      }
    ];

    const defaultDeadlines: CourtDeadline[] = [
      {
        id: 'dead_901',
        tenantId,
        caseId: 'case_701',
        motionTitle: 'Federal Rule 12(b)(6) Motion to Dismiss Opposition Filing',
        filingDeadlineDate: '2026-09-18',
        ruleCitation: 'Fed. R. Civ. P. 12(b)(6)',
        isCompleted: false
      }
    ];

    this.cases.set(tenantId, defaultCases);
    this.statutes.set(tenantId, defaultStatutes);
    this.billables.set(tenantId, defaultBillables);
    this.summaries.set(tenantId, defaultSummaries);
    this.trustLedgers.set(tenantId, defaultTrustLedgers);
    this.courtDeadlines.set(tenantId, defaultDeadlines);
  }

  public listCases(tenantId: string): LegalCase[] {
    this.seedDefaults(tenantId);
    return this.cases.get(tenantId) || [];
  }

  public getClientPortalData(tenantId: string, clientName: string): ClientPortalData {
    this.seedDefaults(tenantId);
    const cases = this.listCases(tenantId).filter(c => c.clientName.toLowerCase().includes(clientName.toLowerCase()));
    const deadlines = this.listCourtDeadlines(tenantId);
    const trustLedger = (this.trustLedgers.get(tenantId) || []).find(t => t.clientName.toLowerCase().includes(clientName.toLowerCase()));
    const vaultFiles = this.listStatutes(tenantId);

    return {
      clientName,
      activeCases: cases,
      upcomingDeadlines: deadlines,
      trustBalance: trustLedger?.currentTrustBalance || 0,
      vaultFiles
    };
  }

  public listAttorneyProfiles(): AttorneyProfile[] {
    return [
      {
        id: 'att_101',
        name: 'Attorney Sarah Jenkins, Esq.',
        title: 'Senior Litigation & IP Partner',
        practiceAreas: ['Intellectual Property', 'Patent Litigation', 'Tech M&A'],
        barAdmissions: ['State Bar of California', 'U.S. Court of Appeals for Federal Circuit'],
        winRatePercent: 94,
        photoUrl: '/assets/attorney_jenkins.jpg',
        bioSummary: 'Over 15 years specializing in cross-border software patents and high-stakes media copyright defense.'
      },
      {
        id: 'att_102',
        name: 'Robert Sterling, Esq.',
        title: 'Managing Partner — Corporate Code & Chancery',
        practiceAreas: ['Corporate Governance', 'Delaware Chancery Court', 'Securities Regulation'],
        barAdmissions: ['Delaware State Bar', 'New York State Bar'],
        winRatePercent: 96,
        photoUrl: '/assets/attorney_sterling.jpg',
        bioSummary: 'Former Vice Chancellor advisor representing Fortune 500 boards in merger disputes.'
      }
    ];
  }

  public createCase(tenantId: string, caseData: Omit<LegalCase, 'id' | 'tenantId' | 'createdAt'>): LegalCase {
    this.seedDefaults(tenantId);
    const newCase: LegalCase = {
      id: `case_${Date.now()}`,
      tenantId,
      ...caseData,
      createdAt: new Date().toISOString()
    };
    const existing = this.cases.get(tenantId) || [];
    existing.push(newCase);
    this.cases.set(tenantId, existing);
    return newCase;
  }

  public updateCaseStatus(tenantId: string, caseId: string, status: LegalCase['status']): LegalCase | null {
    this.seedDefaults(tenantId);
    const list = this.cases.get(tenantId) || [];
    const target = list.find(c => c.id === caseId);
    if (!target) return null;
    target.status = status;
    return target;
  }

  public listStatutes(tenantId: string): StatuteDocument[] {
    this.seedDefaults(tenantId);
    return this.statutes.get(tenantId) || [];
  }

  public addStatute(tenantId: string, statute: Omit<StatuteDocument, 'id' | 'tenantId'>): StatuteDocument {
    this.seedDefaults(tenantId);
    const newStatute: StatuteDocument = {
      id: `stat_${Date.now()}`,
      tenantId,
      ...statute
    };
    const existing = this.statutes.get(tenantId) || [];
    existing.push(newStatute);
    this.statutes.set(tenantId, existing);
    return newStatute;
  }

  public searchStatutes(tenantId: string, query: string): StatuteDocument[] {
    const all = this.listStatutes(tenantId);
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.citationNumber.toLowerCase().includes(q) ||
      s.excerptText.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  public listBillables(tenantId: string): LegalBillableLog[] {
    this.seedDefaults(tenantId);
    return this.billables.get(tenantId) || [];
  }

  public logBillableTime(
    tenantId: string,
    caseId: string,
    attorneyName: string,
    serviceDescription: string,
    hoursSpent: number,
    hourlyRate: number = 450
  ): LegalBillableLog {
    this.seedDefaults(tenantId);
    const totalFee = hoursSpent * hourlyRate;
    const log: LegalBillableLog = {
      id: `bill_${Date.now()}`,
      tenantId,
      caseId,
      attorneyName,
      serviceDescription,
      hoursSpent,
      hourlyRate,
      totalFee,
      isBilled: false,
      logDate: new Date().toISOString()
    };
    const existing = this.billables.get(tenantId) || [];
    existing.push(log);
    this.billables.set(tenantId, existing);
    return log;
  }

  public listSummaries(tenantId: string): LegalBriefSummary[] {
    this.seedDefaults(tenantId);
    return this.summaries.get(tenantId) || [];
  }

  public listTrustLedgers(tenantId: string): TrustAccountLedger[] {
    this.seedDefaults(tenantId);
    return this.trustLedgers.get(tenantId) || [];
  }

  public listCourtDeadlines(tenantId: string): CourtDeadline[] {
    this.seedDefaults(tenantId);
    return this.courtDeadlines.get(tenantId) || [];
  }
}
