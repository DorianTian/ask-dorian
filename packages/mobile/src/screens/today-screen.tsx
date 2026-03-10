import React, { useCallback } from "react"
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { format } from "date-fns"
import { useSWRConfig } from "swr"
import { AlertTriangle, Sun } from "lucide-react-native"
import { useTodayDashboard } from "@ask-dorian/core/hooks"
import { fragmentApi, taskApi } from "@ask-dorian/core/api"
import type { Fragment, Task, CalendarEvent } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii } from "../theme"
import { FragmentCard } from "../components/fragment-card"
import { TaskItem } from "../components/task-item"
import { EventItem } from "../components/event-item"
import { QuickCapture } from "../components/quick-capture"
import { EmptyState } from "../components/empty-state"

type SectionData =
  | { type: "capture" }
  | { type: "fragment"; item: Fragment }
  | { type: "task"; item: Task }
  | { type: "event"; item: CalendarEvent }

export function TodayScreen() {
  const colors = useColors()
  const { data, error, isLoading, mutate: mutateDashboard } = useTodayDashboard()
  const { mutate } = useSWRConfig()

  const handleConfirmFragment = useCallback(async (id: string) => {
    await fragmentApi.confirm(id)
    mutateDashboard()
    mutate((key: string) => typeof key === "string" && key.includes("/fragments"))
  }, [mutateDashboard, mutate])

  const handleRejectFragment = useCallback(async (id: string) => {
    await fragmentApi.reject(id)
    mutateDashboard()
    mutate((key: string) => typeof key === "string" && key.includes("/fragments"))
  }, [mutateDashboard, mutate])

  const handleCompleteTask = useCallback(async (id: string) => {
    await taskApi.complete(id)
    mutateDashboard()
    mutate((key: string) => typeof key === "string" && key.includes("/tasks"))
  }, [mutateDashboard, mutate])

  // Build sections
  const sections: { title: string; data: SectionData[] }[] = []

  // Quick capture (always first)
  sections.push({ title: "CAPTURE", data: [{ type: "capture" }] })

  if (data) {
    // Pending fragments
    if (data.pendingFragments.length > 0) {
      sections.push({
        title: `Pending Fragments (${data.pendingFragments.length})`,
        data: data.pendingFragments.map((f) => ({ type: "fragment" as const, item: f })),
      })
    }

    // Today's tasks
    const allTasks = [...data.tasks.overdue, ...data.tasks.scheduled]
    if (allTasks.length > 0) {
      sections.push({
        title: `Tasks (${allTasks.length})`,
        data: allTasks.map((t) => ({ type: "task" as const, item: t })),
      })
    }

    // Today's events
    if (data.events.length > 0) {
      sections.push({
        title: `Events (${data.events.length})`,
        data: data.events.map((e) => ({ type: "event" as const, item: e })),
      })
    }
  }

  // Show empty state if no data after loading
  if (!isLoading && data && sections.length <= 1) {
    sections.push({
      title: "ALL_CLEAR",
      data: [{ type: "capture" }], // placeholder for empty state render
    })
  }

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={s.errorBox}>
          <AlertTriangle size={24} color={colors.destructive} />
          <Text style={[s.errorText, { color: colors.destructive }]}>
            {error.message ?? "Failed to load dashboard"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Today</Text>
        <Text style={[s.headerDate, { color: colors.mutedForeground }]}>
          {format(new Date(), "EEEE, MMM d")}
        </Text>
      </View>

      {isLoading && !data ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandFrom} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => {
            if (item.type === "capture") return `capture-${index}`
            return item.item.id
          }}
          renderSectionHeader={({ section }) => {
            if (section.title === "CAPTURE" || section.title === "ALL_CLEAR") return null
            return (
              <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>
                {section.title}
              </Text>
            )
          }}
          renderItem={({ item, section }) => {
            if (section.title === "ALL_CLEAR") {
              return (
                <EmptyState
                  icon={<Sun size={32} color={colors.brandFrom} />}
                  title="All clear for today!"
                  subtitle="Capture a fragment to get started"
                />
              )
            }
            switch (item.type) {
              case "capture":
                return (
                  <View style={s.captureWrapper}>
                    <QuickCapture />
                  </View>
                )
              case "fragment":
                return (
                  <View style={s.itemWrapper}>
                    <FragmentCard
                      fragment={item.item}
                      onConfirm={handleConfirmFragment}
                      onReject={handleRejectFragment}
                    />
                  </View>
                )
              case "task":
                return (
                  <View style={s.itemWrapper}>
                    <TaskItem task={item.item} onComplete={handleCompleteTask} />
                  </View>
                )
              case "event":
                return (
                  <View style={s.itemWrapper}>
                    <EventItem event={item.item} />
                  </View>
                )
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => mutateDashboard()}
              tintColor={colors.brandFrom}
            />
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={s.listContent}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerDate: {
    ...typography.caption,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: spacing["3xl"],
  },
  sectionTitle: {
    ...typography.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  captureWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  errorBox: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    textAlign: "center",
  },
})
