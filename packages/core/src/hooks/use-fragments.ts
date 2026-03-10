import { useSWRApi } from "./use-swr-api"
import { fragmentApi } from "../api/fragments"
import type { ListFragmentsParams } from "../types/requests"

export function useFragments(params?: ListFragmentsParams) {
  const key = params
    ? `/fragments?${new URLSearchParams(params as Record<string, string>)}`
    : "/fragments"

  return useSWRApi(key, () => fragmentApi.list(params))
}

export function useFragment(id: string | null) {
  return useSWRApi(
    id ? `/fragments/${id}` : null,
    () => fragmentApi.getById(id!),
  )
}
