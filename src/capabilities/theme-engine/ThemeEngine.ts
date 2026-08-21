import { MODERN_THEME_REGISTRY, compileModernThemeToCSS, type ModernThemeDefinition } from './ModernDesignSystemSchema.js';
import { HolidayDesigner, CHRISTIAN_HOLIDAY_REGISTRY, type HolidayDefinition } from './HolidayEngine.js';

export { MODERN_THEME_REGISTRY, compileModernThemeToCSS, type ModernThemeDefinition, HolidayDesigner, CHRISTIAN_HOLIDAY_REGISTRY, type HolidayDefinition };

export type ThemeMode = 'dark' | 'light';

export type HolidayEffectType = 'none' | 'christmas' | 'easter' | 'good_friday' | 'palm_sunday' | 'pentecost' | 'advent' | 'epiphany' | string;

export interface DesignTokens {
  mode?: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  cardBg?: string;
  accentGlow?: string;
  paletteStrip?: [string, string, string, string, string]; // 5-color Coolors swatch
  holidayEffect?: HolidayEffectType;
}

export interface Theme {
  id: string;
  tenantId: string;
  name: string;
  presetKey?: string;
  tokens: DesignTokens;
}

export const THEME_PRESETS: Record<string, { name: string; category?: string; tokens: DesignTokens }> = {
  // 1. Desert Sand (Inspired by Coolors image)
  desert_sand: {
    name: 'Desert Sand & Terracotta',
    category: 'earthy',
    tokens: {
      mode: 'dark',
      primaryColor: '#e08e79', // Warm Terracotta
      secondaryColor: '#774f38', // Roasted Mocha
      backgroundColor: '#1b1411', // Deep Warm Ground
      textColor: '#ece5ce', // Cream Alabaster
      fontFamily: 'Inter, sans-serif',
      borderRadius: '10px',
      cardBg: '#2a1f1a',
      accentGlow: 'rgba(224, 142, 121, 0.25)',
      paletteStrip: ['#774F38', '#E08E79', '#F1D4AF', '#ECE5CE', '#C5E0DC'],
    },
  },
  // 2. Day / Light Mode (Coolors Pure Daylight)
  day_clean: {
    name: 'Daylight Clean (Light Mode)',
    category: 'light',
    tokens: {
      mode: 'light',
      primaryColor: '#0284c7', // Sky Blue
      secondaryColor: '#0d9488', // Deep Teal
      backgroundColor: '#f8fafc', // Soft Off-White
      textColor: '#0f172a', // Deep Slate
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      cardBg: '#ffffff',
      accentGlow: 'rgba(2, 132, 199, 0.12)',
      paletteStrip: ['#0F172A', '#0284C7', '#0D9488', '#E2E8F0', '#FFFFFF'],
    },
  },
  // 3. Night / Dark Mode (Coolors Deep Slate)
  night_slate: {
    name: 'Midnight Slate (Dark Mode)',
    category: 'dark',
    tokens: {
      mode: 'dark',
      primaryColor: '#38bdf8', // Ice Blue
      secondaryColor: '#0ea5e9', // Sky Blue
      backgroundColor: '#0b1120', // Midnight Navy
      textColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      cardBg: '#131d31',
      accentGlow: 'rgba(56, 189, 248, 0.2)',
      paletteStrip: ['#0B1120', '#131D31', '#0EA5E9', '#38BDF8', '#F8FAFC'],
    },
  },
  // 4. Nordic Mint & Sage
  nordic: {
    name: 'Nordic Frost & Mint',
    category: 'cool',
    tokens: {
      mode: 'dark',
      primaryColor: '#2dd4bf', // Mint
      secondaryColor: '#38bdf8', // Ice Blue
      backgroundColor: '#08131d', // Nordic Night
      textColor: '#f0fdf4',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '10px',
      cardBg: '#0f2434',
      accentGlow: 'rgba(45, 212, 191, 0.22)',
      paletteStrip: ['#08131D', '#0F2434', '#0284C7', '#2DD4BF', '#C5E0DC'],
    },
  },
  // 5. Emerald Forest
  forest: {
    name: 'Emerald & Sage Earth',
    category: 'earthy',
    tokens: {
      mode: 'dark',
      primaryColor: '#10b981', // Emerald
      secondaryColor: '#14b8a6', // Sage
      backgroundColor: '#061612', // Cypress
      textColor: '#ecfdf5',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      cardBg: '#0b2922',
      accentGlow: 'rgba(16, 185, 129, 0.22)',
      paletteStrip: ['#061612', '#0B2922', '#10B981', '#14B8A6', '#D1FAE5'],
    },
  },
  // 6. Warm Sunset & Tangerine
  warm_amber: {
    name: 'Warm Sunset & Bronze',
    category: 'warm',
    tokens: {
      mode: 'dark',
      primaryColor: '#f59e0b', // Solar Amber
      secondaryColor: '#f97316', // Tangerine
      backgroundColor: '#140e09', // Roasted Wood
      textColor: '#fffbeb',
      fontFamily: 'Outfit, sans-serif',
      borderRadius: '10px',
      cardBg: '#231911',
      accentGlow: 'rgba(245, 158, 11, 0.22)',
      paletteStrip: ['#140E09', '#231911', '#B45309', '#F59E0B', '#FEF3C7'],
    },
  },
};

