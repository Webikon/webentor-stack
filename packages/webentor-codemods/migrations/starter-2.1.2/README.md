# `starter-2.1.2` — align a consumer theme with the WP 7.0 runtime

**Applies to:** consumer themes on the **2.1.1** baseline (webentor-core `0.15.x`,
Acorn 6). Coming from an older baseline? Run the `starter-2.1.1` codemod first.

Run from your project root:

```sh
pnpm dlx @webikon/webentor-codemods run starter-2.1.2          # preview (dry-run)
pnpm dlx @webikon/webentor-codemods run starter-2.1.2 --apply  # apply
```

Then reinstall, rebuild, and clear caches:

```sh
# in the theme dir
pnpm install
pnpm up @webikon/webentor-core
composer update webikon/webentor-core
pnpm build
wp acorn optimize:clear
```

This migration is **manifest-only** (one `rules/deps.yml`, JSON, `package.json`
only): no code changes are required in consumer themes, and `composer.json` is
untouched. Core `0.15.4` (WP 7.0 inspector-spacing fixes) is a transparent patch
within the existing `^0.15` range — the `pnpm up` / `composer update` commands
above pull it in; no constraint change is needed.

## 1. Dependencies (`rules/deps.yml`, JSON)

The **complete delta from the 2.1.1 baseline** — nothing else changed between the
baselines, so nothing else is encoded:

| manifest | dependency | → range |
|---|---|---|
| package.json | `@wordpress/block-editor` | `^15.13.2` |
| package.json | `@wordpress/block-library` | `^9.40.2` |
| package.json | `@wordpress/blocks` | `^15.13.1` |
| package.json | `@wordpress/components` (32.x = WP 7.0 runtime) | `^32.2.1` |
| package.json | `@wordpress/dependency-extraction-webpack-plugin` | **replaced by** `@wordpress/compose: ^7.40.1` |
| package.json | `@wordpress/data` | **added** `^10.40.1` |
| package.json | `@wordpress/element` | **added** `^6.40.1` |
| package.json | `@wordpress/hooks` | **added** `^4.40.1` |
| package.json | `@wordpress/html-entities` | **added** `^4.40.1` |
| package.json | `@wordpress/i18n` | `^6.13.1` |
| package.json | `@wordpress/icons` | `^11.7.1` |

Why the `@wordpress/*` ranges go *down*: these imports are externalized to
`window.wp.*`, so the code always runs against the Gutenberg packages **bundled
by the installed WP core** — declared ranges only drive types and lint, and the
2.1.2 baseline pins them to what **WP 7.0** ships instead of npm latest. The four
**added** packages were always imported through the externals but never declared;
declaring them makes their types resolve. The webpack dependency-extraction
plugin was a leftover from the pre-Vite toolchain and is not referenced anywhere.

Mechanics worth knowing:

- The plugin **removal** and the `@wordpress/compose` **addition** are one
  in-place edit (the plugin's `package.json` entry is rewritten into the
  `compose` entry), so the JSON stays valid and alphabetically ordered. Guarded:
  if your manifest already declares `@wordpress/compose`, the swap is skipped to
  avoid a duplicate key — remove the webpack-plugin entry by hand in that case.
- The four **insertions** are anchored on your `@wordpress/i18n` entry and
  guarded on `@wordpress/data` being absent, so re-running never duplicates them.
  Two complementary i18n rules (insert-owned vs rewrite-only) can never both
  fire.
- **Idempotent:** re-running rewrites everything to the same ranges → no diff.
- **Baseline caveat:** ranges are pinned to the 2.1.2 baseline, so a project
  already *ahead* of it would be set back. Expected for a 2.1.1 → 2.1.2 upgrade.
  (If your fleet still runs a WP older than 7.0, hold this migration until the
  WP core update — the whole point is matching the WP bundle.)

After applying, run `pnpm install` (refreshes `pnpm-lock.yaml`).

## Changelog sync

Prepends the `2.1.2` version block to the project's changelogs so they match the
stack:

- `changelog.md` (project root) ← `changelog/root.md` (marker `### 2.1.2`)
- `web/app/themes/*/changelog.md` ← `changelog/theme.md` (marker `### Version 2.1.2`)

Idempotent (skipped if the heading is already present) and additive (inserted under
the `# … Changelog` H1, above existing entries). If you've customized the changelog,
your entries are preserved.

## Relationship to `update-dependencies`

This codemod encodes the released 2.1.2 theme baseline only. Routine third-party
dependency maintenance stays with the `update-dependencies` flow; future
WP-upgrade audits (which `@wordpress/*` ranges to align next) come from the
`gutenberg-packages-audit` skill.
