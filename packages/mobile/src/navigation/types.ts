import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native"

// ---------------------------------------------------------------------------
// Auth Stack
// ---------------------------------------------------------------------------

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>

// ---------------------------------------------------------------------------
// Main Tabs
// ---------------------------------------------------------------------------

export type MainTabParamList = {
  Today: undefined
  Inbox: undefined
  Weekly: undefined
  Projects: undefined
  Review: undefined
}

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >

// ---------------------------------------------------------------------------
// Root Stack (Auth vs Main switch)
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
}
