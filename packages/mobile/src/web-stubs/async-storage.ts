/**
 * Web-compatible AsyncStorage using localStorage.
 * Drop-in replacement for @react-native-async-storage/async-storage.
 */
const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    } catch {
      // storage full or unavailable
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  },
  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage)
    } catch {
      return []
    }
  },
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map((key) => [key, localStorage.getItem(key)])
  },
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => localStorage.setItem(key, value))
  },
  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach((key) => localStorage.removeItem(key))
  },
}

export default AsyncStorage
