#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

BASHRC_FILE="$HOME/.bashrc"
HERD_PATH_LINE="export PATH=\"\$PATH:$HOME/.config/herd/bin\""
HERD_ALIAS_LINE="alias herd='cmd //c $HOME/.config/herd/bin/herd.bat'"

info "Setting up Herd PATH and alias..."

# Add PATH if not present
if ! grep -Fxq "$HERD_PATH_LINE" "$BASHRC_FILE"; then
    echo "$HERD_PATH_LINE" >> "$BASHRC_FILE"
    success "Added Herd path to $BASHRC_FILE"
else
    info "Herd path already present in $BASHRC_FILE"
fi

# Add alias if not present
if ! grep -Fxq "$HERD_ALIAS_LINE" "$BASHRC_FILE"; then
    echo "$HERD_ALIAS_LINE" >> "$BASHRC_FILE"
    success "Added Herd alias to $BASHRC_FILE"
else
    info "Herd alias already present in $BASHRC_FILE"
fi

# Reload .bashrc to apply changes
source "$BASHRC_FILE"

success "Herd PATH and alias are now active in this terminal."
