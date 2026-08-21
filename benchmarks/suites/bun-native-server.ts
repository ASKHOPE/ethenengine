// Native Bun.serve Engine Test

const server = Bun.serve({
  port: 3002,
  fetch(req) {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Native Bun Server</title></head>
        <body><h1>ETHENENGINE Native Bun Engine</h1></body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
});

console.log(`Native Bun Server listening on http://localhost:${server.port}`);
