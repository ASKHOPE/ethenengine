// Capabilities: Native Bun 1.4 Media & Image Processing Subsystem

import { EventBus } from '../../foundation/EventBus.js';
import { Logger } from '../../foundation/Logger.js';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: 'fill' | 'inside' | 'cover';
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  quality?: number;
  rotate?: number;
}

export interface ProcessedImageMetadata {
  id: string;
  tenantId: string;
  originalSize: number;
  processedSize: number;
  format: string;
  width: number;
  height: number;
  compressionRatio: string;
  durationMs: number;
  createdAt: string;
}

export class MediaEngine {
  private static instance: MediaEngine;
  private logger = Logger.getInstance();
  private eventBus = EventBus.getInstance();
  private cache: Map<string, Uint8Array> = new Map();

  private constructor() {}

  public static getInstance(): MediaEngine {
    if (!MediaEngine.instance) {
      MediaEngine.instance = new MediaEngine();
    }
    return MediaEngine.instance;
  }

  /**
   * Process raw image buffer using high-speed native Bun.Image (SIMD / libjpeg-turbo / libwebp)
   */
  public async transformImage(
    inputBuffer: Uint8Array | ArrayBuffer,
    options: ImageTransformOptions = {}
  ): Promise<{ data: Uint8Array; metadata: { format: string; width: number; height: number; durationMs: number } }> {
    const t0 = performance.now();
    const width = options.width || 800;
    const height = options.height;
    const format = options.format || 'webp';
    const quality = options.quality || 85;

    // Utilize native Bun.Image if running in Bun runtime
    if (typeof Bun !== 'undefined' && typeof (Bun as any).Image === 'function') {
      const img = new (Bun as any).Image(inputBuffer);

      if (width) {
        img.resize(width, height, { fit: options.fit || 'inside' });
      }

      if (options.rotate) {
        img.rotate(options.rotate);
      }

      let outBytes: Uint8Array;
      if (format === 'webp') {
        outBytes = await img.webp({ quality }).bytes();
      } else if (format === 'jpeg') {
        outBytes = await img.jpeg({ quality }).bytes();
      } else if (format === 'png') {
        outBytes = await img.png().bytes();
      } else {
        outBytes = await img.webp({ quality }).bytes();
      }

      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      return {
        data: outBytes,
        metadata: {
          format,
          width,
          height: height || width,
          durationMs,
        },
      };
    }

    // Fallback if not in Bun
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    return {
      data: new Uint8Array(inputBuffer),
      metadata: { format, width, height: height || width, durationMs },
    };
  }

  /**
   * Store and cache processed image for tenant
   */
  public async processAndStore(
    tenantId: string,
    filename: string,
    buffer: Uint8Array | ArrayBuffer,
    options: ImageTransformOptions = {}
  ): Promise<ProcessedImageMetadata> {
    const t0 = performance.now();
    const originalSize = buffer.byteLength;
    const { data: processed, metadata } = await this.transformImage(buffer, options);

    const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cacheKey = `${tenantId}:${filename}:${options.width || 'orig'}:${metadata.format}`;
    this.cache.set(cacheKey, processed);

    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    const compressionRatio = `${Math.round(((originalSize - processed.byteLength) / originalSize) * 100)}%`;

    const meta: ProcessedImageMetadata = {
      id,
      tenantId,
      originalSize,
      processedSize: processed.byteLength,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      compressionRatio,
      durationMs,
      createdAt: typeof (globalThis as any).Temporal !== 'undefined' 
        ? (globalThis as any).Temporal.Now.zonedDateTimeISO().toString()
        : new Date().toISOString(),
    };

    this.logger.info(`[MediaEngine] Processed image ${filename} in ${durationMs}ms with Bun.Image (${compressionRatio} savings)`);
    this.eventBus.publish('media.image.processed', meta, { tenantId });
    return meta;
  }

  public getCachedImage(tenantId: string, filename: string, width: number | string = 'orig', format = 'webp'): Uint8Array | undefined {
    return this.cache.get(`${tenantId}:${filename}:${width}:${format}`);
  }

  public clearCache(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.logger.info(`[MediaEngine] Cleared image cache (${count} items freed)`);
  }
}
