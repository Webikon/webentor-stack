# Webentor Codemods Changelog

## 0.2.0

- Add the `0.15.0` migration (webentor-core 0.13 → 0.15 — the **Vite 8 / Rolldown**
  toolchain move), with two automated rule sets plus one documented manual step:
  - `deps.yml` (JSON): rewrites the theme's `package.json` + `composer.json` to the
    0.15.0 baseline — `webentor-core` `^0.15`, `vite` `^8`, `@roots/vite-plugin`
    `^2.2.0`, `@vitejs/plugin-react` `^6`, `laravel-vite-plugin` `^3`,
    `@webikon/webentor-configs` `^1.1.0`. This is the complete dependency delta from
    the 0.13.0 baseline (only the Vite-8 toolchain ranges changed).
  - `app-glob-vite8.yml` (TS): adds `{ eager: true, query: '?url', import: 'default' }`
    to the static-asset `import.meta.glob(['../images/**', '../fonts/**'])` in
    `resources/scripts/app.ts` (a bare glob no longer emits assets under Rolldown).
    Conservative — only the single-argument asset glob matches; unrelated globs and
    the already-migrated form are untouched.
  - The `vite.config.js` WordPress-externals rewrite (now
    `...wordpressExternals(command)` from `@webikon/webentor-configs/vite`) is too
    project-specific to codemod safely and is documented as a manual before→after in
    `migrations/0.15.0/README.md`.

## 0.1.0

- Initial release of `@webikon/webentor-codemods` — a reusable, ast-grep–powered
  codemod runner for migrating consumer theme code across `webentor-core` updates.
  - CLI: `list`, `run <id>`, and `run --since <ver> [--to <ver>]` (dry-run by
    default, `--apply` to write).
  - Migrations are **named by the webentor-core version** they upgrade to — the id
    *is* the target version, so `run 0.13.0` reads as "run the 0.13.0 codemod".
  - First migration `0.13.0` (core 0.12 → 0.13), with two rule sets:
    - `editor-enqueue-iframe.yml` (PHP): moves the theme's `editor.css` +
      `button.style.css` enqueues from `enqueue_block_editor_assets` to a new
      `enqueue_block_assets` hook (`is_admin()` guarded) for WP 7.0's iframed
      editor; the editor JS stays put.
    - `deps.yml` (JSON, multi-rule): rewrites the theme's `package.json` +
      `composer.json` dependency ranges to the 0.13.0 baseline — `webentor-core`
      `^0.13` plus the full aligned third-party set (incl. major bumps
      `@wordpress/components` 30→35, `@wordpress/icons` 11→14, `stylelint` 16→17,
      `@types/wordpress__block-editor` 14→15). Value-is-string guarded so config
      objects sharing a key aren't touched; `name`/`version` untouched.
  - Polyglot golden tests run a migration's rules over a `before/` fixture subtree
    (PHP + JSON together) and assert byte-exact equality with `after/`, plus
    idempotency and a safe no-op on customized/already-migrated trees.
