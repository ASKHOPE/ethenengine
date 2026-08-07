// Core Platform: Search Engine Subsystem

import { EventBus, PlatformEvent } from '../foundation/EventBus.js';

export interface SearchIndexDoc {
  id: string;
  tenantId: string;
  docType: 'page' | 'cms_entry' | 'product';
  title: string;
  content: string;
  url: string;
  metadata?: Record<string, any>;
}

export class SearchEngine {
  private static instance: SearchEngine;
  private indexStore: Map<string, SearchIndexDoc> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.listenToEvents();
    this.seedDefaultIndex();
  }

  public static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  private seedDefaultIndex() {
    this.indexDocument({
      id: 'doc_home',
      tenantId: 'tenant_default',
      docType: 'page',
      title: 'Home Page',
      content: 'Acme Enterprise Website Builder and Modular Platform Solution.',
      url: '/preview/home',
    });

    this.indexDocument({
      id: 'doc_cms_welcome',
      tenantId: 'tenant_default',
      docType: 'cms_entry',
      title: 'Welcome Article',
      content: 'Headless CMS structured content for multi-tenant applications.',
      url: '/preview/blog-article',
    });
  }

  public indexDocument(doc: SearchIndexDoc) {
    this.indexStore.set(doc.id, doc);
  }

  private listenToEvents() {
    this.eventBus.subscribe('website.page.created', (evt: PlatformEvent) => {
      this.indexDocument({
        id: `doc_page_${evt.payload.id}`,
        tenantId: evt.tenantId || 'global',
        docType: 'page',
        title: evt.payload.title,
        content: evt.payload.slug,
        url: `/preview/${evt.payload.slug}`,
      });
    });
  }

  public search(tenantId: string, query: string): SearchIndexDoc[] {
    const q = query.toLowerCase();
    return Array.from(this.indexStore.values()).filter(
      (doc) => doc.tenantId === tenantId && (doc.title.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q))
    );
  }
}
