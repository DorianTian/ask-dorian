import { api } from "./client"
import type { Fragment } from "../types/api"
import type { CreateFragmentRequest, ListFragmentsParams } from "../types/requests"

const BASE = "/api/v1/fragments"

export const fragmentApi = {
  create: (body: CreateFragmentRequest) =>
    api.post<Fragment>(`${BASE}`, body),

  createFromVoice: (formData: FormData) =>
    api.upload<Fragment>(`${BASE}/voice`, formData),

  createFromImage: (formData: FormData) =>
    api.upload<Fragment>(`${BASE}/image`, formData),

  list: (params?: ListFragmentsParams) =>
    api.get<Fragment[]>(`${BASE}`, params),

  getById: (id: string) =>
    api.get<Fragment>(`${BASE}/${id}`),

  update: (id: string, data: { isPinned?: boolean; isArchived?: boolean }) =>
    api.patch<Fragment>(`${BASE}/${id}`, data),

  confirm: (id: string) =>
    api.post<Fragment>(`${BASE}/${id}/confirm`),

  reject: (id: string) =>
    api.post<Fragment>(`${BASE}/${id}/reject`),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),
}
