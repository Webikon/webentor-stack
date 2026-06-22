# Webentor Configs Changelog

## 1.1.0

- Add `@webikon/webentor-configs/vite` export with `wordpressExternals(command)` — the shared
  WordPress externals interop for the Vite 8 / Rolldown toolchain. Picks the right strategy per
  command: roots `wordpressPlugin()` + React/CJS-require interop shims for `build`, kucrut
  `wp_scripts()` for the dev server (`serve`). Replaces the per-config copy of these shims in
  webentor-core and the theme.
- Add `vite`, `@roots/vite-plugin`, `@vitejs/plugin-react`, `@kucrut/vite-for-wp` as optional
  peer dependencies (only required when using the `./vite` export).

## 1.0.2

- Add `@webikon/webentor-core` to Prettier

## 1.0.1

- Fix Prettier import order

## 1.0.0

- Added shared ESLint, Stylelint, and Prettier presets.
- Added static references for PHPCS, Blade formatter, and EditorConfig.
- Added npm export contract for direct import by starter/core projects.
