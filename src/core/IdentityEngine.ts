// Core Platform: Isolated Identity Engine (ADR-008 & Volume 4, Chapter 1)
// Explicit separation: Platform Users vs Tenant Users vs Public Users

import { SecurityCrypto } from '../foundation/SecurityCrypto.js';

export type IdentityType = 'PLATFORM_USER' | 'TENANT_USER' | 'PUBLIC_USER';

export interface SecurityQuestionAnswer {
  questionId: string;
  question: string;
  answerHash: string;
}

export interface UserIdentity {
  id: string;
  type: IdentityType;
  email: string;
  name: string;
  passwordHash?: string;
  passwordHistory?: string[]; // Stores hashes of last 5 used passwords
  securityQuestions?: SecurityQuestionAnswer[]; // Stores hashed answers to security questions
  tenantId?: string;
  orgId?: string;
  roles: string[];
}

export interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: number;
}

export class IdentityEngine {
  private static instance: IdentityEngine;
  private identities: Map<string, UserIdentity> = new Map();
  private resetTokens: Map<string, PasswordResetToken> = new Map();

  private constructor() {
    this.seedDefaultIdentities();
  }

  public static getInstance(): IdentityEngine {
    if (!IdentityEngine.instance) {
      IdentityEngine.instance = new IdentityEngine();
    }
    return IdentityEngine.instance;
  }

  private seedDefaultIdentities() {
    const defaultPasswordHash = SecurityCrypto.hashPassword('Password123!').hash;
    const defaultAnswerHash = SecurityCrypto.hashPassword('Fluffy').hash;

    const defaultSecurityQuestions: SecurityQuestionAnswer[] = [
      {
        questionId: 'q1',
        question: "What was the name of your first pet?",
        answerHash: defaultAnswerHash,
      },
    ];

    // 1. Platform Superadmin
    const platformAdmin: UserIdentity = {
      id: 'usr_platform_admin',
      type: 'PLATFORM_USER',
      email: 'platform@ethenengine.com',
      name: 'Platform Super Admin',
      passwordHash: defaultPasswordHash,
      passwordHistory: [defaultPasswordHash],
      securityQuestions: defaultSecurityQuestions,
      roles: ['superadmin'],
    };
    this.identities.set(platformAdmin.id, platformAdmin);

    // 2. Tenant Staff Admin
    const tenantUser: UserIdentity = {
      id: 'usr_tenant_admin',
      type: 'TENANT_USER',
      email: 'admin@ethenengine.com',
      name: 'ETHENENGINE Tenant Admin',
      passwordHash: defaultPasswordHash,
      passwordHistory: [defaultPasswordHash],
      securityQuestions: defaultSecurityQuestions,
      orgId: 'org_ethenengine',
      tenantId: 'tenant_default',
      roles: ['tenant_admin'],
    };
    this.identities.set(tenantUser.id, tenantUser);

    // 3. Public Customer / End User
    const publicUser: UserIdentity = {
      id: 'usr_public_customer',
      type: 'PUBLIC_USER',
      email: 'customer@gmail.com',
      name: 'Jane Customer',
      passwordHash: defaultPasswordHash,
      passwordHistory: [defaultPasswordHash],
      securityQuestions: defaultSecurityQuestions,
      tenantId: 'tenant_default',
      roles: ['customer'],
    };
    this.identities.set(publicUser.id, publicUser);
  }

  public getIdentity(id: string): UserIdentity | undefined {
    return this.identities.get(id);
  }

  public getIdentityByEmail(email: string, type?: IdentityType): UserIdentity | undefined {
    for (const identity of this.identities.values()) {
      if (identity.email.toLowerCase() === email.toLowerCase()) {
        if (!type || identity.type === type) {
          return identity;
        }
      }
    }
    return undefined;
  }

