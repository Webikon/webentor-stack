# Block authoring

## Structure

- `resources/blocks/<slug>/block.json`
- `resources/blocks/<slug>/<slug>.block.tsx`
- `resources/blocks/<slug>/view.blade.php`
- optional: `style.css`, `script.ts`

Example `block.json`:

```json
{
  "$schema": "../../schemas/webentor-block.json",
  "apiVersion": 3,
  "name": "webentor/my-block",
  "title": "My Block",
  "category": "webentor-elements",
  "supports": { "webentor": { "display": true, "spacing": true } }
}
```

Registration: Core auto-discovers and registers blocks and FE assets.

## Responsive settings

Enable under `supports.webentor` in `block.json`. See [Responsive settings](../concepts/responsive-settings.md).

## Override views in theme

Create `resources/views/blocks/<slug>/view.blade.php` in your theme to replace Core’s Blade view.

## Blade view variables

These variables are passed to each block view:

- `attributes`: block attributes (raw from editor)
- `innerBlocksContent`: rendered HTML of direct children
- `anchor`: HTML id attribute if set
- `block_classes`: computed wrapper classes (from responsive settings etc.)
- `bg_classes`: computed background classes
- `block`: `WP_Block` instance
- `additional_data`: array you can inject via `webentor/block_additional_data`

Example wrapper:

```php
<section class="{{ $block_classes }} {{ $bg_classes }}" {!! $anchor !!}>
  {!! $innerBlocksContent !!}
  {{-- use $additional_data['foo'] if provided via filter --}}
<section>
```

