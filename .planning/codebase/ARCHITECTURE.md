# Architecture

**Analysis Date:** 2026-04-11

## Pattern Overview

**Overall:** pnpm monorepo with independently versioned packages, following a WordPress block-based theme architecture built on Roots Bedrock + Sage/Acorn patterns.

**Key Characteristics:**
- Four publishable packages plus a VitePress docs site, all managed in a single pnpm workspace
- Dual-language runtime: PHP (WordPress backend, Blade templating, block registration) + TypeScript/React (Gutenberg editor, block edit components, responsive settings system)
- Split-mirror release model: `webentor-core`, `webentor-setup`, and `webentor-starter` are mirrored to standalone Git repos via GitHub Actions for consumption as Composer/npm packages
- Registry-based extensibility: both JS and PHP sides use a SettingsRegistry pattern for responsive block settings

## Layers

**Configuration Layer (`webentor-configs`):**
- Purpose: Shared ESLint, Stylelint, Prettier, PHPCS, and editorconfig presets consumed by all packages and consumer projects
- Location: `packages/webentor-configs/`
- Contains: `eslint.config.js`, `stylelint.config.js`, `prettier.config.js`, `phpcs.xml`, `.bladeformatterrc`, `.editorconfig`
- Depends on: ESLint, Stylelint, Prettier peer dependencies
- Used by: `webentor-core`, `webentor-starter` theme (via `@webikon/webentor-configs` npm package)

**Core Runtime Layer (`webentor-core`):**
- Purpose: Shared PHP + JS runtime for all Webentor projects. Provides block registration, responsive settings, utility functions, editor filters, and reusable Gutenberg blocks
- Location: `packages/webentor-core/`
- Contains: PHP initialization (`init.php`, `app/`), TypeScript/React block editor code (`core-js/`), block definitions with Blade templates (`resources/blocks/`), shared Blade components (`resources/core-components/`, `resources/views/`), CSS styles (`resources/styles/`)
- Depends on: `kucrut/vite-for-wp` (PHP), `@wordpress/*` packages, React, TailwindCSS, Alpine.js, Swiper
- Used by: `webentor-starter` theme (via Composer `webikon/webentor-core` and npm `@webikon/webentor-core`)

**Setup Layer (`webentor-setup`):**
- Purpose: CLI tool and shell scripts for local development environment setup, project scaffolding, and upgrade management
- Location: `packages/webentor-setup/`
- Contains: PHP CLI (`src/webentor-setup.php`, `bin/webentor-setup`), shell scripts (`setup.sh`, `common.sh`, `env-check.sh`), platform-specific scripts (`mac/`, `win/`), hook examples (`hooks.example/`), upgrade manifests (`upgrades/`)
- Depends on: PHP >=8.2, bash
- Used by: Consumer projects via `git subtree add` into `scripts/setup-core/`

**Starter Layer (`webentor-starter`):**
- Purpose: Complete WordPress project skeleton (Bedrock-based) with a pre-configured Sage/Acorn theme
- Location: `packages/webentor-starter/`
- Contains: Bedrock root (`config/`, `web/`), WordPress theme (`web/app/themes/webentor-theme-v2/`), mu-plugins (`web/app/mu-plugins/`)
- Depends on: `webentor-core` (Composer + npm), `webentor-configs` (npm), Roots Acorn/Sage, ACF Pro, many WP plugins
- Used by: New consumer projects clone or fork this skeleton

**Documentation Layer (`docs`):**
- Purpose: VitePress-powered documentation site for the entire Webentor stack
- Location: `docs/`
- Contains: Markdown content (`docs/src/`), VitePress config (`docs/src/.vitepress/`)
- Depends on: VitePress
- Used by: Developers and AI agents

## Data Flow

**Block Registration (PHP side):**

1. Theme `functions.php` (`packages/webentor-starter/web/app/themes/webentor-theme-v2/functions.php`) loads Acorn, bootstraps theme files, then requires `webentor-core/init.php`
2. `init.php` (`packages/webentor-core/init.php`) defines path constants and requires all `app/*.php` files
3. `blocks-init.php` (`packages/webentor-core/app/blocks-init.php`) on `init` hook: globs for `block.json` files in both theme (`resources/blocks/`) and core (`WEBENTOR_CORE_RESOURCES_PATH/blocks/`), registers each via `register_block_type_from_metadata()` with a Blade render callback
4. Theme blocks registered first; core blocks skip duplicates (child theme override mechanism)
5. `register_frontend_blocks_assets()` also registers per-block `script.ts` and `style.css` via Vite manifest

