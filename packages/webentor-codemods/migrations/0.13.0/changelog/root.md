### 2.0.7

- WordPress 7.0 / PHP 8.4 compatibility
- Allow `roots/wordpress` `^7.0` (constraint widened to `^6.5 || ^7.0`)
- Bump bundled theme to `2.0.7` (`webentor-core` `^0.13`)
- Editor assets: move editor canvas styles (`editor.css`, `button.style.css`) from `enqueue_block_editor_assets` to `enqueue_block_assets` (`is_admin()` guarded) so WP 7.0's iframed editor styles the canvas correctly.
- Update theme dependencies to the 0.13.0 baseline, including majors `@wordpress/components` 35, `@wordpress/icons` 14, `stylelint` 17 (+ `stylelint-config-recommended` 18), `@types/wordpress__block-editor` 15, `prettier-plugin-tailwindcss` 0.8.
- Existing projects can apply the editor enqueue change **and** the dependency bumps via the `0.13.0` codemod (`pnpm dlx @webikon/webentor-codemods run 0.13.0`).
