# Deployment Guide

This guide provides detailed instructions for deploying the Haramaya University Project Store in production environments.

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)

### 2. Manual Server Deployment

### 3. Cloud Platform Deployment

---

## 🐳 Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Application Setup

```bash
# Clone repository
git clone https://github.com/your-username/haramaya-project-store.git
cd haramaya-project-store

# Create production environment files
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

### Step 3: Environment Configuration

#### Backend Environment (Backend/.env)

```env
NODE_ENV=production
DB_HOST=mysql
DB_USER=hups_user
DB_PASS=secure_database_password
DB_NAME=projectrepo
DB_PORT=3306
DB_ROOT_PASSWORD=secure_root_password

PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_super_secure_refresh_secret

EMAIL_USERNAME=noreply@yourdomain.com
EMAIL_PASSWORD=your_app_password
BACKEND_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com

MAX_FILE_SIZE=3221225472
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

REDIS_HOST=redis
REDIS_PORT=6379
```

#### Frontend Environment (Frontend/.env)

```env
VITE_NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Haramaya University Project Store
VITE_APP_VERSION=1.0.0

VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_MAX_FILE_SIZE=52428800
VITE_ALLOWED_FILE_TYPES=.zip,.pdf,.doc,.docx,.ppt,.pptx,.txt,.json
```

### Step 4: SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Option B: Custom Certificate

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

### Step 5: Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream backend
    upstream backend {
        server backend:5000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Main application
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }

    # API server
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        # SSL configuration (same as above)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API routes
        location / {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # File upload
            client_max_body_size 3G;
        }

        # Authentication endpoints (stricter rate limiting)
        location ~ ^/(api/user/login|api/user/register) {
            limit_req zone=login burst=5 nodelay;

            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # File uploads
        location /uploads {
            alias /var/www/uploads;

            # Security
            location ~* \.(php|jsp|asp|sh|py|pl|exe)$ {
                deny all;
            }
        }
    }
}
```

### Step 6: Deploy Application

```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Initialize database
docker-compose exec backend npm run setup-db
```

### Step 7: Verify Deployment

```bash
# Check service health
curl https://yourdomain.com/health
curl https://api.yourdomain.com/health

# Check API endpoints
curl https://api.yourdomain.com/api/ping

# Monitor logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

---

## 🖥️ Manual Server Deployment

### Prerequisites

- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- MySQL 8.0+
- Nginx 1.18+
- PM2 (Process Manager)

### Step 1: System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE projectrepo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hups_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON projectrepo.* TO 'hups_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/haramaya-project-store
sudo chown $USER:$USER /var/www/haramaya-project-store

# Clone and setup
cd /var/www/haramaya-project-store
git clone https://github.com/your-username/haramaya-project-store.git .

# Backend setup
cd Backend
cp .env.example .env
# Edit .env with production values
npm ci --production
npm run setup-db

# Frontend setup
cd ../Frontend
cp .env.example .env
# Edit .env with production values
npm ci
npm run build

# Copy frontend build to nginx
sudo cp -r dist/* /var/www/html/
```

### Step 4: Process Management

```bash
# Start backend with PM2
cd /var/www/haramaya-project-store/Backend
pm2 start index.js --name "hups-backend"
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/haramaya-project-store`:

```nginx
# Same configuration as Docker deployment
# Adjust paths and upstream servers accordingly
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/haramaya-project-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)

1. **Create ECS Cluster**
2. **Setup RDS MySQL Instance**
3. **Configure Application Load Balancer**
4. **Deploy using ECS Task Definitions**

#### Using AWS EC2

1. **Launch EC2 Instance** (t3.medium or larger)
2. **Setup Security Groups** (ports 80, 443, 22)
3. **Follow Manual Deployment Steps**
4. **Configure Route 53** for DNS

### DigitalOcean Deployment

#### Using App Platform

1. **Connect GitHub Repository**
2. **Configure Build Settings**
3. **Setup Database Cluster**
4. **Configure Environment Variables**

#### Using Droplets

1. **Create Droplet** (2GB RAM minimum)
2. **Follow Manual Deployment Steps**
3. **Configure Domain and SSL**

### Heroku Deployment

#### Backend (API)

```bash
# Create Heroku app
heroku create your-app-api

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git subtree push --prefix Backend heroku main
```

#### Frontend

```bash
# Build and deploy to static hosting
npm run build
# Deploy dist/ to Netlify, Vercel, or similar
```

---

## 🔧 Post-Deployment Configuration

### 1. SSL Certificate Renewal

```bash
# Add to crontab for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Backup Setup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-hups.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/hups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u hups_user -p'password' projectrepo > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/haramaya-project-store/Backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable and add to cron
sudo chmod +x /usr/local/bin/backup-hups.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-hups.sh
```

### 3. Monitoring Setup

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/hups
```

```
/var/www/haramaya-project-store/Backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### 4. Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection
mysql -u hups_user -p -h localhost projectrepo

# Check logs
sudo tail -f /var/log/mysql/error.log
```

#### 2. File Upload Issues

```bash
# Check permissions
ls -la /var/www/haramaya-project-store/Backend/uploads

# Fix permissions
sudo chown -R www-data:www-data /var/www/haramaya-project-store/Backend/uploads
sudo chmod -R 755 /var/www/haramaya-project-store/Backend/uploads
```

#### 3. SSL Certificate Issues

```bash
# Test SSL
openssl s_client -connect yourdomain.com:443

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"
```

#### 4. High Memory Usage

```bash
# Check processes
htop
pm2 monit

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

### Log Locations

- **Application Logs**: `/var/www/haramaya-project-store/Backend/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`
- **PM2 Logs**: `~/.pm2/logs/`
- **System Logs**: `/var/log/syslog`

---

## 📊 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_projects_status_dept ON projects(status, department);
CREATE INDEX idx_users_email_verified ON users(email, verified);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### 2. Nginx Caching

```nginx
# Add to nginx configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 3. Application Optimization

```bash
# Enable Node.js production optimizations
export NODE_ENV=production

# Use PM2 cluster mode
pm2 start index.js -i max --name "hups-backend"
```

---

## 🔒 Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] File upload directory secured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Log rotation configured

---

## 📞 Support

For deployment support:

- Check the troubleshooting section
- Review application logs
- Contact the development team
- Create an issue on GitHub

---

**Deployment Guide v1.0 - Haramaya University Project Store**
