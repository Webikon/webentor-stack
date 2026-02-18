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
# TODO: replace <starter-repo-url> with your internal starter/reference URL
git clone <starter-repo-url> <project-dir>
cd <project-dir>
```

## 3. Initialize project metadata and setup contract

Run setup CLI init once per project:

```bash
scripts/setup-core/bin/webentor-setup init \
  --project <slug> \
  --starter-version latest \
  --with-db-sync true
```

This prepares project-owned setup extension points and metadata:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`
- `.webentor/project.json`

## 4. Configure `scripts/.env.setup`

At minimum, review:

- `OP_VAULT_ID`
- `OP_ITEM_ID`
- `WP_THEMES`
- setup toggles (`SETUP_1PASSWORD`, `SETUP_DB_SYNC`, `SETUP_TYPESENSE`, etc.)

If you do not use 1Password, set:

```dotenv
SETUP_1PASSWORD=false
SETUP_ENV_CHECK=false
```

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

## Hooks and project customization for setup scripts

Do not edit shared setup runtime files under `scripts/setup-core/`.
Put project-specific behavior in:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`

For hook resolution order, function overrides, and project-specific setup extension
patterns, see [Overriding Setup Scripts](../guides/overriding-setup.md).
