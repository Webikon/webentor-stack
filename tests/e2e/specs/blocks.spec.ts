import { test, expect } from '@playwright/test';
import { dismissEditorWelcome } from '../fixtures/test-helpers';

test.describe('Gutenberg block editor', () => {
  test('block editor loads on new page', async ({ page }) => {
    await page.goto('/wp/wp-admin/post-new.php?post_type=page');

    // Wait for the editor to initialize
    await page.waitForSelector('.block-editor-writing-flow', {
      timeout: 15000,
    });
    await expect(page.locator('.block-editor-writing-flow')).toBeVisible();
  });

  test('can insert a paragraph block and publish', async ({ page }) => {
    await page.goto('/wp/wp-admin/post-new.php?post_type=page');

    await page.waitForSelector('.block-editor-writing-flow', {
      timeout: 15000,
    });
    await dismissEditorWelcome(page);

    await page.click('.block-editor-writing-flow');
    await page.keyboard.type('E2E test block content');

    // Publish the page
    const publishButton = page.locator(
      'button.editor-post-publish-button__button, button.editor-post-publish-panel__toggle',
    );
    await publishButton.first().click();

    // Handle the publish confirmation panel if it appears
    const confirmPublish = page.locator(
      'button.editor-post-publish-button:not(.editor-post-publish-panel__toggle)',
    );
    if (await confirmPublish.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmPublish.click();
    }

    // Verify published successfully
    await expect(
      page.locator('.editor-post-publish-panel__header, .post-publish-panel'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('published page renders block content on frontend', async ({
    page,
  }) => {
    await page.goto('/wp/wp-admin/post-new.php?post_type=page');
    await page.waitForSelector('.block-editor-writing-flow', {
      timeout: 15000,
    });
    await dismissEditorWelcome(page);

    await page.click('.block-editor-writing-flow');
    await page.keyboard.type('webentor-e2e-verification-string');

    const publishButton = page.locator(
      'button.editor-post-publish-button__button, button.editor-post-publish-panel__toggle',
    );
    await publishButton.first().click();

    const confirmPublish = page.locator(
      'button.editor-post-publish-button:not(.editor-post-publish-panel__toggle)',
    );
    if (await confirmPublish.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmPublish.click();
    }

    // Wait for publish and get the view link
    const viewLink = page.locator(
      'a.components-button:has-text("View Page"), a:has-text("View page")',
    );
    await expect(viewLink.first()).toBeVisible({ timeout: 10000 });

    const href = await viewLink.first().getAttribute('href');
    expect(href).toBeTruthy();

    // Visit the published page
    await page.goto(href!);
    const body = await page.textContent('body');
    expect(body).toContain('webentor-e2e-verification-string');
  });
});
