import { api } from "./client"
import type { TodayDashboard, WeeklyDashboard, WeekReview } from "../types/api"
import type { ReviewParams } from "../types/requests"

export const dashboardApi = {
  today: (date?: string) =>
    api.get<TodayDashboard>("/api/v1/today", date ? { date } : undefined),

  weekly: () =>
    api.get<WeeklyDashboard>("/api/v1/weekly"),

  review: (params: ReviewParams) =>
    api.get<WeekReview>("/api/v1/review", params),
}
