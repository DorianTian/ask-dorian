import React, { useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { useSWRConfig } from "swr"
import {
  BrainCircuit,
  Terminal,
  AlertTriangle,
  Zap,
  Hash,
} from "lucide-react-native"
import { useWeeklyDashboard } from "@ask-dorian/core/hooks"
import { taskApi } from "@ask-dorian/core/api"
import { useColors, spacing, typography, radii } from "../theme"

export function WeeklyScreen() {
  const colors = useColors()
  const { data, error, isLoading, mutate: mutateDashboard } = useWeeklyDashboard()
  const { mutate } = useSWRConfig()

  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "M/d")
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "M/d")

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

  // Compute stats from real data when available
  const totalTasks = data
    ? data.tasks.scheduled.length + data.tasks.due.length + data.tasks.overdue.length
    : 0
  const totalEvents = data?.events.length ?? 0

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* HUD Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.headerIconBox, { backgroundColor: colors.brandFrom + "1A" }]}>
            <BrainCircuit size={20} color={colors.brandFrom} />
          </View>
          <View>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Cognitive Report</Text>
            <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
              SYSTEM SYNTHESIS — {weekStart}–{weekEnd}
            </Text>
          </View>
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
          {/* Telemetry Grid */}
          <View style={s.telemetryGrid}>
            {[
              { label: "RAW FRAGMENTS", value: "142" },
              { label: "NODES CONNECTED", value: "38" },
              { label: "SIGNAL/NOISE", value: "84%" },
              { label: "COGNITIVE LOAD", value: "LOW" },
            ].map((item, i) => (
              <View
                key={i}
                style={[s.telemetryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[s.telemetryLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[s.telemetryValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* AI Analysis */}
          <View style={[s.analysisCard, { backgroundColor: colors.card, borderColor: colors.brandFrom + "33" }]}>
            <View style={[s.analysisBar, { backgroundColor: colors.brandFrom }]} />
            <View style={s.analysisContent}>
              <View style={s.analysisHeader}>
                <Terminal size={14} color={colors.brandFrom} />
                <Text style={[s.analysisHeaderText, { color: colors.brandFrom }]}>weekly_synthesis.sh</Text>
              </View>
              <Text style={[s.analysisBody, { color: colors.mutedForeground }]}>
                {"Analysis complete. Cognitive throughput increased 12% over previous period. " +
                  "Deep work blocks were most productive between 09:00-12:00. " +
                  "Recommendation: consolidate shallow tasks into single afternoon block."}
              </Text>
              <View style={[s.directiveBox, { backgroundColor: colors.brandFrom + "0D", borderColor: colors.brandFrom + "33" }]}>
                <Text style={[s.directiveText, { color: colors.brandFrom }]}>
                  DIRECTIVE: Schedule deep work before noon, batch comms 14:00-15:00
                </Text>
              </View>
            </View>
          </View>

          {/* Anomalous Fragments */}
          <View style={s.anomalySection}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>ANOMALOUS FRAGMENTS</Text>
            {[
              { time: "TUE 14:22", text: "Voice memo about refactoring auth module — no follow-up task created", tags: ["Auth", "Tech-Debt"] },
              { time: "THU 09:15", text: "Screenshot of competitor's pricing page — unlinked to any project", tags: ["Market", "APAC"] },
              { time: "FRI 17:30", text: "Quick note: 'talk to Sarah about Q2 timeline' — not scheduled", tags: ["Planning", "Q2"] },
            ].map((item, i) => (
              <View key={i} style={[s.anomalyCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}>
                <Text style={[s.anomalyTime, { color: colors.mutedForeground }]}>{item.time}</Text>
                <Text style={[s.anomalyText, { color: colors.foreground }]}>{item.text}</Text>
                <View style={s.tagRow}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={[s.tag, { backgroundColor: colors.brandFrom + "0D", borderColor: colors.brandFrom + "1A" }]}>
                      <Text style={[s.tagText, { color: colors.brandFrom + "B3" }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Topic Clusters (simplified for mobile) */}
          <View style={s.clusterSection}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>TOPIC CLUSTERS</Text>
            <View style={[s.clusterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { name: "Product Design", size: 48, connections: 12 },
                { name: "Engineering", size: 36, connections: 8 },
                { name: "Market Research", size: 28, connections: 5 },
                { name: "Operations", size: 20, connections: 3 },
              ].map((cluster, i) => (
                <View key={i} style={s.clusterItem}>
                  <View style={[s.clusterDot, { width: cluster.size / 2, height: cluster.size / 2, backgroundColor: colors.brandFrom + "33", borderColor: colors.brandFrom + "4D" }]} />
                  <View style={s.clusterInfo}>
                    <Text style={[s.clusterName, { color: colors.foreground }]}>{cluster.name}</Text>
                    <Text style={[s.clusterMeta, { color: colors.mutedForeground }]}>
                      {cluster.connections} connections
                    </Text>
                  </View>
                  <Text style={[s.clusterCount, { color: colors.brandFrom }]}>{cluster.size}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Set Vector */}
          <View style={s.vectorSection}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>SET VECTOR</Text>
            <View style={[s.vectorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[s.vectorInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="What should next week focus on?"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[s.vectorBtn, { backgroundColor: colors.brandFrom }]}
                activeOpacity={0.8}
              >
                <Zap size={12} color="#fff" />
                <Text style={s.vectorBtnText}>COMMIT_VECTOR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const mono = Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } })

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 1,
    ...mono,
  },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
    gap: spacing.lg,
  },

  // Section label
  sectionLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    ...mono,
  },

  // Telemetry Grid
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  telemetryCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  telemetryLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    ...mono,
  },
  telemetryValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
    ...mono,
  },

  // AI Analysis
  analysisCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  analysisBar: { height: 3 },
  analysisContent: { padding: spacing.lg, gap: spacing.md },
  analysisHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  analysisHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    ...mono,
  },
  analysisBody: {
    fontSize: 13,
    lineHeight: 20,
    ...mono,
  },
  directiveBox: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  directiveText: {
    fontSize: 11,
    fontWeight: "700",
    ...mono,
  },

  // Anomalous Fragments
  anomalySection: { gap: spacing.sm },
  anomalyCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  anomalyTime: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    ...mono,
  },
  anomalyText: { fontSize: 13, lineHeight: 18 },
  tagRow: { flexDirection: "row", gap: spacing.sm, marginTop: 2 },
  tag: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, fontWeight: "600", ...mono },

  // Topic Clusters
  clusterSection: {},
  clusterCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  clusterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  clusterDot: {
    borderRadius: 999,
    borderWidth: 1,
  },
  clusterInfo: { flex: 1 },
  clusterName: { fontSize: 14, fontWeight: "600" },
  clusterMeta: { fontSize: 11, ...mono },
  clusterCount: { fontSize: 16, fontWeight: "900", ...mono },

  // Set Vector
  vectorSection: {},
  vectorCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  vectorInput: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontSize: 13,
    minHeight: 72,
    textAlignVertical: "top",
    ...mono,
  },
  vectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  vectorBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    ...mono,
  },

  // Error
  errorBox: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: { ...typography.body, textAlign: "center" },
})
