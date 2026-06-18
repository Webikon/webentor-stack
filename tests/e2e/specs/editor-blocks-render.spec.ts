import { test, expect } from '@playwright/test';
import { openBlockEditor, EDITOR_CANVAS } from '../fixtures/test-helpers';

/**
 * Inserts every top-level webentor-core block into the editor and asserts:
 *   1. each inserts without throwing,
 *   2. no block ends up invalid (block-validation),
 *   3. each block type actually mounts in the canvas iframe,
 *   4. no console errors are emitted during the whole flow.
 *
 * Uses the `window.wp.*` data API (reachable from the top frame) to insert
 * blocks — robust against WP 7.0's iframed editor DOM. Runs in an unsaved
 * auto-draft, so it never publishes a page.
 */

// Console errors that are environmental, not block bugs.
const BENIGN_ERRORS = [
  'No API Key set for this site', // ShortPixel admin notice
  'favicon',
];

// Dynamic template-part blocks render an editor PLACEHOLDER (their real markup
// is produced on the frontend), so they don't emit a standard `[data-type]`
// node in the canvas. They're still covered by the validity + console checks.
const CANVAS_EXEMPT = ['webentor/l-header', 'webentor/l-footer'];

test.describe('Webentor blocks render in the editor', () => {
  test('all top-level webentor blocks insert valid, mount, and log no errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await openBlockEditor(page);

    // Insert every top-level webentor block via the data API.
    const result = await page.evaluate(async () => {
      const { createBlock, getBlockTypes } = (window as any).wp.blocks;
      const { insertBlock } = (window as any).wp.data.dispatch('core/block-editor');
      const types = getBlockTypes().filter(
        (t: any) =>
          t.name.startsWith('webentor/') &&
          !(Array.isArray(t.parent) && t.parent.length),
      );
      const failed: { name: string; error: string }[] = [];
      for (const t of types) {
        try {
          await insertBlock(createBlock(t.name));
          await new Promise((r) => setTimeout(r, 50));
        } catch (e) {
          failed.push({ name: t.name, error: String(e) });
        }
      }
      return { names: types.map((t: any) => t.name) as string[], failed };
    });

    expect(
      result.failed,
      `blocks threw on insert: ${JSON.stringify(result.failed)}`,
    ).toHaveLength(0);
    expect(result.names.length, 'no webentor blocks were registered').toBeGreaterThan(0);

    // Let the editor settle, then check block-validation state.
    await page.waitForTimeout(2500);
    const invalid = await page.evaluate(() =>
      (window as any).wp.data
        .select('core/block-editor')
        .getBlocks()
        .filter((b: any) => !b.isValid)
        .map((b: any) => b.name),
    );
    expect(invalid, `invalid blocks: ${invalid.join(', ')}`).toHaveLength(0);

    // Each block type (except dynamic placeholders) should mount in the canvas.
    const canvas = page.frameLocator(EDITOR_CANVAS);
    for (const name of result.names) {
      if (CANVAS_EXEMPT.includes(name)) continue;
      const count = await canvas.locator(`[data-type="${name}"]`).count();
      expect(count, `block "${name}" did not mount in the editor canvas`).toBeGreaterThan(0);
    }

    // No console errors (warnings/info are allowed — e.g. deprecation warnings).
    const critical = consoleErrors.filter(
      (e) => !BENIGN_ERRORS.some((b) => e.includes(b)),
    );
    expect(critical, `editor console errors:\n${critical.join('\n')}`).toHaveLength(0);
  });
});
