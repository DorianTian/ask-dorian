import type { Context } from "koa";
import { z } from "zod";
import { taskService } from "../services/task-service.js";
import { eventService } from "../services/event-service.js";
import { fragmentService } from "../services/fragment-service.js";
import { ritualService } from "../services/ritual-service.js";

const todayQuerySchema = z.object({
  timezone: z.string().max(50).default("UTC"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").optional(),
});

export const todayController = {
  /** Aggregate endpoint for the Today dashboard */
  async getDashboard(ctx: Context) {
    const query = todayQuerySchema.parse(ctx.query);
    const userId = ctx.state.userId;

    // Determine target date
    const now = new Date();
    const dateStr =
      query.date ??
      now.toLocaleDateString("en-CA", { timeZone: query.timezone }); // YYYY-MM-DD

    // Run all queries in parallel
    const [
      scheduledTasks,
      overdueTasks,
      todayEvents,
      pendingFragments,
      statusCounts,
      ritualsResult,
    ] = await Promise.all([
      taskService.getScheduledForDate(userId, dateStr),
      taskService.getOverdue(userId, dateStr),
      eventService.getToday(userId, query.timezone),
      fragmentService.list(userId, { status: "pending", limit: 20 }),
      taskService.getStatusCounts(userId),
      ritualService.list(userId, dateStr),
    ]);

    ctx.body = {
      date: dateStr,
      timezone: query.timezone,
      tasks: {
        scheduled: scheduledTasks,
        overdue: overdueTasks,
      },
      events: todayEvents,
      pendingFragments,
      rituals: ritualsResult,
      stats: {
        taskCounts: statusCounts,
      },
    };
  },
};
