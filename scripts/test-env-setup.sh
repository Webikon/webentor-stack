#!/usr/bin/env bash
#
# Provisions the test-site WordPress environment for E2E testing.
# Prerequisites: PHP, Composer, MySQL, WP-CLI, pnpm, Laravel Valet.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_SITE_DIR="$ROOT_DIR/test-site"
THEME_SRC="$ROOT_DIR/packages/webentor-starter/web/app/themes/webentor-theme-v2"
THEME_DEST="$TEST_SITE_DIR/web/app/themes/webentor-theme-v2"
SITE_URL="http://webentor-test.test"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
check_dependency() {
  command -v "$1" &>/dev/null || error "$1 is required but not installed."
}

info "Checking dependencies..."
check_dependency php
check_dependency composer
check_dependency mysql
check_dependency wp
check_dependency pnpm
check_dependency herd

# ---------------------------------------------------------------------------
# 1. Environment file
# ---------------------------------------------------------------------------
if [ ! -f "$TEST_SITE_DIR/.env" ]; then
  info "Creating .env from .env.example..."
  cp "$TEST_SITE_DIR/.env.example" "$TEST_SITE_DIR/.env"
else
  info ".env already exists, skipping copy."
fi

# Source env vars for use in this script
set -a
# shellcheck disable=SC1091
source "$TEST_SITE_DIR/.env"
set +a

DB_NAME="${DB_NAME:-webentor_test}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"
WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-admin}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:-test@webentor.test}"

# ---------------------------------------------------------------------------
# 2. ACF Pro Composer auth
#    Mirrors the pattern from packages/webentor-setup/helpers/helpers.sh
# ---------------------------------------------------------------------------
if [ -n "${PLUGIN_ACF_KEY:-}" ] && [ -n "${PLUGIN_ACF_SITE_URL:-}" ]; then
  info "Configuring Composer auth for ACF Pro..."
  cd "$TEST_SITE_DIR"
  composer config --auth http-basic.connect.advancedcustomfields.com \
    "$PLUGIN_ACF_KEY" "$PLUGIN_ACF_SITE_URL"
else
  error "PLUGIN_ACF_KEY and PLUGIN_ACF_SITE_URL are required. Set them in test-site/.env"
fi

# ---------------------------------------------------------------------------
# 3. MySQL database
# ---------------------------------------------------------------------------
info "Creating database '$DB_NAME' if it doesn't exist..."
MYSQL_ARGS=(-u "$DB_USER")
[ -n "$DB_PASSWORD" ] && MYSQL_ARGS+=(-p"$DB_PASSWORD")
[ "$DB_HOST" != "localhost" ] && MYSQL_ARGS+=(-h "$DB_HOST")

mysql "${MYSQL_ARGS[@]}" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
  || error "Failed to create database. Check your MySQL credentials in .env."

# ---------------------------------------------------------------------------
# 4. Copy mu-plugins from starter (before Composer, which adds its own into subdirs)
# ---------------------------------------------------------------------------
info "Copying mu-plugins from starter..."
MU_SRC="$ROOT_DIR/packages/webentor-starter/web/app/mu-plugins"
MU_DEST="$TEST_SITE_DIR/web/app/mu-plugins"
# web/app/ doesn't exist on a fresh test-site (Composer creates it in step 5),
# so ensure the parent exists before copying.
mkdir -p "$TEST_SITE_DIR/web/app"
rm -rf "$MU_DEST"
cp -R "$MU_SRC" "$MU_DEST"
info "Copied mu-plugins."

# Copy web/index.php (Bedrock WP bootstrapper)
cp "$ROOT_DIR/packages/webentor-starter/web/index.php" "$TEST_SITE_DIR/web/index.php"

# ---------------------------------------------------------------------------
# 5. Composer install (Bedrock root — WP core + plugins into subdirs)
# ---------------------------------------------------------------------------
info "Running composer install in test-site/..."
cd "$TEST_SITE_DIR"
composer install --no-interaction --prefer-dist

# ---------------------------------------------------------------------------
# 6. Copy theme into test-site
#    Copy (not symlink) so we can override the theme's composer.json with a
#    path repo for webentor-core without modifying the monorepo source.
# ---------------------------------------------------------------------------
mkdir -p "$(dirname "$THEME_DEST")"

if [ ! -d "$THEME_DEST" ]; then
  info "Copying theme into test-site..."
  cp -R "$THEME_SRC" "$THEME_DEST"
