# Database Sync

The setup runtime includes an optional database sync step that pulls a remote
database into your local environment during setup.

## Enable database sync

In `scripts/.env.setup`:

```dotenv
SETUP_DB_SYNC=true
```

Or pass `--with-db-sync true` when initializing a project:

```bash
scripts/setup-core/bin/webentor-setup init \
  --project my-project \
  --with-db-sync true
```

This records `withDbSync: true` in `.webentor/project.json` and sets the toggle
in `scripts/.env.setup`.

## Hook integration

Database sync is surrounded by two hooks:

| Hook | When |
|---|---|
| `pre-db-sync` | Before the sync step runs |
| `post-db-sync` | After the sync completes |

Implement the actual sync logic in `scripts/hooks/pre-db-sync.sh` or a
project-specific helper. The runtime step itself only triggers the hooks —
you supply the download and import commands.

### Example: SSH dump import

```bash
# scripts/hooks/pre-db-sync.sh
#!/usr/bin/env bash
set -e

echo "Pulling database from staging..."
ssh deploy@staging.example.com \
  "wp db export --allow-root - | gzip -c" \
  > /tmp/staging.sql.gz

gunzip /tmp/staging.sql.gz
wp db import /tmp/staging.sql
rm /tmp/staging.sql

echo "Running search-replace for local URL..."
wp search-replace 'https://staging.example.com' 'http://myproject.test' \
  --skip-columns=guid
```

### Example: WP-CLI sync from remote via Robo/Deployer

```bash
# scripts/hooks/pre-db-sync.sh
#!/usr/bin/env bash
set -e

wp db export --add-drop-table /tmp/backup.sql  # local backup first
./vendor/bin/dep db:pull staging
```

## Post-sync cleanup

Use `post-db-sync` to run additional WP-CLI commands after the database is
imported:

```bash
# scripts/hooks/post-db-sync.sh
#!/usr/bin/env bash
set -e

wp cache flush
wp option update siteurl "$(wp eval 'echo home_url();')"
wp user update 1 --user_pass=password
```

## Multisite notes

Multisite search-replace requires iterating over all sites:

```bash
# For WordPress multisite
wp search-replace 'https://staging.example.com' 'http://myproject.test' \
  --network --skip-columns=guid
```

> **Note:** Automated multisite DB sync is not yet built into the setup runtime.
> For multisite projects, implement the full sync logic in `pre-db-sync.sh`.

## Skipping DB sync in CI

In CI/CD pipelines, DB sync is typically unwanted. Ensure `SETUP_DB_SYNC=false`
is set in your pipeline environment or in the CI-specific `.env.setup` override.
