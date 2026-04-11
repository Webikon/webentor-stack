# Codebase Structure

**Analysis Date:** 2026-04-11

## Directory Layout

```
webentor-stack/
├── .changeset/              # Changesets config (independent versioning)
├── .claude/                 # Claude AI agent config
├── .cursor/                 # Cursor IDE rules and plans
├── .github/
│   └── workflows/           # CI, release, split-mirror, docs deploy
├── .husky/                  # Git hooks (monorepo level)
├── .planning/               # GSD planning documents
├── docs/                    # VitePress documentation site (workspace member)
│   ├── package.json
│   └── src/                 # Documentation content
├── packages/
│   ├── webentor-configs/    # Shared lint/format presets (npm published)
│   ├── webentor-core/       # Core PHP + JS runtime (npm + Composer published)
│   ├── webentor-setup/      # Setup CLI + shell scripts (split-mirrored)
│   └── webentor-starter/    # WordPress project skeleton (split-mirrored)
├── scripts/                 # Monorepo-level release/split scripts
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace definition
├── pnpm-lock.yaml           # Lockfile
└── AGENTS.md                # AI agent instructions
```

## Directory Purposes

**`packages/webentor-core/`:**
- Purpose: Shared PHP and JavaScript runtime for all Webentor projects
- Contains: PHP backend logic, TypeScript/React editor components, Gutenberg block definitions, Blade templates, CSS styles
- Key files:
  - `init.php` - PHP entry point, loads all core modules
  - `app/blocks-init.php` - Block registration and Blade render pipeline
  - `app/blocks-settings.php` - PHP SettingsRegistry for responsive class generation
  - `app/blocks-migration.php` - Block attribute migration utilities
  - `app/setup-core.php` - Core asset enqueuing (editor + frontend)
  - `app/images.php` - Image resize and helper functions
  - `app/utils.php` - PHP utility functions
  - `app/CloudinaryClient.php` - Cloudinary integration
  - `app/i18n.php` - Internationalization setup
  - `app/acf.php` - ACF configuration
  - `core-js/index.ts` - Main JS export (utilities, types)
  - `core-js/config/webentor-config.ts` - Default design token configuration
  - `core-js/blocks-filters/responsive-settings/registry.ts` - JS SettingsRegistry
  - `core-js/blocks-filters/responsive-settings/index.tsx` - Responsive settings filter entry
  - `resources/scripts/editor.ts` - Core editor JS entry point
  - `resources/styles/app.css` - Core frontend CSS entry
  - `resources/styles/editor.css` - Core editor CSS entry
  - `vite.config.js` - Core Vite build config
  - `package.json` - npm package config with exports map
  - `composer.json` - Composer package config
  - `schemas/webentor-block.json` - JSON schema for block.json validation

**`packages/webentor-core/core-js/`:**
- Purpose: TypeScript source for the `@webikon/webentor-core` npm package
- Contains: Exported modules consumed by theme and consumer projects
- Key files:
  - `_alpine.ts` - Alpine.js initialization helpers
  - `_slider.ts` - Swiper slider utilities
  - `_utils.ts` - JS utility functions (debounce, throttle, color helpers, etc.)
  - `blocks-components/` - Reusable React components for block editors (WebentorButton, TypographyPickerSelect, etc.)
  - `blocks-filters/` - WordPress block editor filters (responsive settings, slider settings, wrap-with-container, typography filter)
  - `blocks-filters/responsive-settings/` - Full responsive settings system (registry, panels, setting modules)
  - `blocks-utils/` - React hooks for block editor (useBlockParent, usePostTypes, useTaxonomies)
  - `config/` - Default configuration and safelist builder
  - `types/` - TypeScript type definitions (WebentorConfig, BlockComponents)

