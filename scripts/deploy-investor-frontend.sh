#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-${REPO_ROOT}/system/investor-frontend}"

INVESTOR_FRONTEND_DEPLOY_DIR="${INVESTOR_FRONTEND_DEPLOY_DIR:-/var/www/investor-frontend/build}"
INVESTOR_API_BASE_URL="${INVESTOR_API_BASE_URL:-https://investor-admin.ap.boston}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

maybe_sudo() {
  if "$@"; then
    return
  fi

  if command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then
    sudo "$@"
    return
  fi

  echo "Command requires sudo: $*" >&2
  exit 1
}

require_cmd npm
require_cmd rsync

if [[ ! -f "${FRONTEND_DIR}/package.json" ]]; then
  echo "Investor frontend not found at ${FRONTEND_DIR}" >&2
  exit 1
fi

echo "Deploying investor frontend from ${FRONTEND_DIR}"
cd "${FRONTEND_DIR}"

echo "Installing dependencies"
npm ci

echo "Building frontend with API base URL ${INVESTOR_API_BASE_URL}"
REACT_APP_API_BASE_URL="${INVESTOR_API_BASE_URL}" npm run build

echo "Syncing build output to ${INVESTOR_FRONTEND_DEPLOY_DIR}"
maybe_sudo mkdir -p "${INVESTOR_FRONTEND_DEPLOY_DIR}"
maybe_sudo rsync -av --delete build/ "${INVESTOR_FRONTEND_DEPLOY_DIR}/"

echo "Investor frontend deployment finished"
