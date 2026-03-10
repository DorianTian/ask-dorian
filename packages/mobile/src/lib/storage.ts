import AsyncStorage from "@react-native-async-storage/async-storage"
import type { AuthStorage } from "@ask-dorian/core/stores"

/**
 * Sync-compatible storage adapter for the core AuthStorage interface.
 *
 * Pattern: pre-hydrate from AsyncStorage at app startup, then
 * serve reads from an in-memory cache (sync). Writes update both
 * the cache and AsyncStorage (fire-and-forget async).
 */

const KNOWN_KEYS = [
  "dorian:access_token",
  "dorian:refresh_token",
  "dorian:device_id",
  "dorian:user",
] as const

class SyncStorage implements AuthStorage {
  private cache = new Map<string, string>()
  private ready = false

  /** Must be called before the auth store is initialized */
  async hydrate(): Promise<void> {
    const pairs = await AsyncStorage.multiGet([...KNOWN_KEYS])
    for (const [key, value] of pairs) {
      if (value != null) {
        this.cache.set(key, value)
      }
    }
    this.ready = true
  }

  get isReady() {
    return this.ready
  }

  getItem(key: string): string | null {
    return this.cache.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value)
    AsyncStorage.setItem(key, value).catch(() => {
      // Fire-and-forget — cache is the source of truth during runtime
    })
  }

  removeItem(key: string): void {
    this.cache.delete(key)
    AsyncStorage.removeItem(key).catch(() => {})
  }
}

export const syncStorage = new SyncStorage()