**`packages/webentor-core/core-js/blocks-filters/responsive-settings/`:**
- Purpose: Modular responsive settings system for Gutenberg inspector controls
- Contains: Registry, panel wrappers, individual setting modules
- Key subdirectories:
  - `panels/` - Panel wrapper components (SpacingPanel, DisplayLayoutPanel, BorderPanel, BlockLinkPanel)
  - `components/` - Shared UI components (BoxModelControl, ResponsiveTabPanel, LinkedValuesControl, etc.)
  - `settings/spacing/` - Spacing setting module (registration, settings UI, properties)
  - `settings/layout/` - Layout/display setting module
  - `settings/sizing/` - Height/width sizing module
  - `settings/flexbox/` - Flexbox direction/alignment module
  - `settings/flex-item/` - Flex item (grow/shrink/basis) module
  - `settings/grid/` - CSS Grid module
  - `settings/grid-item/` - Grid item (col-span, row-span) module
  - `settings/border/` - Border (width, style, color) module
  - `settings/border/border-radius/` - Border radius module
  - `settings/presets/` - Layout presets module
  - `settings/block-link/` - Block link (anchor wrapper) module
  - `settings/shared/` - Shared value maps (gap-values, layout-values, tw-values)

**`packages/webentor-core/resources/blocks/`:**
- Purpose: Core Gutenberg block definitions
- Contains: One directory per block, each with block.json + .block.tsx + view.blade.php (+ optional data.php, script.ts, style.css)
- Element blocks: `e-accordion/`, `e-accordion-group/`, `e-breadcrumbs/`, `e-button/`, `e-gallery/`, `e-icon-picker/`, `e-image/`, `e-picker-query-loop/`, `e-post-template/`, `e-query-loop/`, `e-slider/`, `e-svg/`, `e-tab-container/`, `e-table/`, `e-table-cell/`, `e-table-row/`, `e-tabs/`
- Layout blocks: `l-404/`, `l-flexible-container/`, `l-footer/`, `l-formatted-content/`, `l-header/`, `l-mobile-nav/`, `l-nav-menu/`, `l-post-card/`, `l-section/`, `l-site-logo/`

**`packages/webentor-core/resources/core-components/`:**
- Purpose: Reusable Blade components with optional script and style
- Contains: `button/button.blade.php`, `slider/slider.blade.php` + `slider.script.ts` + `slider.style.css`

**`packages/webentor-configs/`:**
- Purpose: Shared ESLint, Stylelint, Prettier, PHPCS, and editor configs
- Contains: Config files exported via package.json exports map
- Key files: `eslint.config.js`, `stylelint.config.js`, `prettier.config.js`, `phpcs.xml`, `.bladeformatterrc`, `.editorconfig`

**`packages/webentor-setup/`:**
- Purpose: Development environment setup runtime and CLI
- Contains: Shell scripts for Mac/Windows setup, PHP CLI for project scaffolding
- Key files:
  - `bin/webentor-setup` - CLI binary entry point
  - `src/webentor-setup.php` - PHP CLI (init, upgrade-starter, doctor commands)
  - `setup.sh` - Main setup orchestrator
  - `common.sh` - Common setup steps
  - `mac/mac.sh` - macOS-specific setup
  - `win/win.sh` - Windows-specific setup
  - `hooks.example/` - Example hook scripts
  - `upgrades/` - Upgrade manifest directory

**`packages/webentor-starter/`:**
- Purpose: WordPress project skeleton based on Roots Bedrock
- Contains: Bedrock configuration, WordPress theme, mu-plugins
- Key files:
  - `composer.json` - Root Composer config with all WP plugin dependencies
  - `config/application.php` - Bedrock application config
  - `config/environments/` - Per-environment overrides (development.php, staging.php, production.php)
  - `web/app/mu-plugins/` - Must-use plugins (custom-branding, security, cleanup, debugging, etc.)
  - `.webentor/project.json` - Webentor project metadata (versions, features)

