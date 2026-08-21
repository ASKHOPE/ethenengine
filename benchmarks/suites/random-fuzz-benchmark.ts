// HIGH-ENTROPY FUZZING & RANDOMIZED MULTI-TENANCY BENCHMARK
// Pure Raw Bun vs Bun + Hono with extreme dataset randomness:
// - Dynamic random tenant IDs (10,000+ distinct tenants)
// - Dynamic random UUID paths & query parameters
// - Randomized body payloads (JSON with random nested objects & arrays)
// - Randomized headers (Auth tokens, custom user-agents, IP addresses, correlation IDs)
// - Mixed randomized attack vectors (SQLi patterns, XSS snippets, prototype pollution)

import app from '../../src/index.js';
import crypto from 'crypto';

interface RandomBenchmarkResult {
  engine: string;
  scenario: string;
  concurrency: number;
  totalRequests: number;
  totalTimeMs: number;
  rps: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errors: number;
  blockedAttacks: number;
}

// 1. High-Entropy Random Request Generator
const SUBSYSTEMS = ['commerce', 'erp', 'accounting', 'hr', 'crm', 'cms', 'theme', 'builder', 'analytics', 'audit'];
const ACTIONS = ['create', 'update', 'delete', 'query', 'sync', 'export', 'checkout', 'post', 'reconcile'];
const ATTACK_VECTORS = ['__proto__', 'constructor', '<script>alert(1)</script>', "' OR 1=1 --", '${jndi:ldap}', '%00'];

