// packages/mobile/src/App.tsx
import React from "react"
import { Platform, StatusBar } from "react-native"
import { NavigationContainer, type Theme } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SWRConfig } from "swr"
import { ThemeProvider } from "./theme"
import { AuthProvider } from "./providers/auth-provider"
import { RootNavigator } from "./navigation/root-navigator"

// Dark theme matching our design tokens — removes default card background/border
const navTheme: Theme = {
  dark: true,
  colors: {
    primary: "#10B981",
    background: "#09090B",
    card: "#09090B",
    text: "#F8FAFC",
    border: "transparent",
    notification: "#10B981",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
}

const linking = {
  prefixes: [],
  config: {
    screens: {
      Onboarding: {
        screens: {
          Onboarding1: "onboarding",
          Onboarding2: "onboarding/2",
          Onboarding3: "onboarding/3",
          Onboarding4: "onboarding/4",
        },
      },
      Login: "login",
      Main: {
        screens: {
          Today: "",
          Review: "review",
          DailyReview: "daily-review",
          Library: "library",
          Settings: "settings",
        },
      },
    },
  },
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SWRConfig value={{ revalidateOnFocus: false }}>
          <AuthProvider>
            {Platform.OS !== "web" && (
              <StatusBar barStyle="light-content" backgroundColor="#09090B" />
            )}
            <NavigationContainer
              linking={linking}
              theme={navTheme}
              documentTitle={{
                enabled: Platform.OS === "web",
                formatter: (options, route) =>
                  options?.title ?? route?.name ?? "Ask Dorian",
              }}
            >
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SWRConfig>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
