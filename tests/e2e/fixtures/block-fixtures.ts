/**
 * Serialized block markup with known responsive attribute values.
 * Used by frontend rendering tests to verify correct Tailwind class output.
 *
 * Class generation rules (from blocks-settings.php):
 * - basic breakpoint → no prefix (e.g. "mt-4")
 * - other breakpoints → "{bp}:" prefix (e.g. "lg:mt-8")
 *
 * l-section class split (from data.php):
 * - <section> gets: spacing, sizing.height, sizing.min-height, border, borderRadius, className, colors
 * - .w-section-inner gets: layout.display, flexbox, grid + "container" class
 */

// ---------------------------------------------------------------------------
// l-section
// ---------------------------------------------------------------------------

const sectionAttrs = {
  spacing: {
    'margin-top': { value: { basic: 'mt-4', lg: 'mt-8' } },
    'padding-left': { value: { basic: 'pl-6' } },
  },
  layout: {
    display: { value: { basic: 'flex' } },
  },
  flexbox: {
    'flex-direction': { value: { basic: 'flex-col', lg: 'flex-row' } },
    gap: { value: { basic: 'gap-4' } },
  },
};

export const SECTION_RESPONSIVE = {
  content: `<!-- wp:webentor/l-section ${JSON.stringify(sectionAttrs)} -->
<!-- wp:paragraph --><p>Section test content</p><!-- /wp:paragraph -->
<!-- /wp:webentor/l-section -->`,
  /** Classes expected on the outer <section class="w-section ..."> */
  expectedSectionClasses: ['mt-4', 'lg:mt-8', 'pl-6'],
  /** Classes expected on the inner <div class="w-section-inner ..."> */
  expectedInnerClasses: [
    'flex',
    'flex-col',
    'lg:flex-row',
    'gap-4',
    'container',
  ],
  /** These should NOT be on the outer section (they belong on inner) */
  notOnSection: ['flex-col', 'lg:flex-row', 'gap-4'],
  /** These should NOT be on the inner div (they belong on section) */
  notOnInner: ['mt-4', 'lg:mt-8', 'pl-6'],
};

// ---------------------------------------------------------------------------
// l-flexible-container (without blockLink)
// ---------------------------------------------------------------------------

const flexContainerAttrs = {
  spacing: {
    'padding-top': { value: { basic: 'pt-4', lg: 'pt-8' } },
  },
  layout: {
    display: { value: { basic: 'flex' } },
  },
  flexbox: {
    'flex-direction': { value: { basic: 'flex-row' } },
    gap: { value: { basic: 'gap-2' } },
  },
};

export const FLEX_CONTAINER_RESPONSIVE = {
  content: `<!-- wp:webentor/l-flexible-container ${JSON.stringify(flexContainerAttrs)} -->
<!-- wp:paragraph --><p>Flex container test content</p><!-- /wp:paragraph -->
<!-- /wp:webentor/l-flexible-container -->`,
  /** All classes land on the single .w-flexible-container element */
  expectedClasses: ['pt-4', 'lg:pt-8', 'flex', 'flex-row', 'gap-2'],
  /** Should render as <div>, not <a> */
  expectedTag: 'div',
};

// ---------------------------------------------------------------------------
// l-flexible-container with blockLink → renders as <a>
// ---------------------------------------------------------------------------

const flexContainerWithLinkAttrs = {
  spacing: {
    'padding-top': { value: { basic: 'pt-4' } },
  },
  layout: {
    display: { value: { basic: 'flex' } },
  },
  blockLink: {
    url: 'https://example.com',
    title: 'Test link',
    open_in_new_tab: true,
  },
};

export const FLEX_CONTAINER_WITH_LINK = {
  content: `<!-- wp:webentor/l-flexible-container ${JSON.stringify(flexContainerWithLinkAttrs)} -->
<!-- wp:paragraph --><p>Linked container content</p><!-- /wp:paragraph -->
<!-- /wp:webentor/l-flexible-container -->`,
  expectedClasses: ['pt-4', 'flex'],
  expectedTag: 'a',
  expectedHref: 'https://example.com',
  expectedTarget: '_blank',
  expectedTitle: 'Test link',
};

// ---------------------------------------------------------------------------
// l-section with border settings
// ---------------------------------------------------------------------------

const sectionWithBorderAttrs = {
  spacing: {
    'padding-top': { value: { basic: 'pt-6' } },
  },
  layout: {
    display: { value: { basic: 'flex' } },
  },
  flexbox: {
    'flex-direction': { value: { basic: 'flex-col' } },
  },
  border: {
    border: {
      value: {
        basic: {
          top: { width: '2', style: 'solid', color: 'black' },
          right: { width: '0', style: '', color: '' },
          bottom: { width: '0', style: '', color: '' },
          left: { width: '0', style: '', color: '' },
          linked: false,
        },
      },
    },
    borderRadius: {
      value: {
        basic: {
          topLeft: 'lg',
          topRight: 'lg',
          bottomRight: '',
          bottomLeft: '',
          linked: false,
        },
      },
    },
  },
};

export const SECTION_WITH_BORDER = {
  content: `<!-- wp:webentor/l-section ${JSON.stringify(sectionWithBorderAttrs)} -->
<!-- wp:paragraph --><p>Bordered section content</p><!-- /wp:paragraph -->
<!-- /wp:webentor/l-section -->`,
  /** Border classes on outer <section> */
  expectedSectionClasses: [
    'pt-6',
    'border-t-2',
    'border-t-solid',
    'border-t-black',
    'rounded-tl-lg',
    'rounded-tr-lg',
  ],
};

// ---------------------------------------------------------------------------
// l-section with multiple breakpoints for viewport testing
// ---------------------------------------------------------------------------

const sectionViewportAttrs = {
  layout: {
    display: { value: { basic: 'flex' } },
  },
  flexbox: {
    'flex-direction': { value: { basic: 'flex-col', lg: 'flex-row' } },
    gap: { value: { basic: 'gap-2', lg: 'gap-6' } },
  },
  spacing: {
    'padding-top': { value: { basic: 'pt-4', lg: 'pt-10' } },
  },
};

export const SECTION_VIEWPORT = {
  content: `<!-- wp:webentor/l-section ${JSON.stringify(sectionViewportAttrs)} -->
<!-- wp:paragraph --><p>Viewport test content</p><!-- /wp:paragraph -->
<!-- /wp:webentor/l-section -->`,
  /** Inner div classes for viewport testing */
  innerClasses: ['flex', 'flex-col', 'lg:flex-row', 'gap-2', 'lg:gap-6'],
  sectionClasses: ['pt-4', 'lg:pt-10'],
};

/**
 * Theme breakpoint values from theme.json.
 * Used for viewport resize tests.
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1600,
} as const;
