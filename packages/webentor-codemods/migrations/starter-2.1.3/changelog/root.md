### 2.1.3

- **Project metadata moved to `.webikon/project.json` (schema v2); `.webentor/project.json` is retired.** The new file declares only `schema_version`, `slug`, `stack` and `theme_path` — every version the old file cached is now derived by the maintenance reporter (≥ 2.5.0) from the manifest that owns it, so those values can no longer drift. `setup_cli_version` is the sole declared version, and only on projects that carry a `scripts/setup-core` subtree.
- **This step is manual — the codemod cannot do it.** Run `init` from a `scripts/setup-core` subtree at `webentor-setup` ≥ 1.2.0: it writes the new file and deletes the old one, resolving `theme_path` against the themes that actually declare `webentor-core` rather than guessing. Without the subtree, create `.webikon/project.json` by hand from the four fields above and delete `.webentor/project.json`.
- No dependency changes in this release: `webentor-core` stays `^0.15` and no manifest range moved.
