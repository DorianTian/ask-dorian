import { Platform } from "react-native"

/**
 * API base URL.
 *
 * - Production: https://api.askdorian.com
 * - Dev web/iOS simulator: http://localhost:4000
 * - Dev Android emulator: http://10.0.2.2:4000
 * - Dev physical device: use your machine's LAN IP
 */
const DEV_URL = Platform.select({
  android: "http://10.0.2.2:4000",
  default: "http://localhost:4000",
})!

export const API_BASE_URL = __DEV__ ? DEV_URL : "https://api.askdorian.com"
