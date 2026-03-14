// packages/server/src/services/ritual-service.ts
import { AppError } from "../middleware/error-handler.js";
import { ritualRepo, type RitualRow } from "../repositories/ritual-repo.js";
import { taskRepo } from "../repositories/task-repo.js";

export interface CreateRitualInput {
  title: string;
  isFocus?: boolean;
  taskId?: string | null;
}

export interface UpdateRitualInput {
  title?: string;
  isFocus?: boolean;
  sortOrder?: string;
  isActive?: boolean;
  taskId?: string | null;
}

export interface RitualWithCompletion extends RitualRow {
  completed: boolean;
  completedAt: string | null;
}

export interface RitualListResult {
  items: RitualWithCompletion[];
  progress: { completed: number; total: number };
}

export interface RitualDailyBreakdown {
  date: string;
  completed: number;
  total: number;
}

export interface RitualStatsResult {
  completionRate: number;
  totalCompleted: number;
  totalPossible: number;
  currentStreak: number;
  bestStreak: number;
  dailyBreakdown: RitualDailyBreakdown[];
}

export const ritualService = {
  /** List active rituals with completion status for a given date */
  async list(userId: string, date: string): Promise<RitualListResult> {
    const [activeRituals, completions] = await Promise.all([
      ritualRepo.findActiveByUserId(userId),
      ritualRepo.findCompletionsForDate(userId, date),
    ]);

    const completionMap = new Map(
      completions.map((c) => [c.ritualId, c.completedAt]),
    );

    const items: RitualWithCompletion[] = activeRituals.map((r) => {
      const completedAt = completionMap.get(r.id);
      return {
        ...r,
        completed: !!completedAt,
        completedAt: completedAt?.toISOString() ?? null,
      };
    });

    const completedCount = items.filter((i) => i.completed).length;

    return {
      items,
      progress: { completed: completedCount, total: items.length },
    };
  },

  /** Create a new ritual (sortOrder auto-generated, appended to end) */
  async create(userId: string, input: CreateRitualInput): Promise<RitualRow> {
    // Validate taskId ownership if provided
    if (input.taskId) {
      const task = await taskRepo.findById(input.taskId);
      if (!task || task.userId !== userId) {
        throw new AppError(400, "INVALID_TASK", "Task not found or not owned by user");
      }
    }

    // Auto-generate sortOrder: find the last ritual's sortOrder and append after it
    const existing = await ritualRepo.findActiveByUserId(userId);
    let sortOrder = "0|hzzzzz:";
    if (existing.length > 0) {
      const lastOrder = existing[existing.length - 1].sortOrder;
      // Simple append: add a character to push it after the last item
      sortOrder = lastOrder + "V";
    }

    return ritualRepo.create({
      userId,
      title: input.title,
      isFocus: input.isFocus ?? false,
      taskId: input.taskId ?? null,
      sortOrder,
    });
  },

  /** Update an existing ritual */
  async update(
    userId: string,
    id: string,
    input: UpdateRitualInput,
  ): Promise<RitualRow> {
    const existing = await ritualRepo.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }

    // Validate taskId ownership if provided
    if (input.taskId !== undefined && input.taskId !== null) {
      const task = await taskRepo.findById(input.taskId);
      if (!task || task.userId !== userId) {
        throw new AppError(400, "INVALID_TASK", "Task not found or not owned by user");
      }
    }

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const updated = await ritualRepo.updateById(id, data);
    if (!updated) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }
    return updated;
  },

  /** Soft delete a ritual */
  async delete(userId: string, id: string): Promise<void> {
    const deleted = await ritualRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }
  },

  /** Toggle completion for a ritual on a given date */
  async toggleComplete(
    userId: string,
    id: string,
    date: string,
  ): Promise<{ completed: boolean; completedAt: string | null }> {
    const ritual = await ritualRepo.findById(id);
    if (!ritual || ritual.userId !== userId) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }

    const existing = await ritualRepo.findCompletion(id, date);

    if (existing) {
      // Already completed → un-complete
      await ritualRepo.deleteCompletion(id, date);
      return { completed: false, completedAt: null };
    } else {
      // Not completed → complete
      const completedAt = await ritualRepo.insertCompletion(id, userId, date);
      return { completed: true, completedAt: completedAt.toISOString() };
    }
  },

  /** Get stats for a date range (Review page) */
  async getStats(
    userId: string,
    from: string,
    to: string,
  ): Promise<RitualStatsResult> {
    const [completionsByDate, ritualCountsByDate] = await Promise.all([
      ritualRepo.getCompletionsByDateRange(userId, from, to),
      ritualRepo.getRitualsCountByDate(userId, from, to),
    ]);

    const completionMap = new Map(
      completionsByDate.map((c) => [c.date, c.completed]),
    );

    // Build daily breakdown
    const dailyBreakdown: RitualDailyBreakdown[] = ritualCountsByDate.map(
      (day) => ({
        date: day.date,
        completed: completionMap.get(day.date) ?? 0,
        total: day.total,
      }),
    );

    // Compute totals
    let totalCompleted = 0;
    let totalPossible = 0;
    for (const day of dailyBreakdown) {
      totalCompleted += day.completed;
      totalPossible += day.total;
    }

    const completionRate =
      totalPossible > 0 ? totalCompleted / totalPossible : 0;

    // Compute streaks (all-completed days)
    // A day is "all completed" when completed === total AND total > 0
    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;

    for (const day of dailyBreakdown) {
      if (day.total > 0 && day.completed === day.total) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
      }
    }

    // Current streak: count backwards from the last day
    currentStreak = 0;
    for (let i = dailyBreakdown.length - 1; i >= 0; i--) {
      const day = dailyBreakdown[i];
      if (day.total > 0 && day.completed === day.total) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      completionRate: Math.round(completionRate * 100) / 100,
      totalCompleted,
      totalPossible,
      currentStreak,
      bestStreak,
      dailyBreakdown,
    };
  },
};
