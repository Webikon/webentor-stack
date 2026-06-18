# Starter Upgrades

Keeping a project current spans two independent tracks:

1. **Sync the shared setup runtime** (`scripts/setup-core`) from a tagged
   `webentor-setup` release (covered below).
2. **Apply code changes** a `webentor-core` update requires in consumer theme
   code (PHP / TS / CSS / JSON) — handled by
   [codemods](./codemods.md), not by the setup CLI.

## Prerequisites

- Keep your working tree clean before running subtree updates.
- Do not place project-specific custom code inside `scripts/setup-core`.
- Keep project-specific behavior in:
  - `scripts/.env.setup`
  - `scripts/hooks/`
  - `scripts/project-specific/`

## Manual setup-core update (recommended)

The `webentor-setup` remote already exists from the initial `git subtree add`
during project init:

```bash
git checkout main
git pull

# Fetch latest tags
git fetch webentor-setup --tags

# Create update branch
git checkout -b chore/update-setup-core-vX-Y-Z

# Pull tagged runtime snapshot into subtree payload
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

## Conflict handling

- If conflicts occur inside `scripts/setup-core`, resolve them with minimal
  changes.
- If the conflict is project-specific behavior, move that behavior to
  `scripts/.env.setup`, `scripts/hooks/`, or `scripts/project-specific/` and
  keep `scripts/setup-core` generic.

## Applying code changes from a core update

When a `webentor-core` release requires a mechanical change to your theme code,
run the matching codemod instead of editing by hand:

```bash
pnpm dlx @webikon/webentor-codemods list
pnpm dlx @webikon/webentor-codemods run <id>           # dry-run
pnpm dlx @webikon/webentor-codemods run <id> --apply
```

See [Codemods](./codemods.md) for the full list and details.
