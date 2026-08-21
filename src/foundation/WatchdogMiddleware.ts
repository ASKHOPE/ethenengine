// Foundation: Watchdog Request Telemetry Middleware
import type { MiddlewareHandler } from 'hono';
import { WatchdogEngine } from './WatchdogEngine.js';

export function watchdogMiddleware(): MiddlewareHandler {
  const watchdog = WatchdogEngine.getInstance();

  return async (c, next) => {
    const startTime = performance.now();
    const path = c.req.path;

    // Subsystem classification
    let subsystem = 'core';
    if (path.startsWith('/api/commerce')) subsystem = 'commerce';
    else if (path.startsWith('/api/inventory')) subsystem = 'inventory';
    else if (path.startsWith('/api/crm') || path.startsWith('/api/forms')) subsystem = 'crm';
    else if (path.startsWith('/api/erp')) subsystem = 'erp';
    else if (path.startsWith('/api/accounting')) subsystem = 'accounting';
    else if (path.startsWith('/api/cms')) subsystem = 'cms';
    else if (path.startsWith('/api/website') || path.startsWith('/api/theme')) subsystem = 'website';
    else if (path.startsWith('/api/collab')) subsystem = 'collab';
    else if (path.startsWith('/api/auth')) subsystem = 'auth';

    try {
      await next();
      const durationMs = performance.now() - startTime;
      const statusCode = c.res.status || 200;
      watchdog.trackRequest(durationMs, statusCode, path, subsystem);
    } catch (err: any) {
      const durationMs = performance.now() - startTime;
      watchdog.trackRequest(durationMs, 500, path, subsystem);
      watchdog.recordIncident({
        severity: 'high',
        type: 'unhandled_exception',
        subsystem,
        message: `Unhandled exception in route ${path}: ${err.message || String(err)}`,
        stack: err.stack,
        context: { path, method: c.req.method },
      });
      throw err;
    }
  };
}
