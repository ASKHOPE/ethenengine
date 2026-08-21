// Capabilities: Basic CMS Subsystem

import { EventBus } from '../../foundation/EventBus.js';

export interface ContentField {
  name: string;
  label: string;
  type: 'text' | 'rich-text' | 'image' | 'number' | 'boolean' | 'date';
  required: boolean;
}

export interface ContentType {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  fields: ContentField[];
}

export interface ContentEntry {
  id: string;
  tenantId: string;
  contentTypeId: string;
  slug: string;
  data: Record<string, any>;
  status: 'draft' | 'published';
  updatedAt: string;
}

export class BasicCMS {
  private static instance: BasicCMS;
  private contentTypes: Map<string, ContentType> = new Map();
  private entries: Map<string, ContentEntry> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultContentTypes();
  }

  public static getInstance(): BasicCMS {
    if (!BasicCMS.instance) {
      BasicCMS.instance = new BasicCMS();
    }
    return BasicCMS.instance;
  }

  private seedDefaultContentTypes() {
    const blogPost: ContentType = {
      id: 'ct_blog',
      tenantId: 'tenant_default',
      name: 'Blog Article',
      slug: 'blog-article',
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'content', label: 'Body Content', type: 'rich-text', required: true },
        { name: 'author', label: 'Author', type: 'text', required: false },
        { name: 'coverImage', label: 'Cover Image URL', type: 'image', required: false },
      ],
    };
    this.contentTypes.set(blogPost.id, blogPost);

    const now = typeof (globalThis as any).Temporal !== 'undefined'
      ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
      : new Date().toISOString();

    const entry: ContentEntry = {
      id: 'entry_1',
      tenantId: 'tenant_default',
      contentTypeId: blogPost.id,
      slug: 'welcome-to-our-platform',
      data: {
        title: 'Welcome to the Next Generation Business Platform',
        content: '### Modular Engine Architecture\nThis platform leverages **Bun 1.4** native capabilities including **Bun.Image**, **Bun.markdown**, and **Event pipelines** for high-throughput performance.',
        author: 'Platform Architect',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      },
      status: 'published',
      updatedAt: now,
    };
    this.entries.set(entry.id, entry);
  }

  /**
   * Render entry content to HTML using native Bun.markdown
   */
  public renderEntryToHtml(entry: ContentEntry): string {
    const rawContent = entry.data.content || '';
    if (typeof Bun !== 'undefined' && typeof (Bun as any).markdown?.html === 'function') {
      return (Bun as any).markdown.html(rawContent);
    }
    return rawContent.replace(/\n/g, '<br/>');
  }

  public createContentType(type: Omit<ContentType, 'id'>): ContentType {
    const newType: ContentType = {
      ...type,
      id: `ct_${Date.now()}`,
    };
    this.contentTypes.set(newType.id, newType);
    this.eventBus.publish('cms.contentType.created', newType, { tenantId: type.tenantId });
    return newType;
  }

  public listContentTypes(tenantId: string): ContentType[] {
    const cleanId = tenantId.replace('tenant_', '');
    return Array.from(this.contentTypes.values()).filter((c) => c.tenantId === tenantId || c.tenantId === cleanId || c.tenantId === `tenant_${cleanId}`);
  }

  public createEntry(entry: Omit<ContentEntry, 'id' | 'updatedAt'>): ContentEntry {
    const now = typeof (globalThis as any).Temporal !== 'undefined'
      ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
      : new Date().toISOString();

    const newEntry: ContentEntry = {
      ...entry,
      id: `entry_${Date.now()}`,
      updatedAt: now,
    };
    this.entries.set(newEntry.id, newEntry);
    this.eventBus.publish('cms.entry.created', newEntry, { tenantId: entry.tenantId });
    return newEntry;
  }

  public listEntries(tenantId: string, contentTypeId?: string): ContentEntry[] {
    const cleanId = tenantId.replace('tenant_', '');
    return Array.from(this.entries.values()).filter(
      (e) => (e.tenantId === tenantId || e.tenantId === cleanId || e.tenantId === `tenant_${cleanId}`) && (!contentTypeId || e.contentTypeId === contentTypeId)
    );
  }

  public publishEntry(id: string): ContentEntry {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`Entry ${id} not found`);
    const now = typeof (globalThis as any).Temporal !== 'undefined'
      ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
      : new Date().toISOString();
    entry.status = 'published';
    entry.updatedAt = now;
    this.eventBus.publish('cms.entry.published', entry, { tenantId: entry.tenantId });
    return entry;
  }
}

