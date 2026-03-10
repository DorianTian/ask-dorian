# Ask Dorian Mobile Web — m.askdorian.com
# Deploy: scp to /etc/nginx/sites-available/m.askdorian.com
# Enable: sudo ln -sf /etc/nginx/sites-available/m.askdorian.com /etc/nginx/sites-enabled/

server {
    listen 80;
    server_name m.askdorian.com;

    root /opt/aix-ops-hub/ask-dorian/packages/mobile/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA fallback — all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets — long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Disable access to dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
