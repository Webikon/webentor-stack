# `starter-2.1.1` — upgrade a consumer theme to Acorn 6 (Laravel 13)

**Applies to:** consumer themes on the **2.1.0** baseline (webentor-core `0.15.x`).
This is a **starter/theme-only** release — it does **not** bump `webentor-core`, so
select it by id (or `--package webentor-starter`). Coming from an older baseline?
Run the `0.15.0` core codemod first.

Run from your project root:

```sh
pnpm dlx @webikon/webentor-codemods run starter-2.1.1          # preview (dry-run)
pnpm dlx @webikon/webentor-codemods run starter-2.1.1 --apply  # apply
```

Then reinstall, rebuild, and clear caches:

```sh
# in the theme dir
composer update
wp acorn optimize:clear
```

This migration has **one automated rule** (a `composer.json` dependency bump) plus
**manual `.env` steps** for the Acorn 6 runtime changes.

## 1. Dependency (`rules/deps.yml`, JSON)

Rewrites the theme's `roots/acorn` range to the **2.1.1 baseline** (`^6.0`). This is
the complete delta from the 2.1.0 baseline — only `roots/acorn` changed.
`webikon/webentor-core` stays `^0.15` (it already covers the transparent `0.15.1`
patch), so it is intentionally absent here. The rule matches `roots/acorn` by its
exact key (value-is-string guarded) and is scoped to `composer.json` via `files:`;
the project root `composer.json` has no `roots/acorn`, so only the theme manifest
matches.

| manifest | dependency | → range |
|---|---|---|
| composer.json | `roots/acorn` (major 5→6) | `^6.0` |

- **Idempotent:** re-running rewrites to the same range → no diff.
- **Baseline caveat:** the fix pins `^6.0`, so a project already *ahead* within the
  major would be set back to it. Expected for a 2.1.0 → 2.1.1 upgrade.

After applying, run `composer update` to refresh `composer.lock`.

## 2. Acorn 6 runtime changes (manual `.env`)

Acorn 6 bundles Laravel 13. These are **not** codemodded — `.env` is project- and
environment-specific — so apply them by hand on each environment:

- **Cache / session / Redis prefixes.** Laravel 13 changed the default prefix and
  cookie separators from underscores to hyphens. On an existing site this
  **invalidates the object cache and logs out every session** unless you pin the
  values explicitly:

  ```dotenv
  CACHE_PREFIX=your_existing_prefix
  SESSION_COOKIE=your_existing_cookie
  REDIS_PREFIX=your_existing_prefix
  ```

  A fresh project can ignore this (there is no cache/session to preserve).

- **Mail scheme.** If you set `MAIL_ENCRYPTION`, rename it to `MAIL_SCHEME`:

  ```diff
  - MAIL_ENCRYPTION=tls
  + MAIL_SCHEME=smtps
  ```

- **PHP floor.** Acorn 6 requires PHP `>=8.3` (already the theme's floor).

After any `.env` change, run `wp acorn optimize:clear`.

Reference: the starter theme's `composer.json` at theme 2.1.1, and the upstream
[Acorn v6 upgrade notes](https://roots.io/acorn/docs/upgrading-acorn/).

## Changelog sync

Prepends the `2.1.1` version block to the project's changelogs so they match the
stack:

- `changelog.md` (project root) ← `changelog/root.md` (marker `### 2.1.1`)
- `web/app/themes/*/changelog.md` ← `changelog/theme.md` (marker `### Version 2.1.1`)

Idempotent (skipped if the heading is already present) and additive (inserted under
the `# … Changelog` H1, above existing entries). If you've customized the changelog,
your entries are preserved.

## Relationship to `update-dependencies`

This codemod only encodes the `roots/acorn` major as the released theme baseline.
Routine third-party dependency maintenance (in-range patch/minor bumps) is a
separate concern handled by the `update-dependencies` flow and is not part of a
migration.
