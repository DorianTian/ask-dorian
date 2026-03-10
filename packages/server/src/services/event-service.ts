import { AppError } from "../middleware/error-handler.js";
import { eventRepo, type Event } from "../repositories/event-repo.js";

export interface CreateEventInput {
  title: string;
  description?: string;
  type?: string;
  color?: string;
  startTime: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string;
  conferenceUrl?: string;
  conferenceType?: string;
  reminders?: { minutes: number; method: string }[];
  projectId?: string;
  taskId?: string;
  tags?: string[];
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  type?: string;
  color?: string | null;
  status?: string;
  visibility?: string;
  busyStatus?: string;
  startTime?: string;
  endTime?: string | null;
  isAllDay?: boolean;
  location?: string | null;
  conferenceUrl?: string | null;
  conferenceType?: string | null;
  reminders?: { minutes: number; method: string }[];
  projectId?: string | null;
  taskId?: string | null;
  tags?: string[];
}

export const eventService = {
  async create(userId: string, input: CreateEventInput): Promise<Event> {
    const ftsContent = [input.title, input.description, input.location, ...(input.tags ?? [])].filter(Boolean).join(" ");
    return eventRepo.create({
      userId,
      title: input.title,
      description: input.description,
      type: input.type ?? "other",
      color: input.color,
      startTime: new Date(input.startTime),
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      isAllDay: input.isAllDay ?? false,
      location: input.location,
      conferenceUrl: input.conferenceUrl,
      conferenceType: input.conferenceType,
      reminders: input.reminders ?? [{ minutes: 15, method: "push" }],
      projectId: input.projectId,
      taskId: input.taskId,
      tags: input.tags ?? [],
      source: "manual",
      ftsContent,
    });
  },

  async findById(userId: string, id: string): Promise<Event> {
    const event = await eventRepo.findById(id);
    if (!event || event.userId !== userId) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }
    return event;
  },

  async listByRange(
    userId: string,
    start: string,
    end: string,
  ): Promise<Event[]> {
    return eventRepo.findByRange(userId, new Date(start), new Date(end));
  },

  async update(userId: string, id: string, input: UpdateEventInput): Promise<Event> {
    const existing = await this.findById(userId, id);
    const data: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        if ((key === "startTime" || key === "endTime") && value) {
          data[key] = new Date(value as string);
        } else {
          data[key] = value;
        }
      }
    }

    // Regenerate FTS content when searchable fields change
    if (input.title !== undefined || input.description !== undefined || input.location !== undefined || input.tags !== undefined) {
      const title = input.title ?? existing.title;
      const description = input.description !== undefined ? input.description : existing.description;
      const location = input.location !== undefined ? input.location : existing.location;
      const tags = input.tags ?? (existing.tags as string[]) ?? [];
      data.ftsContent = [title, description, location, ...tags].filter(Boolean).join(" ");
    }

    const updated = await eventRepo.updateById(id, data);
    if (!updated) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }
    return updated;
  },

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await eventRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }
  },

  async getToday(userId: string, timezone: string): Promise<Event[]> {
    return eventRepo.findToday(userId, timezone);
  },

  async getBusySlots(userId: string, start: string, end: string) {
    return eventRepo.findBusySlots(userId, new Date(start), new Date(end));
  },
};
