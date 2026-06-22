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
