import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { devices } from "../db/schema/devices.js";

export type NewDevice = typeof devices.$inferInsert;
export type Device = typeof devices.$inferSelect;

export interface DeviceInfo {
  deviceName?: string;
  deviceType: string;
  platform: string;
  appVersion?: string;
  osInfo?: string;
  deviceFingerprint?: string;
}

export const deviceRepo = {
  async findById(id: string): Promise<Device | undefined> {
    const rows = await db
      .select()
      .from(devices)
      .where(eq(devices.id, id))
      .limit(1);
    return rows[0];
  },

  /**
   * Upsert device: find by (userId + platform + fingerprint) or create new.
   * Returns the device record.
   */
  async upsert(userId: string, info: DeviceInfo): Promise<Device> {
    // Try to find existing device by fingerprint
    if (info.deviceFingerprint) {
      const existing = await db
        .select()
        .from(devices)
        .where(
          and(
            eq(devices.userId, userId),
            eq(devices.platform, info.platform),
            eq(devices.deviceFingerprint, info.deviceFingerprint),
          ),
        )
        .limit(1);

      if (existing[0]) {
        const updated = await db
          .update(devices)
          .set({
            deviceName: info.deviceName ?? existing[0].deviceName,
            appVersion: info.appVersion ?? existing[0].appVersion,
            osInfo: info.osInfo ?? existing[0].osInfo,
            isActive: true,
            lastActiveAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(devices.id, existing[0].id))
          .returning();
        return updated[0]!;
      }
    }

    // Create new device
    const rows = await db
      .insert(devices)
      .values({
        userId,
        ...info,
      })
      .returning();
    return rows[0]!;
  },

  async updateLastActive(id: string): Promise<void> {
    await db
      .update(devices)
      .set({ lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(devices.id, id));
  },
};
