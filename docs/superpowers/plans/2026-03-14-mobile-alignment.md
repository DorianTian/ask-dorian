# Mobile Package Full Alignment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pixel-perfect align mobile package with reference project — 9 file deletions, 7 new screens, navigation restructure, onboarding flow.

**Architecture:** Delete unused screens/components, restructure navigation to 5-tab layout with center FAB, replace auth with onboarding flow, create 3 main screens + 4 onboarding screens. All styles are pixel-perfect conversions from Tailwind to RN StyleSheet using the mapping tables in the spec.

**Tech Stack:** React Native, React Navigation (bottom tabs + native stack), Zustand, SWR, lucide-react-native, AsyncStorage.

**Spec:** `docs/superpowers/specs/2026-03-14-mobile-alignment-design.md`

**Reference project:** `~/Downloads/ask-dorian-mobile/src/components/`

**CRITICAL:** Every Tailwind class in the reference must be converted to exact RN values per the spec's mapping tables. No approximations.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| DELETE | `packages/mobile/src/screens/auth/login-screen.tsx` | Replaced by onboarding |
| DELETE | `packages/mobile/src/screens/auth/register-screen.tsx` | Replaced by onboarding |
| DELETE | `packages/mobile/src/screens/inbox-screen.tsx` | Not in reference |
| DELETE | `packages/mobile/src/screens/projects-screen.tsx` | Not in reference |
| DELETE | `packages/mobile/src/screens/review-screen.tsx` | Replaced by weekly-screen |
| DELETE | `packages/mobile/src/components/fragment-card.tsx` | No consumers |
| DELETE | `packages/mobile/src/components/task-item.tsx` | No consumers |
| DELETE | `packages/mobile/src/components/event-item.tsx` | No consumers |
| DELETE | `packages/mobile/src/components/empty-state.tsx` | No consumers |
| EDIT | `packages/mobile/src/navigation/types.ts` | New ParamLists |
| CREATE | `packages/mobile/src/navigation/onboarding-stack.tsx` | Onboarding 1→2→3→4 |
| DELETE | `packages/mobile/src/navigation/auth-stack.tsx` | Replaced by onboarding-stack |
| EDIT | `packages/mobile/src/navigation/root-navigator.tsx` | hasCompletedOnboarding logic |
| EDIT | `packages/mobile/src/navigation/main-tabs.tsx` | 5 tabs + custom tabBar + FAB |
| EDIT | `packages/mobile/src/App.tsx` | Linking config + StatusBar |
| CREATE | `packages/mobile/src/screens/onboarding/onboarding1.tsx` | Welcome page |
| CREATE | `packages/mobile/src/screens/onboarding/onboarding2.tsx` | Fragment philosophy |
| CREATE | `packages/mobile/src/screens/onboarding/onboarding3.tsx` | Magic processing demo |
| CREATE | `packages/mobile/src/screens/onboarding/onboarding4.tsx` | Calendar connect |
| CREATE | `packages/mobile/src/screens/daily-review-screen.tsx` | Card-based fragment review |
| CREATE | `packages/mobile/src/screens/knowledge-screen.tsx` | Knowledge library |
| CREATE | `packages/mobile/src/screens/settings-screen.tsx` | User settings + logout |
| EDIT | `docs/architecture/technical-architecture.md` | Update mobile section |

---

## Chunk 1: Cleanup + Navigation Infrastructure

### Task 1: Delete Old Files

- [ ] **Step 1: Delete 9 unused files**

```bash
cd packages/mobile/src
rm screens/auth/login-screen.tsx
rm screens/auth/register-screen.tsx
rm screens/inbox-screen.tsx
rm screens/projects-screen.tsx
rm screens/review-screen.tsx
rm components/fragment-card.tsx
rm components/task-item.tsx
rm components/event-item.tsx
rm components/empty-state.tsx
rm navigation/auth-stack.tsx
```

- [ ] **Step 2: Remove empty auth directory**

```bash
rmdir packages/mobile/src/screens/auth
```

- [ ] **Step 3: Commit**

```bash
git add -u packages/mobile/src/
git commit -m "chore(mobile): delete unused screens and components

Remove files not present in reference project:
- auth screens (login, register) — replaced by onboarding
- inbox, projects, review screens — not in reference
- fragment-card, task-item, event-item, empty-state — no consumers
- auth-stack navigation — replaced by onboarding-stack"
```

---

### Task 2: Update Navigation Types

**Files:**
- Modify: `packages/mobile/src/navigation/types.ts`

- [ ] **Step 1: Rewrite types.ts with new ParamLists**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/navigation/types.ts
git commit -m "refactor(mobile): update navigation types for new tab + onboarding structure"
```

---

### Task 3: Create Onboarding Stack

**Files:**
- Create: `packages/mobile/src/navigation/onboarding-stack.tsx`

- [ ] **Step 1: Create onboarding-stack.tsx**

```typescript
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
```

Note: The onboarding screen files don't exist yet — they'll be created in Chunk 3. This file will have TS errors until then. That's expected.

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/navigation/onboarding-stack.tsx
git commit -m "feat(mobile): add onboarding navigation stack"
```

---

### Task 4: Update Root Navigator

**Files:**
- Modify: `packages/mobile/src/navigation/root-navigator.tsx`

