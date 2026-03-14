import { useSWRApi } from "./use-swr-api"
import { knowledgeApi } from "../api/knowledge"
import type { ListKnowledgeParams } from "../types/requests"

export function useKnowledge(params?: ListKnowledgeParams) {
  const key = params
    ? `/knowledge?${new URLSearchParams(params as Record<string, string>)}`
    : "/knowledge"

  return useSWRApi(key, () => knowledgeApi.list(params))
}

export function useKnowledgeItem(id: string | null) {
  return useSWRApi(
    id ? `/knowledge/${id}` : null,
    () => knowledgeApi.getById(id!),
  )
}
