import type { Context } from "koa";
import { z } from "zod";
import { taskService } from "../services/task-service.js";
import { eventService } from "../services/event-service.js";

const weeklyQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").optional(),
});

/** Calculate the Monday of the current week in the given timezone */
function getCurrentMonday(timezone: string): string {
  const now = new Date();
  const localStr = now.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
  const local = new Date(localStr + "T00:00:00");
  const dayOfWeek = local.getDay(); // 0=Sun, 1=Mon, ...
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // days since Monday
  local.setDate(local.getDate() - diff);
  return local.toISOString().slice(0, 10);
}

/** Add days to a YYYY-MM-DD date string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const weeklyController = {
  /** Aggregate endpoint for the Weekly dashboard */
  async getDashboard(ctx: Context) {
    const query = weeklyQuerySchema.parse(ctx.query);
    const userId = ctx.state.userId;
    const timezone = ctx.get("X-Timezone") || "UTC";

    const weekStart = query.weekStart ?? getCurrentMonday(timezone);
    const weekEnd = addDays(weekStart, 7); // Monday to next Monday (exclusive end)
    const weekEndInclusive = addDays(weekStart, 6); // Sunday

    // Build ISO timestamps for event range query
    const rangeStart = `${weekStart}T00:00:00Z`;
    const rangeEnd = `${weekEnd}T00:00:00Z`;

    const [scheduledTasks, dueTasks, weekEvents, overdueTasks] =
      await Promise.all([
        taskService.list(userId, { status: ["todo", "in_progress"] }).then(
          (tasks) =>
            tasks.filter(
              (t) =>
                t.scheduledDate !== null &&
                t.scheduledDate >= weekStart &&
                t.scheduledDate <= weekEndInclusive,
            ),
        ),
        taskService.list(userId, { status: ["todo", "in_progress"] }).then(
          (tasks) =>
            tasks.filter(
              (t) =>
                t.dueDate !== null &&
                t.dueDate >= weekStart &&
                t.dueDate <= weekEndInclusive,
            ),
        ),
        eventService.listByRange(userId, rangeStart, rangeEnd),
        taskService.getOverdue(userId, weekStart),
      ]);

    ctx.body = {
      weekStart,
      weekEnd: weekEndInclusive,
      timezone,
      tasks: {
        scheduled: scheduledTasks,
        due: dueTasks,
        overdue: overdueTasks,
      },
      events: weekEvents,
    };
  },
};
