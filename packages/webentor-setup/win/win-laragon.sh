#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"
source "$HELPERS_DIR/helpers.sh"

info "=== Enhanced Laragon setup script started ==="

# Load setup toggles and theme configuration before version checks.
load_env "${WORKSPACE_FOLDER}/scripts/.env.setup" || true

# ----------------------------------------
# 0) Detect Laragon configuration
# ----------------------------------------
info "Detecting Laragon configuration..."

# Get Laragon path from helper
LARAGON_PATH=$(get_laragon_path 2>/dev/null || echo "")
if [ -z "$LARAGON_PATH" ]; then
    error "Laragon installation not found. Please install Laragon or set LARAGON_PATH environment variable."
    exit 1
fi
info "Found Laragon at: $LARAGON_PATH"

LARAGON_INI="${LARAGON_PATH}/usr/laragon.ini"
if [ -f "$LARAGON_INI" ]; then
    # Extract domain suffix from Laragon config
    DOMAIN_SUFFIX=$(grep "HostnameFormat=" "$LARAGON_INI" | sed 's/.*{name}\(.*\)/\1/' | tr -d '\r')
    if [ -z "$DOMAIN_SUFFIX" ]; then
        DOMAIN_SUFFIX=".local"  # Default fallback
    fi
    success "Detected domain suffix: $DOMAIN_SUFFIX"
    export DOMAIN_SUFFIX

    # Get project name from folder
    PROJECT_NAME=$(basename "$WORKSPACE_FOLDER")
    PROJECT_DOMAIN="${PROJECT_NAME}${DOMAIN_SUFFIX}"
    export PROJECT_DOMAIN
    success "Project domain: $PROJECT_DOMAIN"

    # Check if Apache vhost exists
    VHOST_FILE="${LARAGON_PATH}/etc/apache2/sites-enabled/auto.${PROJECT_DOMAIN}.conf"
    if [ -f "$VHOST_FILE" ]; then
        success "Virtual host already configured ✅"

        # Check if DocumentRoot uses Apache variables (${ROOT})
        DOC_ROOT_RAW=$(grep "DocumentRoot" "$VHOST_FILE" | head -1 | sed 's/.*DocumentRoot[[:space:]]*"\([^"]*\)".*/\1/' | tr -d '\r')

        if [[ "$DOC_ROOT_RAW" == *'${ROOT}'* ]]; then
            # Extract the actual path from the define directive
            DOC_ROOT=$(grep "define ROOT" "$VHOST_FILE" | sed 's/.*define ROOT "\([^"]*\)".*/\1/' | tr -d '\r')
            info "Document root: $DOC_ROOT (resolved from \${ROOT})"
        else
            DOC_ROOT="$DOC_ROOT_RAW"
            info "Document root: $DOC_ROOT"
        fi
    else
        warning "Virtual host not found. Restart Laragon to auto-create it."
    fi
else
    warning "Laragon configuration not found. Using defaults."
    DOMAIN_SUFFIX=".local"
    PROJECT_NAME=$(basename "$WORKSPACE_FOLDER")
    PROJECT_DOMAIN="${PROJECT_NAME}${DOMAIN_SUFFIX}"
fi

# ----------------------------------------
# 1) Install essential tools via Scoop
# ----------------------------------------

# WP-CLI
if ! command -v wp &>/dev/null; then
    warning "WP-CLI not found."
    if command -v scoop &>/dev/null; then
        install_scoop_package "wp-cli"
    elif command -v scoop.cmd &>/dev/null || command -v scoop.ps1 &>/dev/null; then
        info "Scoop is available in PowerShell. To install WP-CLI:"
        echo "  Run in PowerShell: scoop install wp-cli"
        echo "  Or use Composer: composer global require wp-cli/wp-cli"
    else
        warning "To install WP-CLI manually:"
        echo "  1. Download from: https://wp-cli.org/"
        echo "  2. Or use Composer: composer global require wp-cli/wp-cli"
    fi
else
    success "WP-CLI is already installed ✅"
