# Webentor Theme Changelog

### Version 2.0.7

- Bump `webentor-core` to `^0.13` (WordPress 7.0 / PHP 8.4 block-editor deprecation fixes).
- Enqueue theme block-editor styles on `enqueue_block_assets` (guarded by `is_admin()`) instead of `enqueue_block_editor_assets`, so WordPress routes them into the editor iframe correctly (fixes "added to the iframe incorrectly" on WP 7.0). Styles remain off the public frontend.
- Update `@wordpress/*` dev dependencies to latest stable (block-editor/blocks 15.21, components 35, block-library 9.48, i18n 6.21, icons 14, dependency-extraction 6.48), `@10up/block-components` 1.22.2, `@alpinejs/intersect` 3.15.12.
- Update dev tooling, including majors: `stylelint` 17 + `stylelint-config-recommended` 18, `@types/wordpress__block-editor` 15, `prettier-plugin-tailwindcss` 0.8 (plus `typescript-eslint` 8.61, `prettier` 3.8, `postcss` 8.5, `tailwindcss` 4.3). ESLint 10, React 19, Vite 8, TypeScript 6, lint-staged 17 held back.
- All theme dependency bumps for 0.13.0 are reproducible in existing projects via `pnpm dlx @webikon/webentor-codemods run 0.13.0`.

### Version 2.0.6

- Bump `webentor-core` to `^0.12`
- Remove `require_once WEBENTOR_CORE_PHP_PATH . '/init.php'` from `functions.php` — webentor-core now auto-loads via `WebentorCoreServiceProvider` (Acorn auto-discovery). The `WEBENTOR_CORE_PHP_PATH` constant define is kept because `config/view.php` still uses it for core view paths.

### Version 2.0.5

- Remove Blade directives (`@sliderContent`, `@enqueueScripts`, `@xdebugBreak`) — now registered by `WebentorCoreServiceProvider`
- Remove `Button` and `Slider` View Components — now provided by `webentor-core`, themes can override by extending `Webentor\Core\View\Components\Button`
- Remove core block `data.php` glob from `ThemeServiceProvider` — now loaded by `WebentorCoreServiceProvider`

### Version 2.0.4

- Move from alias `@webentorCore` to direct imports with `@webikon/webentor-core`

### Version 2.0.3

- Fix Vite blocks build for Windows using Herd
- Add buildSafelist to webentor-config
- Add `@webikon/webentor-configs`

### Version 2.0.2

- Add `opacity-30` class to safelist
- Remove link decoration in `theme.json`
- Add icon name class to Button
- Add Flexbox Order values to webentor-config
- Fix global font-family style
- Fix eslint tsconfigRootDir warning
- Fix Vite publicDir error
- Add theme icons register
- Remove WP auto sizes for images
- **BREAKING:** Add gallery Lightbox variant
- **BREAKING:**: Add `aspect-ratio` config to `webentor-config.ts`
- **BREAKING:**: Change view paths for Blade `blocks` and `core-components`. Now these folder names doesn't need to be included in the path when including views from them.
  - Replace `core-components.button.button` and `core-components.slider.slider` with `button.button` and `slider.slider`
  - If you included blocks as `blocks.blockName.view`, remove `blocks.` and leave just `blockName.view`
- **BREAKING:** Change `webentor-config.ts` to simplified version which gets its default values from core

### Version 2.0.1

- Update node deps
- Update composer deps
- Add `.npmrc`, remove `globals` node package
- Replace `yarn` with `pnpm`
- Fix stylelint config

### Version 2.0.0

- Upgrade to Tailwind v4
- Refactor BudJS to Vite
- Refactor to ESM modules
- Update ESLint to v9
- Extract core functionality to separate packages

### Version 1.3.0

- BREAKING CHANGES!!!
- Rework all blocks to native
- Add Typescript
- Refactor block register with BudJS API
- Remove ACF blocks

### Version 1.2.0

- Rework Mix to BudJS
- Fix stylelint
- Backport features and improvements
- Bake theme into Bedrock stack

### Version 1.1.0

- Completely reworked **webentor/e-slider** block
- Rework block Responsive settings
- Add native blocks
- Switch to yarn

### Version 1.0.1

- Add Image block and helpers

### Version 1.0.0

- Initial version
