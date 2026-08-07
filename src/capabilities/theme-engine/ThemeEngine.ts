// Capabilities: Theme Engine & Dynamic Token Compiler

export interface DesignTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface Theme {
  id: string;
  tenantId: string;
  name: string;
  tokens: DesignTokens;
}

export class ThemeEngine {
  private static instance: ThemeEngine;
  private themes: Map<string, Theme> = new Map();

  private constructor() {
    // 1. Default Core Tenant Theme (Dark Indigo)
    this.createPresetTheme('tenant_default', 'Dark Indigo Core', {
      primaryColor: '#6366f1',
      secondaryColor: '#ec4899',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
    });

    // 2. LIORAMEDIA Studios Theme (Cyberpunk Rose Crimson & Electric Violet)
    this.createPresetTheme('tenant_lioramedia', 'Cyberpunk Crimson LIORAMEDIA', {
      primaryColor: '#f43f5e',
      secondaryColor: '#a855f7',
      backgroundColor: '#06030e',
      textColor: '#f8fafc',
      fontFamily: 'Outfit, Inter, sans-serif',
      borderRadius: '14px',
    });
  }

  public static getInstance(): ThemeEngine {
    if (!ThemeEngine.instance) {
      ThemeEngine.instance = new ThemeEngine();
    }
    return ThemeEngine.instance;
  }

  public createPresetTheme(tenantId: string, name: string, tokens: DesignTokens): Theme {
    const theme: Theme = {
      id: `theme_${tenantId}`,
      tenantId,
      name,
      tokens,
    };
    this.themes.set(theme.id, theme);
    return theme;
  }

  public getThemeForTenant(tenantId: string): Theme {
    const cleanId = tenantId.replace('tenant_', '');
    for (const theme of this.themes.values()) {
      if (theme.tenantId === tenantId || theme.tenantId === cleanId || theme.tenantId === `tenant_${cleanId}`) {
        return theme;
      }
    }

    // Auto-create LIORAMEDIA preset if requested
    if (cleanId === 'lioramedia') {
      return this.createPresetTheme('tenant_lioramedia', 'Cyberpunk Crimson LIORAMEDIA', {
        primaryColor: '#f43f5e',
        secondaryColor: '#a855f7',
        backgroundColor: '#06030e',
        textColor: '#f8fafc',
        fontFamily: 'Outfit, Inter, sans-serif',
        borderRadius: '14px',
      });
    }

    return Array.from(this.themes.values())[0];
  }

  public updateThemeTokens(themeId: string, tokens: Partial<DesignTokens>): Theme {
    let theme = this.themes.get(themeId);
    if (!theme) {
      for (const t of this.themes.values()) {
        if (t.tenantId === themeId || t.id.includes(themeId)) {
          theme = t;
          break;
        }
      }
    }
    if (!theme) throw new Error(`Theme ${themeId} not found`);
    theme.tokens = { ...theme.tokens, ...tokens };
    return theme;
  }

  public generateCssVariables(tokens: DesignTokens): string {
    const isLiora = tokens.primaryColor === '#f43f5e' || tokens.primaryColor === '#ec4899';

    return `
      :root {
        --color-primary: ${tokens.primaryColor};
        --color-secondary: ${tokens.secondaryColor};
        --color-accent: ${tokens.secondaryColor};
        --color-bg: ${tokens.backgroundColor};
        --color-text: ${tokens.textColor};
        --font-family: ${tokens.fontFamily};
        --border-radius: ${tokens.borderRadius};
      }
      body {
        background-color: var(--color-bg) !important;
        color: var(--color-text) !important;
        font-family: var(--font-family) !important;
        ${isLiora ? `background-image: radial-gradient(circle at 15% 15%, rgba(244,63,94,0.12) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(168,85,247,0.12) 0%, transparent 40%) !important;` : ''}
      }
      .gradient-text {
        background: linear-gradient(135deg, ${tokens.primaryColor}, ${tokens.secondaryColor}, #06b6d4) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      .btn {
        background: linear-gradient(135deg, ${tokens.primaryColor}, ${tokens.secondaryColor}) !important;
        border: none !important;
        border-radius: var(--border-radius) !important;
        box-shadow: 0 4px 20px ${tokens.primaryColor}40 !important;
        color: #fff !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn:hover {
        box-shadow: 0 6px 30px ${tokens.primaryColor}70 !important;
        transform: translateY(-2px) !important;
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: none !important;
      }
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15) !important;
      }
      .glass-panel {
        background: ${isLiora ? 'rgba(18, 10, 36, 0.65)' : 'rgba(17, 24, 39, 0.75)'} !important;
        border: 1px solid ${isLiora ? `${tokens.primaryColor}35` : 'rgba(255, 255, 255, 0.1)'} !important;
        box-shadow: ${isLiora ? `0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 20px ${tokens.primaryColor}15` : '0 8px 32px 0 rgba(0, 0, 0, 0.4)'} !important;
      }
      .brand-icon {
        background: linear-gradient(135deg, ${tokens.primaryColor}, ${tokens.secondaryColor}) !important;
        border-radius: ${tokens.borderRadius} !important;
      }
      .status-badge {
        background: ${isLiora ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)'} !important;
        border: 1px solid ${tokens.primaryColor}50 !important;
        color: ${tokens.primaryColor} !important;
      }
      .status-dot {
        background: ${tokens.primaryColor} !important;
        box-shadow: 0 0 10px ${tokens.primaryColor} !important;
      }
    `.trim();
  }
}