fi

# NVM
if ! command -v nvm &>/dev/null; then
    warning "NVM not found."
    if command -v scoop &>/dev/null; then
        install_scoop_package "nvm"
        info "Remember to restart your terminal or run 'nvm use <version>' after installation."
    else
        info "Please install NVM manually: https://github.com/coreybutler/nvm-windows"
    fi
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
    if command -v scoop &>/dev/null; then
        install_scoop_package "1password-cli"
    else
        info "1Password CLI is optional but recommended for team credential sharing."
        echo "  Install from: https://developer.1password.com/docs/cli/"
    fi
else
    success "1Password CLI is already installed ✅"
fi

# Composer
if ! command -v composer &>/dev/null; then
    warning "Composer not found."
    if command -v scoop &>/dev/null; then
        install_scoop_package "composer"
    else
        info "Please install Composer manually: https://getcomposer.org/"
    fi
else
    success "Composer is already installed ✅"
fi

# ----------------------------------------
# 2) Check Laragon MySQL service
# ----------------------------------------
info "Checking MySQL service..."

# Test MySQL connection directly (most reliable method)
if mysqladmin -u root ping &>/dev/null; then
    success "MySQL is running and accessible ✅"
else
    error "MySQL is not accessible."
    warning "Please start MySQL in Laragon:"
    echo "1. Open Laragon control panel"
    echo "2. Click 'Start All' or just start MySQL"
    echo "3. Wait for services to start, then continue"
    echo ""
    if ask_yes_no_strict "Do you want to continue without MySQL running?"; then
        warning "Continuing without MySQL. You'll need to start it manually later."
    else
        error "Please start MySQL in Laragon and run the setup again."
        exit 1
    fi
fi

# ----------------------------------------
# 3) Check Laragon Apache/Nginx service
# ----------------------------------------
info "Checking web server..."

# Test if web server is accessible (most reliable method)
if curl -s -I http://localhost/ 2>/dev/null | head -1 | grep -q "200\|403"; then
    success "Web server is running and accessible ✅"
else
    warning "Web server not accessible. Please ensure Apache or Nginx is running in Laragon."
    echo "Check Laragon control panel and start the web server if needed."
fi

# ----------------------------------------
# 4) Setup Laragon PHP in PATH
# ----------------------------------------
info "Setting up Laragon PHP in PATH..."

if [ -d "$LARAGON_PATH" ]; then

    # Find active PHP directory from Laragon config
    if [ -f "$LARAGON_INI" ]; then
        PHP_VERSION=$(awk '/^\[php\]/{flag=1;next}/^\[/{flag=0}flag && /^Version=/{print $0}' "$LARAGON_INI" | cut -d= -f2 | tr -d '\r')
        if [ -n "$PHP_VERSION" ]; then
            PHP_DIR="$LARAGON_PATH/bin/php/$PHP_VERSION"
            info "Using active PHP version from Laragon: $PHP_VERSION"
        fi
    fi

    # Fallback: find any PHP directory if config method failed
    if [ -z "$PHP_DIR" ] || [ ! -d "$PHP_DIR" ]; then
        for php_folder in "$LARAGON_PATH"/bin/php/php-*; do
            if [ -d "$php_folder" ]; then
                PHP_DIR="$php_folder"
                break
            fi
        done
    fi

    if [ -n "$PHP_DIR" ]; then
        info "Found PHP directory: $PHP_DIR"

        # Add to .bashrc if not already there
        BASHRC_FILE="$HOME/.bashrc"
        EXPORT_LINE="export PATH=\"$PHP_DIR:\$PATH\""

        if ! grep -Fq "$PHP_DIR" "$BASHRC_FILE" 2>/dev/null; then
            echo "$EXPORT_LINE" >> "$BASHRC_FILE"
            success "Added Laragon PHP to PATH in $BASHRC_FILE"
        else
            info "Laragon PHP already in PATH in .bashrc"
        fi

        # Apply to current session
        export PATH="$PHP_DIR:$PATH"

        success "Laragon PHP setup complete."
        info "Current PHP:"
        which php
        php -v | head -1
    else
        warning "PHP directory not found in Laragon. Please check your Laragon installation."
    fi
