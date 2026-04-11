# Technology Stack

**Analysis Date:** 2026-04-11

## Languages

**Primary:**
- TypeScript 5.9+ - Gutenberg block editor components, settings filters, slider component, utility functions (`packages/webentor-core/core-js/`)
- PHP 8.2+ (core), 8.3+ (starter) - WordPress theme/plugin backend, block rendering, image processing, migration tools (`packages/webentor-core/app/`, `packages/webentor-setup/src/`)

**Secondary:**
- JavaScript (ES Modules) - Vite config, ESLint/Prettier/Stylelint configs, changeset tooling (`packages/webentor-core/vite.config.js`, `packages/webentor-configs/`)
- CSS (Tailwind v4) - Styling via Tailwind utility classes, PostCSS pipeline (`packages/webentor-core/resources/styles/`)
- Blade (Laravel) - Server-side block view templates (`packages/webentor-core/resources/views/`)
- Bash - Setup scripts, CI split scripts, Typesense launcher (`packages/webentor-setup/`, `scripts/`)

## Runtime

**Environment:**
- Node.js >= 20.0.0 (enforced via `engines` in root `package.json` and package-level `package.json` files)
- PHP >= 8.2 (core package), >= 8.3 (starter project)

**Package Managers:**
- pnpm 10.15.1 (JavaScript, managed via `corepack`; lockfile: `pnpm-lock.yaml` at root)
- Composer 2.x (PHP dependencies; lockfiles: `packages/webentor-core/composer.lock`, `packages/webentor-starter/composer.lock`)

## Monorepo Structure

**Workspace Manager:** pnpm workspaces
- Config: `pnpm-workspace.yaml`
- Workspace members: `packages/*` and `docs`

**Versioning & Publishing:** Changesets
- Config: `.changeset/config.json`
- Access: `public` (npm)
- Base branch: `main`
- Changelog: `@changesets/changelog-github`
- Custom version script: `pnpm version-packages` runs `changeset version` then `scripts/sync-composer-versions.mjs` to keep Composer versions in sync

**Packages:**
| Package | npm Name | Composer Name | Version |
|---------|----------|---------------|---------|
| webentor-core | `@webikon/webentor-core` | `webikon/webentor-core` | 0.10.1 |
| webentor-configs | `@webikon/webentor-configs` | N/A | 1.0.2 |
| webentor-setup | N/A | `webikon/webentor-setup` | 1.0.3 |
| webentor-starter | N/A | `webikon/webentor-starter` | 2.0.3 |
| docs | `@webikon/webentor-docs` (private) | N/A | 1.0.0 |

## Frameworks

**Core:**
- WordPress 6.5+ - CMS platform (`packages/webentor-starter/composer.json` requires `roots/wordpress: ^6.5`)
- Roots Bedrock - WordPress boilerplate/project structure (`packages/webentor-starter/`)
- Roots Sage (Blade views) - Templating via `\Roots\view()` in block rendering (`packages/webentor-core/app/blocks-init.php`)
- React 18.3 - Gutenberg block editor UI components (`packages/webentor-core/package.json`)
- Alpine.js 3.15 - Lightweight frontend interactivity (`packages/webentor-core/core-js/_alpine.ts`)
- Tailwind CSS 4.1 - Utility-first CSS framework, deeply integrated into block class generation (`packages/webentor-core/package.json`)

**Build/Dev:**
- Vite 7.2 - JavaScript/CSS bundler (`packages/webentor-core/vite.config.js`)
- `@kucrut/vite-for-wp` 0.12 - Vite integration with WordPress asset enqueuing (`packages/webentor-core/vite.config.js`)
- `@vitejs/plugin-react` 5.1 - React JSX support (classic runtime) (`packages/webentor-core/vite.config.js`)
- `@tailwindcss/vite` 4.1 - Tailwind v4 Vite plugin (`packages/webentor-core/vite.config.js`)
- `@tailwindcss/postcss` 4.1 - PostCSS integration for Tailwind (`packages/webentor-core/postcss.config.js`)
- postcss-pxtorem 6.1 - Converts px to rem for font, spacing properties (`packages/webentor-core/postcss.config.js`)
- VitePress 1.6 - Documentation site generator (`docs/package.json`)

