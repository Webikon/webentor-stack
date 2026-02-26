#!/usr/bin/env bash
# shell-ui.sh
# Helper for colored console output and interactive questions

# === Colors ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # reset

# === Functions ===

ask_question() {
  local prompt="$1"
  local response
  read -r -p "$(echo -e "${YELLOW}❓ ${prompt}${NC}")" response
  echo "$response"
}

# Strict Y/N prompt loop used by setup flow to avoid accidental progress.
ask_yes_no_strict() {
  local prompt="$1"
  local response
  local normalized

  while true; do
    response=$(ask_question "${prompt} [Y/N]: ")
    normalized="$(echo "$response" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')"

    case "$normalized" in
      Y)
        return 0
        ;;
      N)
        return 1
        ;;
      *)
        error "Invalid answer. Enter Y or N."
        ;;
    esac
  done
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# ERR trap handler — shows the failing command and points to its error output above.
_on_error() {
    local exit_code=$?
    echo "" >&2
    error "────────────────────────────────────────────"
    error "Setup failed! (exit code ${exit_code})"
    error "Command: ${BASH_COMMAND}"
    error "Location: ${BASH_SOURCE[1]:-unknown}:${BASH_LINENO[0]}"
    error ""
    error "Check the output above for the full error."
    error "────────────────────────────────────────────"
}
