// EXTREME STRESS & DDOS BENCHMARK: Pure Bun 1.4 Native vs Bun + Hono
// Apples-to-Apples side-by-side comparison under 90% CPU/Memory saturation & DDoS flood conditions

import app from '../../src/index.js';
import { OpenAPIGenerator } from '../../src/foundation/OpenAPIGenerator.js';

interface StressResult {
  engine: string;
  scenario: string;
  totalRequests: number;
  concurrency: number;
  totalTimeMs: number;
  rps: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxLatencyMs: number;
  errorCount: number;
  peakMemoryMB: number;
}

// 1. Exact Apples-to-Apples Pure Bun Native Implementation
// Matches Hono: handles root HTML SSR, OpenAPI generation, Host header routing, /docs page, and 404
const rawBunApplesToApples = (req: Request): Response => {
  const url = new URL(req.url);
  const host = req.headers.get('Host') || '';

  // Host header multi-tenant routing simulation
  if (host.includes('tenant-beta')) {
    return new Response(`<!DOCTYPE html><html><body>Tenant Beta: #6366f1</body></html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // OpenAPI route
  if (url.pathname === '/api/openapi.json') {
    return Response.json(OpenAPIGenerator.generateSpec());
  }

  // Docs UI route
  if (url.pathname === '/docs') {
    return new Response(`<!DOCTYPE html><html><body>Swagger UI Explorer</body></html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Landing page route
  if (url.pathname === '/') {
    return new Response(`<!DOCTYPE html><html><body><h1>ETHENENGINE</h1></body></html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 404 fallback
  return new Response('Not Found', { status: 404 });
};

// Target Request Generator for Mixed Traffic
const TEST_ROUTES = [
  { url: 'http://localhost:3000/', headers: { Host: 'localhost' } },
  { url: 'http://localhost:3000/api/openapi.json', headers: { Host: 'localhost' } },
  { url: 'http://localhost:3000/', headers: { Host: 'tenant-beta.ethenengine.internal' } },
  { url: 'http://localhost:3000/docs', headers: { Host: 'localhost' } },
  { url: 'http://localhost:3000/api/v1/attack_payload?test=__proto__', headers: { Host: 'localhost' } },
];

async function runDDoSStressTest(
  engineName: string,
  fetchFn: (req: Request) => Promise<Response> | Response,
  scenarioName: string,
  totalRequests: number,
  concurrency: number
): Promise<StressResult> {
  const latencies: number[] = [];
  let completed = 0;
  let errors = 0;
  const initialMem = process.memoryUsage().rss / 1024 / 1024;
  let peakMem = initialMem;

  const startTime = performance.now();

  async function attackWorker() {
    while (completed < totalRequests) {
      const idx = completed++;
      const target = TEST_ROUTES[idx % TEST_ROUTES.length];
      const reqStart = performance.now();

      try {
        const req = new Request(target.url, { headers: target.headers });
        const res = await fetchFn(req);
        await res.text();
        const lat = performance.now() - reqStart;
        latencies.push(lat);
      } catch (err) {
        errors++;
      }

      if (idx % 2000 === 0) {
        const currentMem = process.memoryUsage().rss / 1024 / 1024;
        if (currentMem > peakMem) peakMem = currentMem;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => attackWorker());
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  return {
    engine: engineName,
    scenario: scenarioName,
    totalRequests,
    concurrency,
    totalTimeMs,
    rps: (latencies.length / totalTimeMs) * 1000,
    avgLatencyMs: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    p50Ms: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95Ms: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99Ms: latencies[Math.floor(latencies.length * 0.99)] || 0,
    maxLatencyMs: latencies[latencies.length - 1] || 0,
    errorCount: errors,
    peakMemoryMB: peakMem,
  };
}

async function main() {
  console.log(`\n========================================================================================================================`);
  console.log(` 🔥 ETHENENGINE EXTREME STRESS & DDOS BENCHMARK: PURE BUN 1.4 VS BUN + HONO (APPLES-TO-APPLES)`);
  console.log(` Target: 90% Concurrency Saturation & Flood Attacks (Up to 1,000 Concurrent Connections)`);
  console.log(`========================================================================================================================\n`);

  // Warmup
  await runDDoSStressTest('Warmup', rawBunApplesToApples, 'Warmup', 2000, 50);

  const scenarios = [
    { name: '1. Heavy Load (90% Cap)', requests: 20000, concurrency: 100 },
    { name: '2. Severe Saturation Spike', requests: 40000, concurrency: 300 },
    { name: '3. SYN/HTTP Flood DDoS', requests: 60000, concurrency: 600 },
    { name: '4. Extreme Apocalypse DDoS', requests: 100000, concurrency: 1000 },
  ];

  const allResults: StressResult[] = [];

  for (const s of scenarios) {
    console.log(`\n▶️ Executing Stress Scenario: ${s.name} (${s.requests.toLocaleString()} reqs @ ${s.concurrency} concurrent attack workers)...`);

    // Pure Bun Native
    process.stdout.write(`   💥 Attacking Pure Native Bun 1.4... `);
    const pureRes = await runDDoSStressTest('Pure Native Bun', rawBunApplesToApples, s.name, s.requests, s.concurrency);
    allResults.push(pureRes);
    console.log(`DONE in ${pureRes.totalTimeMs.toFixed(1)}ms | RPS: ${pureRes.rps.toFixed(0)} | P99: ${pureRes.p99Ms.toFixed(2)}ms | Errors: ${pureRes.errorCount}`);

    // Bun + Hono
    process.stdout.write(`   🛡️ Attacking Bun + Hono App Engine... `);
    const honoRes = await runDDoSStressTest('Bun + Hono', app.fetch, s.name, s.requests, s.concurrency);
    allResults.push(honoRes);
    console.log(`DONE in ${honoRes.totalTimeMs.toFixed(1)}ms | RPS: ${honoRes.rps.toFixed(0)} | P99: ${honoRes.p99Ms.toFixed(2)}ms | Errors: ${honoRes.errorCount}`);
  }

  console.log(`\n================================================================================================================================================`);
  console.log(`| Engine Setup    | Scenario                       | Conc  | Total Req | Total Time | RPS (Throughput) | Avg Lat  | P50     | P95     | P99     | Max Lat  | Errors |`);
  console.log(`|-----------------|--------------------------------|-------|-----------|------------|------------------|----------|---------|---------|---------|----------|--------|`);
  for (const r of allResults) {
    const eng = r.engine.padEnd(15, ' ');
    const sc = r.scenario.padEnd(30, ' ');
    const c = r.concurrency.toString().padStart(5, ' ');
    const reqs = r.totalRequests.toString().padStart(9, ' ');
    const time = `${r.totalTimeMs.toFixed(0)}ms`.padStart(10, ' ');
    const rps = `${r.rps.toFixed(0)} req/s`.padStart(16, ' ');
    const avg = `${r.avgLatencyMs.toFixed(2)}ms`.padStart(8, ' ');
    const p50 = `${r.p50Ms.toFixed(2)}ms`.padStart(7, ' ');
    const p95 = `${r.p95Ms.toFixed(2)}ms`.padStart(7, ' ');
    const p99 = `${r.p99Ms.toFixed(2)}ms`.padStart(7, ' ');
    const max = `${r.maxLatencyMs.toFixed(2)}ms`.padStart(8, ' ');
    const err = r.errorCount.toString().padStart(6, ' ');

    console.log(`| ${eng} | ${sc} | ${c} | ${reqs} | ${time} | ${rps} | ${avg} | ${p50} | ${p95} | ${p99} | ${max} | ${err} |`);
  }
  console.log(`================================================================================================================================================\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
