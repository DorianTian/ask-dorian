import { api } from "./client"
import type { UserProfile, UserSettings } from "../types/api"
import type { UpdateProfileRequest, UpdateSettingsRequest } from "../types/requests"

const BASE = "/api/v1/users"

export const userApi = {
  getProfile: () =>
    api.get<UserProfile>(`${BASE}/me`),

  updateProfile: (body: UpdateProfileRequest) =>
    api.patch<UserProfile>(`${BASE}/me`, body),

  getSettings: () =>
    api.get<UserSettings>(`${BASE}/me/settings`),

  updateSettings: (body: UpdateSettingsRequest) =>
    api.patch<UserSettings>(`${BASE}/me/settings`, body),
}
