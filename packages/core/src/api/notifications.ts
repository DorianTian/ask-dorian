import { api } from "./client"
import type { Notification } from "../types/api"
import type { ListNotificationsParams } from "../types/requests"

const BASE = "/api/v1/notifications"

export const notificationApi = {
  list: (params?: ListNotificationsParams) =>
    api.get<Notification[]>(`${BASE}`, params),

  getUnreadCount: () =>
    api.get<{ count: number }>(`${BASE}/unread-count`),

  markRead: (id: string) =>
    api.post<void>(`${BASE}/${id}/read`),

  markAllRead: () =>
    api.post<{ updated: number }>(`${BASE}/read-all`),
}
