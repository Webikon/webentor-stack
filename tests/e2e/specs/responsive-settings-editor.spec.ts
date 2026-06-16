import { test, expect } from '@playwright/test';
import { dismissEditorWelcome } from '../fixtures/test-helpers';

/**
 * Editor-side tests for responsive settings panels on l-section
 * and l-flexible-container blocks. Verifies panel visibility,
 * responsive breakpoint tabs, and that the panels listed in
 * block.json supports.webentor are rendered.
 *
 * Auth is handled by the setup project (storageState).
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/wp/wp-admin/post-new.php?post_type=page');
  await page.waitForSelector('.block-editor-writing-flow', { timeout: 15000 });
  await dismissEditorWelcome(page);
});

/**
 * Opens the block inserter, searches for a block, and inserts it.
 */
async function insertBlockViaInserter(page: any, blockTitle: string) {
  // Open the inserter panel via the top-bar toggle
  const inserterToggle = page.locator(
    'button.editor-document-tools__inserter-toggle, button[aria-label="Toggle block inserter"]',
  );
  await inserterToggle.click();

  // Search for the block
  const searchInput = page.locator(
    '.block-editor-inserter__search-input, input[placeholder="Search"]',
  );
  await searchInput.waitFor({ timeout: 5000 });
  await searchInput.fill(blockTitle);

  // Click the matching block item
  const blockItem = page.locator(
    `.block-editor-block-types-list__item:has-text("${blockTitle}")`,
  );
  await blockItem.first().click({ timeout: 5000 });

  // Close inserter if still open
  if (await inserterToggle.getAttribute('aria-pressed').catch(() => 'false') === 'true') {
    await inserterToggle.click();
  }
}

/**
 * Selects the first block of the given type in the editor canvas.
 */
async function selectBlock(page: any, blockSelector: string) {
  const block = page.locator(
    `.block-editor-writing-flow [data-type="${blockSelector}"]`,
  );
  await block.first().click();
  // Ensure the settings sidebar is visible
  const settingsButton = page.locator(
    'button[aria-label="Settings"][aria-expanded="false"]',
  );
  if (await settingsButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await settingsButton.click();
  }
}

// ---------------------------------------------------------------------------
// l-section
// ---------------------------------------------------------------------------

test.describe('l-section responsive settings panels', () => {
  test.beforeEach(async ({ page }) => {
    await insertBlockViaInserter(page, 'Section');
    await selectBlock(page, 'webentor/l-section');
  });

  test('Spacing Settings panel is visible', async ({ page }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Spacing Settings' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Display & Layout Settings panel is visible', async ({ page }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Display & Layout Settings' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Border Settings panel is visible', async ({ page }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Border Settings' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Block Link panel is NOT visible (l-section does not support it)', async ({
    page,
  }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Block Link' });
    await expect(panel).not.toBeVisible({ timeout: 2000 });
  });

  test('responsive breakpoint tabs exist in Spacing panel', async ({
    page,
  }) => {
    // Open the Spacing panel
    const panelButton = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Spacing Settings' });
    await panelButton.click();

    // Scope within the Spacing panel body to avoid strict-mode collision
    // with the Display & Layout panel (which is also open by default)
    const spacingPanel = page.locator('.components-panel__body').filter({
      has: page.locator('.components-panel__body-title button', {
        hasText: 'Spacing Settings',
      }),
    });
    const tabPanel = spacingPanel.locator('.w-responsive-settings-tabs');
    await expect(tabPanel).toBeVisible({ timeout: 5000 });

    const tabs = tabPanel.locator('[role="tab"]');
    await expect(tabs).toHaveCount(6); // basic, sm, md, lg, xl, 2xl
  });

  test('responsive breakpoint tabs exist in Display & Layout panel', async ({
    page,
  }) => {
    const layoutPanel = page.locator('.components-panel__body').filter({
      has: page.locator('.components-panel__body-title button', {
        hasText: 'Display & Layout Settings',
      }),
    });
    const tabPanel = layoutPanel.locator('.w-responsive-settings-tabs');
    await expect(tabPanel).toBeVisible({ timeout: 5000 });

    const tabs = tabPanel.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

// ---------------------------------------------------------------------------
// l-flexible-container
// ---------------------------------------------------------------------------

test.describe('l-flexible-container responsive settings panels', () => {
  test.beforeEach(async ({ page }) => {
    await insertBlockViaInserter(page, 'Flexible Container');
    await selectBlock(page, 'webentor/l-flexible-container');
  });

  test('Spacing Settings panel is visible', async ({ page }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Spacing Settings' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Display & Layout Settings panel is visible', async ({ page }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Display & Layout Settings' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Border Settings panel is visible', async ({ page }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Border Settings' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Block Link panel IS visible (l-flexible-container supports it)', async ({
    page,
  }) => {
    const panel = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Block Link' });
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('responsive breakpoint tabs exist in Spacing panel', async ({
    page,
  }) => {
    const panelButton = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: 'Spacing Settings' });
    await panelButton.click();

    // Scope within the Spacing panel body to avoid strict-mode collision
    const spacingPanel = page.locator('.components-panel__body').filter({
      has: page.locator('.components-panel__body-title button', {
        hasText: 'Spacing Settings',
      }),
    });
    const tabPanel = spacingPanel.locator('.w-responsive-settings-tabs');
    await expect(tabPanel).toBeVisible({ timeout: 5000 });

    const tabs = tabPanel.locator('[role="tab"]');
    await expect(tabs).toHaveCount(6);
  });

  test('Display & Layout panel shows active indicator (*) when display is set', async ({
    page,
  }) => {
    // Flexible container gets display=flex by default via initAttributes
    // so the Display & Layout panel title should contain *
    const panelTitle = page.locator(
      '.components-panel__body .components-panel__body-title button',
    ).filter({ hasText: /Display & Layout Settings\s*\*/ });
    await expect(panelTitle).toBeVisible({ timeout: 5000 });
  });
});
