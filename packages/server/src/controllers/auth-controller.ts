import type { Context } from "koa";
import { z } from "zod";
import { authService } from "../services/auth-service.js";

// -- Validation schemas --

const deviceInfoSchema = z.object({
  deviceName: z.string().max(200).optional(),
  deviceType: z.enum(["desktop", "mobile", "tablet", "watch"]),
  platform: z.enum(["web", "pwa", "tauri", "ios", "android", "wechat_mini"]),
  appVersion: z.string().max(50).optional(),
  osInfo: z.string().max(100).optional(),
  deviceFingerprint: z.string().max(255).optional(),
});

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  deviceInfo: deviceInfoSchema,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceInfo: deviceInfoSchema,
});

const googleOAuthSchema = z.object({
  idToken: z.string().min(1),
  deviceInfo: deviceInfoSchema,
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
  deviceId: z.string().uuid(),
});

// -- Controller --

export const authController = {
  async register(ctx: Context) {
    const body = registerSchema.parse(ctx.request.body);
    const ip = ctx.ip;
    const ua = ctx.get("User-Agent");

    const result = await authService.register(
      body.email,
      body.password,
      body.name,
      body.deviceInfo,
      ip,
      ua,
    );

    ctx.status = 201;
    ctx.body = result;
  },

  async login(ctx: Context) {
    const body = loginSchema.parse(ctx.request.body);
    const ip = ctx.ip;
    const ua = ctx.get("User-Agent");

    const result = await authService.login(
      body.email,
      body.password,
      body.deviceInfo,
      ip,
      ua,
    );

    ctx.body = result;
  },

  async googleOAuth(ctx: Context) {
    const body = googleOAuthSchema.parse(ctx.request.body);
    const ip = ctx.ip;
    const ua = ctx.get("User-Agent");

    const result = await authService.googleOAuth(
      body.idToken,
      body.deviceInfo,
      ip,
      ua,
    );

    ctx.body = result;
  },

  async refresh(ctx: Context) {
    const body = refreshSchema.parse(ctx.request.body);
    const ip = ctx.ip;

    const tokens = await authService.refresh(
      body.refreshToken,
      body.deviceId,
      ip,
    );

    ctx.body = tokens;
  },

  async logout(ctx: Context) {
    const { userId, deviceId } = ctx.state;
    if (!deviceId) {
      ctx.status = 400;
      ctx.body = { error: { code: "NO_DEVICE", message: "No device ID in token" } };
      return;
    }
    await authService.logout(userId, deviceId);
    ctx.status = 204;
  },

  async logoutAll(ctx: Context) {
    await authService.logoutAll(ctx.state.userId);
    ctx.status = 204;
  },
};
