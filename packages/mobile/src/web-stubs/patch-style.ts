/**
 * Suppress react-native-web 0.19.x + React 19 CSSStyleDeclaration error.
 *
 * RNW produces style objects with numeric indexed keys that React 19 tries
 * to set on CSSStyleDeclaration, which isn't supported. This is cosmetic —
 * the styles still apply correctly, but the error floods the console.
 *
 * Import this BEFORE react-native-web.
 */
if (typeof window !== "undefined") {
  const origConsoleError = console.error
  console.error = function (...args: unknown[]) {
    const msg = typeof args[0] === "string" ? args[0] : ""
    // Suppress known RNW style errors
    if (msg.includes("CSSStyleDeclaration") && msg.includes("Indexed property")) {
      return
    }
    return origConsoleError.apply(console, args)
  }

  // Also catch the uncaught version
  window.addEventListener("error", (e) => {
    if (
      e.message?.includes("CSSStyleDeclaration") &&
      e.message?.includes("Indexed property")
    ) {
      e.preventDefault()
    }
  })
}

export {}
