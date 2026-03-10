import React, { createContext, useContext } from "react"
import { useColorScheme } from "react-native"
import { lightColors, darkColors, type Colors } from "./colors"

export { spacing, typography, radii } from "./spacing"
export { lightColors, darkColors } from "./colors"
export type { Colors } from "./colors"

// ---------------------------------------------------------------------------
// Theme Context
// ---------------------------------------------------------------------------

const ColorContext = createContext<Colors>(lightColors)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme()
  const colors = scheme === "dark" ? darkColors : lightColors

  return React.createElement(ColorContext.Provider, { value: colors }, children)
}

export function useColors(): Colors {
  return useContext(ColorContext)
}
