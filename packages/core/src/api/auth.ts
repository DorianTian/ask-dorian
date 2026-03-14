import { api } from "./client"
import type { AuthResponse, RefreshResponse } from "../types/api"
import type {
  RegisterRequest,
  LoginRequest,
  GoogleOAuthRequest,
  GitHubOAuthRequest,
  RefreshTokenRequest,
} from "../types/requests"

const BASE = "/api/v1/auth"

export const authApi = {
  register: (body: RegisterRequest) =>
    api.public.post<AuthResponse>(`${BASE}/register`, body),

  login: (body: LoginRequest) =>
    api.public.post<AuthResponse>(`${BASE}/login`, body),

  googleOAuth: (body: GoogleOAuthRequest) =>
    api.public.post<AuthResponse>(`${BASE}/google`, body),

  githubOAuth: (body: GitHubOAuthRequest) =>
    api.public.post<AuthResponse>(`${BASE}/github`, body),

  refresh: (body: RefreshTokenRequest) =>
    api.public.post<RefreshResponse>(`${BASE}/refresh`, body),

  logout: () =>
    api.post<void>(`${BASE}/logout`),

  logoutAll: () =>
    api.post<void>(`${BASE}/logout-all`),
}
