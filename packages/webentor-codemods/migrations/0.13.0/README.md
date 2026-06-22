# `0.13.0` — upgrade a consumer theme to webentor-core 0.13.0

**Applies to:** consumer themes moving `webentor-core` `0.12.x` → `0.13.0`
(WordPress 7.0 / PHP 8.4 compatibility pass).

Run from your project root:

```sh
pnpm dlx @webikon/webentor-codemods run 0.13.0          # preview (dry-run)
pnpm dlx @webikon/webentor-codemods run 0.13.0 --apply  # apply
```

Then reinstall + rebuild + clear caches:

```sh
# in the theme dir
pnpm install && composer update
pnpm build
wp acorn optimize:clear
```

This migration has two rule sets: an **editor-asset enqueue** change to
`app/setup.php`, and a **dependency** bump set across `package.json` +
`composer.json`.

## 1. Editor-asset enqueue (`rules/editor-enqueue-iframe.yml`, PHP)

Since WP 6.9/7.0 the block editor renders inside an iframe. Global canvas styles
must be registered on `enqueue_block_assets` (not `enqueue_block_editor_assets`)
so WordPress routes them **into** the iframe — otherwise it warns the style was
"added to the iframe incorrectly" and the styles never reach the canvas (e.g.
button styles missing in the editor). The editor **JavaScript** still belongs on
`enqueue_block_editor_assets` (it loads in the outer editor document).

In the theme's `app/setup.php`:

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
via metavariables), so per-project tweaks to those options survive.

- **Idempotent / conservative:** an already-migrated `setup.php` (no styles left
  on that hook) does not match; a heavily customized hook also won't match and is
  left untouched — migrate it by hand using the before/after above.

## 2. Dependencies (`rules/deps.yml`, JSON)

Rewrites the theme's dependency ranges to the **0.13.0 baseline** — the complete
set that changed from theme 2.0.6 / core 0.12 → 0.13. Each rule matches a
dependency by its exact key (with a value-is-string guard, so config objects that
share a name like `lint-staged`/`prettier`/`stylelint` are never touched) and is
scoped to `package.json` / `composer.json` via `files:`.

| manifest | dependency | → range |
|---|---|---|
| package.json + composer.json | webentor-core | `^0.13.0` / `^0.13` |
| package.json | `@wordpress/components` (major 30→35) | `^35.0.1` |
| package.json | `@wordpress/icons` (major 11→14) | `^14.0.1` |
| package.json | `stylelint` (major 16→17) | `^17.13.0` |
| package.json | `stylelint-config-recommended` (major 17→18) | `^18.0.0` |
| package.json | `@types/wordpress__block-editor` (major 14→15) | `^15.0.6` |
| package.json | `prettier-plugin-tailwindcss` (0.7→0.8) | `^0.8.0` |
| package.json | other `@wordpress/*`, `tailwindcss`/`@tailwindcss/*`, `@10up/block-components`, `@alpinejs/intersect`, `@vitejs/plugin-react`, `@roots/vite-plugin`, `vite`, `prettier`, `postcss`, `typescript-eslint`, `eslint`/`@eslint/js`, `eslint-plugin-prettier`, `lint-staged`, `@ianvs/prettier-plugin-sort-imports`, `@shufo/prettier-plugin-blade` | 0.13.0 ranges |

**Held back (not changed):** `react`/`react-dom` (18 — WordPress runtime is React
18), `eslint`/`@eslint/js` major (10 — blocked by `eslint-plugin-react`), `vite`
major (8), `typescript` major (6), `lint-staged` major (17 — needs Node 22).
`name`/`version` are never touched.

- **Idempotent:** re-running rewrites to the same range → no diff.
- **Baseline caveat:** the fix pins the 0.13.0 ranges, so a project already
  *ahead* of the baseline within a major would be set back to it. Expected for a
  0.12 → 0.13 upgrade; adjust by hand if you intentionally run newer.

After applying, run `pnpm install` + `composer update` to refresh the lockfiles.

## 3. Changelog sync

Prepends the `2.0.7` version block to the project's changelogs so they match the
stack:

- `changelog.md` (project root) ← `changelog/root.md` (marker `### 2.0.7`)
- `web/app/themes/*/changelog.md` ← `changelog/theme.md` (marker `### Version 2.0.7`)

Idempotent (skipped if the heading is already present) and additive (inserted under
the `# … Changelog` H1, above existing entries).
