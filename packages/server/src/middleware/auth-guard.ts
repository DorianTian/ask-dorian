import type { Context, Next } from "koa";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./error-handler.js";

declare module "koa" {
  interface DefaultState {
    userId: string;
    userRole: string;
    deviceId?: string;
  }
}

export async function authGuard(ctx: Context, next: Next) {
  const header = ctx.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Missing or invalid Authorization header");
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    ctx.state.userId = payload.sub;
    ctx.state.userRole = payload.role;
    ctx.state.deviceId = payload.did;
  } catch {
    throw new AppError(401, "TOKEN_EXPIRED", "Access token is invalid or expired");
  }

  await next();
}
