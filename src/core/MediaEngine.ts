// Core Platform: Media Subsystem Manager

import { EventBus } from '../foundation/EventBus.js';
import { LocalStorageDriver } from '../foundation/StorageDriver.js';

export interface MediaAsset {
  id: string;
  tenantId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedAt: string;
}

export class MediaEngine {
  private static instance: MediaEngine;
  private mediaAssets: Map<string, MediaAsset> = new Map();
  private storageDriver = new LocalStorageDriver();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultMedia();
  }

  public static getInstance(): MediaEngine {
    if (!MediaEngine.instance) {
      MediaEngine.instance = new MediaEngine();
    }
    return MediaEngine.instance;
  }

  private seedDefaultMedia() {
    const asset: MediaAsset = {
      id: 'media_logo',
      tenantId: 'tenant_default',
      filename: 'acme-logo.png',
      mimeType: 'image/png',
      sizeBytes: 10240,
      url: '/uploads/acme-logo.png',
      uploadedAt: new Date().toISOString(),
    };
    this.mediaAssets.set(asset.id, asset);
  }

  public async uploadAsset(
    tenantId: string,
    filename: string,
    mimeType: string,
    data: Buffer | string
  ): Promise<MediaAsset> {
    const key = `${tenantId}/${Date.now()}_${filename}`;
    const url = await this.storageDriver.put(key, data);

    const asset: MediaAsset = {
      id: `media_${Date.now()}`,
      tenantId,
      filename,
      mimeType,
      sizeBytes: Buffer.byteLength(data),
      url,
      uploadedAt: new Date().toISOString(),
    };

    this.mediaAssets.set(asset.id, asset);
    this.eventBus.publish('media.asset.uploaded', asset, { tenantId });
    return asset;
  }

  public listAssets(tenantId: string): MediaAsset[] {
    return Array.from(this.mediaAssets.values()).filter((a) => a.tenantId === tenantId);
  }
}
