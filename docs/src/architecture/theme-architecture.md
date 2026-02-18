# Theme Architecture

High-level overview of how Webentor Core integrates with a Sage theme.

## Boot flow

- init.php: defines paths and loads Core modules (blocks, images, utils, build glue).
- Block registration: scans `resources/blocks/**/block.json` in theme and Core, registers each block.
- Frontend assets: for each block, matches Vite manifest to add `script.ts` and `style.css` handles, injected into block metadata.
- Server-side rendering: blocks render via Blade views (`resources/blocks/<slug>/view.blade.php`) with computed classes and optional `additional_data`.

## Editor boot

- Theme editor entry (`resources/scripts/editor.ts`) imports Core editor filters/components and auto-imports all `*.block.tsx` files.
- JS filters provide Tailwind-like tokens (`twTheme`), breakpoints, and extend UI (button variants, display settings, icon picker colors).

## Rendering pipeline (frontend)

1. A Gutenberg block is parsed on the server.
2. Core computes wrapper and background classes from attributes and breakpoints.
3. Blade view is selected from theme (override) or Core and rendered.
4. `render_blade_block` filters can post-process the final HTML.

## Categories and patterns

- Adds Webentor block categories (`webentor-blocks`, `webentor-elements`, `webentor-layout`).
- Removes selected core patterns; adds Webentor pattern categories.

## Visibility

- If the Block Visibility plugin is present, Core respects its settings and augments classes when visible.

## Images

- PHP helpers support Cloudinary fetch URLs and `<img>/<picture>` HTML, with graceful fallbacks to WP/BIS.

## Key files

- `webentor-core/app/blocks-init.php` - registration + SSR + categories
- `webentor-core/docs/*` - this documentation
- `resources/scripts/editor.ts` - theme editor entry
