#!/usr/bin/env bash
set -euo pipefail

# Mirror only packages/webentor-core into standalone webentor-core repository.
# This script is CI-oriented and expects credentials from workflow secrets.

if [ -z "${CORE_MIRROR_REPO:-}" ] || [ -z "${CORE_MIRROR_TOKEN:-}" ]; then
  echo "CORE_MIRROR_REPO and CORE_MIRROR_TOKEN are required."
  exit 1
fi

SOURCE_TAG="${INPUT_TAG:-${GITHUB_REF_NAME:-}}"
if [ -z "$SOURCE_TAG" ]; then
  echo "No tag resolved. Pass workflow input 'tag' or run on a tag ref."
  exit 1
fi

# Monorepo tags are namespaced (core-vX.Y.Z), but mirrors should keep plain semver tags.
if [[ "$SOURCE_TAG" =~ ^core-v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)*$ ]]; then
  TAG="${SOURCE_TAG#core-}"
elif [[ "$SOURCE_TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)*$ ]]; then
  TAG="$SOURCE_TAG"
else
  echo "Invalid tag '$SOURCE_TAG'. Expected core-vX.Y.Z (or vX.Y.Z for manual dispatch)."
  exit 1
fi

# Build a synthetic branch that contains only the package subtree.
git subtree split --prefix=packages/webentor-core -b split/webentor-core-mirror

MIRROR_URL="https://x-access-token:${CORE_MIRROR_TOKEN}@github.com/${CORE_MIRROR_REPO}.git"

# Force-with-lease protects against clobbering unexpected remote state changes.
git push "$MIRROR_URL" split/webentor-core-mirror:main --force-with-lease
git push "$MIRROR_URL" "split/webentor-core-mirror:refs/tags/${TAG}" --force

echo "Mirrored packages/webentor-core to ${CORE_MIRROR_REPO} with tag ${TAG}."
