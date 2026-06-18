import { test, expect } from '@playwright/test';
import { openBlockEditor, EDITOR_CANVAS } from '../fixtures/test-helpers';

/**
 * Verifies that webentor-core + theme editor assets are enqueued AND land in
 * the right place for WP 7.0's iframed editor:
 *   - JS enqueued on `enqueue_block_editor_assets` → OUTER editor document
 *   - CSS enqueued on `enqueue_block_assets` (is_admin) → INSIDE the canvas iframe
 *
 * WordPress renders style/script tags with id="{handle}-css" / "{handle}-js",
 * so we match by id substring to stay robust against the exact suffix.
 */

// Editor JavaScript — lives in the outer editor document.
const OUTER_SCRIPTS = [
  'webentor-core-editor', // webentor-core-editor-js
  'theme-blocks-editor', // theme-blocks-editor-js
];

// Editor canvas CSS — must be injected into the iframe so blocks are styled.
const IFRAME_STYLES = [
  'webentor-core-editor-styles',
  'theme-blocks-editor-styles',
  'theme-button-styles', // regression guard: button styles must reach the canvas
];

test.describe('Editor assets load in the correct location', () => {
  test.beforeEach(async ({ page }) => {
    await openBlockEditor(page);
  });

  test('editor canvas iframe is present', async ({ page }) => {
    await expect(page.locator(EDITOR_CANVAS)).toBeVisible({ timeout: 30_000 });
  });

  for (const handle of OUTER_SCRIPTS) {
    test(`outer editor document loads script "${handle}"`, async ({ page }) => {
      const count = await page.locator(`script[id*="${handle}"]`).count();
      expect(count, `expected a <script> with id containing "${handle}"`).toBeGreaterThan(0);
    });
  }

  for (const handle of IFRAME_STYLES) {
    test(`editor canvas iframe loads style "${handle}"`, async ({ page }) => {
      const canvas = page.frameLocator(EDITOR_CANVAS);
      const link = canvas.locator(`link[id*="${handle}"]`);
      await expect(
        link,
        `expected a <link> with id containing "${handle}" inside the editor canvas iframe`,
      ).not.toHaveCount(0, { timeout: 30_000 });
    });
  }

  test('core editor script exposes WEBENTOR_WP_DEBUG inline flag', async ({ page }) => {
    const html = await page.content();
    expect(html).toContain('window.WEBENTOR_WP_DEBUG');
  });
});
