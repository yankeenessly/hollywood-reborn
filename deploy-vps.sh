#!/usr/bin/env bash
# ==============================================================================
# Hollywood Reborn - Automated Production VPS Deployment Script
# Supports: Ubuntu 22.04 / 24.04 / Debian 12
# Configures: Node.js 24, PM2, Nginx, Let's Encrypt SSL (HTTPS) for jattjames.bond
# ==============================================================================

set -e

DOMAIN="jattjames.bond"
APP_DIR="/var/www/hollywood-reborn"

echo "=========================================================="
echo "🚀 Starting Hollywood Reborn VPS Deployment for ${DOMAIN}"
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y curl git ufw nginx certbot python3-certbot-nginx

# 2. Install Node.js 24 (LTS/Current with native SQLite support)
echo "📦 Installing Node.js 24..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 3. Create app directory
echo "📁 Setting up application directory: ${APP_DIR}..."
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

# 4. Check if code exists or clone
cd ${APP_DIR}

# If deploying from local files or git
if [ -f "package.json" ]; then
    echo "🔨 Installing dependencies and building production frontend..."
    npm run build
fi

# 5. Start / Restart application via PM2
echo "⚙️ Starting Node.js backend with PM2..."
pm2 delete hollywood-reborn || true
PORT=5000 pm2 start server/server.js --name "hollywood-reborn"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER || true

# 6. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx Reverse Proxy for ${DOMAIN}..."
sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 7. Configure Firewall
echo "🛡️ Configuring Firewall..."
sudo ufw allow 'Nginx Full' || true
sudo ufw allow OpenSSH || true

# 8. Setup Free SSL Certificate with Certbot
echo "🔒 Requesting SSL certificate from Let's Encrypt for ${DOMAIN}..."
sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} --redirect || echo "⚠️ Note: Make sure your domain DNS A-Record points to this VPS IP before Certbot can verify."

echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Website is live at: https://${DOMAIN}"
echo "=========================================================="
