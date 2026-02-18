#!/usr/bin/env bash
set -e

# 1) Determine workspace folder (short, spoľahlivá verzia)
WORKSPACE_FOLDER="$(realpath "${LOCAL_WORKSPACE_FOLDER:-$(pwd)}")"

# Setup Scripts folder (default: scripts/setup-core)
SCRIPT_DIR=${SCRIPT_DIR:-"$WORKSPACE_FOLDER/scripts/setup-core"}

# Helpers folder (default: scripts/setup-core)
HELPERS_DIR=${HELPERS_DIR:-"$SCRIPT_DIR/helpers"}

# 2) Export, aby ho mohli používať podskripty
export WORKSPACE_FOLDER
export SCRIPT_DIR
export HELPERS_DIR

source "$HELPERS_DIR/shell-ui.sh"
source "$HELPERS_DIR/helpers.sh"

load_env

# Include common setup steps
bash "$SCRIPT_DIR/typesense-docker.sh"