else
    error "Laragon installation not found. Please specify the correct path."
fi

# ----------------------------------------
# 5) Update .env file with correct domain
# ----------------------------------------
if [ -n "$PROJECT_DOMAIN" ]; then
    info "Updating .env file with correct domain..."

    if [ -f "$WORKSPACE_FOLDER/.env" ]; then
        # Check current WP_HOME value
        CURRENT_WP_HOME=$(grep "^WP_HOME=" "$WORKSPACE_FOLDER/.env" | cut -d= -f2 | tr -d "'\"")
        EXPECTED_WP_HOME="http://$PROJECT_DOMAIN"

        if [ "$CURRENT_WP_HOME" != "$EXPECTED_WP_HOME" ]; then
            # Update WP_HOME in .env
            sed -i "s|^WP_HOME=.*|WP_HOME='$EXPECTED_WP_HOME'|" "$WORKSPACE_FOLDER/.env"
            success "Updated WP_HOME to: $EXPECTED_WP_HOME"
        else
            info "WP_HOME already set correctly: $EXPECTED_WP_HOME"
        fi

        # Update MDB_REPLACE_WEB_URL domain suffixes to match Laragon config
        # This converts .test, .local, .dev etc. to the configured DOMAIN_SUFFIX
        CURRENT_MDB_URL=$(grep "^MDB_REPLACE_WEB_URL=" "$WORKSPACE_FOLDER/.env" | cut -d= -f2 | tr -d '"')
        if [ -n "$CURRENT_MDB_URL" ]; then
            # Replace any domain suffix (.test, .local, .dev, etc.) with Laragon's configured suffix
            # Pattern matches: domain.suffix where suffix is alphanumeric TLD
            UPDATED_MDB_URL=$(echo "$CURRENT_MDB_URL" | sed -E "s/\.[a-zA-Z]+([,\"]|$)/${DOMAIN_SUFFIX}\1/g")

            if [ "$CURRENT_MDB_URL" != "$UPDATED_MDB_URL" ]; then
                sed -i "s|^MDB_REPLACE_WEB_URL=.*|MDB_REPLACE_WEB_URL=\"$UPDATED_MDB_URL\"|" "$WORKSPACE_FOLDER/.env"
                success "Updated MDB_REPLACE_WEB_URL domain suffixes to: $DOMAIN_SUFFIX"
                info "New value: $UPDATED_MDB_URL"
            else
                info "MDB_REPLACE_WEB_URL already uses correct suffix: $DOMAIN_SUFFIX"
            fi
        fi
    else
        warning ".env file not found. Please create it from .env.example"
    fi
fi

# ----------------------------------------
# 6) Configure Xdebug for Laragon (Optional)
# ----------------------------------------
configure_xdebug_laragon() {
    info "Configuring Xdebug for Laragon..."

    if [ -n "$PHP_DIR" ] && [ -d "$PHP_DIR" ]; then
        PHP_INI="$PHP_DIR/php.ini"

        if [ -f "$PHP_INI" ]; then
            # Check if Xdebug is already configured
            if grep -q "xdebug" "$PHP_INI" 2>/dev/null; then
                success "Xdebug already configured in Laragon PHP."
            else
                warning "Xdebug not configured. Adding configuration..."

                # Backup php.ini
                cp "$PHP_INI" "$PHP_INI.backup.$(date +%Y%m%d%H%M%S)"

                # Add Xdebug configuration
                cat >> "$PHP_INI" <<EOL

; Xdebug configuration added by enhanced Laragon setup
[xdebug]
zend_extension = xdebug
xdebug.mode = debug,develop
xdebug.start_with_request = trigger
xdebug.client_host = localhost
xdebug.client_port = 9003
xdebug.idekey = VSCODE
EOL

                success "Xdebug configuration added to php.ini"
                info "Please restart Laragon services for changes to take effect."
            fi

            # Verify Xdebug
            if php -m | grep -qi "xdebug"; then
                success "Xdebug is enabled in PHP."
            else
                warning "Xdebug module not loaded. Please ensure xdebug.dll is in the ext folder."
            fi
        else
            error "php.ini not found at $PHP_INI"
        fi
    fi
}

