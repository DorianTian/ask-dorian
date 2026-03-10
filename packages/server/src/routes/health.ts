import Router from "@koa/router";
import { checkDbConnection } from "../db/index.js";

export const healthRoutes = new Router();

healthRoutes.get("/health", async (ctx) => {
  const dbOk = await checkDbConnection();

  ctx.status = dbOk ? 200 : 503;
  ctx.body = {
    status: dbOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    checks: {
      database: dbOk ? "connected" : "disconnected",
    },
  };
});
