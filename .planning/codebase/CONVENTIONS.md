# Coding Conventions

**Analysis Date:** 2026-04-11

## Project Structure

This is a **pnpm monorepo** with four packages managed via `pnpm-workspace.yaml`:
- `packages/webentor-configs` - Shared lint/format presets
- `packages/webentor-core` - Core WordPress Gutenberg blocks, PHP, and JS
- `packages/webentor-setup` - CLI tooling for project scaffolding
- `packages/webentor-starter` - Starter Bedrock + Sage WordPress project

Shared conventions live in `@webikon/webentor-configs` and are consumed by all other packages via factory functions.

## Naming Patterns

**Files - TypeScript/JavaScript:**
- Block edit components: `{block-slug}.block.tsx` (e.g., `e-button.block.tsx`, `l-section.block.tsx`)
- Private/internal modules: Prefixed with underscore `_` (e.g., `_utils.ts`, `_alpine.ts`, `_slider.ts`, `_use-block-parent.ts`)
- Index barrel files: `index.ts` for re-exports
- Registration side-effects: `registration.ts` (self-registering modules)
- Property definitions: `properties.ts`
- Settings UI: `settings.tsx`
- Panel wrappers: `panel.tsx`

**Files - PHP:**
- Kebab-case: `blocks-init.php`, `setup-core.php`, `blocks-settings.php`
- Class files: PascalCase `CloudinaryClient.php`

**Files - Blade Templates:**
- Block views: `view.blade.php` (always named `view`)
- Components: kebab-case `button.blade.php`, `post-card.blade.php`

**Files - CSS:**
- Prefixed with underscore: `_theme.css`, `_global.css`, `_utilities.css`
- Entry points without underscore: `app.css`, `editor.css`

**Block Naming Convention:**
- All blocks use `webentor/` namespace
- Element blocks: `e-` prefix (e.g., `webentor/e-button`, `webentor/e-slider`)
- Layout blocks: `l-` prefix (e.g., `webentor/l-section`, `webentor/l-header`)
- Section/page blocks: `b-` prefix in theme (e.g., `b-hero-banner`)

**Functions - TypeScript:**
- camelCase: `setImmutably()`, `camelize()`, `debounce()`, `getColorBySlug()`
- React components: PascalCase with `Webentor` prefix: `WebentorButton`, `WebentorBlockAppender`
- Hooks: `use` prefix, camelCase: `useBlockParent()`, `usePostTypes()`, `useTaxonomies()`

**Functions - PHP:**
- snake_case within namespaces: `register_frontend_blocks_assets()`, `render_block_blade()`
- Namespaced: `Webentor\Core\` for all core PHP functions

**Types - TypeScript:**
- PascalCase: `AttributesType`, `WebentorConfig`, `ButtonAttributes`
- Interfaces: PascalCase, descriptive: `SettingDefinition`, `ClassGenContext`, `ResponsiveValue`
- Exported type aliases with `Type` suffix for block attributes: `AttributesType`

**Variables:**
- TypeScript: camelCase (`blockProps`, `parentBlockProps`, `allowedBlocks`)
- PHP: snake_case (`$block_classes`, `$inner_blocks_html`, `$block_slug`)
- Blade template variables: snake_case (`$block_classes`, `$custom_classes`, `$additional_data`)

**CSS Classes:**
- Tailwind with `wbtr:` prefix for core styles: `wbtr:flex`, `wbtr:relative`, `wbtr:z-[2]`
- BEM-style for custom components: `w-section`, `w-section-inner`, `w-section-img`
- Button BEM: `btn`, `btn--primary`, `btn--size-medium`, `btn__text`, `btn__icon`

## Code Style

**Formatting:**
- Tool: Prettier v3, configured in `@webikon/webentor-configs`
- Config: `packages/webentor-configs/prettier.config.js`
- Semicolons: Always
- Single quotes: Yes
- Tab width: 2 spaces (4 for PHP, 2 for Blade)
- Trailing commas: All
- Tabs: Never (spaces only)

**Linting - JavaScript/TypeScript:**
- Tool: ESLint v9 (flat config), configured via `createEslintConfig()` factory
- Config: `packages/webentor-configs/eslint.config.js`
- TypeScript: `typescript-eslint` recommended rules
- React: `eslint-plugin-react` with JSX runtime support
- Key rules:
  - `react/prop-types`: Off (TypeScript handles this)
  - `react/display-name`: Off
  - `prefer-template`: Warning
  - `@typescript-eslint/no-explicit-any`: Warning (not error)
  - `@typescript-eslint/no-unused-vars`: Warning (not error)

**Linting - CSS:**
- Tool: Stylelint v16
- Config: `packages/webentor-configs/stylelint.config.js`
- Extends: `stylelint-config-recommended`
- Tailwind-specific: Ignores `@theme`, `@source`, `@utility`, `@variant`, `@custom-variant`, `@plugin`, `@apply`, `@reference` at-rules
- `no-descending-specificity`: Disabled

**Linting - PHP:**
- Tool: PHP_CodeSniffer with PSR-2 base
- Config: `phpcs.xml` in each package
- Excluded: `Generic.Files.LineLength`, `PSR1.Files.SideEffects.FoundWithSymbols`
- Indent: 4 spaces for PHP files, 2 spaces for Blade

**Blade Formatting:**
- Tool: `@shufo/prettier-plugin-blade`
- Config: `packages/webentor-configs/.bladeformatterrc`
- Indent: 2 spaces
- Wrap attributes: `force-expand-multiline`
- Sort Tailwind classes: Yes

**EditorConfig:**
- Config: `packages/webentor-configs/.editorconfig`
- Charset: UTF-8
- End of line: LF
- Final newline: Yes
- Trim trailing whitespace: Yes (except `.md`)

## Import Organization

**Order (enforced by `@ianvs/prettier-plugin-sort-imports`):**
1. `react` imports
2. Third-party modules (e.g., `@wordpress/*`, `@10up/*`)
3. (blank line)
4. `@webentorCore` / `@webikon/webentor-core` imports
5. (blank line)
6. `@blocks` imports
7. (blank line)
8. `@scripts` imports
9. Relative imports (`./`, `../`)
10. (blank line)
11. `@images`, `@fonts`, `@styles` imports
12. (blank line)
13. Type imports (`<TYPES>`)

**Path Aliases (defined in `vite.config.js` and `tsconfig.json`):**
- `@webentorCore/*` -> `./core-js/*`
- `@scripts` -> `/resources/scripts`
- `@styles` -> `/resources/styles`
- `@fonts` -> `/resources/fonts`
- `@images` -> `/resources/images`
- `@blocks` -> `/resources/blocks`

## Error Handling

**TypeScript/React Patterns:**
- Optional chaining used extensively: `attributes[attributeName]?.showButton`
- Nullish coalescing: `attributes?.img?.id ?? null`
- No try/catch patterns in block editor code; WordPress block editor handles errors at the wrapper level
- Early returns for missing data: `if (!$block_json_files) return;`

**PHP Patterns:**
- Null coalescing: `$block['attrs']['skipWrapper'] ?? false`
- Empty checks: `!empty($attributes['className'])`
- WordPress filters used for error boundary: `apply_filters('webentor/skip_render_block_blade', false, $block)`
- Admin/AJAX bail-out in render: `if (is_admin() || wp_doing_ajax()) return;`

## Logging

**Framework:** Console (no structured logging framework)

**Patterns:**
- PHP: No explicit logging calls observed; relies on WordPress `WP_DEBUG` and `WP_DEBUG_DISPLAY`
- JS: `window.WEBENTOR_WP_DEBUG` flag injected for conditional debug output
- Debug panel component exists at `packages/webentor-core/core-js/blocks-filters/responsive-settings/components/DebugPanel.tsx`

## Comments

**When to Comment:**
- PHPDoc blocks on all PHP functions with `@param` and `@return` tags
- JSDoc blocks on exported TypeScript functions with `@param` and `@return`
- Block file headers in Blade templates with parameter documentation
- Inline comments for non-obvious logic or WordPress-specific behaviors
- TODO comments for planned improvements: `// TODO: maybe add filter to customize this list`

**Documentation Style:**
- PHP: PHPDoc with type annotations: `@param array $attributes`, `@return string`
- TypeScript: JSDoc-style with `@param {object} props`, `@returns {Function}`
- Blade: `@php` block at top of view with parameter documentation

**Example - Blade view header pattern:**
```blade
@php
  /**
   * Webentor Element - Button
   *
   * @param array $attributes The block attributes.
   * @param string $innerBlocksContent The block inner HTML (empty).
   * @param string $anchor Anchor (ID attribute) HTML.
   * @param string $block_classes Block classes.
   * @param object $block WP_Block_Type instance.
   **/
