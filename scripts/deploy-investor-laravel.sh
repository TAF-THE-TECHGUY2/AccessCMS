#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LARAVEL_DIR="${LARAVEL_DIR:-${REPO_ROOT}/system/backend-laravel}"

PHP_BIN="${PHP_BIN:-php}"
COMPOSER_BIN="${COMPOSER_BIN:-composer}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.4-fpm}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"

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

require_cmd "$PHP_BIN"
require_cmd "$COMPOSER_BIN"
require_cmd npm

if [[ ! -f "${LARAVEL_DIR}/artisan" ]]; then
  echo "Laravel app not found at ${LARAVEL_DIR}" >&2
  exit 1
fi

if [[ ! -f "${LARAVEL_DIR}/.env" ]]; then
  echo "Expected ${LARAVEL_DIR}/.env to exist before deployment." >&2
  exit 1
fi

echo "Deploying investor Laravel app from ${LARAVEL_DIR}"
cd "${LARAVEL_DIR}"

echo "Preparing writable directories"
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/testing storage/framework/views storage/logs bootstrap/cache
maybe_sudo chown -R "${DEPLOY_USER}:www-data" storage bootstrap/cache
maybe_sudo find storage bootstrap/cache -type d -exec chmod 775 {} \;
maybe_sudo find storage bootstrap/cache -type f -exec chmod 664 {} \;
maybe_sudo find bootstrap/cache -maxdepth 1 -type f -name '*.php' -delete

echo "Installing PHP dependencies"
"${COMPOSER_BIN}" install --no-interaction --prefer-dist --optimize-autoloader --no-dev

echo "Installing and building frontend assets"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build

if [[ ! -L public/storage ]]; then
  echo "Creating storage symlink"
  "${PHP_BIN}" artisan storage:link
fi

if [[ "${RUN_MIGRATIONS}" == "1" ]]; then
  echo "Running database migrations"
  "${PHP_BIN}" artisan migrate --force
fi

echo "Refreshing Laravel caches"
"${PHP_BIN}" artisan optimize:clear
"${PHP_BIN}" artisan config:cache
"${PHP_BIN}" artisan view:cache
"${PHP_BIN}" artisan queue:restart || true

if command -v systemctl >/dev/null 2>&1; then
  echo "Reloading ${PHP_FPM_SERVICE}"
  maybe_sudo systemctl reload "${PHP_FPM_SERVICE}"
fi

echo "Laravel deployment finished"
