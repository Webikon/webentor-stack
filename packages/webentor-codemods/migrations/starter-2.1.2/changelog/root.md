### 2.1.2

- Bump the bundled theme to `2.1.2` — `@wordpress/*` devDependencies aligned with the versions WP 7.0 actually bundles (they are externalized to `window.wp.*` at runtime), including newly declared `compose`/`data`/`element`/`hooks`/`html-entities` and removal of the unused `@wordpress/dependency-extraction-webpack-plugin`.
- Bump `webentor-core` to `0.15.4` (transparent patch within the existing `^0.15` range: restores inspector-control spacing under WP 7.0's `__nextHasNoMarginBottom` default flip; editor-only, no API change).
- Existing projects can apply the manifest changes via `pnpm dlx @webikon/webentor-codemods run starter-2.1.2`, then `pnpm up @webikon/webentor-core` and `composer update webikon/webentor-core`.
