# Webentor Config

A Tailwind-like theme object used by editor controls. Type is in `core-js/types/_webentor-config.ts`.

## Where it’s used

- Responsive Settings panels (spacing, display, container, border) read sizes/colors from this config.
- Icon Picker uses `theme.colors` for the palette.
- You provide it via JS filter `webentor.core.twTheme`.

## Minimal config example (starter-aligned)

Use a dedicated `webentor-config.ts` file, extend the base config, and then expose `webentorConfig.theme` via filter.

```ts
// webentor-config.ts
// Package must be imported with full path (not alias) to avoid Vite resolution issues.
import baseConfig, {
  buildSafelist,
} from './node_modules/@webikon/webentor-core/core-js/config/webentor-config';

import type { WebentorConfig } from './node_modules/@webikon/webentor-core/core-js/types/_webentor-config';

const webentorConfig: WebentorConfig = {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    // Extend only what your project needs; keep base tokens as the default.
    colors: {
      ...baseConfig.theme.colors,
      brand: 'var(--color-brand)',
      'brand-dark': 'var(--color-brand-dark)',
    },
  },
};

// Optional: used by custom Gutenberg typography controls.
export const customTypographyKeys = [
  { key: 'text-body', size: '16px' },
  { key: 'text-body-l', size: '18/24px' },
];

webentorConfig.safelist = [
  ...customTypographyKeys.map((item) => item.key),
  ...buildSafelist(webentorConfig),
];

export default webentorConfig;
```

```ts
// resources/scripts/blocks-filters/_core-init.tsx
import { addFilter } from '@wordpress/hooks';
import webentorConfig from '../../../webentor-config';

addFilter('webentor.core.twTheme', 'webentor', () => {
  return webentorConfig.theme;
});
```

## Breakpoints

Provide responsive tabs via `webentor.core.twBreakpoints`:

```ts
addFilter('webentor.core.twBreakpoints', 'theme/bp', () => [
  'basic',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
]);
```

## Safelist generation

`webentor-config.ts` builds a Tailwind v4 safelist based on your theme tokens and responsive settings. Make sure classes you expect in SSR (e.g., `pt-8`, `lg:grid-cols-3`, custom typography keys) exist in the safelist. The provided starter config already includes:

- WP color/typography utility classes (`has-*-color`, `has-*-font-size`)
- Responsive spacing, display, sizing, grid, border, radius, object-fit/position
- Custom typography keys from `customTypographyKeys`