**Block Rendering (PHP side):**

1. WordPress invokes `render_callback` for each `webentor/*` block
2. `render_block_blade()` (`packages/webentor-core/app/blocks-init.php`) recursively renders inner blocks
3. `prepareBlockClassesFromSettings()` (`packages/webentor-core/app/blocks-settings.php`) iterates the PHP `SettingsRegistry` to generate Tailwind utility classes from responsive attributes
4. Blade views (`resources/blocks/{slug}/view.blade.php`) receive `$attributes`, `$block_classes`, `$innerBlocksContent`, `$custom_classes`, etc.
5. `data.php` files (optional, loaded by `ThemeServiceProvider`) act as View Composers, enriching block data before rendering

**Block Editor (JS side):**

1. Core editor entry: `packages/webentor-core/resources/scripts/editor.ts` imports all core block `.block.tsx` files explicitly
2. Theme editor entry: `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/scripts/editor.ts` uses `import.meta.glob('../blocks/**/*.block.{ts,tsx}', { eager: true })` for dynamic theme block discovery, plus imports core init and icon registration
3. Each `.block.tsx` calls `registerBlockType(block, { edit, save })` with block.json metadata
4. Responsive settings inject into block inspector via WordPress filters (BlockEdit filter), reading `supports.webentor.*` from block.json to determine which panels to show
5. JS `SettingsRegistry` (`packages/webentor-core/core-js/blocks-filters/responsive-settings/registry.ts`) mirrors PHP registry: each setting module (spacing, layout, flexbox, etc.) self-registers and provides both a UI component and class generation logic

**Asset Pipeline:**

1. Vite is the build tool for both core and theme, configured via `@kucrut/vite-for-wp`
2. Core Vite config: `packages/webentor-core/vite.config.js` - builds editor JS/CSS, app CSS, core components, and per-block assets
3. Theme Vite config: `packages/webentor-starter/web/app/themes/webentor-theme-v2/vite.config.js` - builds theme editor/app JS/CSS, core-component overrides, and per-block assets
4. TailwindCSS v4 with `@tailwindcss/vite` plugin; responsive settings generate a safelist JSON file at build time for dynamic Tailwind classes
5. `@roots/vite-plugin` `wordpressThemeJson` generates `theme.json` from Tailwind config in the theme build

**State Management:**
- Block state is stored in WordPress block attributes (serialized in post content)
- Responsive settings are stored as nested objects in block attributes, keyed by breakpoint (e.g. `{ "basic": "pt-10", "lg": "pt-20" }`)
- No client-side state management library; Alpine.js handles frontend interactivity
- `webentor-config.ts` defines the design token system (colors, spacing, breakpoints) shared between JS config and CSS

## Key Abstractions

**Block Definition (block triad):**
- Purpose: Each Gutenberg block is defined by three co-located files
- Pattern: `block.json` (metadata/attributes/supports), `{slug}.block.tsx` (editor React component), `view.blade.php` (frontend Blade template)
- Optional: `data.php` (server-side data enrichment), `script.ts` (frontend JS), `style.css` (block-specific CSS)
- Core examples: `packages/webentor-core/resources/blocks/e-button/`, `packages/webentor-core/resources/blocks/l-section/`
- Theme examples: `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/blocks/b-hero-banner/`

**Block Naming Convention:**
- `e-*` = Element blocks (atomic: button, image, accordion, svg, etc.)
- `l-*` = Layout blocks (structural: section, header, footer, flexible-container, etc.)
- `b-*` = Business/project blocks (project-specific: hero-banner, etc., defined in theme)

**SettingsRegistry (JS):**
- Purpose: Extensible registry for responsive Gutenberg inspector settings (spacing, layout, sizing, flexbox, grid, border, etc.)
- Location: `packages/webentor-core/core-js/blocks-filters/responsive-settings/registry.ts`
- Pattern: Each setting module has `index.ts`, `registration.ts` (side-effect self-register), `settings.tsx` (UI component), `properties.ts` (class generation). Settings are grouped by `panelGroup` for panel rendering.

**SettingsRegistry (PHP):**
- Purpose: PHP mirror of JS registry for server-side class generation from responsive attributes
- Location: `packages/webentor-core/app/blocks-settings.php` (class `Webentor\Core\SettingsRegistry`)
- Pattern: Same `register()` / `generateClasses()` API but generates CSS class strings from stored attributes during render

