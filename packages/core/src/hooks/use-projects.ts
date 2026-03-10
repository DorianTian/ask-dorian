import { useSWRApi } from "./use-swr-api"
import { projectApi } from "../api/projects"
import type { ListProjectsParams } from "../types/requests"

export function useProjects(params?: ListProjectsParams) {
  const key = params
    ? `/projects?${new URLSearchParams(params as Record<string, string>)}`
    : "/projects"

  return useSWRApi(key, () => projectApi.list(params))
}

export function useProject(id: string | null) {
  return useSWRApi(
    id ? `/projects/${id}` : null,
    () => projectApi.getById(id!),
  )
}
