import type { Context } from "koa";
import { z } from "zod";
import { AppError } from "../middleware/error-handler.js";
import { userRepo } from "../repositories/user-repo.js";
import { userSettingsRepo } from "../repositories/user-settings-repo.js";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  locale: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
});

const updateSettingsSchema = z.object({
  language: z.string().max(10).optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  aiPreferences: z.record(z.unknown()).optional(),
  notificationSettings: z.record(z.unknown()).optional(),
  workPreferences: z.record(z.unknown()).optional(),
  defaultViews: z.record(z.unknown()).optional(),
});

export const userController = {
  async getProfile(ctx: Context) {
    const user = await userRepo.findById(ctx.state.userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    ctx.body = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
      timezone: user.timezone,
      aiQuotaUsed: user.aiQuotaUsed,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(ctx: Context) {
    const body = updateProfileSchema.parse(ctx.request.body);
    const user = await userRepo.updateById(ctx.state.userId, body);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    ctx.body = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
      timezone: user.timezone,
    };
  },

  async getSettings(ctx: Context) {
    const settings = await userSettingsRepo.findByUserId(ctx.state.userId);
    if (!settings) {
      throw new AppError(404, "SETTINGS_NOT_FOUND", "Settings not found");
    }
    ctx.body = settings;
  },

  async updateSettings(ctx: Context) {
    const body = updateSettingsSchema.parse(ctx.request.body);
    const settings = await userSettingsRepo.update(ctx.state.userId, body);
    if (!settings) {
      throw new AppError(404, "SETTINGS_NOT_FOUND", "Settings not found");
    }
    ctx.body = settings;
  },
};