- [ ] **Step 1: Rewrite root-navigator.tsx with onboarding state**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/navigation/root-navigator.tsx
git commit -m "feat(mobile): switch root navigator to onboarding state machine"
```

---

### Task 5: Update Main Tabs with Custom TabBar + FAB

**Files:**
- Modify: `packages/mobile/src/navigation/main-tabs.tsx`

Reference: `~/Downloads/ask-dorian-mobile/src/components/BottomNav.tsx`

- [ ] **Step 1: Rewrite main-tabs.tsx**

```typescript
// packages/mobile/src/navigation/main-tabs.tsx
import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native"
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Home,
  CalendarCheck,
  Plus,
  BookOpen,
  Settings as SettingsIcon,
} from "lucide-react-native"
import type { MainTabParamList } from "./types"
import { useColors } from "../theme"
import { TodayScreen } from "../screens/today-screen"
import { WeeklyScreen } from "../screens/weekly-screen"
import { DailyReviewScreen } from "../screens/daily-review-screen"
import { KnowledgeScreen } from "../screens/knowledge-screen"
import { SettingsScreen } from "../screens/settings-screen"

const Tab = createBottomTabNavigator<MainTabParamList>()

const TAB_ICONS: Record<string, typeof Home> = {
  Today: Home,
  Review: CalendarCheck,
  Library: BookOpen,
  Settings: SettingsIcon,
}

