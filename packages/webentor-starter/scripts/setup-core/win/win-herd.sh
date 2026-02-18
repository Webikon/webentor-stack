#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"
source "$HELPERS_DIR/helpers.sh"

info "=== Herd setup script started ==="

export HERD_CMD="$HOME/.config/herd/bin/herd.bat"

# WP-CLI
if ! command -v wp &>/dev/null; then
    warning "WP-CLI not found."
    install_scoop_package "wp-cli"
else
    success "WP-CLI is already installed ✅"
fi

# NVM
if ! command -v nvm &>/dev/null; then
    warning "NVM not found."
    install_scoop_package "nvm"
    info "Remember to restart your terminal or run 'nvm use <version>' after installation."
else
    success "NVM is already installed ✅"
fi

# pnpm
if ! command -v pnpm &>/dev/null; then
    warning "pnpm not found."
    if command -v npm &>/dev/null; then
        info "Installing pnpm via npm..."
        npm install -g pnpm
        success "pnpm installed successfully ✅"
        info "Restart your terminal so 'pnpm' becomes available."
    else
        error "npm is not installed. Please install Node.js first."
    fi
else
    success "pnpm is already installed ✅"
fi

# 1Password CLI
if ! command -v op &>/dev/null; then
    warning "1Password CLI (op) not found."
    install_scoop_package "1password-cli"
else
    success "1Password CLI is already installed ✅"
fi

# Composer
if ! command -v composer &>/dev/null; then
    warning "Composer not found."
    install_scoop_package "composer"
else
    success "Composer is already installed ✅"
fi



# 4) Check if MySQL service exists and run it
info "Checking MySQL service..."

# Find MySQL service (any service starting with MySQL)
MYSQL_SERVICE=$(powershell -Command "Get-Service -Name MySQL* -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name")

if [ -n "$MYSQL_SERVICE" ]; then
    success "MySQL service '$MYSQL_SERVICE' found."

    # Check service status
    MYSQL_STATUS=$(powershell -Command "(Get-Service -Name $MYSQL_SERVICE).Status")

    if [[ "$MYSQL_STATUS" == "Running" ]]; then
        info "MySQL is already running."
    else
        info "MySQL is not running. Starting service..."
        powershell -Command "Start-Service -Name $MYSQL_SERVICE"
        success "MySQL started successfully."
    fi
else
    error "MySQL service not found."
    warning "Please install MySQL manually according to instructions here:"
    info "https://coda.io/d/_dBBLgPsZHo-/Windows-Lokalne-vyvojove-prostredie_suDEuZPj#_luUriBBC"
    exit 1
fi

# Check if Herd is running
info "Checking if Herd is running..."

HERD_RUNNING=$(powershell -Command "Get-Process -Name herd -ErrorAction SilentlyContinue")

if [ -n "$HERD_RUNNING" ]; then
    success "Herd is currently running ✅"
else
    info "Starting Herd..."
    "$HERD_CMD" start
    success "Herd started successfully ✅"
fi

# Ask user whether to run 'herd init'
if ask_yes_no_strict "Do you want to run 'herd init'?"; then
    info "Running 'herd init'..."
    "$HERD_CMD" init
    success "Herd initialization complete ✅"
else
    warning "Skipping 'herd init'."
fi


bash "$SCRIPT_DIR/win/win-herd-php.sh"

bash "$SCRIPT_DIR/win/win-herd-xdebug.sh"

info "=== Herd setup script finished ==="
