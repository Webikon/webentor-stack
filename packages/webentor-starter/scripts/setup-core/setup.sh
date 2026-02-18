#!/usr/bin/env bash
set -e

# setup.sh is intended to be sourced from project-level scripts/setup.sh.
# It resolves project paths in a subtree-safe way and then orchestrates setup.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -n "${LOCAL_WORKSPACE_FOLDER:-}" ]; then
    WORKSPACE_FOLDER="$(realpath "${LOCAL_WORKSPACE_FOLDER}")"
elif [ -f "${SCRIPT_DIR}/../.env.setup" ]; then
    # Subtree layout: project/scripts/setup-core/<this-file>, so project root is ../..
    WORKSPACE_FOLDER="$(cd "${SCRIPT_DIR}/../.." && pwd)"
else
    WORKSPACE_FOLDER="$(pwd)"
fi

HELPERS_DIR="${HELPERS_DIR:-${SCRIPT_DIR}/helpers}"

export WORKSPACE_FOLDER
export SCRIPT_DIR
export HELPERS_DIR

source "${HELPERS_DIR}/shell-ui.sh"
source "${HELPERS_DIR}/helpers.sh"

# Load setup configuration early so non-interactive mode can be enforced globally.
load_env "${WORKSPACE_FOLDER}/scripts/.env.setup" || true

run_env_setup=false
if should_run_step "SETUP_ENV_CHECK" "Run environment setup for this project?" "true"; then
    run_env_setup=true
fi

if [ "$run_env_setup" = "true" ]; then
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        info "Detected Windows. Running win/win.sh"
        source "${SCRIPT_DIR}/win/win.sh"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        info "Detected macOS. Running mac/mac.sh"
        source "${SCRIPT_DIR}/mac/mac.sh"
    else
        warning "Unsupported OS for guided environment setup: ${OSTYPE}. Running checks only."
        bash "${SCRIPT_DIR}/env-check.sh"
    fi
else
    info "Skipping interactive environment setup. Running checks only."
    bash "${SCRIPT_DIR}/env-check.sh"
fi

source "${SCRIPT_DIR}/common.sh"
