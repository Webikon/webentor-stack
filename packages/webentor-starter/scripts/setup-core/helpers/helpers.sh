#!/usr/bin/env bash
set -eE

# Shared helper library for setup scripts. Keep this file dependency-light so it
# can run before Composer/npm are installed in a fresh project clone.

source "${HELPERS_DIR}/shell-ui.sh"

parse_bool() {
    local value="${1:-}"
    local default="${2:-false}"

    if [ -z "$value" ]; then
        value="$default"
    fi

    case "$(echo "$value" | tr '[:upper:]' '[:lower:]')" in
        1|true|yes|y|on) echo "true" ;;
        0|false|no|n|off) echo "false" ;;
        *) echo "$default" ;;
    esac
}

is_feature_enabled() {
    local feature_name="$1"
    local default_value="${2:-false}"
    local resolved

    # shellcheck disable=SC2154
    resolved="$(parse_bool "${!feature_name:-}" "$default_value")"
    [ "$resolved" = "true" ]
}

check_command() {
    local cmd="$1"
    local install_instructions="$2"

    if ! command -v "$cmd" >/dev/null 2>&1; then
        error "Command '$cmd' not found. ${install_instructions}"
        return 1
    fi

    success "Command '$cmd' is available."
    return 0
}

# Get Laragon installation path.
get_laragon_path() {
    if [ -n "${LARAGON_PATH:-}" ] && [ -d "${LARAGON_PATH}" ]; then
        echo "${LARAGON_PATH}"
        return 0
    fi

    for path in "/c/laragon" "/d/laragon" "/e/laragon"; do
        if [ -d "$path" ]; then
            echo "$path"
            return 0
        fi
    done

    return 1
}

