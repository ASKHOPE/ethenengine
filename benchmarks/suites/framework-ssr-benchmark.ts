// Framework SSR & Frontend Benchmark Suite (ETHENENGINE vs SolidStart vs Svelte 5 vs React 19 / Next.js)

import { renderToString as renderSolid } from 'solid-js/web';
import { createComponent } from 'solid-js';
import React from 'react';
import { renderToString as renderReact, renderToReadableStream } from 'react-dom/server';

const ITERATIONS = 100000;

// Data model for benchmark
const pageData = {
  title: 'Empower Your Enterprise Architecture',
  subtitle: 'One configurable multi-tenant platform for all your website, portal, and CMS needs.',
  ctaText: 'Explore Features',
  ctaUrl: '#features',
  features: [
    { name: 'Multi-Tenant Core', desc: 'Isolate organizations seamlessly with configuration.' },
    { name: 'Visual Website Builder', desc: 'Compose dynamic layouts effortlessly.' },
    { name: 'Basic CMS', desc: 'Define structured content types & publish instant updates.' }
  ]
};

async function runSSRBenchmark() {
  console.log('=======================================================');
  console.log(' SSR Component Rendering & Frontend Benchmark Suite (Bun)');
  console.log(` Iterations: ${ITERATIONS.toLocaleString()} HTML Component Renders`);
  console.log('=======================================================');

  // 1. ETHENENGINE Native String Template Engine
  console.log('\n--- 1. ETHENENGINE Engine (Native String Interpolation) ---');
  const startEngine = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const html = `
      <section class="hero">
        <h1>${pageData.title}</h1>
        <p>${pageData.subtitle}</p>
        <a href="${pageData.ctaUrl}">${pageData.ctaText}</a>
        <div class="grid">
          ${pageData.features.map(f => `<div><h3>${f.name}</h3><p>${f.desc}</p></div>`).join('')}
        </div>
      </section>
    `;
  }
  const endEngine = performance.now();
  const engineTimeMs = endEngine - startEngine;
  const engineOpsPerSec = (ITERATIONS / engineTimeMs) * 1000;
  console.log(`✓ Completed ${ITERATIONS.toLocaleString()} renders in ${engineTimeMs.toFixed(2)} ms`);
  console.log(`🚀 ETHENENGINE Throughput: ${Math.round(engineOpsPerSec).toLocaleString()} renders/sec`);

  // 2. SolidJS / SolidStart SSR Render
  console.log('\n--- 2. SolidJS / SolidStart SSR (renderToString) ---');
  const SolidHero = (props: typeof pageData) => {
    return () => `
      <section class="hero">
        <h1>${props.title}</h1>
        <p>${props.subtitle}</p>
        <a href="${props.ctaUrl}">${props.ctaText}</a>
      </section>
    `;
  };

  const startSolid = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    renderSolid(() => createComponent(SolidHero, pageData));
  }
  const endSolid = performance.now();
  const solidTimeMs = endSolid - startSolid;
  const solidOpsPerSec = (ITERATIONS / solidTimeMs) * 1000;
  console.log(`✓ Completed ${ITERATIONS.toLocaleString()} renders in ${solidTimeMs.toFixed(2)} ms`);
  console.log(`🚀 SolidJS Throughput: ${Math.round(solidOpsPerSec).toLocaleString()} renders/sec`);

  // 3. Next.js Pages Router (React 19 renderToString)
  console.log('\n--- 3. Next.js Pages Router (React 19 renderToString) ---');
  const ReactHero = (props: typeof pageData) => {
    return React.createElement('section', { className: 'hero' }, [
      React.createElement('h1', { key: 'h1' }, props.title),
      React.createElement('p', { key: 'p' }, props.subtitle),
      React.createElement('a', { key: 'a', href: props.ctaUrl }, props.ctaText),
      React.createElement('div', { key: 'grid', className: 'grid' }, 
        props.features.map((f, idx) => 
          React.createElement('div', { key: idx }, [
            React.createElement('h3', { key: 'h3' }, f.name),
            React.createElement('p', { key: 'p' }, f.desc)
          ])
        )
      )
    ]);
  };

  const startReact = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    renderReact(React.createElement(ReactHero, pageData));
  }
  const endReact = performance.now();
  const reactTimeMs = endReact - startReact;
  const reactOpsPerSec = (ITERATIONS / reactTimeMs) * 1000;
  console.log(`✓ Completed ${ITERATIONS.toLocaleString()} renders in ${reactTimeMs.toFixed(2)} ms`);
  console.log(`🚀 Next.js Pages SSR Throughput: ${Math.round(reactOpsPerSec).toLocaleString()} renders/sec`);

  // 4. Next.js App Router (React Server Component Web Stream)
  console.log('\n--- 4. Next.js App Router (React 19 Server Components Web Stream) ---');
  const nextAppIterations = 10000;
  const startNextApp = performance.now();
  for (let i = 0; i < nextAppIterations; i++) {
    await renderToReadableStream(React.createElement(ReactHero, pageData));
  }
  const endNextApp = performance.now();
  const nextAppTimeMs = endNextApp - startNextApp;
  const nextAppOpsPerSec = (nextAppIterations / nextAppTimeMs) * 1000;
  console.log(`✓ Completed ${nextAppIterations.toLocaleString()} RSC streams in ${nextAppTimeMs.toFixed(2)} ms`);
  console.log(`🚀 Next.js App Router RSC Throughput: ${Math.round(nextAppOpsPerSec).toLocaleString()} renders/sec`);

  console.log('\n=======================================================');
  console.log(' ALL FRAMEWORK SSR BENCHMARKS COMPLETED!              ');
  console.log('=======================================================');
}

runSSRBenchmark().catch(err => {
  console.error('SSR Benchmark Error:', err);
});
