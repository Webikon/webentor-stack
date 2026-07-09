#!/usr/bin/env bash
set -euo pipefail

# Pushes the namespaced release tag for every mirrored package whose
# committed version is not tagged yet, then dispatches the matching split
# workflow. The dispatch is required because tag pushes made with the
# workflow's GITHUB_TOKEN do not trigger `on: push: tags` workflows.
#
# Requires: git remote "origin", gh CLI authenticated (GH_TOKEN in CI).
# Set DRY_RUN=true to only report what would happen.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DRY_RUN="${DRY_RUN:-false}"

# namespace | version manifest | split workflow
SPECS="
core|packages/webentor-core/package.json|split-webentor-core.yml
setup|packages/webentor-setup/composer.json|split-webentor-setup.yml
starter|packages/webentor-starter/composer.json|split-webentor-starter.yml
"

while IFS='|' read -r ns manifest workflow; do
  [ -z "$ns" ] && continue

  version="$(node -p "require('./${manifest}').version")"
  tag="${ns}-v${version}"

  if git ls-remote --exit-code --tags origin "refs/tags/${tag}" >/dev/null 2>&1; then
    echo "${tag} already exists on origin, skipping."
    continue
  fi

  if [ "$DRY_RUN" = "true" ]; then
    echo "[dry-run] Would tag ${tag} and dispatch ${workflow}."
    continue
  fi

  echo "Tagging ${tag} and dispatching ${workflow}..."
  git tag "$tag" 2>/dev/null || echo "Tag ${tag} already exists locally."
  git push origin "refs/tags/${tag}"
  gh workflow run "$workflow" -f tag="$tag"
done <<EOF
$SPECS
EOF

echo "Release tagging complete."
