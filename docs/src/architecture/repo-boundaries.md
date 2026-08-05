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

Projects keep setup metadata in `.webikon/project.json` (schema v2). It declares
four required fields — `schema_version`, `slug`, `stack`, `theme_path` — plus the
optional `setup_cli_version`, written only where the project has a
`scripts/setup-core/` subtree.

Current usage:

- created by `webentor-setup init`, which preserves a hand-set `stack` on re-runs
- validated by `webentor-setup doctor`, which also fails on `setup_cli_version`
  drift
- read by external tooling that needs the project's declared identity

Current non-usage:

- setup shell runtime does not read this file directly during `scripts/setup.sh`
- it caches no feature toggles, and no version other than `setup_cli_version` —
  everything else is read from the artifact that owns it (theme Composer/pnpm
  lockfiles, root `composer.json`, `scripts/.env.setup`). Note `scripts/` is
  deploy-excluded, so the `SETUP_*` toggles are a checkout-only fact and the
  maintenance reporter does not carry them at all.

`setup_cli_version` is the one boundary the file deliberately crosses. Its
artifact, `scripts/setup-core/composer.json`, sits behind the same deploy exclusion
as the toggles — but unlike the toggles, something *does* act on it, so the value
has to reach a deployed site somehow, and the declaration is that route. The
inclusion rule reads accordingly: a fact must not be derivable **from a deployed
site**, which is stricter than "not derivable in the repo". `init` mirrors the
artifact and never substitutes the running CLI's own version, so a project without
setup-core has no such field. Because the value is declared, it can drift — a
`git subtree pull` moves the artifact alone — so `doctor` exits 1 on mismatch and
`webikon:update-webentor-packages-in-project` blocks. Fix the declaration to match
the artifact, never the reverse.

Treat this file as declared project identity and keep it committed. The retired
v1 file (`.webentor/project.json`) is deleted by `init`.
