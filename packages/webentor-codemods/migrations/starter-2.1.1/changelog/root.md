### 2.1.1

- Bump the bundled theme to `2.1.1` — `roots/acorn` to `^6.0` (from `^5.0`), i.e. **Acorn 6 / Laravel 13**.
  - **Requires consumer action on existing sites:** Laravel 13 changes the default cache-prefix / session-cookie / Redis-prefix separators (underscores → hyphens), which **invalidates the object cache and logs out all sessions** unless `CACHE_PREFIX`, `SESSION_COOKIE`, and `REDIS_PREFIX` are pinned in `.env`. Rename the SMTP `MAIL_ENCRYPTION` env var to `MAIL_SCHEME`. Acorn 6 requires PHP `>=8.3` (already the floor).
  - After upgrading, run `composer update` then `wp acorn optimize:clear`.
- Bump `webentor-core` to `0.15.1` (transparent patch within the existing `^0.15` range: focal-point `<source srcset>` fix; no API change for consumers).
- Existing projects can apply the `roots/acorn` bump via `pnpm dlx @webikon/webentor-codemods run starter-2.1.1`; the `.env` changes are a documented manual step in that codemod's README.
