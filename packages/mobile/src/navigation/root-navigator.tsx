// packages/mobile/src/navigation/root-navigator.tsx
import React, { useState, useEffect } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { RootStackParamList } from "./types"
import { OnboardingStack } from "./onboarding-stack"
import { MainTabs } from "./main-tabs"

const ONBOARDING_KEY = "hasCompletedOnboarding"

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const [isReady, setIsReady] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasCompleted(value === "true")
      setIsReady(true)
    })
  }, [])

  if (!isReady) return null

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasCompleted ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      )}
    </Stack.Navigator>
  )
}

/** Call this to mark onboarding as complete and navigate to Main */
export async function completeOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true")
}

/** Call this from Settings logout to reset onboarding state */
export async function resetOnboarding() {
  await AsyncStorage.removeItem(ONBOARDING_KEY)
}
