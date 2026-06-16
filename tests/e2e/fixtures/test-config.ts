/**
 * Shared test configuration and credentials.
 * Values match test-site/.env.example defaults.
 */
export const TEST_CONFIG = {
  adminUser: process.env.WP_ADMIN_USER || 'admin',
  adminPassword: process.env.WP_ADMIN_PASSWORD || 'admin',
  siteUrl: process.env.TEST_SITE_URL || 'http://webentor-test.test',
} as const;
