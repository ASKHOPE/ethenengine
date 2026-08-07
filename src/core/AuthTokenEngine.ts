// Core Platform: JWT Authentication & Token Security Engine (Volume 4, Chapter 1 & ADR-008)

import jwt from 'jsonwebtoken';
import { UserIdentity } from './IdentityEngine.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ethenengine-super-secret-jwt-key-2026';
const JWT_EXPIRES_IN = '24h';

export interface AuthTokenPayload {
  userId: string;
  type: string;
  email: string;
  tenantId?: string;
  orgId?: string;
  roles: string[];
}

export class AuthTokenEngine {
  private static revokedTokens: Set<string> = new Set();

  public static generateToken(user: UserIdentity): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      type: user.type,
      email: user.email,
      tenantId: user.tenantId,
      orgId: user.orgId,
      roles: user.roles,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public static revokeToken(token: string): void {
    if (token) {
      this.revokedTokens.add(token);
    }
  }

  public static isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  public static verifyToken(token: string): AuthTokenPayload | null {
    if (this.isTokenRevoked(token)) {
      return null;
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (e) {
      return null;
    }
  }
}
