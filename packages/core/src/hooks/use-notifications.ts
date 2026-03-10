import { useSWRApi } from "./use-swr-api"
import { notificationApi } from "../api/notifications"
import type { ListNotificationsParams } from "../types/requests"

export function useNotifications(params?: ListNotificationsParams) {
  const key = params
    ? `/notifications?${new URLSearchParams(params as Record<string, string>)}`
    : "/notifications"

  return useSWRApi(key, () => notificationApi.list(params))
}

export function useUnreadCount() {
  return useSWRApi(
    "/notifications/unread-count",
    () => notificationApi.getUnreadCount(),
    { refreshInterval: 30_000 },
  )
}
