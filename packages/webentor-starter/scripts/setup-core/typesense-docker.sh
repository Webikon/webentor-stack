#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

# Set workspace folder to current folder if not already defined
WORKSPACE_FOLDER=${WORKSPACE_FOLDER:-$(pwd)}
# Path to docker-compose file
COMPOSE_FILE="$WORKSPACE_FOLDER/typesense-config/docker-compose.yml"

# 1. Check if docker-compose.yml exists
if [ ! -f "$COMPOSE_FILE" ]; then
    error "File $COMPOSE_FILE not found. Please create it first."
    exit 1
fi

# 2. Check if docker is available
if ! command -v docker &>/dev/null; then
    error "Docker is not installed or not in PATH. Please install Docker."
    exit 1
fi

# 3. Check if data folder is available
if [ ! -d "$WORKSPACE_FOLDER/typesense-data" ]; then
    echo "Creating data directory: $WORKSPACE_FOLDER/typesense-data"
    mkdir -p "$WORKSPACE_FOLDER/typesense-data"
fi

# 4. Run Typesense container
echo "Docker is available. Running Typesense container..."
docker compose -f "$COMPOSE_FILE" up -d

# Confirm result
if [ $? -eq 0 ]; then
    success "Typesense is now running (check http://localhost:8108)."
else
    warning "Failed to start Typesense. Check Docker logs."
fi