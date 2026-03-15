import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "./types"
import { LoginScreen } from "../screens/auth/login-screen"
import { RegisterScreen } from "../screens/auth/register-screen"

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}
