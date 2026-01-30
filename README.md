
# Gofor360 Admin - Fresh VPS Deployment Guide (Ubuntu 22.04/24.04)

Since your VPS is fresh, follow these exact steps to prepare the environment from scratch.

## 1. System Update & Dependencies
First, update the package list and install the tools needed to build and run the app.
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx postgresql postgresql-contrib
```

## 2. Install Node.js (Latest LTS)
We recommend using Node Version Manager (NVM) to manage Node.js.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v # Should show v20.x or v22.x
```

## 3. Database Setup
Configure your fresh PostgreSQL instance.
```bash
# Enter the postgres shell
sudo -u postgres psql

# Run these commands inside the prompt (replace 'your_password' with a strong one):
CREATE DATABASE gofor360_db;
CREATE USER gofor360_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gofor360_db TO gofor360_admin;
ALTER DATABASE gofor360_db OWNER TO gofor360_admin;
\q
```

## 4. Application Directory
Create the folder where your app will live.
```bash
sudo mkdir -p /var/www/gofor360
sudo chown -R $USER:$USER /var/www/gofor360
cd /var/www/gofor360
```
*Now upload your files to this directory using FileZilla (SFTP) or `git clone`.*

## 5. Install Project Dependencies
```bash
npm install
```

## 6. Environment Configuration
Create your `.env` file based on the template.
```bash
cp .env.example .env
nano .env
```
**Required fields in .env:**
- `API_KEY`: Your Google Gemini API Key.
- `DB_PASS`: The password you set in Step 3.
- `DB_USER`: gofor360_admin
- `DB_NAME`: gofor360_db

## 7. Launch with PM2
PM2 keeps your backend running even if the server restarts.
```bash
sudo npm install -g pm2
pm2 start server.js --name "gofor360-backend"
pm2 save
pm2 startup
```
*The database tables will be created automatically on this first run.*

## 8. Nginx Reverse Proxy (Access via IP/Domain)
To see your app on the web, configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/gofor360
```
Paste this configuration:
```nginx
server {
    listen 80;
    server_name your_vps_ip_or_domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Activate the config and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/gofor360 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Firewall Setup
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw enable
```

You can now access your dashboard at `http://your_vps_ip`.
