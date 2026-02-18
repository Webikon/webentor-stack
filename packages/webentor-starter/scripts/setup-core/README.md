# webentor-setup

Shared setup runtime and thin CLI for Webentor starter/reference projects.

## Runtime Contract

Projects consume this repository via `git subtree` into `scripts/setup-core/`.

`setup-core` is git-managed runtime code. Do not place project-specific edits inside this folder.
Use project-owned extension points instead:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`

## OS Script Layout

OS-specific setup scripts live under dedicated folders:

- `scripts/setup-core/win/` for Windows-specific runtime steps
- `scripts/setup-core/mac/` for macOS-specific runtime steps

## Hook API

Supported hook names:

- `pre-env`
- `post-env`
- `pre-composer`
- `post-composer`
- `pre-deps`
- `post-deps`
- `pre-wp-setup`
- `post-wp-setup`
- `pre-db-sync`
- `post-db-sync`
- `custom-steps`

Hooks can be placed in:

- `scripts/hooks/<hook>.sh`
- `scripts/hooks/<hook>.d/*.sh`
- `scripts/project-specific/<hook>.sh`

## Function Override API

Projects can override selected helper steps without patching `setup-core`.

- Add `scripts/project-specific/functions.sh`
- Define one or more `*_override` functions to replace default steps:
  - `setup_composer_override()`
  - `setup_deps_override()`
  - `setup_wp_override()`
  - `sync_db_override()`
- If an override is not defined, setup falls back to the core implementation automatically

## CLI

```bash
# --with-db-sync defaults to true; pass --with-db-sync false to disable it.
bin/webentor-setup init --project my-project --starter-version latest
bin/webentor-setup upgrade-starter --from 0.9.0 --to 1.0.0 --cwd /path/to/project --dry-run true
bin/webentor-setup doctor --cwd /path/to/project
```

## Upgrade Recipes

Recipes are stored in `upgrades/<starter-version>/manifest.json`.
Each manifest defines deterministic transforms that avoid project-owned paths.
