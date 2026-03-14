import type { Context } from "koa";
import { z } from "zod";
import { taskService } from "../services/task-service.js";
import { eventService } from "../services/event-service.js";
import { knowledgeService } from "../services/knowledge-service.js";
import { fragmentService } from "../services/fragment-service.js";

const reviewQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
});

/** Add days to a YYYY-MM-DD date string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const reviewController = {
  /** Aggregate endpoint for the Week Review page */
  async getWeekReview(ctx: Context) {
    const query = reviewQuerySchema.parse(ctx.query);
    const userId = ctx.state.userId;

    const weekStart = query.weekStart;
    const weekEnd = addDays(weekStart, 7); // exclusive end (next Monday)
    const weekEndInclusive = addDays(weekStart, 6); // Sunday

    // Build ISO timestamps for range queries
    const rangeStart = `${weekStart}T00:00:00Z`;
    const rangeEnd = `${weekEnd}T00:00:00Z`;

    const [completedTasks, weekEvents, knowledgeItems, confirmedFragments] =
      await Promise.all([
        taskService.getCompletedInRange(userId, rangeStart, rangeEnd),
        eventService.listByRange(userId, rangeStart, rangeEnd),
        knowledgeService.getCreatedInRange(userId, rangeStart, rangeEnd),
        fragmentService.getConfirmedInRange(userId, rangeStart, rangeEnd),
      ]);

    ctx.body = {
      weekStart,
      weekEnd: weekEndInclusive,
      timezone: ctx.get("X-Timezone") || "UTC",
      completed: completedTasks,
      events: weekEvents,
      knowledge: knowledgeItems,
      fragmentsProcessed: confirmedFragments.length,
    };
  },
};
