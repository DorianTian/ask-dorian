import { api } from "./client"
import type {
  Ritual,
  RitualListResponse,
  RitualToggleResponse,
  RitualStats,
} from "../types/api"
import type {
  CreateRitualRequest,
  UpdateRitualRequest,
  RitualStatsParams,
} from "../types/requests"

const BASE = "/api/v1/rituals"

export const ritualApi = {
  list: (date?: string) =>
    api.get<RitualListResponse>(`${BASE}`, date ? { date } : undefined),

  create: (body: CreateRitualRequest) =>
    api.post<Ritual>(`${BASE}`, body),

  update: (id: string, body: UpdateRitualRequest) =>
    api.patch<Ritual>(`${BASE}/${id}`, body),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),

  toggleComplete: (id: string, date?: string) =>
    api.post<RitualToggleResponse>(
      `${BASE}/${id}/toggle-complete`,
      date ? { date } : {},
    ),

  getStats: (params: RitualStatsParams) =>
    api.get<RitualStats>(`${BASE}/stats`, params),
}
