// ============================================================
// API Client — Type-safe fetch wrapper
//
// Features:
// - Automatic access token injection
// - Transparent token refresh on 401 (with request queue)
// - Typed error handling with discriminated union
// - Configurable base URL
// ============================================================

import type { ApiErrorBody, RefreshResponse } from "../types/api"

// --- Result Type (no exceptions for business logic) ---

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: ApiError; status: number }

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

// --- Token Provider (injected by platform store) ---

export interface TokenProvider {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  getDeviceId: () => string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
}

// --- Client Config ---

export interface ApiClientConfig {
  baseUrl: string
  tokenProvider: TokenProvider
  onUnauthorized?: () => void
}

// --- Client ---

let config: ApiClientConfig | null = null
let refreshPromise: Promise<boolean> | null = null

export function initApiClient(cfg: ApiClientConfig): void {
  config = cfg
}

function getConfig(): ApiClientConfig {
  if (!config) {
    throw new Error("[ApiClient] Not initialized. Call initApiClient() first.")
  }
  return config
}

// --- Core Request ---

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown
    params?: object
    headers?: Record<string, string>
    skipAuth?: boolean
  } = {},
): Promise<ApiResult<T>> {
  const cfg = getConfig()

  // Build URL with query params
  const url = new URL(path, cfg.baseUrl)
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value != null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...options.headers,
  }

  if (!options.skipAuth) {
    const token = cfg.tokenProvider.getAccessToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  // Execute
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  // Handle 401 — attempt token refresh (once)
  if (res.status === 401 && !options.skipAuth) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return request<T>(method, path, { ...options, skipAuth: false })
    }
    cfg.onUnauthorized?.()
    return {
      ok: false,
      status: 401,
      error: { code: "UNAUTHORIZED", message: "Session expired" },
    }
  }

  // No content
  if (res.status === 204) {
    return { ok: true, data: undefined as T, status: 204 }
  }

  // Parse JSON
  const json = await res.json()

  if (!res.ok) {
    const errorBody = json as ApiErrorBody
    return {
      ok: false,
      status: res.status,
      error: errorBody.error ?? { code: "UNKNOWN", message: res.statusText },
    }
  }

  return { ok: true, data: json as T, status: res.status }
}

// --- Token Refresh (coalesced — all concurrent 401s share one refresh) ---

async function tryRefresh(): Promise<boolean> {
  const cfg = getConfig()
  const refreshToken = cfg.tokenProvider.getRefreshToken()
  const deviceId = cfg.tokenProvider.getDeviceId()

  if (!refreshToken || !deviceId) {
    cfg.tokenProvider.clearTokens()
    return false
  }

  // Coalesce concurrent refresh attempts
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const result = await request<RefreshResponse>(
        "POST",
        "/api/v1/auth/refresh",
        {
          body: { refreshToken, deviceId },
          skipAuth: true,
        },
      )

      if (result.ok) {
        cfg.tokenProvider.setTokens(result.data.accessToken, result.data.refreshToken)
        return true
      }

      cfg.tokenProvider.clearTokens()
      return false
    } catch {
      cfg.tokenProvider.clearTokens()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// --- Multipart Upload ---

async function upload<T>(
  path: string,
  formData: FormData,
): Promise<ApiResult<T>> {
  const cfg = getConfig()
  const url = new URL(path, cfg.baseUrl)

  const headers: Record<string, string> = {}
  const token = cfg.tokenProvider.getAccessToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  // Note: do NOT set Content-Type — browser sets it with boundary

  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: formData,
  })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return upload<T>(path, formData)
    }
    cfg.onUnauthorized?.()
    return {
      ok: false,
      status: 401,
      error: { code: "UNAUTHORIZED", message: "Session expired" },
    }
  }

  const json = await res.json()

  if (!res.ok) {
    const errorBody = json as ApiErrorBody
    return {
      ok: false,
      status: res.status,
      error: errorBody.error ?? { code: "UNKNOWN", message: res.statusText },
    }
  }

  return { ok: true, data: json as T, status: res.status }
}

// --- Public API (convenience methods) ---

export const api = {
  get: <T>(path: string, params?: object) =>
    request<T>("GET", path, { params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>("POST", path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),

  delete: <T = void>(path: string) =>
    request<T>("DELETE", path),

  upload: <T>(path: string, formData: FormData) =>
    upload<T>(path, formData),

  /** For auth endpoints that don't need token injection */
  public: {
    post: <T>(path: string, body?: unknown) =>
      request<T>("POST", path, { body, skipAuth: true }),
  },
}
