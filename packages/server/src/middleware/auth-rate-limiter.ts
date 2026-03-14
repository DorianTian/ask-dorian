import type { Context, Next } from "koa";
import { AppError } from "./error-handler.js";

const AUTH_WINDOW_MS = 60_000; // 1 minute
const AUTH_MAX_REQUESTS = 10; // 10 attempts per minute per IP

const store = new Map<string, { count: number; resetAt: number }>();
const MAX_STORE_SIZE = 50_000;

// Cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60_000).unref();

export async function authRateLimiter(ctx: Context, next: Next) {
  const key = ctx.ip;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    // Reject new keys if store is full (DDoS protection)
    if (!entry && store.size >= MAX_STORE_SIZE) {
      throw new AppError(429, "AUTH_RATE_LIMITED", "Too many authentication attempts, please try again later");
    }
    entry = { count: 0, resetAt: now + AUTH_WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;

  if (entry.count > AUTH_MAX_REQUESTS) {
    ctx.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
    throw new AppError(429, "AUTH_RATE_LIMITED", "Too many authentication attempts, please try again later");
  }

  await next();
}
