import { api } from "./client"
import type { Knowledge } from "../types/api"
import type { CreateKnowledgeRequest, UpdateKnowledgeRequest, ListKnowledgeParams } from "../types/requests"

const BASE = "/api/v1/knowledge"

export const knowledgeApi = {
  create: (body: CreateKnowledgeRequest) =>
    api.post<Knowledge>(`${BASE}`, body),

  list: (params?: ListKnowledgeParams) =>
    api.get<Knowledge[]>(`${BASE}`, params),

  getById: (id: string) =>
    api.get<Knowledge>(`${BASE}/${id}`),

  update: (id: string, body: UpdateKnowledgeRequest) =>
    api.patch<Knowledge>(`${BASE}/${id}`, body),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),
}
