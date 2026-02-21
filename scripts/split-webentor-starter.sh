#!/usr/bin/env bash
set -euo pipefail

# Mirror only packages/webentor-starter into standalone webentor-starter repository.
# This script is CI-oriented and expects credentials from workflow secrets.

if [ -z "${STARTER_MIRROR_REPO:-}" ] || [ -z "${STARTER_MIRROR_TOKEN:-}" ]; then
  echo "STARTER_MIRROR_REPO and STARTER_MIRROR_TOKEN are required."
  exit 1
fi

SOURCE_TAG="${INPUT_TAG:-${GITHUB_REF_NAME:-}}"
if [ -z "$SOURCE_TAG" ]; then
  echo "No tag resolved. Pass workflow input 'tag' or run on a tag ref."
  exit 1
fi

# Monorepo tags are namespaced (starter-vX.Y.Z), but mirrors should keep plain semver tags.
if [[ "$SOURCE_TAG" =~ ^starter-v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)*$ ]]; then
  TAG="${SOURCE_TAG#starter-}"
elif [[ "$SOURCE_TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)*$ ]]; then
  TAG="$SOURCE_TAG"
else
  echo "Invalid tag '$SOURCE_TAG'. Expected starter-vX.Y.Z (or vX.Y.Z for manual dispatch)."
  exit 1
fi

git subtree split --prefix=packages/webentor-starter -b split/webentor-starter-mirror

MIRROR_URL="https://x-access-token:${STARTER_MIRROR_TOKEN}@github.com/${STARTER_MIRROR_REPO}.git"

# Query mirror remote state and use an explicit lease against its current main tip.
REMOTE_MAIN_SHA="$(git ls-remote --heads "$MIRROR_URL" main | awk '{print $1}')"
if [ -n "$REMOTE_MAIN_SHA" ]; then
  git push "$MIRROR_URL" split/webentor-starter-mirror:main --force-with-lease="main:${REMOTE_MAIN_SHA}"
else
  # First mirror run can target repos where main does not exist yet.
  git push "$MIRROR_URL" split/webentor-starter-mirror:main --force
fi
git push "$MIRROR_URL" "split/webentor-starter-mirror:refs/tags/${TAG}" --force

echo "Mirrored packages/webentor-starter to ${STARTER_MIRROR_REPO} with tag ${TAG}."
