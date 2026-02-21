#!/usr/bin/env bash
set -euo pipefail

# Mirror only packages/webentor-setup into standalone webentor-setup repository.
# This script is CI-oriented and expects credentials from workflow secrets.

if [ -z "${SETUP_MIRROR_REPO:-}" ] || [ -z "${SETUP_MIRROR_TOKEN:-}" ]; then
  echo "SETUP_MIRROR_REPO and SETUP_MIRROR_TOKEN are required."
  exit 1
fi

SOURCE_TAG="${INPUT_TAG:-${GITHUB_REF_NAME:-}}"
if [ -z "$SOURCE_TAG" ]; then
  echo "No tag resolved. Pass workflow input 'tag' or run on a tag ref."
  exit 1
fi

# Monorepo tags are namespaced (setup-vX.Y.Z), but mirrors should keep plain semver tags.
if [[ "$SOURCE_TAG" =~ ^setup-v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)*$ ]]; then
  TAG="${SOURCE_TAG#setup-}"
elif [[ "$SOURCE_TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)*$ ]]; then
  TAG="$SOURCE_TAG"
else
  echo "Invalid tag '$SOURCE_TAG'. Expected setup-vX.Y.Z (or vX.Y.Z for manual dispatch)."
  exit 1
fi

git subtree split --prefix=packages/webentor-setup -b split/webentor-setup-mirror

MIRROR_URL="https://x-access-token:${SETUP_MIRROR_TOKEN}@github.com/${SETUP_MIRROR_REPO}.git"

# Query mirror remote state and use an explicit lease against its current main tip.
REMOTE_MAIN_SHA="$(git ls-remote --heads "$MIRROR_URL" main | awk '{print $1}')"
if [ -n "$REMOTE_MAIN_SHA" ]; then
  git push "$MIRROR_URL" split/webentor-setup-mirror:main --force-with-lease="main:${REMOTE_MAIN_SHA}"
else
  # First mirror run can target repos where main does not exist yet.
  git push "$MIRROR_URL" split/webentor-setup-mirror:main --force
fi
git push "$MIRROR_URL" "split/webentor-setup-mirror:refs/tags/${TAG}" --force

echo "Mirrored packages/webentor-setup to ${SETUP_MIRROR_REPO} with tag ${TAG}."