**WebentorConfig:**
- Purpose: Centralized design token configuration (colors, spacing, breakpoints, typography, border, grid, etc.)
- Core default: `packages/webentor-core/core-js/config/webentor-config.ts`
- Theme override: `packages/webentor-starter/web/app/themes/webentor-theme-v2/webentor-config.ts`
- Pattern: Theme imports `webentorDefaultConfig` and extends it; `buildSafelist()` generates TailwindCSS safelist for dynamic responsive classes

**Blade Components:**
- Purpose: Reusable UI components rendered server-side via Laravel Blade (through Acorn)
- Core: `packages/webentor-core/resources/views/components/` (accordion, breadcrumbs, card, post-card, etc.)
- Core components: `packages/webentor-core/resources/core-components/` (button, slider - with Blade template + optional script + style)
- Theme overrides: `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/core-components/` and `app/View/Components/`
- View resolution order defined in `config/view.php`: theme first, then core (allows override)

## Entry Points

**PHP Entry (`functions.php`):**
- Location: `packages/webentor-starter/web/app/themes/webentor-theme-v2/functions.php`
- Triggers: WordPress theme activation
- Responsibilities: Defines `WEBENTOR_CORE_PHP_PATH`, loads Composer autoloader, boots Acorn application with `ThemeServiceProvider`, loads theme app files (`acf.php`, `blocks.php`, `cpts-tax.php`, `custom.php`, `forms.php`, `setup.php`, `wp-menu.php`), requires `webentor-core/init.php`

**Core PHP Init:**
- Location: `packages/webentor-core/init.php`
- Triggers: Required from theme `functions.php`
- Responsibilities: Defines core path constants, loads Composer autoload if present, requires all `app/*.php` files

**Theme Editor JS:**
- Location: `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/scripts/editor.ts`
- Triggers: Enqueued on `enqueue_block_editor_assets` hook
- Responsibilities: Imports theme block-filter init, icon registration, and auto-discovers theme blocks via `import.meta.glob`

**Core Editor JS:**
- Location: `packages/webentor-core/resources/scripts/editor.ts`
- Triggers: Enqueued on `enqueue_block_editor_assets` hook (priority 5)
- Responsibilities: Imports core block-editor filters (`_wrap-with-container`), explicitly imports all core block `.block.tsx` files

**Theme Frontend JS:**
- Location: `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/scripts/app.ts`
- Triggers: Enqueued on `wp_enqueue_scripts` hook
- Responsibilities: Frontend Alpine.js setup, header behavior, lightbox initialization

**Setup CLI:**
- Location: `packages/webentor-setup/bin/webentor-setup` (symlink to `src/webentor-setup.php`)
- Triggers: Manual invocation from consumer project
- Responsibilities: Project scaffolding (`init`), starter upgrades (`upgrade-starter`), environment diagnostics (`doctor`)

## Error Handling

**Strategy:** Minimal explicit error handling; relies on WordPress and PHP error mechanisms

**Patterns:**
- Block rendering: `render_block_blade()` falls back to `$block->render()` if no Blade view exists, providing graceful degradation
- Block registration: `register_block_from_filename()` checks `WP_Block_Type_Registry` to skip already-registered blocks (prevents duplicate registration crashes)
- Template loading: `functions.php` calls `wp_die()` if required app files are missing
- Setup CLI: Uses `fwrite(STDERR, ...)` and `exit(1)` for error conditions; shell scripts use `set -eE` with trap for error handling

## Cross-Cutting Concerns

**Logging:** Console/browser dev tools for JS; PHP relies on WordPress `WP_DEBUG` and `WP_DEBUG_LOG`. Tracy debugger available in development (starter dev dependency).

**Validation:** Block attributes validated by WordPress block API via `block.json` schema. PHP side uses type hints. No runtime validation library.

**Authentication:** Not applicable at the framework level; authentication is handled by WordPress core and plugins in consumer projects.

**Internationalization:** `wp_i18n` for JS, `load_theme_textdomain()` for PHP. Text domain: `webentor`. Translation files in `resources/languages/`. WP-CLI `i18n` commands for POT/PO/MO/JSON generation.

**CSS Architecture:** TailwindCSS v4 utility-first approach with `wbtr:` prefix used in Blade templates for core classes. Design tokens defined in `webentor-config.ts` and mapped to CSS custom properties. Responsive settings generate breakpoint-prefixed Tailwind classes dynamically.

---

*Architecture analysis: 2026-04-11*
