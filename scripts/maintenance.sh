#!/usr/bin/env bash

# Toggle the public-frontend (Azure Static Web App) into / out of maintenance mode.
#
#   ./scripts/maintenance.sh on        Route the whole site to maintenance.html
#   ./scripts/maintenance.sh off       Restore normal SPA routing
#   ./scripts/maintenance.sh status    Show which mode is currently active
#
# Add --push to commit and push in one step (triggers the GitHub Actions deploy):
#   ./scripts/maintenance.sh on --push
#
# The change only goes live after it is pushed to the `main` branch, because
# Azure Static Web Apps deploys via the GitHub Actions workflow.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../public-frontend" && pwd)"

ACTIVE="$FRONTEND_DIR/staticwebapp.config.json"
LIVE="$FRONTEND_DIR/staticwebapp.config.live.json"
MAINT="$FRONTEND_DIR/staticwebapp.config.maintenance.json"

mode="${1:-}"
push="${2:-}"

current_mode() {
  if grep -q "maintenance.html" "$ACTIVE" 2>/dev/null; then
    echo "ON (maintenance)"
  else
    echo "OFF (live)"
  fi
}

case "$mode" in
  on)
    cp "$MAINT" "$ACTIVE"
    echo "🛠  Maintenance mode: ON — visitors will see maintenance.html."
    ;;
  off)
    cp "$LIVE" "$ACTIVE"
    echo "✅ Maintenance mode: OFF — normal site restored."
    ;;
  status)
    echo "Current mode: $(current_mode)"
    exit 0
    ;;
  *)
    echo "Usage: $0 {on|off|status} [--push]" >&2
    echo "Current mode: $(current_mode)" >&2
    exit 1
    ;;
esac

if [ "$push" = "--push" ]; then
  cd "$SCRIPT_DIR/.."
  git add "$ACTIVE"
  git commit -m "Maintenance mode: ${mode}"
  git push
  echo "🚀 Pushed to remote — the GitHub Actions deploy is now running."
else
  echo
  echo "Next, deploy the change:"
  echo "    git add public-frontend/staticwebapp.config.json"
  echo "    git commit -m \"Maintenance mode: ${mode}\""
  echo "    git push"
fi
