import React from "react"
import { Platform, StatusBar } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SWRConfig } from "swr"
import { ThemeProvider } from "./theme"
import { AuthProvider } from "./providers/auth-provider"
import { RootNavigator } from "./navigation/root-navigator"

// URL-based routing for web, deep links for native
const linking = {
  prefixes: [],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
          Register: "register",
        },
      },
      Main: {
        screens: {
          Today: "",
          Inbox: "inbox",
          Weekly: "weekly",
          Projects: "projects",
          Review: "review",
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
            {Platform.OS !== "web" && <StatusBar barStyle="dark-content" />}
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
