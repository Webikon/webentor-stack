# Editor integration

Expose theme tokens, breakpoints, and custom icons to the editor.

## Provide Tailwind-like config and breakpoints

```ts
import { addFilter } from '@wordpress/hooks';

import webentorConfig, { customTypographyKeys } from '../../webentor-config';

addFilter('webentor.core.twBreakpoints', 'theme/bp', (bps) => {
  for (const key in webentorConfig.theme.screens) {
    if (!bps.includes(key)) bps.push(key);
  }
  return bps;
});

addFilter('webentor.core.twTheme', 'theme/tw', () => webentorConfig.theme);

addFilter('webentor.core.customTypographyKeys', 'theme/typo', () => [
  { key: 'none', name: 'None', value: '', __experimentalHint: 'Inherit' },
  ...customTypographyKeys.map((i) => ({
    key: i.key,
    name: i.key,
    value: i.key,
    __experimentalHint: i.size,
  })),
]);
```

## Customize quick layout presets

Register the preset filter in the same editor bootstrap where you already wire
breakpoints and theme tokens:

```ts
addFilter(
  'webentor.core.responsiveSettings.layoutPresets',
  'theme/responsive/presets',
  (presets, blockName) => {
    if (blockName === 'webentor/l-section') {
      return [
        {
          id: 'content-stack',
          label: 'Content Stack',
          description: 'Vertical flex stack with larger spacing',
          applies: {
            layout: {
              display: { value: { basic: 'flex' } },
            },
            flexbox: {
              'flex-direction': { value: { basic: 'flex-col' } },
              gap: { value: { basic: 'gap-8' } },
            },
          },
        },
      ];
    }

    return presets;
  },
);
```

Return the incoming array with extra items to append presets, or return a brand
new array to fully replace the defaults. If a preset uses `customClasses`, add
those utilities to your theme CSS and safelist them when your build needs it.

## Register custom icons for Icon Picker

```ts
import { registerIcons } from '@10up/block-components';

const svgFiles = import.meta.glob('../../images/svg/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const icons = Object.keys(svgFiles).map((p) => {
  const name = p.split('/').pop().replace('.svg', '');
  return { source: svgFiles[p] as string, name, label: name };
});

registerIcons({ name: 'webentor', label: 'Webentor', icons });
```

## Auto-import block editors

```ts
// resources/scripts/editor.ts
import './blocks-filters/_core-init';
import './blocks-filters/_register-icons';

import.meta.glob('../blocks/**/*.block.{ts,tsx}', { eager: true });
```

