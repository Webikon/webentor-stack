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
pnpm dlx @webikon/webentor-codemods run --since 0.13.0 --to 0.15.0 --apply
```

Migration ids encode their package + target version: **webentor-core** migrations
use the bare core version (`0.13.0`, `0.15.0`); other packages use a
`<package>-<version>` prefix (e.g. `starter-2.1.1` for a starter-only release).

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
- **Additive** — the changelog sync (below) inserts entries above existing ones;
  it never clobbers your own changelog content.

## Changelog sync

Besides code transforms, a migration keeps your project's changelogs up to date
with the stack: it prepends the release's version block to the project root
`changelog.md` and the theme `web/app/themes/*/changelog.md` (under the
`# … Changelog` H1). Already-present versions are skipped, so a range run
(`run --since …`) backfills the full history in order.

## Available migrations

| id | scope | what it does |
| --- | --- | --- |
| `0.13.0` | core 0.12 → 0.13 | Moves the theme's `editor.css` + `button.style.css` enqueues from `enqueue_block_editor_assets` to a new `enqueue_block_assets` hook (`is_admin()` guarded) for WP 7.0's iframed editor; the editor JS stays put. Plus the full `package.json` + `composer.json` dependency bump set and changelog sync (2.0.7). |
| `0.15.0` | core 0.13 → 0.15 | Vite 8 / Rolldown: `package.json` + `composer.json` dependency bumps, the `resources/scripts/app.ts` static-asset `import.meta.glob` fix, and changelog sync (2.1.0). The `vite.config.js` externals rewrite is a documented manual step (printed by the migration). |
| `starter-2.1.1` | starter + theme 2.1.0 → 2.1.1 | Acorn 6 / Laravel 13: bumps `roots/acorn` to `^6.0` in the theme `composer.json` and syncs the root + theme changelogs (2.1.1). Does **not** bump `webentor-core`. The Acorn 6 `.env` changes (pin `CACHE_PREFIX`/`SESSION_COOKIE`/`REDIS_PREFIX`; rename `MAIL_ENCRYPTION` → `MAIL_SCHEME`) are a documented manual step. Select with `--package webentor-starter` for range runs. |

## Authoring a new migration

Migrations live in `packages/webentor-codemods/migrations/` — each is a folder of
ast-grep rule files and/or changelog blocks plus directory-based golden fixtures,
registered in `migrations/index.json`. The runner and tests are generic, so adding
one needs no code changes. See the package's
[README](https://github.com/Webikon/webentor-stack/tree/main/packages/webentor-codemods#how-its-built)
for the full layout, the id naming convention, and the step-by-step.
