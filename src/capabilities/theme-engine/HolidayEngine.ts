// Capabilities: Christian & Seasonal Holiday Celebration Engine & Custom Holiday Designer
// Single Source of Truth for Holiday Metadata, Logo Badges, Animated Particles, Banners & Audio/Visual Ambience

export interface HolidayDefinition {
  id: string;
  name: string;
  category: 'christian_major' | 'christian_liturgical' | 'seasonal' | 'commercial_sale' | 'national';
  description: string;
  logoBadge: string; // Emoji or SVG Icon overlay on brand logo
  logoBadgeRotation?: string;
  greetingBanner?: {
    headline: string;
    subheadline: string;
    accentColor: string;
  };
  particleType: 'snow' | 'golden_rays' | 'cross_light' | 'dove_peace' | 'easter_petals' | 'advent_candles' | 'none';
  cssAnimation: string;
  colorPresetKey?: string;
}

export const CHRISTIAN_HOLIDAY_REGISTRY: Record<string, HolidayDefinition> = {
  // 1. Christmas (Nativity of Jesus Christ)
  christmas: {
    id: 'christmas',
    name: 'Christmas (Nativity)',
    category: 'christian_major',
    description: 'Celebrates the Nativity of Jesus Christ with falling snowflakes and a festive Santa/Star overlay.',
    logoBadge: '⭐',
    logoBadgeRotation: '0deg',
    greetingBanner: {
      headline: 'Joy to the World & Blessed Christmas!',
      subheadline: 'For unto us a child is born, unto us a son is given.',
      accentColor: '#ef4444',
    },
    particleType: 'snow',
    cssAnimation: `
      .brand-icon::after {
        content: '⭐';
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 1.15rem;
        filter: drop-shadow(0 0 8px #f59e0b);
        pointer-events: none;
        z-index: 100;
        animation: pulseGlow 2s infinite alternate;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9999;
        background-image: 
          radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
          radial-gradient(3px 3px at 40px 70px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
          radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
          radial-gradient(3px 3px at 160px 120px, #fff, rgba(0,0,0,0));
        background-repeat: repeat;
        background-size: 200px 200px;
        animation: holidaySnow 8s linear infinite;
        opacity: 0.7;
      }
      @keyframes holidaySnow {
        0% { background-position: 0px 0px, 0px 0px, 0px 0px, 0px 0px; }
        100% { background-position: 50px 400px, 100px 400px, -50px 400px, 20px 400px; }
      }
      @keyframes pulseGlow {
        0% { transform: scale(1); filter: drop-shadow(0 0 4px #f59e0b); }
        100% { transform: scale(1.15); filter: drop-shadow(0 0 12px #fbbf24); }
      }
    `,
  },

  // 2. Easter (Resurrection Sunday)
  easter: {
    id: 'easter',
    name: 'Easter (Resurrection Sunday)',
    category: 'christian_major',
    description: 'Celebrates the Resurrection of Christ with golden rays of dawn and blooming spring grace.',
    logoBadge: '✝️',
    greetingBanner: {
      headline: 'He is Risen! Happy Easter',
      subheadline: 'Celebrating the victory of light, redemption, and eternal hope.',
      accentColor: '#f59e0b',
    },
    particleType: 'golden_rays',
    cssAnimation: `
      .brand-icon::after {
        content: '✝️';
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 1.15rem;
        filter: drop-shadow(0 0 8px #38bdf8);
        pointer-events: none;
        z-index: 100;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9999;
        background: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 60%);
      }
    `,
  },

  // 3. Good Friday (The Passion & Cross)
  good_friday: {
    id: 'good_friday',
    name: 'Good Friday',
    category: 'christian_liturgical',
    description: 'Solemn reverence reflecting on redemption and the Cross.',
    logoBadge: '✝️',
    greetingBanner: {
      headline: 'Good Friday Remembrance',
      subheadline: 'By His wounds we are healed — Reflecting in quiet grace and reverence.',
      accentColor: '#94a3b8',
    },
    particleType: 'cross_light',
    cssAnimation: `
      .brand-icon::after {
        content: '✝️';
        position: absolute;
        top: -10px;
        right: -8px;
        font-size: 1.1rem;
        filter: drop-shadow(0 0 4px rgba(255,255,255,0.4));
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // 4. Palm Sunday (Triumphal Entry)
  palm_sunday: {
    id: 'palm_sunday',
    name: 'Palm Sunday',
    category: 'christian_liturgical',
    description: 'Hosanna in the highest — Celebrating the triumphal entry with palm branches.',
    logoBadge: '🌿',
    greetingBanner: {
      headline: 'Blessed is He Who Comes in the Name of the Lord!',
      subheadline: 'Hosanna in the highest — Celebrating Palm Sunday.',
      accentColor: '#10b981',
    },
    particleType: 'easter_petals',
    cssAnimation: `
      .brand-icon::after {
        content: '🌿';
        position: absolute;
        top: -12px;
        right: -10px;
        font-size: 1.2rem;
        filter: drop-shadow(0 0 6px #10b981);
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // 5. Pentecost (Holy Spirit & Dove)
  pentecost: {
    id: 'pentecost',
    name: 'Pentecost (Holy Spirit)',
    category: 'christian_major',
    description: 'Commemorating the descent of the Holy Spirit with the Dove of peace and flame of grace.',
    logoBadge: '🕊️',
    greetingBanner: {
      headline: 'Blessed Pentecost & Renewal of Spirit',
      subheadline: 'Peace and grace be multiplied unto you.',
      accentColor: '#f97316',
    },
    particleType: 'dove_peace',
    cssAnimation: `
      .brand-icon::after {
        content: '🕊️';
        position: absolute;
        top: -12px;
        right: -10px;
        font-size: 1.2rem;
        filter: drop-shadow(0 0 8px #f97316);
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // 6. Advent Season (Hope, Peace, Joy, Love)
  advent: {
    id: 'advent',
    name: 'Advent Season',
    category: 'christian_liturgical',
    description: 'The four weeks of preparation with candlelit warmth and hope.',
    logoBadge: '🕯️',
    greetingBanner: {
      headline: 'A Season of Hope, Peace, Joy & Love',
      subheadline: 'Preparing hearts for the coming of the Light of the World.',
      accentColor: '#818cf8',
    },
    particleType: 'advent_candles',
    cssAnimation: `
      .brand-icon::after {
        content: '🕯️';
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 1.15rem;
        filter: drop-shadow(0 0 6px #f59e0b);
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // 7. Epiphany / Three Kings Day
  epiphany: {
    id: 'epiphany',
    name: 'Epiphany (Three Kings Day)',
    category: 'christian_liturgical',
    description: 'The revelation of Christ to the Gentiles led by the Bethlehem star and wise men gifts.',
    logoBadge: '👑',
    greetingBanner: {
      headline: 'Blessed Feast of the Epiphany',
      subheadline: 'Following the Star of Bethlehem in truth and light.',
      accentColor: '#eab308',
    },
    particleType: 'golden_rays',
    cssAnimation: `
      .brand-icon::after {
        content: '👑';
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 1.15rem;
        filter: drop-shadow(0 0 8px #eab308);
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // ==========================================================================
  // COMMERCIAL SALES & SEASONAL CAMPAIGNS
  // ==========================================================================

  // 8. Black Friday (Door-Buster Mega Sale)
  black_friday: {
    id: 'black_friday',
    name: 'Black Friday Mega Sale',
    category: 'commercial_sale',
    description: 'Ultra high-contrast dark theme with fire neon tag, gold ribbons, and door-buster sales alert.',
    logoBadge: '🏷️',
    greetingBanner: {
      headline: '🔥 BLACK FRIDAY DOORBUSTERS IS LIVE',
      subheadline: 'Up to 70% OFF across all product catalogs & annual subscriptions.',
      accentColor: '#f43f5e',
    },
    particleType: 'none',
    cssAnimation: `
      .brand-icon::after {
        content: '🔥';
        position: absolute;
        top: -12px;
        right: -10px;
        font-size: 1.25rem;
        filter: drop-shadow(0 0 10px #f43f5e);
        pointer-events: none;
        z-index: 100;
        animation: salePulse 1.2s infinite alternate;
      }
      .btn {
        box-shadow: 0 0 20px rgba(244,63,94,0.6) !important;
      }
      @keyframes salePulse {
        0% { transform: scale(1); filter: drop-shadow(0 0 4px #f43f5e); }
        100% { transform: scale(1.25); filter: drop-shadow(0 0 14px #fb7185); }
      }
    `,
  },

  // 9. Independence Day (Freedom & Fireworks)
  independence_day: {
    id: 'independence_day',
    name: 'Independence Day (Fireworks)',
    category: 'national',
    description: 'Patriotic fireworks flare and celebration of liberty & national independence.',
    logoBadge: '🎆',
    greetingBanner: {
      headline: 'Happy Independence Day!',
      subheadline: 'Celebrating freedom, liberty, and courage with special holiday savings.',
      accentColor: '#38bdf8',
    },
    particleType: 'golden_rays',
    cssAnimation: `
      .brand-icon::after {
        content: '🎆';
        position: absolute;
        top: -12px;
        right: -10px;
        font-size: 1.2rem;
        filter: drop-shadow(0 0 10px #38bdf8);
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // 10. Summer Solstice & Tropical Sale
  summer_sale: {
    id: 'summer_sale',
    name: 'Summer Splash Sale',
    category: 'seasonal',
    description: 'Vibrant sunshine, tropical energy, and mid-year clearance promotions.',
    logoBadge: '☀️',
    greetingBanner: {
      headline: '☀️ Sizzling Summer Savings Are Here',
      subheadline: 'Refresh your business operations for Q3 with exclusive summer bundle deals.',
      accentColor: '#f59e0b',
    },
    particleType: 'golden_rays',
    cssAnimation: `
      .brand-icon::after {
        content: '☀️';
        position: absolute;
        top: -12px;
        right: -10px;
        font-size: 1.25rem;
        filter: drop-shadow(0 0 10px #f59e0b);
        pointer-events: none;
        z-index: 100;
        animation: sunSpin 12s linear infinite;
      }
      @keyframes sunSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
  },

  // 11. Spring Blossom & New Beginnings
  spring_sale: {
    id: 'spring_sale',
    name: 'Spring Blossom Refresh',
    category: 'seasonal',
    description: 'Fresh floral energy, soft pastels, and Q2 growth campaigns.',
    logoBadge: '🌸',
    greetingBanner: {
      headline: '🌸 Spring Forward with Fresh Solutions',
      subheadline: 'Bloom your business with our new spring platform features.',
      accentColor: '#ec4899',
    },
    particleType: 'easter_petals',
    cssAnimation: `
      .brand-icon::after {
        content: '🌸';
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 1.2rem;
        filter: drop-shadow(0 0 8px #ec4899);
        pointer-events: none;
        z-index: 100;
      }
    `,
  },

  // 12. Flash Sale (24-Hour Lightning Deal)
  flash_sale: {
    id: 'flash_sale',
    name: 'Flash Sale (24h Lightning)',
    category: 'commercial_sale',
    description: 'High-urgency lightning countdown bolt with pulsing energy effects.',
    logoBadge: '⚡',
    greetingBanner: {
      headline: '⚡ 24-HOUR FLASH SALE COUNTDOWN',
      subheadline: 'Limited-time instant rebate applied automatically at checkout.',
      accentColor: '#eab308',
    },
    particleType: 'none',
    cssAnimation: `
      .brand-icon::after {
        content: '⚡';
        position: absolute;
        top: -12px;
        right: -10px;
        font-size: 1.3rem;
        filter: drop-shadow(0 0 10px #eab308);
        pointer-events: none;
        z-index: 100;
        animation: flashBolt 0.8s infinite alternate;
      }
      @keyframes flashBolt {
        0% { transform: scale(0.95); opacity: 0.85; filter: drop-shadow(0 0 4px #eab308); }
        100% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 14px #facc15); }
      }
    `,
  },
};

export class HolidayDesigner {
  private static instance: HolidayDesigner;
  private customHolidays: Map<string, HolidayDefinition> = new Map();

  private constructor() {
    // Populate with Christian Holidays by default
    for (const h of Object.values(CHRISTIAN_HOLIDAY_REGISTRY)) {
      this.customHolidays.set(h.id, h);
    }
  }

  public static getInstance(): HolidayDesigner {
    if (!HolidayDesigner.instance) {
      HolidayDesigner.instance = new HolidayDesigner();
    }
    return HolidayDesigner.instance;
  }

  public listHolidays(): HolidayDefinition[] {
    return Array.from(this.customHolidays.values());
  }

  public getHoliday(id: string): HolidayDefinition | undefined {
    return this.customHolidays.get(id);
  }

  public registerCustomHoliday(holiday: HolidayDefinition): void {
    this.customHolidays.set(holiday.id, holiday);
  }

  public compileHolidayCSS(holidayId: string): string {
    const holiday = this.customHolidays.get(holidayId);
    if (!holiday || holidayId === 'none') return '';
    return holiday.cssAnimation;
  }
}
