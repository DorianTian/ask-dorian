import { useSWRApi } from "./use-swr-api"
import { userApi } from "../api/users"

export function useUserProfile() {
  return useSWRApi("/users/me", () => userApi.getProfile())
}

export function useUserSettings() {
  return useSWRApi("/users/me/settings", () => userApi.getSettings())
}
