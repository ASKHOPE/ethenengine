// Capabilities: Community Admin & Sabbath Agenda Engine (Gospel Agenda & Roster Platform Subsystem)
// Multi-Tenant Service Architect, Callings Pipeline & Sacred Resource Library

import { EventBus } from '../../foundation/EventBus.js';

export interface CommunityAgenda {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  meetingType: 'sacrament' | 'sunday_school' | 'auxiliary' | 'general';
  timeframe: '1_month' | '6_month' | '1_year';
  conductingOfficer: string;
  organist: string;
  chorister: string;
  hymns: {
    opening: string;
    sacrament: string;
    intermediate: string;
    closing: string;
  };
  speakers: Array<{
    name: string;
    topic: string;
    durationMinutes: number;
  }>;
  secondHour: {
    teacher: string;
    lessonTopic: string;
    auxiliaryGroup: string;
  };
  announcements: string[];
  createdAt: string;
}

export interface CallingRecord {
  id: string;
  tenantId: string;
  positionTitle: string;
  orgUnit: 'Bishopric/Presidency' | 'Elders Quorum' | 'Relief Society' | 'Primary' | 'Young Women' | 'Sunday School';
  candidateName: string;
  status: 'proposed' | 'sustained' | 'set_apart' | 'released';
  sustainedDate?: string;
  createdAt: string;
}

export interface MemberDirectoryRecord {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  orgUnit: string;
  currentCalling: string;
  status: 'active' | 'inactive';
}

export interface AttendanceLog {
  id: string;
  tenantId: string;
  date: string;
  meetingType: string;
  headcount: number;
  recordedBy: string;
}

export interface VaultDocument {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  fileSize: string;
  uploadedAt: string;
}

export interface LibraryResource {
  id: string;
  tenantId: string;
  title: string;
  category: 'Conference Talk' | 'Hymn' | 'Study Manual' | 'Scripture Volume';
  author: string;
  contentText: string;
  tags: string[];
}

export class CommunityAdminEngine {
  private static instance: CommunityAdminEngine;

