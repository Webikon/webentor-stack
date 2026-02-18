#!/usr/bin/env bash
set -euo pipefail

# Mirror only packages/webentor-starter into standalone webentor-starter repository.
# This script is CI-oriented and expects credentials from workflow secrets.

if [ -z "${STARTER_MIRROR_REPO:-}" ] || [ -z "${STARTER_MIRROR_TOKEN:-}" ]; then
  echo "STARTER_MIRROR_REPO and STARTER_MIRROR_TOKEN are required."
  exit 1
fi

TAG="${INPUT_TAG:-${GITHUB_REF_NAME:-}}"
if [ -z "$TAG" ]; then
  echo "No tag resolved. Pass workflow input 'tag' or run on a tag ref."
  exit 1
fi

git subtree split --prefix=packages/webentor-starter -b split/webentor-starter-mirror

MIRROR_URL="https://x-access-token:${STARTER_MIRROR_TOKEN}@github.com/${STARTER_MIRROR_REPO}.git"

git push "$MIRROR_URL" split/webentor-starter-mirror:main --force-with-lease
git push "$MIRROR_URL" "split/webentor-starter-mirror:refs/tags/${TAG}" --force

echo "Mirrored packages/webentor-starter to ${STARTER_MIRROR_REPO} with tag ${TAG}."
