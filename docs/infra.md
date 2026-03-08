# Ask Dorian - Infrastructure & Deployment

> 基于 aix-ops-hub 基础设施模板，共用同一台 EC2 服务器。

> **Cloud**: AWS (Singapore ap-southeast-1)
> **DNS/CDN/SSL**: Cloudflare
> **Target**: 单台服务器部署，前后端分离进程

---

## 目录

- [架构总览](#架构总览)
- [域名规划](#域名规划)
- [AWS 资源清单](#aws-资源清单)
- [Step 1: EC2 实例创建](#step-1-ec2-实例创建)
- [Step 2: Elastic IP](#step-2-elastic-ip)
- [Step 3: RDS MySQL 创建](#step-3-rds-mysql-创建)
- [Step 4: 安全组放通 EC2 → RDS](#step-4-安全组放通-ec2--rds)
- [Step 5: Cloudflare DNS 配置](#step-5-cloudflare-dns-配置)
- [Step 6: 服务器环境初始化](#step-6-服务器环境初始化)
- [Step 7: Nginx 配置](#step-7-nginx-配置)
- [Step 8: 应用部署](#step-8-应用部署)
- [Step 9: Claude API 开通](#step-9-claude-api-开通)
- [费用明细](#费用明细)
- [运维手册](#运维手册)

---

## 架构总览

```
                         1 x EC2 t3.medium (2C4G)
                         Ubuntu 24.04, Singapore
┌──────────────────────────────────────────────────────┐
│                      Nginx (:80/:443)                │
│            ┌──────────────┬───────────────┐          │
│            │              │               │          │
│     askdorian.com    aix-hub.com         │          │
│      (Frontend)      (Backend API)       │          │
│            │              │               │          │
│     ┌──────▼──────┐ ┌────▼──────┐  ┌─────▼──────┐  │
│     │  Next.js    │ │ Koa.js    │  │  Workers   │  │
│     │  :3000      │ │ API :4000 │  │  (bg jobs) │  │
│     │  SSR + 页面  │ │ REST API  │  │  定时任务   │  │
│     │             │ │ 工作流引擎  │  │  SLA 检查   │  │
│     └─────────────┘ └─────┬─────┘  └─────┬──────┘  │
│                           │              │          │
└───────────────────────────┼──────────────┼──────────┘
                            │              │
                    ┌───────▼──────────────▼──────┐
                    │    RDS MySQL 8.0            │
                    │    db.t3.micro (1C1G)       │
                    │    Database: aix_ops_hub     │
                    └─────────────────────────────┘
```

---

## 域名规划

| Domain | Purpose | Points to |
|--------|---------|-----------|
| **askdorian.com** | 前端 Next.js (SSR) | EC2 Elastic IP (Cloudflare proxied) |
| **aix-hub.com** | 后端 REST API + 工作流引擎 | EC2 Elastic IP (Cloudflare proxied) |

Nginx 根据 `server_name` 将请求分流到不同端口。

---

## AWS 资源清单

| Resource | Name | Spec |
|----------|------|------|
| EC2 Instance | aix-ops-hub | t3.medium, 2C4G, Ubuntu 24.04 |
| EBS Volume | (attached to EC2) | 30 GiB gp3 |
| Elastic IP | (bound to EC2) | 固定公网 IP |
| Key Pair | aix-ops-hub-key | RSA, .pem |
| Security Group | aix-ops-hub-sg | 22 (My IP), 80/443 (0.0.0.0/0) |
| RDS Instance | aix-ops-hub-db | db.t3.micro, MySQL 8.0 |
| RDS Storage | (attached to RDS) | 20 GiB gp3 |
| RDS Security Group | aix-ops-hub-db-sg | 3306 (from aix-ops-hub-sg only) |
| Initial Database | aix_ops_hub | UTF8MB4 |

---

## Step 1: EC2 实例创建

Region: **ap-southeast-1 (Singapore)**

```
EC2 → Launch Instance

Name: aix-ops-hub

AMI: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type
     Architecture: 64-bit (x86)

Instance type: t3.medium (2 vCPU, 4 GiB RAM)

Key pair: Create new
  Name: aix-ops-hub-key
  Type: RSA
  Format: .pem
  → Download and save securely (one-time download)

Network settings → Edit:
  Auto-assign public IP: Enable
  Security group: Create security group
    Name: aix-ops-hub-sg
    Description: AIX Ops Hub App Server
    Rules:
      SSH (22)    → Source: My IP
      HTTP (80)   → Source: 0.0.0.0/0
      HTTPS (443) → Source: 0.0.0.0/0

Storage:
  30 GiB, gp3

→ Launch Instance
```

---

## Step 2: Elastic IP

```
EC2 → Network & Security → Elastic IPs
  → Allocate Elastic IP address → Allocate
  → Select IP → Actions → Associate Elastic IP address
  → Instance: aix-ops-hub
  → Associate

Record: __.__.__.__ (fill in after allocation)
```

---

## Step 3: RDS MySQL 创建

```
RDS → Create database

Creation method: Full configuration (Standard create)

Engine: MySQL (NOT Aurora)
Version: MySQL 8.0.x (latest 8.0)

Templates: Free tier (or Dev/Test)

Settings:
  DB instance identifier: aix-ops-hub-db
  Master username: admin
  Master password: __________ (record securely)

Instance: db.t3.micro (1 vCPU, 1 GiB)

Storage:
  Type: gp3
  Size: 20 GiB
  ❌ Disable storage autoscaling

Connectivity:
  VPC: Default VPC
  Public access: No
  VPC security group: Create new
    Name: aix-ops-hub-db-sg

Additional configuration:
  Initial database name: aix_ops_hub
  ❌ Disable automated backups (MVP)
  ❌ Disable encryption (MVP)
  ❌ Disable Enhanced monitoring

→ Create database (wait ~5-10 min)

Record endpoint: aix-ops-hub-db.xxxxx.ap-southeast-1.rds.amazonaws.com
```

---

## Step 4: 安全组放通 EC2 → RDS

```
RDS → aix-ops-hub-db → Connectivity & security
  → Click VPC security group: aix-ops-hub-db-sg
  → Inbound rules → Edit inbound rules → Add rule:
    Type: MySQL/Aurora (3306)
    Source: Custom → select "aix-ops-hub-sg" (EC2 security group)
  → Save rules
```

---

## Step 5: Cloudflare DNS 配置

两个域名都托管到 Cloudflare，分别添加 A 记录：

### askdorian.com (Frontend)
```
Type: A
Name: @
Content: [Elastic IP]
Proxy: Proxied (orange cloud)
TTL: Auto

SSL/TLS → Full (strict)
```

### aix-hub.com (Backend API)
```
Type: A
Name: @
Content: [Elastic IP] (same IP)
Proxy: Proxied (orange cloud)
TTL: Auto

SSL/TLS → Full (strict)
```

---

## Step 6: 服务器环境初始化

```bash
# SSH login
chmod 400 ~/Downloads/aix-ops-hub-key.pem
ssh -i ~/Downloads/aix-ops-hub-key.pem ubuntu@[ELASTIC_IP]

# System update
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm

# PM2 (process manager)
npm install -g pm2

# Nginx
sudo apt install -y nginx

# MySQL client (for connecting to RDS)
sudo apt install -y mysql-client

# Verify DB connection
mysql -h [RDS_ENDPOINT] -u admin -p aix_ops_hub
# Enter password → should see mysql> prompt
```

---

## Step 7: Nginx 配置

```bash
sudo tee /etc/nginx/sites-available/askdorian.com << 'EOF'
server {
    listen 80;
    server_name askdorian.com www.askdorian.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo tee /etc/nginx/sites-available/aix-hub.com << 'EOF'
server {
    listen 80;
    server_name aix-hub.com www.aix-hub.com;

    client_max_body_size 20M;  # file uploads (evidence, attachments)

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;  # AI API calls may take longer
    }

    # SSE support for workflow runtime real-time updates
    location /api/v1/workflows/instances/stream {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 86400s;
    }
}
EOF

# Enable sites
sudo ln -s /etc/nginx/sites-available/askdorian.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/aix-hub.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 8: 应用部署

```bash
# Clone repos (adjust paths as needed)
cd /opt
sudo mkdir -p aix-ops-hub && sudo chown ubuntu:ubuntu aix-ops-hub
cd aix-ops-hub

git clone [FRONTEND_REPO_URL] frontend
git clone [BACKEND_REPO_URL] api

# --- Frontend ---
cd /opt/aix-ops-hub/frontend
cp .env.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=https://aix-hub.com
pnpm install
pnpm build

# --- Backend API ---
cd /opt/aix-ops-hub/api
cp .env.example .env
# Edit .env:
#   DATABASE_URL=mysql://admin:PASSWORD@RDS_ENDPOINT:3306/aix_ops_hub
#   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
#   FRONTEND_URL=https://askdorian.com
#   PORT=4000
pnpm install
pnpm build

# --- PM2 Start ---
cd /opt/aix-ops-hub
pm2 start pnpm --name "frontend" --cwd ./frontend -- start
pm2 start dist/app.js --name "api" --cwd ./api
pm2 startup   # generate system startup script
pm2 save      # save process list

# --- Initialize Database ---
cd /opt/aix-ops-hub/api
pnpm db:migrate  # run MySQL schema (db-schema-mysql.md)
pnpm db:seed     # seed initial data (roles, admin user, etc.)
```

---

## Step 9: Claude API 开通

```
1. Visit https://console.anthropic.com
2. Sign up / Login (separate from claude.ai Max subscription)
3. Left menu → "API Keys" → "Create Key"
   Name: aix-ops-hub-prod
   Copy: sk-ant-api03-xxxxx
4. Left menu → "Plans & Billing" → Add credit card → Top up $20
5. Set environment variable on server:
   In /opt/aix-ops-hub/api/.env:
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Claude API Pricing (Sonnet 4)
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens
- Per AI classify call (~700 tokens): ~$0.002
- 1000 calls/day ≈ $2/day ≈ $60/month

### Note
Claude Max subscription ($100-200/mo) is for claude.ai chat only.
Claude API is billed separately by token usage.
Both can use the same email but are independent billing systems.

---

## 费用明细

| Resource | Spec | Monthly |
|----------|------|---------|
| EC2 t3.medium | 2C4G, Singapore | ~$34 |
| EBS 30 GiB gp3 | attached to EC2 | ~$2.4 |
| Elastic IP | bound to running EC2 | $0 |
| RDS db.t3.micro | MySQL 8.0, 1C1G | ~$13 |
| RDS Storage 20 GiB | gp3 | ~$2 |
| Cloudflare | 2 domains, CDN, SSL | $0 |
| Domain Registration | 2 x .com | ~$1.7 ($20/yr) |
| Claude API | Sonnet, pay-per-use | ~$50-200 |
| S3 (future, attachments) | ~5 GiB | ~$1-5 |
| **Total** | | **~$100-260/mo** |

---

## 运维手册

### SSH Login
```bash
ssh -i ~/Downloads/aix-ops-hub-key.pem ubuntu@[ELASTIC_IP]
```

### PM2 Commands
```bash
pm2 list                   # view all processes
pm2 logs                   # view logs (all)
pm2 logs frontend          # view frontend logs
pm2 logs api               # view API logs
pm2 restart frontend       # restart frontend
pm2 restart api            # restart API
pm2 restart all            # restart all
pm2 monit                  # real-time monitoring
```

### Deploy Updates
```bash
# Frontend
cd /opt/aix-ops-hub/frontend
git pull
pnpm install
pnpm build
pm2 restart frontend

# Backend
cd /opt/aix-ops-hub/api
git pull
pnpm install
pnpm build
pm2 restart api
```

### MySQL Access
```bash
mysql -h [RDS_ENDPOINT] -u admin -p aix_ops_hub
```

### Nginx
```bash
sudo nginx -t                      # test config
sudo systemctl reload nginx        # reload
sudo systemctl restart nginx       # restart
sudo tail -f /var/log/nginx/error.log   # error logs
sudo tail -f /var/log/nginx/access.log  # access logs
```

### Disk Usage Check
```bash
df -h                    # disk space
du -sh /opt/aix-ops-hub  # project size
sudo journalctl --vacuum-size=100M  # clean system logs
```

### Emergency: Server OOM
```bash
# Check memory
free -h
pm2 monit

# If OOM, restart everything
pm2 restart all
sudo systemctl restart nginx
```
