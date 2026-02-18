# Assets & Build

Understand how assets are discovered, built, and enqueued.

## Tooling

- Vite 7 + React plugin + Tailwind v4.
- `@kucrut/vite-for-wp` provides WP-friendly manifest + helper functions.
- `wp_scripts()` maps WordPress externals (so React, etc., come from WP in editor).

## Entries (vite.config.js)

- Core: `resources/scripts/editor.ts`, `resources/styles/editor.css`, `resources/styles/app.css`.
- Core components: slider JS/CSS under `resources/core-components/slider/*`.
- Blocks: automatically picked up
  - `resources/blocks/**/style.css`
  - `resources/blocks/**/script.ts`

## Commands

- `pnpm dev` (HMR dev server)
- `pnpm build` (outputs `public/build` + `manifest.json`)

## How assets get to WP (PHP)

- Editor
  - JS: `webentor-core-editor-js` (deps: `react`, `react-dom`, plus generated deps)
  - CSS: `webentor-core-editor-styles`
- Frontend
  - CSS: `webentor-core-app-styles`
  - Slider: `webentor-core-slider-scripts` and `webentor-core-slider-styles`

## Block assets glue

- PHP scans block folders and registers FE `script.ts` + `style.css` by matching Vite manifest.
- Handles get injected into block metadata so WordPress auto-enqueues them on the frontend.

## Aliases

Use friendly imports in TS/TSX:

```ts
import '@blocks/e-button/e-button.block';

import { WebentorButton } from '@webentorCore/blocks-components';
```

## Theme editor bootstrap

Your theme should load an editor entry that registers filters, custom icons, and auto-imports blocks:

```ts
// resources/scripts/editor.ts
import './blocks-filters/_core-init';
import './blocks-filters/_register-icons';

import.meta.glob('../blocks/**/*.block.{ts,tsx}', { eager: true });
```

## Icons folder convention

Put SVGs under `resources/images/svg/*.svg` and register via `_register-icons.ts` so the `e-icon-picker` sees them.


