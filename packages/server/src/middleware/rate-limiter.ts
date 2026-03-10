import type { Context, Next } from "koa";
import { env } from "../config/env.js";

/** Timestamps of requests within the current window */
const store = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/** Periodically purge keys whose entries are all outside the window */
const cleanup = setInterval(() => {
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  for (const [key, timestamps] of store) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) {
      store.delete(key);
    } else {
      store.set(key, fresh);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow the process to exit even if the interval is active
cleanup.unref();

function getKey(ctx: Context): string {
  // Authenticated users keyed by userId; anonymous by IP
  if (ctx.state.userId) {
    return `user:${ctx.state.userId}`;
  }
  return `ip:${ctx.ip}`;
}

export async function rateLimiter(ctx: Context, next: Next) {
  const key = getKey(ctx);
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  const timestamps = store.get(key) ?? [];

  // Drop entries outside the sliding window
  const windowStart = now - windowMs;
  const fresh = timestamps.filter((t) => t > windowStart);

  if (fresh.length >= maxRequests) {
    // Oldest timestamp in window determines when the next slot opens
    const oldestInWindow = fresh[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    ctx.status = 429;
    ctx.set("Retry-After", String(retryAfterSec));
    ctx.body = {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests",
      },
    };
    return;
  }

  fresh.push(now);
  store.set(key, fresh);

  // Expose standard rate-limit headers
  ctx.set("X-RateLimit-Limit", String(maxRequests));
  ctx.set("X-RateLimit-Remaining", String(maxRequests - fresh.length));
  ctx.set("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));

  await next();
}
