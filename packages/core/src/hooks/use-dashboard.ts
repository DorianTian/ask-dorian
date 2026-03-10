import { useSWRApi } from "./use-swr-api"
import { dashboardApi } from "../api/dashboard"
import type { ReviewParams } from "../types/requests"

export function useTodayDashboard() {
  return useSWRApi("/today", () => dashboardApi.today())
}

export function useWeeklyDashboard() {
  return useSWRApi("/weekly", () => dashboardApi.weekly())
}

export function useWeekReview(params: ReviewParams | null) {
  const key = params ? `/review?weekStart=${params.weekStart}` : null

  return useSWRApi(
    key,
    () => dashboardApi.review(params!),
  )
}
