# Responsive settings

How block attributes map to Tailwind-like classes on the frontend and in the editor.

## Enable per block

In `block.json`:

```json
{
  "supports": {
    "webentor": {
      "display": true,
      "spacing": true
    }
  }
}
```

Here is the schema of `supports.webentor` in a scan-friendly format:

| Property | Type | Description |
| --- | --- | --- |
| `spacing` | `boolean` | Enables Spacing controls (padding and margin). |
| `display` | `boolean \| object` | `true` enables all Display controls. Use an object for granular control flags. |
| `grid` | `boolean` | Enables Grid controls. |
| `gridItem` | `boolean` | Enables Grid Item controls. |
| `flexbox` | `boolean` | Enables Flex controls. |
| `flexboxItem` | `boolean` | Enables Flex Item controls. |
| `blockLink` | `boolean` | Enables Block Link controls. |

When `display` is an object, use these properties:

| Property | Type | Description |
| --- | --- | --- |
| `display` | `boolean` | Shows display controls (e.g., `none`, `block`, `flex`, `grid`). |
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
