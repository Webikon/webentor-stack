import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for the webentor test site.
 * Expects the test-site to be running via Valet at the BASE_URL below.
 * Override with TEST_SITE_URL env var if using a different host.
 */
const baseURL = process.env.TEST_SITE_URL || 'http://webentor-test.test';

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  outputDir: './tests/e2e/results',

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/, timeout: 60_000 },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
});
