// Foundation: 12-Factor Configuration Engine (Volume 3, Chapter 3)

export interface PlatformConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  databaseUrl: string;
  storageProvider: 'local' | 's3' | 'azure';
  featureFlags: {
    enableCommerce: boolean;
    enableMarketplace: boolean;
    enableWorkflows: boolean;
  };
}

export class ConfigEngine {
  private static instance: ConfigEngine;
  private config: PlatformConfig;

  private constructor() {
    this.config = this.loadAndValidateConfig();
  }

  public static getInstance(): ConfigEngine {
    if (!ConfigEngine.instance) {
      ConfigEngine.instance = new ConfigEngine();
    }
    return ConfigEngine.instance;
  }

  private loadAndValidateConfig(): PlatformConfig {
    const env = (process.env.NODE_ENV as PlatformConfig['env']) || 'development';
    const port = parseInt(process.env.PORT || '3000', 10);
    const databaseUrl = process.env.DATABASE_URL || 'sqlite.db';
    const storageProvider = (process.env.STORAGE_PROVIDER as PlatformConfig['storageProvider']) || 'local';

    return {
      env,
      port,
      databaseUrl,
      storageProvider,
      featureFlags: {
        enableCommerce: process.env.ENABLE_COMMERCE !== 'false',
        enableMarketplace: process.env.ENABLE_MARKETPLACE !== 'false',
        enableWorkflows: process.env.ENABLE_WORKFLOWS !== 'false',
      },
    };
  }

  public getConfig(): PlatformConfig {
    return this.config;
  }
}