function generateRandomRequest(): { url: string; method: string; headers: Record<string, string>; body?: any; isAttack: boolean } {
  const rand = Math.random();
  const tenantId = `tenant_${Math.floor(Math.random() * 10000)}`;
  const subsystem = SUBSYSTEMS[Math.floor(Math.random() * SUBSYSTEMS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const randomUUID = crypto.randomUUID();
  const isAttack = rand < 0.15; // 15% random malicious fuzzing attacks

  const headers: Record<string, string> = {
    'Host': `${tenantId}.ethenengine.internal`,
    'X-Request-ID': randomUUID,
    'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    'User-Agent': `CustomClient-${Math.random().toString(36).substring(7)}`,
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${randomUUID}`,
  };

  if (isAttack) {
    const vector = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)];
    return {
      url: `http://localhost:3000/api/v1/${tenantId}/${subsystem}/${action}?filter=${encodeURIComponent(vector)}&fuzz=${Math.random()}`,
      method: 'GET',
      headers,
      isAttack: true,
    };
  }

  // 40% POST requests with randomized JSON payload, 60% GET requests
  if (rand > 0.6) {
    return {
      url: `http://localhost:3000/api/v1/${tenantId}/${subsystem}/${action}?cursor=${randomUUID}&limit=${Math.floor(Math.random() * 100)}`,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: {
        id: randomUUID,
        tenantId,
        metadata: {
          timestamp: Date.now(),
          entropy: Math.random(),
          tags: [Math.random().toString(36).substring(5), Math.random().toString(36).substring(5)],
        },
        payload: {
          value: Math.random() * 10000,
          currency: 'USD',
          active: Math.random() > 0.5,
        },
      },
      isAttack: false,
    };
  }

  return {
    url: `http://localhost:3000/api/v1/${tenantId}/${subsystem}/${action}?page=${Math.floor(Math.random() * 50)}&nonce=${randomUUID}`,
    method: 'GET',
    headers,
    isAttack: false,
  };
}

// 2. Pure Raw Bun Dynamic Multi-Tenant Handler (Handles Dynamic Random Inputs)
const dynamicTenantCache = new Map<string, { id: string; color: string }>();

const rawBunFuzzEngine = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  // Security Attack Defense Middleware
  const rawSearch = decodeURIComponent(url.search);
  if (
    rawSearch.includes('__proto__') ||
    rawSearch.includes('constructor') ||
    rawSearch.includes('<script>') ||
    rawSearch.includes("' OR 1=1")
  ) {
    return new Response(JSON.stringify({ error: 'Security Exception: Injection Attempt Blocked' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Dynamic Multi-Tenant Context Resolution
  const host = req.headers.get('Host') || 'localhost';
  let tenant = dynamicTenantCache.get(host);
  if (!tenant) {
    tenant = { id: host.split('.')[0] || 'default', color: `#${Math.floor(Math.random() * 16777215).toString(16)}` };
    if (dynamicTenantCache.size < 20000) {
      dynamicTenantCache.set(host, tenant);
    }
  }

  // Body Parsing if POST
  let bodyData: any = null;
  if (req.method === 'POST') {
    try {
      bodyData = await req.json();
    } catch {
      bodyData = null;
    }
  }

  // Dynamic Route Matching
  if (url.pathname.startsWith('/api/v1/')) {
    const parts = url.pathname.slice(8).split('/');
    return new Response(
      JSON.stringify({
        success: true,
        tenant: parts[0],
        subsystem: parts[1],
        action: parts[2],
        tenantContext: tenant.id,
        receivedBody: bodyData ? true : false,
        requestId: req.headers.get('X-Request-ID') || 'none',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'X-Tenant-Resolved': tenant.id } }
    );
  }

  return new Response('Not Found', { status: 404 });
};

async function executeRandomizedScenario(
  engineName: string,
  fetchFn: (req: Request) => Promise<Response> | Response,
  scenarioName: string,
  totalRequests: number,
  concurrency: number
): Promise<RandomBenchmarkResult> {
  const latencies: number[] = [];
  let completed = 0;
  let errors = 0;
  let blocked = 0;

  // Pre-generate high-entropy request pool
  const requests = Array.from({ length: totalRequests }, () => generateRandomRequest());
  const startTime = performance.now();

  async function worker() {
    while (completed < totalRequests) {
      const idx = completed++;
      const item = requests[idx];
      if (!item) break;

      const init: RequestInit = {
        method: item.method,
        headers: item.headers,
      };
      if (item.body) {
        init.body = JSON.stringify(item.body);
      }

      const reqStart = performance.now();
      try {
        const req = new Request(item.url, init);
        const res = await fetchFn(req);
        await res.text();
        latencies.push(performance.now() - reqStart);
        if (res.status === 400) blocked++;
      } catch (err) {
        errors++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  return {
    engine: engineName,
    scenario: scenarioName,
    concurrency,
    totalRequests,
    totalTimeMs,
    rps: (latencies.length / totalTimeMs) * 1000,
    avgLatencyMs: latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1),
    p50Ms: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95Ms: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99Ms: latencies[Math.floor(latencies.length * 0.99)] || 0,
    errors,
    blockedAttacks: blocked,
  };
}

async function main() {
  console.log(`\n================================================================================================================================`);
  console.log(` 🎲 HIGH-ENTROPY RANDOMIZED & FUZZING BENCHMARK: PURE RAW BUN 1.4 VS BUN + HONO`);
  console.log(` Random Data: 10,000+ Unique Tenants, Random UUIDs, Dynamic JSON Payloads, Randomized Headers & Security Attack Injections`);
  console.log(`================================================================================================================================\n`);

  // Warmup
  await executeRandomizedScenario('Warmup', rawBunFuzzEngine, 'Warmup', 2000, 50);

  const scenarios = [
    { name: '1. Randomized Traffic (10k Tenants)', reqs: 20000, conc: 100 },
    { name: '2. High Entropy Fuzzing Flood', reqs: 50000, conc: 300 },
    { name: '3. Extreme 1,000 Socket Fuzz Storm', reqs: 100000, conc: 1000 },
  ];

  const results: RandomBenchmarkResult[] = [];

  for (const s of scenarios) {
    console.log(`▶️ Executing Random Scenario: ${s.name} (${s.reqs.toLocaleString()} high-entropy requests @ c=${s.conc})...`);

    // Pure Raw Bun
    process.stdout.write(`   ⚡ Testing Pure Raw Bun 1.4 Dynamic Engine... `);
    const pureRes = await executeRandomizedScenario('Pure Raw Bun Dynamic', rawBunFuzzEngine, s.name, s.reqs, s.conc);
    results.push(pureRes);
    console.log(`DONE in ${pureRes.totalTimeMs.toFixed(1)}ms | RPS: ${pureRes.rps.toFixed(0)} | P99: ${pureRes.p99Ms.toFixed(2)}ms | Blocked: ${pureRes.blockedAttacks}`);

    // Bun + Hono
    process.stdout.write(`   🛡️ Testing Bun + Hono App Engine... `);
    const honoRes = await executeRandomizedScenario('Bun + Hono App Engine', app.fetch, s.name, s.reqs, s.conc);
    results.push(honoRes);
    console.log(`DONE in ${honoRes.totalTimeMs.toFixed(1)}ms | RPS: ${honoRes.rps.toFixed(0)} | P99: ${honoRes.p99Ms.toFixed(2)}ms | Blocked: ${honoRes.blockedAttacks}`);
  }

  console.log(`\n========================================================================================================================================================`);
  console.log(`| Engine Architecture         | Scenario                       | Conc  | Total Req | Total Time | RPS (Throughput) | Avg Lat  | P50     | P95     | P99     | Blocked | Errors |`);
  console.log(`|-----------------------------|--------------------------------|-------|-----------|------------|------------------|----------|---------|---------|---------|---------|--------|`);
  for (const r of results) {
    const eng = r.engine.padEnd(27, ' ');
    const sc = r.scenario.padEnd(30, ' ');
    const c = r.concurrency.toString().padStart(5, ' ');
    const reqs = r.totalRequests.toString().padStart(9, ' ');
    const time = `${r.totalTimeMs.toFixed(0)}ms`.padStart(10, ' ');
    const rps = `${r.rps.toFixed(0)} req/s`.padStart(16, ' ');
    const avg = `${r.avgLatencyMs.toFixed(2)}ms`.padStart(8, ' ');
    const p50 = `${r.p50Ms.toFixed(2)}ms`.padStart(7, ' ');
    const p95 = `${r.p95Ms.toFixed(2)}ms`.padStart(7, ' ');
    const p99 = `${r.p99Ms.toFixed(2)}ms`.padStart(7, ' ');
    const blk = r.blockedAttacks.toString().padStart(7, ' ');
    const err = r.errors.toString().padStart(6, ' ');

    console.log(`| ${eng} | ${sc} | ${c} | ${reqs} | ${time} | ${rps} | ${avg} | ${p50} | ${p95} | ${p99} | ${blk} | ${err} |`);
  }
  console.log(`========================================================================================================================================================\n`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
