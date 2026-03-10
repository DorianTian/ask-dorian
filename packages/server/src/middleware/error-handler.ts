import type { Context, Next } from "koa";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";

/**
 * API error format:
 * { error: { code: string, message: string, details?: unknown } }
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: unknown) {
    if (err instanceof AppError) {
      ctx.status = err.statusCode;
      ctx.body = {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      };
      return;
    }

    if (err instanceof ZodError) {
      ctx.status = 400;
      ctx.body = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          details: err.flatten().fieldErrors,
        },
      };
      return;
    }

    // Unexpected error
    logger.error({ err }, "Unhandled error");
    ctx.status = 500;
    ctx.body = {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    };
  }
}
