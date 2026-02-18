# JS / TypeScript API Reference

`@webikon/webentor-core` exports Alpine.js utilities, Gutenberg editor
components, and general-purpose helpers from its `core-js/` package.

## Installation

```bash
pnpm add @webikon/webentor-core
```

## Editor components

These are React components for use inside the Gutenberg block editor.

### `WebentorButton`

A styled button component for use in the editor sidebar or toolbar.

```tsx
import { WebentorButton } from '@webikon/webentor-core';

<WebentorButton onClick={() => doSomething()}>
  Click me
</WebentorButton>
```

---

### `WebentorBlockAppender`

A custom block appender for inserting blocks within a controlled area.

```tsx
import { WebentorBlockAppender } from '@webikon/webentor-core';

<WebentorBlockAppender rootClientId={clientId} />
```

---

### `WebentorTypographyPickerSelect`

A select control that presents available typography presets from global styles.

```tsx
import { WebentorTypographyPickerSelect } from '@webikon/webentor-core';

<WebentorTypographyPickerSelect
  value={attributes.typography}
  onChange={(value) => setAttributes({ typography: value })}
/>
```

---

### `initCustomTypographyFilter`

Call once to register the global typography filter that injects custom
typography classes into block wrapper attributes.

```ts
import { initCustomTypographyFilter } from '@webikon/webentor-core';

initCustomTypographyFilter();
```

---

## Frontend components

### `SliderComponent`

