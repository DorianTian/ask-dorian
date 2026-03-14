/**
 * Web stub for react-native-screens.
 * On web, screens are just regular View containers — no native screen management needed.
 */
import React, { type ReactNode } from "react"
import { View } from "react-native-web"

export function enableScreens() {}
export function enableFreeze() {}
export function screensEnabled() { return true }
export function freezeEnabled() { return false }

export function Screen({ children, style, ...rest }: { children?: ReactNode; style?: object; [key: string]: unknown }) {
  return <View style={[{ flex: 1 }, style]} {...rest}>{children}</View>
}
export const InnerScreen = Screen
export const ScreenContext = React.createContext<unknown>(null)

export function ScreenContainer({ children, style, ...rest }: { children?: ReactNode; style?: object; [key: string]: unknown }) {
  return <View style={[{ flex: 1 }, style]} {...rest}>{children}</View>
}

export function ScreenStack({ children, style, ...rest }: { children?: ReactNode; style?: object; [key: string]: unknown }) {
  return <View style={[{ flex: 1 }, style]} {...rest}>{children}</View>
}

export const ScreenStackItem = Screen

export function ScreenStackHeaderConfig() { return null }
export function ScreenStackHeaderSubview({ children }: { children?: ReactNode }) { return <>{children}</> }
export function ScreenStackHeaderLeftView({ children }: { children?: ReactNode }) { return <>{children}</> }
export function ScreenStackHeaderCenterView({ children }: { children?: ReactNode }) { return <>{children}</> }
export function ScreenStackHeaderRightView({ children }: { children?: ReactNode }) { return <>{children}</> }
export function ScreenStackHeaderBackButtonImage() { return null }
export function ScreenStackHeaderSearchBarView({ children }: { children?: ReactNode }) { return <>{children}</> }
export function SearchBar() { return null }
export function FullWindowOverlay({ children }: { children?: ReactNode }) { return <>{children}</> }

// Fabric stubs
export const NativeScreensModule = {}
