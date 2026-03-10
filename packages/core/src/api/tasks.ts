import { api } from "./client"
import type { Task } from "../types/api"
import type { CreateTaskRequest, UpdateTaskRequest, ListTasksParams } from "../types/requests"

const BASE = "/api/v1/tasks"

export const taskApi = {
  create: (body: CreateTaskRequest) =>
    api.post<Task>(`${BASE}`, body),

  list: (params?: ListTasksParams) =>
    api.get<Task[]>(`${BASE}`, params),

  getById: (id: string) =>
    api.get<Task>(`${BASE}/${id}`),

  update: (id: string, body: UpdateTaskRequest) =>
    api.patch<Task>(`${BASE}/${id}`, body),

  complete: (id: string) =>
    api.post<Task>(`${BASE}/${id}/complete`),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),
}
