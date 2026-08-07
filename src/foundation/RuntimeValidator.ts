import type { MiddlewareHandler } from 'hono';

export const runtimeInputValidator: MiddlewareHandler = async (c, next) => {
  // 1. Query Parameter Injection Check
  const rawUrl = decodeURIComponent(c.req.url || '');
  if (rawUrl.includes('<script>') || rawUrl.includes('<script')) {
    return c.json({ error: 'Security Violation: Unsafe query parameter' }, 400);
  }

  // 2. Prototype Pollution Check
  if (c.req.header('content-type')?.includes('application/json')) {
    try {
      const clonedReq = c.req.raw.clone();
      const bodyText = await clonedReq.text();
      if (bodyText.includes('__proto__') || bodyText.includes('constructor') || bodyText.includes('prototype')) {
        return c.json({ error: 'Security Violation: Malicious payload structure detected' }, 400);
      }
    } catch {}
  }

  await next();
};
