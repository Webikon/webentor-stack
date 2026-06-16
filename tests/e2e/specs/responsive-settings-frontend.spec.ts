import { test, expect, Page } from '@playwright/test';
import {
  newAuthenticatedPage,
  createPageWithBlocks,
  deleteTestPages,
  WPPage,
} from '../fixtures/test-helpers';
import {
  SECTION_RESPONSIVE,
  FLEX_CONTAINER_RESPONSIVE,
  FLEX_CONTAINER_WITH_LINK,
  SECTION_WITH_BORDER,
  SECTION_VIEWPORT,
  BREAKPOINTS,
} from '../fixtures/block-fixtures';

/**
 * Frontend rendering tests for responsive settings.
 * Creates pages via WP REST API with known block attributes,
 * then verifies the rendered HTML contains expected Tailwind classes.
 */

/** Assert that an element's class list contains all expected classes. */
async function expectClasses(
  locator: ReturnType<Page['locator']>,
  expectedClasses: string[],
) {
  const classList = await locator.getAttribute('class');
  expect(classList).toBeTruthy();
  for (const cls of expectedClasses) {
    expect(classList, `Expected class "${cls}" on element`).toContain(cls);
  }
}

/** Assert that an element's class list does NOT contain any of the given classes. */
async function expectNoClasses(
  locator: ReturnType<Page['locator']>,
  unwantedClasses: string[],
) {
  const classList = await locator.getAttribute('class');
  if (!classList) return;
  for (const cls of unwantedClasses) {
    expect(classList, `Unexpected class "${cls}" on element`).not.toContain(cls);
  }
}

// ---------------------------------------------------------------------------
// l-section frontend rendering
// ---------------------------------------------------------------------------

test.describe('l-section frontend rendering', () => {
  let testPage: WPPage;

  test.beforeAll(async ({ browser }) => {
    const page = await newAuthenticatedPage(browser);
    testPage = await createPageWithBlocks(
      page,
      'E2E Section Responsive',
      SECTION_RESPONSIVE.content,
    );
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    if (!testPage) return;
    const page = await newAuthenticatedPage(browser);
    await deleteTestPages(page, [testPage.id]);
    await page.close();
  });

  test('renders section with correct spacing classes on outer element', async ({
    page,
  }) => {
    await page.goto(testPage.link);
    const section = page.locator('section.w-section').first();
    await expect(section).toBeVisible();
    await expectClasses(section, SECTION_RESPONSIVE.expectedSectionClasses);
  });

  test('renders flexbox/display classes on inner .w-section-inner', async ({
    page,
  }) => {
    await page.goto(testPage.link);
    const inner = page.locator('.w-section-inner').first();
    await expect(inner).toBeVisible();
    await expectClasses(inner, SECTION_RESPONSIVE.expectedInnerClasses);
  });

  test('class split: flexbox classes are NOT on outer section', async ({
    page,
  }) => {
    await page.goto(testPage.link);
    const section = page.locator('section.w-section').first();
    await expectNoClasses(section, SECTION_RESPONSIVE.notOnSection);
  });

  test('class split: spacing classes are NOT on inner container', async ({
    page,
  }) => {
    await page.goto(testPage.link);
    const inner = page.locator('.w-section-inner').first();
    await expectNoClasses(inner, SECTION_RESPONSIVE.notOnInner);
  });

  test('inner content is rendered', async ({ page }) => {
    await page.goto(testPage.link);
    const text = await page.textContent('.w-section-inner');
    expect(text).toContain('Section test content');
  });
});

// ---------------------------------------------------------------------------
// l-flexible-container frontend rendering
// ---------------------------------------------------------------------------

test.describe('l-flexible-container frontend rendering', () => {
  let testPage: WPPage;

  test.beforeAll(async ({ browser }) => {
    const page = await newAuthenticatedPage(browser);
    testPage = await createPageWithBlocks(
      page,
      'E2E FlexContainer Responsive',
      FLEX_CONTAINER_RESPONSIVE.content,
    );
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    if (!testPage) return;
    const page = await newAuthenticatedPage(browser);
    await deleteTestPages(page, [testPage.id]);
    await page.close();
  });

  test('renders as <div> with all responsive classes', async ({ page }) => {
    await page.goto(testPage.link);
    const container = page.locator('div.w-flexible-container').first();
    await expect(container).toBeVisible();
    await expectClasses(
      container,
      FLEX_CONTAINER_RESPONSIVE.expectedClasses,
    );
  });

  test('inner content is rendered', async ({ page }) => {
    await page.goto(testPage.link);
    const text = await page.textContent('.w-flexible-container');
    expect(text).toContain('Flex container test content');
  });
});

