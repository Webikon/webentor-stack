import { test, expect } from '@playwright/test';

test.describe('Theme loads correctly', () => {
  test('frontend returns 200 and has no PHP fatal errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const body = await page.textContent('body');
    expect(body).not.toContain('Fatal error');
    expect(body).not.toContain('Parse error');
    expect(body).not.toContain('Warning:');
  });

  test('page has a <title> tag', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Vite-compiled CSS is loaded', async ({ page }) => {
    await page.goto('/');
    const stylesheets = await page.locator('link[rel="stylesheet"]').all();
    expect(stylesheets.length).toBeGreaterThan(0);
  });

  test('Vite-compiled JS is loaded', async ({ page }) => {
    await page.goto('/');
    const scripts = await page.locator('script[src]').all();
    expect(scripts.length).toBeGreaterThan(0);
  });

  test('no console errors on frontend', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (e.g. third-party scripts)
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('third-party'),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