# Automatic Xdebug installation
install_xdebug() {
    info "Attempting to install Xdebug automatically..."

    # Get current PHP version and architecture dynamically
    PHP_VERSION_FULL=$(php -v | head -1 | sed 's/PHP \([0-9]*\.[0-9]*\)\..*/\1/')
    IS_NTS=$(php -v | head -1 | grep -i "NTS" >/dev/null && echo "nts" || echo "ts")
    # Detect architecture from PHP version string instead of modules
    ARCH=$(php -v | head -1 | grep -i "x64" >/dev/null && echo "x86_64" || echo "x86")

    # Determine VS version based on PHP version
    if [[ "$PHP_VERSION_FULL" == "8.3" ]]; then
        VS_VERSION="vs16"
    elif [[ "$PHP_VERSION_FULL" == "8.2" ]]; then
        VS_VERSION="vs16"
    else
        VS_VERSION="vs16" # Default fallback
    fi

    # Construct Xdebug filename
    XDEBUG_VERSION="3.3.2" # Latest stable as of script creation
    XDEBUG_FILENAME="php_xdebug-${XDEBUG_VERSION}-${PHP_VERSION_FULL}-${VS_VERSION}-${IS_NTS}-${ARCH}.dll"
    XDEBUG_URL="https://xdebug.org/files/${XDEBUG_FILENAME}"

    # Get paths - handle Windows to Unix path conversion
    EXT_DIR_RAW=$(php -r "echo ini_get('extension_dir');")
    INI_FILE_RAW=$(php --ini | grep "Loaded Configuration File" | sed 's/.*:[[:space:]]*//')

    # Convert Windows paths to Git Bash format: C:\path -> /c/path
    # Use PHP_DIR if available, otherwise fallback to parsing raw paths
    if [ -n "$PHP_DIR" ]; then
        EXT_DIR="$PHP_DIR/ext"
        INI_FILE="$PHP_DIR/php.ini"
    else
        EXT_DIR=$(echo "$EXT_DIR_RAW" | sed 's|\\|/|g' | sed 's|C:|/c|i')
        INI_FILE=$(echo "$INI_FILE_RAW" | sed 's|\\|/|g' | sed 's|C:|/c|i')
    fi

    # Verify paths exist
    if [ ! -d "$EXT_DIR" ]; then
        EXT_DIR=$(echo "$EXT_DIR_RAW" | sed 's|\\|/|g' | sed 's|C:|/c|i')
    fi
    if [ ! -f "$INI_FILE" ]; then
        INI_FILE=$(echo "$INI_FILE_RAW" | sed 's|\\|/|g' | sed 's|C:|/c|i')
    fi

    info "Downloading Xdebug: $XDEBUG_FILENAME"
    info "Extension directory: $EXT_DIR"

    # Download Xdebug
    if curl -L -o "$EXT_DIR/$XDEBUG_FILENAME" "$XDEBUG_URL" 2>/dev/null; then
        success "Downloaded Xdebug extension ✅"

        # Add to php.ini if not already present
        if ! grep -q "xdebug" "$INI_FILE" 2>/dev/null; then
            info "Adding Xdebug to php.ini..."
            echo "" >> "$INI_FILE"
            echo "; Xdebug Configuration" >> "$INI_FILE"
            echo "zend_extension=$XDEBUG_FILENAME" >> "$INI_FILE"
            echo "xdebug.mode=debug" >> "$INI_FILE"
            echo "xdebug.start_with_request=yes" >> "$INI_FILE"
            echo "xdebug.client_host=127.0.0.1" >> "$INI_FILE"
            echo "xdebug.client_port=9003" >> "$INI_FILE"

            success "Added Xdebug configuration to php.ini ✅"
            info "Xdebug will be available after restarting your web server."
        else
            warning "Xdebug configuration already exists in php.ini"
        fi

        return 0
    else
        error "Failed to download Xdebug from: $XDEBUG_URL"
        return 1
    fi
}

