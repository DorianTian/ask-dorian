import { createStore } from "zustand/vanilla"
import type { User, AuthTokens } from "../types/api"
import type { LoginRequest, RegisterRequest, GoogleOAuthRequest, DeviceInfo } from "../types/requests"
import { authApi } from "../api/auth"
import { initApiClient, type TokenProvider } from "../api/client"

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  deviceId: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthActions {
  init: (opts: {
    baseUrl: string
    deviceInfo: DeviceInfo
    storage: AuthStorage
  }) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  googleOAuth: (body: Omit<GoogleOAuthRequest, "deviceInfo">) => Promise<boolean>
  logout: () => Promise<void>
  setUser: (user: User) => void
  reset: () => void
}

// Platform-agnostic storage interface (localStorage on web, SecureStore on mobile, etc.)
export interface AuthStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

// ---------------------------------------------------------------------------
// Store Keys
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  ACCESS_TOKEN: "dorian:access_token",
  REFRESH_TOKEN: "dorian:refresh_token",
  DEVICE_ID: "dorian:device_id",
  USER: "dorian:user",
} as const

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  deviceId: null,
  isAuthenticated: false,
  isLoading: false,
}

// ---------------------------------------------------------------------------
// Store Factory
// ---------------------------------------------------------------------------

export type AuthStore = AuthState & AuthActions

let storage: AuthStorage | null = null
let deviceInfo: DeviceInfo | null = null

export const createAuthStore = () =>
  createStore<AuthStore>((set, get) => ({
    ...initialState,

    init: (opts) => {
      storage = opts.storage
      deviceInfo = opts.deviceInfo

      // Hydrate from storage
      const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const deviceId = storage.getItem(STORAGE_KEYS.DEVICE_ID)
      const userJson = storage.getItem(STORAGE_KEYS.USER)

      let user: User | null = null
      if (userJson) {
        try {
          user = JSON.parse(userJson) as User
        } catch {
          storage.removeItem(STORAGE_KEYS.USER)
        }
      }

      set({
        accessToken,
        refreshToken,
        deviceId,
        user,
        isAuthenticated: !!accessToken,
      })

      // Wire up API client with token provider
      const tokenProvider: TokenProvider = {
        getAccessToken: () => get().accessToken,
        getRefreshToken: () => get().refreshToken,
        getDeviceId: () => get().deviceId,
        setTokens: (at, rt) => {
          storage?.setItem(STORAGE_KEYS.ACCESS_TOKEN, at)
          storage?.setItem(STORAGE_KEYS.REFRESH_TOKEN, rt)
          set({ accessToken: at, refreshToken: rt })
        },
        clearTokens: () => {
          get().reset()
        },
      }

      initApiClient({
        baseUrl: opts.baseUrl,
        tokenProvider,
        onUnauthorized: () => {
          get().reset()
        },
      })
    },

    login: async (email, password) => {
      if (!deviceInfo) return false
      set({ isLoading: true })

      const result = await authApi.login({ email, password, deviceInfo })
      if (!result.ok) {
        set({ isLoading: false })
        return false
      }

      persistAuth(set, result.data.tokens, result.data.user)
      return true
    },

    register: async (name, email, password) => {
      if (!deviceInfo) return false
      set({ isLoading: true })

      const result = await authApi.register({ name, email, password, deviceInfo })
      if (!result.ok) {
        set({ isLoading: false })
        return false
      }

      persistAuth(set, result.data.tokens, result.data.user)
      return true
    },

    googleOAuth: async (body) => {
      if (!deviceInfo) return false
      set({ isLoading: true })

      const result = await authApi.googleOAuth({ ...body, deviceInfo })
      if (!result.ok) {
        set({ isLoading: false })
        return false
      }

      persistAuth(set, result.data.tokens, result.data.user)
      return true
    },

    logout: async () => {
      await authApi.logout()
      get().reset()
    },

    setUser: (user) => {
      storage?.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
      set({ user })
    },

    reset: () => {
      storage?.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      storage?.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      storage?.removeItem(STORAGE_KEYS.USER)
      set(initialState)
    },
  }))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function persistAuth(
  set: (state: Partial<AuthState>) => void,
  tokens: AuthTokens,
  user: User,
) {
  storage?.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
  storage?.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
  storage?.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  set({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user,
    isAuthenticated: true,
    isLoading: false,
  })
}
