import Router from "@koa/router";
import { authGuard } from "../middleware/auth-guard.js";
import { sseService } from "../services/sse-service.js";

export const sseRoutes = new Router({ prefix: "/sse" });

sseRoutes.use(authGuard);

/** GET /sse/events — SSE stream for real-time updates */
sseRoutes.get("/events", async (ctx) => {
  const userId = ctx.state.userId;

  // Check connection limit before establishing SSE
  if (sseService.getClientCount(userId) >= 5) {
    ctx.status = 429;
    ctx.body = { error: { code: "SSE_LIMIT", message: "Too many SSE connections" } };
    return;
  }

  // Set SSE headers
  ctx.set("Content-Type", "text/event-stream");
  ctx.set("Cache-Control", "no-cache");
  ctx.set("Connection", "keep-alive");
  ctx.set("X-Accel-Buffering", "no"); // Disable Nginx buffering
  ctx.status = 200;
  ctx.flushHeaders();

  // Send initial ping
  ctx.res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  // Register client
  const client = sseService.addClient(userId, ctx)!;

  // Keep-alive ping every 30 seconds
  const keepAlive = setInterval(() => {
    try {
      ctx.res.write(": ping\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 30_000);

  // Cleanup on disconnect
  const cleanup = () => {
    clearInterval(keepAlive);
    sseService.removeClient(client);
  };

  ctx.req.on("close", cleanup);
  ctx.req.on("error", cleanup);

  // Keep the connection open (don't end the response)
  await new Promise<void>((resolve) => {
    ctx.req.on("close", resolve);
  });
});
