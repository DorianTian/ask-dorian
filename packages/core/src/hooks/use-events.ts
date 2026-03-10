import { useSWRApi } from "./use-swr-api"
import { eventApi } from "../api/events"
import type { ListEventsParams } from "../types/requests"

export function useEvents(params?: ListEventsParams) {
  const key = params
    ? `/events?${new URLSearchParams(params as Record<string, string>)}`
    : "/events"

  return useSWRApi(key, () => eventApi.list(params))
}

export function useTodayEvents() {
  return useSWRApi("/events/today", () => eventApi.getToday())
}

export function useEvent(id: string | null) {
  return useSWRApi(
    id ? `/events/${id}` : null,
    () => eventApi.getById(id!),
  )
}
