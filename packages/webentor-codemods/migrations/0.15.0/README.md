# `0.15.0` — upgrade a consumer theme to webentor-core 0.15.0 (Vite 8 / Rolldown)

**Applies to:** consumer themes moving `webentor-core` `0.13.x` → `0.15.0`. This is
the **Vite 8 / Rolldown** toolchain migration. (Coming from an older baseline? Run
the `0.13.0` codemod first.)

Run from your project root:

```sh
pnpm dlx @webikon/webentor-codemods run 0.15.0          # preview (dry-run)
pnpm dlx @webikon/webentor-codemods run 0.15.0 --apply  # apply
```

Then apply the **manual `vite.config.js` change** below, reinstall, rebuild, and
clear caches:

```sh
# in the theme dir
pnpm install && composer update
pnpm build
wp acorn optimize:clear
```

This migration has two automated rule sets — a **dependency** bump set
(`package.json` + `composer.json`) and a **static-asset glob** fix
(`resources/scripts/app.ts`) — plus one **manual** `vite.config.js` step.

## 1. Dependencies (`rules/deps.yml`, JSON)

Rewrites the theme's dependency ranges to the **0.15.0 baseline**. This is the
complete delta from the 0.13.0 baseline (theme 2.0.7) — only the Vite-8 toolchain
ranges and the `webentor-core` bump changed. Each rule matches a dependency by its
exact key (value-is-string guarded) and is scoped to `package.json` /
`composer.json` via `files:`.

| manifest | dependency | → range |
|---|---|---|
| package.json + composer.json | webentor-core | `^0.15.0` / `^0.15` |
| package.json | `vite` (major 7→8) | `^8.0.0` |
| package.json | `@roots/vite-plugin` (major 1→2) | `^2.2.0` |
| package.json | `@vitejs/plugin-react` (major 5→6) | `^6.0.0` |
| package.json | `laravel-vite-plugin` (major 2→3) | `^3.0.0` |
| package.json | `@webikon/webentor-configs` (1.0→1.1, adds the `/vite` export) | `^1.1.0` |

- **Idempotent:** re-running rewrites to the same range → no diff.
- **Baseline caveat:** the fix pins the 0.15.0 ranges, so a project already *ahead*
  within a major would be set back to it. Expected for a 0.13 → 0.15 upgrade.

After applying, run `pnpm install` + `composer update` to refresh the lockfiles.

## 2. Static-asset glob (`rules/app-glob-vite8.yml`, TS)

On Vite 7 a bare `import.meta.glob(['../images/**', '../fonts/**'])` registered
static assets into the build manifest. On Vite 8 / Rolldown a bare glob no longer
emits them, so `asset()` lookups for images/fonts (e.g. block-preview thumbnails)
404. The call must become eager and resolve each match to its versioned URL:

```ts
// before
import.meta.glob(['../images/**', '../fonts/**']);

// after
import.meta.glob(['../images/**', '../fonts/**'], {
  eager: true,
  query: '?url',
  import: 'default',
});
```

- **Conservative:** only the single-argument asset glob (its array contains an
  `images`/`fonts` pattern) is matched. The already-migrated two-argument form and
  any unrelated `import.meta.glob` (e.g. a module glob) are left untouched. A glob
  with customized paths won't match — migrate it by hand using the above.

## Changelog sync

Prepends the `2.1.0` version block to the project's changelogs so they match the
stack:

- `changelog.md` (project root) ← `changelog/root.md` (marker `### 2.1.0`)
- `web/app/themes/*/changelog.md` ← `changelog/theme.md` (marker `### Version 2.1.0`)

Idempotent (skipped if the heading is already present) and additive (inserted under
the `# … Changelog` H1, above existing entries). If you've customized a changelog,
your entries are preserved.

## 3. `vite.config.js` — WordPress externals (manual)

This step is **not** codemodded — `vite.config.js` is too project-specific to
rewrite safely. Apply it by hand. The WordPress externals interop (the
`@wordpress/*` → `wp.*` / React shims) now lives in `@webikon/webentor-configs/vite`
as `wordpressExternals(command)`, and the config must become a function of
`{ command }` so it can pick the dev vs build strategy:

```diff
  import { v4wp } from '@kucrut/vite-for-wp';
- import { wp_scripts } from '@kucrut/vite-for-wp/plugins';
  import { wordpressThemeJson } from '@roots/vite-plugin';
  import tailwindcss from '@tailwindcss/vite';
- import react from '@vitejs/plugin-react';
+ import { wordpressExternals } from '@webikon/webentor-configs/vite';
  import { glob } from 'glob';
  import { defineConfig, normalizePath } from 'vite';

- export default defineConfig({
+ export default defineConfig(({ command }) => ({
    base: '/app/themes/<your-theme>/public/build/',
    // …
    plugins: [
      // …
-     wp_scripts(),
-     react({ jsxRuntime: 'classic' }),
+     // WordPress externals (@wordpress/* -> wp.*, react -> window.React) — hybrid per
+     // command: roots wordpressPlugin + interop shims for build, kucrut wp_scripts()
+     // for the dev server. See @webikon/webentor-configs/vite.
+     ...wordpressExternals(command),
      // …
    ],
    // …
- });
+ }));
```

Reference: the starter theme's `vite.config.js` at theme 2.1.0.

## Relationship to `update-webentor-packages-in-project`

This codemod's `webentor-core` bump overlaps with the
`update-webentor-packages-in-project` flow; that's intentional — the `0.15.0`
codemod is the self-contained "bring me to 0.15.0" unit (deps + code changes).
