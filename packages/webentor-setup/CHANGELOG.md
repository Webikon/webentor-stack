# Webentor Setup Changelog

## 1.2.0

- **`init` now writes `.webikon/project.json` (schema v2) and deletes `.webentor/project.json`.** The new file carries four required fields — `schema_version`, `slug`, `stack`, `theme_path` — plus the optional `setup_cli_version`, and nothing else. Every version and feature flag the old file cached is now derived by the maintenance reporter (≥ 2.5.0) from the artefact that owns it: the theme's Composer lock for `webentor-core`, the root `composer.json` `version` for the starter release, the theme's pnpm lock for `webentor-configs`, `scripts/setup-core/composer.json` for this CLI, and `scripts/.env.setup` for the toggles. Those cached values drifted on every project that re-ran `init`, or that updated a package without re-running it.
- **`init` is now merge-aware and never clobbers a hand-set `stack`.** A hybrid project — one consuming `webentor-core` without starter lineage — is indistinguishable from a full stack at init time, so a declared value wins over the `webentor-v2` default. `--stack` overrides it explicitly and is validated against the closed set `webentor-v2`, `webentor-v2-hybrid`, `webentor-v1`, `sage`, `classic`. Layout (bedrock vs classic) is deliberately not part of that set: the reporter derives it, so a project cannot declare one thing and be another.
- **`theme_path` resolves as `WP_THEMES` ∩ themes that actually declare `webentor-core`.** `WP_THEMES` lists every theme the setup builds deps for, so on a multi-theme project it is a superset and propagating it verbatim would name the wrong theme. Where more than one member consumes core, `init` prompts. Where none does, the field is omitted with a loud warning rather than guessed.
- **`setup_cli_version` is declared, not derived — and `doctor` now fails on drift.** It is the one version the file carries, because its artefact (`scripts/setup-core/composer.json`) lives under `scripts/`, which is deploy-excluded: without the declaration a production host cannot report a setup CLI version at all. `init` mirrors the artefact and never substitutes the running CLI's own version, so a project with no `scripts/setup-core` gets no field. Because a `git subtree pull` moves the artefact without re-running `init`, this is the one field that can rot — `doctor` compares the two and exits 1 on mismatch, printing the exact fix. Always correct the declaration to match the artefact, never the reverse.
- Removed `--starter-version`: it only ever fed the metadata file, and its `latest` default was being persisted as though it were a version number.
- Removed the now-dead `detectCoreVersion`, `detectConfigsVersion`, `detectPhpConstraint`, `detectNodeConstraint`, `detectSetupCliVersion` and `scanThemeFiles` helpers.
- `doctor` checks for `.webikon/project.json`.

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
