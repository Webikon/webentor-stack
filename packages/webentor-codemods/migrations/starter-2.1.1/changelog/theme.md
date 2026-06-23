### Version 2.1.1

- Bump `roots/acorn` to `^6.0` (from `^5.0`) — Acorn 6 ships Laravel 13 components.
  - **Breaking runtime behavior for existing sites:** Laravel 13 changes the default cache-prefix / session-cookie / Redis-prefix separators (underscores → hyphens), which **invalidates existing caches and logs out all sessions** unless `CACHE_PREFIX`, `SESSION_COOKIE`, and `REDIS_PREFIX` are pinned in `.env`. The SMTP `MAIL_ENCRYPTION` env var is renamed to `MAIL_SCHEME`. Requires PHP `>=8.3` (already the theme floor).
  - After upgrading, run `composer update` then `wp acorn optimize:clear` to rebuild Acorn's cached bootstrap files.
- Bump `webentor-core` to `0.15.1` (within the existing `^0.15` range — no constraint change). Transparent patch: fixes focal-point cropping in responsive `<source srcset>` (no API change for consumers).
- The `roots/acorn` bump is reproducible in existing projects via `pnpm dlx @webikon/webentor-codemods run starter-2.1.1`; the `.env` changes above are a manual step (documented in the codemod README).
