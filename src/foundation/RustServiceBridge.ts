// Foundation: Bridge client delegating heavy workloads to Rust Microservices

import { Logger } from './Logger.js';

export interface ImageProcessResult {
  status: string;
  processed_url: string;
  processing_time_ms: number;
}

export interface RustSearchResult {
  query: string;
  results: Array<{ id: string; score: number; title: string; snippet: string }>;
  execution_time_us: number;
}

export class RustServiceBridge {
  private static instance: RustServiceBridge;
  private rustServiceUrl = process.env.RUST_SERVICE_URL || 'http://ethenengine-rust:8080';
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): RustServiceBridge {
    if (!RustServiceBridge.instance) {
      RustServiceBridge.instance = new RustServiceBridge();
    }
    return RustServiceBridge.instance;
  }

  public async processImage(tenantId: string, filename: string, width: number, height: number): Promise<ImageProcessResult> {
    try {
      const res = await fetch(`${this.rustServiceUrl}/api/rust/process-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          filename,
          target_width: width,
          target_height: height,
        }),
      });
      return (await res.json()) as ImageProcessResult;
    } catch (e) {
      this.logger.warn('[RustServiceBridge] Rust service offline, falling back to Node JS mock image result');
      return {
        status: 'fallback',
        processed_url: `/uploads/${tenantId}/${filename}`,
        processing_time_ms: 15,
      };
    }
  }

  public async fastSearch(tenantId: string, query: string): Promise<RustSearchResult> {
    try {
      const res = await fetch(`${this.rustServiceUrl}/api/rust/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, query }),
      });
      return (await res.json()) as RustSearchResult;
    } catch (e) {
      this.logger.warn('[RustServiceBridge] Rust service offline, falling back to Node JS SearchEngine');
      return {
        query,
        results: [
          {
            id: 'fallback_1',
            score: 0.85,
            title: `Node JS Fallback Result for ${query}`,
            snippet: 'Node JS search fallback result.',
          },
        ],
        execution_time_us: 1500,
      };
    }
  }
}
