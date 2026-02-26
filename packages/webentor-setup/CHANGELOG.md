# Webentor Setup Changelog

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
