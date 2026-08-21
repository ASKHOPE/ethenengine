// EXTREME APPLES-TO-APPLES BENCHMARK:
// Pure Native Bun Hand-Crafted Multi-Tenant Router & Middleware Pipeline
// VS
// Bun + Hono Production Framework Router & Middleware Pipeline
//
// Both execute:
// 1. Prototype pollution & security input sanitation middleware
// 2. Telemetry request counter middleware
// 3. Multi-tenant host header parsing & tenant lookup/context injection
// 4. Parameterized route matching (/api/v1/:tenant/:subsystem/:action)
// 5. Dynamic JSON serialization / HTML SSR output with headers

import app from '../../src/index.js';
import { OpenAPIGenerator } from '../../src/foundation/OpenAPIGenerator.js';
import { TelemetryEngine } from '../../src/foundation/TelemetryEngine.js';

interface Result {
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
}

// -------------------------------------------------------------
// 🛠️ 1. PURE RAW BUN MULTI-TENANT ROUTER + MIDDLEWARE PIPELINE
// -------------------------------------------------------------
const rawTelemetry = { count: 0 };
const rawTenantCache = new Map<string, { id: string; name: string; themeColor: string }>([
  ['tenant-beta.ethenengine.internal', { id: 'tenant_beta', name: 'Beta Tenant', themeColor: '#6366f1' }],
  ['tenant-alpha.ethenengine.internal', { id: 'tenant_alpha', name: 'Alpha Tenant', themeColor: '#10b981' }],
  ['localhost', { id: 'tenant_default', name: 'Default Tenant', themeColor: '#3b82f6' }],
]);

// Raw fast path matching for /api/v1/:tenant/:subsystem/:action
function matchTenantApiRoute(path: string): { tenant: string; subsystem: string; action: string } | null {
  if (!path.startsWith('/api/v1/')) return null;
  const parts = path.slice(8).split('/');
  if (parts.length < 3) return null;
  return { tenant: parts[0], subsystem: parts[1], action: parts[2] };
}

