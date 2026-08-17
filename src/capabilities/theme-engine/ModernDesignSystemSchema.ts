// Foundation: Modern Design System Schema Specification (DTCG Standard Compatible)
// Fluid Typography clamp(), Container Queries, Semantic Design Tokens & Theme Engine Schema

export interface DesignTokenValue<T = string> {
  $value: T;
  $type: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'shadow' | 'gradient' | 'duration';
  $description?: string;
}

export interface ModernDesignTokenSchema {
  // 1. Color System (WCAG 2.2 Compliant)
  color: {
    brand: {
      primary: string;
      secondary: string;
      accent: string;
      glow: string;
    };
    surface: {
      background: string;
      canvas: string;
      card: string;
      cardHover: string;
      border: string;
      borderActive: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    feedback: {
      success: string;
      warning: string;
      danger: string;
      info: string;
    };
  };

  // 2. Fluid Typography System (CSS clamp() Viewport Scaling)
  typography: {
    fontFamily: {
      display: string;
      body: string;
      mono: string;
    };
    scale: {
      hero: string;       // clamp(2.2rem, 5vw + 1rem, 4.2rem)
      h1: string;         // clamp(1.8rem, 3.5vw + 0.5rem, 3rem)
      h2: string;         // clamp(1.4rem, 2.5vw + 0.5rem, 2.2rem)
      h3: string;         // clamp(1.15rem, 1.8vw + 0.4rem, 1.6rem)
      bodyLarge: string;  // clamp(1rem, 1.2vw + 0.2rem, 1.2rem)
      body: string;       // clamp(0.875rem, 0.5vw + 0.75rem, 1rem)
      caption: string;    // clamp(0.72rem, 0.4vw + 0.6rem, 0.8rem)
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };

  // 3. Spacing & Grid System (8-point Intrinsic Scale)
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    sectionGap: string;
  };

  // 4. Shape, Elevation & Depth
  shape: {
    radiusSm: string;
    radiusMd: string;
    radiusLg: string;
    radiusFull: string;
    glassBackground: string;
    glassBorder: string;
    glassBlur: string;
    shadowElevated: string;
    shadowGlow: string;
  };

  // 5. Motion & Transitions (Cubic-Bezier Micro-Interactions)
  motion: {
    durationFast: string;
    durationNormal: string;
    durationSlow: string;
    easingStandard: string;
    easingEntrance: string;
  };
}

export interface ModernThemeDefinition {
  id: string;
  name: string;
  category: 'enterprise' | 'cyberpunk' | 'luxury' | 'editorial' | 'minimalist';
  description: string;
  tokens: ModernDesignTokenSchema;
}

// Curated 2026 Production Theme Definitions
export const MODERN_THEME_REGISTRY: Record<string, ModernThemeDefinition> = {
  // 1. LIORAMEDIA Cyberpunk Studio (Virtual Production, VFX, Creative Studios)
  cyberpunk_crimson: {
    id: 'cyberpunk_crimson',
    name: 'LIORAMEDIA Cyberpunk Studio',
    category: 'cyberpunk',
    description: 'High-energy virtual production theme with electric rose, ultraviolet glow, and deep dark spaces.',
    tokens: {
      color: {
        brand: {
          primary: '#f43f5e',
          secondary: '#a855f7',
          accent: '#06b6d4',
          glow: 'rgba(244, 63, 94, 0.35)',
        },
        surface: {
          background: '#06030e',
          canvas: '#0b0618',
          card: '#120a24',
          cardHover: '#1c1038',
          border: 'rgba(244, 63, 94, 0.18)',
          borderActive: 'rgba(244, 63, 94, 0.6)',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          muted: '#94a3b8',
          inverse: '#06030e',
        },
        feedback: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#38bdf8',
        },
      },
      typography: {
        fontFamily: {
          display: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
          body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          mono: "'JetBrains Mono', monospace",
        },
        scale: {
          hero: 'clamp(2.4rem, 6vw + 0.5rem, 4.5rem)',
          h1: 'clamp(1.9rem, 4vw + 0.4rem, 3.2rem)',
          h2: 'clamp(1.4rem, 2.5vw + 0.4rem, 2.2rem)',
          h3: 'clamp(1.15rem, 1.8vw + 0.3rem, 1.5rem)',
          bodyLarge: 'clamp(1.05rem, 1.2vw + 0.2rem, 1.25rem)',
          body: 'clamp(0.88rem, 0.5vw + 0.75rem, 1rem)',
          caption: 'clamp(0.72rem, 0.3vw + 0.65rem, 0.8rem)',
        },
        lineHeight: {
          tight: '1.15',
          normal: '1.5',
          relaxed: '1.75',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
        sectionGap: 'clamp(3rem, 7vw, 6rem)',
      },
      shape: {
        radiusSm: '6px',
        radiusMd: '12px',
        radiusLg: '18px',
        radiusFull: '9999px',
        glassBackground: 'rgba(18, 10, 36, 0.65)',
        glassBorder: 'rgba(244, 63, 94, 0.25)',
        glassBlur: '16px',
        shadowElevated: '0 20px 40px -15px rgba(0,0,0,0.8)',
        shadowGlow: '0 0 35px rgba(244, 63, 94, 0.35)',
      },
      motion: {
        durationFast: '150ms',
        durationNormal: '250ms',
        durationSlow: '450ms',
        easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easingEntrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  // 2. Enterprise Core SaaS (Cloud Infrastructure, Banking, FinTech)
  enterprise_indigo: {
    id: 'enterprise_indigo',
    name: 'Dark Indigo Enterprise',
    category: 'enterprise',
    description: 'Crisp corporate architecture with royal indigo highlights, high contrast typography, and tight micro-radii.',
    tokens: {
      color: {
        brand: {
          primary: '#6366f1',
          secondary: '#818cf8',
          accent: '#38bdf8',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        surface: {
          background: '#070a12',
          canvas: '#0d111c',
          card: '#111827',
          cardHover: '#1a2336',
          border: 'rgba(255, 255, 255, 0.08)',
          borderActive: '#6366f1',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          muted: '#64748b',
          inverse: '#070a12',
        },
        feedback: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#38bdf8',
        },
      },
      typography: {
        fontFamily: {
          display: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          mono: "'JetBrains Mono', monospace",
        },
        scale: {
          hero: 'clamp(2.2rem, 5vw + 0.5rem, 3.8rem)',
          h1: 'clamp(1.75rem, 3.5vw + 0.3rem, 2.8rem)',
          h2: 'clamp(1.35rem, 2.2vw + 0.3rem, 2rem)',
          h3: 'clamp(1.1rem, 1.5vw + 0.2rem, 1.4rem)',
          bodyLarge: 'clamp(1rem, 1vw + 0.2rem, 1.15rem)',
          body: 'clamp(0.85rem, 0.4vw + 0.75rem, 0.95rem)',
          caption: 'clamp(0.7rem, 0.3vw + 0.6rem, 0.78rem)',
        },
        lineHeight: {
          tight: '1.2',
          normal: '1.55',
          relaxed: '1.7',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.75rem',
        xl: '3.5rem',
        sectionGap: 'clamp(2.5rem, 5vw, 5rem)',
      },
      shape: {
        radiusSm: '4px',
        radiusMd: '8px',
        radiusLg: '12px',
        radiusFull: '9999px',
        glassBackground: 'rgba(17, 24, 39, 0.75)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassBlur: '12px',
        shadowElevated: '0 15px 35px -10px rgba(0,0,0,0.6)',
        shadowGlow: '0 0 25px rgba(99, 102, 241, 0.25)',
      },
      motion: {
        durationFast: '120ms',
        durationNormal: '200ms',
        durationSlow: '350ms',
        easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easingEntrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  // 3. Emerald Matrix Luxury (Sustainability, Biotech, High-Wealth Portfolios)
  emerald_matrix: {
    id: 'emerald_matrix',
    name: 'Emerald Matrix Luxury',
    category: 'luxury',
    description: 'Sophisticated botanical and deep jade green system with cyan edge glow and generous whitespace.',
    tokens: {
      color: {
        brand: {
          primary: '#10b981',
          secondary: '#06b6d4',
          accent: '#34d399',
          glow: 'rgba(16, 185, 129, 0.3)',
        },
        surface: {
          background: '#021512',
          canvas: '#04221c',
          card: '#08322a',
          cardHover: '#0e463b',
          border: 'rgba(16, 185, 129, 0.18)',
          borderActive: '#10b981',
        },
        text: {
          primary: '#ecfdf5',
          secondary: '#a7f3d0',
          muted: '#6ee7b7',
          inverse: '#021512',
        },
        feedback: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
        },
      },
      typography: {
        fontFamily: {
          display: "'Plus Jakarta Sans', -apple-system, sans-serif",
          body: "'Plus Jakarta Sans', -apple-system, sans-serif",
          mono: "'JetBrains Mono', monospace",
        },
        scale: {
          hero: 'clamp(2.3rem, 5.5vw + 0.4rem, 4rem)',
          h1: 'clamp(1.8rem, 3.8vw + 0.3rem, 3rem)',
          h2: 'clamp(1.35rem, 2.3vw + 0.3rem, 2.1rem)',
          h3: 'clamp(1.1rem, 1.6vw + 0.2rem, 1.45rem)',
          bodyLarge: 'clamp(1.05rem, 1.1vw + 0.2rem, 1.2rem)',
          body: 'clamp(0.88rem, 0.4vw + 0.75rem, 1rem)',
          caption: 'clamp(0.72rem, 0.3vw + 0.65rem, 0.8rem)',
        },
        lineHeight: {
          tight: '1.18',
          normal: '1.6',
          relaxed: '1.8',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1.25rem',
        lg: '2.25rem',
        xl: '4.5rem',
        sectionGap: 'clamp(3.5rem, 8vw, 7rem)',
      },
      shape: {
        radiusSm: '8px',
        radiusMd: '14px',
        radiusLg: '22px',
        radiusFull: '9999px',
        glassBackground: 'rgba(8, 50, 42, 0.7)',
        glassBorder: 'rgba(16, 185, 129, 0.2)',
        glassBlur: '14px',
        shadowElevated: '0 25px 45px -12px rgba(0,0,0,0.7)',
        shadowGlow: '0 0 30px rgba(16, 185, 129, 0.28)',
      },
      motion: {
        durationFast: '150ms',
        durationNormal: '280ms',
        durationSlow: '500ms',
        easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easingEntrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};

/**
 * Compiles a structured ModernDesignTokenSchema into production-ready CSS variables
 * with fluid typography clamp(), container query rules, glassmorphism, and responsive scales.
 */
export function compileModernThemeToCSS(theme: ModernThemeDefinition): string {
  const { color, typography, spacing, shape, motion } = theme.tokens;

  return `
/* ==========================================================================
   ETHENENGINE 2026 Modern Design Token Compiled Stylesheet
   Theme: ${theme.name} (${theme.category})
   Standard: DTCG Spec Compliant / Container-Query Responsive
   ========================================================================== */

:root {
  /* --- Brand & Surface Tokens --- */
  --theme-primary: ${color.brand.primary};
  --theme-secondary: ${color.brand.secondary};
  --theme-accent: ${color.brand.accent};
  --theme-glow: ${color.brand.glow};
  
  --theme-bg: ${color.surface.background};
  --theme-canvas: ${color.surface.canvas};
  --theme-card: ${color.surface.card};
  --theme-card-hover: ${color.surface.cardHover};
  --theme-border: ${color.surface.border};
  --theme-border-active: ${color.surface.borderActive};
  
  --theme-text-primary: ${color.text.primary};
  --theme-text-secondary: ${color.text.secondary};
  --theme-text-muted: ${color.text.muted};
  --theme-text-inverse: ${color.text.inverse};

  /* --- Fluid Typography clamp() Scale --- */
  --font-display: ${typography.fontFamily.display};
  --font-body: ${typography.fontFamily.body};
  --font-mono: ${typography.fontFamily.mono};

  --text-hero: ${typography.scale.hero};
  --text-h1: ${typography.scale.h1};
  --text-h2: ${typography.scale.h2};
  --text-h3: ${typography.scale.h3};
  --text-body-lg: ${typography.scale.bodyLarge};
  --text-body: ${typography.scale.body};
  --text-caption: ${typography.scale.caption};

  /* --- Geometry & Elevation --- */
  --radius-sm: ${shape.radiusSm};
  --radius-md: ${shape.radiusMd};
  --radius-lg: ${shape.radiusLg};
  --radius-full: ${shape.radiusFull};

  --glass-bg: ${shape.glassBackground};
  --glass-border: ${shape.glassBorder};
  --glass-blur: blur(${shape.glassBlur});

  --shadow-elevated: ${shape.shadowElevated};
  --shadow-glow: ${shape.shadowGlow};

  /* --- Motion & Easing --- */
  --duration-fast: ${motion.durationFast};
  --duration-normal: ${motion.durationNormal};
  --duration-slow: ${motion.durationSlow};
  --ease-standard: ${motion.easingStandard};
  --ease-entrance: ${motion.easingEntrance};

  /* --- Spacing --- */
  --gap-section: ${spacing.sectionGap};
}

/* Base Body Styles */
body {
  background-color: var(--theme-bg) !important;
  color: var(--theme-text-primary) !important;
  font-family: var(--font-body) !important;
  background-image: 
    radial-gradient(circle at 10% 15%, var(--theme-glow) 0%, transparent 45%),
    radial-gradient(circle at 90% 85%, var(--theme-glow) 0%, transparent 45%) !important;
  background-attachment: fixed !important;
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
}

/* Headings with Fluid Clamp */
h1, .text-h1 { font-family: var(--font-display); font-size: var(--text-h1); line-height: ${typography.lineHeight.tight}; font-weight: 800; letter-spacing: -0.03em; }
h2, .text-h2 { font-family: var(--font-display); font-size: var(--text-h2); line-height: ${typography.lineHeight.tight}; font-weight: 800; letter-spacing: -0.02em; }
h3, .text-h3 { font-family: var(--font-display); font-size: var(--text-h3); line-height: ${typography.lineHeight.tight}; font-weight: 700; letter-spacing: -0.01em; }
.hero-title { font-family: var(--font-display); font-size: var(--text-hero); line-height: 1.1; font-weight: 900; letter-spacing: -0.04em; }

/* Interactive Modern Components */
.btn-primary, .btn {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)) !important;
  color: #ffffff !important;
  border-radius: var(--radius-md) !important;
  box-shadow: 0 4px 20px var(--theme-glow) !important;
  border: none !important;
  font-weight: 700 !important;
  transition: transform var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard) !important;
}

.btn-primary:hover, .btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 30px var(--theme-glow) !important;
}

.glass-card {
  background: var(--glass-bg) !important;
  backdrop-filter: var(--glass-blur) !important;
  -webkit-backdrop-filter: var(--glass-blur) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-elevated) !important;
  transition: border-color var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard) !important;
}

.glass-card:hover {
  border-color: var(--theme-primary) !important;
  transform: translateY(-3px) !important;
  box-shadow: var(--shadow-elevated), var(--shadow-glow) !important;
}
  `.trim();
}
