// Developer & Plugin SDK Module

import { EventBus, PlatformEvent } from '../foundation/EventBus.js';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
}

export interface PluginHooks {
  onInit?: () => void | Promise<void>;
  onEvent?: (event: PlatformEvent) => void | Promise<void>;
  customBlocks?: Array<{
    type: string;
    label: string;
    renderHtml: (settings: Record<string, any>) => string;
  }>;
}

export interface PlatformPlugin {
  manifest: PluginManifest;
  hooks: PluginHooks;
}

export class PluginSDKManager {
  private static instance: PluginSDKManager;
  private plugins: Map<string, PlatformPlugin> = new Map();
  private customBlocksMap: Map<string, (settings: Record<string, any>) => string> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {}

  public static getInstance(): PluginSDKManager {
    if (!PluginSDKManager.instance) {
      PluginSDKManager.instance = new PluginSDKManager();
    }
    return PluginSDKManager.instance;
  }

  public async registerPlugin(plugin: PlatformPlugin): Promise<void> {
    this.plugins.set(plugin.manifest.id, plugin);

    if (plugin.hooks.onInit) {
      await plugin.hooks.onInit();
    }

    if (plugin.hooks.onEvent) {
      this.eventBus.subscribe('*', (event) => plugin.hooks.onEvent!(event));
    }

    if (plugin.hooks.customBlocks) {
      for (const block of plugin.hooks.customBlocks) {
        this.customBlocksMap.set(block.type, block.renderHtml);
      }
    }

    await this.eventBus.publish('plugin.registered', { pluginId: plugin.manifest.id });
  }

  public renderCustomBlock(type: string, settings: Record<string, any>): string | undefined {
    const renderer = this.customBlocksMap.get(type);
    return renderer ? renderer(settings) : undefined;
  }

  public listPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }
}
