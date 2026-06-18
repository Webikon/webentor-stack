# Webentor Codemods Changelog

## 0.1.0

- Initial release of `@webikon/webentor-codemods` — a reusable, ast-grep–powered
  codemod runner for migrating consumer theme code across `webentor-core` updates.
  - CLI: `list`, `run <id>`, and `run --since <ver> [--to <ver>]` (dry-run by
    default, `--apply` to write).
  - First migration `theme-editor-enqueue-iframe` (core 0.12 → 0.13): moves the
    theme's `editor.css` + `button.style.css` enqueues from
    `enqueue_block_editor_assets` to a new `enqueue_block_assets` hook
    (`is_admin()` guarded) for WP 7.0's iframed editor; the editor JS stays put.
  - Golden tests assert byte-exact before→after, idempotency, and safe no-op on
    customized/already-migrated files.