// Pure Bun fetch handler with full middleware sequence
const rawBunMultiTenantEngine = (req: Request): Response => {
  const url = new URL(req.url);

  // [Middleware 1: Security & Prototype Pollution / Script injection check]
  const search = url.search;
  if (search.includes('__proto__') || search.includes('constructor') || search.includes('<script>')) {
    return new Response(JSON.stringify({ error: 'Security Exception: Injection Attempt Blocked' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // [Middleware 2: Telemetry Metrics increment]
  rawTelemetry.count++;

  // [Middleware 3: Host Header Multi-Tenant Context Resolution]
  const host = req.headers.get('Host') || 'localhost';
  const tenantContext = rawTenantCache.get(host) || { id: 'tenant_default', name: 'Default Tenant', themeColor: '#3b82f6' };

  // [Route 1: Dynamic Parameterized API Route: /api/v1/:tenant/:subsystem/:action]
  const apiMatch = matchTenantApiRoute(url.pathname);
  if (apiMatch) {
    return new Response(
      JSON.stringify({
        success: true,
        tenant: apiMatch.tenant,
        subsystem: apiMatch.subsystem,
        action: apiMatch.action,
        hostTenant: tenantContext.id,
        timestamp: Date.now(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantContext.id } }
    );
  }

  // [Route 2: OpenAPI Spec Endpoint]
  if (url.pathname === '/api/openapi.json') {
    return Response.json(OpenAPIGenerator.generateSpec());
  }

  // [Route 3: Swagger UI Docs]
  if (url.pathname === '/docs') {
    return new Response(`<!DOCTYPE html><html><body><h1>API Explorer</h1></body></html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // [Route 4: Root Landing Page with Tenant Theme Engine Dynamic SSR]
  if (url.pathname === '/') {
    const html = `<!DOCTYPE html><html><body style="background:${tenantContext.themeColor}"><h1>${tenantContext.name}</h1></body></html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // [Route 5: 404 Fallback]
  return new Response(JSON.stringify({ error: 'Route Not Found', path: url.pathname }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};

// -------------------------------------------------------------
// 🧪 2. TRAFFIC MATRIX (Heavy, Realistic Multi-Tenant Interleaved Traffic)
// -------------------------------------------------------------
const TRAFFIC_POOL = [
  { url: 'http://localhost:3000/api/v1/tenant_beta/commerce/checkout', headers: { Host: 'tenant-beta.ethenengine.internal' } },
  { url: 'http://localhost:3000/api/v1/tenant_alpha/erp/procurement', headers: { Host: 'tenant-alpha.ethenengine.internal' } },
  { url: 'http://localhost:3000/', headers: { Host: 'tenant-beta.ethenengine.internal' } },
  { url: 'http://localhost:3000/api/openapi.json', headers: { Host: 'localhost' } },
  { url: 'http://localhost:3000/docs', headers: { Host: 'localhost' } },
  { url: 'http://localhost:3000/api/v1/attack?filter=__proto__', headers: { Host: 'localhost' } },
  { url: 'http://localhost:3000/api/v1/unknown/route/action', headers: { Host: 'localhost' } },
];

async function runScenarioBenchmark(
  engineName: string,
  fetchFn: (req: Request) => Promise<Response> | Response,
  scenarioName: string,
  totalRequests: number,
  concurrency: number
): Promise<Result> {
  const latencies: number[] = [];
  let completed = 0;
  let errors = 0;
  const startTime = performance.now();

  async function worker() {
    while (completed < totalRequests) {
      const idx = completed++;
      const item = TRAFFIC_POOL[idx % TRAFFIC_POOL.length];
      const start = performance.now();

      try {
        const req = new Request(item.url, { headers: item.headers });
        const res = await fetchFn(req);
        await res.text();
        latencies.push(performance.now() - start);
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
  };
}

async function main() {
  console.log(`\n========================================================================================================================`);
  console.log(` 🏢 FULL MULTI-TENANCY & MIDDLEWARE SIMULATION: PURE RAW BUN 1.4 VS BUN + HONO`);
  console.log(` Both running full Security Sanitization, Telemetry, Multi-Tenant Domain Lookup, and Parametric API Routing`);
  console.log(`========================================================================================================================\n`);

  // Warmup
  await runScenarioBenchmark('Warmup', rawBunMultiTenantEngine, 'Warmup', 2000, 50);

  const scenarios = [
    { name: '1. Standard Multi-Tenant Load', reqs: 20000, conc: 100 },
    { name: '2. High-Concurrency Spike', reqs: 50000, conc: 300 },
    { name: '3. DDoS Attack Saturation', reqs: 100000, conc: 1000 },
  ];

  const results: Result[] = [];

  for (const s of scenarios) {
    console.log(`▶️ Running Scenario: ${s.name} (${s.reqs.toLocaleString()} reqs @ c=${s.conc})...`);

    // 1. Raw Bun with full middleware
    process.stdout.write(`   ⚡ Testing Hand-Crafted Raw Bun Multi-Tenant Engine... `);
    const rawRes = await runScenarioBenchmark('Pure Raw Bun (Custom Pipeline)', rawBunMultiTenantEngine, s.name, s.reqs, s.conc);
    results.push(rawRes);
    console.log(`DONE in ${rawRes.totalTimeMs.toFixed(1)}ms | RPS: ${rawRes.rps.toFixed(0)} | P99: ${rawRes.p99Ms.toFixed(2)}ms`);

    // 2. Bun + Hono
    process.stdout.write(`   🛡️ Testing Bun + Hono Multi-Tenant App Engine... `);
    const honoRes = await runScenarioBenchmark('Bun + Hono Framework', app.fetch, s.name, s.reqs, s.conc);
    results.push(honoRes);
    console.log(`DONE in ${honoRes.totalTimeMs.toFixed(1)}ms | RPS: ${honoRes.rps.toFixed(0)} | P99: ${honoRes.p99Ms.toFixed(2)}ms`);
  }

  console.log(`\n================================================================================================================================================`);
  console.log(`| Engine Architecture              | Scenario                    | Conc  | Total Req | Total Time | RPS (Throughput) | Avg Lat  | P50     | P95     | P99     | Errors |`);
  console.log(`|----------------------------------|-----------------------------|-------|-----------|------------|------------------|----------|---------|---------|---------|--------|`);
  for (const r of results) {
    const eng = r.engine.padEnd(32, ' ');
    const sc = r.scenario.padEnd(27, ' ');
    const c = r.concurrency.toString().padStart(5, ' ');
    const reqs = r.totalRequests.toString().padStart(9, ' ');
    const time = `${r.totalTimeMs.toFixed(0)}ms`.padStart(10, ' ');
    const rps = `${r.rps.toFixed(0)} req/s`.padStart(16, ' ');
    const avg = `${r.avgLatencyMs.toFixed(2)}ms`.padStart(8, ' ');
    const p50 = `${r.p50Ms.toFixed(2)}ms`.padStart(7, ' ');
    const p95 = `${r.p95Ms.toFixed(2)}ms`.padStart(7, ' ');
    const p99 = `${r.p99Ms.toFixed(2)}ms`.padStart(7, ' ');
    const err = r.errors.toString().padStart(6, ' ');

    console.log(`| ${eng} | ${sc} | ${c} | ${reqs} | ${time} | ${rps} | ${avg} | ${p50} | ${p95} | ${p99} | ${err} |`);
  }
  console.log(`================================================================================================================================================\n`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
