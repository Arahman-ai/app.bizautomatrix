#!/bin/bash
# BizAutomatrix deployment script
# Run this on the VPS/Hostinger terminal after SSH login.

set -euo pipefail

APP_NAME="bizautomatrix"
APP_DIR="/var/www/bizautomatrix"
REPO_URL="https://github.com/Arahman-ai/app.bizautomatrix.git"
BRANCH="main"

echo "=== Installing Node.js 20 if needed ==="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "=== Installing PM2 if needed ==="
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

echo "=== Installing Nginx and Certbot if needed ==="
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== Preparing app directory ==="
sudo mkdir -p /var/www
if [ ! -d "$APP_DIR/.git" ]; then
  sudo git clone "$REPO_URL" "$APP_DIR"
fi
sudo chown -R "$USER":"$USER" "$APP_DIR"
cd "$APP_DIR"

echo "=== Pulling latest code ==="
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "=== Installing dependencies ==="
npm install

echo "=== Applying database migrations ==="
npx prisma migrate deploy
npx prisma generate

echo "=== Building app ==="
npm run build

echo "=== Starting or restarting app with PM2 ==="
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

echo "=== Done! App running on port 3000 ==="
