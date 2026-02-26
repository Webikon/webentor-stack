#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

BASH_FILE="${1:-$HOME/.bashrc}"

# Check if herd alias is present, ignoring exact path
if grep -Fq "alias herd=" "$BASH_FILE"; then
    info "Herd alias is in place."
    exit 0
else
    warning "Herd alias is missing."
    exit 1
fi