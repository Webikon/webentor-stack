# Webentor Codemods Changelog

## 0.3.1

- Add the `starter-2.1.2` migration (theme **2.1.1 → 2.1.2**, WP 7.0 dependency
  alignment). Selectable by id or `--package webentor-starter`. It does **not**
  change the `webentor-core` ranges — core `0.15.4` is a transparent patch
  within the existing `^0.15` (`pnpm up` / `composer update` pull it in-range).
  - `deps.yml` (JSON): the complete manifest delta from the 2.1.1 baseline —
    rewrites the six declared `@wordpress/*` ranges to the WP-7.0-bundled
    versions, replaces the unused
    `@wordpress/dependency-extraction-webpack-plugin` entry with
    `@wordpress/compose`, and inserts the newly declared externalized imports
    (`data`/`element`/`hooks`/`html-entities`, guarded so re-runs never
    duplicate). Value-is-string guarded, idempotent; `composer.json` untouched.
  - Changelog sync prepends the `2.1.2` block to the project root `changelog.md`
    (marker `### 2.1.2`) and the theme `web/app/themes/*/changelog.md` (marker
    `### Version 2.1.2`), matching the coupled starter + theme `2.1.2` bump.

## 0.3.0

- Add the `starter-2.1.1` migration (theme **2.1.0 → 2.1.1**, **Acorn 6 / Laravel
  13**) — the first **package-scoped** migration (`appliesTo.package:
  webentor-starter`), selectable by id or `--package webentor-starter`. It does
  **not** bump `webentor-core`.
  - `deps.yml` (JSON): rewrites the theme's `composer.json` `roots/acorn` to `^6.0`.
    This is the complete dependency delta from the 2.1.0 baseline — `roots/acorn` is
    the only change; `webikon/webentor-core` stays `^0.15` (it already covers the
    transparent `0.15.1` patch). Scoped to `composer.json` (the project root
    `composer.json` has no `roots/acorn`), value-is-string guarded, idempotent.
  - Changelog sync prepends the `2.1.1` block to the project root `changelog.md`
    (marker `### 2.1.1`) and the theme `web/app/themes/*/changelog.md` (marker
    `### Version 2.1.1`), matching the coupled starter + theme `2.1.1` bump.
  - The Acorn 6 `.env` runtime changes (pin `CACHE_PREFIX`/`SESSION_COOKIE`/
    `REDIS_PREFIX` to preserve caches/sessions; rename `MAIL_ENCRYPTION` →
    `MAIL_SCHEME`) are a documented manual step (see the migration README).

## 0.2.0

- **New capability — changelog sync.** A migration can now declare a `changelog`
  block (in `index.json`) that prepends a release's version section to a consumer
  project's root `changelog.md` and theme `web/app/themes/*/changelog.md`, under the
  `# … Changelog` H1, so they stay up to date and match the stack. Idempotent (skips
  if the version heading is already present), additive (never clobbers existing
  entries), and conservative (missing targets are reported, not created). It's plain
  Markdown insertion (`lib/changelog.mjs`), not ast-grep. The `0.13.0` migration
  syncs the `2.0.7` blocks and `0.15.0` syncs the `2.1.0` blocks, so a range run
  (`run --since …`) accumulates the full history.
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
