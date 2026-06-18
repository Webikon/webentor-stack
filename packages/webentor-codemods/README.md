# @webikon/webentor-codemods

Reusable, polyglot **codemods** for migrating Webentor Stack consumer projects
across `webentor-core` updates. When a core release requires a mechanical change
to **consumer-owned theme code** (PHP / TS / CSS / JSON), the fix ships here as a
versioned migration you can run with one command — no install required.

Powered by [ast-grep](https://ast-grep.github.io) (AST-based, so it tolerates
formatting differences a regex would choke on).

## Usage

Run from your **project root** (the directory containing `web/app/themes/…`):

```sh
# See what's available
pnpm dlx @webikon/webentor-codemods list

# Preview a migration (dry-run — prints a diff, writes nothing)
pnpm dlx @webikon/webentor-codemods run <id>

# Apply it
pnpm dlx @webikon/webentor-codemods run <id> --apply

# Or run every migration for a core version range at once
pnpm dlx @webikon/webentor-codemods run --since 0.12.0 --to 0.13.0 --apply
```

`--path <dir>` targets a different directory (defaults to the current one).
`--package <name>` narrows `--since` to a package (defaults to `webentor-core`).

> Use `npx` instead of `pnpm dlx` if you prefer — both download-and-run without
> a permanent install.

Always run a dry-run first, review the diff, then re-run with `--apply`. After
applying, rebuild the theme and clear caches (`wp acorn optimize:clear`).

## Available migrations

| id | core | what |
| --- | --- | --- |
| `theme-editor-enqueue-iframe` | 0.12 → 0.13 | Move editor canvas styles to `enqueue_block_assets` (WP 7.0 iframe editor) |

See each migration's `migrations/<id>/README.md` for before/after detail.

## How it's built

```
migrations/
  index.json                     registry (id, title, appliesTo range, rule files)
  <id>/
    rules/*.yml                  ast-grep rewrite rule(s), applied in order
    README.md                    what/why + before→after
  __fixtures__/<id>/
    before.php / after.php       golden pair (drives the tests)
    customized.php               a shape that must NOT match (no-op guard)
bin/webentor-codemods.mjs        the CLI runner (wraps the bundled ast-grep)
```

### Adding a future migration

1. Create `migrations/<id>/rules/<rule>.yml` (an ast-grep rule with a `fix`).
2. Add a `before.php`/`after.php` (and optional `customized.php`) golden pair
   under `migrations/__fixtures__/<id>/`.
3. Register it in `migrations/index.json` (`id`, `appliesTo`, `rules`).

The runner and the test suite are generic — no code changes needed. Migrations
are **idempotent** (re-running is a no-op) and **conservative** (anything that
doesn't match the targeted shape is left untouched).

## Develop & test

```sh
pnpm install        # pulls the ast-grep engine
pnpm test           # golden tests: before→after byte-match, idempotency, no-op safety
```
