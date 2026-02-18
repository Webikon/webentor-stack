#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

# ===================================================
# Script: win-herd-php.sh
# Purpose: Add project-specific Herd PHP to PATH in Git Bash
# ===================================================

SCRIPTS_FOLDER="${SCRIPTS_FOLDER:-$(pwd)}"
HERD_CMD="$HOME/.config/herd/bin/herd.bat"

# Skontroluj, či Herd existuje
if ! "$HERD_CMD" php -v >/dev/null 2>&1; then
    error "Herd PHP not found. Please install Herd first."
    exit 1
fi

# Zisti aktívne PHP z Herd pre projekt
HERD_PHP_VERSION=$("$HERD_CMD" php -v | head -n1 | awk '{print $2}' | cut -d. -f1,2)
HERD_PHP_DIR="$HOME/.config/herd/bin/php${HERD_PHP_VERSION//./}"

if [ ! -d "$HERD_PHP_DIR" ]; then
    error "Detected Herd PHP directory does not exist: $HERD_PHP_DIR"
    exit 1
fi

info "Detected project Herd PHP directory: $HERD_PHP_DIR"

# Pridaj do .bashrc, ak tam ešte nie je
BASHRC_FILE="$HOME/.bashrc"
EXPORT_LINE="export PATH=\"$HERD_PHP_DIR:\$PATH\""

if ! grep -Fxq "$EXPORT_LINE" "$BASHRC_FILE"; then
    echo "$EXPORT_LINE" >> "$BASHRC_FILE"
    success "Added project Herd PHP to PATH in $BASHRC_FILE"
else
    info "Project Herd PHP already in PATH in .bashrc"
fi

# Reload .bashrc pre aktuálny terminál
source "$BASHRC_FILE"

success "Herd PHP setup for project complete."
info "Current php:"
which php
php -v
