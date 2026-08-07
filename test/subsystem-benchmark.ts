// Comprehensive Subsystem Benchmark Suite for ETHENENGINE Platform

import { AuthTokenEngine } from '../src/core/AuthTokenEngine.js';
import { SecurityCrypto } from '../src/foundation/SecurityCrypto.js';
import { EventBus } from '../src/foundation/EventBus.js';
import { SearchEngine } from '../src/core/SearchEngine.js';
import { escapeHtml } from '../src/foundation/Sanitizer.js';

async function benchmarkSubsystems() {
  console.log('=======================================================');
  console.log(' ETHENENGINE Core Subsystems Performance Benchmark Suite');
  console.log('=======================================================');

  // 1. JWT Auth Token Engine Benchmark
  console.log('\n--- 1. Auth Token Engine (JWT Signing & Verifying) ---');
  const userObj = { id: 'usr_test_123', type: 'TENANT_USER' as const, email: 'user@acme.com', roles: ['tenant_admin'] };
  
  const tokenCount = 10000;
  const startAuth = performance.now();
  for (let i = 0; i < tokenCount; i++) {
    const token = AuthTokenEngine.generateToken(userObj);
    AuthTokenEngine.verifyToken(token);
  }
  const endAuth = performance.now();
  const authOpsPerSec = (tokenCount * 2 / (endAuth - startAuth)) * 1000;
  console.log(`✓ Signed & Verified ${tokenCount} JWT Tokens in ${(endAuth - startAuth).toFixed(2)} ms`);
  console.log(`🚀 Token Engine Throughput: ${authOpsPerSec.toFixed(0)} ops/sec`);

  // 2. AES-256-GCM Encryption Benchmark
  console.log('\n--- 2. Cryptographic Engine (AES-256-GCM Encryption) ---');
  const secretData = 'Sensitivie PII Data Payload for Enterprise Tenant Isolation';
  const cryptoCount = 10000;
  const startCrypto = performance.now();
  for (let i = 0; i < cryptoCount; i++) {
    const encrypted = SecurityCrypto.encryptField(secretData);
    SecurityCrypto.decryptField(encrypted);
  }
  const endCrypto = performance.now();
  const cryptoOpsPerSec = (cryptoCount * 2 / (endCrypto - startCrypto)) * 1000;
  console.log(`✓ Encrypted & Decrypted ${cryptoCount} Payloads in ${(endCrypto - startCrypto).toFixed(2)} ms`);
  console.log(`🚀 AES-256 Crypto Throughput: ${cryptoOpsPerSec.toFixed(0)} ops/sec`);

  // 3. EventBus In-Memory Event Dispatch Benchmark
  console.log('\n--- 3. EventBus Async Publishing Pipeline ---');
  const eventBus = EventBus.getInstance();
  let receivedCount = 0;
  eventBus.subscribe('benchmark.event', () => { receivedCount++; });

  const eventCount = 50000;
  const startEvent = performance.now();
  for (let i = 0; i < eventCount; i++) {
    eventBus.publish('benchmark.event', { index: i }, { tenantId: 'tenant_default' });
  }
  const endEvent = performance.now();
  const eventOpsPerSec = (eventCount / (endEvent - startEvent)) * 1000;
  console.log(`✓ Dispatched & Processed ${receivedCount} Domain Events in ${(endEvent - startEvent).toFixed(2)} ms`);
  console.log(`🚀 EventBus Throughput: ${eventOpsPerSec.toFixed(0)} events/sec`);

  // 4. HTML Entity Sanitization & Block Compilation Benchmark
  console.log('\n--- 4. Sanitizer & Block Compiler ---');
  const rawHtml = '<script>alert("xss")</script> <h1>Welcome Enterprise User & Partner</h1>';
  const compileCount = 100000;
  const startCompile = performance.now();
  for (let i = 0; i < compileCount; i++) {
    escapeHtml(rawHtml);
  }
  const endCompile = performance.now();
  const compileOpsPerSec = (compileCount / (endCompile - startCompile)) * 1000;
  console.log(`✓ Sanitized & Escaped ${compileCount} HTML String Blocks in ${(endCompile - startCompile).toFixed(2)} ms`);
  console.log(`🚀 HTML Sanitizer Throughput: ${compileOpsPerSec.toFixed(0)} ops/sec`);

  // 5. In-Memory Search Engine Benchmark
  console.log('\n--- 5. In-Memory Search Indexing & Query Latency ---');
  const searchEngine = SearchEngine.getInstance();
  const searchCount = 10000;
  const startSearch = performance.now();
  for (let i = 0; i < searchCount; i++) {
    searchEngine.search('tenant_default', 'Website');
  }
  const endSearch = performance.now();
  const searchOpsPerSec = (searchCount / (endSearch - startSearch)) * 1000;
  const avgSearchMs = (endSearch - startSearch) / searchCount;
  console.log(`✓ Executed ${searchCount} Search Queries in ${(endSearch - startSearch).toFixed(2)} ms`);
  console.log(`⚡ Average Search Query Latency: ${avgSearchMs.toFixed(4)} ms`);
  console.log(`🚀 Search Query Throughput: ${searchOpsPerSec.toFixed(0)} queries/sec`);

  console.log('\n=======================================================');
  console.log(' ALL 5 SUBSYSTEM BENCHMARKS COMPLETED SUCCESSFULLY!    ');
  console.log('=======================================================');
}

benchmarkSubsystems().catch((err) => {
  console.error('Subsystem Benchmark Error:', err);
});
