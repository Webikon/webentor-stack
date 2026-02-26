#!/usr/bin/env bash
set -eE

source "${HELPERS_DIR}/shell-ui.sh"
source "${HELPERS_DIR}/helpers.sh"

info "Running shared setup steps"

load_env "${WORKSPACE_FOLDER}/scripts/.env.setup" || true

# Allow project-owned helper overrides without modifying setup-core files.
PROJECT_FUNCTIONS_FILE="${WORKSPACE_FOLDER}/scripts/project-specific/functions.sh"
if [ -f "$PROJECT_FUNCTIONS_FILE" ]; then
    # shellcheck disable=SC1090
    source "$PROJECT_FUNCTIONS_FILE"
fi

# Defaults for setup behavior. Projects can override these in scripts/.env.setup.
: "${SETUP_INTERACTIVE:=true}"
: "${SETUP_ENV_CHECK:=true}"
: "${SETUP_1PASSWORD:=true}"
: "${SETUP_COMPOSER:=true}"
: "${SETUP_THEME_DEPS:=true}"
: "${SETUP_WORDPRESS:=true}"
: "${SETUP_DB_SYNC:=true}"
: "${SETUP_SUBMODULES:=false}"
: "${SETUP_TYPESENSE:=false}"

run_hook "pre-env"

# Track whether .env was explicitly hydrated from 1Password.
env_fetched_from_1password=false

if is_feature_enabled "SETUP_1PASSWORD" "true"; then
    op_status=0
    check_1password_auth || op_status=$?

    if [ "$op_status" -eq 2 ]; then
        if try_1password_signin; then
            op_status=0
        fi
    fi

    if [ "$op_status" -eq 0 ]; then
        target_env="${WORKSPACE_FOLDER}/.env"
        if [ -f "$target_env" ]; then
            overwrite_from_1password=false
            if is_feature_enabled "SETUP_INTERACTIVE" "true"; then
                if ask_yes_no_strict "Do you want to overwrite .env from 1Password?"; then
                    overwrite_from_1password=true
                fi
            fi

            if [ "$overwrite_from_1password" = "true" ] && fetch_env_from_1password "$target_env"; then
                env_fetched_from_1password=true
            fi
        else
            info "No .env found. Attempting to fetch from 1Password"
            if fetch_env_from_1password "$target_env"; then
                env_fetched_from_1password=true
            fi
        fi
    elif [ "$op_status" -eq 1 ]; then
        warning "1Password CLI is not installed; falling back to local .env handling"
    else
        warning "1Password is not authenticated; falling back to local .env handling"
    fi
fi

if [ "$env_fetched_from_1password" != "true" ]; then
    ensure_env_file
fi

# Keep Laragon-specific URL normalization behavior after successful 1Password fetch.
if [ "$env_fetched_from_1password" = "true" ] && [ "${LARAGON_SETUP_DONE:-false}" = "true" ] && [ -n "${PROJECT_DOMAIN:-}" ]; then
    update_env_urls "${WORKSPACE_FOLDER}/.env" "${PROJECT_DOMAIN}" || true
fi

# Load project .env after ensuring it exists.
load_env "${WORKSPACE_FOLDER}/.env"
run_hook "post-env"

if should_run_step "SETUP_COMPOSER" "Run root composer install?" "true"; then
    run_hook "pre-composer"
    setup_composer
    run_hook "post-composer"
else
    info "Skipping root composer install"
fi

if should_run_step "SETUP_THEME_DEPS" "Install theme dependencies and build assets?" "true"; then
    run_hook "pre-deps"
    setup_deps
    run_hook "post-deps"
else
    info "Skipping theme dependencies"
fi

if should_run_step "SETUP_WORDPRESS" "Run WordPress setup (install/reset DB)?" "true"; then
    run_hook "pre-wp-setup"
    setup_wp
    run_hook "post-wp-setup"
else
    info "Skipping WordPress setup"
fi

if should_run_step "SETUP_DB_SYNC" "Synchronize database from remote source?" "false"; then
    run_hook "pre-db-sync"
    sync_db
    run_hook "post-db-sync"
else
    info "Skipping database sync"
fi

if is_feature_enabled "SETUP_SUBMODULES" "false" && [ -f "${WORKSPACE_FOLDER}/.gitmodules" ]; then
    if should_run_step "SETUP_SUBMODULES" "Initialize git submodules?" "false"; then
        info "Loading git submodules"
        git -C "${WORKSPACE_FOLDER}" submodule init
        git -C "${WORKSPACE_FOLDER}" submodule update --recursive
    fi
else
    info "Submodule step disabled"
fi

if is_feature_enabled "SETUP_TYPESENSE" "false" && [ -f "${WORKSPACE_FOLDER}/typesense-config/docker-compose.yml" ]; then
    if should_run_step "SETUP_TYPESENSE" "Start Typesense with Docker?" "false"; then
        info "Starting Typesense"
        bash "${SCRIPT_DIR}/typesense-docker.sh"
    fi
else
    info "Typesense step disabled"
fi

run_hook "custom-steps"

success "Setup completed. Open ${WP_HOME:-your local site URL}."