else
  info "Theme directory already exists. Syncing files..."
  rsync -a --delete \
    --exclude='vendor/' \
    --exclude='node_modules/' \
    --exclude='public/' \
    "$THEME_SRC/" "$THEME_DEST/"
fi

# ---------------------------------------------------------------------------
# 7. Theme PHP deps — add path repo for webentor-core, then install
# ---------------------------------------------------------------------------
info "Configuring theme Composer with local path repo for webentor-core..."
cd "$THEME_DEST"

# Prepend local path repo (higher priority than the GitHub repo already in theme's composer.json)
composer config repositories.local '{"type": "path", "url": "../../../../../packages/webentor-core", "options": {"symlink": true}}' --no-plugins --no-interaction 2>/dev/null || true

# Relax version constraint — path repos resolve as 9999999-dev which doesn't match ^0.9
rm -f composer.lock
composer require webikon/webentor-core:"*@dev" --no-install --no-interaction --no-plugins

info "Running composer install in theme..."
composer install --no-interaction --prefer-dist

# ---------------------------------------------------------------------------
# 8. Theme JS/CSS assets — pnpm install + build
# ---------------------------------------------------------------------------
info "Pointing @webikon packages to local monorepo paths..."
cd "$THEME_DEST"

# Rewrite @webikon deps to link: protocol (pnpm equivalent of Composer path repos)
node -e "
const pkg = JSON.parse(require('fs').readFileSync('./package.json', 'utf8'));
pkg.devDependencies['@webikon/webentor-core'] = 'link:../../../../../packages/webentor-core';
pkg.devDependencies['@webikon/webentor-configs'] = 'link:../../../../../packages/webentor-configs';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

rm -f pnpm-lock.yaml

info "Installing theme JS dependencies..."
pnpm install --no-frozen-lockfile

info "Building theme assets..."
pnpm build

# ---------------------------------------------------------------------------
# 9. WordPress install via WP-CLI
# ---------------------------------------------------------------------------
info "Installing WordPress..."
cd "$TEST_SITE_DIR"

if wp core is-installed 2>/dev/null; then
  info "WordPress is already installed, skipping."
else
  wp core install \
    --url="$SITE_URL" \
    --title="Webentor Test Site" \
    --admin_user="$WP_ADMIN_USER" \
    --admin_password="$WP_ADMIN_PASSWORD" \
    --admin_email="$WP_ADMIN_EMAIL" \
    --skip-email
fi

# Run any pending database schema upgrade. Without this, a core version bump
# (e.g. WP 7.0) leaves wp-admin stuck on the "Database Update Required" screen,
# which blocks the block editor and every editor-dependent E2E test.
info "Running database upgrade (if pending)..."
wp core update-db || warn "Database upgrade reported an issue (non-critical)."

# ---------------------------------------------------------------------------
# 10. Activate theme and plugins
# ---------------------------------------------------------------------------
info "Activating theme..."
wp theme activate webentor-theme-v2 || warn "Theme activation failed — Acorn may need bootstrapping first."

info "Activating plugins..."
wp plugin activate --all 2>/dev/null || warn "Some plugins failed to activate (non-critical)."

# ---------------------------------------------------------------------------
# 11. Herd link (from project root, Bedrock serves from web/)
# ---------------------------------------------------------------------------
info "Linking to Herd..."
cd "$TEST_SITE_DIR"
herd link webentor-test 2>/dev/null || warn "Herd link failed — you may need to run 'herd link webentor-test' manually from test-site/."

# ---------------------------------------------------------------------------
# 12. Seed basic content
# ---------------------------------------------------------------------------
info "Seeding demo content..."
cd "$TEST_SITE_DIR"

# Create a sample page with a basic block if none exists
SAMPLE_PAGE=$(wp post list --post_type=page --post_status=publish --field=ID 2>/dev/null | head -1)
if [ -z "$SAMPLE_PAGE" ]; then
  wp post create \
    --post_type=page \
    --post_title="Test Page" \
    --post_status=publish \
    --post_content='<!-- wp:paragraph --><p>This is the webentor test site. All packages are loaded and ready for E2E testing.</p><!-- /wp:paragraph -->'
  info "Created sample page."
else
  info "Pages already exist, skipping seed."
fi

# Set permalink structure
wp rewrite structure '/%postname%/' --hard 2>/dev/null || true

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
info "=========================================="
info "  Test site ready!"
info "  URL:      $SITE_URL"
info "  Admin:    $SITE_URL/wp/wp-admin"
info "  User:     $WP_ADMIN_USER"
info "  Password: $WP_ADMIN_PASSWORD"
info "=========================================="
