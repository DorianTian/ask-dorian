import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { RootStackParamList } from "./types"
import { useAuth } from "../providers/auth-provider"
import { AuthStack } from "./auth-stack"
import { MainTabs } from "./main-tabs"

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  )
}
