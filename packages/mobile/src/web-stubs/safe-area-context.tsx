/**
 * Web-compatible stub for react-native-safe-area-context.
 * Provides SafeAreaProvider / SafeAreaView as simple div wrappers
 * with simulated insets for browser environment.
 */
import React, { createContext, useContext, type ReactNode } from "react"
import { View, type ViewProps } from "react-native-web"

interface EdgeInsets {
  top: number
  right: number
  bottom: number
  left: number
}

interface Metrics {
  insets: EdgeInsets
  frame: { x: number; y: number; width: number; height: number }
}

// Simulated safe area insets for web (no notch, no home indicator)
const DEFAULT_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 }
const DEFAULT_METRICS: Metrics = {
  insets: DEFAULT_INSETS,
  frame: { x: 0, y: 0, width: 0, height: 0 },
}

const SafeAreaInsetsContext = createContext<EdgeInsets>(DEFAULT_INSETS)
const SafeAreaFrameContext = createContext<Metrics["frame"]>(DEFAULT_METRICS.frame)

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function SafeAreaView({
  children,
  edges,
  style,
  ...rest
}: ViewProps & { edges?: string[]; children?: ReactNode }) {
  // Apply padding based on requested edges (simulated — always 0 on web)
  return (
    <View style={[{ flex: 1 }, style]} {...rest}>
      {children}
    </View>
  )
}

export function useSafeAreaInsets(): EdgeInsets {
  return useContext(SafeAreaInsetsContext)
}

export function useSafeAreaFrame() {
  return useContext(SafeAreaFrameContext)
}

export function SafeAreaInsetsContext_Provider({
  value,
  children,
}: {
  value: EdgeInsets
  children: ReactNode
}) {
  return (
    <SafeAreaInsetsContext.Provider value={value}>
      {children}
    </SafeAreaInsetsContext.Provider>
  )
}

export const SafeAreaFrameContext_Provider = SafeAreaFrameContext.Provider

// initialWindowMetrics — used by @react-navigation/elements
export const initialWindowMetrics: Metrics = DEFAULT_METRICS

// withSafeAreaInsets HOC stub
export function withSafeAreaInsets<P>(Component: React.ComponentType<P>) {
  return (props: P) => <Component {...(props as any)} insets={DEFAULT_INSETS} />
}

// Re-export context for consumers
export { SafeAreaInsetsContext, SafeAreaFrameContext }
