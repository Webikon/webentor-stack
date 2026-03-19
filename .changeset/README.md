# Legacy Changesets Notes

This directory is not the source of truth for release preparation anymore.
Package version bumps and `CHANGELOG.md` updates are maintained manually in the
package files tracked in the repository.

Keep the existing repository release workflow, but prepare release metadata by
editing the authoritative version files and changelog files directly.
See `AGENTS.md` for the version source map and release policy.

Packages currently released from this monorepo:

- `@webikon/webentor-configs`
- `@webikon/webentor-core` (npm artifact)
- `webikon/webentor-core` (Composer artifact managed in parallel)
