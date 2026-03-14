import React, { useState, useCallback } from "react"
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
import { useSWRConfig } from "swr"
import {
  Activity,
  Clock,
  Terminal,
  CheckCircle2,
  Sparkles,
  Play,
  FastForward,
  AlertTriangle,
  Sun,
} from "lucide-react-native"
import { useTodayDashboard } from "@ask-dorian/core/hooks"
import { fragmentApi, taskApi } from "@ask-dorian/core/api"
import { useColors, spacing, typography, radii } from "../theme"
import { QuickCapture } from "../components/quick-capture"

const defaultRituals = [
  { id: 1, label: "Hydrate", completed: true },
  { id: 2, label: "Meditate", completed: true },
  { id: 3, label: "Read", completed: true },
  { id: 4, label: "Stretch", completed: false },
]

const timelineBlocks = [
  { id: "t1", time: "08:00", title: "Morning Ritual", sub: "COMPLETED • 45 MIN", status: "completed" as const },
  { id: "t2", time: "09:00", title: "UI Refinement Sprint", sub: "45:12 REMAINING", status: "active" as const },
  { id: "drop", time: "", title: "", sub: "", status: "drop" as const },
  { id: "t3", time: "10:00", title: "Weekly Sync (Team)", sub: "Video Call • Meeting Link", status: "future" as const },
  { id: "t4", time: "12:00", title: "Mindful Lunch", sub: "Away from screen", status: "future" as const },
  { id: "t5", time: "14:00", title: "Deep Work Block", sub: "Board Meeting Prep", status: "future" as const },
]

