import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  Sun,
  Inbox,
  Calendar,
  FolderOpen,
  RotateCcw,
} from "lucide-react-native"
import type { MainTabParamList } from "./types"
import { useColors } from "../theme"
import { TodayScreen } from "../screens/today-screen"
import { InboxScreen } from "../screens/inbox-screen"
import { WeeklyScreen } from "../screens/weekly-screen"
import { ProjectsScreen } from "../screens/projects-screen"
import { ReviewScreen } from "../screens/review-screen"

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTabs() {
  const colors = useColors()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandFrom,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: "Today",
          tabBarIcon: ({ color, size }) => <Sun size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarLabel: "Inbox",
          tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Weekly"
        component={WeeklyScreen}
        options={{
          tabBarLabel: "Weekly",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: "Projects",
          tabBarIcon: ({ color, size }) => (
            <FolderOpen size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          tabBarLabel: "Review",
          tabBarIcon: ({ color, size }) => (
            <RotateCcw size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
