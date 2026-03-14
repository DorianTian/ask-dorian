import type { Context, Next } from "koa";
import { AppError } from "./error-handler.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Koa middleware that validates ctx.params.id is a valid UUID.
 * Place after the router match so ctx.params is populated.
 */
export async function validateUuidParam(ctx: Context, next: Next) {
  const id = ctx.params?.id;
  if (id !== undefined && !UUID_RE.test(id)) {
    throw new AppError(400, "INVALID_ID", "ID must be a valid UUID");
  }
  await next();
}
