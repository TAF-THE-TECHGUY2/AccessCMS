#!/usr/bin/env bash

set -u

section() {
  printf '\n===== %s =====\n' "$1"
}

run_cmd() {
  local label="$1"
  shift
  printf '\n$ %s\n' "$label"
  "$@" 2>&1 || true
}

section "System"
run_cmd "date" date
run_cmd "uname -a" uname -a
run_cmd "lsb_release -a" lsb_release -a
run_cmd "pwd" pwd
run_cmd "whoami" whoami

section "Resources"
run_cmd "df -h" df -h
run_cmd "free -h" free -h

section "Runtime"
run_cmd "node -v" node -v
run_cmd "npm -v" npm -v
run_cmd "pm2 -v" pm2 -v
run_cmd "pm2 list" pm2 list
run_cmd "pm2 describe ap-api" pm2 describe ap-api
run_cmd "pm2 env 0" pm2 env 0

section "Services"
run_cmd "systemctl list-units --type=service --state=running" systemctl list-units --type=service --state=running
run_cmd "ss -tulpn" ss -tulpn

section "Nginx"
run_cmd "nginx -v" nginx -v
run_cmd "ls -la /etc/nginx/sites-enabled" ls -la /etc/nginx/sites-enabled
run_cmd "ls -la /etc/nginx/sites-available" ls -la /etc/nginx/sites-available

if command -v sudo >/dev/null 2>&1; then
  run_cmd "sudo -n nginx -T" sudo -n nginx -T
else
  echo "sudo not found; skipping privileged nginx config dump"
fi

section "App Paths"
run_cmd "ls -la ~" ls -la ~
run_cmd "find ~ -maxdepth 2 -type f \\( -name '.env' -o -name 'ecosystem.config.*' -o -name 'package.json' \\)" find ~ -maxdepth 2 -type f \( -name ".env" -o -name "ecosystem.config.*" -o -name "package.json" \)

section "Logs"
run_cmd "pm2 logs ap-api --lines 80 --nostream" pm2 logs ap-api --lines 80 --nostream
