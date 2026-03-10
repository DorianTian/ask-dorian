import React, { createContext, useContext, useRef, useEffect, useState } from "react"
import { Platform } from "react-native"
import { useStore } from "zustand"
import { createAuthStore, type AuthStore } from "@ask-dorian/core/stores"
import type { DeviceInfo } from "@ask-dorian/core/types"
import { syncStorage } from "../lib/storage"
import { API_BASE_URL } from "../lib/config"

// ---------------------------------------------------------------------------
// Device info
// ---------------------------------------------------------------------------

function getMobileDeviceInfo(): DeviceInfo {
  if (Platform.OS === "web") {
    return {
      deviceType: "mobile",
      platform: "pwa",
      deviceName: typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 50)
        : "web",
      appVersion: "0.1.0",
    }
  }
  return {
    deviceType: "mobile",
    platform: Platform.OS === "ios" ? "ios" : "android",
    deviceName: `${Platform.OS} ${Platform.Version}`,
    appVersion: "0.1.0",
    osInfo: `${Platform.OS} ${Platform.Version}`,
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type AuthStoreApi = ReturnType<typeof createAuthStore>

const AuthContext = createContext<AuthStoreApi | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AuthStoreApi | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      // 1. Hydrate sync storage cache from AsyncStorage
      await syncStorage.hydrate()

      if (cancelled) return

      // 2. Create and init the auth store
      const store = createAuthStore()
      store.getState().init({
        baseUrl: API_BASE_URL,
        deviceInfo: getMobileDeviceInfo(),
        storage: syncStorage,
      })

      storeRef.current = store
      setReady(true)
    }

    boot()
    return () => { cancelled = true }
  }, [])

  if (!ready || !storeRef.current) {
    return null // SplashScreen should cover this
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
    throw new Error("useAuth must be used within AuthProvider")
  }
  return useStore(store, selector)
}
