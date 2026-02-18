# Core JS Components

Import from `@webentorCore/blocks-components`.

## WebentorButton

A configurable button settings UI for block editors.

Props:

- `attributes`, `setAttributes`, `attributeName`
- Optional: `placement`, `className`, `innerClassName`, `hideVariant`, `hideSize`, `hideLink`

Usage:

```tsx
<WebentorButton
  attributes={attributes}
  setAttributes={setAttributes}
  attributeName="button"
/>
```

Filters:

- `webentor.core.button.className`
- `webentor.core.button.variants`
- `webentor.core.button.sizes`
- `webentor.core.button.extensionComponent`

## WebentorBlockAppender

Pretty InnerBlocks appender for complex layouts.

```tsx
<WebentorBlockAppender
  rootClientId={clientId}
  text={__('Add rows', 'webentor')}
/>
```

## WebentorTypographyPickerSelect

Select for Custom Typography.

```tsx
<WebentorTypographyPickerSelect
  value={attributes.customTypography}
  onChange={(v) => setAttributes({ customTypography: v })}
/>
```

### Feeding options from theme config

Provide keys via filter to match your `webentor-config.ts`:

```ts
import { addFilter } from '@wordpress/hooks';
import { customTypographyKeys } from 'webentor-config';

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

