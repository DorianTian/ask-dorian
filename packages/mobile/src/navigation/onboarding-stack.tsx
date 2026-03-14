// packages/mobile/src/navigation/onboarding-stack.tsx
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { OnboardingStackParamList } from "./types"
import { Onboarding1 } from "../screens/onboarding/onboarding1"
import { Onboarding2 } from "../screens/onboarding/onboarding2"
import { Onboarding3 } from "../screens/onboarding/onboarding3"
import { Onboarding4 } from "../screens/onboarding/onboarding4"

const Stack = createNativeStackNavigator<OnboardingStackParamList>()

export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Onboarding4" component={Onboarding4} />
    </Stack.Navigator>
  )
}
