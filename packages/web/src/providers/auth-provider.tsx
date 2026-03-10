"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"
import { useStore } from "zustand"
import { createAuthStore, type AuthStore, type AuthStorage } from "@ask-dorian/core/stores"
import { API_BASE_URL } from "@/lib/constants"
import type { DeviceInfo } from "@ask-dorian/core/types"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type AuthStoreApi = ReturnType<typeof createAuthStore>

const AuthContext = createContext<AuthStoreApi | null>(null)

// ---------------------------------------------------------------------------
// Browser storage adapter
// ---------------------------------------------------------------------------

const browserStorage: AuthStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(key)
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return
    localStorage.setItem(key, value)
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  },
}

// ---------------------------------------------------------------------------
// Device info for web platform
// ---------------------------------------------------------------------------

function getWebDeviceInfo(): DeviceInfo {
  return {
    deviceType: "desktop",
    platform: "web",
    deviceName: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 100) : "Web Browser",
    appVersion: "0.1.0",
    osInfo: typeof navigator !== "undefined" ? navigator.platform : undefined,
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AuthStoreApi>(null)

  if (!storeRef.current) {
    storeRef.current = createAuthStore()
    storeRef.current.getState().init({
      baseUrl: API_BASE_URL,
      deviceInfo: getWebDeviceInfo(),
      storage: browserStorage,
    })
  }

  return (
    <AuthContext.Provider value={storeRef.current}>
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth<T>(selector: (state: AuthStore) => T): T {
  const store = useContext(AuthContext)
  if (!store) {
    throw new Error("[useAuth] Must be used within <AuthProvider>")
  }
  return useStore(store, selector)
}
