import { createStore } from 'zustand/vanilla';
import type { User, AuthTokens } from '../types/api';
import type { DeviceInfo } from '../types/requests';
import { authApi } from '../api/auth';
import { initApiClient, type TokenProvider } from '../api/client';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  init: (opts: {
    baseUrl: string;
    deviceInfo: DeviceInfo;
    storage: AuthStorage;
  }) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  googleOAuth: (idToken: string) => Promise<boolean>;
  githubOAuth: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  reset: () => void;
}

// Platform-agnostic storage interface (localStorage on web, SecureStore on mobile, etc.)
export interface AuthStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

// ---------------------------------------------------------------------------
// Store Keys
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dorian:access_token',
  REFRESH_TOKEN: 'dorian:refresh_token',
  DEVICE_ID: 'dorian:device_id',
  USER: 'dorian:user',
} as const;

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
};

// ---------------------------------------------------------------------------
// Silent Refresh
// ---------------------------------------------------------------------------

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 min before expiry
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Decode JWT exp claim without verification (client-side only) */
function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Store Factory
// ---------------------------------------------------------------------------

export type AuthStore = AuthState & AuthActions;

let storage: AuthStorage | null = null;
let deviceInfo: DeviceInfo | null = null;
// Module-level references for silent refresh timer to update store state
let storeSet: ((state: Partial<AuthState>) => void) | null = null;
let storeGet: (() => AuthStore) | null = null;

export const createAuthStore = () =>
  createStore<AuthStore>((set, get) => {
    // Capture set/get for silent refresh
    storeSet = set;
    storeGet = get;

    return {
      ...initialState,

      init: (opts) => {
        storage = opts.storage;
        deviceInfo = opts.deviceInfo;

        // Hydrate from storage
        const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const deviceId = storage.getItem(STORAGE_KEYS.DEVICE_ID);
        const userJson = storage.getItem(STORAGE_KEYS.USER);

        let user: User | null = null;
        if (userJson) {
          try {
            user = JSON.parse(userJson) as User;
          } catch {
            storage.removeItem(STORAGE_KEYS.USER);
          }
        }

        set({
          accessToken,
          refreshToken,
          deviceId,
          user,
          isAuthenticated: !!accessToken,
        });

        // Wire up API client with token provider
        const tokenProvider: TokenProvider = {
          getAccessToken: () => get().accessToken,
          getRefreshToken: () => get().refreshToken,
          getDeviceId: () => get().deviceId,
          setTokens: (at, rt) => {
            storage?.setItem(STORAGE_KEYS.ACCESS_TOKEN, at);
            storage?.setItem(STORAGE_KEYS.REFRESH_TOKEN, rt);
            set({ accessToken: at, refreshToken: rt });
          },
          clearTokens: () => {
            get().reset();
          },
        };

        initApiClient({
          baseUrl: opts.baseUrl,
          tokenProvider,
          onUnauthorized: () => {
            get().reset();
          },
        });

        // Schedule proactive refresh for hydrated token
        if (accessToken) {
          scheduleRefresh(accessToken);
        }
      },

      login: async (email, password) => {
        if (!deviceInfo) return false;
        set({ isLoading: true });

        const result = await authApi.login({ email, password, deviceInfo });
        if (!result.ok) {
          set({ isLoading: false });
          return false;
        }

        persistAuth(set, result.data.tokens, result.data.user);
        return true;
      },

      register: async (name, email, password) => {
        if (!deviceInfo) return false;
        set({ isLoading: true });

        const result = await authApi.register({
          name,
          email,
          password,
          deviceInfo,
        });

        if (!result.ok) {
          set({ isLoading: false });
          return false;
        }

        persistAuth(set, result.data.tokens, result.data.user);
        return true;
      },

      googleOAuth: async (idToken) => {
        if (!deviceInfo) return false;
        set({ isLoading: true });

        const result = await authApi.googleOAuth({ idToken, deviceInfo });
        if (!result.ok) {
          set({ isLoading: false });
          return false;
        }

        persistAuth(set, result.data.tokens, result.data.user);
        return true;
      },

      githubOAuth: async (code) => {
        if (!deviceInfo) return false;
        set({ isLoading: true });

        const result = await authApi.githubOAuth({ code, deviceInfo });
        if (!result.ok) {
          set({ isLoading: false });
          return false;
        }

        persistAuth(set, result.data.tokens, result.data.user);
        return true;
      },

      logout: async () => {
        clearRefreshTimer();
        await authApi.logout();
        get().reset();
      },

      setUser: (user) => {
        storage?.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        set({ user });
      },

      reset: () => {
        clearRefreshTimer();
        storage?.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        storage?.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        storage?.removeItem(STORAGE_KEYS.USER);
        set(initialState);
      },
    };
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function persistAuth(
  set: (state: Partial<AuthState>) => void,
  tokens: AuthTokens,
  user: User,
) {
  storage?.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  storage?.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  storage?.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  set({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user,
    isAuthenticated: true,
    isLoading: false,
  });
  scheduleRefresh(tokens.accessToken);
}

function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/** Schedule proactive token refresh before expiry */
function scheduleRefresh(accessToken: string) {
  clearRefreshTimer();

  const exp = decodeJwtExp(accessToken);
  if (!exp) return;

  const expiresInMs = exp * 1000 - Date.now();
  const refreshInMs = expiresInMs - REFRESH_BUFFER_MS;

  // If already within the buffer, refresh immediately
  if (refreshInMs <= 0) {
    void doSilentRefresh();
    return;
  }

  refreshTimer = setTimeout(() => {
    void doSilentRefresh();
  }, refreshInMs);
}

/** Proactive silent refresh — runs before token expires */
async function doSilentRefresh() {
  if (!storeGet) return;
  const state = storeGet();
  if (!state.refreshToken || !state.deviceId) return;

  const result = await authApi.refresh({
    refreshToken: state.refreshToken,
    deviceId: state.deviceId,
  });

  if (result.ok) {
    storage?.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.data.accessToken);
    storage?.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.data.refreshToken);
    storeSet?.({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });
    // Schedule next refresh cycle
    scheduleRefresh(result.data.accessToken);
  } else {
    // Refresh failed — force logout
    storeGet?.()?.reset();
  }
}
