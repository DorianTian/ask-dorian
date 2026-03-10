import { and, isNull, lte, gte, sql } from "drizzle-orm";
import { logger } from "../config/logger.js";
import { db } from "../db/index.js";
import { tasks } from "../db/schema/tasks.js";
import { events } from "../db/schema/events.js";
import { fragmentService } from "./fragment-service.js";
import { notificationService } from "./notification-service.js";

let retryInterval: ReturnType<typeof setInterval> | null = null;
let notifyInterval: ReturnType<typeof setInterval> | null = null;

export const schedulerService = {
  /** Start background jobs */
  start() {
    // Retry failed fragments every 5 minutes
    retryInterval = setInterval(async () => {
      try {
        const count = await fragmentService.retryPending();
        if (count > 0) {
          logger.info({ count }, "Retried pending fragments");
        }
      } catch (err) {
        logger.error({ err }, "Fragment retry job failed");
      }
    }, 5 * 60 * 1000);

    // Check for overdue tasks and upcoming events every 15 minutes
    notifyInterval = setInterval(async () => {
      try {
        await this.checkOverdueTasks();
        await this.checkUpcomingEvents();
      } catch (err) {
        logger.error({ err }, "Notification check job failed");
      }
    }, 15 * 60 * 1000);

    // Run notification check once at startup (after 30 seconds to let things settle)
    setTimeout(() => {
      this.checkOverdueTasks().catch(() => {});
      this.checkUpcomingEvents().catch(() => {});
    }, 30_000);

    logger.info(
      "Scheduler started: fragment retry (5m), notification check (15m)",
    );
  },

  /** Stop background jobs (for graceful shutdown) */
  stop() {
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
    if (notifyInterval) {
      clearInterval(notifyInterval);
      notifyInterval = null;
    }
    logger.info("Scheduler stopped");
  },

  /** Find overdue tasks and create notifications */
  async checkOverdueTasks() {
    const today = new Date().toISOString().slice(0, 10);

    const overdueTasks = await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        title: tasks.title,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .where(
        and(
          isNull(tasks.deletedAt),
          sql`${tasks.status} NOT IN ('done', 'cancelled', 'archived')`,
          sql`${tasks.dueDate} < ${today}`,
        ),
      );

    for (const task of overdueTasks) {
      try {
        await notificationService.createIfNotExists(
          task.userId,
          "task_overdue",
          `Task "${task.title}" is overdue (due: ${task.dueDate})`,
          { entityType: "task", entityId: task.id },
          "daily",
        );
      } catch {
        // Skip individual failures
      }
    }

    if (overdueTasks.length > 0) {
      logger.debug(
        { count: overdueTasks.length },
        "Checked overdue tasks for notifications",
      );
    }
  },

  /** Find events starting in the next 30 minutes and create reminders */
  async checkUpcomingEvents() {
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 60 * 1000);

    const upcomingEvents = await db
      .select({
        id: events.id,
        userId: events.userId,
        title: events.title,
        startTime: events.startTime,
      })
      .from(events)
      .where(
        and(
          isNull(events.deletedAt),
          gte(events.startTime, now),
          lte(events.startTime, soon),
        ),
      );

    for (const event of upcomingEvents) {
      try {
        const minutesUntil = Math.round(
          (event.startTime.getTime() - now.getTime()) / 60000,
        );
        await notificationService.createIfNotExists(
          event.userId,
          "event_reminder",
          `"${event.title}" starts in ${minutesUntil} minutes`,
          { entityType: "event", entityId: event.id },
          "hourly",
        );
      } catch {
        // Skip individual failures
      }
    }

    if (upcomingEvents.length > 0) {
      logger.debug(
        { count: upcomingEvents.length },
        "Checked upcoming events for reminders",
      );
    }
  },
};
