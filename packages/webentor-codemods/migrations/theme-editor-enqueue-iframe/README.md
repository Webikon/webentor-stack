# `theme-editor-enqueue-iframe`

**Applies to:** consumer themes when updating `webentor-core` `0.12.x` → `0.13.0`
(WordPress 7.0 / PHP 8.4 compatibility pass).

## Why

Since WP 6.9/7.0 the block editor renders inside an iframe. Global canvas styles
must be registered on `enqueue_block_assets` (not `enqueue_block_editor_assets`)
so WordPress routes them **into** the iframe — otherwise it warns that the style
was "added to the iframe incorrectly" and the styles never reach the canvas
(e.g. button styles missing in the editor). The editor **JavaScript** still
belongs on `enqueue_block_editor_assets` (it loads in the outer editor document).

## What it changes

In the theme's `app/setup.php`, the canonical hook:

```php
add_action('enqueue_block_editor_assets', function (): void {
    $dependencies = …;
    \Kucrut\Vite\enqueue_asset(…, 'resources/scripts/editor.ts', …);        // JS
    \Kucrut\Vite\enqueue_asset(…, 'resources/styles/editor.css', …);        // CSS
    \Kucrut\Vite\enqueue_asset(…, 'resources/core-components/button/button.style.css', …); // CSS
}, 10);
```

becomes:

```php
add_action('enqueue_block_editor_assets', function (): void {
    $dependencies = …;
    \Kucrut\Vite\enqueue_asset(…, 'resources/scripts/editor.ts', …);        // JS stays
}, 10);

add_action('enqueue_block_assets', function (): void {
    if (!is_admin()) {
        return;
    }
    \Kucrut\Vite\enqueue_asset(…, 'resources/styles/editor.css', …);        // CSS moved
    \Kucrut\Vite\enqueue_asset(…, 'resources/core-components/button/button.style.css', …); // CSS moved
}, 10);
```

The `enqueue_asset` directory + options arguments are preserved verbatim (matched
via metavariables), so any per-project tweaks to those options survive.

## Safety

- **Idempotent:** an already-migrated `setup.php` (no styles left on
  `enqueue_block_editor_assets`) does not match — re-running is a no-op.
- **Conservative:** the rule only matches the canonical shape (the JS enqueue plus
  both style enqueues on that hook). A heavily customized hook will not match and
  is left untouched — migrate it by hand using the before/after above.

## Run it

From your project root:

```sh
# preview (dry-run)
pnpm dlx @webikon/webentor-codemods run theme-editor-enqueue-iframe
# apply
pnpm dlx @webikon/webentor-codemods run theme-editor-enqueue-iframe --apply
```
