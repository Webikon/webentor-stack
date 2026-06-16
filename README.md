# Webentor Stack

Monorepo for Webentor shared packages and docs.

## Structure

- `packages/webentor-core`
- `packages/webentor-configs`
- `packages/webentor-setup`
- `packages/webentor-starter`
- `docs`

## Testing

The repo ships a one-command E2E harness under `test-site/` — a Bedrock install that mirrors
`webentor-starter`, with `webentor-core` symlinked from the monorepo, so blocks and runtime can
be tested against a real WordPress site.

**Prerequisites:** PHP, Composer, a running MySQL/MariaDB server (e.g. DBngin), WP-CLI, pnpm, and
Herd. Before the first run, copy `test-site/.env.example` to `test-site/.env` and set your ACF Pro
credentials (`PLUGIN_ACF_KEY`, `PLUGIN_ACF_SITE_URL`) — Composer needs them to install ACF Pro.

```bash
pnpm test:setup       # provision the test-site (composer install, build theme, install WP, link Herd)
pnpm test:e2e         # run the Playwright suite (headless)
pnpm test:e2e:ui      # run Playwright in UI mode
pnpm test:teardown    # tear the test-site back down
```

The site serves at `http://webentor-test.test` (admin `admin` / `admin`). See the **Testing Suite
(E2E)** section of `AGENTS.md` for the operational details (symlink vs copy, rebuild/cache rules,
running on a specific PHP version, the block-console checker).

## Boundaries

- `packages/webentor-setup` is mirrored to standalone `webentor-setup` for client subtree pulls.
- `packages/webentor-starter` is mirrored to standalone `webentor-starter` for client subtree pulls.

