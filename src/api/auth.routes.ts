import { Hono } from 'hono';
import { IdentityEngine } from '../core/IdentityEngine.js';
import { AuthTokenEngine } from '../core/AuthTokenEngine.js';
import { UnifiedAuthGateway } from '../core/UnifiedAuthGateway.js';
import { AuditLogger } from '../foundation/AuditLogger.js';
import { AppEnv } from '../foundation/AppEnv.js';

export const authRouter = new Hono<AppEnv>();
const auditLogger = AuditLogger.getInstance();

authRouter.post('/register', async (c) => {
  const body = await c.req.json();
  const { email, name, password, securityQuestions, type } = body;
  const tenant = c.get('tenant');

  if (!email || !name || !password) {
    return c.json({ error: 'Missing required fields: email, name, password' }, 400);
  }

  try {
    const identityEngine = IdentityEngine.getInstance();
    const user = identityEngine.registerUser({
      email,
      name,
      password,
      securityQuestions,
      type: type || 'PUBLIC_USER',
      tenantId: tenant.id,
    });

    const token = AuthTokenEngine.generateToken(user);
    auditLogger.log({
      tenantId: tenant.id,
      actorId: user.id,
      action: 'user.register',
      resource: `User:${user.id}`,
      details: { email: user.email, type: user.type },
    });

    return c.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        tenantId: user.tenantId,
        roles: user.roles,
      },
      token,
    }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || 'Registration failed' }, 400);
  }
});

authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const { email, password, tenantSlug } = body;
  const tenant = c.get('tenant');

  if (!email || !password) {
    return c.json({ error: 'Missing email or password' }, 400);
  }

  try {
    const authGateway = UnifiedAuthGateway.getInstance();
    const result = authGateway.processLoginRequest({
      email,
      password,
      tenantId: tenant?.id || 'tenant_default',
    });

    if (result.action === 'AUTHENTICATED' && result.token && result.user) {
      auditLogger.log({
        tenantId: tenant?.id || 'tenant_default',
        actorId: result.user.id || 'usr_admin',
        action: 'user.login',
        resource: `User:${result.user.id}`,
        details: { email: result.user.email, provider: 'local' },
      });

      c.header('Set-Cookie', `auth_token=${result.token}; path=/; HttpOnly; SameSite=Lax`);

      return c.json({
        message: 'Authenticated successfully',
        user: result.user,
        token: result.token,
      });
    }

    return c.json({ error: 'Authentication failed' }, 401);
  } catch (err: any) {
    return c.json({ error: err.message || 'Invalid credentials' }, 401);
  }
});

authRouter.post('/logout', async (c) => {
  const authHeader = c.req.header('authorization');
  const cookieHeader = c.req.header('cookie');
  const tokenFromCookie = cookieHeader ? cookieHeader.split('; ').find((row: string) => row.startsWith('auth_token='))?.split('=')[1] : null;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = tokenFromHeader || tokenFromCookie;
  const tenant = c.get('tenant');

  if (token) {
    AuthTokenEngine.revokeToken(token);
    const authGateway = UnifiedAuthGateway.getInstance();
    const context = authGateway.verifyTokenAndResolveContext(token);
    if (context) {
      auditLogger.log({
        tenantId: tenant?.id || 'tenant_default',
        actorId: context.user.userId,
        action: 'user.logout',
        resource: `User:${context.user.userId}`,
        details: { email: context.user.email, provider: context.provider },
      });
    }
  }

  c.header('Set-Cookie', 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  return c.json({ message: 'Logged out successfully' });
});

authRouter.get('/me', (c) => {
  const userContext = c.get('userContext');
  if (!userContext) return c.json({ authenticated: false, error: 'Unauthorized' }, 401);
  return c.json({ authenticated: true, user: userContext.user });
});
