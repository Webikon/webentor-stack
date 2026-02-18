#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

HERD_BAT="$HOME/.config/herd/bin/herd.bat"

# Check if the Herd .bat file exists
if [ -f "$HERD_BAT" ]; then
    info "Herd .bat file found at $HERD_BAT"
    exit 0
else
    error "Herd .bat file not found at $HERD_BAT"
    exit 1
fi
