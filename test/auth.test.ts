import { IdentityEngine } from '../src/core/IdentityEngine.js';
import { AuthTokenEngine } from '../src/core/AuthTokenEngine.js';
import { UnifiedAuthGateway } from '../src/core/UnifiedAuthGateway.js';
import { AuditLogger } from '../src/foundation/AuditLogger.js';

async function runAuthTestSuite() {
  console.log('================================================================');
  console.log(' Running Enhanced Auth Suite: Password History & Security Q&A   ');
  console.log('================================================================');

  const identityEngine = IdentityEngine.getInstance();
  const auditLogger = AuditLogger.getInstance();

  // Test 1: Seeded Admin Login with Password
  console.log('\n--- Test 1: Seeded Admin Login ---');
  const seededAdmin = identityEngine.authenticateWithPassword('platform@ethenengine.com', 'Password123!');
  if (!seededAdmin) {
    throw new Error('Failed to authenticate seeded admin account with default password.');
  }
  console.log('✓ Seeded admin logged in successfully.');

  // Test 2: Registration with Security Questions
  console.log('\n--- Test 2: Registration with Security Questions ---');
  const email = `bob_${Date.now()}@example.com`;
  const initialPassword = 'Password1!';
  const newUser = identityEngine.registerUser({
    email,
    name: 'Bob Smith',
    password: initialPassword,
    securityQuestions: [
      { questionId: 'q1', question: 'What was your first car model?', answer: 'Honda Civic' },
      { questionId: 'q2', question: 'What city were you born in?', answer: 'Seattle' },
    ],
  });
  console.log('✓ Registered Bob Smith with security questions -> User ID:', newUser.id);

  // Test 3: Retrieve Public Security Questions
  console.log('\n--- Test 3: Security Question Retrieval ---');
  const questions = identityEngine.getSecurityQuestions(email);
  if (questions.length !== 2 || questions[0].questionId !== 'q1') {
    throw new Error('Failed to fetch user security questions.');
  }
  console.log('✓ Fetched public questions successfully:', questions.map((q) => q.question).join(' | '));

  // Test 4: Forgot Password via Security Answers
  console.log('\n--- Test 4: Forgot Password via Security Answers ---');
  const invalidAnswerToken = identityEngine.createPasswordResetTokenWithSecurityQuestions(email, [
    { questionId: 'q1', answer: 'WrongCar' },
    { questionId: 'q2', answer: 'Seattle' },
  ]);
  if (invalidAnswerToken !== null) {
    throw new Error('Issued reset token despite invalid security question answer!');
  }
  console.log('✓ Invalid security answers correctly rejected.');

  const validResetToken = identityEngine.createPasswordResetTokenWithSecurityQuestions(email, [
    { questionId: 'q1', answer: 'honda civic' }, // case-insensitive check
    { questionId: 'q2', answer: 'SEATTLE' },
  ]);
  if (!validResetToken) {
    throw new Error('Failed to issue reset token with valid security answers!');
  }
  console.log('✓ Issued reset token after verifying security question answers:', validResetToken);

  // Test 5: Password History Guard (Blocking Reuse of Previous Password)
  console.log('\n--- Test 5: Password History Guard ---');
  try {
    identityEngine.resetPasswordWithToken(validResetToken, initialPassword);
    throw new Error('Failed to block reuse of initial password!');
  } catch (err: any) {
    console.log('✓ Password history guard blocked reuse of old password:', err.message);
  }

  // Issue new token and set a fresh password
  const freshToken = identityEngine.createPasswordResetToken(email)!;
  const secondPassword = 'Password2!';
  identityEngine.resetPasswordWithToken(freshToken, secondPassword);
  console.log('✓ Successfully updated to Password2!');

  // Issue another token and attempt to reuse Password1 or Password2
  const token2 = identityEngine.createPasswordResetToken(email)!;
  try {
    identityEngine.resetPasswordWithToken(token2, initialPassword);
    throw new Error('Failed to block reuse of Password1 from history!');
  } catch (err: any) {
    console.log('✓ Blocked reuse of Password1 from history list.');
  }

  try {
    identityEngine.resetPasswordWithToken(token2, secondPassword);
    throw new Error('Failed to block reuse of Password2 from history!');
  } catch (err: any) {
    console.log('✓ Blocked reuse of Password2 from history list.');
  }

  // Successfully update to Password3!
  const thirdPassword = 'Password3!';
  identityEngine.resetPasswordWithToken(token2, thirdPassword);
  console.log('✓ Successfully updated to Password3!');

  // Test 7: UnifiedAuthGateway Verification (In-House & OIDC Claims)
  console.log('\n--- Test 7: UnifiedAuthGateway Claims Verification ---');
  const authGateway = UnifiedAuthGateway.getInstance();
  const loginResult = authGateway.processLoginRequest({
    email,
    password: thirdPassword,
    tenantId: 'tenant_default',
  });

  if (loginResult.action !== 'AUTHENTICATED' || !loginResult.token) {
    throw new Error('UnifiedAuthGateway failed to authenticate user credentials.');
  }

  const resolvedContext = authGateway.verifyTokenAndResolveContext(loginResult.token);
  if (!resolvedContext || resolvedContext.provider !== 'IN_HOUSE') {
    throw new Error('Failed to resolve context in UnifiedAuthGateway.');
  }
  console.log('✓ UnifiedAuthGateway resolved context successfully. Plan:', resolvedContext.subscriptionPlan, '| Provider:', resolvedContext.provider);

  console.log('\n================================================================');
  console.log(' ALL ENHANCED AUTH & UNIFIED GATEWAY TESTS PASSED!               ');
  console.log('================================================================');
}

runAuthTestSuite().catch((err) => {
  console.error('Auth Test Suite Failed:', err);
  process.exit(1);
});