**`packages/webentor-starter/web/app/themes/webentor-theme-v2/`:**
- Purpose: Sage/Acorn-based WordPress block theme (the actual theme)
- Contains: PHP application code, block definitions, Blade views, CSS/JS assets, config
- Key files:
  - `functions.php` - Theme bootstrap (Acorn boot, core init, app file loading)
  - `webentor-config.ts` - Project-specific design token overrides
  - `vite.config.js` - Theme Vite build config
  - `app/setup.php` - Theme setup (asset enqueuing, WP supports, nav menus)
  - `app/blocks.php` - Allowed block types filter (whitelist of core blocks)
  - `app/Fields/` - ACF field group definitions (Footer.php, Header.php, Post.php, ThemeSettings.php)
  - `app/Providers/ThemeServiceProvider.php` - Acorn service provider (loads block data.php files)
  - `app/View/Components/` - Blade component classes (Button.php, Slider.php, DemoComponent.php)
  - `app/View/Composers/` - View composers (Footer.php, Header.php)
  - `app/View/Directives/` - Custom Blade directives (SliderContent, EnqueueScripts, XDebug)
  - `config/view.php` - Blade view paths (theme -> core fallback order)
  - `resources/scripts/editor.ts` - Theme editor entry (imports block filters, auto-discovers blocks)
  - `resources/scripts/app.ts` - Theme frontend entry
  - `resources/scripts/blocks-filters/` - Theme-specific block editor filters
  - `resources/blocks/` - Theme-specific block definitions (b-hero-banner)
  - `resources/core-components/` - Theme overrides for core components (button style)
  - `resources/styles/` - Theme CSS (app.css, editor.css, common/, components/, sections/, templates/, utils/)
  - `resources/views/` - Blade view templates (partials, ui-kit)
  - `templates/` - WordPress block theme HTML templates (index.html, singular.html, 404.html, etc.)
  - `parts/` - WordPress template parts (header.html, footer.html)
  - `patterns/` - Block pattern definitions (PHP files)

**`docs/`:**
- Purpose: VitePress documentation site for the Webentor stack
- Contains: `src/` with Markdown organized by topic (architecture, concepts, guides, reference, recipes, onboarding, upgrading, troubleshooting, contributing)
- Key files: `package.json`, `src/.vitepress/config.ts`, `src/index.md`, `src/compatibility-matrix.md`

**`scripts/`:**
- Purpose: Monorepo-level automation (split-mirror, release validation, version sync)
- Key files: `split-webentor-core.sh`, `split-webentor-setup.sh`, `split-webentor-starter.sh`, `sync-composer-versions.mjs`, `test-release.sh`, `bump-demo.sh`

**`.github/workflows/`:**
- Purpose: CI/CD pipelines
- Key files: `ci.yml` (per-package CI with path filtering), `release.yml` (changesets publish), `split-webentor-core.yml` (tag `core-v*`, also pings Packagist), `split-webentor-setup.yml` (tag `setup-v*`), `split-webentor-starter.yml` (tag `starter-v*`), `docs-deploy.yml`, `demo-bump.yml`

## Key File Locations

**Entry Points:**
- `packages/webentor-core/init.php`: Core PHP bootstrap
- `packages/webentor-starter/web/app/themes/webentor-theme-v2/functions.php`: Theme PHP bootstrap
- `packages/webentor-core/resources/scripts/editor.ts`: Core editor JS entry
- `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/scripts/editor.ts`: Theme editor JS entry
- `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/scripts/app.ts`: Theme frontend JS entry
- `packages/webentor-setup/bin/webentor-setup`: Setup CLI entry

**Configuration:**
- `package.json`: Root monorepo config
- `pnpm-workspace.yaml`: Workspace definition (`packages/*`, `docs`)
- `packages/webentor-core/vite.config.js`: Core Vite build
- `packages/webentor-starter/web/app/themes/webentor-theme-v2/vite.config.js`: Theme Vite build
- `packages/webentor-starter/web/app/themes/webentor-theme-v2/webentor-config.ts`: Design tokens
- `packages/webentor-core/core-js/config/webentor-config.ts`: Default design tokens
- `packages/webentor-starter/web/app/themes/webentor-theme-v2/config/view.php`: Blade view resolution paths
- `packages/webentor-starter/config/application.php`: Bedrock WordPress config

**Core Logic:**
- `packages/webentor-core/app/blocks-init.php`: Block registration and Blade rendering pipeline
- `packages/webentor-core/app/blocks-settings.php`: PHP SettingsRegistry and class generation
- `packages/webentor-core/core-js/blocks-filters/responsive-settings/`: JS responsive settings system
- `packages/webentor-core/app/images.php`: Image processing utilities
- `packages/webentor-setup/src/webentor-setup.php`: Setup CLI logic

**Testing:**
- No test files found. CI validates via linting, building, and shell syntax checks.

## Naming Conventions