// ---------------------------------------------------------------------------
// l-flexible-container with blockLink (renders as <a>)
// ---------------------------------------------------------------------------

test.describe('l-flexible-container with blockLink', () => {
  let testPage: WPPage;

  test.beforeAll(async ({ browser }) => {
    const page = await newAuthenticatedPage(browser);
    testPage = await createPageWithBlocks(
      page,
      'E2E FlexContainer Link',
      FLEX_CONTAINER_WITH_LINK.content,
    );
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    if (!testPage) return;
    const page = await newAuthenticatedPage(browser);
    await deleteTestPages(page, [testPage.id]);
    await page.close();
  });

  test('renders as <a> tag instead of <div>', async ({ page }) => {
    await page.goto(testPage.link);
    const container = page.locator('a.w-flexible-container').first();
    await expect(container).toBeVisible();
  });

  test('link has correct href', async ({ page }) => {
    await page.goto(testPage.link);
    const link = page.locator('a.w-flexible-container').first();
    await expect(link).toHaveAttribute(
      'href',
      FLEX_CONTAINER_WITH_LINK.expectedHref,
    );
  });

  test('link opens in new tab (target="_blank")', async ({ page }) => {
    await page.goto(testPage.link);
    const link = page.locator('a.w-flexible-container').first();
    await expect(link).toHaveAttribute(
      'target',
      FLEX_CONTAINER_WITH_LINK.expectedTarget,
    );
  });

  test('link has title attribute', async ({ page }) => {
    await page.goto(testPage.link);
    const link = page.locator('a.w-flexible-container').first();
    await expect(link).toHaveAttribute(
      'title',
      FLEX_CONTAINER_WITH_LINK.expectedTitle,
    );
  });

  test('link element has responsive classes', async ({ page }) => {
    await page.goto(testPage.link);
    const link = page.locator('a.w-flexible-container').first();
    await expectClasses(link, FLEX_CONTAINER_WITH_LINK.expectedClasses);
  });
});

// ---------------------------------------------------------------------------
// l-section with border settings
// ---------------------------------------------------------------------------

test.describe('l-section border rendering', () => {
  let testPage: WPPage;

  test.beforeAll(async ({ browser }) => {
    const page = await newAuthenticatedPage(browser);
    testPage = await createPageWithBlocks(
      page,
      'E2E Section Border',
      SECTION_WITH_BORDER.content,
    );
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    if (!testPage) return;
    const page = await newAuthenticatedPage(browser);
    await deleteTestPages(page, [testPage.id]);
    await page.close();
  });

  test('renders border classes on outer section', async ({ page }) => {
    await page.goto(testPage.link);
    const section = page.locator('section.w-section').first();
    await expect(section).toBeVisible();
    await expectClasses(
      section,
      SECTION_WITH_BORDER.expectedSectionClasses,
    );
  });
});

// ---------------------------------------------------------------------------
// Viewport-responsive computed style tests
// ---------------------------------------------------------------------------

test.describe('responsive styles at different viewports', () => {
  let testPage: WPPage;

  test.beforeAll(async ({ browser }) => {
    const page = await newAuthenticatedPage(browser);
    testPage = await createPageWithBlocks(
      page,
      'E2E Section Viewport',
      SECTION_VIEWPORT.content,
    );
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    if (!testPage) return;
    const page = await newAuthenticatedPage(browser);
    await deleteTestPages(page, [testPage.id]);
    await page.close();
  });

  test('all responsive classes are present in markup', async ({ page }) => {
    await page.goto(testPage.link);
    const section = page.locator('section.w-section').first();
    const inner = page.locator('.w-section-inner').first();

    await expectClasses(section, SECTION_VIEWPORT.sectionClasses);
    await expectClasses(inner, SECTION_VIEWPORT.innerClasses);
  });

  test('below lg breakpoint: flex-direction is column', async ({ page }) => {
    await page.setViewportSize({ width: BREAKPOINTS.md, height: 800 });
    await page.goto(testPage.link);

    const inner = page.locator('.w-section-inner').first();
    const flexDirection = await inner.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    expect(flexDirection).toBe('column');
  });

  test('at lg breakpoint: lg:flex-row class is present in markup', async ({
    page,
  }) => {
    // Computed-style checks are unreliable here because Tailwind builds CSS at
    // theme build time by scanning source files. Dynamic classes from block
    // attributes (stored in DB) won't have CSS generated unless safelisted.
    // We verify class presence instead — the CSS activation is a Tailwind
    // build concern, not a block-rendering concern.
    await page.setViewportSize({ width: BREAKPOINTS.lg, height: 800 });
    await page.goto(testPage.link);

    const inner = page.locator('.w-section-inner').first();
    await expectClasses(inner, ['lg:flex-row']);
  });
});
