import React, { useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { FolderOpen, AlertTriangle } from "lucide-react-native"
import { useProjects } from "@ask-dorian/core/hooks"
import type { Project, ProjectStatus } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii } from "../theme"
import { EmptyState } from "../components/empty-state"

type TabKey = "active" | "paused" | "completed"

export function ProjectsScreen() {
  const colors = useColors()
  const [tab, setTab] = useState<TabKey>("active")
  const { data, error, isLoading, mutate: mutateProjects } = useProjects({ status: tab })

  const projects = data ?? []

  const tabs: { key: TabKey; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "completed", label: "Done" },
  ]

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={s.errorBox}>
          <AlertTriangle size={24} color={colors.destructive} />
          <Text style={[s.errorText, { color: colors.destructive }]}>
            {error.message ?? "Failed to load projects"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: colors.foreground }]}>Projects</Text>
      </View>

      {/* Tabs */}
      <View style={[s.tabBar, { borderBottomColor: colors.border }]}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              s.tab,
              tab === t.key && { borderBottomColor: colors.brandFrom, borderBottomWidth: 2 },
            ]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.tabText,
                { color: tab === t.key ? colors.foreground : colors.mutedForeground },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !data ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandFrom} />
        </View>
      ) : (
        <FlatList<Project>
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProjectCard project={item} colors={colors} />}
          ListEmptyComponent={
            <EmptyState
              icon={<FolderOpen size={32} color={colors.mutedForeground} />}
              title={`No ${tab} projects`}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => mutateProjects()}
              tintColor={colors.brandFrom}
            />
          }
          contentContainerStyle={s.listContent}
        />
      )}
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------

function ProjectCard({ project, colors }: { project: Project; colors: ReturnType<typeof useColors> }) {
  const progressPct = Math.round(project.progress * 100)

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.cardHeader}>
        <View style={[s.iconCircle, { backgroundColor: project.color + "20" }]}>
          <Text style={s.iconEmoji}>{project.icon ?? "📁"}</Text>
        </View>
        <View style={s.cardMeta}>
          <Text style={[s.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {project.name}
          </Text>
          {project.description && (
            <Text style={[s.cardDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {project.description}
            </Text>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.progressWrapper}>
        <View style={[s.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              s.progressFill,
              {
                backgroundColor: project.color || colors.brandFrom,
                width: `${progressPct}%`,
              },
            ]}
          />
        </View>
        <Text style={[s.progressText, { color: colors.mutedForeground }]}>
          {progressPct}%
        </Text>
      </View>

      {/* Tags */}
      {project.tags.length > 0 && (
        <View style={s.tagsRow}>
          {project.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[s.tagBadge, { backgroundColor: colors.muted }]}>
              <Text style={[s.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { ...typography.bodyMedium },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 20 },
  cardMeta: { flex: 1 },
  cardTitle: { ...typography.bodyMedium },
  cardDesc: { ...typography.caption, marginTop: 2 },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: { ...typography.tiny, width: 30, textAlign: "right" },
  tagsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  tagText: { ...typography.tiny },
  errorBox: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: { ...typography.body, textAlign: "center" },
})
