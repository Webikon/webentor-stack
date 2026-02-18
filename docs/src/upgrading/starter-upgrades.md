# Starter Upgrades

Use this guide for two different upgrade tracks:

1. Syncing shared setup runtime (`scripts/setup-core`) from `webentor-setup`
   tags
2. Applying starter file transforms between starter versions via
   `webentor-setup upgrade-starter`

## Prerequisites

- Keep your working tree clean before running subtree updates.
- Do not place project-specific custom code inside `scripts/setup-core`.
- Keep project-specific behavior in:
  - `scripts/.env.setup`
  - `scripts/hooks/`
  - `scripts/project-specific/`

## Manual setup-core update (recommended)

```bash
# in project root
git checkout main
git pull

# fetch setup runtime tags (first time: add remote alias)
git remote add webentor-setup https://github.com/Webikon/webentor-setup.git 2>/dev/null || true
git fetch webentor-setup --tags

# create update branch
git checkout -b chore/update-setup-core-vX-Y-Z

# pull tagged runtime snapshot into subtree payload
git subtree pull --prefix=scripts/setup-core webentor-setup vX.Y.Z --squash
```

Default source is release tags (`vX.Y.Z`), not `main`.

## Validation after pull

```bash
bash -n scripts/setup-core/setup.sh
php -l scripts/setup-core/src/webentor-setup.php
scripts/setup-core/bin/webentor-setup doctor --cwd .
```

## Commit and open PR

```bash
git add scripts/setup-core
git commit -m "chore(setup): sync setup-core to webentor-setup vX.Y.Z"
git push -u origin chore/update-setup-core-vX-Y-Z
```

## Version-to-version starter upgrade

Use this when moving project starter contract from one version to another:
for example `1.0.0` to `1.1.0`.

### 1) Dry-run first

```bash
scripts/setup-core/bin/webentor-setup upgrade-starter \
  --from <current-starter-version> \
  --to <target-starter-version> \
  --cwd . \
  --dry-run true
```

This command generates:

- console summary
- markdown report at `upgrade-report-<from>-to-<to>.md`

Review the report before applying changes.

### 2) Apply transforms

```bash
scripts/setup-core/bin/webentor-setup upgrade-starter \
  --from <current-starter-version> \
  --to <target-starter-version> \
  --cwd . \
  --dry-run false
```

### 3) Validate after apply

```bash
scripts/setup-core/bin/webentor-setup doctor --cwd .
bash scripts/setup.sh
```

### Transform behavior

`upgrade-starter` reads manifest from:
`scripts/setup-core/upgrades/<target-version>/manifest.json`

Current transform types:

- `remove_path`
- `replace_text`
- `ensure_directory`

Project-owned paths are intentionally protected and skipped:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`

`.webentor/project.json` is updated by the command to track new starter
version metadata.

## Conflict handling

- If conflicts occur inside `scripts/setup-core`, resolve them with minimal
  changes.
- If the conflict is project-specific behavior, move that behavior to
  `scripts/.env.setup`, `scripts/hooks/`, or `scripts/project-specific/` and
  keep `scripts/setup-core` generic.
