# Webentor Starter Changelog

### 2.1.7

- **WordPress 7.1.** The lock moves from 7.0 to 7.1.2. A Gutenberg packages audit for
  7.0 → 7.1.2 finds no breaking change that touches starter or theme code. A smoke install
  activates all plugins without errors, all 28 Webentor blocks insert and validate in the
  editor, and the front end and REST API respond without PHP notices.
- **Plugin majors.**
  - GTM4WP 2.0 is a rewrite. Options, filters and wp-config constants are unchanged; the
    scroll tracking and weather/geo features are removed.
  - Redis Object Cache 3.0 is mostly fixes. On a site that already uses the drop-in, run
    `wp redis update-dropin`.
  - `composer/installers` moves to 2, as in Bedrock.
- Minor plugin updates: ACF Pro 6.8.10, WP Rocket 3.23.4 (which now pulls in
  `wordpress/mcp-adapter`), WP Migrate DB Pro 2.7.11, Redirection 5.10, WP Mail SMTP 4.9,
  Sentry 8.12 and smaller patches. Dev: PHP_CodeSniffer 4, matching what CI already runs.
- **The maintenance page sends `Retry-After`**, plus `noindex`, a viewport and HTTP/1.1, so
  crawlers treat a deploy as temporary.
- **`LocalValetDriver.php` reads the uploads fallback host from `.env`**
  (`UPLOADS_FALLBACK_URL`) instead of hardcoding the starter's own DEV site. With the key
  unset, missing uploads simply 404 locally.
- **Node 24** for the theme and `webentor-core` (`engines.node >=24.0.0`). The CI starter and
  core jobs and the release job run on Node 24.
- Bump the bundled theme to `2.1.7`; starter and theme now share one version number.
- **Consumer migration:** copy `LocalValetDriver.php` and `web/app/maintenance.php`, then set
  `UPLOADS_FALLBACK_URL` in `.env` (DEV, or production once it exists). Plugin majors are a
  per-site decision in the monthly maintenance pass; the starter only sets what new projects
  start on.

### 2.1.6

- **Fix the legacy Sentry browser DSN fallback.** 2.1.5 named it `SENTRY_DNS_BROWSER`; the
  pre-2.1.5 name every existing project defines is `SENTRY_DSN_JS`, which is now accepted again.
- **Consumer migration:** copy the Sentry block of `config/application.php` by hand; no codemod.

### 2.1.5

- **Sentry configuration is environment-driven.** `config/application.php` accepts
  `WP_SENTRY_PHP_DSN` / `SENTRY_PHP_DSN` and `WP_SENTRY_BROWSER_DSN` / `SENTRY_BROWSER_DSN` (the
  legacy `SENTRY_DSN_PHP` / `SENTRY_DNS_BROWSER` names still work), defines `SENTRY_DISABLED`, and
  makes `WP_SENTRY_ERROR_TYPES` configurable per environment as a bitmask or the `all` / `default` /
  `fatals` presets. The default drops deprecations and notices.
- Verified against WordPress 7.1: every block validates, no editor or frontend deprecations.
  `roots/wordpress` already allows `^7.0`; the lock stays on 7.0.
- Bump the bundled theme to `2.1.5`.
- **Consumer migration:** copy the Sentry block of `config/application.php` by hand; no codemod.

### 2.1.4

- **Gravity Forms moves to the official Composer repository.** The inline `gravityforms/gravityforms`
  package (whose dist URL carried a `{%PLUGIN_GF_KEY%}` placeholder and pinned no version) is
  replaced by `{"type": "composer", "url": "https://composer.gravity.io"}` and
  `gravity/gravityforms: ^3.1`, locked at **3.1.1**. Lock entries now pin the version in the dist
  URL. The `gotoandplay/gravityforms-composer-installer` and `ffraenz/private-composer-installer`
  `allow-plugins` entries existed only to service the inline package and are removed, as is a
  duplicate unscoped `wpackagist.org` repository entry that defeated the scoped one above it.
- Bump the bundled theme to `2.1.4` (GF 3 submit-button markup; see the theme changelog).
- `squizlabs/php_codesniffer` to `3.13.6` — CVE-2026-67434 (OS command injection), dev-only.
- **Consumer migration:** `pnpm dlx @webikon/webentor-codemods run starter-2.1.4` prints the
  composer.json edits and the required `PLUGIN_GF_SITE_URL` env/CI change. The manifest edits are
  structural (repository and `allow-plugins` entries), so they are documented rather than codemoded.

### 2.1.3

- **Ships `.webikon/project.json` (schema v2) in place of `.webentor/project.json`.** The metadata file the maintenance reporter reads moved, and now declares only `schema_version`, `slug`, `stack` and `theme_path` — every version it used to cache is derived from the manifest that owns it. The starter carries no `setup_cli_version` because it ships no `scripts/setup-core`.
- **Consumer migration:** run `init` from a `scripts/setup-core` subtree at `webentor-setup` ≥ 1.2.0, which writes the new file and deletes the old one — `theme_path` in particular is resolved, not guessed. Projects without the subtree create `.webikon/project.json` by hand from the four fields above and delete `.webentor/project.json`.

### 2.1.2

