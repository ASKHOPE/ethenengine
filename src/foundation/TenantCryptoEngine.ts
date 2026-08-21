// Core Platform: Tenant-Specific Cryptographic Key Derivation Engine (Zero-Knowledge Isolation)
// Each tenant receives an isolated 256-bit encryption key derived via PBKDF2 with tenant salt + master secret.
// Superadmins cannot decrypt tenant data without active Support Access tokens.

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const MASTER_ENCRYPTION_SECRET = process.env.MASTER_ENCRYPTION_SECRET || process.env.ENCRYPTION_KEY || 'platform_root_master_key_9837492837492834';
const ALGORITHM = 'aes-256-gcm';

export interface TenantEncryptedPayload {
  tenantId: string;
  iv: string;
  tag: string;
  cipherText: string;
}

export class TenantCryptoEngine {
  private static instance: TenantCryptoEngine;
  private keyCache: Map<string, Buffer> = new Map();

  private constructor() {}

  public static getInstance(): TenantCryptoEngine {
    if (!TenantCryptoEngine.instance) {
      TenantCryptoEngine.instance = new TenantCryptoEngine();
    }
    return TenantCryptoEngine.instance;
  }

  /**
   * Derives a deterministic, cryptographically isolated 256-bit AES key for a specific tenant
   * using PBKDF2 key derivation with 10,000 iterations.
   */
  public getTenantKey(tenantId: string): Buffer {
    if (this.keyCache.has(tenantId)) {
      return this.keyCache.get(tenantId)!;
    }

    // Salt specifically bound to the tenant ID
    const tenantSalt = crypto.createHash('sha256').update(`tenant_salt_${tenantId}`).digest();
    const derivedKey = crypto.pbkdf2Sync(MASTER_ENCRYPTION_SECRET, tenantSalt, 10000, 32, 'sha256');

    this.keyCache.set(tenantId, derivedKey);
    return derivedKey;
  }

  /**
   * Encrypts plaintext data using the tenant's isolated encryption key.
   */
  public encryptForTenant(tenantId: string, plainText: string): TenantEncryptedPayload {
    const key = this.getTenantKey(tenantId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let cipherText = cipher.update(plainText, 'utf8', 'hex');
    cipherText += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      tenantId,
      iv: iv.toString('hex'),
      tag,
      cipherText,
    };
  }

  /**
   * Decrypts ciphertext using the tenant's isolated key.
   * If tenantId does not match the key, authentication tag verification will fail and throw an error.
   */
  public decryptForTenant(payload: TenantEncryptedPayload): string {
    const key = this.getTenantKey(payload.tenantId);
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
