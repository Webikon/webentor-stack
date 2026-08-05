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

## Bump the declared setup CLI version

A subtree pull is a **two-part change**. `.webikon/project.json` declares
`setup_cli_version` because its artifact — `scripts/setup-core/composer.json` —
lives under the deploy-excluded `scripts/`, so a deployed site can only report the
declaration. Pull the subtree without updating it and the maintenance dashboard
reports a setup CLI version the project does not run.

Set the declaration to match the artifact — never the reverse:

```bash
jq -r .version scripts/setup-core/composer.json   # the value to declare
```

Then edit `setup_cli_version` in `.webikon/project.json`, in this same commit.

## Validation after pull

```bash
bash -n scripts/setup-core/setup.sh
php -l scripts/setup-core/src/webentor-setup.php
scripts/setup-core/bin/webentor-setup doctor --cwd .
```

`doctor` exits 1 if `setup_cli_version` still disagrees with the pulled
composer.json, and prints the exact fix.

## Commit and open PR

```bash
git add scripts/setup-core .webikon/project.json
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
