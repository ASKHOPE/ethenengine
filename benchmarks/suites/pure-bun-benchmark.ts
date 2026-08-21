// Comprehensive Benchmark: Pure Native Bun 1.4 vs Bun + Hono Across Workloads & Full Feature-Set

import app from '../../src/index.js';

interface BenchmarkResult {
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
}

// 1. Raw Bun.serve HTTP Handler (Pure C++ / Zero overhead)
const rawBunFetch = (req: Request): Response => {
  const url = new URL(req.url);
  if (url.pathname === '/api/openapi.json') {
    return Response.json({ openapi: '3.0.0', info: { title: 'Pure Bun Engine', version: '1.4.0' } });
  }
  if (url.pathname === '/health') {
    return new Response('OK', { status: 200 });
  }
  return new Response('Not Found', { status: 404 });
};

async function benchmarkTarget(
  engineName: string,
  fetchFn: (req: Request) => Promise<Response> | Response,
  scenarioName: string,
  totalRequests: number,
  concurrency: number
): Promise<BenchmarkResult> {
  const latencies: number[] = [];
  let completed = 0;
  const startTime = performance.now();

  async function worker() {
    while (completed < totalRequests) {
      completed++;
      const reqStart = performance.now();
      const req = new Request('http://localhost:3000/api/openapi.json');
      const res = await fetchFn(req);
      await res.text();
      latencies.push(performance.now() - reqStart);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const totalTimeMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  return {
    engine: engineName,
    scenario: scenarioName,
    concurrency,
    totalRequests,
    totalTimeMs,
    rps: (latencies.length / totalTimeMs) * 1000,
    avgLatencyMs: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    p50Ms: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95Ms: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99Ms: latencies[Math.floor(latencies.length * 0.99)] || 0,
  };
}

async function benchmarkNativeBunSubsystems() {
  console.log(`\n========================================================================================`);
  console.log(` ⚡ PURE NATIVE BUN 1.4 BUILT-IN PRIMITIVES & SUBSYSTEM BENCHMARK`);
  console.log(`========================================================================================\n`);

  // 1. Bun.password (Native C++ bcrypt)
  const pwdStart = performance.now();
  const pwdIterations = 100;
  for (let i = 0; i < pwdIterations; i++) {
    const hash = Bun.password.hashSync('superSecretEnterprisePassword123!', { algorithm: 'bcrypt', cost: 10 });
    Bun.password.verifySync('superSecretEnterprisePassword123!', hash);
  }
  const pwdTime = performance.now() - pwdStart;
  console.log(`1. Native Bun.password (bcrypt hash + verify):`);
  console.log(`   ✓ ${pwdIterations} ops in ${pwdTime.toFixed(2)}ms -> ${(pwdIterations / pwdTime * 1000).toFixed(0)} ops/sec`);

  // 2. Bun.hash / Murmur3 / CityHash / SHA256 native hashing
  const hashStart = performance.now();
  const hashIterations = 100000;
  const payload = 'tenant_enterprise_cluster_partition_token_1234567890';
  for (let i = 0; i < hashIterations; i++) {
    Bun.hash(payload);
  }
  const hashTime = performance.now() - hashStart;
  console.log(`\n2. Native Bun.hash (CityHash64 / Fast In-Memory Token Keying):`);
  console.log(`   ✓ ${hashIterations} ops in ${hashTime.toFixed(2)}ms -> ${(hashIterations / hashTime * 1000).toFixed(0)} ops/sec`);

  // 3. Bun.file & Bun.write (Native Zero-Copy I/O)
  const ioStart = performance.now();
  const ioIterations = 2000;
  const testFilePath = './data/bun_bench_test.tmp';
  const testData = JSON.stringify({ tenant: 'tenant_lioramedia', status: 'ACTIVE', timestamp: Date.now() });
  for (let i = 0; i < ioIterations; i++) {
    await Bun.write(testFilePath, testData);
    const file = Bun.file(testFilePath);
    await file.text();
  }
  const ioTime = performance.now() - ioStart;
  console.log(`\n3. Native Bun.write + Bun.file (Zero-Copy Disk I/O Read/Write):`);
  console.log(`   ✓ ${ioIterations} disk roundtrips in ${ioTime.toFixed(2)}ms -> ${(ioIterations / ioTime * 1000).toFixed(0)} roundtrips/sec`);

  // 4. Native Bun JSON Serialization vs stringify
  const jsonStart = performance.now();
  const jsonIterations = 50000;
  const obj = { id: 'ord_12345', amount: 99.99, items: [{ sku: 'SKU_1', qty: 2 }, { sku: 'SKU_2', qty: 5 }] };
  for (let i = 0; i < jsonIterations; i++) {
    const serialized = JSON.stringify(obj);
    JSON.parse(serialized);
  }
  const jsonTime = performance.now() - jsonStart;
  console.log(`\n4. Native Bun SIMD JSON Encode/Decode:`);
  console.log(`   ✓ ${jsonIterations} ops in ${jsonTime.toFixed(2)}ms -> ${(jsonIterations / jsonTime * 1000).toFixed(0)} ops/sec\n`);
}

async function runComparison() {
  console.log(`========================================================================================`);
  console.log(` 🥊 DIRECT HEAD-TO-HEAD: Pure Bun vs Bun + Hono Router & Middleware`);
  console.log(`========================================================================================\n`);

  const tests = [
    { name: 'Sequential (c=1)', count: 3000, conc: 1 },
    { name: 'Parallel (c=25)', count: 8000, conc: 25 },
    { name: 'Parallel (c=100)', count: 12000, conc: 100 },
    { name: 'Burst (c=250)', count: 15000, conc: 250 },
  ];

  const results: BenchmarkResult[] = [];

  for (const t of tests) {
    // Pure Bun
    const pureBun = await benchmarkTarget('Pure Native Bun', rawBunFetch, t.name, t.count, t.conc);
    results.push(pureBun);

    // Bun + Hono
    const bunHono = await benchmarkTarget('Bun + Hono', app.fetch, t.name, t.count, t.conc);
    results.push(bunHono);
  }

  console.log(`============================================================================================================================`);
  console.log(`| Engine         | Scenario        | Conc | Total Req | Total Time | Throughput (RPS) | Avg Latency | P50   | P95   | P99   |`);
  console.log(`|----------------|-----------------|------|-----------|------------|------------------|-------------|-------|-------|-------|`);
  for (const r of results) {
    const eng = r.engine.padEnd(14, ' ');
    const sc = r.scenario.padEnd(15, ' ');
    const c = r.concurrency.toString().padStart(4, ' ');
    const reqs = r.totalRequests.toString().padStart(9, ' ');
    const time = `${r.totalTimeMs.toFixed(1)}ms`.padStart(10, ' ');
    const rps = `${r.rps.toFixed(0)} req/s`.padStart(16, ' ');
    const avg = `${r.avgLatencyMs.toFixed(3)}ms`.padStart(11, ' ');
    const p50 = `${r.p50Ms.toFixed(2)}ms`.padStart(5, ' ');
    const p95 = `${r.p95Ms.toFixed(2)}ms`.padStart(5, ' ');
    const p99 = `${r.p99Ms.toFixed(2)}ms`.padStart(5, ' ');
    console.log(`| ${eng} | ${sc} | ${c} | ${reqs} | ${time} | ${rps} | ${avg} | ${p50} | ${p95} | ${p99} |`);
  }
  console.log(`============================================================================================================================\n`);

  await benchmarkNativeBunSubsystems();

  process.exit(0);
}

runComparison().catch((err) => {
  console.error(err);
  process.exit(1);
});