const TAB_LABELS: Record<string, string> = {
  Today: "Today",
  Review: "Review",
  Library: "Library",
  Settings: "Settings",
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        s.tabBar,
        {
          backgroundColor: colors.background + "CC", // bg-bg/80
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || 12,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index

        if (route.name === "DailyReview") {
          return (
            <View key={route.key} style={s.fabContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate(route.name)}
                style={[s.fab, { backgroundColor: colors.brandFrom }]}
                activeOpacity={0.8}
              >
                <Plus size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )
        }

        const IconComponent = TAB_ICONS[route.name]
        const label = TAB_LABELS[route.name]
        const color = isFocused ? colors.brandFrom : colors.mutedForeground

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={s.tabItem}
            activeOpacity={0.7}
          >
            {IconComponent && <IconComponent size={20} color={color} />}
            <Text
              style={[
                s.tabLabel,
                { color },
                isFocused && { color: colors.brandFrom },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Review" component={WeeklyScreen} />
      <Tab.Screen name="DailyReview" component={DailyReviewScreen} />
      <Tab.Screen name="Library" component={KnowledgeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

const s = StyleSheet.create({
  // Reference: BottomNav h-20 = 80px, bg-bg/80 backdrop-blur, border-t border-border
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 80,
    paddingHorizontal: 16, // px-4
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4, // gap-1
  },
  // Reference: text-[10px] font-bold uppercase tracking-tighter
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: -0.5, // tracking-tighter
  },
  fabContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Reference: size-14 = 56x56, rounded-full, shadow-xl shadow-primary/40
  fab: {
    position: "relative",
    top: -24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
})
```

Note: `DailyReviewScreen`, `KnowledgeScreen`, `SettingsScreen` don't exist yet — TS errors expected until Chunk 4.

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/navigation/main-tabs.tsx
git commit -m "feat(mobile): rewrite main tabs with custom tab bar and center FAB"
```

---

### Task 6: Update App.tsx

**Files:**
- Modify: `packages/mobile/src/App.tsx`

- [ ] **Step 1: Rewrite App.tsx**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/App.tsx
git commit -m "feat(mobile): update App linking config and StatusBar for dark theme"
```

---

## Chunk 2: Onboarding Screens

### Task 7: Onboarding1 — Welcome

**Files:**
- Create: `packages/mobile/src/screens/onboarding/onboarding1.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/Onboarding1.tsx`

- [ ] **Step 1: Create onboarding1.tsx**

Pixel-perfect conversion of reference. Every value from spec mapping tables.

```typescript
// packages/mobile/src/screens/onboarding/onboarding1.tsx
import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export function Onboarding1() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding1">["navigation"]>()

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Glow circles — simulating radial-gradient with large translucent Views */}
      <View style={[s.glowTopRight, { backgroundColor: colors.brandFrom + "1A" }]} />
      <View style={[s.glowBottomLeft, { backgroundColor: colors.brandFrom + "0D" }]} />

      {/* Hero image area */}
      <View style={s.heroArea}>
        <View style={s.heroImageContainer}>
          <Image
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV7YHrBhDXl_g_PzH72vJlg0WiQdvfJ597Q9MMQIwnmpeSQjoWi53y2Vg_lNLwSPgYDvtY_YjxqUmyWv0Tn23iz6scMCUr_B1KV-2duHZpBvjrKpwKS38oOPb_b67gLo1k5VqXKAVw3ymksFwNuRDykRM0dtGMc3_AAc_grrJ4LHEA4IaX_BapAG7dttm9rXKvifQRtDOiFyZJrgld72Vi7ynm_Ymy6gShNwIiuiXMqWS3cel1mtXZ0TK4dBNRdJIoexebuV94AzU" }}
            style={s.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Bottom content */}
      <View style={s.bottomContent}>
        {/* Step badge — px-3 py-1 rounded-full bg-primary/10 border border-primary/20 */}
        <View style={[s.stepBadge, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" }]}>
          <Text style={[s.stepBadgeText, { color: colors.brandFrom }]}>Step 01</Text>
        </View>

        {/* Title — text-4xl font-bold tracking-tight text-white mb-4 */}
        <Text style={[s.title, { color: "#FFFFFF" }]}>Ask Dorian.</Text>

        {/* Subtitle — text-xl text-slate-400 font-light leading-relaxed */}
        <Text style={s.subtitle}>
          Stop losing{" "}
          <Text style={{ color: colors.brandFrom, fontWeight: "500" }}>fragments</Text>
          {" "}of your brilliance.
        </Text>

        {/* Description — text-sm text-slate-500 mb-10 */}
        <Text style={s.description}>
          Every thought, captured and crystallized into a structured knowledge base. Your second brain, refined.
        </Text>

        {/* CTA */}
        <TouchableOpacity
          style={[s.ctaButton, { backgroundColor: colors.brandFrom }]}
          onPress={() => navigation.navigate("Onboarding2")}
          activeOpacity={0.8}
        >
          <Text style={s.ctaText}>Get Started</Text>
        </TouchableOpacity>

        {/* Progress dots — bar + 2 dots */}
        <View style={s.progressDots}>
          <View style={[s.progressBar, { backgroundColor: colors.brandFrom }]} />
          <View style={[s.progressDot, { backgroundColor: "#334155" }]} />
          <View style={[s.progressDot, { backgroundColor: "#334155" }]} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  // top-[-10%] right-[-10%] w-64 h-64 (256x256) bg-primary/10 rounded-full blur-[100px]
  glowTopRight: {
    position: "absolute",
    top: "-10%",
    right: "-10%",
    width: 256,
    height: 256,
    borderRadius: 128,
    opacity: 0.6,
  },
  // bottom-[-5%] left-[-5%] w-80 h-80 (320x320) bg-primary/5
  glowBottomLeft: {
    position: "absolute",
    bottom: "-5%",
    left: "-5%",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.6,
  },
  // flex-grow flex items-center justify-center px-12 pt-12
  heroArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48, // px-12
    paddingTop: 48,
  },
  // w-full aspect-square max-w-[280px]
  heroImageContainer: {
    width: 280,
    height: 280,
    borderRadius: 24, // rounded-3xl
    overflow: "hidden",
  },
  // opacity-40 mix-blend-overlay — we approximate with opacity
  heroImage: {
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  // px-8 pb-safe flex-col items-center text-center
  bottomContent: {
    paddingHorizontal: 32, // px-8
    alignItems: "center",
  },
  // px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 16,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  // text-4xl font-bold tracking-tight mb-4
  title: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.9, // tracking-tight ≈ -0.025 * 36
    marginBottom: 16,
  },
  // text-xl text-slate-400 font-light leading-relaxed max-w-[280px]
  subtitle: {
    fontSize: 20,
    fontWeight: "300",
    lineHeight: 32.5, // 20 * 1.625
    color: "#94A3B8",
    textAlign: "center",
    maxWidth: 280,
  },
  // text-sm text-slate-500 mb-10 max-w-[300px]
  description: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 40,
    marginTop: 16,
  },
  // w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-primary/25
  ctaButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // flex items-center justify-center space-x-2 mt-4 mb-8
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  // w-8 h-1 rounded-full bg-primary
  progressBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  // w-1.5 h-1.5 rounded-full bg-slate-700
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/screens/onboarding/onboarding1.tsx
git commit -m "feat(mobile): add Onboarding1 welcome screen (pixel-perfect)"
```

---

### Task 8: Onboarding2 — Fragment-First Philosophy

**Files:**
- Create: `packages/mobile/src/screens/onboarding/onboarding2.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/Onboarding2.tsx`

- [ ] **Step 1: Create onboarding2.tsx**

```typescript
// packages/mobile/src/screens/onboarding/onboarding2.tsx
import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowRight, X, Diamond } from "lucide-react-native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { completeOnboarding } from "../../navigation/root-navigator"

export function Onboarding2() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding2">["navigation"]>()

  const handleSkip = async () => {
    await completeOnboarding()
    // Navigation will auto-switch via RootNavigator state
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Background glow */}
      <View style={[s.glowTopRight, { backgroundColor: colors.brandFrom }]} />
      <View style={[s.glowBottomLeft, { backgroundColor: colors.brandFrom }]} />

      {/* Header — X skip + title */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleSkip} style={s.closeBtn} activeOpacity={0.7}>
          <X size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: "#F1F5F9" }]}>Ask Dorian</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero — square image area with Diamond icon */}
      <View style={s.heroArea}>
        <View style={[s.heroSquare, { borderColor: colors.brandFrom + "33" }]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" }}
            style={s.heroImage}
            resizeMode="cover"
          />
          {/* Diamond icon overlay — w-32 h-32 rounded-full bg-primary/20 border border-primary/30 */}
          <View style={[s.diamondCircle, { backgroundColor: colors.brandFrom + "33", borderColor: colors.brandFrom + "4D" }]}>
            <Diamond size={48} color={colors.brandFrom} strokeWidth={1.5} />
          </View>
        </View>
      </View>

      {/* Bottom content */}
      <View style={s.bottomContent}>
        {/* Title — text-3xl font-bold leading-tight mb-4 tracking-tight */}
        <Text style={[s.title, { color: "#F1F5F9" }]}>Fragment-First Philosophy</Text>

        {/* Subtitle — text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-[280px] */}
        <Text style={s.subtitle}>
          Stop losing fragments. Our system{" "}
          <Text style={{ color: colors.brandFrom, fontWeight: "500" }}>auto-converts</Text>
          {" "}every thought into immediate action.
        </Text>

        {/* Progress dots — 4 dots, 2nd is active bar */}
        <View style={s.progressDots}>
          <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
          <View style={[s.progressBar, { backgroundColor: colors.brandFrom }]} />
          <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
          <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[s.ctaButton, { backgroundColor: colors.brandFrom }]}
          onPress={() => navigation.navigate("Onboarding3")}
          activeOpacity={0.8}
        >
          <Text style={s.ctaText}>Continue</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip button */}
        <TouchableOpacity onPress={handleSkip} style={s.skipBtn} activeOpacity={0.7}>
          <Text style={s.skipText}>Skip Intro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  glowTopRight: { position: "absolute", top: "-10%", right: "-10%", width: 256, height: 256, borderRadius: 128, opacity: 0.15 },
  glowBottomLeft: { position: "absolute", bottom: "-5%", left: "-5%", width: 320, height: 320, borderRadius: 160, opacity: 0.05 },
  // flex items-center p-4 justify-between
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  closeBtn: { padding: 8 },
  // text-lg font-bold tracking-tight
  headerTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.45 },
  // px-6 py-4 flex-grow flex-col justify-center
  heroArea: { flex: 1, paddingHorizontal: 24, paddingVertical: 16, justifyContent: "center", alignItems: "center" },
  // w-full aspect-square rounded-3xl overflow-hidden border border-primary/20
  heroSquare: { width: "100%", aspectRatio: 1, borderRadius: 24, overflow: "hidden", borderWidth: 1, alignItems: "center", justifyContent: "center" },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  // w-32 h-32 (128x128) rounded-full bg-primary/20 border border-primary/30
  diamondCircle: { width: 128, height: 128, borderRadius: 64, borderWidth: 1, alignItems: "center", justifyContent: "center", zIndex: 10 },
  // px-8 pb-safe flex-col items-center text-center
  bottomContent: { paddingHorizontal: 32, alignItems: "center" },
  // text-3xl font-bold leading-tight mb-4 tracking-tight
  title: { fontSize: 30, fontWeight: "700", lineHeight: 37.5, marginBottom: 16, letterSpacing: -0.75, textAlign: "center" },
  // text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-[280px]
  subtitle: { fontSize: 18, color: "#94A3B8", fontWeight: "400", lineHeight: 29.25, marginBottom: 40, maxWidth: 280, textAlign: "center" },
  // flex gap-2.5 mb-10
  progressDots: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  // h-1.5 w-1.5 (6x6)
  progressDotSmall: { width: 6, height: 6, borderRadius: 3 },
  // h-1.5 w-8 (32x6)
  progressBar: { width: 32, height: 6, borderRadius: 3 },
  // w-full bg-primary py-4 px-6 rounded-xl shadow-lg
  ctaButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12,
    shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  // mt-4 text-slate-500 font-medium text-sm uppercase tracking-widest
  skipBtn: { marginTop: 16, paddingVertical: 8, marginBottom: 24 },
  skipText: { color: "#64748B", fontWeight: "500", fontSize: 14, textTransform: "uppercase", letterSpacing: 1.6 },
})
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/screens/onboarding/onboarding2.tsx
git commit -m "feat(mobile): add Onboarding2 fragment-first philosophy screen"
```

---

### Task 9: Onboarding3 — Magic Processing

**Files:**
- Create: `packages/mobile/src/screens/onboarding/onboarding3.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/Onboarding3.tsx`

- [ ] **Step 1: Create onboarding3.tsx**

```typescript
// packages/mobile/src/screens/onboarding/onboarding3.tsx
import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, ArrowRight, BrainCircuit, Calendar, User, CheckCircle2 } from "lucide-react-native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { completeOnboarding } from "../../navigation/root-navigator"

