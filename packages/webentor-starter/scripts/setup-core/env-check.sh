#!/usr/bin/env bash
set -e

source "${HELPERS_DIR}/shell-ui.sh"
source "${HELPERS_DIR}/helpers.sh"

info "Running environment checks"

WORKSPACE_FOLDER="${WORKSPACE_FOLDER:-$(pwd)}"
ENV_OK=0

load_env "${WORKSPACE_FOLDER}/scripts/.env.setup" || true

for cmd_info in \
    "wp|Install WP-CLI: https://wp-cli.org/" \
    "pnpm|Install pnpm: https://pnpm.io/" \
    "composer|Install Composer: https://getcomposer.org/" \
    "node|Install Node.js >= required version"
do
    IFS='|' read -r cmd msg <<< "$cmd_info"
    if ! check_command "$cmd" "$msg"; then
        ENV_OK=1
    fi
done

# Resolve representative theme package.json dynamically from WP_THEMES.
THEME_NAME="$(first_theme)"
if [ -n "$THEME_NAME" ]; then
    PACKAGE_JSON="${WORKSPACE_FOLDER}/web/app/themes/${THEME_NAME}/package.json"
else
    PACKAGE_JSON=""
fi

COMPOSER_JSON="${WORKSPACE_FOLDER}/composer.json"

if [ -n "$PACKAGE_JSON" ] && [ -f "$PACKAGE_JSON" ]; then
    REQUIRED_NODE_VERSION=$(grep '"node":' "$PACKAGE_JSON" | sed -E 's/.*"node": *"([^"]+)".*/\1/')
    INSTALLED_NODE_VERSION=$(node -v | sed 's/v//')

    info "Theme: ${THEME_NAME}"
    info "Required Node version: ${REQUIRED_NODE_VERSION}"
    info "Installed Node version: ${INSTALLED_NODE_VERSION}"
else
    warning "No theme package.json found via WP_THEMES. Skipping Node version compatibility check."
fi

if [ -f "$COMPOSER_JSON" ]; then
    REQUIRED_PHP_VERSION=$(grep '"php":' "$COMPOSER_JSON" | sed -E 's/.*"php": *"[^0-9]*([0-9]+\.[0-9]+).*".*/\1/')
    INSTALLED_PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')

    info "Required PHP version: ${REQUIRED_PHP_VERSION}"
    info "Installed PHP version: ${INSTALLED_PHP_VERSION}"
else
    warning "composer.json not found. Skipping PHP version compatibility check."
fi

if [ "$ENV_OK" -ne 0 ]; then
    error "Environment check found issues. Resolve missing tools and rerun setup."
    exit 1
fi

success "Environment check completed"
