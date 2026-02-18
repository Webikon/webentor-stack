/**
 * Shared Prettier preset. Consumers can pass `tailwindStylesheet` and
 * `importOrder` without duplicating the full default object.
 */
export function createPrettierConfig(overrides = {}) {
  const baseConfig = {
    plugins: [
      '@shufo/prettier-plugin-blade',
      '@ianvs/prettier-plugin-sort-imports',
      'prettier-plugin-tailwindcss',
    ],
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
    wrapAttributes: 'force-expand-multiline',
    sortTailwindcssClasses: true,
    sortHtmlAttributes: 'none',
    noPhpSyntaxCheck: false,
    overrides: [
      {
        files: ['*.blade.php'],
        options: {
          tabWidth: 2,
          parser: 'blade',
        },
      },
    ],
    importOrder: [
      '^react',
      '<THIRD_PARTY_MODULES>',
      '',
      '^[.]',
      '',
      '<TYPES>^[.]',
      '<TYPES>',
      '',
      '^(?!.*[.]css$)[./].*$',
      '.css$',
    ],
  };

  // Deep-merge the `overrides` array so consumers can add per-file settings
  // without accidentally wiping the built-in blade.php config.
  const mergedOverrides = [
    ...baseConfig.overrides,
    ...(overrides.overrides || []),
  ];

  return {
    ...baseConfig,
    ...overrides,
    overrides: mergedOverrides,
  };
}

export default createPrettierConfig();
