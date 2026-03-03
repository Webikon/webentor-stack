# Setup & Init

You have nothing locally and want a runnable Webentor project. Start here.

## 1. Prerequisites

- PHP 8.3+
- Composer 2.x
- Node.js 20+ and `pnpm`
- Git
- WP-CLI (`wp`) recommended
- 1Password CLI optional (required only when using `SETUP_1PASSWORD=true`)

## 2. Clone starter project

```bash
git clone https://github.com/Webikon/webentor-starter my-project
cd my-project
```

## 3. Add webentor-setup as git subtree

This brings the shared setup runtime into `scripts/setup-core/`:

```bash
git remote add webentor-setup https://github.com/Webikon/webentor-setup.git
git fetch webentor-setup --tags
git subtree add --prefix=scripts/setup-core webentor-setup v1.0.2 --squash
```

Replace `v1.0.2` with the latest `webentor-setup` tag.

## 4. Initialize project scaffolding

Run the setup CLI. Without flags it walks you through interactive prompts:

```bash
scripts/setup-core/bin/webentor-setup init
```

The prompts ask for project slug, 1Password usage (with vault/item IDs when
enabled), DB sync, and Typesense. Any option can be pre-set via flag to skip
its prompt — useful for CI or scripted init:

```bash
scripts/setup-core/bin/webentor-setup init \
  --project my-project \
  --with-1password false \
  --with-db-sync true \
  --with-typesense false
```

This generates:

- `scripts/.env.setup` — runtime config derived from your answers/flags
- `scripts/setup.sh` — thin wrapper around `scripts/setup-core/`
- `scripts/hooks/` — lifecycle hook directory
- `scripts/project-specific/` — project helper directory
- `scripts/ts-up.sh` — only when Typesense is enabled
- `scripts/docker-compose.typesense.yml` — only when Typesense is enabled
- `.webentor/project.json` — project metadata

## 5. Run project setup

```bash
bash scripts/setup.sh
```

This wrapper calls the shared runtime in `scripts/setup-core/`.

## 6. Start theme development

```bash
cd web/app/themes/webentor-theme-v2
pnpm install
pnpm dev
```

## 7. Quick verification checklist

- Setup finished without hard errors.
- WordPress instance is reachable.
- Theme dev server compiles with no unresolved imports.
- `scripts/.env.setup` and `.webentor/project.json` are present.
- Hooks and project-specific folders exist for future customization.

## Local environment overrides

To override `.env` values locally without affecting the team, create a `.env.local` file. Bedrock loads it automatically and its values take precedence over `.env`.

## Hooks and project customization for setup scripts

Do not edit shared setup runtime files under `scripts/setup-core/`.
Put project-specific behavior in:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`

For hook resolution order, function overrides, and project-specific setup extension
patterns, see [Overriding Setup Scripts](../guides/overriding-setup.md).
