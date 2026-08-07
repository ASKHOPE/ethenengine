// Capabilities: Accounting & Financials Subsystem (General Ledger, Invoicing, Chart of Accounts)

import { EventBus } from '../../foundation/EventBus.js';

export interface LedgerEntry {
  id: string;
  tenantId: string;
  accountName: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  timestamp: string;
}

export class AccountingEngine {
  private static instance: AccountingEngine;
  private ledger: LedgerEntry[] = [];
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultLedger();
  }

  public static getInstance(): AccountingEngine {
    if (!AccountingEngine.instance) {
      AccountingEngine.instance = new AccountingEngine();
    }
    return AccountingEngine.instance;
  }

  private seedDefaultLedger() {
    this.postTransaction('tenant_default', 'Cash Account', 'debit', 50000, 'Initial Corporate Capital');
  }

  public postTransaction(
    tenantId: string,
    accountName: string,
    type: 'debit' | 'credit',
    amount: number,
    description: string
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: `gl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      accountName,
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
    };

    this.ledger.push(entry);
    this.eventBus.publish('accounting.transaction.posted', entry, { tenantId });
    return entry;
  }

  public getLedger(tenantId: string): LedgerEntry[] {
    return this.ledger.filter((l) => l.tenantId === tenantId);
  }

  public getBalanceSheet(tenantId: string) {
    const entries = this.getLedger(tenantId);
    let totalDebits = 0;
    let totalCredits = 0;

    for (const e of entries) {
      if (e.type === 'debit') totalDebits += e.amount;
      if (e.type === 'credit') totalCredits += e.amount;
    }

    return {
      totalDebits,
      totalCredits,
      netBalance: totalDebits - totalCredits,
    };
  }
}
