import { AppError } from "../middleware/error-handler.js";
import { eventRepo } from "../repositories/event-repo.js";
import { projectRepo, type Project } from "../repositories/project-repo.js";
import { taskRepo } from "../repositories/task-repo.js";

export interface CreateProjectInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  goal?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  status?: string;
  goal?: string | null;
  dueDate?: string | null;
  progress?: number;
  sortOrder?: string;
  tags?: string[];
}

export const projectService = {
  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    return projectRepo.create({
      userId,
      name: input.name,
      description: input.description,
      icon: input.icon,
      color: input.color ?? "#6366f1",
      goal: input.goal,
      dueDate: input.dueDate,
      tags: input.tags ?? [],
    });
  },

  async findById(userId: string, id: string): Promise<Project> {
    const project = await projectRepo.findById(id);
    if (!project || project.userId !== userId) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    return project;
  },

  async list(
    userId: string,
    opts: { status?: string[]; limit?: number; offset?: number },
  ): Promise<Project[]> {
    return projectRepo.findByUserId(userId, opts);
  },

  async update(userId: string, id: string, input: UpdateProjectInput): Promise<Project> {
    await this.findById(userId, id);
    const updated = await projectRepo.updateById(id, input);
    if (!updated) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    return updated;
  },

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await projectRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    // Unlink child tasks and events from this project
    await taskRepo.unlinkFromProject(id);
    await eventRepo.unlinkFromProject(id);
  },
};
