# Webentor Codemods Changelog

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
