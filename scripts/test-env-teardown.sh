#!/usr/bin/env bash
#
# Tears down the test-site environment: drops database, unlinks Valet, cleans generated files.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_SITE_DIR="$ROOT_DIR/test-site"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Source .env if it exists
if [ -f "$TEST_SITE_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$TEST_SITE_DIR/.env"
  set +a
fi

DB_NAME="${DB_NAME:-webentor_test}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"

# ---------------------------------------------------------------------------
# 1. Valet unlink
# ---------------------------------------------------------------------------
info "Unlinking from Valet..."
cd "$TEST_SITE_DIR" 2>/dev/null && herd unlink webentor-test 2>/dev/null || warn "Herd unlink skipped (not linked or Herd not available)."

# ---------------------------------------------------------------------------
# 2. Drop database
# ---------------------------------------------------------------------------
info "Dropping database '$DB_NAME'..."
MYSQL_ARGS=(-u "$DB_USER")
[ -n "$DB_PASSWORD" ] && MYSQL_ARGS+=(-p"$DB_PASSWORD")
[ "$DB_HOST" != "localhost" ] && MYSQL_ARGS+=(-h "$DB_HOST")

mysql "${MYSQL_ARGS[@]}" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`;" 2>/dev/null \
  || warn "Database drop failed (may not exist or bad credentials)."

# ---------------------------------------------------------------------------
# 3. Clean generated files
# ---------------------------------------------------------------------------
info "Removing generated files..."
rm -rf "$TEST_SITE_DIR/vendor"
rm -rf "$TEST_SITE_DIR/web/wp"
rm -rf "$TEST_SITE_DIR/web/app/plugins"
rm -rf "$TEST_SITE_DIR/web/app/mu-plugins"
rm -rf "$TEST_SITE_DIR/web/app/themes/webentor-theme-v2"
rm -rf "$TEST_SITE_DIR/web/app/uploads"
rm -rf "$TEST_SITE_DIR/web/app/cache"
rm -f  "$TEST_SITE_DIR/.env"
rm -f  "$TEST_SITE_DIR/composer.lock"
rm -f  "$TEST_SITE_DIR/auth.json"

# Recreate empty dirs for gitkeep
mkdir -p "$TEST_SITE_DIR/web/app/plugins"
touch "$TEST_SITE_DIR/web/app/plugins/.gitkeep"
mkdir -p "$TEST_SITE_DIR/web/app/themes"
mkdir -p "$TEST_SITE_DIR/web/app/mu-plugins"

info "Test environment torn down."
