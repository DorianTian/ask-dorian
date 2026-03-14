import { useSWRApi } from "./use-swr-api"
import { ritualApi } from "../api/rituals"
import type { RitualStatsParams } from "../types/requests"

export function useRituals(date?: string) {
  const key = date ? `/rituals?date=${date}` : "/rituals"
  return useSWRApi(key, () => ritualApi.list(date))
}

export function useRitualStats(params: RitualStatsParams | null) {
  const key = params
    ? `/rituals/stats?from=${params.from}&to=${params.to}`
    : null
  return useSWRApi(key, () => ritualApi.getStats(params!))
}