const mono = Platform.select({ ios: { fontFamily: "Menlo" as const }, android: { fontFamily: "monospace" as const } })

export function Onboarding3() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding3">["navigation"]>()

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Header — back + title */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: "#F1F5F9" }]}>First Value</Text>
      </View>

      {/* Progress dots — 3rd active */}
      <View style={s.progressDots}>
        <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
        <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
        <View style={[s.progressBar, { backgroundColor: colors.brandFrom }]} />
      </View>

      {/* Title area — px-6 text-center */}
      <View style={s.titleArea}>
        <Text style={[s.title, { color: "#F1F5F9" }]}>Magic Processing</Text>
        <Text style={s.titleDesc}>See how we turn messy notes into organized tasks in seconds.</Text>
      </View>

      {/* Demo card — mx-6 p-6 rounded-xl bg-primary/5 border border-primary/20 */}
      <View style={[s.demoCard, { backgroundColor: colors.brandFrom + "0D", borderColor: colors.brandFrom + "33" }]}>
        {/* Glow circles inside card */}
        <View style={[s.cardGlowBottom, { backgroundColor: colors.brandFrom }]} />
        <View style={[s.cardGlowTop, { backgroundColor: colors.brandFrom }]} />

        {/* Input section */}
        <View style={s.inputSection}>
          <Text style={[s.sectionLabel, { color: colors.brandFrom }]}>Input Note</Text>
          <View style={[s.inputCard, { backgroundColor: "#1E293B", borderColor: "#334155" }]}>
            <Text style={[s.inputText, { color: "#E2E8F0" }]}>"Meeting with Sarah at 4pm about UI"</Text>
          </View>
        </View>

        {/* AI thinking indicator */}
        <View style={s.aiIndicator}>
          <View style={[s.aiLine, { backgroundColor: colors.brandFrom }]} />
          <View style={[s.aiPill, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "4D" }]}>
            <BrainCircuit size={16} color={colors.brandFrom} />
            <Text style={[s.aiText, { color: colors.brandFrom }]}>AI is thinking...</Text>
          </View>
          <View style={[s.aiLine, { backgroundColor: colors.brandFrom }]} />
        </View>

        {/* Output section */}
        <View style={s.outputSection}>
          <Text style={[s.sectionLabel, { color: colors.brandFrom }]}>Structured Task</Text>
          <View style={[s.outputCard, { backgroundColor: "#1E293B", borderColor: "#334155", borderLeftColor: colors.brandFrom }]}>
            <View style={s.outputHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[s.outputTitle, { color: "#F1F5F9" }]}>UI Review Meeting</Text>
                <View style={s.outputDetail}>
                  <Calendar size={12} color="#94A3B8" />
                  <Text style={s.outputDetailText}>Today, 4:00 PM</Text>
                </View>
                <View style={s.outputDetail}>
                  <User size={12} color="#94A3B8" />
                  <Text style={s.outputDetailText}>Sarah</Text>
                </View>
              </View>
              <View style={[s.checkBadge, { backgroundColor: colors.brandFrom + "1A" }]}>
                <CheckCircle2 size={16} color={colors.brandFrom} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={s.bottomButtons}>
        <TouchableOpacity
          style={[s.ctaButton, { backgroundColor: colors.brandFrom }]}
          onPress={() => navigation.navigate("Onboarding4")}
          activeOpacity={0.8}
        >
          <Text style={s.ctaText}>Continue</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => { await completeOnboarding() }}
          style={s.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  // p-4 pb-2
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  // text-lg font-bold tracking-tight flex-1 text-center pr-12
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", letterSpacing: -0.45, paddingRight: 48 },
  // flex-row items-center justify-center gap-3 py-5
  progressDots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 20 },
  progressDotSmall: { width: 8, height: 8, borderRadius: 4 },
  progressBar: { width: 32, height: 8, borderRadius: 4 },
  // px-6 text-center
  titleArea: { paddingHorizontal: 24, alignItems: "center" },
  // text-2xl font-bold leading-tight pb-2 pt-5
  title: { fontSize: 24, fontWeight: "700", lineHeight: 30, paddingBottom: 8, paddingTop: 20, textAlign: "center" },
  // text-base text-slate-400 font-normal leading-normal pb-6
  titleDesc: { fontSize: 16, color: "#94A3B8", fontWeight: "400", lineHeight: 24, paddingBottom: 24, textAlign: "center" },
  // mx-6 p-6 rounded-xl overflow-hidden
  demoCard: { marginHorizontal: 24, padding: 24, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  // absolute -bottom-12 -right-12 w-32 h-32 opacity-20
  cardGlowBottom: { position: "absolute", bottom: -48, right: -48, width: 128, height: 128, borderRadius: 64, opacity: 0.2 },
  cardGlowTop: { position: "absolute", top: -48, left: -48, width: 128, height: 128, borderRadius: 64, opacity: 0.1 },
  // mb-8
  inputSection: { marginBottom: 32 },
  // text-xs font-bold tracking-widest uppercase mb-3
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 },
  // bg-slate-800 p-4 rounded-lg border border-slate-700
  inputCard: { padding: 16, borderRadius: 8, borderWidth: 1 },
  // italic
  inputText: { fontStyle: "italic", fontSize: 14 },
  // flex-col items-center justify-center py-4
  aiIndicator: { alignItems: "center", paddingVertical: 16 },
  // w-px h-8 — vertical line
  aiLine: { width: 1, height: 32, opacity: 0.5 },
  // flex-row items-center gap-2 px-4 py-2 rounded-full border
  aiPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, marginVertical: 8 },
  // text-xs font-medium
  aiText: { fontSize: 12, fontWeight: "500" },
  // mt-4
  outputSection: { marginTop: 16 },
  // p-4 rounded-lg border border-slate-700 border-l-4 border-l-primary
  outputCard: { padding: 16, borderRadius: 8, borderWidth: 1, borderLeftWidth: 4 },
  // flex-row items-start justify-between
  outputHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  // text-base font-bold
  outputTitle: { fontSize: 16, fontWeight: "700" },
  // flex-row items-center gap-2 mt-2
  outputDetail: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  // text-xs text-slate-400
  outputDetailText: { fontSize: 12, color: "#94A3B8" },
  // bg-primary/10 p-1 rounded
  checkBadge: { padding: 4, borderRadius: 4 },
  // mt-auto p-6 pb-safe gap-4
  bottomButtons: { marginTop: "auto", padding: 24, gap: 16 },
  // w-full bg-primary py-4 rounded-xl shadow-lg flex-row items-center justify-center gap-2
  ctaButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 12,
    shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  // text-slate-400 font-medium py-2 text-sm text-center
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { color: "#94A3B8", fontWeight: "500", fontSize: 14 },
})
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/screens/onboarding/onboarding3.tsx
git commit -m "feat(mobile): add Onboarding3 magic processing demo screen"
```

---

### Task 10: Onboarding4 — You're all set

**Files:**
- Create: `packages/mobile/src/screens/onboarding/onboarding4.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/Onboarding4.tsx`

- [ ] **Step 1: Create onboarding4.tsx**

```typescript
// packages/mobile/src/screens/onboarding/onboarding4.tsx
import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, CheckCircle, Calendar as CalendarIcon } from "lucide-react-native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { completeOnboarding } from "../../navigation/root-navigator"

