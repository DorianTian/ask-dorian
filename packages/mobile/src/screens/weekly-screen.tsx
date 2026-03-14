import React, { useMemo, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { format, startOfWeek, endOfWeek, addDays, isToday, getWeek } from "date-fns"
import {
  BrainCircuit,
  Terminal,
  AlertTriangle,
  Calendar,
  ListTodo,
  CheckCircle2,
  Activity,
  Zap,
  Database,
} from "lucide-react-native"
import { useWeeklyDashboard } from "@ask-dorian/core/hooks"
import { taskApi } from "@ask-dorian/core/api"
import type { CalendarEvent, Task } from "@ask-dorian/core/types"
import { useColors, spacing, radii } from "../theme"

const mono = Platform.select({
  ios: { fontFamily: "Menlo" as const },
  android: { fontFamily: "monospace" as const },
})

function priorityColor(p: string, colors: ReturnType<typeof useColors>): string {
  switch (p) {
    case "urgent": return colors.priorityP0
    case "high": return colors.priorityP1
    case "medium": return colors.priorityP2
    default: return colors.textMuted
  }
}

function eventTypeColor(t: string, colors: ReturnType<typeof useColors>): string {
  switch (t) {
    case "meeting": return "#8B5CF6"
    case "focus": return colors.brandFrom
    case "deadline": return colors.destructive
    case "personal": return "#F59E0B"
    default: return "#6366F1"
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  value,
  trend,
  title,
  colors,
}: {
  icon: React.ComponentType<{ size: number; color: string }>
  value: string
  trend: string
  title: string
  colors: ReturnType<typeof useColors>
}) {
  return (
    <View style={[s.statCard, { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" }]}>
      <View style={s.statCardTop}>
        <Icon size={14} color={colors.mutedForeground} />
        <Text style={[s.statTrend, { color: colors.mutedForeground }, mono]}>{trend}</Text>
      </View>
      <Text style={[s.statValue, { color: colors.foreground }, mono]}>{value}</Text>
      <Text style={[s.statTitle, { color: colors.mutedForeground }, mono]}>{title}</Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// RawFragment (anomalous fragment card)
// ---------------------------------------------------------------------------
function RawFragmentCard({
  time,
  content,
  tags,
  colors,
  onPress,
}: {
  time: string
  content: string
  tags: string[]
  colors: ReturnType<typeof useColors>
  onPress?: () => void
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[s.rawFragment, { backgroundColor: "#000000" + "33", borderColor: colors.border + "4D" }]}
    >
      <View style={s.rawFragmentHeader}>
        <Text style={[s.rawFragmentTime, { color: colors.mutedForeground }, mono]}>{time}</Text>
        <View style={s.rawFragmentTags}>
          {tags.map((tag) => (
            <View key={tag} style={[s.rawFragmentTag, { backgroundColor: colors.brandFrom + "0D", borderColor: colors.brandFrom + "1A" }]}>
              <Text style={[s.rawFragmentTagText, { color: colors.brandFrom + "B3" }, mono]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={[s.rawFragmentContent, { color: colors.textSecondary }]}>{content}</Text>
    </TouchableOpacity>
  )
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export function WeeklyScreen() {
  const colors = useColors()
  const { data, error, isLoading, mutate: mutateDashboard } = useWeeklyDashboard()

  const now = new Date()
  const weekNumber = getWeek(now, { weekStartsOn: 1 })
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "M/d")
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "M/d")

  // Compute stats from real data
  const totalTasks = data
    ? data.tasks.scheduled.length + data.tasks.due.length + data.tasks.overdue.length
    : 0
  const totalEvents = data?.events.length ?? 0
  const overdueCount = data?.tasks.overdue.length ?? 0
  const scheduledCount = data?.tasks.scheduled.length ?? 0

  // Signal/noise: ratio of scheduled vs total (or "N/A" if no data)
  const signalNoise = totalTasks > 0
    ? `${Math.round((scheduledCount / totalTasks) * 100)}%`
    : "N/A"

  // Cognitive load based on overdue count
  const cognitiveLoad = overdueCount === 0
    ? "LOW"
    : overdueCount <= 2
      ? "MED"
      : "HIGH"

  const cognitiveStatus = overdueCount === 0
    ? "ALIGNED"
    : overdueCount <= 2
      ? "CAUTION"
      : "OVERLOAD"

  // Group tasks and events by date
  const weekDays = useMemo(() => {
    const days: { date: Date; label: string; dateKey: string }[] = []
    const start = startOfWeek(now, { weekStartsOn: 1 })
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i)
      days.push({
        date: d,
        label: format(d, "EEE M/d"),
        dateKey: format(d, "yyyy-MM-dd"),
      })
    }
    // Today first, then the rest in original order
    const todayIdx = days.findIndex((d) => isToday(d.date))
    if (todayIdx > 0) {
      const [today] = days.splice(todayIdx, 1)
      days.unshift(today)
    }
    return days
  }, [])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    if (!data) return map
    const allTasks = [...data.tasks.scheduled, ...data.tasks.due]
    for (const t of allTasks) {
      const key = t.scheduledDate ?? t.dueDate ?? t.startDate
      if (key) {
        const dateKey = key.slice(0, 10)
        const arr = map.get(dateKey) ?? []
        arr.push(t)
        map.set(dateKey, arr)
      }
    }
    return map
  }, [data])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    if (!data) return map
    for (const ev of data.events) {
      const dateKey = ev.startTime.slice(0, 10)
      const arr = map.get(dateKey) ?? []
      arr.push(ev)
      map.set(dateKey, arr)
    }
    return map
  }, [data])

  const completeTask = useCallback(async (id: string) => {
    await taskApi.complete(id)
    mutateDashboard()
  }, [mutateDashboard])

  // Build synthesized directive based on real data
  const directive = useMemo(() => {
    if (!data) return null
    if (overdueCount > 2) {
      return `You have ${overdueCount} overdue tasks creating cognitive drag. Recommend clearing the backlog before taking on new commitments this week.`
    }
    if (overdueCount > 0) {
      return `${overdueCount} overdue task${overdueCount > 1 ? "s" : ""} detected. Consider prioritizing these early in the week to maintain flow state.`
    }
    if (totalTasks > 10) {
      return `High task density (${totalTasks}) this week. Consider batching similar tasks and protecting deep-work blocks to maintain signal quality.`
    }
    if (totalTasks === 0 && totalEvents === 0) {
      return "No inputs detected for this cycle. Open your inbox or capture new fragments to initialize the weekly pipeline."
    }
    return `${totalTasks} tasks and ${totalEvents} events mapped for this cycle. Current trajectory is stable — maintain execution rhythm.`
  }, [data, overdueCount, totalTasks, totalEvents])

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
      {/* ================================================================ */}
      {/* HUD Header                                                       */}
      {/* ================================================================ */}
      <View style={[s.header, { borderBottomColor: colors.border + "80" }]}>
        <View style={s.headerTop}>
          <View style={s.headerLeft}>
            <View style={s.headerBrand}>
              <BrainCircuit size={18} color={colors.brandFrom} />
              <Text style={[s.headerBrandLabel, { color: colors.brandFrom }, mono]}>System Synthesis</Text>
            </View>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Cognitive Report</Text>
            <Text style={[s.headerSub, { color: colors.mutedForeground }, mono]}>
              CYCLE: WK-{String(weekNumber).padStart(2, "0")} // STATUS: {cognitiveStatus}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[s.exportBtn, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "4D" }]}
          >
            <Database size={12} color={colors.brandFrom} />
            <Text style={[s.exportBtnText, { color: colors.brandFrom }, mono]}>EXPORT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !data ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandFrom} />
        </View>
      ) : (
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
          {/* ============================================================ */}
          {/* Telemetry Grid (2x2)                                         */}
          {/* ============================================================ */}
          <View style={s.telemetryGrid}>
            <StatCard
              icon={ListTodo}
              value={String(totalTasks)}
              trend={totalTasks > 0 ? `${scheduledCount} sched` : "--"}
              title="TASKS"
              colors={colors}
            />
            <StatCard
              icon={Calendar}
              value={String(totalEvents)}
              trend={totalEvents > 0 ? `${weekStart}–${weekEnd}` : "--"}
              title="EVENTS"
              colors={colors}
            />
            <StatCard
              icon={Activity}
              value={signalNoise}
              trend={scheduledCount > 0 ? "OPTIMAL" : "LOW"}
              title="SIGNAL/NOISE"
              colors={colors}
            />
            <StatCard
              icon={AlertTriangle}
              value={cognitiveLoad}
              trend={overdueCount > 0 ? `${overdueCount} overdue` : "STABLE"}
              title="COGNITIVE LOAD"
              colors={colors}
            />
          </View>

          {/* ============================================================ */}
          {/* AI Analysis Terminal Card                                     */}
          {/* ============================================================ */}
          <View style={[s.analysisCard, { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" }]}>
            {/* Green gradient bar */}
            <View style={[s.analysisBar, { backgroundColor: colors.brandFrom }]} />

            <View style={s.analysisContent}>
              <View style={s.analysisHeader}>
                <Terminal size={14} color={colors.brandFrom} />
                <Text style={[s.analysisHeaderText, { color: colors.textTertiary }, mono]}>
                  semantic_analysis.exe
                </Text>
              </View>

              <View style={s.summaryItems}>
                {totalTasks > 0 && (
                  <View style={s.terminalLine}>
                    <Text style={[s.terminalPrompt, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
                    <Text style={[s.terminalText, { color: colors.textSecondary }, mono]}>
                      Analyzing {totalTasks} tasks across {weekDays.length} days...
                    </Text>
                  </View>
                )}
                {totalEvents > 0 && (
                  <View style={s.terminalLine}>
                    <Text style={[s.terminalPrompt, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
                    <Text style={[s.terminalText, { color: colors.textSecondary }, mono]}>
                      {totalEvents} calendar events mapped to timeline.
                    </Text>
                  </View>
                )}
                {overdueCount > 0 && (
                  <View style={s.terminalLine}>
                    <Text style={[s.terminalPrompt, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
                    <Text style={[s.terminalText, { color: colors.destructive }, mono]}>
                      Warning: {overdueCount} overdue node{overdueCount > 1 ? "s" : ""} — action required.
                    </Text>
                  </View>
                )}
                {scheduledCount > 0 && (
                  <View style={s.terminalLine}>
                    <Text style={[s.terminalPrompt, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
                    <Text style={[s.terminalText, { color: colors.textSecondary }, mono]}>
                      {scheduledCount} tasks scheduled — signal clarity at {signalNoise}.
                    </Text>
                  </View>
                )}
                {totalTasks === 0 && totalEvents === 0 && (
                  <View style={s.terminalLine}>
                    <Text style={[s.terminalPrompt, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
                    <Text style={[s.terminalText, { color: colors.mutedForeground }, mono]}>
                      No inputs detected for this cycle.
                    </Text>
                  </View>
                )}
              </View>

              {/* Synthesized Directive */}
              {directive && (
                <View style={[s.directiveBox, { backgroundColor: "#000000" + "66", borderColor: colors.brandFrom + "33" }]}>
                  <View style={[s.directiveAccent, { backgroundColor: colors.brandFrom }]} />
                  <View style={s.directiveContent}>
                    <Text style={[s.directiveLabel, { color: colors.brandFrom + "B3" }, mono]}>
                      // SYNTHESIZED DIRECTIVE
                    </Text>
                    <Text style={[s.directiveText, { color: colors.textSecondary }]}>
                      {directive}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ============================================================ */}
          {/* Anomalous Fragments (Overdue Tasks)                          */}
          {/* ============================================================ */}
          {overdueCount > 0 && data && (
            <View style={[s.sectionCard, { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" }]}>
              <View style={s.sectionHeader}>
                <Zap size={14} color="#FB923C" />
                <Text style={[s.sectionHeaderText, { color: colors.textTertiary }, mono]}>
                  anomalous_fragments ({overdueCount})
                </Text>
              </View>
              <View style={s.fragmentList}>
                {data.tasks.overdue.map((task) => (
                  <RawFragmentCard
                    key={task.id}
                    time={task.dueDate ? format(new Date(task.dueDate), "MM/dd HH:mm") : "??:??"}
                    content={task.title}
                    tags={[
                      task.priority,
                      ...(task.dueDate ? [`due:${task.dueDate.slice(0, 10)}`] : []),
                    ]}
                    colors={colors}
                    onPress={() => completeTask(task.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* Day-by-Day Breakdown                                         */}
          {/* ============================================================ */}
          <View style={s.dayBreakdownSection}>
            <View style={s.sectionHeader}>
              <Calendar size={14} color={colors.brandFrom} />
              <Text style={[s.sectionHeaderText, { color: colors.textTertiary }, mono]}>
                daily_timeline
              </Text>
            </View>

            {weekDays.map((day) => {
              const dayTasks = tasksByDate.get(day.dateKey) ?? []
              const dayEvents = eventsByDate.get(day.dateKey) ?? []
              const hasItems = dayTasks.length > 0 || dayEvents.length > 0
              const today = isToday(day.date)

              return (
                <View key={day.dateKey} style={s.daySection}>
                  <View style={s.dayHeader}>
                    <Text style={[
                      s.dayLabel,
                      { color: today ? colors.brandFrom : colors.mutedForeground },
                      mono,
                    ]}>
                      {day.label.toUpperCase()}{today ? " — TODAY" : ""}
                    </Text>
                    {hasItems && (
                      <Text style={[s.dayCount, { color: colors.mutedForeground }, mono]}>
                        {dayTasks.length + dayEvents.length}
                      </Text>
                    )}
                  </View>

                  {!hasItems ? (
                    <Text style={[s.emptyDay, { color: colors.textSubtle }, mono]}>
                      No items
                    </Text>
                  ) : (
                    <View style={s.dayItems}>
                      {/* Events */}
                      {dayEvents.map((ev) => (
                        <View
                          key={ev.id}
                          style={[s.taskItem, { backgroundColor: colors.card + "4D", borderColor: colors.border }]}
                        >
                          <View style={[s.priorityBar, { backgroundColor: eventTypeColor(ev.type, colors) }]} />
                          <View style={s.taskContent}>
                            <Text style={[s.taskTitle, { color: colors.foreground }]}>{ev.title}</Text>
                            <Text style={[s.taskMeta, { color: colors.mutedForeground }, mono]}>
                              {formatTime(ev.startTime)}
                              {ev.endTime ? `–${formatTime(ev.endTime)}` : ""}
                              {ev.location ? ` · ${ev.location}` : ""}
                            </Text>
                          </View>
                        </View>
                      ))}

                      {/* Tasks */}
                      {dayTasks.map((task) => (
                        <TouchableOpacity
                          key={task.id}
                          onPress={task.status !== "done" ? () => completeTask(task.id) : undefined}
                          style={[s.taskItem, { backgroundColor: colors.card + "4D", borderColor: colors.border }]}
                          activeOpacity={0.7}
                        >
                          <View style={[s.priorityBar, { backgroundColor: priorityColor(task.priority, colors) }]} />
                          <View style={s.taskContent}>
                            <Text style={[
                              s.taskTitle,
                              { color: task.status === "done" ? colors.mutedForeground : colors.foreground },
                              task.status === "done" && s.strikethrough,
                            ]}>
                              {task.title}
                            </Text>
                            <Text style={[s.taskMeta, { color: colors.mutedForeground }, mono]}>
                              {task.estimatedMinutes ? `${task.estimatedMinutes}min` : task.priority}
                            </Text>
                          </View>
                          {task.status === "done" && (
                            <CheckCircle2 size={14} color={colors.brandFrom + "80"} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, gap: 4 },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  headerBrandLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 4,
  },
  exportBtnText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Loading / Error
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorBox: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: { fontSize: 14, textAlign: "center" },

  // Scroll
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing["5xl"],
    gap: spacing.lg,
  },

  // Telemetry Grid
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTrend: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  statTitle: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },

  // Analysis Card (Terminal)
  analysisCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  analysisBar: { height: 2, opacity: 0.5 },
  analysisContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  analysisHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  summaryItems: { gap: spacing.md },
  terminalLine: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  terminalPrompt: {
    fontSize: 12,
    lineHeight: 18,
  },
  terminalText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  // Synthesized Directive
  directiveBox: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  directiveAccent: {
    width: 2,
  },
  directiveContent: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  directiveLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  directiveText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Section Card (shared)
  sectionCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Raw Fragments (anomalous)
  fragmentList: { gap: spacing.sm },
  rawFragment: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  rawFragmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rawFragmentTime: {
    fontSize: 9,
    fontWeight: "600",
  },
  rawFragmentTags: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  rawFragmentTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  rawFragmentTagText: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  rawFragmentContent: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Day-by-day breakdown
  dayBreakdownSection: { gap: spacing.md },
  daySection: { gap: spacing.sm },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dayCount: { fontSize: 10, fontWeight: "700" },
  emptyDay: { fontSize: 11, paddingVertical: spacing.xs },
  dayItems: { gap: spacing.xs },

  // Task / Event items
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
    overflow: "hidden",
  },
  priorityBar: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 13, fontWeight: "600" },
  taskMeta: { fontSize: 10, marginTop: 2 },
  strikethrough: { textDecorationLine: "line-through" },
})
