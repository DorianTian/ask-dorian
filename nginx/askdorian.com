# Ask Dorian Web — askdorian.com
# Deploy: scp to /etc/nginx/sites-available/askdorian.com
# Enable: sudo ln -sf /etc/nginx/sites-available/askdorian.com /etc/nginx/sites-enabled/

upstream ask_dorian_web {
    server 127.0.0.1:3000;
    keepalive 16;
}

server {
    listen 80;
    server_name askdorian.com www.askdorian.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js proxy
    location / {
        proxy_pass http://ask_dorian_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js static assets — serve from disk
    location /_next/static/ {
        alias /opt/aix-ops-hub/ask-dorian/packages/web/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Public assets
    location /icon.svg {
        alias /opt/aix-ops-hub/ask-dorian/packages/web/src/app/icon.svg;
        access_log off;
    }
}