# Ask if user wants to configure Xdebug
if ask_yes_no_strict "Do you want to install and configure Xdebug for debugging?"; then
    if install_xdebug; then
        success "Xdebug installation completed! ✅"
        info "Restart Laragon to activate Xdebug."
    else
        warning "Automatic Xdebug installation failed."
        echo ""
        echo "Manual installation steps:"

        # Get current PHP details for manual instructions
        PHP_VERSION_FULL=$(php -v | head -1 | sed 's/PHP \([0-9]*\.[0-9]*\)\..*/\1/')
        IS_TS=$(php -v | head -1 | grep -i "NTS" >/dev/null && echo "Non Thread Safe" || echo "Thread Safe")
        ARCH=$(php -m 2>/dev/null | grep -i "x64" >/dev/null && echo "x64" || echo "x86")

        echo "1. Download from: https://xdebug.org/download"
        echo "2. Choose: PHP $PHP_VERSION_FULL VC16 $ARCH $IS_TS"
        echo "3. Place .dll in: $(php -r "echo ini_get('extension_dir');")"
        echo "4. Add to php.ini: $(php --ini | grep "Loaded Configuration File" | sed 's/.*: //')"
        echo "   zend_extension=php_xdebug-[version].dll"
        echo ""

        if ! ask_yes_no_strict "Continue setup without Xdebug?"; then
            info "Setup paused. Install Xdebug manually and re-run the script."
            exit 0
        fi
    fi
else
    info "Skipping Xdebug installation."
fi

# ----------------------------------------
# 7) Version checks
# ----------------------------------------
ENV_OK=true

# Set paths
# Resolve the first configured theme from WP_THEMES to avoid hardcoding starter internals.
PRIMARY_THEME="$(first_theme)"
PACKAGE_JSON="$WORKSPACE_FOLDER/web/app/themes/${PRIMARY_THEME}/package.json"
COMPOSER_JSON="$WORKSPACE_FOLDER/composer.json"

# Check Node version
if [ -f "$PACKAGE_JSON" ]; then
    REQUIRED_NODE_VERSION=$(grep '"node":' "$PACKAGE_JSON" | sed -E 's/.*"node": *"[^0-9]*([0-9]+).*/\1/')
    info "Required Node version: >= $REQUIRED_NODE_VERSION"

    if command -v node &>/dev/null; then
        INSTALLED_NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
        info "Installed Node version: v$INSTALLED_NODE_VERSION"

        if (( INSTALLED_NODE_VERSION >= REQUIRED_NODE_VERSION )); then
            success "Node version OK ✅"
        else
            warning "Node version $INSTALLED_NODE_VERSION is too old. Need >= $REQUIRED_NODE_VERSION"

            # Automatically install and switch to correct Node version
            if command -v nvm &>/dev/null; then
                info "Installing Node v$REQUIRED_NODE_VERSION via nvm..."

                # Windows nvm needs different command
                if [[ "$OS" == "Windows_NT" ]]; then
                    nvm install $REQUIRED_NODE_VERSION 2>/dev/null || true
                    nvm use $REQUIRED_NODE_VERSION 2>/dev/null || true

                    # Check if switch worked
                    NEW_NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
                    if (( NEW_NODE_VERSION >= REQUIRED_NODE_VERSION )); then
                        success "Switched to Node v$REQUIRED_NODE_VERSION ✅"
                    else
                        warning "Could not switch Node version. Please run manually:"
                        echo "  nvm install $REQUIRED_NODE_VERSION"
                        echo "  nvm use $REQUIRED_NODE_VERSION"
                        echo "  Then restart your terminal"
                    fi
                else
                    nvm install $REQUIRED_NODE_VERSION && nvm use $REQUIRED_NODE_VERSION
                fi
            else
                echo "To fix: Install nvm and run:"
                echo "  nvm install $REQUIRED_NODE_VERSION && nvm use $REQUIRED_NODE_VERSION"
            fi

            info "You may need to restart your terminal for changes to take effect."
        fi
    else
        error "Node is not installed."
        ENV_OK=false
    fi
