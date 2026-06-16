import { Browser, Page } from '@playwright/test';
import { TEST_CONFIG } from './test-config';

/** Path to the persisted auth state created by auth.setup.ts. */
export const AUTH_FILE = 'tests/e2e/.auth/admin.json';

/**
 * Log in to WordPress admin via the login form.
 * Primarily used by auth.setup.ts; most tests should rely on
 * the storageState set up by the setup project instead.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/wp/wp-login.php', { waitUntil: 'networkidle' });

  const userField = page.locator('#user_login');
  const passField = page.locator('#user_pass');

  await userField.waitFor({ state: 'visible' });
  await passField.waitFor({ state: 'visible' });

  await userField.clear();
  await userField.fill(TEST_CONFIG.adminUser);

  await passField.clear();
  await passField.fill(TEST_CONFIG.adminPassword);

  // Verify both values are set before submitting — WP login JS
  // can interfere with fill on fast Playwright runs.
  await passField.inputValue().then((v) => {
    if (!v) throw new Error('password field is empty after fill');
  });

  await page.locator('#wp-submit').click();
  await page.waitForURL('**/wp-admin/**', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
}

/**
 * Create a new browser context with persisted admin auth cookies.
 * Use in beforeAll/afterAll hooks where browser.newPage() would
 * otherwise start unauthenticated.
 */
export async function newAuthenticatedPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ storageState: AUTH_FILE });
  return context.newPage();
}

export interface WPPage {
  id: number;
  link: string;
}

/**
 * Create a published WP page with the given serialized block content.
 * Uses the WP REST API via the authenticated browser session.
 * Caller must have logged in first via loginAsAdmin().
 */
export async function createPageWithBlocks(
  page: Page,
  title: string,
  content: string,
): Promise<WPPage> {
  if (!page.url().includes('/wp-admin/')) {
    await page.goto('/wp/wp-admin/');
    await page.waitForLoadState('domcontentloaded');
  }

  return page.evaluate(
    async ({ title, content }) => {
      const s = (window as any).wpApiSettings;
      if (!s?.root || !s?.nonce) {
        throw new Error('wpApiSettings not available — not on an admin page?');
      }

      const res = await fetch(`${s.root}wp/v2/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': s.nonce,
        },
        body: JSON.stringify({ title, content, status: 'publish' }),
      });

      if (!res.ok) {
        throw new Error(`WP REST ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      return { id: data.id as number, link: data.link as string };
    },
    { title, content },
  );
}

/**
 * Delete WordPress pages by ID. Intended for afterAll cleanup.
 * Silently skips if wpApiSettings is unavailable.
 */
export async function deleteTestPages(
  page: Page,
  pageIds: number[],
): Promise<void> {
  if (!pageIds.length) return;

  if (!page.url().includes('/wp-admin/')) {
    await page.goto('/wp/wp-admin/');
    await page.waitForLoadState('domcontentloaded');
  }

  await page.evaluate(async (ids) => {
    const s = (window as any).wpApiSettings;
    if (!s?.root || !s?.nonce) return;

    for (const id of ids) {
      await fetch(`${s.root}wp/v2/pages/${id}?force=true`, {
        method: 'DELETE',
        headers: { 'X-WP-Nonce': s.nonce },
      });
    }
  }, pageIds);
}

/**
 * Dismiss the Gutenberg "Welcome" modal if it appears.
 */
export async function dismissEditorWelcome(page: Page): Promise<void> {
  const modal = page.locator('.components-modal__frame');
  if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page
      .locator(
        '.components-modal__header button[aria-label="Close"], .components-modal__frame button:has-text("Close")',
      )
      .first()
      .click();
  }
}

/**
 * Insert a block by name via the block editor slash command.
 * Assumes the editor writing flow is focused.
 */
export async function insertBlock(
  page: Page,
  blockName: string,
): Promise<void> {
  await page.click('.block-editor-writing-flow');
  await page.keyboard.press('Enter');
  await page.keyboard.type(`/${blockName}`);

  // Wait for the autocomplete suggestion and select it
  const suggestion = page.locator(
    `.components-autocomplete__result:has-text("${blockName}")`,
  );
  await suggestion.first().click({ timeout: 5000 });
}
