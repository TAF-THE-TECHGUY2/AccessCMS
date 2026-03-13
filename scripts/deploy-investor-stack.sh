#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd git

if [[ ! -d "${REPO_ROOT}/.git" ]]; then
  echo "Git repository not found at ${REPO_ROOT}" >&2
  exit 1
fi

cd "${REPO_ROOT}"

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Refusing to pull: tracked files have local modifications." >&2
  echo "Commit, stash, or discard them first." >&2
  exit 1
fi

echo "Pulling latest changes from ${GIT_REMOTE}/${GIT_BRANCH}"
git fetch "${GIT_REMOTE}"
git pull --ff-only "${GIT_REMOTE}" "${GIT_BRANCH}"

"${SCRIPT_DIR}/deploy-investor-laravel.sh"
"${SCRIPT_DIR}/deploy-investor-frontend.sh"

echo "Investor stack deployment finished"
