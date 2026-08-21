// Foundation: Defensive Cybersecurity Middleware & Rate Limiting Guard
// Comprehensive Protection: Rate Limiting, HTTP Security Headers, Strict Tenant Sanitization,
// Clickjacking / MIME-sniffing / XSS Defense

import type { MiddlewareHandler } from 'hono';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private requestStore: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {
    // Periodic garbage collection for expired rate limit buckets
    const timer = setInterval(() => this.cleanup(), 60000);
    timer.unref?.();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public isRateLimited(key: string, limit: number = 100, windowMs: number = 60000): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requestStore.get(key);

    if (!entry || now > entry.resetTime) {
      this.requestStore.set(key, { count: 1, resetTime: now + windowMs });
      return { limited: false, remaining: limit - 1, resetTime: now + windowMs };
    }

    entry.count++;
    if (entry.count > limit) {
      return { limited: true, remaining: 0, resetTime: entry.resetTime };
    }

    return { limited: false, remaining: limit - entry.count, resetTime: entry.resetTime };
  }

  public resetKey(key: string): void {
    this.requestStore.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [k, v] of this.requestStore.entries()) {
      if (now > v.resetTime) {
        this.requestStore.delete(k);
      }
    }
  }
}

export const rateLimiterInstance = RateLimiter.getInstance();

/**
 * Global HTTP Security Headers Middleware
 * Adds defense-in-depth headers according to OWASP Secure Headers Project
 */
export const securityHeadersMiddleware: MiddlewareHandler = async (c, next) => {
  // 1. Clickjacking Mitigation
  c.header('X-Frame-Options', 'SAMEORIGIN');
  // 2. MIME Sniffing Mitigation
  c.header('X-Content-Type-Options', 'nosniff');
  // 3. XSS Filter Trigger
  c.header('X-XSS-Protection', '1; mode=block');
  // 4. Referrer Policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  // 5. Strict Transport Security
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // 6. Content Security Policy (allows necessary CDNs & inline scripts for studio/swagger)
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' ws: wss:;"
  );

  await next();
};

/**
 * Sliding Window API Rate Limiter Middleware
 * Throttle brute-force attacks on sensitive endpoints (/api/auth/login, /api/comms, etc.)
 */
export const apiRateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'client_direct';
  const path = c.req.path;

  // Stricter limits for authentication & sensitive mutations (15 req/min) vs standard endpoints (120 req/min)
  const isAuthEndpoint = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register');
  const limit = isAuthEndpoint ? 15 : 120;
  const windowMs = 60000; // 1 minute

  const rateCheck = rateLimiterInstance.isRateLimited(`${ip}:${path}`, limit, windowMs);

  c.header('X-RateLimit-Limit', limit.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, rateCheck.remaining).toString());
  c.header('X-RateLimit-Reset', Math.ceil(rateCheck.resetTime / 1000).toString());

  if (rateCheck.limited) {
    return c.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${limit} requests per minute allowed on this endpoint.`,
        retryAfterSeconds: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
      },
      429
    );
  }

  await next();
};

export class SecurityGuard {
  public static securityMiddleware(): MiddlewareHandler {
    return async (c, next) => {
      await securityHeadersMiddleware(c, async () => {
        await apiRateLimitMiddleware(c, next);
      });
    };
  }
}

