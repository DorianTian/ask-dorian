import { AppError } from "../middleware/error-handler.js";
import {
  notificationRepo,
  type Notification,
} from "../repositories/notification-repo.js";
import { sseService } from "./sse-service.js";

export interface CreateNotificationInput {
  title: string;
  body?: string;
  type?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
}

export const notificationService = {
  async create(
    userId: string,
    input: CreateNotificationInput,
  ): Promise<Notification> {
    const notification = await notificationRepo.create({
      userId,
      title: input.title,
      body: input.body,
      type: input.type ?? "system",
      entityType: input.entityType as Notification["entityType"],
      entityId: input.entityId,
    });

    // Emit SSE event for real-time delivery
    sseService.sendToUser(userId, "notification", notification);

    return notification;
  },

  /**
   * Create a notification only if a matching one doesn't already exist
   * for the same entity within the dedup window (today for daily, this hour for hourly).
   */
  async createIfNotExists(
    userId: string,
    type: string,
    title: string,
    entity: { entityType: string; entityId: string },
    dedup: "daily" | "hourly" = "daily",
  ): Promise<void> {
    const exists =
      dedup === "hourly"
        ? await notificationRepo.existsForEntityThisHour(
            userId,
            type,
            entity.entityType,
            entity.entityId,
          )
        : await notificationRepo.existsForEntityToday(
            userId,
            type,
            entity.entityType,
            entity.entityId,
          );

    if (exists) return;

    await this.create(userId, {
      title,
      type,
      entityType: entity.entityType,
      entityId: entity.entityId,
    });
  },

  async list(
    userId: string,
    opts: { unreadOnly?: boolean; limit?: number; offset?: number } = {},
  ): Promise<Notification[]> {
    return notificationRepo.findByUserId(userId, opts);
  },

  async markRead(userId: string, id: string): Promise<void> {
    const updated = await notificationRepo.markRead(id, userId);
    if (!updated) {
      throw new AppError(
        404,
        "NOTIFICATION_NOT_FOUND",
        "Notification not found or already read",
      );
    }
  },

  async markAllRead(userId: string): Promise<number> {
    return notificationRepo.markAllRead(userId);
  },

  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepo.countUnread(userId);
  },
};
