// Future Capability Extension Hooks (Stub definitions to preserve architecture without introducing logic)

export interface ModuleExtensionHook {
  moduleName: string;
  isAvailable: boolean;
  stubMessage: string;
}

export const FutureCapabilitiesMap: Record<string, ModuleExtensionHook> = {
  CRM: {
    moduleName: 'CRM Capability',
    isAvailable: false,
    stubMessage: 'CRM capability interface extension hook. Future phase addition.',
  },
  ERP: {
    moduleName: 'ERP Capability',
    isAvailable: false,
    stubMessage: 'ERP capability interface extension hook. Future phase addition.',
  },
  Commerce: {
    moduleName: 'Commerce Capability',
    isAvailable: true,
    stubMessage: 'Commerce capability active.',
  },
  Inventory: {
    moduleName: 'Inventory Subsystem',
    isAvailable: false,
    stubMessage: 'Inventory subsystem extension hook. Future phase addition.',
  },
  Marketplace: {
    moduleName: 'Marketplace Integration',
    isAvailable: false,
    stubMessage: 'Marketplace ecosystem plugin extension hook. Future phase addition.',
  },
  AIPLATFORM: {
    moduleName: 'AI Platform Engine',
    isAvailable: false,
    stubMessage: 'AI Platform & LLM orchestration extension hook. Future phase addition.',
  },
};
