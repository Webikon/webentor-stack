# Troubleshooting

## Registry auth errors

- Confirm npm auth for GitHub Packages.
- Confirm Composer auth for private packages.

## Hook conflicts

- Keep custom logic in `scripts/hooks/` or `scripts/project-specific/`.
- Avoid editing shared subtree files directly.

## Subtree sync issues

- Re-sync setup subtree from `webentor-setup` and re-run `webentor-setup doctor`.

## Upgrade manifest not found

- `upgrade-starter` requires `scripts/setup-core/upgrades/<target>/manifest.json`.
- Sync `scripts/setup-core` to a `webentor-setup` tag that contains your target
  manifest, then run dry-run again.

## Missing setup metadata file

- If `webentor-setup doctor` reports missing `.webentor/project.json`, run:
  `scripts/setup-core/bin/webentor-setup init --project <slug> --starter-version <version> --with-db-sync false --env-source 1password --ci-provider gitlab`
- Commit `.webentor/project.json` after initialization.

---

## Setup fails at environment check step

**Symptom:** Setup exits with `env-check failed` or a tool is reported as missing.

**Causes and fixes:**

| Missing tool | Fix |
|---|---|
| `php` | Install PHP 8.3+ via [Herd](https://herd.laravel.com/) (macOS) or [Laragon](https://laragon.org/) (Windows) |
| `composer` | Install from [getcomposer.org](https://getcomposer.org/) |
| `pnpm` | Run `npm install -g pnpm` or `corepack enable && corepack prepare pnpm@latest --activate` |
| `node` | Install Node 20+ via [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| `op` (1Password CLI) | Install from [1password.com/downloads/command-line](https://1password.com/downloads/command-line/) |

To skip the env check entirely:

```dotenv
# scripts/.env.setup
SETUP_ENV_CHECK=false
```

---

## 1Password fetch fails

**Symptom:** Setup exits with `401 Unauthorized`, `Item not found`, or `op: command not found`.

See the full [1Password setup guide](../guides/1password-setup.md) for detailed
steps and a complete error reference table.

**Quick checks:**

```bash
# Verify CLI is installed
op --version

# Verify you are signed in
op account list

# Test fetching your item
op item get "$OP_ITEM_ID" --vault "$OP_VAULT_ID" --format json | jq .
```

---

## Composer install fails

**Private package auth error:**

```bash
composer config --global http-basic.composer.example.com username token
```

Or add auth to `auth.json` in the project root (do not commit this file).

**Timeout errors:** Increase Composer process timeout:

```bash
COMPOSER_PROCESS_TIMEOUT=600 composer install
```

---

## npm/pnpm install fails

**Node version mismatch:**

```bash
node -v       # check current version
cat .nvmrc    # check required version (if present)
nvm use       # switch version
```

**Workspace resolution error:** Run from the theme root, not the project root:

```bash
cd web/app/themes/webentor-theme-v2
pnpm install
```

---

## Git subtree pull conflicts

When pulling a `setup-core` update results in merge conflicts:

1. Identify conflicting files: `git status`
2. **Do not** accept the `setup-core` version for files in `scripts/hooks/`,
   `scripts/project-specific/`, or `scripts/.env.setup` — these are
   project-owned.
3. Accept the incoming version for all other files in `scripts/setup-core/`
4. Commit the merge resolution

```bash
# Accept incoming for a setup-core file
git checkout --theirs scripts/setup-core/common.sh
git add scripts/setup-core/common.sh

# Keep your version for a project-owned file
git checkout --ours scripts/hooks/post-deps.sh
git add scripts/hooks/post-deps.sh

git commit -m "Resolve setup-core subtree merge conflicts"
```

---

## GrumPHP / pre-commit hook fails

**Hook exits with a lint error:**

```bash
# Run lint manually to see the full output
pnpm lint          # JS/CSS
pnpm lint:php      # PHP (from theme directory)
```

**Hook not found / not executable:**

```bash
# Re-install husky hooks
pnpm run prepare
```

**Skip hooks temporarily (use sparingly):**

```bash
git commit --no-verify -m "WIP"
```

---

## Windows: PowerShell vs Git Bash

The setup scripts require a bash-compatible shell. On Windows:

- Use **Git Bash** (bundled with Git for Windows) or **WSL2**
- Do **not** run `setup.sh` from PowerShell or Command Prompt
- Herd and Laragon users: open Git Bash from the project root

---

## Dev Container setup times out or 1Password CLI not found

- Ensure Docker Desktop is running before opening in a Dev Container
- If 1Password CLI is not available in the container:
  ```dotenv
  # scripts/.env.setup
  SETUP_1PASSWORD=false
  ```
  Then provide `.env` via a Docker volume mount or CI secret
- For slow first-time builds: increase Docker Desktop memory limit to at least 4 GB
