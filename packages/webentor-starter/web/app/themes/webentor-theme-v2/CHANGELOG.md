# Webentor Theme Changelog

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
