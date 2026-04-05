#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend"
UPLOADS_DIR="${BACKEND_DIR}/uploads"
BACKUP_ROOT="${UPLOAD_BACKUP_ROOT:-${HOME}/accesscms-backups}"
GIT_BRANCH="${GIT_BRANCH:-main}"
DEPLOY_FRONTENDS="${DEPLOY_FRONTENDS:-0}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd git
require_cmd tar
require_cmd bash

if [[ ! -d "${REPO_ROOT}/.git" ]]; then
  echo "Expected a git repository at ${REPO_ROOT}" >&2
  exit 1
fi

mkdir -p "${BACKUP_ROOT}"

if [[ -d "${UPLOADS_DIR}" ]]; then
  UPLOAD_BACKUP_PATH="${BACKUP_ROOT}/backend-uploads-${TIMESTAMP}.tgz"
  echo "Backing up uploads to ${UPLOAD_BACKUP_PATH}"
  tar -czf "${UPLOAD_BACKUP_PATH}" -C "${BACKEND_DIR}" uploads
else
  echo "Uploads directory not found at ${UPLOADS_DIR}; skipping uploads backup"
fi

if [[ -f "${BACKEND_DIR}/.env" ]]; then
  ENV_BACKUP_PATH="${BACKUP_ROOT}/backend-env-${TIMESTAMP}.env"
  echo "Backing up backend .env to ${ENV_BACKUP_PATH}"
  cp "${BACKEND_DIR}/.env" "${ENV_BACKUP_PATH}"
fi

cd "${REPO_ROOT}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Stashing tracked changes before pull"
  git stash push -m "safe deploy stash ${TIMESTAMP}"
else
  echo "No tracked changes to stash"
fi

echo "Pulling ${GIT_BRANCH}"
git pull --ff-only origin "${GIT_BRANCH}"

echo "Deploying backend"
bash "${SCRIPT_DIR}/deploy-backend.sh"

if [[ "${DEPLOY_FRONTENDS}" == "1" ]]; then
  echo "Deploying frontends"
  bash "${SCRIPT_DIR}/deploy-frontends.sh"
else
  echo "Skipping frontend deploy. Set DEPLOY_FRONTENDS=1 to include it."
fi

echo "Safe deploy finished"
