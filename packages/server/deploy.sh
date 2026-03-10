#!/bin/bash
# Ask Dorian API — 部署脚本
# Usage: ssh ubuntu@<ec2-ip> 'bash -s' < deploy.sh
#
# 前置条件:
#   1. EC2 已安装 Node.js 22+, pnpm, PM2
#   2. RDS PostgreSQL 可达
#   3. .env 已配置 (见下方步骤)

set -euo pipefail

APP_DIR="/opt/aix-ops-hub/ask-dorian"
LOG_DIR="/opt/aix-ops-hub/logs"

echo "=== Ask Dorian API Deploy ==="

# 1. Ensure directories
mkdir -p "$LOG_DIR"

# 2. Ensure RDS SSL certificate
if [ ! -f /certs/global-bundle.pem ]; then
  echo "📦 Downloading RDS SSL certificate..."
  sudo mkdir -p /certs
  sudo curl -so /certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
  sudo chmod 644 /certs/global-bundle.pem
fi

# 3. Pull latest code
cd "$APP_DIR"
git pull origin main

# 4. Install dependencies
pnpm install --frozen-lockfile

# 5. Build server
cd packages/server
pnpm build

# 6. Run database migration (skip if tables exist)
if [ "${RUN_MIGRATION:-false}" = "true" ]; then
    echo "📦 Running database migration..."
    pnpm db:migrate
fi

# 7. Restart PM2
pm2 startOrRestart ecosystem.config.cjs --env production
pm2 save

# 8. Health check
echo "⏳ Waiting for server to start..."
sleep 3
if curl -sf http://localhost:4000/api/v1/health > /dev/null 2>&1; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check FAILED! Check logs: pm2 logs ask-dorian-api --lines 50"
  exit 1
fi

echo ""
echo "✅ Deploy complete!"
echo ""
echo "Verify:"
echo "  pm2 status"
echo "  curl http://localhost:4000/api/v1/health"
echo "  pm2 logs ask-dorian-api --lines 20"
