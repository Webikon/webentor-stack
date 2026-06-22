### Version 2.0.7

- Bump `webentor-core` to `^0.13` (WordPress 7.0 / PHP 8.4 block-editor deprecation fixes).
- Enqueue theme block-editor styles on `enqueue_block_assets` (guarded by `is_admin()`) instead of `enqueue_block_editor_assets`, so WordPress routes them into the editor iframe correctly (fixes "added to the iframe incorrectly" on WP 7.0). Styles remain off the public frontend.
- Update `@wordpress/*` dev dependencies to latest stable (block-editor/blocks 15.21, components 35, block-library 9.48, i18n 6.21, icons 14, dependency-extraction 6.48), `@10up/block-components` 1.22.2, `@alpinejs/intersect` 3.15.12.
- Update dev tooling, including majors: `stylelint` 17 + `stylelint-config-recommended` 18, `@types/wordpress__block-editor` 15, `prettier-plugin-tailwindcss` 0.8 (plus `typescript-eslint` 8.61, `prettier` 3.8, `postcss` 8.5, `tailwindcss` 4.3). ESLint 10, React 19, Vite 8, TypeScript 6, lint-staged 17 held back.
- All theme dependency bumps for 0.13.0 are reproducible in existing projects via `pnpm dlx @webikon/webentor-codemods run 0.13.0`.