export function Onboarding4() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding4">["navigation"]>()

  const handleComplete = async () => {
    await completeOnboarding()
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Background glow */}
      <View style={[s.glowTop, { backgroundColor: colors.brandFrom }]} />
      <View style={[s.glowBottomLeft, { backgroundColor: colors.brandFrom }]} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <Text style={s.headerLabel}>Step 3 of 3</Text>
      </View>

      {/* Main content */}
      <View style={s.mainContent}>
        {/* CheckCircle icon with glow — size-24 (96x96) */}
        <View style={s.iconArea}>
          <View style={[s.iconGlow, { backgroundColor: colors.brandFrom }]} />
          <View style={[s.iconCircle, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "4D" }]}>
            <CheckCircle size={48} color={colors.brandFrom} />
          </View>
        </View>

        {/* Title — text-4xl font-bold leading-tight mb-4 */}
        <Text style={[s.title, { color: "#F1F5F9" }]}>You're all set!</Text>
        <Text style={s.subtitle}>
          Your account has been created. Connect your calendar to start synchronizing your schedule.
        </Text>

        {/* Calendar card — bg-white/5 border border-white/10 rounded-xl p-6 */}
        <View style={[s.calendarCard, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}>
          {/* Calendar image area */}
          <View style={s.calendarImageArea}>
            <Image
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSJLo5XjV9qBXgEZa4tiVFBq2vhT3dBpM4jGxumZNqa6S3eb6kIPfyBKiJ6_nB-I2sDxFBClSc5RgPqLJau7P3c33KbsKNr02qpCiOjq-SrBfbFuUYrm8mfwA0YdZFLSdJ0sTfCPT__oSU2T_Jtj3GB5nKlLMztP_7OYgmfagNimV355uiigMZCFrNjnI1FAuWS9H0XXbWKXu2CTySsqYWfyxmLJapkdnhuOhGkyyxEAqO9jgZ_IKY8-ePYtf0vGiI5sV1a3yPSFE" }}
              style={s.calendarImage}
              resizeMode="cover"
            />
            <View style={s.calendarIconOverlay}>
              <View style={[s.calendarIconBg, { borderColor: "rgba(255,255,255,0.1)" }]}>
                <CalendarIcon size={32} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <View style={s.calendarTextArea}>
            <Text style={[s.calendarTitle, { color: "#F1F5F9" }]}>Sync your schedule</Text>
            <Text style={s.calendarDesc}>Keep track of all your appointments in one place and avoid double-booking.</Text>
          </View>

          {/* Connect button — h-14 (56px) */}
          <TouchableOpacity
            style={[s.connectButton, { backgroundColor: colors.brandFrom }]}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <CalendarIcon size={20} color="#FFFFFF" />
            <Text style={s.connectText}>Connect Google Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* Skip button */}
        <TouchableOpacity onPress={handleComplete} style={s.skipBtn} activeOpacity={0.7}>
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  glowTop: { position: "absolute", top: "-20%", left: "25%", width: 256, height: 256, borderRadius: 128, opacity: 0.15 },
  glowBottomLeft: { position: "absolute", bottom: "-10%", left: "-10%", width: 320, height: 320, borderRadius: 160, opacity: 0.08 },
  // p-4 flex-row justify-between
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  // text-xs opacity-60 uppercase tracking-widest — flex-1 text-center pr-12
  headerLabel: { flex: 1, textAlign: "center", paddingRight: 48, fontSize: 12, fontWeight: "700", color: "#F1F5F9", opacity: 0.6, textTransform: "uppercase", letterSpacing: 1.6 },
  // flex-1 flex-col px-6 pt-8 pb-12 items-center text-center
  mainContent: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: "center" },
  // mb-10 relative
  iconArea: { marginBottom: 40, alignItems: "center", justifyContent: "center" },
  // absolute -inset-4 blur-3xl rounded-full opacity-50
  iconGlow: { position: "absolute", width: 128, height: 128, borderRadius: 64, opacity: 0.2 },
  // w-24 h-24 (96x96) rounded-full bg-primary/10 border border-primary/30
  iconCircle: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  // text-4xl font-bold leading-tight mb-4
  title: { fontSize: 36, fontWeight: "700", lineHeight: 45, marginBottom: 16, textAlign: "center" },
  // text-base text-slate-400 font-normal leading-relaxed max-w-xs
  subtitle: { fontSize: 16, color: "#94A3B8", fontWeight: "400", lineHeight: 26, maxWidth: 320, textAlign: "center" },
  // mt-12 w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-6 gap-6
  calendarCard: { marginTop: 48, width: "100%", maxWidth: 380, borderRadius: 12, padding: 24, gap: 24, borderWidth: 1 },
  // w-full aspect-video rounded-lg overflow-hidden
  calendarImageArea: { width: "100%", aspectRatio: 16 / 9, borderRadius: 8, overflow: "hidden" },
  calendarImage: { width: "100%", height: "100%" },
  // absolute inset-0 flex items-center justify-center
  calendarIconOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  // bg-[#121220]/60 p-3 rounded-full border border-white/10
  calendarIconBg: { backgroundColor: "rgba(18,18,32,0.6)", padding: 12, borderRadius: 9999, borderWidth: 1 },
  // flex-col items-center gap-2
  calendarTextArea: { alignItems: "center", gap: 8 },
  // text-lg font-bold
  calendarTitle: { fontSize: 18, fontWeight: "700" },
  // text-sm text-slate-400 leading-normal text-center
  calendarDesc: { fontSize: 14, color: "#94A3B8", lineHeight: 21, textAlign: "center" },
  // w-full flex-row items-center justify-center gap-3 rounded-lg h-14 px-6 bg-primary shadow-lg
  connectButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
    height: 56, borderRadius: 8, paddingHorizontal: 24,
    shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  // text-base font-bold
  connectText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  // mt-auto pt-8 h-12 text-slate-400 font-medium
  skipBtn: { marginTop: "auto", paddingTop: 32, paddingBottom: 24, height: 48, justifyContent: "center" },
  skipText: { color: "#94A3B8", fontSize: 16, fontWeight: "500", textAlign: "center" },
})
```

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/screens/onboarding/onboarding4.tsx
git commit -m "feat(mobile): add Onboarding4 calendar connect screen"
```

