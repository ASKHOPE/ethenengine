import app from '../../src/index.js';

const TOTAL_REQUESTS = 5000;
const CONCURRENCY = 100;

interface BenchmarkResults {
  totalRequests: number;
  successfulRequests: number;
  totalTimeMs: number;
  requestsPerSecond: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  memoryUsageMB: number;
}

async function makeRequest(): Promise<number> {
  const start = performance.now();
  const req = new Request('http://localhost:3000/api/openapi.json');
  const res = await app.fetch(req);
  await res.text();
  return performance.now() - start;
}

async function runBenchmark(): Promise<BenchmarkResults> {
  console.log(`=======================================================`);
  console.log(` Starting Performance Benchmark against Native Bun + Hono App`);
  console.log(` Concurrency: ${CONCURRENCY} | Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`=======================================================`);

  const latencies: number[] = [];
  let completed = 0;
  let successful = 0;
  const startTime = performance.now();

  async function worker() {
    while (completed < TOTAL_REQUESTS) {
      completed++;
      try {
        const latency = await makeRequest();
        latencies.push(latency);
        successful++;
      } catch (err) {
        // Failed request
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  const avgLatencyMs = latencies.reduce((acc, curr) => acc + curr, 0) / latencies.length;
  const p50Ms = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95Ms = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99Ms = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const requestsPerSecond = (successful / totalTimeMs) * 1000;
  const memoryUsageMB = process.memoryUsage().rss / 1024 / 1024;

  return {
    totalRequests: TOTAL_REQUESTS,
    successfulRequests: successful,
    totalTimeMs,
    requestsPerSecond,
    avgLatencyMs,
    p50Ms,
    p95Ms,
    p99Ms,
    memoryUsageMB,
  };
}

runBenchmark().then((res) => {
  console.log(`✓ Total Time: ${res.totalTimeMs.toFixed(2)} ms`);
  console.log(`✓ Successful Requests: ${res.successfulRequests}/${res.totalRequests}`);
  console.log(`🚀 Requests Per Second (RPS): ${res.requestsPerSecond.toFixed(2)} req/sec`);
  console.log(`⚡ Average Latency: ${res.avgLatencyMs.toFixed(2)} ms`);
  console.log(`📊 Latency P50: ${res.p50Ms.toFixed(2)} ms`);
  console.log(`📊 Latency P95: ${res.p95Ms.toFixed(2)} ms`);
  console.log(`📊 Latency P99: ${res.p99Ms.toFixed(2)} ms`);
  console.log(`💾 Memory Footprint (RSS): ${res.memoryUsageMB.toFixed(2)} MB`);
  console.log(`=======================================================`);
  process.exit(0);
}).catch((err) => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
