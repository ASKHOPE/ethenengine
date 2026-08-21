// Production Real-World Multi-Route Benchmark for ETHENENGINE (Hono on Bun 1.4)
// Tests multiple real API endpoints with realistic traffic mix, query strings, headers, and security middleware

import app from '../../src/index.js';

interface RouteBenchmarkConfig {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  headers?: Record<string, string>;
  body?: any;
  weight: number; // Percentage of total traffic mix
}

interface EndpointMetric {
  route: string;
  totalCalls: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  statusSuccess: number;
}

const REAL_WORLD_ROUTES: RouteBenchmarkConfig[] = [
  {
    name: '1. Root / Landing Page (HTML SSR & Theme Engine)',
    method: 'GET',
    path: 'http://localhost:3000/',
    headers: { 'Host': 'localhost' },
    weight: 20,
  },
  {
    name: '2. OpenAPI 3.0 Live Schema Endpoint',
    method: 'GET',
    path: 'http://localhost:3000/api/openapi.json',
    weight: 25,
  },
  {
    name: '3. Multi-Tenant Custom Domain Resolution',
    method: 'GET',
    path: 'http://localhost:3000/',
    headers: { 'Host': 'tenant-beta.ethenengine.internal' },
    weight: 25,
  },
  {
    name: '4. Swagger API Explorer Docs Page',
    method: 'GET',
    path: 'http://localhost:3000/docs',
    weight: 15,
  },
  {
    name: '5. Non-existent Route (404 Fallback & Middleware Defense)',
    method: 'GET',
    path: 'http://localhost:3000/api/v1/unknown/resource?query=malicious__proto__filter',
    weight: 15,
  },
];

async function executeRoute(route: RouteBenchmarkConfig): Promise<{ latency: number; ok: boolean }> {
  const start = performance.now();
  const init: RequestInit = {
    method: route.method,
    headers: route.headers || {},
  };
  if (route.body) {
    init.body = JSON.stringify(route.body);
    init.headers = { ...init.headers, 'Content-Type': 'application/json' };
  }

  const req = new Request(route.path, init);
  const res = await app.fetch(req);
  await res.text();
  const latency = performance.now() - start;
  return { latency, ok: res.status < 500 };
}

async function runProductionTrafficBenchmark(totalRequests = 20000, concurrency = 100) {
  console.log(`\n================================================================================================`);
  console.log(` 🏢 ETHENENGINE: Real-World Production Multi-Route Mixed Traffic Benchmark (Bun 1.4 + Hono)`);
  console.log(` Total Requests: ${totalRequests.toLocaleString()} | Concurrency: ${concurrency} parallel workers`);
  console.log(`================================================================================================\n`);

  // Build weighted request distribution pool
  const routePool: RouteBenchmarkConfig[] = [];
  for (const r of REAL_WORLD_ROUTES) {
    const count = Math.round((r.weight / 100) * totalRequests);
    for (let i = 0; i < count; i++) {
      routePool.push(r);
    }
  }

  // Shuffle pool for realistic interleaved traffic
  for (let i = routePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [routePool[i], routePool[j]] = [routePool[j], routePool[i]];
  }

  const routeLatencies: Map<string, number[]> = new Map();
  const routeSuccess: Map<string, number> = new Map();
  REAL_WORLD_ROUTES.forEach((r) => {
    routeLatencies.set(r.name, []);
    routeSuccess.set(r.name, 0);
  });

  const allLatencies: number[] = [];
  let index = 0;
  const startTime = performance.now();

  async function worker() {
    while (index < routePool.length) {
      const currentIndex = index++;
      const route = routePool[currentIndex];
      if (!route) break;

      try {
        const { latency, ok } = await executeRoute(route);
        allLatencies.push(latency);
        routeLatencies.get(route.name)?.push(latency);
        if (ok) {
          routeSuccess.set(route.name, (routeSuccess.get(route.name) || 0) + 1);
        }
      } catch (err) {
        // failed
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  allLatencies.sort((a, b) => a - b);

  const rps = (allLatencies.length / totalTimeMs) * 1000;
  const overallAvg = allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length;
  const overallP50 = allLatencies[Math.floor(allLatencies.length * 0.5)] || 0;
  const overallP95 = allLatencies[Math.floor(allLatencies.length * 0.95)] || 0;
  const overallP99 = allLatencies[Math.floor(allLatencies.length * 0.99)] || 0;

  console.log(`\n--- 📊 Endpoint-by-Endpoint Performance Breakdown ---`);
  console.log(`========================================================================================================================`);
  console.log(`| Endpoint Route / Workload                       | Traffic % | Calls | Success | Avg Latency | P50   | P95   | P99   |`);
  console.log(`|-------------------------------------------------|-----------|-------|---------|-------------|-------|-------|-------|`);

  for (const r of REAL_WORLD_ROUTES) {
    const lats = routeLatencies.get(r.name) || [];
    lats.sort((a, b) => a - b);
    const succ = routeSuccess.get(r.name) || 0;
    const name = r.name.padEnd(47, ' ');
    const weight = `${r.weight}%`.padStart(9, ' ');
    const calls = lats.length.toString().padStart(5, ' ');
    const successStr = `${succ}/${lats.length}`.padStart(7, ' ');
    const avg = `${(lats.reduce((a, b) => a + b, 0) / (lats.length || 1)).toFixed(2)}ms`.padStart(11, ' ');
    const p50 = `${(lats[Math.floor(lats.length * 0.5)] || 0).toFixed(2)}ms`.padStart(5, ' ');
    const p95 = `${(lats[Math.floor(lats.length * 0.95)] || 0).toFixed(2)}ms`.padStart(5, ' ');
    const p99 = `${(lats[Math.floor(lats.length * 0.99)] || 0).toFixed(2)}ms`.padStart(5, ' ');

    console.log(`| ${name} | ${weight} | ${calls} | ${successStr} | ${avg} | ${p50} | ${p95} | ${p99} |`);
  }
  console.log(`========================================================================================================================\n`);

  console.log(`--- 🚀 Overall System Aggregate Metrics ---`);
  console.log(`✓ Total Requests Executed: ${allLatencies.length.toLocaleString()}`);
  console.log(`✓ Total Elapsed Time:      ${totalTimeMs.toFixed(2)} ms (${(totalTimeMs / 1000).toFixed(2)} seconds)`);
  console.log(`🚀 System Throughput (RPS):  ${rps.toFixed(2)} requests/sec`);
  console.log(`⚡ Average Latency:         ${overallAvg.toFixed(2)} ms`);
  console.log(`📊 Latency P50 (Median):    ${overallP50.toFixed(2)} ms`);
  console.log(`📊 Latency P95:             ${overallP95.toFixed(2)} ms`);
  console.log(`📊 Latency P99:             ${overallP99.toFixed(2)} ms`);
  console.log(`💾 Memory Footprint (RSS):  ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`================================================================================================\n`);

  process.exit(0);
}

runProductionTrafficBenchmark(20000, 100).catch((e) => {
  console.error(e);
  process.exit(1);
});
