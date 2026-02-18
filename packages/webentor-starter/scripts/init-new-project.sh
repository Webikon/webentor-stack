#!/usr/bin/env bash
set -e

echo "This script is deprecated."
echo "Use setup CLI instead:"
echo "  ./scripts/setup-core/bin/webentor-setup init --project <slug> --starter-version latest --with-db-sync false --env-source 1password --ci-provider gitlab"
exit 1
