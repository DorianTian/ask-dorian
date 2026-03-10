import { useSWRApi } from "./use-swr-api"
import { taskApi } from "../api/tasks"
import type { ListTasksParams } from "../types/requests"

export function useTasks(params?: ListTasksParams) {
  const key = params
    ? `/tasks?${new URLSearchParams(params as Record<string, string>)}`
    : "/tasks"

  return useSWRApi(key, () => taskApi.list(params))
}

export function useTask(id: string | null) {
  return useSWRApi(
    id ? `/tasks/${id}` : null,
    () => taskApi.getById(id!),
  )
}
