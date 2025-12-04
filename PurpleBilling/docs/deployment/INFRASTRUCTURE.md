# PurpleBilling Infrastructure Setup Guide

## Complete Infrastructure Deployment

This guide covers the complete infrastructure setup for PurpleBilling on a private headless Linux server.

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Initial Server Setup](#initial-server-setup)
3. [Database Setup](#database-setup)
4. [Redis Setup](#redis-setup)
5. [RabbitMQ Setup](#rabbitmq-setup)
6. [Application Deployment](#application-deployment)
7. [Security Hardening](#security-hardening)
8. [Monitoring Setup](#monitoring-setup)
9. [Backup Configuration](#backup-configuration)
10. [Load Balancer Setup](#load-balancer-setup)

---

## Server Requirements

### Minimum Specifications

**Production Environment:**
- **CPU**: 8 cores (16 recommended)
- **RAM**: 32GB (64GB recommended)
- **Storage**: 500GB SSD (RAID 10 recommended)
- **Network**: 1Gbps connection
- **OS**: Ubuntu 22.04 LTS or Rocky Linux 9

**Development Environment:**
- **CPU**: 4 cores
- **RAM**: 16GB
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS

### Required Software

```bash
# Operating System
- Ubuntu 22.04 LTS (recommended)
- Rocky Linux 9 (alternative)
- CentOS Stream 9 (alternative)

# Runtime
- .NET 9 SDK
- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3.12+
- Docker 24+
- Docker Compose 2.20+

# Web Server
- Nginx 1.24+ (or Apache 2.4+)

# SSL/TLS
- Certbot for Let's Encrypt
```

---

## Initial Server Setup

### 1. Update System

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Rocky Linux/CentOS
sudo dnf update -y

# Install essential tools
sudo apt install -y curl wget git unzip build-essential
```

### 2. Create Application User

```bash
# Create dedicated user for PurpleBilling
sudo useradd -m -s /bin/bash purplebilling
sudo usermod -aG sudo purplebilling

# Set up SSH key authentication
sudo mkdir -p /home/purplebilling/.ssh
sudo chmod 700 /home/purplebilling/.ssh
# Copy your public key to authorized_keys
```

### 3. Configure Firewall

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if using non-standard)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL (only from specific IPs in production)
sudo ufw allow from 10.0.0.0/8 to any port 5432

# Enable firewall
sudo ufw enable
```

### 4. Install .NET 9 SDK

```bash
# Add Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Update package index
sudo apt update

# Install .NET 9 SDK
sudo apt install -y dotnet-sdk-9.0

# Verify installation
dotnet --version
```

### 5. Install Node.js 20 LTS

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## Database Setup

### PostgreSQL 15 Installation

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update and install
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### PostgreSQL Configuration

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf
```

**postgresql.conf settings:**
```ini
# Connection Settings
listen_addresses = '127.0.0.1'  # localhost only (use specific IP for remote)
port = 5432
max_connections = 200

# Memory Settings
shared_buffers = 8GB  # 25% of RAM
effective_cache_size = 24GB  # 75% of RAM
maintenance_work_mem = 2GB
work_mem = 64MB

# Write-Ahead Log (WAL)
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_completion_target = 0.9

# Query Performance
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_min_duration_statement = 1000  # Log slow queries (>1s)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Security
ssl = on
ssl_cert_file = '/etc/postgresql/15/main/server.crt'
ssl_key_file = '/etc/postgresql/15/main/server.key'
```

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE purplebilling;
CREATE USER purplebilling_app WITH ENCRYPTED PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE purplebilling TO purplebilling_app;
\c purplebilling
GRANT ALL ON SCHEMA public TO purplebilling_app;

# Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

\q
```

### Set up PostgreSQL Replication (Optional)

```bash
# On Primary Server
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host replication purplebilling_repl replica_ip/32 md5

# Create replication user
sudo -u postgres psql
CREATE USER purplebilling_repl WITH REPLICATION ENCRYPTED PASSWORD 'repl_password';
\q

# On Replica Server
# Use pg_basebackup to create replica
sudo -u postgres pg_basebackup -h primary_ip -D /var/lib/postgresql/15/main -U purplebilling_repl -P -v -R
```

---

## Redis Setup

### Redis 7 Installation

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

**redis.conf settings:**
```ini
# Network
bind 127.0.0.1
port 6379
protected-mode yes

# Security
requirepass your_redis_password_here
maxclients 10000

# Memory
maxmemory 8gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# AOF
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# Performance
tcp-backlog 511
timeout 300
tcp-keepalive 300
```

```bash
# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli -a your_redis_password_here ping
# Should return: PONG
```

### Redis Cluster Setup (Production)

```bash
# Create cluster configuration for 6 nodes (3 masters, 3 replicas)
# redis-7000.conf through redis-7005.conf

port 7000
cluster-enabled yes
cluster-config-file nodes-7000.conf
cluster-node-timeout 5000
appendonly yes

# Start cluster
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

---

## RabbitMQ Setup

### RabbitMQ Installation

```bash
# Add RabbitMQ repository
curl -1sLf 'https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.E495BB49CC4BBE5B.key' | sudo apt-key add -
curl -1sLf 'https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/setup.deb.sh' | sudo bash

# Install RabbitMQ
sudo apt install -y rabbitmq-server

# Start RabbitMQ
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# Enable management plugin
sudo rabbitmq-plugins enable rabbitmq_management

# Create admin user
sudo rabbitmqctl add_user admin your_admin_password
sudo rabbitmqctl set_user_tags admin administrator
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# Delete default guest user
sudo rabbitmqctl delete_user guest
```

### RabbitMQ Configuration

```bash
# Edit configuration
sudo nano /etc/rabbitmq/rabbitmq.conf
```

```ini
# Network
listeners.tcp.default = 5672
management.tcp.port = 15672

# Limits
vm_memory_high_watermark.relative = 0.6
disk_free_limit.absolute = 50GB

# Clustering (if using cluster)
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
cluster_formation.classic_config.nodes.1 = rabbit@node1
cluster_formation.classic_config.nodes.2 = rabbit@node2
cluster_formation.classic_config.nodes.3 = rabbit@node3
```

### Create Queues and Exchanges

```bash
# Login to RabbitMQ management
# http://localhost:15672
# User: admin, Password: your_admin_password

# Or use rabbitmqadmin CLI
rabbitmqadmin declare queue name=payments.processing durable=true
rabbitmqadmin declare queue name=notifications.email durable=true
rabbitmqadmin declare queue name=notifications.sms durable=true
rabbitmqadmin declare queue name=invoices.generation durable=true
rabbitmqadmin declare queue name=reports.generation durable=true
```

---

## Application Deployment

### Clone Repository

```bash
# Switch to application user
sudo su - purplebilling

# Clone repository
cd /opt
git clone https://github.com/PurpleTrex/Apps.git
cd Apps/PurpleBilling
```

### Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**.env file:**
```bash
# Application
APP_ENV=production
APP_URL=https://billing.purpleapps.com
API_URL=https://api.billing.purpleapps.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=purplebilling
DB_USER=purplebilling_app
DB_PASSWORD=your_secure_password_here
DB_SSL_MODE=require

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_DB=0

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=purplebilling_app
RABBITMQ_PASSWORD=your_rabbitmq_password
RABBITMQ_VHOST=/

# Authentication
JWT_SECRET=your_jwt_secret_256_bits_minimum
JWT_ISSUER=https://billing.purpleapps.com
JWT_AUDIENCE=purplebilling-api
JWT_EXPIRATION_MINUTES=60

# Auth0 (or other OAuth provider)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=live

# Square
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=production

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@purplebilling.com
EMAIL_FROM_NAME=PurpleBilling

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Encryption
ENCRYPTION_KEY=your_256_bit_encryption_key_base64
ENCRYPTION_ALGORITHM=AES-256-GCM

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Logging
LOG_LEVEL=information
LOG_PATH=/var/log/purplebilling

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_REQUESTS_PER_HOUR=1000

# File Storage
STORAGE_TYPE=local  # or 's3'
STORAGE_PATH=/var/purplebilling/storage
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_S3_BUCKET=purplebilling-files
# AWS_REGION=us-east-1
```

### Build Backend (.NET 9)

```bash
cd /opt/Apps/PurpleBilling/src/PurpleBilling.Api

# Restore packages
dotnet restore

# Build in Release mode
dotnet build --configuration Release

# Run database migrations
dotnet ef database update --configuration Release

# Publish application
dotnet publish --configuration Release --output /opt/purplebilling/api
```

### Build Frontend (React)

```bash
cd /opt/Apps/PurpleBilling/src/PurpleBilling.Frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Output will be in /dist folder
# Copy to web server directory
sudo cp -r dist/* /var/www/purplebilling/frontend/
```

### Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/purplebilling-api.service
```

```ini
[Unit]
Description=PurpleBilling API Service
After=network.target postgresql.service redis-server.service rabbitmq-server.service

[Service]
Type=notify
User=purplebilling
Group=purplebilling
WorkingDirectory=/opt/purplebilling/api
ExecStart=/usr/bin/dotnet /opt/purplebilling/api/PurpleBilling.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=purplebilling-api
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start purplebilling-api
sudo systemctl enable purplebilling-api

# Check status
sudo systemctl status purplebilling-api

# View logs
sudo journalctl -u purplebilling-api -f
```

---

## Security Hardening

### SSL/TLS Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d billing.purpleapps.com -d api.billing.purpleapps.com

# Certificate will be in:
# /etc/letsencrypt/live/billing.purpleapps.com/fullchain.pem
# /etc/letsencrypt/live/billing.purpleapps.com/privkey.pem

# Set up auto-renewal
sudo systemctl enable certbot.timer
```

### Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[purplebilling-api]
enabled = true
port = http,https
filter = purplebilling-api
logpath = /var/log/purplebilling/api.log
maxretry = 10
```

### Security Auditing

```bash
# Install security audit tools
sudo apt install -y lynis rkhunter aide

# Run Lynis audit
sudo lynis audit system

# Configure AIDE (file integrity monitoring)
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Schedule daily AIDE check
echo "0 5 * * * /usr/bin/aide --check" | sudo crontab -
```

---

## Monitoring Setup

### Install Prometheus

```bash
# Download Prometheus
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvf prometheus-2.45.0.linux-amd64.tar.gz
sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus

# Create Prometheus user
sudo useradd --no-create-home --shell /bin/false prometheus

# Create directories
sudo mkdir -p /etc/prometheus /var/lib/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus

# Configure Prometheus
sudo nano /etc/prometheus/prometheus.yml
```

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'purplebilling-api'
    static_configs:
      - targets: ['localhost:5000']
  
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'postgresql'
    static_configs:
      - targets: ['localhost:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

### Install Grafana

```bash
# Add Grafana repository
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Install Grafana
sudo apt-get update
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access at http://localhost:3000
# Default credentials: admin/admin
```

### ELK Stack Setup

```bash
# Install Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update
sudo apt install -y elasticsearch

# Configure Elasticsearch
sudo nano /etc/elasticsearch/elasticsearch.yml
```

```yaml
cluster.name: purplebilling
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: localhost
http.port: 9200
xpack.security.enabled: true
```

```bash
# Install Logstash
sudo apt install -y logstash

# Install Kibana
sudo apt install -y kibana

# Start services
sudo systemctl start elasticsearch
sudo systemctl start logstash
sudo systemctl start kibana
sudo systemctl enable elasticsearch
sudo systemctl enable logstash
sudo systemctl enable kibana
```

---

## Backup Configuration

### Automated Database Backups

```bash
# Create backup script
sudo nano /opt/purplebilling/scripts/backup-database.sh
```

```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/var/backups/purplebilling"
DB_NAME="purplebilling"
DB_USER="purplebilling_app"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/purplebilling_$TIMESTAMP.dump"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U $DB_USER -F c -b -v -f "$BACKUP_FILE" $DB_NAME

# Compress backup
gzip "$BACKUP_FILE"

# Encrypt backup (optional)
gpg --encrypt --recipient backup@purplebilling.com "$BACKUP_FILE.gz"

# Upload to S3 (optional - uncomment when ready)
# aws s3 cp "$BACKUP_FILE.gz.gpg" s3://purplebilling-backups/database/

# Remove old backups
find $BACKUP_DIR -name "purplebilling_*.dump.gz*" -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "$(date): Backup completed successfully" >> /var/log/purplebilling/backup.log
```

```bash
# Make script executable
sudo chmod +x /opt/purplebilling/scripts/backup-database.sh

# Schedule daily backups
sudo crontab -e
# Add: 0 2 * * * /opt/purplebilling/scripts/backup-database.sh
```

---

## Load Balancer Setup

### Nginx Configuration

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/purplebilling
```

```nginx
# Upstream API servers
upstream api_backend {
    least_conn;
    server 127.0.0.1:5000 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:5001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:5002 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# API Server
server {
    listen 443 ssl http2;
    server_name api.billing.purpleapps.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/billing.purpleapps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/billing.purpleapps.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req zone=api_limit burst=20 nodelay;
    limit_conn addr 10;

    # Logging
    access_log /var/log/nginx/api.purplebilling.access.log;
    error_log /var/log/nginx/api.purplebilling.error.log;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Frontend Server
server {
    listen 443 ssl http2;
    server_name billing.purpleapps.com;

    ssl_certificate /etc/letsencrypt/live/billing.purpleapps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/billing.purpleapps.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    root /var/www/purplebilling/frontend;
    index index.html;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Logging
    access_log /var/log/nginx/purplebilling.access.log;
    error_log /var/log/nginx/purplebilling.error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name billing.purpleapps.com api.billing.purpleapps.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/purplebilling /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Docker Deployment (Alternative)

### Docker Compose Setup

```yaml
# docker-compose.yml already provided in infrastructure/docker/
cd /opt/Apps/PurpleBilling

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Check API health
curl -k https://api.billing.purpleapps.com/health

# Check database connection
psql -h localhost -U purplebilling_app -d purplebilling -c "SELECT version();"

# Check Redis
redis-cli -a your_redis_password PING

# Check RabbitMQ
curl -u admin:password http://localhost:15672/api/health/checks/alarms

# Check all services
sudo systemctl status purplebilling-api
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status rabbitmq-server
sudo systemctl status nginx
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test API performance
ab -n 1000 -c 10 -H "Authorization: Bearer your_token" https://api.billing.purpleapps.com/api/v1/invoices

# Install and run k6 for load testing
# See tests/load/ directory for test scripts
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check logs
   sudo tail -f /var/log/postgresql/postgresql-15-main.log
   
   # Verify pg_hba.conf allows connection
   sudo nano /etc/postgresql/15/main/pg_hba.conf
   ```

2. **API Not Responding**
   ```bash
   # Check service status
   sudo systemctl status purplebilling-api
   
   # View application logs
   sudo journalctl -u purplebilling-api -n 100
   
   # Check port binding
   sudo netstat -tlnp | grep 5000
   ```

3. **High Memory Usage**
   ```bash
   # Check memory usage
   free -h
   
   # Top processes
   top -o %MEM
   
   # Adjust shared_buffers in PostgreSQL
   # Adjust maxmemory in Redis
   ```

---

## Next Steps

1. Configure monitoring dashboards in Grafana
2. Set up alerting rules in Prometheus
3. Configure backup verification and restore testing
4. Perform security audit and penetration testing
5. Set up disaster recovery procedures
6. Configure auto-scaling (if using Kubernetes)
7. Set up log aggregation in Kibana
8. Configure business intelligence reporting

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Support**: infrastructure@purplebilling.com
