# Webentor Stack AI Guide

This file is for AI coding agents working in `webentor-stack`.

## Purpose

`webentor-stack` is the source of truth for shared Webentor packages and docs.
The monorepo exists to keep versioning and integration changes coordinated.

## Repository Map

- `packages/webentor-core`: shared PHP + JS runtime package.
- `packages/webentor-configs`: shared ESLint/Stylelint/Prettier/static config package.
- `packages/webentor-setup`: shared setup runtime + setup CLI.
- `packages/webentor-starter`: template composition package that consumes shared packages.
- `docs`: VitePress documentation project.

## Non-Negotiable Boundaries

- `webentor-demo` is not part of this monorepo; it is a separate integration-gate repository.
- `packages/webentor-setup` and `packages/webentor-starter` are mirrored to standalone repositories.
- In consumer projects, `scripts/setup-core/` is git-managed runtime code.
- Project-specific setup customizations must live in:
  - `scripts/.env.setup`
  - `scripts/hooks/`
  - `scripts/project-specific/`

## Dependency Direction

Allowed direction:

- `webentor-starter` -> `webentor-core`, `webentor-configs`, `webentor-setup` (as runtime copy/subtree output)
- `webentor-demo` (external) -> released outputs from monorepo packages

Avoid reverse dependencies from shared packages back into starter/demo.

## Setup Runtime Contract

`packages/webentor-setup` defines setup contract.
If setup runtime behavior changes, update all of these together:

1. runtime scripts (`common.sh`, helpers, platform scripts)
2. CLI behavior (`src/webentor-setup.php`) when relevant
3. docs/README contract text
4. upgrade manifests in `upgrades/<version>/manifest.json` if migration behavior changes

## Setup-Core Consumption Rule

In starter/demo consumers:

- `scripts/setup.sh` is only a thin wrapper.
- `scripts/setup-core/` should be treated as synchronized runtime payload.
- Do not place project business logic in `setup-core`.

When `packages/webentor-setup` changes, keep consumer runtime in sync intentionally.

## Release and Rollout Order

Default order for coordinated releases:

1. `webentor-core` and/or `webentor-configs`
2. `webentor-setup` (including any upgrade recipe)
3. `webentor-starter`
4. `webentor-demo` bump/validation (external repo)

Shared release is not complete until demo CI is green.

## Versioning Policy

- Use independent semver per package; do not force shared version numbers across the monorepo.
- On every version bump or release request, update `docs/src/compatibility-matrix.md` with the tested-together version set.
- AI agents must explicitly remind users about the compatibility matrix update when handling versioning/release tasks.

## Version Bump Map

Use this map to quickly locate all version sources per package.

- `webentor-core` (beta, `0.9.x`):
  - `packages/webentor-core/package.json` -> `"version"`
  - `packages/webentor-core/composer.json` -> `"version"`
  - `packages/webentor-core/CHANGELOG.md` -> add new entry at top
  - npm publishing/version PR is handled via Changesets (`pnpm changeset`, `release.yml`)
- `webentor-configs` (stable, `1.x`):
  - `packages/webentor-configs/package.json` -> `"version"`
  - `packages/webentor-configs/CHANGELOG.md` -> add new entry at top
  - npm publishing/version PR is handled via Changesets (`pnpm changeset`, `release.yml`)
- `webentor-setup` (stable, `1.x`):
  - `packages/webentor-setup/CHANGELOG.md` -> add new entry at top
  - Runtime is mirrored via split workflow (no npm publish)
  - Note: `packages/webentor-setup/composer.json` currently has no `"version"` field; if added later, treat it as a version source
- `webentor-starter` (stable, `2.x`):
  - `packages/webentor-starter/composer.json` -> `"version"`
  - `packages/webentor-starter/changelog.md` -> add new entry at top
  - Runtime is mirrored via split workflow (no npm publish)
- `webentor-theme-v2` (stable, `2.x`, inside starter):
  - `packages/webentor-starter/web/app/themes/webentor-theme-v2/package.json` -> `"version"`
  - `packages/webentor-starter/web/app/themes/webentor-theme-v2/composer.json` -> `"version"`
  - `packages/webentor-starter/web/app/themes/webentor-theme-v2/style.css` -> `Version:` header
  - `packages/webentor-starter/web/app/themes/webentor-theme-v2/changelog.md` -> add new entry at top
  - Keep all theme version sources synchronized in the same bump

## Mirror Policy

Mirror target:

- `packages/webentor-setup` only
- `packages/webentor-starter` only

Mirror workflow:

- `.github/workflows/split-webentor-setup.yml`
- `.github/workflows/split-webentor-starter.yml`
- `scripts/split-webentor-setup.sh`
- `scripts/split-webentor-starter.sh`

Do not introduce additional split mirrors beyond setup/starter unless explicitly requested.

## AI Editing Rules

- Prefer minimal, contract-preserving edits.
- Preserve comments that explain operational intent, especially in setup scripts.
- Do not silently remove troubleshooting paths (1Password, env fallback, platform-specific behavior).
- Keep file paths and command examples consistent with `scripts/setup-core` naming.
- Avoid editing unrelated files in large migrations.

## Validation Checklist for AI Changes

Before handoff, run relevant checks:

- Shell syntax for setup scripts:
  - `find packages/webentor-setup -type f -name '*.sh' -print0 | xargs -0 -n1 bash -n`
- Shell syntax for split mirror scripts:
  - `bash -n scripts/split-webentor-setup.sh`
  - `bash -n scripts/split-webentor-starter.sh`
- Setup CLI syntax:
  - `php -l packages/webentor-setup/src/webentor-setup.php`
- JSON validity for changed `package.json` or manifest files.
- If starter touched, verify wrapper paths and setup-core references.

## Common Mistakes to Avoid

- Breaking 1Password `.env` fetch flow (`OP_VAULT_ID` + `OP_ITEM_ID` + `env-valet`).
- Mixing project-specific hooks into `setup-core`.
- Releasing package changes without considering demo compatibility.

## Decision Rule

If uncertain whether a change belongs in shared runtime or project customization:

- Put reusable behavior in `packages/webentor-setup`.
- Put project-specific behavior in hooks/env files outside `setup-core`.
