# Webentor Starter Changelog

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