# Load KEY=VALUE pairs from a .env-style file with minimal parsing.
load_env() {
    local env_file="${1:-${WORKSPACE_FOLDER}/.env}"

    if [ ! -f "$env_file" ]; then
        warning "Environment file not found at $env_file"
        return 1
    fi

    info "Loading environment from $env_file"

    while IFS='=' read -r key value || [ -n "$key" ]; do
        if [ -z "$key" ] || [[ "${key#\#}" != "$key" ]]; then
            continue
        fi

        if ! [[ "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
            continue
        fi

        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        export "${key}=${value}"
    done < "$env_file"
}

check_1password_auth() {
    if ! command -v op >/dev/null 2>&1; then
        return 1
    fi

    if [ -n "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]; then
        info "Using 1Password service account token"
        return 0
    fi

    if ! op account list >/dev/null 2>&1; then
        return 2
    fi

    return 0
}

# Interactive fallback for developers who do not have preconfigured `op` accounts.
# This keeps setup usable on clean machines without removing service-account support.
setup_1password_account() {
    info "Setting up 1Password CLI authentication"
    echo ""
    echo "Please provide your 1Password account details:"

    read -r -p "1Password account domain (e.g., my.1password.com): " op_domain
    if [ -z "$op_domain" ]; then
        op_domain="my.1password.com"
    fi

    read -r -p "Email address: " op_email
    if [ -z "$op_email" ]; then
        warning "Email is required for account setup"
        return 1
    fi

    info "Adding 1Password account"
    if op account add --address "$op_domain" --email "$op_email"; then
        success "Account added successfully"
        if op signin --account "$op_email"; then
            success "Successfully signed in to 1Password"
            return 0
        fi
    fi

    warning "Automatic 1Password account setup failed. Use 'op signin' manually."
    return 1
}

try_1password_signin() {
    info "Attempting 1Password signin"

    if op signin >/dev/null 2>&1; then
        success "Signed in to 1Password"
        return 0
    fi

    # Try existing account aliases (best-effort) before prompting.
    if op account list >/dev/null 2>&1; then
        local first_account
        first_account=$(op account list --format=json 2>/dev/null | grep -o '"user_uuid":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
        if [ -n "$first_account" ] && op signin --account "$first_account" >/dev/null 2>&1; then
            success "Signed in to existing 1Password account"
            return 0
        fi
    fi

    if is_feature_enabled "SETUP_INTERACTIVE" "true"; then
        if ask_yes_no_strict "No active 1Password session. Configure account now?"; then
            setup_1password_account && return 0
        fi
    fi

    return 1
}

fetch_env_from_1password() {
    local target_env_file="${1:-${WORKSPACE_FOLDER}/.env}"

    if [ -z "${OP_VAULT_ID:-}" ] || [ -z "${OP_ITEM_ID:-}" ]; then
        warning "OP_VAULT_ID or OP_ITEM_ID is missing in scripts/.env.setup"
        return 1
    fi

    if op read "op://${OP_VAULT_ID}/${OP_ITEM_ID}/env-valet" > "$target_env_file" 2>/dev/null; then
        success "Fetched .env from 1Password"
        return 0
    fi

    warning "Failed to fetch .env from 1Password item op://${OP_VAULT_ID}/${OP_ITEM_ID}/env-valet"
    return 1
}

ensure_env_file() {
    local project_env="${WORKSPACE_FOLDER}/.env"
    local project_env_example="${WORKSPACE_FOLDER}/.env.example"

    if [ -f "$project_env" ]; then
        return 0
    fi

    if [ -f "$project_env_example" ]; then
        cp "$project_env_example" "$project_env"
        warning "No .env found. Copied .env.example to .env"
        return 0
    fi

    error "No .env or .env.example found in ${WORKSPACE_FOLDER}"
    return 1
}

# Update local URL-related env values after machine-specific setup (Laragon, etc.).
update_env_urls() {
    local env_file="${1:-${WORKSPACE_FOLDER}/.env}"
    local domain="$2"

    if [ -z "$domain" ]; then
        warning "Domain is required for update_env_urls; skipping"
        return 1
    fi

    if [ ! -f "$env_file" ]; then
        warning ".env file not found at $env_file"
        return 1
    fi

    domain="${domain#http://}"
    domain="${domain#https://}"

    local domain_suffix=".${domain##*.}"

    sed -i "s|^WP_HOME=.*|WP_HOME=\"https://$domain\"|" "$env_file" 2>/dev/null || true
    sed -i "s|^DOMAIN_CURRENT_SITE=.*|DOMAIN_CURRENT_SITE=\"$domain\"|" "$env_file" 2>/dev/null || true

    local current_mdb_url
    current_mdb_url=$(grep "^MDB_REPLACE_WEB_URL=" "$env_file" | cut -d= -f2 | tr -d '"' || true)
    if [ -n "$current_mdb_url" ]; then
        local updated_mdb_url
        updated_mdb_url=$(echo "$current_mdb_url" | sed -E "s/\.[a-zA-Z]+([,\"]|$)/${domain_suffix}\1/g")
        if [ "$current_mdb_url" != "$updated_mdb_url" ]; then
            sed -i "s|^MDB_REPLACE_WEB_URL=.*|MDB_REPLACE_WEB_URL=\"$updated_mdb_url\"|" "$env_file" 2>/dev/null || true
        fi
    fi

    success "Updated .env URLs for local domain $domain"
    return 0
}

# Detect WordPress themes using WP_THEMES from scripts/.env.setup.
discover_themes() {
    local themes="${WP_THEMES:-}"

    if [ -z "$themes" ] && [ -d "${WORKSPACE_FOLDER}/web/app/themes" ]; then
        # Fallback for first-run projects where WP_THEMES is not set yet.
        themes=$(find "${WORKSPACE_FOLDER}/web/app/themes" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | tr '\n' ' ')
    fi

    echo "$themes"
}

first_theme() {
    local themes
    themes="$(discover_themes)"
    set -- $themes
    echo "${1:-}"
}

run_hook() {
    local hook_name="$1"
    local hooks_dir="${WORKSPACE_FOLDER}/scripts/hooks"
    local project_specific_dir="${WORKSPACE_FOLDER}/scripts/project-specific"
    local hook_file="${hooks_dir}/${hook_name}.sh"
    local hook_d_dir="${hooks_dir}/${hook_name}.d"
    local project_hook_file="${project_specific_dir}/${hook_name}.sh"

    if [ -f "$hook_file" ]; then
        info "Running hook: ${hook_name} (${hook_file})"
        bash "$hook_file"
    fi

    if [ -d "$hook_d_dir" ]; then
        local file
        for file in "$hook_d_dir"/*.sh; do
            [ -f "$file" ] || continue
            info "Running hook: ${hook_name} (${file})"
            bash "$file"
        done
    fi

    if [ -f "$project_hook_file" ]; then
        info "Running project-specific hook: ${hook_name} (${project_hook_file})"
        bash "$project_hook_file"
    fi
}

should_run_step() {
    local toggle_name="$1"
    local prompt="$2"
    local default_enabled="${3:-false}"

    if ! is_feature_enabled "$toggle_name" "$default_enabled"; then
        info "Skipping ${toggle_name} because it is disabled in scripts/.env.setup"
        return 1
    fi

    if ! is_feature_enabled "SETUP_INTERACTIVE" "true"; then
        return 0
    fi

    ask_yes_no_strict "$prompt"
}

_setup_composer_core() {
    if [ -n "${PLUGIN_WPDELBRAINS_USER:-}" ] && [ -n "${PLUGIN_WPDELBRAINS_PASS:-}" ]; then
        composer config --auth http-basic.composer.deliciousbrains.com "${PLUGIN_WPDELBRAINS_USER}" "${PLUGIN_WPDELBRAINS_PASS}"
    fi

    if [ -n "${PLUGIN_ACF_KEY:-}" ] && [ -n "${PLUGIN_ACF_SITE_URL:-}" ]; then
        composer config --auth http-basic.connect.advancedcustomfields.com "${PLUGIN_ACF_KEY}" "${PLUGIN_ACF_SITE_URL}"
    fi

    composer --working-dir="${WORKSPACE_FOLDER}" install --optimize-autoloader
}

setup_composer() {
    # Project override contract: define setup_composer_override() in
    # scripts/project-specific/functions.sh to replace the core composer step.
    if declare -f setup_composer_override >/dev/null 2>&1; then
        info "Running project-specific setup_composer_override"
        setup_composer_override
        return $?
    fi

    _setup_composer_core
}

_setup_deps_core() {
    local theme
    for theme in $(discover_themes); do
        if [ -f "${WORKSPACE_FOLDER}/web/app/themes/${theme}/composer.json" ]; then
            composer --working-dir="${WORKSPACE_FOLDER}/web/app/themes/${theme}" install --optimize-autoloader
        fi

        if [ -f "${WORKSPACE_FOLDER}/web/app/themes/${theme}/package.json" ]; then
            info "Installing ${theme} dependencies via pnpm"
            (
                cd "${WORKSPACE_FOLDER}/web/app/themes/${theme}"
                pnpm install
                pnpm build
            )
        fi
    done
}

setup_deps() {
    # Project override contract: define setup_deps_override() in
    # scripts/project-specific/functions.sh to replace the core deps step.
    if declare -f setup_deps_override >/dev/null 2>&1; then
        info "Running project-specific setup_deps_override"
        setup_deps_override
        return $?
    fi

    _setup_deps_core
}

_setup_wp_core() {
    if wp db check >/dev/null 2>&1; then
        info "DB exists. Resetting"
        wp db reset --yes
    else
        info "DB does not exist. Creating"
        wp db create
    fi


    if [ -n "${DOMAIN_CURRENT_SITE:-}" ]; then
        info "Installing multisite"
        wp core multisite-install --url=${WP_HOME} --title="Test" --admin_user="webikon" --admin_email="admin@webikon.test" --admin_password="password1" --skip-email
    else
        info "Installing single site"
        wp core install --url=${WP_HOME} --title="Test" --admin_user="webikon" --admin_email="admin@webikon.test" --admin_password="password1" --skip-email
    fi

    wp dotenv salts regenerate --skip-plugins --skip-themes 2>/dev/null || true
    wp rewrite structure '%postname%' --hard --skip-plugins --skip-themes
}

setup_wp() {
    # Project override contract: define setup_wp_override() in
    # scripts/project-specific/functions.sh to replace the core WordPress step.
    if declare -f setup_wp_override >/dev/null 2>&1; then
        info "Running project-specific setup_wp_override"
        setup_wp_override
        return $?
    fi

    _setup_wp_core
}

_sync_db_core() {
    if [ -z "${MDB_LICENCE_KEY:-}" ] || [ -z "${MDB_AUTH_SECRET_KEY:-}" ] || [ -z "${MDB_SEARCH_WEB_URL:-}" ] || [ -z "${MDB_REPLACE_WEB_URL:-}" ]; then
        error "Database sync variables are missing. Check .env values for MDB_* keys."
        return 1
    fi

    wp plugin activate wp-migrate-db-pro
    wp migratedb setting update license $MDB_LICENCE_KEY --user=webikon
    wp migratedb pull $MDB_AUTH_SECRET_KEY --find=$MDB_SEARCH_WEB_URL --replace=$MDB_REPLACE_WEB_URL
    wp rewrite flush
    wp cache flush
}

sync_db() {
    # Project override contract: define sync_db_override() in
    # scripts/project-specific/functions.sh to replace the core DB sync step.
    if declare -f sync_db_override >/dev/null 2>&1; then
        info "Running project-specific sync_db_override"
        sync_db_override
        return $?
    fi

    _sync_db_core
}

install_scoop_package() {
    local pkg="$1"

    if command -v scoop >/dev/null 2>&1; then
        info "Installing ${pkg} via Scoop"
        scoop install "$pkg"
        success "${pkg} installed"
        return 0
    fi

    error "Scoop is not installed. Visit https://scoop.sh"
    return 1
}
