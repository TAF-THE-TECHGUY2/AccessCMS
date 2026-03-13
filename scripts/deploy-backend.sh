#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend"
APP_NAME="${PM2_APP_NAME:-ap-api}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd node
require_cmd npm
require_cmd pm2

if [[ ! -f "${BACKEND_DIR}/package.json" ]]; then
  echo "Backend package.json not found at ${BACKEND_DIR}" >&2
  exit 1
fi

if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  echo "Expected ${BACKEND_DIR}/.env to exist before deployment." >&2
  exit 1
fi

echo "Deploying backend from ${BACKEND_DIR}"
cd "${BACKEND_DIR}"

echo "Installing dependencies"
npm ci

echo "Building backend"
npm run build

mkdir -p uploads

echo "Reloading PM2 app ${APP_NAME}"
PM2_APP_NAME="${APP_NAME}" pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "PM2 status"
pm2 status "${APP_NAME}"

if command -v curl >/dev/null 2>&1; then
  PORT_VALUE="$(awk -F= '/^PORT=/{print $2}' .env | tail -n 1 | tr -d '"' | tr -d "'" | tr -d '[:space:]')"
  if [[ -n "${PORT_VALUE}" ]]; then
    echo "Health check: http://127.0.0.1:${PORT_VALUE}/health"
    curl --fail --silent --show-error "http://127.0.0.1:${PORT_VALUE}/health" || true
    printf '\n'
  fi
fi

echo "Backend deployment finished"
