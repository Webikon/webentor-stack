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
It is populated via `git subtree` from the `webentor-setup` package and should
**not** be edited directly in projects. Update it by pulling a new tag.

## setup metadata

The `.webentor/project.json` file at the project root. It is created by
`webentor-setup init` and updated by `webentor-setup upgrade-starter`. It
records which versions of the stack a project is using and stores setup-time
configuration like `envSource` and `ciProvider`.

## setup runtime

The combination of `scripts/setup-core/setup.sh` and platform-specific scripts
(`mac/mac.sh`, `win/win.sh`, etc.) that orchestrate a full environment setup. Also
referred to as "setup-core runtime".

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

## webentor-starter

The complete WordPress starter template that ties together all webentor packages.
Built on Bedrock + Sage 10. New projects are typically initialized from this
template.
