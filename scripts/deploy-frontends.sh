#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PUBLIC_DIR="${REPO_ROOT}/public-frontend"
ADMIN_DIR="${REPO_ROOT}/admin-frontend"

PUBLIC_API_BASE_URL="${PUBLIC_API_BASE_URL:-https://api.ap.boston}"
ADMIN_API_BASE_URL="${ADMIN_API_BASE_URL:-https://api.ap.boston}"
PUBLIC_DEPLOY_DIR="${PUBLIC_DEPLOY_DIR:-}"
ADMIN_DEPLOY_DIR="${ADMIN_DEPLOY_DIR:-}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd npm

echo "Building public frontend"
cd "${PUBLIC_DIR}"
npm ci
npm run build
printf 'window.__APP_CONFIG__ = {\n  apiBaseUrl: "%s"\n};\n' "${PUBLIC_API_BASE_URL}" > build/config.js

if [[ -n "${PUBLIC_DEPLOY_DIR}" ]]; then
  require_cmd rsync
  mkdir -p "${PUBLIC_DEPLOY_DIR}"
  rsync -av --delete build/ "${PUBLIC_DEPLOY_DIR}/"
fi

echo "Building admin frontend"
cd "${ADMIN_DIR}"
npm ci
VITE_API_BASE_URL="${ADMIN_API_BASE_URL}" npm run build

if [[ -n "${ADMIN_DEPLOY_DIR}" ]]; then
  require_cmd rsync
  mkdir -p "${ADMIN_DEPLOY_DIR}"
  rsync -av --delete dist/ "${ADMIN_DEPLOY_DIR}/"
fi

echo "Frontend deployment finished"
