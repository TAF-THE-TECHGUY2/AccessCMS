# Investor Stack Deploy

`investor.ap.boston`
- Serves the React app from `system/investor-frontend`.

`investor-admin.ap.boston`
- Serves the Laravel app from `system/backend-laravel/public`.
- Filament admin lives at `/admin`, configured in `App\Providers\Filament\AdminPanelProvider`.

## Current AWS paths

From the server state you shared on March 13, 2026:

- Node API: `/var/www/api/backend`
- Investor frontend source: `/var/www/investor-backend/system/investor-frontend`
- Investor frontend deployed build: `/var/www/investor-frontend/build`
- Investor Laravel app: `/var/www/investor-backend/system/backend-laravel`

`pm2` is only relevant to `api.ap.boston`. The investor stack is served by `nginx + php8.4-fpm`.

## Required Laravel `.env` values

Use production values before deploying:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://investor-admin.ap.boston

FRONTEND_URLS=https://investor.ap.boston,https://investor-admin.ap.boston
SANCTUM_STATEFUL_DOMAINS=investor.ap.boston,investor-admin.ap.boston
SESSION_DOMAIN=.ap.boston
SESSION_SECURE_COOKIE=true
```

Also set your database, mail, S3, and admin credentials in the same `.env`.

## Server commands

From the monorepo root on the server:

```bash
chmod +x scripts/deploy-investor-laravel.sh scripts/deploy-investor-frontend.sh scripts/deploy-investor-stack.sh
GIT_BRANCH=main bash scripts/deploy-investor-stack.sh
```

If your default branch is not `main`, set `GIT_BRANCH` to the correct branch.

If the investor frontend should call a different API host:

```bash
INVESTOR_API_BASE_URL=https://investor-admin.ap.boston bash scripts/deploy-investor-frontend.sh
```

## Current server commands

If your AWS server uses the paths above, deploy with:

```bash
cd /var/www/investor-backend
git status --short
git branch --show-current
git pull --ff-only origin main

cd /var/www/investor-backend/system/backend-laravel
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
npm ci
npm run build
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/testing storage/framework/views storage/logs bootstrap/cache
sudo chgrp -R www-data storage bootstrap/cache
sudo chmod -R ug+rwx storage bootstrap/cache
[ -L public/storage ] || php artisan storage:link
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan view:cache
php artisan queue:restart || true
sudo systemctl reload php8.4-fpm

cd /var/www/investor-backend/system/investor-frontend
npm ci
REACT_APP_API_BASE_URL=https://investor-admin.ap.boston npm run build
sudo mkdir -p /var/www/investor-frontend/build
sudo rsync -av --delete build/ /var/www/investor-frontend/build/

sudo nginx -t
sudo systemctl reload nginx
```

Replace `main` if either repo uses a different branch.

If `git pull` is blocked by tracked changes under `system/investor-frontend/build`, discard or stash those generated files before pulling.

## Nginx

Example site files:

- `ops/nginx/investor.ap.boston.conf.example`
- `ops/nginx/investor-admin.ap.boston.conf.example`

After copying them into `/etc/nginx/sites-available`, enable them, test nginx, and then issue certificates:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d investor.ap.boston -d investor-admin.ap.boston
```