fi

# Check PHP version
if [ -f "$COMPOSER_JSON" ]; then
    # Handle both ^8.2 and >=8.2 formats
    REQUIRED_PHP_VERSION=$(grep '"php":' "$COMPOSER_JSON" | sed -E 's/.*"php": *"[^0-9]*([0-9]+\.[0-9]+).*".*/\1/')
    info "Required PHP version: >= $REQUIRED_PHP_VERSION"

    if command -v php &>/dev/null; then
        INSTALLED_PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null)
        info "Installed PHP version: $INSTALLED_PHP_VERSION"

        REQUIRED_PHP_MAJOR=$(echo "$REQUIRED_PHP_VERSION" | cut -d. -f1)
        REQUIRED_PHP_MINOR=$(echo "$REQUIRED_PHP_VERSION" | cut -d. -f2)
        INSTALLED_PHP_MAJOR=$(echo "$INSTALLED_PHP_VERSION" | cut -d. -f1)
        INSTALLED_PHP_MINOR=$(echo "$INSTALLED_PHP_VERSION" | cut -d. -f2)

        if (( INSTALLED_PHP_MAJOR > REQUIRED_PHP_MAJOR )) || { (( INSTALLED_PHP_MAJOR == REQUIRED_PHP_MAJOR )) && (( INSTALLED_PHP_MINOR >= REQUIRED_PHP_MINOR )); }; then
            success "PHP version OK ✅"
        else
            error "PHP version too old. Please update PHP to >= $REQUIRED_PHP_VERSION in Laragon."
            ENV_OK=false
        fi
    else
        error "PHP is not installed or not in PATH."
        ENV_OK=false
    fi
fi

# ----------------------------------------
# 8) Create .htaccess for WordPress permalinks
# ----------------------------------------
info "Setting up .htaccess for WordPress permalinks..."

HTACCESS_FILE="$WORKSPACE_FOLDER/web/.htaccess"
if [ ! -f "$HTACCESS_FILE" ]; then
    cat > "$HTACCESS_FILE" <<'EOL'
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
EOL
    success "Created .htaccess with WordPress rewrite rules ✅"
else
    info ".htaccess already exists"
fi

# ----------------------------------------
# 9) Setup image proxy in Apache vhosts (optional)
# ----------------------------------------
# Uncomment the following line and provide your production URL to enable image proxy
# This redirects missing uploads to production server, so you don't need to download media files
# setup_htaccess_image_proxy "your-production-domain.com"

# ----------------------------------------
# 10) Final summary
# ----------------------------------------
echo ""
info "=== Setup Summary ==="
success "Project URL: https://$PROJECT_DOMAIN"
success "Document Root: $WORKSPACE_FOLDER/web"

if [ "$ENV_OK" = false ]; then
    echo ""
    error "Some requirements are not met. Please fix the issues above."
    exit 1
else
    echo ""
    success "Enhanced Laragon environment check passed!"
    info "Your Laragon setup is ready for development."
    echo ""
    info "Next steps:"
    echo "1. Install Composer dependencies: composer install"
    if [ -n "$PRIMARY_THEME" ]; then
        echo "2. Install theme dependencies: cd web/app/themes/${PRIMARY_THEME} && pnpm install"
        echo "3. Build theme assets: pnpm build"
    else
        echo "2. Configure WP_THEMES in scripts/.env.setup, then install theme dependencies."
        echo "3. Build theme assets from your active theme directory."
    fi
    echo "4. Visit your site: https://$PROJECT_DOMAIN"
fi

info "=== Enhanced Laragon setup script finished ==="
