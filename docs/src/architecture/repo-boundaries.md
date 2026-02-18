# Monorepo Boundaries

## Package boundaries inside `webentor-stack`

- `packages/webentor-core`: reusable PHP + JS runtime package.
- `packages/webentor-configs`: shared lint/format presets.
- `packages/webentor-setup`: shared setup runtime + CLI contract.
- `packages/webentor-starter`: starter template composition.
- `docs`: stack documentation (VitePress).

## External integration target

- `webentor-demo`: canonical integration project used as rollout gate.

## Ownership model

Shared/package-owned:

- reusable runtime behavior
- setup runtime contract and upgrade recipes
- shared lint/format rules
- starter baseline composition

Project-owned in consumer repos:

- `scripts/.env.setup`
- `scripts/hooks/*`
- `scripts/project-specific/*`
- business/domain code

## Setup metadata contract

Projects keep setup metadata in `.webentor/project.json`.

Current usage:

- created by `webentor-setup init`
- validated by `webentor-setup doctor`
- updated by `webentor-setup upgrade-starter`

Current non-usage:

- setup shell runtime does not read this file directly during `scripts/setup.sh`

Treat this file as CLI-facing state for setup/upgrades and keep it committed.
