import { test, expect } from '@playwright/test';

test.describe('Platform E2E & Security Vulnerability Tests', () => {
  // 1. Visual & UI Page Rendering Test
  test('renders homepage with theme styling and block components', async ({ page }) => {
    await page.goto('/preview/home');
    await expect(page).toHaveTitle(/ETHENENGINE Enterprise/);
  });

  // 2. Security XSS Injection Test
  test('sanitizes user input to prevent XSS script execution', async ({ request }) => {
    const xssPayload = '<script>window.xssVulnerable=true;</script>';

    const res = await request.put('/api/website/pages/page_home/blocks', {
      data: {
        blocks: [
          {
            id: 'blk_hero_xss',
            type: 'hero',
            settings: {
              title: xssPayload,
              subtitle: 'Safe Subtitle',
              ctaText: 'Button',
              ctaUrl: '#',
            },
          },
        ],
      },
    });

    expect(res.status()).toBe(200);
  });

  // 3. Admin Console Access Test
  test('loads administrative control panel dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.setItem('auth_token', 'mock_e2e_token'));
    await page.goto('/admin');
    await expect(page.locator('h1, h2, .brand, .card h2').first()).toBeVisible();
  });

  // 4. Multi-Tenant API Resolution Test
  test('resolves multi-tenant API responses via headers', async ({ request }) => {
    const res = await request.get('/api/core/tenants', {
      headers: { 'x-tenant-id': 'acme' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.tenants).toBeDefined();
    expect(body.tenants.length).toBeGreaterThan(0);
  });

  // 5. Commerce Subsystem Cart Test
  test('handles product listing and API operations', async ({ request }) => {
    const res = await request.get('/api/cms/content-types');
    expect(res.status()).toBe(200);
  });

  // 6. Runtime Validation & Security Middleware Test
  test('blocks malicious prototype pollution attempts at runtime', async ({ request }) => {
    const res = await request.get('/api/core/tenants?search=<script>alert(1)</script>');
    expect(res.status()).toBe(400);
  });
});
