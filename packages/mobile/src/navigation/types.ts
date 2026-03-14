// packages/mobile/src/navigation/types.ts
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native"

// ---------------------------------------------------------------------------
// Onboarding Stack (replaces AuthStack)
// ---------------------------------------------------------------------------

export type OnboardingStackParamList = {
  Onboarding1: undefined
  Onboarding2: undefined
  Onboarding3: undefined
  Onboarding4: undefined
}

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>

// ---------------------------------------------------------------------------
// Main Tabs
// ---------------------------------------------------------------------------

export type MainTabParamList = {
  Today: undefined
  Review: undefined
  DailyReview: undefined
  Library: undefined
  Settings: undefined
}

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >

// ---------------------------------------------------------------------------
// Root Stack (Onboarding vs Main switch)
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
}
