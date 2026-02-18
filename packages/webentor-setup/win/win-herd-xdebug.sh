#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

info "=== Herd xDebug setup script started ==="

enable_xdebug_in_herd() {
    HERD_CMD="$HOME/.config/herd/bin/herd.bat"

    # check if Herd PHP exists
    if ! "$HERD_CMD" php -v >/dev/null 2>&1; then
        error "Herd PHP not found. Cannot enable Xdebug."
        return 1
    fi

    INSTALLED_PHP_VERSION=$("$HERD_CMD" php -v | head -n1 | awk '{print $2}' | cut -d. -f1,2)
    HERD_PHP_INI="$HOME/.config/herd/bin/php${INSTALLED_PHP_VERSION//./}/php.ini"

    info "Enabling Xdebug in Herd PHP $INSTALLED_PHP_VERSION ($HERD_PHP_INI)..."

    # check if Xdebug already configured
    if grep -q "xdebug-8.3.dll" "$HERD_PHP_INI" 2>/dev/null; then
        success "Xdebug already configured in Herd PHP."
        return 0
    fi

    # append Xdebug configuration
    cat >> "$HERD_PHP_INI" <<EOL

; Xdebug configuration added by environment-check
XDEBUG_DLL="C:\\Program Files\\Herd\\resources\\app.asar.unpacked\\resources\\bin\\xdebug\\xdebug-${INSTALLED_PHP_VERSION}.dll"
xdebug.mode=debug,develop
xdebug.start_with_request=trigger

EOL

    success "Xdebug has been enabled in Herd PHP."
}

check_xdebug() {
    info "Checking Xdebug in Herd PHP..."

    HERD_CMD="$HOME/.config/herd/bin/herd.bat"

    if "$HERD_CMD" php -m | grep -qi "xdebug"; then
        success "Xdebug is enabled in Herd PHP."
    else
        warning "Xdebug is NOT enabled in Herd PHP."
        enable_xdebug_in_herd

        info "Restarting Herd..."
        "$HERD_CMD" stop
        "$HERD_CMD" start
        success "Herd restarted successfully."
    fi
}

check_xdebug

info "=== Herd xDebug setup script finished ==="