  public registerUser(params: {
    email: string;
    name: string;
    password: string;
    securityQuestions?: { questionId?: string; question: string; answer: string }[];
    type?: IdentityType;
    tenantId?: string;
    orgId?: string;
    roles?: string[];
  }): UserIdentity {
    const existing = this.getIdentityByEmail(params.email, params.type);
    if (existing) {
      throw new Error(`User with email '${params.email}' already exists.`);
    }

    const { hash } = SecurityCrypto.hashPassword(params.password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const processedQuestions: SecurityQuestionAnswer[] = (params.securityQuestions || []).map((sq, idx) => ({
      questionId: sq.questionId || `q_${idx + 1}`,
      question: sq.question,
      answerHash: SecurityCrypto.hashPassword(sq.answer.trim().toLowerCase()).hash,
    }));

    const identity: UserIdentity = {
      id: userId,
      type: params.type || 'PUBLIC_USER',
      email: params.email,
      name: params.name,
      passwordHash: hash,
      passwordHistory: [hash],
      securityQuestions: processedQuestions,
      tenantId: params.tenantId || 'tenant_default',
      orgId: params.orgId,
      roles: params.roles || ['customer'],
    };

    this.identities.set(identity.id, identity);
    return identity;
  }

  public authenticate(email: string, type: IdentityType): UserIdentity | undefined {
    return this.getIdentityByEmail(email, type);
  }

  public authenticateWithPassword(email: string, password: string, type?: IdentityType): UserIdentity | undefined {
    const user = this.getIdentityByEmail(email, type);
    if (!user || !user.passwordHash) {
      return undefined;
    }

    const isValid = SecurityCrypto.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return undefined;
    }

    return user;
  }

  // Security Questions for Password Recovery
  public getSecurityQuestions(email: string): { questionId: string; question: string }[] {
    const user = this.getIdentityByEmail(email);
    if (!user || !user.securityQuestions) return [];
    return user.securityQuestions.map((q) => ({ questionId: q.questionId, question: q.question }));
  }

  public verifySecurityQuestionAnswers(
    email: string,
    answers: { questionId: string; answer: string }[]
  ): boolean {
    const user = this.getIdentityByEmail(email);
    if (!user || !user.securityQuestions || user.securityQuestions.length === 0) {
      return false;
    }

    for (const item of answers) {
      const q = user.securityQuestions.find((sq) => sq.questionId === item.questionId);
      if (!q) return false;

      const isValid = SecurityCrypto.verifyPassword(item.answer.trim().toLowerCase(), q.answerHash);
      if (!isValid) return false;
    }

    return true;
  }

  public createPasswordResetTokenWithSecurityQuestions(
    email: string,
    answers: { questionId: string; answer: string }[]
  ): string | null {
    const verified = this.verifySecurityQuestionAnswers(email, answers);
    if (!verified) {
      return null;
    }
    return this.createPasswordResetToken(email);
  }

  public createPasswordResetToken(email: string): string | null {
    const user = this.getIdentityByEmail(email);
    if (!user) {
      return null;
    }

    const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    this.resetTokens.set(token, {
      token,
      email: user.email,
      expiresAt,
    });

    return token;
  }

  public resetPasswordWithToken(token: string, newPassword: string): boolean {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return false;
    }

    if (Date.now() > resetData.expiresAt) {
      this.resetTokens.delete(token);
      return false;
    }

    const user = this.getIdentityByEmail(resetData.email);
    if (!user) {
      return false;
    }

    // Password History Check: Cannot reuse last 5 passwords
    for (const oldHash of user.passwordHistory || []) {
      if (SecurityCrypto.verifyPassword(newPassword, oldHash)) {
        throw new Error('PasswordReuseBlocked: Cannot reuse any of your last 5 passwords.');
      }
    }

    const { hash } = SecurityCrypto.hashPassword(newPassword);
    user.passwordHash = hash;

    // Push new hash to password history (keep max 5)
    user.passwordHistory = [hash, ...(user.passwordHistory || [])].slice(0, 5);

    this.resetTokens.delete(token);
    return true;
  }

  // Allow setting or updating security questions
  public updateSecurityQuestions(
    userId: string,
    questions: { questionId?: string; question: string; answer: string }[]
  ): boolean {
    const user = this.getIdentity(userId);
    if (!user) return false;

    user.securityQuestions = questions.map((sq, idx) => ({
      questionId: sq.questionId || `q_${idx + 1}`,
      question: sq.question,
      answerHash: SecurityCrypto.hashPassword(sq.answer.trim().toLowerCase()).hash,
    }));
    return true;
  }
}
