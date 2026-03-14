// dotenv loaded via env.ts (import "dotenv/config")
// Use DOTENV_CONFIG_PATH=.env.production to switch env file

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import type { Server } from 'node:http';
import { mkdir } from 'node:fs/promises';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { router } from './routes/index.js';
import { checkDbConnection, closeDb } from './db/index.js';
import { schedulerService } from './services/scheduler-service.js';
import { sseService } from './services/sse-service.js';

const app = new Koa();

// --- Middleware chain ---
app.use(
  cors({
    origin: (ctx) => {
      const requestOrigin = ctx.get('Origin');
      // Dev: allow any localhost port
      if (
        env.NODE_ENV === 'development' &&
        /^https?:\/\/localhost(:\d+)?$/.test(requestOrigin)
      ) {
        return requestOrigin;
      }
      const origins = env.CORS_ORIGINS.split(',');
      return origins.includes(requestOrigin) ? requestOrigin : '';
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Timezone'],
  }),
);
app.use(bodyParser({ jsonLimit: '1mb' }));
app.use(requestLogger);
app.use(errorHandler);
app.use(rateLimiter);
app.use(router.routes());
app.use(router.allowedMethods());

// --- Startup ---
let server: Server;

async function start() {
  // Ensure uploads directory exists
  await mkdir('uploads', { recursive: true });

  // Verify DB before accepting traffic
  const dbOk = await checkDbConnection();
  if (!dbOk) {
    logger.fatal('Cannot connect to database, aborting startup');
    process.exit(1);
  }
  logger.info('Database connection verified');

  server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`API server running on http://${env.HOST}:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  // Keep-alive timeout > ALB idle timeout (default 60s)
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  // Start background jobs
  schedulerService.start();
}

// --- Graceful shutdown ---
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received, draining...');

  // 1. Stop background jobs
  schedulerService.stop();

  // 2. Close all SSE connections
  sseService.closeAll();

  // 3. Stop accepting new connections and wait for in-flight requests
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('HTTP server closed');
        resolve();
      });
      // Force close after 8 seconds if connections linger
      setTimeout(resolve, 8_000);
    });
  }

  // 4. Close DB pool
  await closeDb();

  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

start();

export { app };
