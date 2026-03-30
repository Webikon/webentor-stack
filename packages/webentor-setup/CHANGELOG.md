# Webentor Setup Changelog

## 1.0.3

- Add configurable `WP_THEMES_DIR` for non-Bedrock project support

## 1.0.2

- Improve init UX
- Add basic project files scaffolding

## 1.0.1

- Fix migratedb command
- Remove unused init script
- Fix error handling
- Improve multisite handling

## 1.0.0

- Extracted setup runtime from starter into standalone repository.
- Added hook runner with project-owned extension points.
- Added feature toggles in `.env.setup` contract.
- Added thin `webentor-setup` CLI (`init`, `upgrade-starter`, `doctor`).
- Added upgrade manifest support with dry-run markdown reporting.
