# Ask Dorian API — api.askdorian.com
# Deploy: scp to /etc/nginx/sites-available/api.askdorian.com
# Enable: sudo ln -sf /etc/nginx/sites-available/api.askdorian.com /etc/nginx/sites-enabled/

upstream ask_dorian_api {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.askdorian.com;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Client body size (file uploads up to 12MB)
    client_max_body_size 12M;

    # SSE — long-lived connections, no buffering
    location /api/v1/sse/ {
        proxy_pass http://ask_dorian_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        chunked_transfer_encoding on;
    }

    # API proxy
    location /api/ {
        proxy_pass http://ask_dorian_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }

    # Health check (no logging)
    location = /api/v1/health {
        proxy_pass http://ask_dorian_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        access_log off;
    }
}
