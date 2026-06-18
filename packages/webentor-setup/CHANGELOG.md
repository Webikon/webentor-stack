# Webentor Setup Changelog

## 1.1.0

- Remove the `upgrade-starter` command and its manifest-based file transforms (`replace_text`, `remove_path`, `ensure_directory`) along with the `upgrades/` recipe directory. The mechanism was unused (no manifests ever shipped) and is superseded by [`@webikon/webentor-codemods`](../webentor-codemods), which handles consumer code transforms across `webentor-core` updates. `init` and `doctor` are unchanged; syncing `scripts/setup-core` from tagged releases via `git subtree pull` is unaffected.

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
