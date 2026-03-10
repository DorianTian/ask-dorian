import React, { useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { useSWRConfig } from "swr"
import {
  Target,
  Clock,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react-native"
import { useWeeklyDashboard } from "@ask-dorian/core/hooks"
import { taskApi } from "@ask-dorian/core/api"
import { useColors, spacing, typography, radii } from "../theme"
import { TaskItem } from "../components/task-item"
import { EventItem } from "../components/event-item"
import { EmptyState } from "../components/empty-state"

export function WeeklyScreen() {
  const colors = useColors()
  const { data, error, isLoading, mutate: mutateDashboard } = useWeeklyDashboard()
  const { mutate } = useSWRConfig()

  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "M/d")
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "M/d")

  const handleCompleteTask = useCallback(async (id: string) => {
    await taskApi.complete(id)
    mutateDashboard()
    mutate((key: string) => typeof key === "string" && key.includes("/tasks"))
  }, [mutateDashboard, mutate])

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={s.errorBox}>
          <AlertTriangle size={24} color={colors.destructive} />
          <Text style={[s.errorText, { color: colors.destructive }]}>
            {error.message ?? "Failed to load weekly data"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: colors.foreground }]}>Weekly</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          {weekStart} — {weekEnd}
        </Text>
      </View>

      {isLoading && !data ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandFrom} />
        </View>
      ) : data ? (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => mutateDashboard()}
              tintColor={colors.brandFrom}
            />
          }
        >
          {/* Q1: Focus */}
          <SectionCard
            icon={<Target size={16} color={colors.brandFrom} />}
            title="Focus"
            colors={colors}
          >
            {data.tasks.scheduled.length > 0 ? (
              [...data.tasks.scheduled]
                .sort((a, b) => {
                  const order = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }
                  return order[a.priority] - order[b.priority]
                })
                .slice(0, 8)
                .map((task) => (
                  <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />
                ))
            ) : (
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
                No tasks scheduled this week
              </Text>
            )}
          </SectionCard>

          {/* Q2: Time Allocation */}
          <SectionCard
            icon={<Clock size={16} color={colors.fragmentEvent} />}
            title="Time Allocation"
            colors={colors}
          >
            {data.events.length > 0 ? (
              data.events.map((event) => (
                <EventItem key={event.id} event={event} />
              ))
            ) : (
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
                No events this week
              </Text>
            )}
          </SectionCard>

          {/* Q3: Decisions */}
          <SectionCard
            icon={<HelpCircle size={16} color={colors.fragmentUncertain} />}
            title="Decisions"
            colors={colors}
          >
            {data.tasks.due.length > 0 || data.tasks.overdue.length > 0 ? (
              <>
                {data.tasks.due.map((task) => (
                  <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />
                ))}
                {data.tasks.overdue.map((task) => (
                  <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />
                ))}
              </>
            ) : (
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
                No decisions needed
              </Text>
            )}
          </SectionCard>

          {/* Q4: Progress */}
          <SectionCard
            icon={<TrendingUp size={16} color={colors.statusSuccess} />}
            title="Progress"
            colors={colors}
          >
            <View style={s.statsRow}>
              <StatBlock label="Scheduled" value={data.tasks.scheduled.length} color={colors.foreground} colors={colors} />
              <StatBlock label="Due" value={data.tasks.due.length} color={colors.fragmentUncertain} colors={colors} />
              <StatBlock label="Overdue" value={data.tasks.overdue.length} color={colors.destructive} colors={colors} />
            </View>
            <Text style={[s.statDetail, { color: colors.mutedForeground }]}>
              {data.events.length} events · Est.{" "}
              {data.tasks.scheduled.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0)}m
            </Text>
          </SectionCard>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({
  icon,
  title,
  colors,
  children,
}: {
  icon: React.ReactNode
  title: string
  colors: ReturnType<typeof useColors>
  children: React.ReactNode
}) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.cardHeader}>
        {icon}
        <Text style={[s.cardTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      <View style={s.cardContent}>{children}</View>
    </View>
  )
}

function StatBlock({
  label,
  value,
  color,
  colors,
}: {
  label: string
  value: number
  color: string
  colors: ReturnType<typeof useColors>
}) {
  return (
    <View style={[s.statBlock, { backgroundColor: colors.muted }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.caption, marginTop: 2 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyMedium,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    ...typography.tiny,
    marginTop: 2,
  },
  statDetail: {
    ...typography.caption,
    marginTop: spacing.sm,
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
