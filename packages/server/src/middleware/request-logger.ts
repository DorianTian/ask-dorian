import type { Context, Next } from "koa";
import { logger } from "../config/logger.js";

export async function requestLogger(ctx: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  logger.info(
    {
      method: ctx.method,
      url: ctx.url,
      status: ctx.status,
      ms,
    },
    `${ctx.method} ${ctx.url} ${ctx.status} ${ms}ms`,
  );
}
