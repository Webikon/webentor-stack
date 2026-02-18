#!/usr/bin/env bash
set -e
source "$HELPERS_DIR/shell-ui.sh"

# macOS-specific environment checks are not yet implemented.
# The shared setup runtime (setup.sh) handles cross-platform steps.
# If you need macOS-specific pre-flight checks, add them here as project hooks
# in scripts/hooks/pre-env.sh instead of editing this file.

echo "Note: macOS-specific setup checks are not yet implemented in setup-core."
echo "If macOS-specific steps are required for your project, add them to scripts/hooks/pre-env.sh."
