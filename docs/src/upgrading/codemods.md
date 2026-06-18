# Codemods

When a `webentor-core` release requires a mechanical change to **consumer-owned
theme code** (PHP / TS / CSS / JSON), the fix ships as a versioned **codemod** in
the [`@webikon/webentor-codemods`](https://www.npmjs.com/package/@webikon/webentor-codemods)
package. You run it with one command — no install — so the change that core's
update _requires_ comes with the tool that _performs_ it.

This is separate from syncing the setup runtime (`scripts/setup-core` via
`git subtree pull`, see [Starter Upgrades](./starter-upgrades.md)). Codemods
handle **code transforms** driven by package updates, and run independently of
whether `webentor-setup` is present in your project.

The engine is [ast-grep](https://ast-grep.github.io): rules match the **AST**, so
they tolerate formatting differences a regex would miss, and only touch the
targeted structure.

## Running a codemod

From your **project root** (the directory containing `web/app/themes/…`):

```sh
# List what's available
pnpm dlx @webikon/webentor-codemods list

# Preview a migration — dry-run, prints a diff, writes nothing
pnpm dlx @webikon/webentor-codemods run <id>

# Apply it
pnpm dlx @webikon/webentor-codemods run <id> --apply

# Or run every migration for a core version range at once
pnpm dlx @webikon/webentor-codemods run --since 0.12.0 --to 0.13.0 --apply
```

Options:

- `--path <dir>` — target a different directory (defaults to the current one).
- `--package <name>` — narrow `--since` to a package (defaults to `webentor-core`).
- `npx` works in place of `pnpm dlx` if you prefer.

**Recommended flow:** always dry-run first, review the diff, then `--apply`.
After applying, rebuild the theme and clear caches:

```sh
pnpm --dir web/app/themes/<theme> build
wp acorn optimize:clear
```

## Safety guarantees

- **Idempotent** — re-running an already-applied migration is a no-op.
- **Conservative** — anything that doesn't match the exact targeted shape (a
  heavily customized hook, say) is left untouched and reported, so you can
  migrate it by hand.

## Available migrations

| id | core | what it does |
| --- | --- | --- |
| `theme-editor-enqueue-iframe` | 0.12 → 0.13 | Moves the theme's `editor.css` + `button.style.css` enqueues from `enqueue_block_editor_assets` to a new `enqueue_block_assets` hook (`is_admin()` guarded), so WP 7.0's iframed editor styles the canvas correctly. The editor JS stays on `enqueue_block_editor_assets`. |

## Authoring a new migration

Migrations live in `packages/webentor-codemods/migrations/`:

```
migrations/
  index.json                 registry: id, title, appliesTo range, rule files
  <id>/
    rules/*.yml              ast-grep rewrite rule(s), applied in order
    README.md                what/why + before→after
  __fixtures__/<id>/
    before.php / after.php   golden pair (drives the tests)
    customized.php           a shape that must NOT match (no-op guard)
```

1. Add the rule(s) under `migrations/<id>/rules/`.
2. Add a `before.php`/`after.php` golden pair (and optional `customized.php`)
   under `migrations/__fixtures__/<id>/`.
3. Register the migration in `migrations/index.json`.

The runner and tests are generic — no code changes needed. `pnpm test` asserts
each migration is byte-exact (before → after), idempotent, and a safe no-op on
customized fixtures.
