# Glossary

## hook

A bash script (or directory of scripts) placed in `scripts/hooks/` that the
setup runtime executes at a specific lifecycle point. Hooks extend setup
behavior without modifying shared runtime code. See [Overriding Setup Scripts](./guides/overriding-setup.md).

## project-owned path

A file or directory that belongs to the consuming project, not to the shared
`setup-core` runtime. Project-owned paths are never overwritten by
`webentor-setup upgrade-starter`. The current list:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`

## setup-core

The shared setup runtime that lives in `scripts/setup-core/` inside a project.
It is added via `git subtree add` from a tagged `webentor-setup` release during
project init and should **not** be edited directly. Update it by pulling a new
tag with `git subtree pull`.

## setup metadata

The `.webentor/project.json` file at the project root. It is created by
`webentor-setup init` and updated by `webentor-setup upgrade-starter`. It
records which versions of the stack a project is using and stores setup-time
configuration like `withDbSync` and `withTypesense`.

## setup runtime

The combination of `scripts/setup-core/setup.sh` and platform-specific scripts
(`mac/mac.sh`, `win/win.sh`, etc.) that orchestrate a full environment setup. Also
referred to as "setup-core runtime".

## setup scaffolding

The generated files outside `setup-core` that `webentor-setup init` creates:
`scripts/.env.setup`, `scripts/setup.sh`, `scripts/hooks/`,
`scripts/project-specific/`, and optionally `scripts/ts-up.sh` and
`scripts/docker-compose.typesense.yml`. These are project-owned and not part
of the subtree.

## upgrade manifest

A `manifest.json` file inside `scripts/setup-core/upgrades/<version>/` that
describes a set of deterministic transforms (text replacements, path deletions,
directory creations) to apply during a `webentor-setup upgrade-starter` run.

## webentor-core

The shared PHP + JavaScript runtime package (`@webikon/webentor-core`). It
provides reusable block utilities, image helpers, Alpine.js components, and
WordPress filters. Published to both npm (GitHub Packages) and Composer.

## webentor-configs

The centralized lint and formatting preset package (`@webikon/webentor-configs`).
Provides shared ESLint, Stylelint, Prettier, PHPCS, and Blade formatter configs.

## webentor-setup

The package that contains the `setup-core` runtime (bash scripts + PHP CLI).
Published as a standalone GitHub repository and consumed via `git subtree`.
The `init` command generates all project scaffolding (`scripts/`, `.webentor/`)
from CLI flags.

## webentor-starter

The WordPress project skeleton template. Built on Bedrock + Sage 10. Contains
only the WordPress/theme structure — all setup scaffolding is added via
`git subtree add` (for `setup-core`) and `webentor-setup init` (for generated
files).
