# Webentor Starter Changelog

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
