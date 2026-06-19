# Webentor Starter Changelog

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