  private agendas: Map<string, CommunityAgenda> = new Map();
  private callings: Map<string, CallingRecord> = new Map();
  private library: Map<string, LibraryResource> = new Map();
  private members: Map<string, MemberDirectoryRecord> = new Map();
  private attendanceLogs: Map<string, AttendanceLog> = new Map();
  private vaultDocuments: Map<string, VaultDocument> = new Map();

  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultCommunityData();
  }

  public static getInstance(): CommunityAdminEngine {
    if (!CommunityAdminEngine.instance) {
      CommunityAdminEngine.instance = new CommunityAdminEngine();
    }
    return CommunityAdminEngine.instance;
  }

  private seedDefaultCommunityData() {
    const tid = 'tenant_default';

    // Seed Members Directory
    const defaultMembers: MemberDirectoryRecord[] = [
      { id: 'mem_1', tenantId: tid, fullName: 'David Miller', email: 'david.miller@community.org', phone: '+1-555-0192', orgUnit: 'Bishopric/Presidency', currentCalling: 'Presidency Member', status: 'active' },
      { id: 'mem_2', tenantId: tid, fullName: 'Sarah Jenkins', email: 'sarah.jenkins@community.org', phone: '+1-555-0144', orgUnit: 'Sunday School', currentCalling: 'Instructor', status: 'active' },
      { id: 'mem_3', tenantId: tid, fullName: 'Marcus Vance', email: 'marcus.vance@community.org', phone: '+1-555-0188', orgUnit: 'Music', currentCalling: 'Chorister', status: 'active' }
    ];
    defaultMembers.forEach((m) => this.members.set(m.id, m));

    // Seed Attendance Logs
    const defaultAttendance: AttendanceLog[] = [
      { id: 'att_1', tenantId: tid, date: new Date().toISOString().split('T')[0], meetingType: 'Sacrament Service', headcount: 142, recordedBy: 'David Miller' },
      { id: 'att_2', tenantId: tid, date: new Date().toISOString().split('T')[0], meetingType: 'Sunday School', headcount: 88, recordedBy: 'Sarah Jenkins' }
    ];
    defaultAttendance.forEach((a) => this.attendanceLogs.set(a.id, a));

    // Seed Document Vault
    const defaultDocs: VaultDocument[] = [
      { id: 'doc_1', tenantId: tid, title: 'Sacred Meeting Administration Handbook 2026', category: 'Handbooks', fileSize: '2.4 MB', uploadedAt: '2026-08-01' },
      { id: 'doc_2', tenantId: tid, title: 'Annual Sabbath Service Music Selection Catalog', category: 'Music Catalog', fileSize: '1.1 MB', uploadedAt: '2026-08-10' }
    ];
    defaultDocs.forEach((d) => this.vaultDocuments.set(d.id, d));

    // 1. Seed Agendas
    const defaultAgenda: CommunityAgenda = {
      id: 'agenda_101',
      tenantId: tid,
      title: 'Sabbath Day Sacrament Service & Auxiliary Meetings',
      date: new Date().toISOString().split('T')[0],
      meetingType: 'sacrament',
      timeframe: '1_month',
      conductingOfficer: 'President David Miller',
      organist: 'Rachel Stevens',
      chorister: 'Marcus Vance',
      hymns: {
        opening: '#2 — The Spirit of God',
        sacrament: '#193 — I Stand All Amazed',
        intermediate: '#85 — How Firm a Foundation',
        closing: '#304 — Teach Me to Walk in the Light'
      },
      speakers: [
        { name: 'Sister Emily Thorne', topic: 'Finding Peace in Modern Times', durationMinutes: 10 },
        { name: 'Brother James Miller', topic: 'The Power of Daily Sacred Study', durationMinutes: 15 }
      ],
      secondHour: {
        teacher: 'Brother Thomas Clark',
        lessonTopic: 'Come, Follow Me — Unity and Service',
        auxiliaryGroup: 'Elders Quorum & Relief Society'
      },
      announcements: [
        'Community Youth Activity this Thursday at 6:30 PM.',
        'Worldwide Broadcast Assembly next Sunday.'
      ],
      createdAt: new Date().toISOString()
    };
    this.agendas.set(defaultAgenda.id, defaultAgenda);

    // 2. Seed Callings & Roster Pipeline
    const defaultCallings: CallingRecord[] = [
      { id: 'call_1', tenantId: tid, positionTitle: 'Sunday School Instructor', orgUnit: 'Sunday School', candidateName: 'Sarah Jenkins', status: 'set_apart', sustainedDate: '2026-08-01', createdAt: new Date().toISOString() },
      { id: 'call_2', tenantId: tid, positionTitle: 'Primary Music Leader', orgUnit: 'Primary', candidateName: 'Hannah Vance', status: 'sustained', sustainedDate: '2026-08-15', createdAt: new Date().toISOString() },
      { id: 'call_3', tenantId: tid, positionTitle: 'Youth Activity Director', orgUnit: 'Young Women', candidateName: 'Claire Reynolds', status: 'proposed', createdAt: new Date().toISOString() }
    ];
    defaultCallings.forEach((c) => this.callings.set(c.id, c));

    // 3. Seed Library Resources
    const defaultResources: LibraryResource[] = [
      { id: 'lib_1', tenantId: tid, title: 'The Light of Sacred Guidance', category: 'Conference Talk', author: 'Elder Elderwood', contentText: 'Faith and dedicated service bring clarity and strength in all endeavors.', tags: ['Faith', 'Service', 'Guidance'] },
      { id: 'lib_2', tenantId: tid, title: '#2 — The Spirit of God', category: 'Hymn', author: 'W. W. Phelps', contentText: 'The Spirit of God like a fire is burning! The latter-day glory begins to come forth...', tags: ['Hymn', 'Praise', 'Spirit'] },
      { id: 'lib_3', tenantId: tid, title: 'Come, Follow Me — Principles of Unity', category: 'Study Manual', author: 'Curriculum Department', contentText: 'Building strong community bonds through mutual service and compassionate care.', tags: ['Curriculum', 'Study', 'Unity'] }
    ];
    defaultResources.forEach((r) => this.library.set(r.id, r));
  }

  // --- AGENDAS ---
  public listAgendas(tenantId: string): CommunityAgenda[] {
    return Array.from(this.agendas.values()).filter((a) => a.tenantId === tenantId || a.tenantId === 'tenant_default');
  }

  public createAgenda(data: Omit<CommunityAgenda, 'id' | 'createdAt'>): CommunityAgenda {
    const agenda: CommunityAgenda = {
      ...data,
      id: `agenda_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.agendas.set(agenda.id, agenda);
    this.eventBus.publish('community.agenda.created', agenda, { tenantId: data.tenantId });
    return agenda;
  }

  public generateSundayItinerary(tenantId: string, monthLabel: string, sundayCount: number = 4): CommunityAgenda[] {
    const generated: CommunityAgenda[] = [];
    const baseDate = new Date();

    for (let i = 0; i < sundayCount; i++) {
      const nextSunday = new Date(baseDate.getTime() + (i + 1) * 7 * 86400000);
      const isSecondWeek = (i + 1) % 2 === 0;

      const agenda: CommunityAgenda = {
        id: `agenda_gen_${Date.now()}_${i}`,
        tenantId,
        title: `Sabbath Service — ${monthLabel} Week ${i + 1}`,
        date: nextSunday.toISOString().split('T')[0],
        meetingType: isSecondWeek ? 'sunday_school' : 'sacrament',
        timeframe: '1_month',
        conductingOfficer: 'Conducting Presidency Member',
        organist: 'Assigned Accompanist',
        chorister: 'Assigned Chorister',
        hymns: {
          opening: '#2 — The Spirit of God',
          sacrament: '#193 — I Stand All Amazed',
          intermediate: '#85 — How Firm a Foundation',
          closing: '#304 — Teach Me to Walk in the Light'
        },
        speakers: [
          { name: 'Youth Speaker', topic: 'Principles of Faith', durationMinutes: 5 },
          { name: 'Primary Speaker', topic: 'Acts of Kindness', durationMinutes: 5 },
          { name: 'Main Speaker', topic: 'Building Strong Foundations', durationMinutes: 15 }
        ],
        secondHour: {
          teacher: isSecondWeek ? 'Sunday School Instructor' : 'Auxiliary Presidency',
          lessonTopic: isSecondWeek ? 'Come, Follow Me Lesson' : 'Quorum & Relief Society Study',
          auxiliaryGroup: isSecondWeek ? 'Sunday School' : 'Elders Quorum & Relief Society'
        },
        announcements: ['Weekly community study group meeting at 7:00 PM.'],
        createdAt: new Date().toISOString()
      };

      this.agendas.set(agenda.id, agenda);
      generated.push(agenda);
    }

    return generated;
  }

  // --- CALLINGS & ROSTER PIPELINE ---
  public listCallings(tenantId: string): CallingRecord[] {
    return Array.from(this.callings.values()).filter((c) => c.tenantId === tenantId || c.tenantId === 'tenant_default');
  }

  public createCalling(data: Omit<CallingRecord, 'id' | 'createdAt'>): CallingRecord {
    const calling: CallingRecord = {
      ...data,
      id: `call_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.callings.set(calling.id, calling);
    this.eventBus.publish('community.calling.created', calling, { tenantId: data.tenantId });
    return calling;
  }

  public updateCallingStatus(id: string, status: CallingRecord['status']): CallingRecord | null {
    const calling = this.callings.get(id);
    if (!calling) return null;
    calling.status = status;
    if (status === 'sustained' || status === 'set_apart') {
      calling.sustainedDate = new Date().toISOString().split('T')[0];
    }
    this.callings.set(id, calling);
    this.eventBus.publish('community.calling.updated', calling, { tenantId: calling.tenantId });
    return calling;
  }

  // --- MEMBER DIRECTORY ---
  public listMembers(tenantId: string): MemberDirectoryRecord[] {
    return Array.from(this.members.values()).filter((m) => m.tenantId === tenantId || m.tenantId === 'tenant_default');
  }

  public createMember(data: Omit<MemberDirectoryRecord, 'id'>): MemberDirectoryRecord {
    const mem: MemberDirectoryRecord = { ...data, id: `mem_${Date.now()}` };
    this.members.set(mem.id, mem);
    return mem;
  }

  // --- ATTENDANCE TRACKER ---
  public listAttendance(tenantId: string): AttendanceLog[] {
    return Array.from(this.attendanceLogs.values()).filter((a) => a.tenantId === tenantId || a.tenantId === 'tenant_default');
  }

  public recordAttendance(data: Omit<AttendanceLog, 'id'>): AttendanceLog {
    const log: AttendanceLog = { ...data, id: `att_${Date.now()}` };
    this.attendanceLogs.set(log.id, log);
    return log;
  }

  // --- DOCUMENT VAULT ---
  public listVaultDocuments(tenantId: string): VaultDocument[] {
    return Array.from(this.vaultDocuments.values()).filter((d) => d.tenantId === tenantId || d.tenantId === 'tenant_default');
  }

  public uploadVaultDocument(data: Omit<VaultDocument, 'id' | 'uploadedAt'>): VaultDocument {
    const doc: VaultDocument = { ...data, id: `doc_${Date.now()}`, uploadedAt: new Date().toISOString().split('T')[0] };
    this.vaultDocuments.set(doc.id, doc);
    return doc;
  }

  // --- SACRED LIBRARY & SEARCH ---
  public listLibraryResources(tenantId: string): LibraryResource[] {
    return Array.from(this.library.values()).filter((r) => r.tenantId === tenantId || r.tenantId === 'tenant_default');
  }

  public searchLibrary(tenantId: string, query: string): LibraryResource[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.listLibraryResources(tenantId);
    return this.listLibraryResources(tenantId).filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.contentText.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}