@endphp
```

## Function Design

**Block Edit Components:**
- Always named `BlockEdit` as a `React.FC<BlockEditProps<AttributesType>>`
- Always define local `AttributesType` type
- Always destructure `props` at the top: `const { attributes, setAttributes } = props`
- Use `useBlockProps()` hook
- Return `null` from `BlockSave` (dynamic blocks) or `<InnerBlocks.Content />`
- Register with `registerBlockType(block, { edit: BlockEdit, save: BlockSave })`

**WordPress Hooks/Filters:**
- Use `applyFilters()` for extensibility points: `webentor.core.{blockSlug}.allowedBlocks`
- PHP filters use slash namespace: `webentor/block_classes`, `webentor/register_block`
- JS filters use dot namespace: `webentor.core.button.className`

**Registry Pattern:**
- Both JS and PHP use a `SettingsRegistry` singleton for responsive settings
- Each setting module self-registers via side-effect imports
- Registration includes: `name`, `panelGroup`, `order`, `supportKey`, `attributeSchema`, `SettingsComponent`, `generateClasses`, `hasActiveSettings`

## Module Design

**Exports:**
- Named exports preferred: `export { WebentorButton }`, `export function setImmutably()`
- Default export only for config objects: `export default config`
- Barrel files (`index.ts`) re-export from internal modules

**Package Exports (package.json):**
- Granular subpath exports: `@webikon/webentor-core/blocks-components`, `@webikon/webentor-core/blocks-utils`
- Source `.ts` files referenced directly (no pre-compilation): `"default": "./core-js/index.ts"`
- Config factory functions: `createEslintConfig()`, `createPrettierConfig()`, `createStylelintConfig()`

**Block Module Structure:**
Each block in `resources/blocks/{block-slug}/` contains:
- `block.json` - Block metadata, attributes, supports
- `{block-slug}.block.tsx` - Editor component (edit + save + registerBlockType)
- `view.blade.php` - Frontend rendering template
- Optional: `data.php` - Server-side data preparation
- Optional: `script.ts` - Frontend JavaScript
- Optional: `style.css` - Frontend styles

## Pre-commit Hooks

**Husky + lint-staged:**
- Root `.husky/pre-commit`: Rebuilds `webentor-core` public assets when source files are staged
- Core package `lint-staged` config (in `package.json`):
  - `*.{js,ts,tsx}` -> ESLint
  - `*.css` -> Stylelint

## Version Management

- Changesets (`@changesets/cli`) for version bumps
- Config: `.changeset/config.json`
- Composer versions synced via `scripts/sync-composer-versions.mjs`
- Release tags: namespaced format (`core-v*`, `setup-v*`, `starter-v*`)

---

*Convention analysis: 2026-04-11*
