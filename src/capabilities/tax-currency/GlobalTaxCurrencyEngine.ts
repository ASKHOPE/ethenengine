export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'INR' | 'CHF';

export interface TaxCalculationResult {
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  totalWithTax: number;
  jurisdiction: string;
  taxName: string;
}

export class GlobalTaxCurrencyEngine {
  private static instance: GlobalTaxCurrencyEngine;

  // Fixed conversion rates against USD base (1.0)
  private rates: Record<CurrencyCode, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 145.5,
    AUD: 1.52,
    CAD: 1.36,
    INR: 83.4,
    CHF: 0.88
  };

  // Tax rates per country / region
  private taxJurisdictions: Record<string, { rate: number; name: string }> = {
    EU: { rate: 21, name: 'EU Value Added Tax (VAT)' },
    UK: { rate: 20, name: 'UK Value Added Tax (VAT)' },
    AU: { rate: 10, name: 'Australia Goods & Services Tax (GST)' },
    IN: { rate: 18, name: 'India Goods & Services Tax (GST)' },
    CA: { rate: 13, name: 'Canada Harmonized Sales Tax (HST)' },
    US: { rate: 8.5, name: 'US State & Local Sales Tax' },
    CH: { rate: 8.1, name: 'Swiss Value Added Tax (VAT)' }
  };

  public static getInstance(): GlobalTaxCurrencyEngine {
    if (!GlobalTaxCurrencyEngine.instance) {
      GlobalTaxCurrencyEngine.instance = new GlobalTaxCurrencyEngine();
    }
    return GlobalTaxCurrencyEngine.instance;
  }

  public convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const amountInUSD = amount / (this.rates[from] || 1.0);
    const converted = amountInUSD * (this.rates[to] || 1.0);
    return Math.round(converted * 100) / 100;
  }

  public calculateTax(subtotal: number, regionCode: string = 'US'): TaxCalculationResult {
    const config = this.taxJurisdictions[regionCode.toUpperCase()] || this.taxJurisdictions['US'];
    const taxAmount = Math.round(((subtotal * config.rate) / 100) * 100) / 100;
    const totalWithTax = Math.round((subtotal + taxAmount) * 100) / 100;

    return {
      subtotal,
      taxRatePercent: config.rate,
      taxAmount,
      totalWithTax,
      jurisdiction: regionCode.toUpperCase(),
      taxName: config.name
    };
  }

  public formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
    const symbols: Record<CurrencyCode, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      INR: '₹',
      CHF: 'CHF '
    };
    const sym = symbols[currency] || '$';
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