---

## Chunk 3: Main Screens

### Task 11: DailyReviewScreen

**Files:**
- Create: `packages/mobile/src/screens/daily-review-screen.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/DailyReview.tsx`

- [ ] **Step 1: Create daily-review-screen.tsx**

Full pixel-perfect conversion. Read reference file at `~/Downloads/ask-dorian-mobile/src/components/DailyReview.tsx` and convert every Tailwind class using the spec mapping tables.

Key reference classes to convert:
- `bg-surface/40 border border-border/50 rounded-2xl p-6` → `{ backgroundColor: "#18181B66", borderColor: "#27272A80", borderRadius: 16, padding: 24, borderWidth: 1 }`
- `text-xl font-bold` → `{ fontSize: 20, fontWeight: "700" }`
- `text-[10px] font-bold uppercase tracking-widest text-primary` → `{ fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.6, color: "#10B981" }`
- `bg-bg/40 rounded-xl p-4 border-l-4 border-primary/40` → `{ backgroundColor: "#09090B66", borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: "#10B98166" }`
- `grid grid-cols-2 gap-4` → `{ flexDirection: "row", gap: 16 }` with `flex: 1` children
- `bg-primary text-white shadow-lg shadow-primary/20` → `{ backgroundColor: "#10B981", shadowColor: "#10B981", shadowOpacity: 0.2 ... }`

