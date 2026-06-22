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

# Preview the codemod for a core version (dry-run — prints a diff, writes nothing)
pnpm dlx @webikon/webentor-codemods run 0.13.0

# Apply it
pnpm dlx @webikon/webentor-codemods run 0.13.0 --apply

# Or run every migration across a core version range at once
pnpm dlx @webikon/webentor-codemods run --since 0.12.0 --to 0.13.0 --apply
```

`--path <dir>` targets a different directory (defaults to the current one).
`--package <name>` narrows `--since` to a package (defaults to `webentor-core`).

> Use `npx` instead of `pnpm dlx` if you prefer — both download-and-run without
> a permanent install.

Always run a dry-run first, review the diff, then re-run with `--apply`. After
applying, rebuild the theme and clear caches (`wp acorn optimize:clear`).

## Available migrations

| id | scope | what |
| --- | --- | --- |
| `0.13.0` | core 0.12 → 0.13 | WP 7.0 iframe editor-asset enqueue change (`app/setup.php`) + the full dependency bump set (`package.json` + `composer.json`) + changelog sync (2.0.7) |
| `0.15.0` | core 0.13 → 0.15 | Vite 8 / Rolldown: dependency bumps (`package.json` + `composer.json`) + the static-asset `import.meta.glob` fix (`resources/scripts/app.ts`) + changelog sync (2.1.0). The `vite.config.js` externals rewrite is a documented manual step. |

See each migration's `migrations/<id>/README.md` for before/after detail.

### Naming convention

A migration's `id` encodes the **package** it upgrades and the **target version**:

- **webentor-core** migrations use the **bare core version** — `0.13.0`, `0.15.0`.
  Core is the primary package (it's the default for `run --since`), so "run the
  0.13.0 codemod" reads literally. These also set `appliesTo.package: "webentor-core"`.
- **Other packages** use a **`<package>-<version>`** prefix — e.g. `starter-2.1.1`
  for a webentor-starter-only release that doesn't bump core. These set
  `appliesTo.package` accordingly (e.g. `"webentor-starter"`).

This keeps the two numbering schemes from colliding (core `0.x` vs starter `2.x`)
and makes a migration's package obvious from its id.

#### Package-scoped runs

A migration can be **changelog-only / tooling-only** — it needs *either* ast-grep
`rules` *or* a `changelog` block, not both, so a starter release with no code
rewrites is valid. Select package-scoped migrations the same way as core ones:

```sh
# by id (any package)
pnpm dlx @webikon/webentor-codemods run starter-2.1.1

# by version range — note --package (defaults to webentor-core)
pnpm dlx @webikon/webentor-codemods run --since 2.1.0 --package webentor-starter --apply
```

## Changelog sync

Besides code rewrites, a migration can keep a consumer project's **changelogs**
up to date with the stack. A project generated from the starter has a root
`changelog.md` and a theme `web/app/themes/<theme>/changelog.md` that mirror the
Webentor baseline — running a migration prepends that release's version block to
them (under the `# … Changelog` H1), so they read exactly like the stack's.

- **Idempotent:** if the version heading is already present, the file is skipped.
- **Additive:** the block is inserted above existing entries; nothing is removed.
  Project-specific entries you added stay put.
- **Conservative:** if a target changelog isn't found, it's reported and skipped
  (never created from scratch).
- Runs as part of `run <id>` / `run --since …` — dry-run prints the block it would
  insert; `--apply` writes it. Running a version *range* accumulates each release's
  block in order.

This is plain Markdown insertion (not ast-grep — headings don't parse cleanly as a
syntax tree), implemented in `lib/changelog.mjs`.

## How it's built

```
migrations/
  index.json                     registry (id, title, appliesTo {package,from,to}, rules, changelog)
  <id>/                          e.g. 0.13.0 (core) or starter-2.1.1 (starter)
    rules/*.yml                  ast-grep rewrite rule(s), applied in order; one .yml
                                 may hold several rules as `---`-separated documents
    changelog/*.md               (optional) version blocks prepended to consumer
                                 changelogs (root + theme), declared in index.json
    README.md                    what/why + before→after
  __fixtures__/<version>/
    before/  after/              golden project subtrees (drive the tests); each holds
                                 the files a rule touches, e.g. app/setup.php,
                                 package.json, composer.json
    customized/                  (optional) a subtree that must NOT change (no-op guard)
bin/webentor-codemods.mjs        the CLI runner (wraps the bundled ast-grep)
lib/changelog.mjs                the changelog-sync step (plain Markdown insertion)
```

### Adding a future migration

0. Pick an `id` per the naming convention above — bare version for core
   (`0.16.0`), `<package>-<version>` for anything else (`starter-2.1.1`).
1. (Optional) Create `migrations/<id>/rules/<rule>.yml` ast-grep rule(s) with a
   `fix`. Rules can target multiple languages (PHP, JSON, …) — ast-grep dispatches
   each rule to the files matching its `language`. JSON dependency rules use
   `files:` globs to scope to `package.json` / `composer.json`.
2. (If you added rules) add `before/` + `after/` (and optional `customized/`)
   fixture subtrees under `migrations/__fixtures__/<id>/`.
3. (Optional) To sync changelogs, drop the version block(s) in
   `migrations/<id>/changelog/*.md` and add a `changelog` array to the index entry:
   `[{ "entry": "changelog/root.md", "target": "changelog.md", "marker": "### <ver>" }, …]`.
   The `marker` is the block's first heading and is used for the idempotency check.
   A migration needs *either* `rules` *or* `changelog` — a changelog-only /
   tooling-only migration (e.g. a starter release with no core bump) is valid.
4. Register it in `migrations/index.json` (`id`, `appliesTo` {`package`, `from`,
   `to`}, optional `rules`, optional `changelog`).

The runner and the test suite are generic — no code changes needed. Migrations
are **idempotent** (re-running is a no-op) and **conservative** (anything that
doesn't match the targeted shape is left untouched).

## Develop & test

```sh
pnpm install        # pulls the ast-grep engine
pnpm test           # golden tests: before→after byte-match, idempotency, no-op safety
```