**Linting/Formatting:**
- ESLint 9 - JS/TS linting with TypeScript-ESLint, React plugin, Prettier integration (`packages/webentor-configs/eslint.config.js`)
- Stylelint 16 - CSS linting with Tailwind v4 at-rule support (`packages/webentor-configs/stylelint.config.js`)
- Prettier 3.7 - Code formatting with Blade, Tailwind class sorting, import sorting (`packages/webentor-configs/prettier.config.js`)
- PHP_CodeSniffer - PHP linting (`packages/webentor-core/phpcs.xml`, `packages/webentor-starter/phpcs.xml`)
- GrumPHP 1.4 - Git pre-commit PHP checks (`packages/webentor-starter/grumphp.yml`)

**Testing:**
- Not detected at monorepo level (no test framework config found)

## Key Dependencies

**Critical (Runtime):**
- `alpinejs` ^3.15.2 + `@alpinejs/collapse` ^3.15.2 - Frontend interactivity framework (`packages/webentor-core/core-js/_alpine.ts`)
- `swiper` ^12.0.3 - Slider/carousel component (`packages/webentor-core/core-js/_slider.ts`)
- `@wordpress/blocks` ^15.9.0 - Gutenberg block registration API
- `@wordpress/block-editor` ^14.21.2 (types) / ^15.9.0 - Block editor components
- `@wordpress/components` ^30.9.0 - WordPress UI component library
- `@wordpress/i18n` ^6.9.0 - Internationalization
- `@10up/block-components` ^1.21.4 - Enhanced Gutenberg block components

**Critical (PHP):**
- `roots/wordpress` ^6.5 - WordPress core
- `roots/bedrock-autoloader` ^1.0 - MU-plugin autoloader
- `wpengine/advanced-custom-fields-pro` ^6.3 - Custom fields (ACF Pro)
- `kucrut/vite-for-wp` ^0.11.6 - PHP-side Vite manifest resolution
- `vlucas/phpdotenv` ^5.5 - Environment variable loading
- `illuminate/support` (via Sage) - Laravel facades used in core PHP (`Illuminate\Support\Facades\File`, `Illuminate\Support\Str`)

**Infrastructure:**
- `husky` ^9.1.7 - Git hooks management (root + core package)
- `lint-staged` ^16.2.7 - Run linters on staged files (`packages/webentor-core/package.json`)
- `@changesets/cli` ^2.29.7 - Monorepo version management
- `patch-package` ^8.0.1 - Patch npm dependencies post-install

## Configuration

**Environment:**
- Bedrock-style `.env` files at project root (loaded via `vlucas/phpdotenv`)
- `.env.local` overrides `.env` when present
- Environment-specific PHP config: `packages/webentor-starter/config/environments/{development,staging,production}.php`
- Setup config: `scripts/.env.setup` (generated by `webentor-setup init`)

**Key Environment Variables (by name, not value):**
- `WP_ENV` - Environment name (development/staging/production)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` - Database connection
- `DATABASE_URL` - Alternative DSN-style DB connection
- `REDIS_HOST`, `REDIS_PORT`, `WP_REDIS_DISABLED` - Redis cache
- `SENTRY_DSN_PHP`, `SENTRY_DSN_JS` - Sentry error tracking
- `WP_ROCKET_KEY`, `WP_ROCKET_EMAIL` - WP Rocket license
- `CLOUDINARY_CLOUD_NAME` - Cloudinary image CDN
- `WP_IMAGES_REWRITE_HOME` - Image URL rewriting for localhost
- `DOMAIN_CURRENT_SITE` - WordPress multisite domain

**Build:**
- Vite config: `packages/webentor-core/vite.config.js`
- TypeScript config: `packages/webentor-core/tsconfig.json`
- PostCSS config: `packages/webentor-core/postcss.config.js`
- Path aliases defined in both Vite and tsconfig:
  - `@scripts` -> `/resources/scripts`
  - `@styles` -> `/resources/styles`
  - `@fonts` -> `/resources/fonts`
  - `@images` -> `/resources/images`
  - `@blocks` -> `/resources/blocks`
  - `@webentorCore` -> `/core-js`

## Platform Requirements

**Development:**
- macOS or Linux (bash scripts in setup package)
- Node.js >= 20 with corepack for pnpm
- PHP >= 8.3 with Composer
- Local WordPress environment (Laravel Herd suggested via `packages/webentor-starter/herd.yml`)
- Optional: Docker for Typesense search
- Optional: 1Password CLI for env secrets (`op` command)
- Optional: WP-CLI for database operations and migrations

**Production:**
- PHP >= 8.3
- MySQL/MariaDB
- Redis (optional, for object caching)
- WordPress 6.5+
- Composer autoload

**CI:**
- GitHub Actions (Ubuntu runners)
- Node.js 20, PHP 8.3
- pnpm via corepack
- Path-filtered jobs per package

---

*Stack analysis: 2026-04-11*
