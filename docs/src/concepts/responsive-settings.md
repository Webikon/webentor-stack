# Responsive settings

How block attributes map to Tailwind-like classes on the frontend and in the editor.

## Enable per block

In `block.json`:

```json
{
  "supports": {
    "webentor": {
      "layout": true,
      "spacing": true
    }
  }
}
```

Here is the schema of `supports.webentor` in a scan-friendly format:

| Property | Type | Description |
| --- | --- | --- |
| `spacing` | `boolean` | Enables Spacing controls (padding and margin). |
| `layout` | `boolean \| object` | `true` enables display mode controls. Use an object for granular control flags. |
| `sizing` | `boolean \| object` | `true` enables sizing controls. Use an object for granular width and height flags. |
| `grid` | `boolean` | Enables Grid controls. |
| `gridItem` | `boolean` | Enables Grid Item controls. |
| `flexbox` | `boolean` | Enables Flex controls. |
| `flexItem` | `boolean` | Enables Flex Item controls. |
| `border` | `boolean` | Enables Border controls. |
| `borderRadius` | `boolean` | Enables Border Radius controls. |
| `blockLink` | `boolean` | Enables Block Link controls. |
| `presets` | `boolean` | Enables the quick layout preset buttons. |

When `layout` is an object, use these properties:

| Property | Type | Description |
| --- | --- | --- |
| `display` | `boolean` | Shows display controls (e.g., `none`, `block`, `flex`, `grid`). |

When `sizing` is an object, use these properties:

| Property | Type | Description |
| --- | --- | --- |
| `width` | `boolean` | Shows width controls. |
| `minWidth` | `boolean` | Shows `min-width` controls. |
| `maxWidth` | `boolean` | Shows `max-width` controls. |
| `height` | `boolean` | Shows height controls. |
| `minHeight` | `boolean` | Shows `min-height` controls. |
| `maxHeight` | `boolean` | Shows `max-height` controls. |


## Breakpoints

Editor tabs are driven by `webentor.core.twBreakpoints` (default: `basic, sm, md, lg, xl, 2xl`). Classes are emitted with prefixes (`sm:pt-4`, `lg:grid-cols-3`).

## Theme tokens

Tokens come from `webentor.core.twTheme` (colors, spacing, radii, sizes). Ensure your `webentor-config.ts` safelists generated classes.

## Quick layout presets

Themes can customize the preset catalog in editor JS with
`webentor.core.responsiveSettings.layoutPresets`. The filter receives the default
preset array, the current `blockName`, and the resolved theme tokens, so you
can append presets, replace the defaults entirely, or scope presets per block.

If you opt into `supports.webentor.presets`, the block gets the preset buttons
even when it does not expose the rest of the layout controls. Any
`customClasses` returned by a preset must exist in frontend CSS.

## Rendering

On render, Core computes:

- `block_classes` – outer/wrapper classes (layout, spacing, display)
- `bg_classes` – background-related classes

These are passed to Blade views and can be filtered via:

- `webentor/block_classes(string $classes, WP_Block $block)`
- `webentor/block_bg_classes(string $classes, WP_Block $block)`

## Tips

- Provide only the property groups you need per block to keep UI focused.
- Large class surfaces: rely on safelist generation in `webentor-config.ts`.
- Combine with recipes like [hero banner](../recipes/hero-banner.md).
