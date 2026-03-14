/**
 * Shim that re-exports everything from react-native-web
 * and adds missing native-only APIs as no-ops.
 *
 * This allows libraries like react-native-screens and
 * react-native-safe-area-context to import from "react-native"
 * without build errors in Vite web preview.
 */

// Re-export everything from react-native-web
export * from "react-native-web"

// --- Missing named exports that native RN modules expect ---

/** Stub TurboModuleRegistry (used by react-native-screens fabric) */
export const TurboModuleRegistry = {
  getEnforcing: (_name: string) => ({}),
  get: (_name: string) => null,
}

/** Stub codegenNativeComponent (used by fabric native components) */
export function codegenNativeComponent<T>(
  _name: string,
  _options?: Record<string, unknown>,
): T {
  // Return a basic View-like component placeholder
  const { View } = require("react-native-web")
  return View as unknown as T
}

/** Stub codegenNativeCommands */
export function codegenNativeCommands<T>(_options: {
  supportedCommands: string[]
}): T {
  return new Proxy({} as T, {
    get: () => () => {},
  })
}
