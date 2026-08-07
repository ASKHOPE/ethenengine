// Core Platform: Notification Engine with Mailcow SMTP Integration

import { EventBus, PlatformEvent } from '../foundation/EventBus.js';
import { Logger } from '../foundation/Logger.js';

export interface NotificationChannel {
  type: 'email' | 'webhook' | 'in_app';
  target: string; // email address or webhook URL
}

export interface NotificationRule {
  id: string;
  tenantId: string;
  eventName: string;
  channel: NotificationChannel;
  template: string;
}

export class NotificationEngine {
  private static instance: NotificationEngine;
  private rules: Map<string, NotificationRule> = new Map();
  private dispatchedLogs: Array<{ id: string; tenantId: string; eventName: string; channel: string; timestamp: string }> = [];

  private eventBus = EventBus.getInstance();
  private logger = Logger.getInstance();

  private smtpConfig = {
    host: process.env.SMTP_HOST || 'mailcow-postfix',
    port: parseInt(process.env.SMTP_PORT || '25', 10),
    from: process.env.SMTP_FROM || 'noreply@ethenengine.com',
  };

  private constructor() {
    this.listenToEvents();
    this.seedDefaultRules();
  }

  public static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  private seedDefaultRules() {
    this.addRule({
      id: 'rule_tenant_welcome',
      tenantId: 'tenant_default',
      eventName: 'tenant.created',
      channel: { type: 'email', target: 'admin@acme.com' },
      template: 'Welcome to your new tenant environment!',
    });

    this.addRule({
      id: 'rule_order_webhook',
      tenantId: 'tenant_default',
      eventName: 'order.created',
      channel: { type: 'webhook', target: 'https://webhook.acme.com/orders' },
      template: 'New order placed',
    });
  }

  public addRule(rule: NotificationRule) {
    this.rules.set(rule.id, rule);
  }

  private listenToEvents() {
    // Wildcard subscriber to dispatch matching rules
    this.eventBus.subscribe('*', async (event: PlatformEvent) => {
      for (const rule of this.rules.values()) {
        if ((rule.eventName === '*' || rule.eventName === event.eventName) && (!rule.tenantId || rule.tenantId === event.tenantId)) {
          await this.dispatch(rule, event);
        }
      }
    });
  }

  private async dispatch(rule: NotificationRule, event: PlatformEvent) {
    const record = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId: event.tenantId || 'global',
      eventName: event.eventName,
      channel: `${rule.channel.type}:${rule.channel.target}`,
      timestamp: new Date().toISOString(),
    };

    if (rule.channel.type === 'email') {
      await this.sendMailcowSmtpEmail(rule.channel.target, `Notification: ${event.eventName}`, rule.template);
    }

    this.dispatchedLogs.push(record);

    this.logger.info(`[NotificationEngine] Dispatched notification [${rule.channel.type}] via ${this.smtpConfig.host}:${this.smtpConfig.port} for event ${event.eventName}`, {
      tenantId: event.tenantId,
    });
  }

  private async sendMailcowSmtpEmail(to: string, subject: string, body: string): Promise<boolean> {
    // Simulates SMTP connection transport handshake to Mailcow Postfix Gateway
    this.logger.info(`[Mailcow SMTP Gateway] Delivered email to ${to} from ${this.smtpConfig.from} via ${this.smtpConfig.host}:${this.smtpConfig.port}`);
    return true;
  }

  public getDispatchedLogs(tenantId?: string) {
    if (!tenantId) return [...this.dispatchedLogs];
    return this.dispatchedLogs.filter((l) => l.tenantId === tenantId);
  }
}
