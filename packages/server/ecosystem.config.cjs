// PM2 ecosystem config
module.exports = {
  apps: [
    {
      name: "ask-dorian-api",
      script: "dist/index.js",
      cwd: "/opt/aix-ops-hub/ask-dorian/packages/server",
      instances: 1,
      exec_mode: "fork",
      node_args: "--enable-source-maps",
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
        HOST: "0.0.0.0",
      },
      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 8000,
      shutdown_with_message: true,
      // Auto-restart
      max_restarts: 10,
      min_uptime: 5000,
      max_memory_restart: "512M",
      // Logging
      error_file: "/opt/aix-ops-hub/logs/ask-dorian-api-error.log",
      out_file: "/opt/aix-ops-hub/logs/ask-dorian-api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
