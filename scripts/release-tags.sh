#!/usr/bin/env bash
set -euo pipefail

# For every released package, ensures three things exist for the committed
# version: the namespaced git tag, a GitHub Release carrying that version's
# CHANGELOG section, and (for mirrored packages) a split-workflow dispatch.
#
# The tag keeps the "<ns>-v<version>" form the split workflows key off, while
# the Release is *titled* with the package's canonical manifest name —
# "@webikon/webentor-core@0.15.7" — restoring the scheme the changesets action
# used before it was removed. Nothing else creates Releases, so without this
# the Releases page silently stops updating while tags keep advancing.
#
# The tag and Release checks are independent on purpose: a package whose tag
# already exists but whose Release is missing gets the Release backfilled on the
# next run. Split dispatch stays gated on a freshly created tag so mirrors are
# never re-pushed.
#
# Requires: git remote "origin", gh CLI authenticated (GH_TOKEN in CI).
# Set DRY_RUN=true to only report what would happen.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DRY_RUN="${DRY_RUN:-false}"

# The theme is intentionally absent: it ships inside webentor-starter and has no
# independent distribution.
#
# namespace | manifest (name + version) | changelog | heading level | split workflow ("-" = not mirrored)
SPECS="
core|packages/webentor-core/package.json|packages/webentor-core/CHANGELOG.md|##|split-webentor-core.yml
configs|packages/webentor-configs/package.json|packages/webentor-configs/CHANGELOG.md|##|-
codemods|packages/webentor-codemods/package.json|packages/webentor-codemods/CHANGELOG.md|##|-
setup|packages/webentor-setup/composer.json|packages/webentor-setup/CHANGELOG.md|##|split-webentor-setup.yml
starter|packages/webentor-starter/composer.json|packages/webentor-starter/CHANGELOG.md|###|split-webentor-starter.yml
"

# Prints the CHANGELOG body for version $3 in file $1, whose entries sit at
# heading level $2. Any following heading ends the section — fence tracking keeps
# a "# comment" inside a code block from truncating the notes.
changelog_notes() {
  awk -v heading="$2 $3" '
    /^```/ { fence = !fence }
    $0 == heading { found = 1; next }
    found && !fence && /^#/ { exit }
    found { print }
  ' "$1"
}

while IFS='|' read -r ns manifest changelog heading workflow; do
  [ -z "$ns" ] && continue

  version="$(node -p "require('./${manifest}').version")"
  name="$(node -p "require('./${manifest}').name")"
  tag="${ns}-v${version}"
  title="${name}@${version}"

  # --- Tag, plus the split dispatch for mirrored packages ---------------------
  if git ls-remote --exit-code --tags origin "refs/tags/${tag}" >/dev/null 2>&1; then
    echo "${tag} already exists on origin."
  elif [ "$DRY_RUN" = "true" ]; then
    if [ "$workflow" = "-" ]; then
      echo "[dry-run] Would tag ${tag}."
    else
      echo "[dry-run] Would tag ${tag} and dispatch ${workflow}."
    fi
  else
    echo "Tagging ${tag}..."
    git tag "$tag" 2>/dev/null || echo "Tag ${tag} already exists locally."
    git push origin "refs/tags/${tag}"

    if [ "$workflow" != "-" ]; then
      echo "Dispatching ${workflow}..."
      gh workflow run "$workflow" -f tag="$tag"
    fi
  fi

  # --- GitHub Release --------------------------------------------------------
  if gh release view "$tag" >/dev/null 2>&1; then
    echo "Release ${tag} already exists."
    continue
  fi

  notes="$(changelog_notes "$changelog" "$heading" "$version")"
  if [ -z "${notes//[[:space:]]/}" ]; then
    echo "No ${heading} ${version} section in ${changelog}, falling back to a pointer."
    notes="See [${changelog}](${changelog}) for details."
  fi

  if [ "$DRY_RUN" = "true" ]; then
    echo "[dry-run] Would create release ${tag} titled \"${title}\"."
    continue
  fi

  echo "Creating release ${tag} (\"${title}\")..."
  printf '%s\n' "$notes" | gh release create "$tag" --title "$title" --notes-file -
done <<EOF
$SPECS
EOF

echo "Release tagging complete."
