// packages/mobile/src/navigation/root-navigator.tsx
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import { OnboardingStack } from './onboarding-stack';
import { MainTabs } from './main-tabs';
import { LoginScreen } from '../screens/login-screen';
import { useAuth } from '../providers/auth-provider';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Module-level setter — allows completeOnboarding/resetOnboarding to trigger re-render
let _setHasCompleted: ((v: boolean) => void) | null = null;

export function RootNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  // Expose setter to module-level so exported functions can trigger re-render
  _setHasCompleted = setHasCompleted;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasCompleted(value === 'true');
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  // Three-state navigation:
  // 1. Onboarding not done → OnboardingStack
  // 2. Onboarding done but not authenticated → LoginScreen
  // 3. Authenticated → MainTabs
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompleted ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

/** Mark onboarding as complete → transitions to Login screen */
export async function completeOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  _setHasCompleted?.(true);
}

/** Reset onboarding state → transitions back to OnboardingStack */
export async function resetOnboarding() {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
  _setHasCompleted?.(false);
}
