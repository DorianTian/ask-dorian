import React, { useState, useCallback, useMemo, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Activity,
  Clock,
  Terminal,
  AlertTriangle,
  Network,
  Cpu,
  Zap,
  Check,
  Target,
} from "lucide-react-native"
import { useTodayDashboard } from "@ask-dorian/core/hooks"
import { ritualApi, taskApi } from "@ask-dorian/core/api"
import type { CalendarEvent, Task } from "@ask-dorian/core/types"
import { useColors, spacing, radii } from "../theme"
import { QuickCapture } from "../components/quick-capture"

// --- Constants ---

const TL_START = 6
const TL_END = 24
const TL_RANGE = TL_END - TL_START // 18
const TIMELINE_HEIGHT = 720
const TIME_AXIS_WIDTH = 60
const WIDE_BREAKPOINT = 768

const TIME_LABELS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24]

// --- Timeline helpers ---

interface TimelineBlock {
  id: string
  startHour: number
  endHour: number
  time: string
  title: string
  sub: string
  type: "event" | "task"
  status: "completed" | "active" | "future"
  col: number
  totalCols: number
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function toHourFraction(iso: string): number {
  const d = new Date(iso)
  return d.getHours() + d.getMinutes() / 60
}

/** Convert an hour fraction to a percentage offset within the timeline. */
function pct(hour: number): number {
  return ((Math.max(TL_START, Math.min(TL_END, hour)) - TL_START) / TL_RANGE) * 100
}

function buildTimelineBlocks(
  events: CalendarEvent[],
  tasks: Task[],
  now: Date,
): TimelineBlock[] {
  const blocks: Omit<TimelineBlock, "col" | "totalCols">[] = []
  const nowHour = now.getHours() + now.getMinutes() / 60

  for (const ev of events) {
    if (!ev.startTime) continue
    const start = toHourFraction(ev.startTime)
    const end = ev.endTime ? toHourFraction(ev.endTime) : start + 1
    blocks.push({
      id: ev.id,
      startHour: start,
      endHour: end,
      time: formatTime(ev.startTime),
      title: ev.title,
      sub: ev.location ?? ev.type,
      type: "event",
      status: end <= nowHour ? "completed" : start <= nowHour && end > nowHour ? "active" : "future",
    })
  }

  for (const task of tasks) {
    if (task.scheduledStart) {
      const start = toHourFraction(task.scheduledStart)
      const duration = task.estimatedMinutes ? task.estimatedMinutes / 60 : 0.5
      const end = start + duration
      blocks.push({
        id: task.id,
        startHour: start,
        endHour: end,
        time: formatTime(task.scheduledStart),
        title: task.title,
        sub: task.estimatedMinutes ? `${task.estimatedMinutes}min` : "",
        type: "task",
        status: task.status === "done" ? "completed" : start <= nowHour && end > nowHour ? "active" : "future",
      })
    }
  }

  blocks.sort((a, b) => a.startHour - b.startHour)

  // Collision detection: assign column index for overlapping blocks
  const assigned: TimelineBlock[] = blocks.map((b) => ({ ...b, col: 0, totalCols: 1 }))
  for (let i = 0; i < assigned.length; i++) {
    const group = [i]
    for (let j = i + 1; j < assigned.length; j++) {
      if (assigned[j].startHour < assigned[i].endHour) {
        group.push(j)
      }
    }
    if (group.length > 1) {
      group.forEach((idx, col) => {
        assigned[idx].col = col
        assigned[idx].totalCols = Math.max(assigned[idx].totalCols, group.length)
      })
    }
  }
  return assigned
}

// --- Main Component ---

export function TodayScreen() {
  const colors = useColors()
  const { width: windowWidth } = useWindowDimensions()
  const isWide = windowWidth >= WIDE_BREAKPOINT
  const { data: dashboard, mutate: mutateDashboard } = useTodayDashboard()

  const [blocksWidth, setBlocksWidth] = useState(0)

  // Real-time clock for countdown & current-time indicator
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const toggleRitual = useCallback(async (id: string) => {
    await ritualApi.toggleComplete(id)
    mutateDashboard()
  }, [mutateDashboard])

  const completeTask = useCallback(async (id: string) => {
    await taskApi.complete(id)
    mutateDashboard()
  }, [mutateDashboard])

  // Derived data
  const ritualData = dashboard?.rituals
  const rituals = ritualData?.items ?? []
  const bootProgress = ritualData?.progress
    ? ritualData.progress.total > 0
      ? Math.round((ritualData.progress.completed / ritualData.progress.total) * 100)
      : 0
    : 0

  const timelineBlocks = useMemo(() => {
    if (!dashboard) return []
    return buildTimelineBlocks(dashboard.events, dashboard.tasks.scheduled, now)
  }, [dashboard, now])

  const scheduledCount = dashboard?.tasks.scheduled.length ?? 0
  const overdueCount = dashboard?.tasks.overdue.length ?? 0
  const pendingCount = dashboard?.pendingFragments.length ?? 0
  const eventCount = dashboard?.events.length ?? 0

  // T-MINUS countdown to 18:00
  const remainingMs = Math.max(0, new Date().setHours(18, 0, 0, 0) - now.getTime())
  const remainingH = Math.floor(remainingMs / 3_600_000)
  const remainingM = Math.floor((remainingMs % 3_600_000) / 60_000)
  const remainingS = Math.floor((remainingMs % 60_000) / 1_000)

  // Current time position on timeline
  const nowHour = now.getHours() + now.getMinutes() / 60
  const nowPercent = pct(nowHour)
  const showNowLine = nowHour >= TL_START && nowHour <= TL_END
  const nowTimeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  // Active block remaining time
  const activeBlock = timelineBlocks.find((b) => b.status === "active")
  const activeRemainingMin = activeBlock
    ? Math.max(0, Math.round((activeBlock.endHour - nowHour) * 60))
    : 0

  const mono = Platform.select({
    ios: { fontFamily: "Menlo" as const },
    android: { fontFamily: "monospace" as const },
  })

  // -----------------------------------------------------------------------
  // Sub-renderers
  // -----------------------------------------------------------------------

  const renderTimelineBlock = useCallback(
    (block: TimelineBlock) => {
      const topPct = pct(Math.max(block.startHour, TL_START))
      const bottomPct = pct(Math.min(block.endHour, TL_END))
      const heightPct = Math.max(bottomPct - topPct, 3) // min 3% so tiny blocks are visible

      // Collision-aware pixel positioning
      const leftPx = blocksWidth > 0 ? (block.col / block.totalCols) * blocksWidth : 0
      const widthPx = blocksWidth > 0 ? (blocksWidth / block.totalCols) - 4 : undefined

      if (block.status === "completed") {
        return (
          <View
            key={block.id}
            style={[
              s.posBlock,
              {
                top: `${topPct}%`,
                height: `${heightPct}%`,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderColor: colors.border + "80",
                opacity: 0.6,
                ...(widthPx != null ? { left: leftPx, width: widthPx } : {}),
              },
            ]}
          >
            <View style={s.posBlockInner}>
              <Check size={14} color={colors.brandFrom} />
              <Text
                style={[
                  s.posBlockTitle,
                  { color: colors.textMuted, textDecorationLine: "line-through" },
                  mono,
                ]}
                numberOfLines={1}
              >
                {block.title}
              </Text>
            </View>
          </View>
        )
      }

      if (block.status === "active") {
        return (
          <View
            key={block.id}
            style={[
              s.posBlockActive,
              {
                top: `${topPct}%`,
                minHeight: 140,
                backgroundColor: colors.brandFrom + "1A",
                borderColor: colors.brandFrom + "80",
                ...(widthPx != null ? { left: leftPx, width: widthPx } : {}),
              },
            ]}
          >
            {/* Header: EXECUTING badge + remaining time */}
            <View style={s.activeHeader}>
              <View style={s.executingBadge}>
                <View style={[s.pulseDot, { backgroundColor: colors.brandFrom }]} />
                <Text style={[s.executingText, { color: colors.brandFrom }, mono]}>
                  EXECUTING
                </Text>
              </View>
              <View style={[s.remainingBadge, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" }]}>
                <Text style={[s.remainingText, { color: colors.brandFrom }, mono]}>
                  {activeRemainingMin}:{String(Math.round((activeRemainingMin % 1) * 60)).padStart(2, "0")} REMAINING
                </Text>
              </View>
            </View>

            {/* Title & subtitle */}
            <Text style={[s.activeTitle, { color: colors.foreground }]} numberOfLines={1}>
              {block.title}
            </Text>
            <Text style={[s.activeSub, { color: colors.textTertiary }, mono]} numberOfLines={1}>
              {block.sub}
            </Text>

            {/* Action buttons */}
            <View style={s.activeActions}>
              <TouchableOpacity
                style={[s.completeBtn, { backgroundColor: colors.brandFrom }]}
                onPress={() => completeTask(block.id)}
                activeOpacity={0.8}
              >
                <Check size={12} color={colors.background} />
                <Text style={[s.completeBtnText, mono]}>COMPLETE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.extendBtn, { backgroundColor: "rgba(0,0,0,0.4)", borderColor: colors.border + "80" }]}
                activeOpacity={0.8}
              >
                <Text style={[s.extendBtnText, { color: colors.textSecondary }, mono]}>
                  EXTEND
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      }

      // Future block
      return (
        <View
          key={block.id}
          style={[
            s.posBlock,
            {
              top: `${topPct}%`,
              height: `${heightPct}%`,
              backgroundColor: colors.card + "66",
              borderColor: colors.border + "80",
              ...(widthPx != null ? { left: leftPx, width: widthPx } : {}),
            },
          ]}
        >
          <View style={s.posBlockInner}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={[s.posBlockTitle, { color: colors.textSecondary }, mono]} numberOfLines={1}>
              {block.title}
            </Text>
          </View>
        </View>
      )
    },
    [colors, mono, activeRemainingMin, completeTask, blocksWidth],
  )

  // -----------------------------------------------------------------------
  // Timeline column
  // -----------------------------------------------------------------------

  const renderTimeline = () => (
    <View style={[s.timelineCard, { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" }]}>
      {/* Dot grid background (subtle) */}
      <View style={s.dotGridOverlay} />

      {/* Section header */}
      <View style={s.timelineHeader}>
        <View style={s.timelineHeaderLeft}>
          <Network size={16} color="#60A5FA" />
          <Text style={[s.sectionLabel, { color: colors.textTertiary }, mono]}>
            TEMPORAL_STREAM
          </Text>
        </View>
        <View style={s.liveIndicator}>
          <View style={[s.pulseDot, { backgroundColor: colors.brandFrom }]} />
          <Text style={[s.liveText, { color: colors.brandFrom }, mono]}>LIVE</Text>
        </View>
      </View>

      {/* Timeline grid: time axis + blocks */}
      <View style={s.timelineGrid}>
        {/* Time axis labels — absolutely positioned */}
        <View style={[s.timeAxis, { borderRightColor: colors.border + "80" }]}>
          {TIME_LABELS.map((h) => (
            <Text
              key={h}
              style={[
                s.timeAxisLabel,
                {
                  color: colors.textMuted,
                  position: "absolute",
                  top: `${pct(h)}%`,
                  right: 0,
                  transform: [{ translateY: -6 }],
                },
                mono,
              ]}
            >
              {h === 24 ? "00:00" : `${String(h).padStart(2, "0")}:00`}
            </Text>
          ))}
        </View>

        {/* Blocks area */}
        <View
          style={s.blocksArea}
          onLayout={(e) => setBlocksWidth(e.nativeEvent.layout.width)}
        >
          {/* Current time indicator */}
          {showNowLine && (
            <View style={[s.nowIndicator, { top: `${nowPercent}%` }]}>
              <View style={[s.nowDot, { backgroundColor: colors.brandFrom }]} />
              <View style={[s.nowLine, { backgroundColor: colors.brandFrom + "80" }]} />
              <View style={[s.nowLabel, { backgroundColor: colors.brandFrom }]}>
                <Text style={[s.nowLabelText, { color: colors.background }, mono]}>
                  {nowTimeLabel}
                </Text>
              </View>
            </View>
          )}

          {/* Render positioned timeline blocks */}
          {timelineBlocks.length === 0 ? (
            <View style={s.emptyTimeline}>
              <Text style={[s.emptyText, { color: colors.textMuted }, mono]}>
                No events or tasks today
              </Text>
            </View>
          ) : (
            timelineBlocks.map(renderTimelineBlock)
          )}

          {/* Insert Fragment drop zone — show if there is a gap after the last block */}
          <View
            style={[
              s.dropZone,
              {
                top: timelineBlocks.length > 0
                  ? `${pct(Math.max(...timelineBlocks.map(b => b.endHour)) + 0.5)}%`
                  : "75%",
                height: "5%",
                borderColor: colors.brandFrom + "4D",
                backgroundColor: colors.brandFrom + "0D",
              },
            ]}
          >
            <Zap size={14} color={colors.brandFrom + "80"} />
            <Text style={[s.dropZoneText, { color: colors.brandFrom + "80" }, mono]}>
              INSERT_FRAGMENT
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  // -----------------------------------------------------------------------
  // Right column: Briefing + Boot Sequence + Quick Stats
  // -----------------------------------------------------------------------

  const renderBriefing = () => (
    <View style={[s.briefingCard, { backgroundColor: colors.card + "4D", borderColor: colors.brandFrom + "33" }]}>
      {/* Top green gradient bar */}
      <View style={[s.briefingGradientBar, { backgroundColor: colors.brandFrom }]} />

      <View style={s.briefingContent}>
        <View style={s.briefingHeader}>
          <Terminal size={14} color={colors.brandFrom} />
          <Text style={[s.briefingLabel, { color: colors.brandFrom }, mono]}>
            MORNING_BRIEF.SH
          </Text>
        </View>

        <View style={s.briefingItems}>
          {eventCount > 0 && (
            <View style={s.briefingItem}>
              <Text style={[s.briefingArrow, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
              <Text style={[s.briefingText, { color: colors.textSecondary }, mono]}>
                <Text style={{ color: colors.brandFrom, fontWeight: "700" }}>{eventCount} events</Text> scheduled today.
              </Text>
            </View>
          )}
          {scheduledCount > 0 && (
            <View style={s.briefingItem}>
              <Text style={[s.briefingArrow, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
              <Text style={[s.briefingText, { color: colors.textSecondary }, mono]}>
                <Text style={{ color: colors.brandFrom, fontWeight: "700" }}>{scheduledCount} tasks</Text> to execute.
              </Text>
            </View>
          )}
          {pendingCount > 0 && (
            <View style={s.briefingItem}>
              <Text style={[s.briefingArrow, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
              <Text style={[s.briefingText, { color: colors.textSecondary }, mono]}>
                {pendingCount} fragments pending triage.
              </Text>
            </View>
          )}
          {overdueCount > 0 && (
            <View style={s.briefingItem}>
              <Text style={[s.briefingArrow, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
              <Text style={[s.briefingText, { color: colors.textSecondary }, mono]}>
                <Text style={{ color: "#F97316", fontWeight: "700" }}>CRITICAL:</Text> {overdueCount} overdue tasks.
              </Text>
            </View>
          )}
          {eventCount === 0 && scheduledCount === 0 && pendingCount === 0 && (
            <View style={s.briefingItem}>
              <Text style={[s.briefingArrow, { color: colors.brandFrom + "B3" }, mono]}>{">"}</Text>
              <Text style={[s.briefingText, { color: colors.textSecondary }, mono]}>
                Clear schedule — deep work day.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )

  const renderBootSequence = () => (
    <View style={[s.bootCard, { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" }]}>
      <View style={s.bootHeader}>
        <View style={s.bootHeaderLeft}>
          <Cpu size={14} color={colors.brandFrom} />
          <Text style={[s.sectionLabel, { color: colors.textTertiary }, mono]}>
            BOOT_SEQUENCE
          </Text>
        </View>
        <Text style={[s.bootPercent, { color: colors.brandFrom }, mono]}>
          {bootProgress}%
        </Text>
      </View>

      <View style={s.ritualList}>
        {rituals.length === 0 ? (
          <Text style={[s.emptyText, { color: colors.textMuted }]}>No rituals configured</Text>
        ) : (
          rituals.map((item) => {
            const isComplete = item.completed
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleRitual(item.id)}
                style={[
                  s.ritualRow,
                  {
                    backgroundColor: isComplete ? colors.brandFrom + "0D" : "rgba(0,0,0,0.2)",
                    borderColor: isComplete ? colors.brandFrom + "33" : colors.border + "4D",
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={s.ritualRowLeft}>
                  <View
                    style={[
                      s.ritualIconBox,
                      {
                        backgroundColor: isComplete ? colors.brandFrom + "33" : colors.card,
                      },
                    ]}
                  >
                    {isComplete ? (
                      <Check size={12} color={colors.brandFrom} />
                    ) : (
                      <Target size={12} color={colors.textMuted} />
                    )}
                  </View>
                  <Text
                    style={[
                      s.ritualLabel,
                      {
                        color: isComplete ? colors.textSecondary : colors.textMuted,
                        textDecorationLine: isComplete ? "line-through" : "none",
                      },
                      mono,
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </View>
    </View>
  )

  const renderQuickStats = () => {
    const stats = [
      { label: "EVENTS", value: String(eventCount) },
      { label: "TASKS", value: String(scheduledCount) },
      { label: "OVERDUE", value: String(overdueCount) },
      { label: "INBOX", value: String(pendingCount) },
    ]

    return (
      <View style={s.statsGrid}>
        {stats.map((stat, i) => (
          <View
            key={i}
            style={[
              s.statCard,
              { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" },
            ]}
          >
            <Text style={[s.statLabel, { color: colors.textMuted }, mono]}>
              {stat.label}
            </Text>
            <Text style={[s.statValue, { color: colors.foreground }, mono]}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  // -----------------------------------------------------------------------
  // Overdue section (shown below timeline on narrow screens, or at bottom)
  // -----------------------------------------------------------------------

  const renderOverdue = () => {
    if (overdueCount === 0 || !dashboard) return null
    return (
      <View style={s.overdueSection}>
        <View style={s.overdueHeader}>
          <AlertTriangle size={12} color={colors.destructive} />
          <Text style={[s.sectionLabel, { color: colors.destructive }, mono]}>
            OVERDUE ({overdueCount})
          </Text>
        </View>
        <View style={s.overdueList}>
          {dashboard.tasks.overdue.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => completeTask(task.id)}
              style={[
                s.overdueItem,
                { backgroundColor: colors.destructive + "0D", borderColor: colors.destructive + "33" },
              ]}
              activeOpacity={0.7}
            >
              <View style={[s.overdueCheck, { borderColor: colors.destructive + "80" }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.overdueTitle, { color: "#FCA5A5" }]}>{task.title}</Text>
                {task.dueDate && (
                  <Text style={[s.overdueDue, { color: colors.destructive + "80" }, mono]}>
                    {task.dueDate}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
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
        {/* HUD Header */}
        <View style={[s.hudHeader, { borderBottomColor: colors.border + "80" }]}>
          <View style={s.hudLeft}>
            <View style={s.hudStatus}>
              <Activity size={20} color={colors.brandFrom} />
              <Text style={[s.hudStatusText, { color: colors.brandFrom }, mono]}>
                SYSTEM ACTIVE
              </Text>
            </View>
            <Text style={[s.hudTitle, { color: colors.foreground }]}>Daily Telemetry</Text>
            <Text style={[s.hudSubtitle, { color: colors.textMuted }, mono]}>
              USER: DORIAN // {dashboard?.date ?? now.toISOString().slice(0, 10)}
            </Text>
          </View>
          <View style={[s.timerBox, { backgroundColor: colors.card + "4D", borderColor: colors.border + "80" }]}>
            <Clock size={14} color={colors.textTertiary} />
            <Text style={[s.timerText, { color: colors.textSecondary }, mono]}>
              T-{String(remainingH).padStart(2, "0")}:{String(remainingM).padStart(2, "0")}:{String(remainingS).padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* Two-column on wide, single column on narrow */}
        {isWide ? (
          <View style={s.twoCol}>
            {/* Left: Timeline (~66%) */}
            <View style={s.colLeft}>
              {renderTimeline()}
            </View>

            {/* Right: Briefing + Boot + Stats (~34%) */}
            <View style={s.colRight}>
              {renderBriefing()}
              {renderBootSequence()}
              {renderQuickStats()}
            </View>
          </View>
        ) : (
          <View style={s.singleCol}>
            {renderBriefing()}
            {renderTimeline()}
            {renderBootSequence()}
            {renderOverdue()}
            {renderQuickStats()}
          </View>
        )}

        {/* Overdue (wide layout shows below two-col) */}
        {isWide && renderOverdue()}
      </ScrollView>

      {/* Quick Capture — fixed above tab bar */}
      <View style={s.captureFixed}>
        <QuickCapture />
      </View>
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
    gap: spacing.lg,
  },

  // --- HUD Header ---
  hudHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  hudLeft: { flex: 1, gap: 4 },
  hudStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  hudStatusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hudTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  hudSubtitle: { fontSize: 10, marginTop: 4 },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  timerText: { fontSize: 12, fontWeight: "700" },

  // --- Two Column Layout ---
  twoCol: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  colLeft: { flex: 2 },
  colRight: { flex: 1, gap: spacing.lg },
  singleCol: { gap: spacing.lg },

  // --- Timeline Card ---
  timelineCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: TIMELINE_HEIGHT + 80,
    overflow: "hidden",
  },
  dotGridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    // Dot grid pattern is purely visual; on RN we skip the CSS background-image.
    // The borderRadius clip from the parent gives the visual hint.
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  timelineHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // --- Timeline Grid ---
  timelineGrid: {
    flexDirection: "row",
    flex: 1,
    gap: spacing.lg,
  },
  timeAxis: {
    width: TIME_AXIS_WIDTH,
    position: "relative" as const,
    borderRightWidth: 1,
    paddingRight: spacing.sm,
    height: TIMELINE_HEIGHT,
  },
  timeAxisLabel: {
    fontSize: 10,
    textAlign: "right",
  },
  blocksArea: {
    flex: 1,
    height: TIMELINE_HEIGHT,
    position: "relative",
  },

  // --- Positioned Blocks ---
  posBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    justifyContent: "center",
  },
  posBlockInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  posBlockTitle: { fontSize: 12, flex: 1 },

  // --- Active Block ---
  posBlockActive: {
    position: "absolute",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    zIndex: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  executingBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  executingText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  remainingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  remainingText: { fontSize: 10, fontWeight: "700" },
  activeTitle: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  activeSub: { fontSize: 12, marginBottom: spacing.md },
  activeActions: { flexDirection: "row", gap: spacing.sm, marginTop: "auto" },
  completeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  completeBtnText: {
    color: "#09090B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  extendBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  extendBtnText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // --- Current Time Indicator ---
  nowIndicator: {
    position: "absolute",
    left: -8,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 30,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  nowLine: { flex: 1, height: 1 },
  nowLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginLeft: 4,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  nowLabelText: { fontSize: 10, fontWeight: "700" },

  // --- Drop Zone ---
  dropZone: {
    position: "absolute",
    left: 0,
    right: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dropZoneText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // --- AI Briefing ---
  briefingCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  briefingGradientBar: {
    height: 2,
    opacity: 0.5,
  },
  briefingContent: { padding: spacing.lg, gap: spacing.md },
  briefingHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  briefingLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  briefingItems: { gap: spacing.sm },
  briefingItem: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  briefingArrow: { fontSize: 13, marginTop: 1 },
  briefingText: { fontSize: 12, flex: 1, lineHeight: 18 },

  // --- Boot Sequence ---
  bootCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  bootHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  bootHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  bootPercent: { fontSize: 10, fontWeight: "700" },
  ritualList: { gap: spacing.sm },
  ritualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  ritualRowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  ritualIconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  ritualLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // --- Quick Stats ---
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },

  // --- Section label ---
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // --- Overdue ---
  overdueSection: { gap: spacing.md },
  overdueHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  overdueList: { gap: spacing.sm },
  overdueItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  overdueCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
  },
  overdueTitle: { fontSize: 14, fontWeight: "700" },
  overdueDue: { fontSize: 10, marginTop: 2 },

  // --- Misc ---
  emptyText: { fontSize: 12, textAlign: "center", paddingVertical: spacing.lg },
  emptyTimeline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  captureFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
})
