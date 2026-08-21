// Comprehensive Benchmark: Single-thread (Sequential) vs Parallel (High Concurrency) Multi-request Performance

import app from '../../src/index.js';

interface BenchmarkScenarioResult {
  scenarioName: string;
  concurrency: number;
  totalRequests: number;
  totalTimeMs: number;
  requestsPerSecond: number;
  avgLatencyMs: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  minLatencyMs: number;
  maxLatencyMs: number;
}

async function executeRequest(): Promise<number> {
  const start = performance.now();
  const req = new Request('http://localhost:3000/api/openapi.json');
  const res = await app.fetch(req);
  await res.text();
  return performance.now() - start;
}

async function runScenario(scenarioName: string, totalRequests: number, concurrency: number): Promise<BenchmarkScenarioResult> {
  const latencies: number[] = [];
  let completed = 0;
  const startTime = performance.now();

  async function worker() {
    while (completed < totalRequests) {
      completed++;
      try {
        const latency = await executeRequest();
        latencies.push(latency);
      } catch (err) {
        // failed
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  const avgLatencyMs = latencies.reduce((acc, curr) => acc + curr, 0) / latencies.length;
  const p50Ms = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90Ms = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95Ms = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99Ms = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const minLatencyMs = latencies[0] || 0;
  const maxLatencyMs = latencies[latencies.length - 1] || 0;
  const requestsPerSecond = (latencies.length / totalTimeMs) * 1000;

  return {
    scenarioName,
    concurrency,
    totalRequests,
    totalTimeMs,
    requestsPerSecond,
    avgLatencyMs,
    p50Ms,
    p90Ms,
    p95Ms,
    p99Ms,
    minLatencyMs,
    maxLatencyMs,
  };
}

async function main() {
  console.log(`\n========================================================================================`);
  console.log(` 🚀 ETHENENGINE: Single-Thread vs Parallel High-Concurrency Benchmark (Bun 1.4 + Hono)`);
  console.log(`========================================================================================\n`);

  // Warmup run
  await runScenario('Warmup', 500, 10);

  const scenarios = [
    { name: '1. Single-Thread (Sequential)', requests: 2000, concurrency: 1 },
    { name: '2. Low Concurrency Parallel', requests: 5000, concurrency: 10 },
    { name: '3. Medium Concurrency Parallel', requests: 10000, concurrency: 50 },
    { name: '4. High Concurrency Parallel', requests: 10000, concurrency: 100 },
    { name: '5. Extreme Burst Concurrency', requests: 15000, concurrency: 250 },
  ];

  const results: BenchmarkScenarioResult[] = [];

  for (const sc of scenarios) {
    process.stdout.write(`Benchmarking ${sc.name} (${sc.requests} reqs @ c=${sc.concurrency})... `);
    const res = await runScenario(sc.name, sc.requests, sc.concurrency);
    results.push(res);
    console.log(`DONE in ${res.totalTimeMs.toFixed(2)}ms -> ${res.requestsPerSecond.toFixed(0)} req/s`);
  }

  console.log(`\n========================================================================================================================`);
  console.log(`| Scenario                      | Concurrency | Total Req | Total Time | Throughput (RPS) | Avg Latency | P50   | P95   | P99   |`);
  console.log(`|-------------------------------|-------------|-----------|------------|------------------|-------------|-------|-------|-------|`);
  for (const r of results) {
    const name = r.scenarioName.padEnd(29, ' ');
    const conc = r.concurrency.toString().padStart(11, ' ');
    const total = r.totalRequests.toString().padStart(9, ' ');
    const time = `${r.totalTimeMs.toFixed(1)}ms`.padStart(10, ' ');
    const rps = `${r.requestsPerSecond.toFixed(0)} req/s`.padStart(16, ' ');
    const avg = `${r.avgLatencyMs.toFixed(2)}ms`.padStart(11, ' ');
    const p50 = `${r.p50Ms.toFixed(2)}ms`.padStart(5, ' ');
    const p95 = `${r.p95Ms.toFixed(2)}ms`.padStart(5, ' ');
    const p99 = `${r.p99Ms.toFixed(2)}ms`.padStart(5, ' ');
    console.log(`| ${name} | ${conc} | ${total} | ${time} | ${rps} | ${avg} | ${p50} | ${p95} | ${p99} |`);
  }
  console.log(`========================================================================================================================\n`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
