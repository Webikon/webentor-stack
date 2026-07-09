#!/usr/bin/env bash
set -euo pipefail

# Local dry-run harness for release workflow validation.
# This script intentionally avoids remote pushes/publishes and cleans up temp git state.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -t 1 ]; then
  RED="$(printf '\033[0;31m')"
  GREEN="$(printf '\033[0;32m')"
  YELLOW="$(printf '\033[1;33m')"
  BLUE="$(printf '\033[0;34m')"
  BOLD="$(printf '\033[1m')"
  RESET="$(printf '\033[0m')"
else
  RED=""
  GREEN=""
  YELLOW=""
  BLUE=""
  BOLD=""
  RESET=""
fi

log_info() {
  printf "%b[INFO]%b %s\n" "$BLUE" "$RESET" "$1"
}

log_warn() {
  printf "%b[WARN]%b %s\n" "$YELLOW" "$RESET" "$1"
}

log_ok() {
  printf "%b[PASS]%b %s\n" "$GREEN" "$RESET" "$1"
}

log_err() {
  printf "%b[FAIL]%b %s\n" "$RED" "$RESET" "$1"
}

usage() {
  cat <<'USAGE'
Usage: bash scripts/test-release.sh [--ci] [--versions] [--publish] [--split] [--tags] [--all]

Flags:
  --ci         Run CI-equivalent local checks
  --versions   Run the version source consistency check
  --publish    Run npm publish dry-run for releasable packages
  --split      Run subtree split dry-run checks
  --tags       Run release tagging dry-run
  --all        Run all phases (default when no flags are passed)
USAGE
}

run_ci=false
run_versions=false
run_publish=false
run_split=false
run_tags=false
run_all=false

if [ "$#" -eq 0 ]; then
  run_all=true
fi

while [ "$#" -gt 0 ]; do
  case "$1" in
    --ci)
      run_ci=true
      ;;
    --versions)
      run_versions=true
      ;;
    --publish)
      run_publish=true
      ;;
    --split)
      run_split=true
      ;;
    --tags)
      run_tags=true
      ;;
    --all)
      run_all=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      log_err "Unknown flag: $1"
      usage
      exit 1
      ;;
  esac
  shift
done

if [ "$run_all" = true ]; then
  run_ci=true
  run_versions=true
  run_publish=true
  run_split=true
  run_tags=true
fi

declare -a failed_phases=()

run_phase() {
  local phase_name="$1"
  shift

  printf "\n%b==>%b %s\n" "$BOLD" "$RESET" "$phase_name"
  if "$@"; then
    log_ok "$phase_name"
  else
    log_err "$phase_name"
    failed_phases+=("$phase_name")
  fi
}

phase_ci() {
  local setup_script
  while IFS= read -r -d '' setup_script; do
    bash -n "$setup_script" || return 1
  done < <(find packages/webentor-setup -type f -name '*.sh' -print0)

  php -l packages/webentor-setup/src/webentor-setup.php >/dev/null || return 1

  # Keep package checks explicit so failures map to a single package quickly.
  local package_filter
  for package_filter in './packages/webentor-core' './packages/webentor-configs'; do
    pnpm --filter "$package_filter" --if-present run lint || return 1
    pnpm --filter "$package_filter" --if-present run build || return 1
    pnpm --filter "$package_filter" --if-present run test || return 1
  done

  # Mirror CI path-filter behavior: only build docs when docs changed locally or in last commit.
  local docs_changed=false
  if ! git diff --quiet -- docs || ! git diff --cached --quiet -- docs; then
    docs_changed=true
  elif git rev-parse --verify HEAD~1 >/dev/null 2>&1 && ! git diff --quiet HEAD~1 HEAD -- docs; then
    docs_changed=true
  fi

  if [ "$docs_changed" = true ]; then
    pnpm --dir docs install --ignore-scripts || return 1
    pnpm --dir docs docs:build || return 1
  else
    log_info "Skipping docs build (no docs changes detected)."
  fi
}

phase_versions() {
  node scripts/check-versions.mjs || return 1
}

phase_publish() {
  node scripts/publish-npm.mjs --dry-run || return 1
  pnpm -r --filter './packages/webentor-configs' --filter './packages/webentor-core' publish --dry-run --access public --no-git-checks || return 1
}

phase_split() {
  local setup_branch starter_branch
  setup_branch="test-split/setup-$(date +%s)-$$"
  starter_branch="test-split/starter-$(date +%s)-$$"

  cleanup_split_branches() {
    git branch -D "$setup_branch" >/dev/null 2>&1 || true
    git branch -D "$starter_branch" >/dev/null 2>&1 || true
  }

  if ! git subtree split --prefix=packages/webentor-setup -b "$setup_branch" >/dev/null; then
    cleanup_split_branches
    return 1
  fi
  if ! git subtree split --prefix=packages/webentor-starter -b "$starter_branch" >/dev/null; then
    cleanup_split_branches
    return 1
  fi

  # Ensure split branches are package roots, not monorepo roots.
  local tree_entry
  while IFS= read -r tree_entry; do
    if [ "$tree_entry" = "packages" ]; then
      log_err "Setup split branch still contains top-level packages/ directory."
      cleanup_split_branches
      return 1
    fi
  done < <(git ls-tree --name-only "$setup_branch")

  while IFS= read -r tree_entry; do
    if [ "$tree_entry" = "packages" ]; then
      log_err "Starter split branch still contains top-level packages/ directory."
      cleanup_split_branches
      return 1
    fi
  done < <(git ls-tree --name-only "$starter_branch")

  log_info "Created split branches: $setup_branch, $starter_branch"
  cleanup_split_branches
}

phase_tags() {
  DRY_RUN=true bash scripts/release-tags.sh || return 1
}

log_info "Running local release workflow dry-run in: $ROOT_DIR"

if [ "$run_ci" = true ]; then
  run_phase "Phase 1 - CI checks" phase_ci
fi

if [ "$run_versions" = true ]; then
  run_phase "Phase 2 - Version source consistency" phase_versions
fi

if [ "$run_publish" = true ]; then
  run_phase "Phase 3 - npm publish dry-run" phase_publish
fi

if [ "$run_split" = true ]; then
  run_phase "Phase 4 - subtree split dry-run" phase_split
fi

if [ "$run_tags" = true ]; then
  run_phase "Phase 5 - release tags dry-run" phase_tags
fi

if [ "${#failed_phases[@]}" -gt 0 ]; then
  printf "\n%bRelease dry-run completed with failures:%b\n" "$RED" "$RESET"
  printf " - %s\n" "${failed_phases[@]}"
  exit 1
fi

printf "\n%bRelease dry-run completed successfully.%b\n" "$GREEN" "$RESET"
