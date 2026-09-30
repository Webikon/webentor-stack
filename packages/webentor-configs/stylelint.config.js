/**
 * Shared Stylelint preset for Tailwind v4 + Webentor blocks.
 */
export function createStylelintConfig(overrides = {}) {
  const baseConfig = {
    extends: ['stylelint-config-recommended'],
    rules: {
      'no-descending-specificity': null,
      'no-invalid-position-at-import-rule': null,
      'media-query-no-invalid': [
        true,
        {
          ignoreFunctions: ['theme'],
        },
      ],
      'no-empty-source': null,
      'property-no-deprecated': null,
      'import-notation': null,
      'at-rule-no-unknown': [
        true,
        {
          ignoreAtRules: [
            'theme',
            'source',
            'utility',
            'variant',
            'custom-variant',
            'plugin',
            'apply',
            'reference',
          ],
        },
      ],
      // Newer CSS syntax data (via @csstools) validates @apply preludes as CSS, so every
      // Tailwind class list fails. Keeps recommended's own `media` exception.
      'at-rule-prelude-no-invalid': [
        true,
        {
          ignoreAtRules: [
            'media',
            'theme',
            'source',
            'utility',
            'variant',
            'custom-variant',
            'plugin',
            'apply',
            'reference',
          ],
        },
      ],
      'function-no-unknown': [
        true,
        {
          ignoreFunctions: ['theme'],
        },
      ],
      'at-rule-no-deprecated': [
        true,
        {
          ignoreAtRules: ['apply'],
        },
      ],
      'no-invalid-position-declaration': null,
      'nesting-selector-no-missing-scoping-root': [
        true,
        {
          ignoreAtRules: ['mixin', 'utility'],
        },
      ],
    },
  };

  return {
    ...baseConfig,
    ...overrides,
    rules: {
      ...baseConfig.rules,
      ...(overrides.rules || {}),
    },
  };
}

export default createStylelintConfig();