**Files:**
- Block directories: kebab-case matching block slug (`e-button/`, `l-section/`, `b-hero-banner/`)
- Block editor components: `{slug}.block.tsx` (e.g., `e-button.block.tsx`)
- Block templates: `view.blade.php` (standard), `data.php` (optional view composer)
- Block metadata: `block.json`
- Block assets: `script.ts`, `style.css`
- PHP files: kebab-case (`blocks-init.php`, `setup-core.php`)
- PHP classes: PascalCase (`CloudinaryClient.php`, `ThemeServiceProvider.php`)
- TypeScript modules: kebab-case or underscore-prefixed for internal modules (`_utils.ts`, `_alpine.ts`)
- CSS partials: underscore-prefixed (`_global.css`, `_typography.css`)
- Shell scripts: kebab-case (`split-webentor-core.sh`)

**Directories:**
- Packages: kebab-case with `webentor-` prefix (`webentor-core/`, `webentor-setup/`)
- Block resources: kebab-case, prefixed by type (`e-*` element, `l-*` layout, `b-*` business)
- PHP namespaces: `Webentor\Core` (core), `App` (theme)

**Block Naming Convention (critical):**
- All blocks use `webentor/` namespace: `webentor/e-button`, `webentor/l-section`
- Prefix `e-` for element blocks (reusable atoms): button, image, accordion, etc.
- Prefix `l-` for layout blocks (structural wrappers): section, header, footer, flexible-container, etc.
- Prefix `b-` for business/project-specific blocks: hero-banner, etc. (defined in theme, not core)

## Where to Add New Code

**New Core Block:**
- Primary code: `packages/webentor-core/resources/blocks/{e|l}-{name}/`
- Required files: `block.json`, `{slug}.block.tsx`, `view.blade.php`
- Optional files: `data.php`, `script.ts`, `style.css`
- Register editor import: Add explicit import in `packages/webentor-core/resources/scripts/editor.ts`
- PHP registration: Automatic via glob in `packages/webentor-core/app/blocks-init.php`

**New Theme Block (in starter):**
- Primary code: `packages/webentor-starter/web/app/themes/webentor-theme-v2/resources/blocks/b-{name}/`
- Required files: `block.json`, `b-{name}.block.tsx`, `view.blade.php`
- Registration: Automatic (editor uses `import.meta.glob`, PHP uses glob)

**New Responsive Setting Module:**
- Implementation: `packages/webentor-core/core-js/blocks-filters/responsive-settings/settings/{name}/`
- Required files: `index.ts`, `registration.ts`, `settings.tsx`, `properties.ts`
- Import registration in appropriate panel or settings index

**New Core Component (Blade):**
- Blade template: `packages/webentor-core/resources/core-components/{name}/{name}.blade.php`
- Optional: `{name}.script.ts`, `{name}.style.css`
- Add Vite entries in `packages/webentor-core/vite.config.js` if script/style needed
- Add enqueue in `packages/webentor-core/app/setup-core.php`

**New View Component (PHP class):**
- Class: `packages/webentor-starter/web/app/themes/webentor-theme-v2/app/View/Components/{Name}.php`
- PSR-4 autoloaded under `App\View\Components`

**New ACF Field Group:**
- Class: `packages/webentor-starter/web/app/themes/webentor-theme-v2/app/Fields/{Name}.php`
- Auto-discovered by ACF Composer

**Utilities:**
- JS: Add to `packages/webentor-core/core-js/_utils.ts` and export from `packages/webentor-core/core-js/index.ts`
- PHP: Add to `packages/webentor-core/app/utils.php` (namespace `Webentor\Core`)

**Documentation:**
- New page: `docs/src/{section}/{page}.md`
- Update sidebar: `docs/src/.vitepress/config.ts`

**New Setup Hook:**
- Create hook script in consumer project's `scripts/hooks/` directory
- Follow patterns from `packages/webentor-setup/hooks.example/`

## Special Directories

**`packages/webentor-core/public/build/`:**
- Purpose: Vite build output for core package
- Generated: Yes (by `vite build`)
- Committed: Yes (needed for Composer-only consumers without Node.js)

**`packages/webentor-starter/.webentor/`:**
- Purpose: Webentor project metadata (version tracking, feature flags)
- Generated: Yes (by `webentor-setup init`)
- Committed: Yes

**`packages/webentor-setup/upgrades/`:**
- Purpose: Migration manifests for cross-version upgrades
- Generated: No (manually authored)
- Committed: Yes

**`.pnpm-store/`:**
- Purpose: pnpm content-addressable package store
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-04-11*
