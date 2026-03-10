import { api } from "./client"
import type { Project } from "../types/api"
import type { CreateProjectRequest, UpdateProjectRequest, ListProjectsParams } from "../types/requests"

const BASE = "/api/v1/projects"

export const projectApi = {
  create: (body: CreateProjectRequest) =>
    api.post<Project>(`${BASE}`, body),

  list: (params?: ListProjectsParams) =>
    api.get<Project[]>(`${BASE}`, params),

  getById: (id: string) =>
    api.get<Project>(`${BASE}/${id}`),

  update: (id: string, body: UpdateProjectRequest) =>
    api.patch<Project>(`${BASE}/${id}`, body),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),
}
