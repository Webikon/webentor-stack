/**
 * One-off: insert all webentor-core blocks into a new page, capture editor +
 * frontend console messages and block-validation issues. Run on the test-site
 * (PHP 8.4 / WP 7.0) to surface block-relevant warnings/deprecations.
 *
 *   node scripts/check-blocks-console.mjs
 */
import { chromium } from '@playwright/test';

const SITE = process.env.TEST_SITE_URL || 'http://webentor-test.test';
const USER = process.env.WP_ADMIN_USER || 'admin';
const PASS = process.env.WP_ADMIN_PASSWORD || 'admin';

const editorMsgs = [];
const frontMsgs = [];

function record(bucket) {
  return (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning' || type === 'info') {
      bucket.push({ type, text: msg.text() });
    }
  };
}

const browser = await chromium.launch();
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();
page.on('pageerror', (e) => editorMsgs.push({ type: 'pageerror', text: String(e) }));

// --- Log in ---
await page.goto(`${SITE}/wp/wp-login.php`, { waitUntil: 'networkidle' });
await page.fill('#user_login', USER);
await page.fill('#user_pass', PASS);
await page.click('#wp-submit');
await page.waitForURL('**/wp-admin/**', { timeout: 60000 });

// --- Open a fresh page in the editor ---
page.on('console', record(editorMsgs));
await page.goto(`${SITE}/wp/wp-admin/post-new.php?post_type=page`, { waitUntil: 'domcontentloaded', timeout: 60000 });

// Wait until the block editor data layer is ready
await page.waitForFunction(
  () => window.wp?.data?.select('core/block-editor') && window.wp?.blocks?.getBlockTypes,
  { timeout: 60000 }
);
// Dismiss welcome guide if present
await page.evaluate(() => {
  try { window.wp.data.dispatch('core/preferences').set('core/edit-post', 'welcomeGuide', false); } catch {}
  try { window.wp.data.dispatch('core/edit-post').disableComplementaryArea?.('core/edit-post'); } catch {}
});

// --- Insert every top-level webentor block via the data API ---
const insertReport = await page.evaluate(async () => {
  const { createBlock, getBlockTypes } = window.wp.blocks;
  const { insertBlock } = window.wp.data.dispatch('core/block-editor');
  const types = getBlockTypes().filter(
    (t) => t.name.startsWith('webentor/') && !(Array.isArray(t.parent) && t.parent.length)
  );
  const inserted = [];
  const failed = [];
  for (const t of types) {
    try {
      const block = createBlock(t.name);
      await insertBlock(block);
      inserted.push(t.name);
      // small yield so React/validation settles per-block
      await new Promise((r) => setTimeout(r, 60));
    } catch (e) {
      failed.push({ name: t.name, error: String(e) });
    }
  }
  return { total: types.length, inserted, failed };
});

// Let the editor settle, then read block validation state
await page.waitForTimeout(2500);
const validation = await page.evaluate(() => {
  const blocks = window.wp.data.select('core/block-editor').getBlocks();
  return blocks.map((b) => ({
    name: b.name,
    isValid: b.isValid,
    issues: (b.validationIssues || []).map((i) =>
      (i.args || []).join(' ') || i.log || ''
    ),
  }));
});

// --- Publish ---
let permalink = null;
try {
  await page.evaluate(async () => {
    window.wp.data.dispatch('core/editor').editPost({
      title: 'All Webentor Blocks',
      status: 'publish',
    });
    await window.wp.data.dispatch('core/editor').savePost();
  });
  await page.waitForTimeout(2500);
  permalink = await page.evaluate(() =>
    window.wp.data.select('core/editor').getPermalink?.() ||
    window.wp.data.select('core/editor').getCurrentPost()?.link || null
  );
} catch (e) {
  editorMsgs.push({ type: 'pageerror', text: 'publish failed: ' + e });
}

// --- Load the published frontend and capture its console ---
let frontStatus = null;
if (permalink) {
  const fp = await context.newPage();
  fp.on('console', record(frontMsgs));
  fp.on('pageerror', (e) => frontMsgs.push({ type: 'pageerror', text: String(e) }));
  const resp = await fp.goto(permalink, { waitUntil: 'domcontentloaded', timeout: 60000 });
  frontStatus = resp ? resp.status() : null;
  await fp.waitForTimeout(2000);
}

await browser.close();

// --- Report ---
const out = { insertReport, validation, permalink, frontStatus, editorMsgs, frontMsgs };
console.log('===JSON_START===');
console.log(JSON.stringify(out, null, 2));
console.log('===JSON_END===');
