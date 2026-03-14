import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { lightColors, darkColors, type Colors } from "./colors"

export { spacing, typography, radii } from "./spacing"
export { lightColors, darkColors } from "./colors"
export type { Colors } from "./colors"

// ---------------------------------------------------------------------------
// Theme Context
// ---------------------------------------------------------------------------

type ThemeMode = "light" | "dark" | "system"

interface ThemeContextValue {
  colors: Colors
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
}

const THEME_KEY = "themeMode"

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  mode: "dark",
  isDark: true,
  setMode: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>("dark")
  const [isReady, setIsReady] = useState(false)

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved)
      }
      setIsReady(true)
    })
  }, [])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    AsyncStorage.setItem(THEME_KEY, newMode)
  }, [])

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme !== "light")
  const colors = isDark ? darkColors : lightColors

  const value: ThemeContextValue = { colors, mode, isDark, setMode }

  // Don't render until preference is loaded (avoids flash)
  if (!isReady) return null

  return React.createElement(ThemeContext.Provider, { value }, children)
}

export function useColors(): Colors {
  return useContext(ThemeContext).colors
}

export function useTheme() {
  return useContext(ThemeContext)
}