- Bump the bundled theme to `2.1.2` — `@wordpress/*` devDependencies aligned with the versions WP 7.0 actually bundles (they are externalized to `window.wp.*` at runtime), including newly declared `compose`/`data`/`element`/`hooks`/`html-entities` and removal of the unused `@wordpress/dependency-extraction-webpack-plugin`.
- Bump `webentor-core` to `0.15.4` (transparent patch within the existing `^0.15` range: restores inspector-control spacing under WP 7.0's `__nextHasNoMarginBottom` default flip; editor-only, no API change).
- Existing projects can apply the manifest changes via `pnpm dlx @webikon/webentor-codemods run starter-2.1.2`, then `pnpm up @webikon/webentor-core` and `composer update webikon/webentor-core`.

### 2.1.1

- Bump the bundled theme to `2.1.1` — `roots/acorn` to `^6.0` (from `^5.0`), i.e. **Acorn 6 / Laravel 13**.
  - **Requires consumer action on existing sites:** Laravel 13 changes the default cache-prefix / session-cookie / Redis-prefix separators (underscores → hyphens), which **invalidates the object cache and logs out all sessions** unless `CACHE_PREFIX`, `SESSION_COOKIE`, and `REDIS_PREFIX` are pinned in `.env`. Rename the SMTP `MAIL_ENCRYPTION` env var to `MAIL_SCHEME`. Acorn 6 requires PHP `>=8.3` (already the floor).
  - After upgrading, run `composer update` then `wp acorn optimize:clear`.
- Bump `webentor-core` to `0.15.1` (transparent patch within the existing `^0.15` range: focal-point `<source srcset>` fix; no API change for consumers).
- Existing projects can apply the `roots/acorn` bump via `pnpm dlx @webikon/webentor-codemods run starter-2.1.1`; the `.env` changes are a documented manual step in that codemod's README.

### 2.1.0

- Bump `webentor-core` to `^0.15` (from `^0.13`). This pulls in the `0.14.0` and `0.14.1` core releases as well:
  - `0.14.0`: extensible `l-section` background settings + first-class overlay feature (opacity/color), new JS/PHP extension filters, and a fix for the "Hidden" responsive display on sections. Available transparently to consumers via core.
  - `0.14.1`: frontend `wp-i18n` dependency declared on block frontend scripts (fixes a "wp is not defined" error on front-end slider blocks).
  - `0.15.0`: Vite 8 / Rolldown build toolchain.
- **Vite 8 / Rolldown toolchain migration** (requires consumer action):
  - Theme dependency bumps: `vite` `^8`, `@roots/vite-plugin` `^2.2.0`, `@vitejs/plugin-react` `^6`, `laravel-vite-plugin` `^3`, `@webikon/webentor-configs` `^1.1.0`.
  - `vite.config.js`: WordPress externals now come from `@webikon/webentor-configs/vite` (`...wordpressExternals(command)`), and `defineConfig` takes a `({ command }) => ({ … })` function so it can pick the dev vs build externals strategy.
  - `resources/scripts/app.ts`: the static-asset `import.meta.glob(['../images/**', '../fonts/**'])` now needs `{ eager: true, query: '?url', import: 'default' }` — a bare glob no longer emits assets under Rolldown.
- Existing projects can apply the dependency bumps and the `app.ts` change via the `0.15.0` codemod (`pnpm dlx @webikon/webentor-codemods run 0.15.0`); the `vite.config.js` rewrite is a documented manual step in that codemod's README.

### 2.0.7

- WordPress 7.0 / PHP 8.4 compatibility
- Allow `roots/wordpress` `^7.0` (constraint widened to `^6.5 || ^7.0`)
- Bump bundled theme to `2.0.7` (`webentor-core` `^0.13`)
- Editor assets: move editor canvas styles (`editor.css`, `button.style.css`) from `enqueue_block_editor_assets` to `enqueue_block_assets` (`is_admin()` guarded) so WP 7.0's iframed editor styles the canvas correctly.
- Update theme dependencies to the 0.13.0 baseline, including majors `@wordpress/components` 35, `@wordpress/icons` 14, `stylelint` 17 (+ `stylelint-config-recommended` 18), `@types/wordpress__block-editor` 15, `prettier-plugin-tailwindcss` 0.8.
- Existing projects can apply the editor enqueue change **and** the dependency bumps via the `0.13.0` codemod (`pnpm dlx @webikon/webentor-codemods run 0.13.0`).

### 2.0.6

- Bump `webentor-core` to `^0.12`
- Remove manual `require_once WEBENTOR_CORE_PHP_PATH . '/init.php'` from `functions.php` — webentor-core now loads via `WebentorCoreServiceProvider` (Acorn auto-discovery)

### 2.0.5

- Remove Blade directives and View Components from theme (now provided by `webentor-core` ServiceProvider)
- Remove core block `data.php` loading from `ThemeServiceProvider` (now handled by `WebentorCoreServiceProvider`)

### 2.0.4

- Bump `webentor-core` to `^0.10` and `webentor-configs` to `^1.0.2`
- Regenerate theme lock files

### 2.0.3

- Remove `webentor-setup` core scripts from project as they have to be added as git subtree

### 2.0.2

- Fix composer wp-rocket warnings
- Add `webikon/webentor-setup` reworked scripts

### 2.0.1

- Update plugins and WP to 6.8.2
- Update `readme.md`
- Add setup scripts
- Add VSC extensions config
- Replace `yarn` with `pnpm`

### 2.0.0

- Initial Webentor Stack version
- Add Bedrock
- Bake theme into the stack
- Add Dev Containers
