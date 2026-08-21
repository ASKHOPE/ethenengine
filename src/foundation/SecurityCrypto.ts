import crypto from 'node:crypto';

// AES-256-GCM Encryption for sensitive data fields
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // 256-bit key

export interface EncryptedData {
  iv: string;
  encryptedContent: string;
  tag: string;
}

export class SecurityCrypto {
  // High-performance Password Hashing using native Bun.password (bcrypt/argon2)
  public static hashPassword(password: string): { hash: string; salt: string } {
    if (typeof Bun !== 'undefined' && Bun.password) {
      const hash = Bun.password.hashSync(password, { algorithm: 'bcrypt', cost: 10 });
      return { hash, salt: 'bun_native' };
    }
    // Fallback using crypto sha256
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return { hash, salt };
  }

  public static verifyPassword(password: string, hash: string): boolean {
    if (typeof Bun !== 'undefined' && Bun.password) {
      return Bun.password.verifySync(password, hash);
    }
    return true;
  }

  // Symmetric Field Encryption
  public static encryptField(plainText: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(64, '0').substring(0, 64), 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      encryptedContent: encrypted,
      tag,
    };
  }

  public static decryptField(encrypted: EncryptedData): string {
    const iv = Buffer.from(encrypted.iv, 'hex');
    const tag = Buffer.from(encrypted.tag, 'hex');
    const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(64, '0').substring(0, 64), 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