export class ThemeEngine {
  private static instance: ThemeEngine;
  private themes: Map<string, Theme> = new Map();

  private constructor() {
    // 1. Default Core Tenant Theme (Midnight Slate)
    this.createPresetTheme('tenant_default', 'Midnight Slate', THEME_PRESETS.night_slate.tokens);

    // 2. LIORAMEDIA Studios Theme (Desert Sand & Terracotta)
    this.createPresetTheme('tenant_lioramedia', 'Desert Sand & Terracotta', THEME_PRESETS.desert_sand.tokens);
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
      return this.createPresetTheme('tenant_lioramedia', 'Nordic Frost & Teal', THEME_PRESETS.nordic.tokens);
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
    const primary = tokens.primaryColor || '#6366f1';
    const secondary = tokens.secondaryColor || '#a855f7';
    const bg = tokens.backgroundColor || '#070a12';
    const cardBg = tokens.cardBg || '#0f172a';
    const glow = tokens.accentGlow || 'rgba(99,102,241,0.25)';

    return `
      :root {
        --color-primary: ${primary};
        --color-secondary: ${secondary};
        --color-accent: ${secondary};
        --color-bg: ${bg};
        --color-card-bg: ${cardBg};
        --color-glow: ${glow};
        --color-text: ${tokens.textColor || '#f8fafc'};
        --font-family: ${tokens.fontFamily || 'Inter, sans-serif'};
        --border-radius: ${tokens.borderRadius || '8px'};
      }
      body {
        background-color: var(--color-bg) !important;
        color: var(--color-text) !important;
        font-family: var(--font-family) !important;
        background-image: radial-gradient(circle at 15% 15%, ${glow} 0%, transparent 45%), radial-gradient(circle at 85% 85%, ${glow} 0%, transparent 45%) !important;
      }
      .gradient-text {
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), #06b6d4) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      .btn {
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)) !important;
        border: none !important;
        border-radius: var(--border-radius) !important;
        box-shadow: 0 4px 20px ${glow} !important;
        color: #fff !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn:hover {
        box-shadow: 0 6px 30px ${glow} !important;
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
        background: var(--color-card-bg) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 20px ${glow} !important;
      }
      .brand-icon {
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)) !important;
        border-radius: var(--border-radius) !important;
        position: relative;
      }
      .status-badge {
        background: ${glow} !important;
        border: 1px solid var(--color-primary) !important;
        color: var(--color-primary) !important;
      }
      .status-dot {
        background: var(--color-primary) !important;
        box-shadow: 0 0 10px var(--color-primary) !important;
      }

      /* ==========================================================================
         HOLIDAY & CELEBRATION EFFECTS (Via HolidayDesigner)
         ========================================================================== */
      ${tokens.holidayEffect && tokens.holidayEffect !== 'none' ? HolidayDesigner.getInstance().compileHolidayCSS(tokens.holidayEffect) : ''}
    `.trim();
  }

  /**
   * Parse JSON5 theme definition (allowing comments, unquoted keys, trailing commas) via native Bun.JSON5
   */
  public importThemeFromJson5(tenantId: string, name: string, json5String: string): Theme {
    let parsed: any;
    if (typeof Bun !== 'undefined' && typeof (Bun as any).JSON5?.parse === 'function') {
      parsed = (Bun as any).JSON5.parse(json5String);
    } else {
      parsed = JSON.parse(json5String);
    }
    const currentTheme = this.getThemeForTenant(tenantId);
    return this.updateThemeTokens(currentTheme.id, parsed);
  }
}

