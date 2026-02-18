#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"
source "$HELPERS_DIR/helpers.sh"

info "=== Windows setup script started ==="

# Check if scoop is installed
if check_command "scoop" "Scoop is not installed."; then
    info "Scoop is already installed."
elif command -v scoop.cmd &>/dev/null || command -v scoop.ps1 &>/dev/null; then
    info "Scoop is installed but not available in Git Bash."
    warning "Scoop works in PowerShell but not Git Bash. This is normal."
    info "For automatic tool installation, run this setup in PowerShell instead:"
    echo "  pwsh scripts/setup.sh"
    info "Otherwise, tools will be installed manually if missing."
else
    warning "Scoop is not installed."
    info "Scoop can help install missing tools automatically, but is not required."
    echo ""
    info "To install Scoop:"
    echo "1. Visit: https://scoop.sh/"
    echo "2. Or run one of these commands in PowerShell:"
    echo "   Regular user: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; irm get.scoop.sh | iex"
    echo "   Administrator: iex \"& {\$(irm get.scoop.sh)} -RunAsAdmin\""
    echo ""

    while true; do
        SCOOP_CHOICE=$(ask_question "Do you want to continue without Scoop, or stop to install it first? [continue/stop]: ")

        case "$SCOOP_CHOICE" in
            continue|c|C)
                warning "Continuing without Scoop. You may need to install some tools manually if they're missing."
                break
                ;;
            stop|s|S)
                echo ""
                info "Please install Scoop first:"
                echo "1. Visit https://scoop.sh/ for detailed instructions"
                echo "2. Or run one of these commands in PowerShell:"
                echo "   Regular user: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; irm get.scoop.sh | iex"
                echo "   Administrator: iex \"& {\$(irm get.scoop.sh)} -RunAsAdmin\""
                echo "3. Run this setup script again"
                exit 0
                ;;
            *)
                error "Please enter 'continue' to proceed or 'stop' to install Scoop first."
                ;;
        esac
    done
fi

# Ask user which local server to use
warning "Which local server do you want to use?"
echo "1) Herd"
echo "2) Laragon"
echo "3) Other"
read -r -p "Enter choice [1-3]: " SERVER_CHOICE

case "$SERVER_CHOICE" in
  1)
    info "You chose Herd."

    # Check if Herd is installed
    if bash "$SCRIPT_DIR/win/win-herd-check.sh" &>/dev/null; then
        success "Herd is installed in the system."

        # Check if Herd is available in current Bash
        if ! bash "$SCRIPT_DIR/win/win-herd-path-check.sh" &>/dev/null; then
            warning "Herd is installed but not available in this terminal."
            info "Attempting to set up Herd PATH and alias for this terminal..."

            # Call the separate setup script
            if [ -f "$SCRIPT_DIR/win/win-herd-path-set.sh" ]; then
                bash "$SCRIPT_DIR/win/win-herd-path-set.sh"
                success "Herd PATH and alias set for this terminal."
            else
                error "win-herd-path-set.sh not found in ${SCRIPT_DIR}/win"
                info "Please add Herd to your PATH manually or use PowerShell to run Herd commands."
            fi
        fi

        # After PATH setup or if Herd was already available, run win-herd.sh
        if [ -f "$SCRIPT_DIR/win/win-herd.sh" ]; then
            info "Running win-herd.sh..."
            bash "$SCRIPT_DIR/win/win-herd.sh"
        else
            error "win-herd.sh not found in ${SCRIPT_DIR}/win"
        fi
    else
        error "Herd is not installed. Please install Herd manually: https://herd.laravel.com/"
    fi
    ;;
  2)
    info "You chose Laragon."
    if [ -f "$SCRIPT_DIR/win/win-laragon.sh" ]; then
      info "Running Laragon setup..."
      source "$SCRIPT_DIR/win/win-laragon.sh"

      # Flag consumed by common.sh to normalize .env URLs after 1Password fetch.
      LARAGON_SETUP_DONE=true
    else
      error "Laragon setup script not found in ${SCRIPT_DIR}/win"
    fi
    ;;
  3)
    warning "You chose Other. Please make sure your local server is configured manually."
    ;;
  *)
    error "Invalid choice. Exiting."
    exit 1
    ;;
esac

info "=== Windows setup script finished ==="
