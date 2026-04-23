#!/bin/bash
# BizAutomatrix deployment script
# Run this on the VPS after SSH login

set -e

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing Nginx ==="
sudo apt-get install -y nginx

echo "=== Installing Certbot ==="
sudo apt-get install -y certbot python3-certbot-nginx

echo "=== Cloning repository ==="
cd /var/www
sudo git clone https://github.com/bizautomatrix/app.git bizautomatrix || true
cd bizautomatrix

echo "=== Installing dependencies ==="
sudo npm install

echo "=== Building app ==="
sudo npm run build

echo "=== Starting app with PM2 ==="
sudo pm2 start npm --name "bizautomatrix" -- start
sudo pm2 startup
sudo pm2 save

echo "=== Done! App running on port 3000 ==="
