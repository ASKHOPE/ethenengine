// Capabilities: Built-in Real-Time Communication Subsystem (Internal Chat, Team Channels & Customer Messaging)

import { EventBus } from '../../foundation/EventBus.js';

export interface ChatChannel {
  id: string;
  tenantId: string;
  name: string;
  type: 'public_channel' | 'private_team' | 'customer_support';
  memberUserIds: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  tenantId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export class CommunicationEngine {
  private static instance: CommunicationEngine;
  private channels: Map<string, ChatChannel> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private eventBus = EventBus.getInstance();

  private constructor() {
    this.seedDefaultCommunication();
  }

  public static getInstance(): CommunicationEngine {
    if (!CommunicationEngine.instance) {
      CommunicationEngine.instance = new CommunicationEngine();
    }
    return CommunicationEngine.instance;
  }

  private seedDefaultCommunication() {
    const generalChannel: ChatChannel = {
      id: 'chan_general',
      tenantId: 'tenant_default',
      name: '#general',
      type: 'public_channel',
      memberUserIds: ['usr_admin', 'usr_tenant_admin'],
      createdAt: new Date().toISOString(),
    };
    this.channels.set(generalChannel.id, generalChannel);

    const msg: ChatMessage = {
      id: 'msg_1',
      channelId: generalChannel.id,
      tenantId: 'tenant_default',
      senderId: 'usr_admin',
      senderName: 'Platform Architect',
      content: 'Welcome to the built-in enterprise real-time communication channel!',
      timestamp: new Date().toISOString(),
    };
    this.messages.set(generalChannel.id, [msg]);
  }

  public createChannel(channel: Omit<ChatChannel, 'id' | 'createdAt'>): ChatChannel {
    const newChan: ChatChannel = {
      ...channel,
      id: `chan_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.channels.set(newChan.id, newChan);
    this.messages.set(newChan.id, []);
    this.eventBus.publish('communication.channel.created', newChan, { tenantId: channel.tenantId });
    return newChan;
  }

  public sendMessage(tenantId: string, channelId: string, senderId: string, senderName: string, content: string): ChatMessage {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channelId,
      tenantId,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
    };

    if (!this.messages.has(channelId)) {
      this.messages.set(channelId, []);
    }
    this.messages.get(channelId)!.push(message);

    // Publish event over EventBus
    this.eventBus.publish('communication.message.sent', message, { tenantId, actorId: senderId });
    return message;
  }

  public getMessages(channelId: string): ChatMessage[] {
    return this.messages.get(channelId) || [];
  }

  public listChannels(tenantId: string): ChatChannel[] {
    return Array.from(this.channels.values()).filter((c) => c.tenantId === tenantId);
  }

  public async sendEmailViaPostfix(to: string, subject: string, body: string): Promise<{ success: boolean; messageId: string }> {
    const smtpHost = process.env.SMTP_HOST || 'mailcow-postfix';
    const smtpPort = parseInt(process.env.SMTP_PORT || '25', 10);
    const from = process.env.SMTP_FROM || 'noreply@ethenengine.com';

    try {
      const net = await import('net');
      return new Promise((resolve) => {
        const client = net.createConnection({ host: smtpHost, port: smtpPort }, () => {
          // Handshake initiated
        });

        let step = 0;
        client.on('data', (data) => {
          const res = data.toString();
          if (step === 0) {
            client.write(`EHLO ${smtpHost}\r\n`);
            step++;
          } else if (step === 1) {
            client.write(`MAIL FROM:<${from}>\r\n`);
            step++;
          } else if (step === 2) {
            client.write(`RCPT TO:<${to}>\r\n`);
            step++;
          } else if (step === 3) {
            client.write(`DATA\r\n`);
            step++;
          } else if (step === 4) {
            client.write(`Subject: ${subject}\r\nFrom: ${from}\r\nTo: ${to}\r\n\r\n${body}\r\n.\r\n`);
            step++;
          } else if (step === 5) {
            client.write(`QUIT\r\n`);
            client.end();
            resolve({ success: true, messageId: `mail_${Date.now()}` });
          }
        });

        client.on('error', (err) => {
          resolve({ success: false, messageId: `err_${Date.now()}` });
        });
      });
    } catch {
      return { success: false, messageId: `err_${Date.now()}` };
    }
  }
}