The screen must include:
1. Header with "Daily Review" title + "3 items need your attention" + time block badge
2. Main card with pulsing dot, "Pending Task" label, Clock + capture time, title "Review Q3 Marketing Assets", quote block, Discard/Accept buttons
3. Secondary card (opacity-60) with "Knowledge Node" label, title, description preview, "Review Next" link
4. `useState(false)` for `isCompleted` toggle on Accept button with animated check

Since this file requires careful pixel-perfect conversion, the implementer MUST read the reference file and convert every class. The code is too long to include inline — convert line-by-line from reference using the spec's mapping tables.

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd packages/mobile && npx tsc --noEmit 2>&1 | grep daily-review
```

Expected: No errors related to daily-review-screen

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/src/screens/daily-review-screen.tsx
git commit -m "feat(mobile): add DailyReview screen (pixel-perfect from reference)"
```

---

### Task 12: KnowledgeScreen

**Files:**
- Create: `packages/mobile/src/screens/knowledge-screen.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/KnowledgeBase.tsx`

- [ ] **Step 1: Create knowledge-screen.tsx**

Full pixel-perfect conversion. Read reference file at `~/Downloads/ask-dorian-mobile/src/components/KnowledgeBase.tsx`.

Key implementation points:
- `useState<"grid" | "list">("grid")` for view mode toggle
- Grid mode: `FlatList` with `numColumns={2}` and `columnWrapperStyle={{ gap: 24 }}`
- List mode: `FlatList` with `numColumns={1}`
- Search bar: `TextInput` with Search icon left, X clear right
- 3 mock cards matching reference: "Q4 Market Expansion Thesis" (Diamond/Strategy), "Neural Lattice Performance" (FlaskConical/Research), "Legacy System Deprecation" (Archive)
- Two card layouts: grid (vertical) and list (horizontal)
- KnowledgeCard as inline function with `viewMode` prop

Key reference classes:
- `text-3xl font-bold tracking-tight` → `{ fontSize: 30, fontWeight: "700", letterSpacing: -0.75 }`
- `bg-surface/80 border border-border rounded-xl pl-12 pr-12 py-3.5` → `{ backgroundColor: "#18181BCC", borderColor: "#27272A", borderRadius: 12, paddingLeft: 48, paddingRight: 48, paddingVertical: 14, borderWidth: 1 }`
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` → In RN mobile: `numColumns={2}` for grid, `gap: 24`
- Card hover effects → `TouchableOpacity` activeOpacity={0.7}

Since this is a long file, the implementer MUST read the reference and convert every class. Convert line-by-line from reference using spec mapping tables.

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/screens/knowledge-screen.tsx
git commit -m "feat(mobile): add Knowledge Library screen (pixel-perfect from reference)"
```

