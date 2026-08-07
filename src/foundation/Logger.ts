// Foundation: Structured JSON Logger with Tenant & Correlation Tracing (Volume 3, Chapter 4)

export interface LogContext {
  tenantId?: string;
  orgId?: string;
  userId?: string;
  requestId?: string;
  traceId?: string;
}

export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private format(level: string, message: string, context?: LogContext, meta?: Record<string, any>): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
      meta: meta || {},
    });
  }

  public info(message: string, context?: LogContext, meta?: Record<string, any>) {
    console.log(this.format('INFO', message, context, meta));
  }

  public warn(message: string, context?: LogContext, meta?: Record<string, any>) {
    console.warn(this.format('WARN', message, context, meta));
  }

  public error(message: string, context?: LogContext, meta?: Record<string, any>) {
    console.error(this.format('ERROR', message, context, meta));
  }
}
