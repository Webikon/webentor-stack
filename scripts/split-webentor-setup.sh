#!/usr/bin/env bash
set -euo pipefail

# Mirror only packages/webentor-setup into standalone webentor-setup repository.
# This script is CI-oriented and expects credentials from workflow secrets.

if [ -z "${SETUP_MIRROR_REPO:-}" ] || [ -z "${SETUP_MIRROR_TOKEN:-}" ]; then
  echo "SETUP_MIRROR_REPO and SETUP_MIRROR_TOKEN are required."
  exit 1
fi

TAG="${INPUT_TAG:-${GITHUB_REF_NAME:-}}"
if [ -z "$TAG" ]; then
  echo "No tag resolved. Pass workflow input 'tag' or run on a tag ref."
  exit 1
fi

git subtree split --prefix=packages/webentor-setup -b split/webentor-setup-mirror

MIRROR_URL="https://x-access-token:${SETUP_MIRROR_TOKEN}@github.com/${SETUP_MIRROR_REPO}.git"

git push "$MIRROR_URL" split/webentor-setup-mirror:main --force-with-lease
git push "$MIRROR_URL" "split/webentor-setup-mirror:refs/tags/${TAG}" --force

echo "Mirrored packages/webentor-setup to ${SETUP_MIRROR_REPO} with tag ${TAG}."