---

### Task 13: SettingsScreen

**Files:**
- Create: `packages/mobile/src/screens/settings-screen.tsx`
- Reference: `~/Downloads/ask-dorian-mobile/src/components/Settings.tsx`

- [ ] **Step 1: Create settings-screen.tsx**

Full pixel-perfect conversion. Read reference file at `~/Downloads/ask-dorian-mobile/src/components/Settings.tsx`.

Key implementation points:
- User card: Image with external URI (same as reference), fallback gradient View
- Section groups: "Preferences" and "Privacy & Security" headers
- Setting rows: icon (in square bg) + label + ChevronRight, separated by hairline borders
- Log Out button at bottom: red border, LogOut icon
- Log Out calls `resetOnboarding()` from root-navigator

Key reference classes:
- Profile image: `size-20 rounded-full bg-surface border-2 border-primary/20` → `{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: "#10B98133" }`
- Section header: `text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 px-2` → `{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.6, color: "#64748B", marginBottom: 12, paddingHorizontal: 8 }`
- Setting row: `w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-border/50` → `{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#27272A80" }`
- Icon container: `p-2 bg-surface rounded-lg text-slate-400` → `{ padding: 8, backgroundColor: "#18181B", borderRadius: 8 }`
- Log Out: `border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold` → `{ borderWidth: 1, borderColor: "#EF444433", borderRadius: 16 }`

Convert line-by-line from reference using spec mapping tables.

- [ ] **Step 2: Commit**

```bash
git add packages/mobile/src/screens/settings-screen.tsx
git commit -m "feat(mobile): add Settings screen (pixel-perfect from reference)"
```

---

## Chunk 4: Verification + Documentation

### Task 14: TypeScript Verification

- [ ] **Step 1: Run TypeScript check on entire mobile package**

```bash
cd packages/mobile && npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors (or only pre-existing errors unrelated to our changes). Fix any errors before proceeding.

- [ ] **Step 2: Commit any fixes**

```bash
git add -u packages/mobile/
git commit -m "fix(mobile): resolve TypeScript errors from alignment refactor"
```

---

### Task 15: Update Technical Architecture Doc

**Files:**
- Modify: `docs/architecture/technical-architecture.md`

- [ ] **Step 1: Update mobile directory structure (around line 138)**

Replace the mobile section:

```markdown
│   ├── mobile/                 # 移动端（React Native, iOS 优先）
│   │   ├── src/
│   │   │   ├── screens/        # 页面
│   │   │   │   ├── today-screen.tsx          # Daily Telemetry (HUD)
│   │   │   │   ├── weekly-screen.tsx         # Cognitive Report (HUD)
│   │   │   │   ├── daily-review-screen.tsx   # Card-based fragment review
│   │   │   │   ├── knowledge-screen.tsx      # Knowledge Library (search + grid/list)
│   │   │   │   ├── settings-screen.tsx       # User settings + logout
│   │   │   │   └── onboarding/              # 4-step onboarding flow
│   │   │   │       ├── onboarding1.tsx       # Welcome
│   │   │   │       ├── onboarding2.tsx       # Fragment-First Philosophy
│   │   │   │       ├── onboarding3.tsx       # Magic Processing Demo
│   │   │   │       └── onboarding4.tsx       # Calendar Connect
│   │   │   ├── components/     # 共享组件 (QuickCapture)
│   │   │   ├── navigation/     # React Navigation (bottom tabs + stack)
│   │   │   ├── providers/      # Auth provider
│   │   │   ├── theme/          # Design tokens (colors, spacing, typography)
│   │   │   └── lib/            # Config, storage
│   │   └── package.json
```

- [ ] **Step 2: Commit**

```bash
git add docs/architecture/technical-architecture.md
git commit -m "docs: update technical architecture with new mobile screen structure"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Verify all files exist**

```bash
ls -la packages/mobile/src/screens/onboarding/
ls -la packages/mobile/src/screens/daily-review-screen.tsx
ls -la packages/mobile/src/screens/knowledge-screen.tsx
ls -la packages/mobile/src/screens/settings-screen.tsx
```

Expected: All 7 new files exist.

- [ ] **Step 2: Verify deleted files are gone**

```bash
ls packages/mobile/src/screens/auth/ 2>&1
ls packages/mobile/src/screens/inbox-screen.tsx 2>&1
ls packages/mobile/src/screens/projects-screen.tsx 2>&1
ls packages/mobile/src/screens/review-screen.tsx 2>&1
ls packages/mobile/src/components/fragment-card.tsx 2>&1
ls packages/mobile/src/components/task-item.tsx 2>&1
ls packages/mobile/src/components/event-item.tsx 2>&1
ls packages/mobile/src/components/empty-state.tsx 2>&1
```

Expected: All return "No such file or directory".

- [ ] **Step 3: Final TypeScript check**

```bash
cd packages/mobile && npx tsc --noEmit 2>&1 | head -20
```

Expected: Clean or only pre-existing errors.
