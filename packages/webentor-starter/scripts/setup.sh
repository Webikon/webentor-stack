#!/usr/bin/env bash
set -eE

# Thin project wrapper around subtree-managed setup runtime.
WORKSPACE_FOLDER="$(realpath "${LOCAL_WORKSPACE_FOLDER:-$(pwd)}")"
SCRIPT_DIR="${WORKSPACE_FOLDER}/scripts/setup-core"
HELPERS_DIR="${SCRIPT_DIR}/helpers"

export WORKSPACE_FOLDER
export SCRIPT_DIR
export HELPERS_DIR

source "${SCRIPT_DIR}/setup.sh"
