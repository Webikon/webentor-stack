### Version 2.1.0

- Bump `webentor-core` to `^0.15` (from `^0.13`), which also brings the `0.14.0` overlay/`l-section` extensibility work and the `0.14.1` frontend `wp-i18n` fix transparently via core.
- **Vite 8 / Rolldown toolchain migration:**
  - Dependency bumps: `vite` `^8`, `@roots/vite-plugin` `^2.2.0`, `@vitejs/plugin-react` `^6`, `laravel-vite-plugin` `^3`, `@webikon/webentor-configs` `^1.1.0`.
  - `vite.config.js`: replace the local `wp_scripts()` + `react()` plugins with `...wordpressExternals(command)` from `@webikon/webentor-configs/vite`, and wrap the config as `defineConfig(({ command }) => ({ … }))`.
  - `resources/scripts/app.ts`: the static-asset glob now uses `import.meta.glob([...], { eager: true, query: '?url', import: 'default' })` so Rolldown versions images/fonts into the manifest.
- All theme dependency bumps and the `app.ts` change are reproducible in existing projects via `pnpm dlx @webikon/webentor-codemods run 0.15.0`; apply the `vite.config.js` change by hand (documented in the codemod README).