An Alpine.js-compatible slider wrapper built on top of [Swiper](https://swiperjs.com/).

```ts
import { SliderComponent } from '@webikon/webentor-core';

// Register as an Alpine.js component
Alpine.data('slider', SliderComponent);
```

Usage in a Blade template:

```html
<div x-data="slider({ loop: true, autoplay: { delay: 3000 } })">
  <div class="swiper">
    <div class="swiper-wrapper">
      @foreach($slides as $slide)
        <div class="swiper-slide">{{ $slide }}</div>
      @endforeach
    </div>
  </div>
</div>
```

---

### `Swiper`

Re-exported Swiper instance for custom slider implementations.

```ts
import { Swiper } from '@webikon/webentor-core';

const swiper = new Swiper('.my-slider', { loop: true });
```

---

## Utility functions

### `setImmutably()`

Sets a deeply nested value in an object without mutating the original.
Useful for updating Gutenberg block attributes.

```ts
import { setImmutably } from '@webikon/webentor-core';

const updated = setImmutably(attributes, ['display', 'value', 'sm'], 'flex');
setAttributes(updated);
```

---

### `debounce()`

Returns a debounced version of a function.

```ts
import { debounce } from '@webikon/webentor-core';

const handleResize = debounce(() => {
  recalculateLayout();
}, 200);

window.addEventListener('resize', handleResize);
```

---

### `throttle()`

Returns a throttled version of a function.

```ts
import { throttle } from '@webikon/webentor-core';

const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', handleScroll);
```

---

### `camelize()`

Converts a kebab-case or snake_case string to camelCase.

```ts
import { camelize } from '@webikon/webentor-core';

camelize('my-block-name'); // 'myBlockName'
camelize('some_value');    // 'someValue'
```

---

### `isEmpty()`

Checks if a value is empty.

```ts
import { isEmpty } from '@webikon/webentor-core';

isEmpty({}); // true
```

---

### `getColorSlugByColor()`

Finds a color slug by hex/rgb color value.

```ts
import { getColorSlugByColor } from '@webikon/webentor-core';

const slug = getColorSlugByColor(colors, '#0ea5e9');
```

---

### `getColorBySlug()`

Finds a color value by slug.

```ts
import { getColorBySlug } from '@webikon/webentor-core';

const color = getColorBySlug(colors, 'brand');
```

---

## React hooks

### `useBlockParent()`

Returns the current block parent object in the editor context.

```ts
import { useBlockParent } from '@webikon/webentor-core';

const parent = useBlockParent();
```

---

### `usePostTypes()`

Returns post-type options and taxonomy mapping used in query controls.

```ts
import { usePostTypes } from '@webikon/webentor-core';

const { postTypesSelectOptions, postTypesTaxonomiesMap } = usePostTypes();
```

---

### `useTaxonomies()`

Returns taxonomies for a selected post type.

```ts
import { useTaxonomies } from '@webikon/webentor-core';

const taxonomies = useTaxonomies('post');
```

---

## JS filters reference

Use `addFilter` from `@wordpress/hooks`.

```ts
import { addFilter } from '@wordpress/hooks';

addFilter('filter.key', 'your-namespace', (value, ...args) => value);
```

### Theme config

#### `webentor.core.twTheme`

Tailwind-like theme object for editor controls.

```ts
addFilter('webentor.core.twTheme', 'theme/tw', (theme) => ({
  ...theme,
  colors: { ...(theme?.colors || {}), brand: '#0ea5e9' },
}));
```

#### `webentor.core.twBreakpoints`

Responsive breakpoints.

```ts
addFilter('webentor.core.twBreakpoints', 'theme/bp', () => [
  'basic',
  'sm',
  'md',
  'lg',
  'xl',
]);
```

#### `webentor.core.customTypographyKeys`

Options for typography select.

```ts
addFilter('webentor.core.customTypographyKeys', 'theme/typo', () => [
  'h1',
  'h2',
  'eyebrow',
]);
```

### Button component

#### `webentor.core.button.className`

```ts
addFilter(
  'webentor.core.button.className',
  'theme/btn/cn',
  (cn) => `${cn} tracking-wide`,
);
```

#### `webentor.core.button.variants`

```ts
addFilter('webentor.core.button.variants', 'theme/btn/vars', (vars) => [
  ...vars,
  { slug: 'ghost', label: 'Ghost' },
]);
```

#### `webentor.core.button.sizes`

```ts
addFilter('webentor.core.button.sizes', 'theme/btn/sizes', (sizes) => [
  ...sizes,
  { slug: 'xlarge', label: 'XL' },
]);
```

#### `webentor.core.button.extensionComponent`

```tsx
addFilter('webentor.core.button.extensionComponent', 'theme/btn/ext', (extensionComponent, props) => (
  <div className="text-12 mt-2">Extra Button Settings</div>
));
```

#### `webentor.core.button.output`

```tsx
addFilter(
  'webentor.core.button.output',
  'webentor',
  (output, props, buttonClassName) => {
    const attributes = props.attributes;
    const attributeName = props.attributeName;
    const variant = attributes.variant;
    const size = attributes.size;

    return (
      <button
        type="button"
        className={`btn btn--${variant} btn--size-${size} ${buttonClassName ?? ''} wbtr:prevent-hover ${attributes[attributeName]?.showIcon && attributes[attributeName]?.icon?.name ? 'btn--icon' : ''} ${attributes[attributeName]?.iconPosition ? `btn--icon-${attributes[attributeName]?.iconPosition}` : ''} ${!attributes[attributeName]?.showButton ? 'wbtr:opacity-40' : ''}`}
      >
        <span className="btn__text">
          {attributes[attributeName] && attributes[attributeName]?.title
            ? attributes[attributeName]?.title
            : ''}
        </span>

        {attributes[attributeName]?.showIcon &&
          attributes[attributeName]?.icon?.name && (
            <span className="btn__icon svg-icon">
              <Icon10up
                name={attributes[attributeName]?.icon.name}
                iconSet={attributes[attributeName]?.icon.iconSet}
              />
            </span>
          )}
      </button>
    );
  },
);
```

### Icon picker

#### `webentor.core.e-icon-picker.colors`

```ts
addFilter(
  'webentor.core.e-icon-picker.colors',
  'theme/icons/colors',
  (colors) => ({ ...colors, brand: '#0ea5e9' }),
);
```

### Responsive settings (display)

#### `webentor-theme-display-settings`

Extend property options.

```ts
addFilter(
  'webentor-theme-display-settings',
  'theme/display',
  (props, blockName) => [
    ...props,
    {
      label: 'Aspect Ratio',
      name: 'aspect-ratio',
      values: [{ label: '16/9', value: 'aspect-16/9' }],
    },
  ],
);
```

### Block inner controls (per block)

- `<ns>.allowedBlocks` - allowed child blocks
- `<ns>.template` - default InnerBlocks template

```ts
addFilter('webentor.core.l-section.allowedBlocks', 'theme/allow', () => [
  'core/paragraph',
  'core/heading',
  'webentor/l-flexible-container',
]);
addFilter('webentor.core.e-table.template', 'theme/tpl', (tpl) => [
  ['webentor/e-table-row', ['webentor/e-table-cell', 'webentor/e-table-cell']],
]);
```

Blocks exposing these:
`e-picker-query-loop`, `e-post-template`, `e-query-loop`, `l-formatted-content`, `l-section`, `l-flexible-container`, `e-tabs`, `e-table`, `e-table-row`, `e-table-cell`, `e-tab-container`, `e-slider`, `e-accordion`, `e-accordion-group`.

---

## Vite alias

The package exports a Vite path alias `@webentorCore` pointing to the
`core-js/` directory. Add it to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@webentorCore': '/node_modules/@webikon/webentor-core/core-js',
    },
  },
});
```
