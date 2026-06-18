/**
 * Build a demo page with every webentor block populated with demo content.
 *
 * Reads seeded media/post/menu IDs from /tmp/demo-ids.json (produced by
 * scripts/seed-demo.sh) and inserts blocks via the editor's wp.blocks API so
 * markup is serialized correctly. Publishes the page and reports the URL plus
 * editor + frontend console messages.
 *
 *   node scripts/build-demo-page.mjs
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const SITE = process.env.TEST_SITE_URL || 'http://webentor-test.test';
const USER = process.env.WP_ADMIN_USER || 'admin';
const PASS = process.env.WP_ADMIN_PASSWORD || 'admin';

const ids = JSON.parse(readFileSync('/tmp/demo-ids.json', 'utf8'));
const P = ids.photos || []; // photo attachment IDs
const photo = (i) => P[i % P.length];
const posts = ids.posts || [];

const editorMsgs = [];
const frontMsgs = [];
const rec = (bucket) => (msg) => {
  const t = msg.type();
  if (t === 'error' || t === 'warning') bucket.push({ type: t, text: msg.text() });
};

const browser = await chromium.launch();
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();
page.on('pageerror', (e) => editorMsgs.push({ type: 'pageerror', text: String(e) }));

// --- Log in ---
await page.goto(`${SITE}/wp/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.fill('#user_login', USER);
await page.fill('#user_pass', PASS);
await page.click('#wp-submit');
await page.waitForURL('**/wp-admin/**', { timeout: 60000 });

// --- Find the existing demo page (by slug) so we update it in place ---
const DEMO_SLUG = 'all-webentor-blocks-demo';
const existingId = await page.evaluate(async (slug) => {
  const s = window.wpApiSettings;
  if (!s?.root || !s?.nonce) return null;
  const res = await fetch(`${s.root}wp/v2/pages?slug=${slug}&status=publish,draft`, {
    headers: { 'X-WP-Nonce': s.nonce },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.id ?? null;
}, DEMO_SLUG);

// --- Open the editor: the existing demo page if present, else a fresh page ---
page.on('console', rec(editorMsgs));
const editorUrl = existingId
  ? `${SITE}/wp/wp-admin/post.php?post=${existingId}&action=edit`
  : `${SITE}/wp/wp-admin/post-new.php?post_type=page`;
await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(
  () => window.wp?.data?.select('core/block-editor') && window.wp?.blocks?.createBlock,
  { timeout: 60000 },
);
await page.evaluate(() => {
  try {
    window.wp.data
      .dispatch('core/preferences')
      .set('core/edit-post', 'welcomeGuide', false);
  } catch {}
});

// --- Build the block tree from demo data, then insert ---
const report = await page.evaluate(
  ({ photos, posts, logo, menu }) => {
    const photo = (i) => photos[i % photos.length];
    const [photo0, photo1, photo2, photo3] = [photo(0), photo(1), photo(2), photo(3)];
    const { createBlock } = window.wp.blocks;
    const { resetBlocks } = window.wp.data.dispatch('core/block-editor');

    // Helper: section wrapper with a heading + inner blocks
    const heading = (text, level = 2) =>
      createBlock('core/heading', { content: text, level });
    const para = (text) => createBlock('core/paragraph', { content: text });

    const blocks = [];

    // Intro
    blocks.push(heading('Webentor Block Demo', 1));
    blocks.push(
      para(
        'Every webentor block populated with demo content for visual review on WP 7.0 / PHP 8.4.',
      ),
    );

    // e-button (a few variants)
    blocks.push(heading('Buttons'));
    blocks.push(
      createBlock('webentor/e-button', {
        button: { title: 'Primary action', url: '/', variant: 'primary', size: 'medium', htmlElement: 'a' },
      }),
    );
    blocks.push(
      createBlock('webentor/e-button', {
        button: { title: 'Secondary action', url: '/', variant: 'secondary', size: 'medium', htmlElement: 'a' },
      }),
    );

    // e-image
    blocks.push(heading('Image'));
    blocks.push(createBlock('webentor/e-image', { imgId: photo0, imageSize: 'large', aspectRatio: 'video', objectFit: 'cover' }));

    // e-gallery
    blocks.push(heading('Gallery'));
    blocks.push(
      createBlock('webentor/e-gallery', {
        images: [photo0, photo1, photo2, photo3].map((id) => ({ id, url: '', alt: 'Demo image' })),
        aspectRatio: 'square',
        objectFit: 'cover',
        imageSize: 'medium',
      }),
    );

    // e-svg + e-icon-picker
    blocks.push(heading('SVG & Icon'));
    if (logo) blocks.push(createBlock('webentor/e-svg', { imgId: logo, width: '160', height: '40' }));
    blocks.push(createBlock('webentor/e-icon-picker', { icon: { name: 'play', iconSet: 'webentor' }, width: '48', height: '48', color: 'text-black' }));

    // l-formatted-content
    blocks.push(heading('Formatted content'));
    blocks.push(
      createBlock('webentor/l-formatted-content', {}, [
        heading('A formatted heading', 3),
        para('Formatted content wraps rich text with the theme typography styles. Demo paragraph with a bit of length to show line spacing and measure.'),
        createBlock('core/list', {}, [
          createBlock('core/list-item', { content: 'First demo point' }),
          createBlock('core/list-item', { content: 'Second demo point' }),
          createBlock('core/list-item', { content: 'Third demo point' }),
        ]),
      ]),
    );

    // e-accordion-group with accordions
    blocks.push(heading('Accordion'));
    blocks.push(
      createBlock('webentor/e-accordion-group', {}, [
        createBlock('webentor/e-accordion', { title: 'What is webentor-core?', defaultOpen: true }, [
          para('A shared runtime of blocks, filters and helpers for the Webentor stack.'),
        ]),
        createBlock('webentor/e-accordion', { title: 'Does it support WP 7.0?' }, [
          para('Yes — verified against WordPress 7.0 and PHP 8.4.'),
        ]),
        createBlock('webentor/e-accordion', { title: 'How are blocks registered?' }, [
          para('Via block.json and the core service provider.'),
        ]),
      ]),
    );

    // e-tabs with tab-containers
    blocks.push(heading('Tabs'));
    blocks.push(
      createBlock('webentor/e-tabs', {}, [
        createBlock('webentor/e-tab-container', { title: 'Overview' }, [
          para('The overview tab content goes here.'),
        ]),
        createBlock('webentor/e-tab-container', { title: 'Details' }, [
          para('The details tab content goes here.'),
        ]),
        createBlock('webentor/e-tab-container', { title: 'Pricing' }, [
          para('The pricing tab content goes here.'),
        ]),
      ]),
    );

    // e-table (3x3 with header row)
    blocks.push(heading('Table'));
    const cell = (text, th = false) =>
      createBlock('webentor/e-table-cell', { showAsTh: th }, [para(text)]);
    const row = (cells) => createBlock('webentor/e-table-row', {}, cells);
    blocks.push(
      createBlock('webentor/e-table', {}, [
        row([cell('Plan', true), cell('Price', true), cell('Seats', true)]),
        row([cell('Starter'), cell('$9'), cell('1')]),
        row([cell('Team'), cell('$29'), cell('10')]),
        row([cell('Business'), cell('$99'), cell('Unlimited')]),
      ]),
    );

    // l-section with background image + inner content
    blocks.push(heading('Section (with background image)'));
    blocks.push(
      createBlock('webentor/l-section', { img: { id: photo1, url: '', alt: 'Section background' }, anchor: 'demo-section' }, [
        heading('Section heading', 2),
        para('A section block with a background image and inner content.'),
        createBlock('webentor/e-button', { button: { title: 'Call to action', url: '/', variant: 'primary', htmlElement: 'a' } }),
      ]),
    );

    // l-flexible-container with inner blocks
    blocks.push(heading('Flexible container'));
    blocks.push(
      createBlock('webentor/l-flexible-container', {}, [
        heading('Flexible container', 3),
        para('A flexible layout container holding demo content.'),
      ]),
    );

    // e-breadcrumbs
    blocks.push(heading('Breadcrumbs'));
    blocks.push(createBlock('webentor/e-breadcrumbs', {}));

    // e-slider with flexible-container slides
    blocks.push(heading('Slider'));
    blocks.push(
      createBlock('webentor/e-slider', {}, [
        createBlock('webentor/l-flexible-container', {}, [heading('Slide one', 3), para('First slide content.')]),
        createBlock('webentor/l-flexible-container', {}, [heading('Slide two', 3), para('Second slide content.')]),
        createBlock('webentor/l-flexible-container', {}, [heading('Slide three', 3), para('Third slide content.')]),
      ]),
    );

    // e-query-loop (auto query) -> post-template -> post-card
    blocks.push(heading('Query loop (latest posts)'));
    blocks.push(
      createBlock(
        'webentor/e-query-loop',
        { query: { perPage: 4, postType: ['post'], order: 'desc', orderBy: 'date', inherit: false } },
        [createBlock('webentor/e-post-template', {}, [createBlock('webentor/l-post-card', {})])],
      ),
    );

    // e-picker-query-loop (hand-picked posts)
    if (posts.length) {
      blocks.push(heading('Picker query loop (hand-picked posts)'));
      blocks.push(
        createBlock(
          'webentor/e-picker-query-loop',
          { query: { postType: ['post'], posts: posts.slice(0, 3).map((id) => ({ id })) } },
          [createBlock('webentor/e-post-template', {}, [createBlock('webentor/l-post-card', {})])],
        ),
      );
    }

    // l-nav-menu + l-site-logo + l-mobile-nav (need the seeded menu)
    blocks.push(heading('Navigation & logo'));
    blocks.push(createBlock('webentor/l-site-logo', {}));
    if (menu) blocks.push(createBlock('webentor/l-nav-menu', { menuId: String(menu), direction: 'direction-row' }));

    // Replace ALL content (works for both a fresh page and the existing demo
    // page) so re-runs update in place instead of appending.
    resetBlocks(blocks.filter(Boolean));
    return { inserted: blocks.length };
  },
  { photos: P, posts, logo: ids.logo || 0, menu: ids.menu || 0 },
);

await page.waitForTimeout(2500);
const validation = await page.evaluate(() =>
  window.wp.data
    .select('core/block-editor')
    .getBlocks()
    .map((b) => ({ name: b.name, isValid: b.isValid })),
);

// --- Publish ---
await page.evaluate(async () => {
  window.wp.data.dispatch('core/editor').editPost({ title: 'All Webentor Blocks (Demo)', status: 'publish' });
  await window.wp.data.dispatch('core/editor').savePost();
});
await page.waitForTimeout(2500);
const out = await page.evaluate(() => ({
  id: window.wp.data.select('core/editor').getCurrentPostId(),
  link: window.wp.data.select('core/editor').getCurrentPost()?.link || null,
}));

// --- Frontend console ---
let frontStatus = null;
if (out.link) {
  const fp = await context.newPage();
  fp.on('console', rec(frontMsgs));
  fp.on('pageerror', (e) => frontMsgs.push({ type: 'pageerror', text: String(e) }));
  const resp = await fp.goto(out.link, { waitUntil: 'domcontentloaded', timeout: 60000 });
  frontStatus = resp ? resp.status() : null;
  await fp.waitForTimeout(2500);
}

await browser.close();
console.log('===JSON_START===');
console.log(JSON.stringify({ report, validation, out, frontStatus, editorMsgs, frontMsgs }, null, 2));
console.log('===JSON_END===');
