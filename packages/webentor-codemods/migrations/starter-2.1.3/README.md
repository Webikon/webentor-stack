# `starter-2.1.3` — retire `.webentor/project.json` for `.webikon/project.json`

**Applies to:** consumer projects on the **2.1.2** baseline (webentor-core
`0.15.x`, Acorn 6, WP-7.0-aligned manifests). Coming from an older baseline? Run
`starter-2.1.1` then `starter-2.1.2` first.

Run from your project root:

```sh
pnpm dlx @webikon/webentor-codemods run starter-2.1.3          # preview (dry-run)
pnpm dlx @webikon/webentor-codemods run starter-2.1.3 --apply  # apply
```

This migration is **changelog-only — it declares no `rules`**, because the actual
change is a file the codemod engine cannot produce. `ast-grep` rewrites existing
syntax; it cannot create `.webikon/project.json`, delete `.webentor/project.json`,
or resolve a project-specific `theme_path`. The migration exists so the
`2.1.2 → 2.1.3` link in the chain is unbroken (a range run from 2.1.2 would
otherwise stop short and skip the changelog sync) and so the manual step below is
recorded in the project's own changelog rather than only in the stack's.

No dependency ranges moved in 2.1.3: `webentor-core` stays `^0.15` and no
manifest changed. There is nothing to reinstall or rebuild.

## 1. The manual step: migrate the metadata file

The file the maintenance reporter reads moved from `.webentor/project.json`
(schema v1) to `.webikon/project.json` (schema v2), and stopped caching versions.
Schema v2 is a closed set — exactly these keys, nothing else:

| field | required | value |
|---|---|---|
| `schema_version` | yes | `2` |
| `slug` | yes | the project slug (matches the dashboard) |
| `stack` | yes | one of `webentor-v2`, `webentor-v2-hybrid`, `webentor-v1`, `sage`, `classic` |
| `theme_path` | yes | path to the theme that declares `webentor-core`, e.g. `web/app/themes/your-theme` |
| `setup_cli_version` | no | mirrors `scripts/setup-core/composer.json`; **omit** if the project has no `scripts/setup-core` |

**Preferred — let `init` do it.** If the project carries a `scripts/setup-core`
subtree, pull it to `webentor-setup` ≥ `1.2.0` and run `init`. It writes the new
file, deletes the old one, and resolves `theme_path` as `WP_THEMES` ∩ themes that
actually declare `webentor-core` — prompting when more than one qualifies rather
than guessing. It is merge-aware: a hand-set `stack` survives a re-run, so a
hybrid project is not silently relabelled `webentor-v2`.

**Otherwise — by hand.** Create `.webikon/project.json` with the fields above and
delete `.webentor/project.json`:

```jsonc
{
    "schema_version": 2,
    "slug": "your-project-slug",
    "stack": "webentor-v2",
    "theme_path": "web/app/themes/your-theme"
}
```

Do **not** carry the v1 file's `coreVersion` / `configsVersion` / `starterVersion`
/ `setupCliVersion` across. Those are the reason for the move: the reporter now
derives each from the artefact that owns it (theme Composer lock, theme pnpm lock,
root `composer.json` `version`), so a copied value is drift waiting to happen and
schema v2 rejects the keys outright.

`setup_cli_version` is the one exception — it stays declared because its artefact
lives under `scripts/`, which is deploy-excluded, so a production host cannot read
it. That also makes it the one field that can rot: a `git subtree pull` moves the
artefact without re-running `init`. `doctor` compares the two and exits 1 on
mismatch. Always fix the declaration to match `scripts/setup-core/composer.json`,
never the reverse.

Verify with `doctor`, which now checks for the file:

```sh
bash scripts/setup-core/setup.sh doctor   # or however the project invokes it
```

## 2. Changelog sync

Prepends the `2.1.3` version block to the project's changelogs so they match the
stack:

- `changelog.md` (project root) ← `changelog/root.md` (marker `### 2.1.3`)
- `web/app/themes/*/changelog.md` ← `changelog/theme.md` (marker `### Version 2.1.3`)

Idempotent (skipped if the heading is already present) and additive (inserted under
the `# … Changelog` H1, above existing entries). If you've customized the changelog,
your entries are preserved.
