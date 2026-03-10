import { AppError } from "../middleware/error-handler.js";
import { taskRepo, type Task } from "../repositories/task-repo.js";

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId?: string;
  parentId?: string;
  priority?: "urgent" | "high" | "medium" | "low" | "none";
  energyLevel?: "high" | "medium" | "low";
  startDate?: string;
  dueDate?: string;
  scheduledDate?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedMinutes?: number;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  projectId?: string | null;
  parentId?: string | null;
  status?: "todo" | "in_progress" | "done" | "cancelled" | "archived";
  priority?: "urgent" | "high" | "medium" | "low" | "none";
  energyLevel?: "high" | "medium" | "low" | null;
  startDate?: string | null;
  dueDate?: string | null;
  scheduledDate?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  sortOrder?: string;
  tags?: string[];
}

export const taskService = {
  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const ftsContent = [input.title, input.description, ...(input.tags ?? [])].filter(Boolean).join(" ");
    return taskRepo.create({
      userId,
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      parentId: input.parentId,
      priority: input.priority ?? "none",
      energyLevel: input.energyLevel,
      startDate: input.startDate,
      dueDate: input.dueDate,
      scheduledDate: input.scheduledDate,
      scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : undefined,
      scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined,
      estimatedMinutes: input.estimatedMinutes,
      tags: input.tags ?? [],
      source: "manual",
      ftsContent,
    });
  },

  async findById(userId: string, id: string): Promise<Task> {
    const task = await taskRepo.findById(id);
    if (!task || task.userId !== userId) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
    return task;
  },

  async list(
    userId: string,
    opts: {
      status?: ("todo" | "in_progress" | "done" | "cancelled" | "archived")[];
      projectId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Task[]> {
    return taskRepo.findByUserId(userId, opts);
  },

  async update(userId: string, id: string, input: UpdateTaskInput): Promise<Task> {
    const existing = await this.findById(userId, id);
    const data: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        if ((key === "scheduledStart" || key === "scheduledEnd") && value) {
          data[key] = new Date(value as string);
        } else {
          data[key] = value;
        }
      }
    }

    // Auto-set completedAt
    if (input.status === "done") {
      data.completedAt = new Date();
    }

    // Regenerate FTS content when searchable fields change
    if (input.title !== undefined || input.description !== undefined || input.tags !== undefined) {
      const title = input.title ?? existing.title;
      const description = input.description !== undefined ? input.description : existing.description;
      const tags = input.tags ?? (existing.tags as string[]) ?? [];
      data.ftsContent = [title, description, ...tags].filter(Boolean).join(" ");
    }

    const updated = await taskRepo.updateById(id, data);
    if (!updated) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
    return updated;
  },

  async complete(userId: string, id: string): Promise<Task> {
    await this.findById(userId, id);
    const task = await taskRepo.complete(id);
    if (!task) {
      throw new AppError(400, "INVALID_STATUS", "Task cannot be completed from current status");
    }
    return task;
  },

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await taskRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
  },

  async getCompletedInRange(userId: string, start: string, end: string): Promise<Task[]> {
    return taskRepo.findCompletedInRange(userId, start, end);
  },

  async getScheduledForDate(userId: string, date: string): Promise<Task[]> {
    return taskRepo.findByScheduledDate(userId, date);
  },

  async getOverdue(userId: string, beforeDate: string): Promise<Task[]> {
    return taskRepo.findOverdue(userId, beforeDate);
  },

  async getStatusCounts(userId: string): Promise<{ status: string; count: number }[]> {
    return taskRepo.countByStatus(userId);
  },
};
