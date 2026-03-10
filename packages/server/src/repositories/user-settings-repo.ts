import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userSettings } from "../db/schema/user-settings.js";

export type UserSettings = typeof userSettings.$inferSelect;

export const userSettingsRepo = {
  async findByUserId(userId: string): Promise<UserSettings | undefined> {
    const rows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return rows[0];
  },

  async update(
    userId: string,
    data: Partial<Omit<UserSettings, "id" | "userId" | "createdAt">>,
  ): Promise<UserSettings | undefined> {
    const rows = await db
      .update(userSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return rows[0];
  },
};
