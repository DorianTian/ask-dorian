import { api } from "./client"
import type { CalendarEvent } from "../types/api"
import type { CreateEventRequest, UpdateEventRequest, ListEventsParams } from "../types/requests"

const BASE = "/api/v1/events"

export const eventApi = {
  create: (body: CreateEventRequest) =>
    api.post<CalendarEvent>(`${BASE}`, body),

  list: (params?: ListEventsParams) =>
    api.get<CalendarEvent[]>(`${BASE}`, params),

  getToday: () =>
    api.get<CalendarEvent[]>(`${BASE}/today`),

  getById: (id: string) =>
    api.get<CalendarEvent>(`${BASE}/${id}`),

  update: (id: string, body: UpdateEventRequest) =>
    api.patch<CalendarEvent>(`${BASE}/${id}`, body),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),
}
