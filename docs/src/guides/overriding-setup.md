# Overriding Setup Scripts

The setup runtime supports two project-safe extension models:

1. **Lifecycle hooks** for additive behavior at fixed points
2. **Function overrides** for replacing selected core setup steps

Use these mechanisms instead of editing `scripts/setup-core/` directly.

## Hook lifecycle

```
pre-env  ->  [env setup]  ->  post-env
pre-composer  ->  [composer install]  ->  post-composer
pre-deps  ->  [npm/pnpm install]  ->  post-deps
pre-wp-setup  ->  [wp install/config]  ->  post-wp-setup
pre-db-sync  ->  [db sync]  ->  post-db-sync
custom-steps  (runs after all standard steps)
```

## Hook resolution order

For each hook name, the runtime executes in this order:

1. `scripts/hooks/<hook>.sh` - single file
2. `scripts/hooks/<hook>.d/*.sh` - directory fragments (sorted by filename)
3. `scripts/project-specific/<file>.sh` - project helper file

All found scripts are executed; if none exist the step is silently skipped.

## Function Override API

If you need to **replace** a default core step (not just add extra behavior),
define overrides in:

- `scripts/project-specific/functions.sh`

Supported overrides:

- `setup_composer_override()`
- `setup_deps_override()`
- `setup_wp_override()`
- `sync_db_override()`

Runtime dispatch model:

- If `*_override` function exists, runtime executes it.
- Otherwise, runtime falls back to the corresponding core implementation.

### Example: override dependency install step

```bash
# scripts/project-specific/functions.sh
#!/usr/bin/env bash
set -e

setup_deps_override() {
  echo "Running project-specific dependency install strategy..."

  # Example: install deps in additional theme
  local theme_dir="${WORKSPACE_FOLDER}/web/app/themes/my-theme"

  if [ -f "${theme_dir}/package.json" ]; then
    (
      cd "${theme_dir}"
      pnpm install --frozen-lockfile
      pnpm build
    )
  fi
}
```

## Reusable helpers in project-specific/

Use `scripts/project-specific/` for reusable logic that belongs to your project.

### When to use this directory

- Large project logic reused across multiple hooks
- Helper functions shared by hook scripts
- Project-specific tooling wrappers

### How to use it

Source helper scripts from a hook:

```bash
# scripts/hooks/post-deps.sh
#!/usr/bin/env bash
set -e

source "$(dirname "$0")/../project-specific/my-helper.sh"
my_helper_function
```

### What NOT to put here

- Do **not** edit files in `scripts/setup-core/` (shared runtime, git-managed)
- Do **not** duplicate behavior already controlled by `scripts/.env.setup` toggles

## Hook examples

### Install extra system packages before deps

```bash
# scripts/hooks/pre-deps.sh
#!/usr/bin/env bash
set -e

echo "Installing project-specific system tools..."
if ! command -v wkhtmltopdf &>/dev/null; then
  apt-get install -y wkhtmltopdf 2>/dev/null || brew install wkhtmltopdf
fi
```

### Flush caches after WordPress setup

```bash
# scripts/hooks/post-wp-setup.d/10-cache-flush.sh
#!/usr/bin/env bash
set -e

echo "Flushing WordPress object cache..."
wp cache flush

# scripts/hooks/post-wp-setup.d/20-seed-options.sh
#!/usr/bin/env bash
set -e

echo "Setting initial site options..."
wp option update blogdescription "My Project"
wp option update admin_email "dev@example.com"
```

### Configure third-party service after env is ready

```bash
# scripts/hooks/post-env.sh
#!/usr/bin/env bash
set -e

if [ -f ".env" ]; then
  source .env
fi

echo "Configuring Algolia index..."
```

### Database import from a custom source

```bash
# scripts/hooks/pre-db-sync.sh
#!/usr/bin/env bash
set -e

echo "Downloading latest DB dump from staging..."
ssh staging.example.com "wp db export - | gzip" > /tmp/staging-db.sql.gz
gunzip /tmp/staging-db.sql.gz
wp db import /tmp/staging-db.sql
```

### Custom step for project initialization

```bash
# scripts/hooks/custom-steps.sh
#!/usr/bin/env bash
set -e

echo "Running project-specific initialization..."
wp user create devuser dev@example.com --role=administrator --user_pass=secret123
wp plugin activate my-custom-plugin
```

## Debugging

Run setup with shell tracing:

```bash
bash -x scripts/setup.sh 2>&1 | head -100
```

Or add `set -x` to a single hook while debugging that one step.
