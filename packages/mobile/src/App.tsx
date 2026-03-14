// packages/mobile/src/App.tsx
import React from "react"
import { Platform, StatusBar } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SWRConfig } from "swr"
import { ThemeProvider } from "./theme"
import { AuthProvider } from "./providers/auth-provider"
import { RootNavigator } from "./navigation/root-navigator"

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
              documentTitle={{ enabled: Platform.OS === "web" }}
            >
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SWRConfig>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
