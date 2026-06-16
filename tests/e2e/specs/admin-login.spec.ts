import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../fixtures/test-config';

// This spec tests the actual login flow, so it must start unauthenticated.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('WordPress admin', () => {
  test('login page loads', async ({ page }) => {
    const response = await page.goto('/wp/wp-login.php');
    expect(response?.status()).toBe(200);

    await expect(page.locator('#user_login')).toBeVisible();
    await expect(page.locator('#user_pass')).toBeVisible();
  });

  test('can log in with test credentials', async ({ page }) => {
    await page.goto('/wp/wp-login.php');

    await page.fill('#user_login', TEST_CONFIG.adminUser);
    await page.fill('#user_pass', TEST_CONFIG.adminPassword);
    await page.click('#wp-submit');

    await page.waitForURL('**/wp-admin/**');
    await expect(page.locator('#wpadminbar')).toBeVisible();
  });

  test('admin dashboard loads without errors', async ({ page }) => {
    await page.goto('/wp/wp-login.php');
    await page.fill('#user_login', TEST_CONFIG.adminUser);
    await page.fill('#user_pass', TEST_CONFIG.adminPassword);
    await page.click('#wp-submit');

    await page.waitForURL('**/wp-admin/**');

    const body = await page.textContent('body');
    expect(body).not.toContain('Fatal error');
    expect(body).not.toContain('There has been a critical error');
  });
});
