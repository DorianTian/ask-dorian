import React, { useMemo } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { format, startOfWeek } from "date-fns"
import {
  CheckCircle2,
  Calendar,
  BookOpen,
  Layers,
  AlertTriangle,
} from "lucide-react-native"
import { useWeekReview } from "@ask-dorian/core/hooks"
import type { ReviewParams } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii } from "../theme"
import { TaskItem } from "../components/task-item"
import { EventItem } from "../components/event-item"
import { EmptyState } from "../components/empty-state"

export function ReviewScreen() {
  const colors = useColors()

  const params = useMemo<ReviewParams>(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 })
    return {
      weekStart: format(ws, "yyyy-MM-dd"),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }, [])

  const { data, error, isLoading, mutate: mutateReview } = useWeekReview(params)

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={s.errorBox}>
          <AlertTriangle size={24} color={colors.destructive} />
          <Text style={[s.errorText, { color: colors.destructive }]}>
            {error.message ?? "Failed to load review"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: colors.foreground }]}>Review</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          Week of {params.weekStart}
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
              onRefresh={() => mutateReview()}
              tintColor={colors.brandFrom}
            />
          }
        >
          {/* Summary stats */}
          <View style={s.statsGrid}>
            <StatCard
              icon={<CheckCircle2 size={18} color={colors.statusSuccess} />}
              value={data.completed.length}
              label="Completed"
              colors={colors}
            />
            <StatCard
              icon={<Calendar size={18} color={colors.fragmentEvent} />}
              value={data.events.length}
              label="Events"
              colors={colors}
            />
            <StatCard
              icon={<BookOpen size={18} color={colors.brandFrom} />}
              value={data.knowledge.length}
              label="Knowledge"
              colors={colors}
            />
            <StatCard
              icon={<Layers size={18} color={colors.fragmentText} />}
              value={data.fragmentsProcessed}
              label="Fragments"
              colors={colors}
            />
          </View>

          {/* Completed tasks */}
          <View style={[s.section, { borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>
              Completed Tasks ({data.completed.length})
            </Text>
            {data.completed.length > 0 ? (
              <View style={s.sectionContent}>
                {data.completed.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </View>
            ) : (
              <EmptyState title="No tasks completed this week" />
            )}
          </View>

          {/* Events */}
          <View style={[s.section, { borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>
              Events ({data.events.length})
            </Text>
            {data.events.length > 0 ? (
              <View style={s.sectionContent}>
                {data.events.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
              </View>
            ) : (
              <EmptyState title="No events this week" />
            )}
          </View>

          {/* Knowledge */}
          {data.knowledge.length > 0 && (
            <View style={[s.section, { borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>
                Knowledge ({data.knowledge.length})
              </Text>
              <View style={s.sectionContent}>
                {data.knowledge.map((k) => (
                  <View key={k.id} style={[s.knowledgeCard, { backgroundColor: colors.muted }]}>
                    <Text style={[s.knowledgeTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {k.title}
                    </Text>
                    {k.summary && (
                      <Text style={[s.knowledgeSummary, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {k.summary}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  value,
  label,
  colors,
}: {
  icon: React.ReactNode
  value: number
  label: string
  colors: ReturnType<typeof useColors>
}) {
  return (
    <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {icon}
      <Text style={[s.statValue, { color: colors.foreground }]}>{value}</Text>
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
    gap: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    alignItems: "center",
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    ...typography.caption,
  },
  section: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  sectionTitle: {
    ...typography.bodyMedium,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  knowledgeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  knowledgeTitle: { ...typography.bodyMedium },
  knowledgeSummary: { ...typography.caption },
  errorBox: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: { ...typography.body, textAlign: "center" },
})
