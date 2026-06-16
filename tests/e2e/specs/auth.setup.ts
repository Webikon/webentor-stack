import { test as setup } from '@playwright/test';
import { TEST_CONFIG } from '../fixtures/test-config';

const authFile = 'tests/e2e/.auth/admin.json';

/**
 * Runs once before all test projects. Logs into WordPress
 * and persists browser cookies/storage so every subsequent
 * test starts already authenticated.
 */
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/wp/wp-login.php', { waitUntil: 'networkidle' });

  const userField = page.locator('#user_login');
  const passField = page.locator('#user_pass');
  const submitBtn = page.locator('#wp-submit');

  // Wait for both fields to be attached and editable
  await userField.waitFor({ state: 'visible' });
  await passField.waitFor({ state: 'visible' });

  // Clear + fill username, then verify value stuck
  await userField.clear();
  await userField.fill(TEST_CONFIG.adminUser);
  await userField.inputValue().then((v) => {
    if (v !== TEST_CONFIG.adminUser) throw new Error(`username fill failed: got "${v}"`);
  });

  // Clear + fill password, then verify value stuck
  await passField.clear();
  await passField.fill(TEST_CONFIG.adminPassword);
  await passField.inputValue().then((v) => {
    if (v !== TEST_CONFIG.adminPassword) throw new Error(`password fill failed: got "${v}"`);
  });

  await submitBtn.click();
  await page.waitForURL('**/wp-admin/**', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.context().storageState({ path: authFile });
});
