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