export function TodayScreen() {
  const colors = useColors()
  const { data, error, isLoading, mutate: mutateDashboard } = useTodayDashboard()
  const { mutate } = useSWRConfig()
  const [rituals, setRituals] = useState(defaultRituals)

  const toggleRitual = useCallback((id: number) => {
    setRituals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    )
  }, [])

  const completedCount = rituals.filter((r) => r.completed).length
  const bootProgress = Math.round((completedCount / rituals.length) * 100)

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
        <View style={s.hudHeader}>
          <View style={s.hudLeft}>
            <View style={[s.hudIconBox, { backgroundColor: colors.brandFrom + "1A" }]}>
              <Activity size={20} color={colors.brandFrom} />
            </View>
            <View>
              <Text style={[s.hudTitle, { color: colors.foreground }]}>Daily Telemetry</Text>
              <Text style={[s.hudSubtitle, { color: colors.mutedForeground }]}>
                SYSTEM ACTIVE — USER: DORIAN
              </Text>
            </View>
          </View>
          <View style={[s.timerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Clock size={12} color={colors.brandFrom} />
            <Text style={[s.timerText, { color: colors.brandFrom }]}>T-08:42</Text>
          </View>
        </View>

        {/* AI Briefing Card */}
        <View style={[s.briefingCard, { backgroundColor: colors.card, borderColor: colors.brandFrom + "33" }]}>
          <View style={[s.briefingGradientBar, { backgroundColor: colors.brandFrom }]} />
          <View style={s.briefingContent}>
            <View style={s.briefingHeader}>
              <Terminal size={14} color={colors.brandFrom} />
              <Text style={[s.briefingLabel, { color: colors.brandFrom }]}>morning_brief.sh</Text>
            </View>
            <View style={s.briefingItems}>
              {[
                "4 deep-work blocks scheduled",
                "Energy peak: 10:00-12:30",
                "Team sync at 10:00",
              ].map((text, i) => (
                <View key={i} style={s.briefingItem}>
                  <Text style={[s.briefingArrow, { color: colors.brandFrom + "80" }]}>→</Text>
                  <Text style={[s.briefingText, { color: colors.mutedForeground }]}>{text}</Text>
                </View>
              ))}
            </View>
            <View style={[s.criticalBox, { backgroundColor: colors.brandFrom + "0D", borderColor: colors.brandFrom + "33" }]}>
              <Text style={[s.criticalText, { color: colors.brandFrom }]}>
                CRITICAL: Finish UI refinement before 12:00
              </Text>
            </View>
          </View>
        </View>

        {/* Boot Sequence (Rituals) */}
        <View style={[s.bootCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}>
          <View style={s.bootHeader}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>BOOT SEQUENCE</Text>
            <Text style={[s.bootPercent, { color: colors.brandFrom }]}>{bootProgress}%</Text>
          </View>
          <View style={[s.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[s.progressFill, { backgroundColor: colors.brandFrom, width: `${bootProgress}%` }]} />
          </View>
          <View style={s.ritualList}>
            {rituals.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleRitual(item.id)}
                style={s.ritualItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    s.ritualCheck,
                    item.completed
                      ? { backgroundColor: colors.brandFrom, borderColor: colors.brandFrom }
                      : { borderColor: colors.border },
                  ]}
                >
                  {item.completed && <CheckCircle2 size={10} color="#fff" />}
                </View>
                <Text
                  style={[
                    s.ritualLabel,
                    { color: item.completed ? colors.mutedForeground : colors.foreground },
                    item.completed && s.ritualStrike,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Execution Timeline */}
        <View style={s.timelineSection}>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>EXECUTION TIMELINE</Text>
          <View style={s.timelineList}>
            {timelineBlocks.map((block) => {
              if (block.status === "drop") {
                return (
                  <View
                    key={block.id}
                    style={[s.dropZone, { borderColor: colors.brandFrom + "4D" }]}
                  >
                    <Sparkles size={12} color={colors.brandFrom + "80"} />
                    <Text style={[s.dropText, { color: colors.brandFrom + "80" }]}>Insert_Fragment</Text>
                  </View>
                )
              }
              if (block.status === "active") {
                return (
                  <View
                    key={block.id}
                    style={[s.activeBlock, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "80" }]}
                  >
                    <View style={s.blockRow}>
                      <Text style={[s.timeLabel, { color: colors.brandFrom }]}>{block.time}</Text>
                      <View style={s.blockContent}>
                        <Text style={[s.blockTitle, { color: colors.foreground }]}>{block.title}</Text>
                        <Text style={[s.blockSub, { color: colors.brandFrom }]}>{block.sub}</Text>
                      </View>
                    </View>
                    <View style={s.blockActions}>
                      <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.brandFrom }]} activeOpacity={0.8}>
                        <Play size={10} color="#fff" />
                        <Text style={s.actionBtnText}>Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.actionBtnOutline, { borderColor: colors.border }]}
                        activeOpacity={0.8}
                      >
                        <FastForward size={10} color={colors.mutedForeground} />
                        <Text style={[s.actionBtnOutlineText, { color: colors.mutedForeground }]}>Extend</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              }
              // completed or future
              return (
                <View
                  key={block.id}
                  style={[
                    s.timelineItem,
                    {
                      backgroundColor: block.status === "completed" ? "rgba(0,0,0,0.25)" : colors.card + "08",
                      borderColor: colors.border + "40",
                    },
                  ]}
                >
                  <Text style={[s.timeLabel, { color: colors.mutedForeground }]}>{block.time}</Text>
                  <View style={s.blockContent}>
                    <Text
                      style={[
                        s.blockTitle,
                        {
                          color: block.status === "completed" ? colors.mutedForeground : colors.foreground,
                        },
                        block.status === "completed" && s.ritualStrike,
                      ]}
                    >
                      {block.title}
                    </Text>
                    <Text style={[s.blockSub, { color: colors.mutedForeground }]}>{block.sub}</Text>
                  </View>
                  {block.status === "completed" && (
                    <CheckCircle2 size={14} color={colors.brandFrom + "80"} />
                  )}
                </View>
              )
            })}
          </View>
        </View>

        {/* Mini Stats Grid */}
        <View style={s.statsGrid}>
          {[
            { label: "FOCUS", value: "92" },
            { label: "DEEP", value: "4.5h" },
            { label: "SYNC", value: "12" },
            { label: "PEAK", value: "10:00" },
          ].map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: colors.card + "4D", borderColor: colors.border }]}>
              <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              <Text style={[s.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Quick Capture */}
        <View style={s.captureWrapper}>
          <QuickCapture />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
    gap: spacing.lg,
  },

  // HUD Header
  hudHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  hudLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  hudIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  hudTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  hudSubtitle: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 1,
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 11,
    fontWeight: "700",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },

  // AI Briefing
  briefingCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  briefingGradientBar: { height: 3 },
  briefingContent: { padding: spacing.lg, gap: spacing.md },
  briefingHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  briefingLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  briefingItems: { gap: spacing.sm },
  briefingItem: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  briefingArrow: {
    fontSize: 12,
    marginTop: 1,
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  briefingText: {
    fontSize: 12,
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
    flex: 1,
  },
  criticalBox: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  criticalText: {
    fontSize: 12,
    fontWeight: "700",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },

  // Boot Sequence
  bootCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  bootHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bootPercent: {
    fontSize: 10,
    fontWeight: "700",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  ritualList: { gap: spacing.xs },
  ritualItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
  },
  ritualCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ritualLabel: { fontSize: 14, fontWeight: "500" },
  ritualStrike: { textDecorationLine: "line-through" },

  // Section label
  sectionLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },

  // Timeline
  timelineSection: { gap: spacing.md },
  timelineList: { gap: spacing.sm },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  activeBlock: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  blockRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  timeLabel: {
    fontSize: 10,
    fontWeight: "900",
    width: 40,
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  blockContent: { flex: 1 },
  blockTitle: { fontSize: 14, fontWeight: "700" },
  blockSub: {
    fontSize: 10,
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  blockActions: { flexDirection: "row", gap: spacing.sm, paddingLeft: 52 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  actionBtnText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  actionBtnOutlineText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },

  // Drop zone
  dropZone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
  },
  dropText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
    ...Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } }),
  },

  // Capture & Error
  captureWrapper: { paddingTop: spacing.sm },
  errorBox: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: { ...typography.body, textAlign: "center" },
})
