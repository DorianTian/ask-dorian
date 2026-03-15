import React, { useState, useCallback } from "react"
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
import { Inbox, AlertTriangle } from "lucide-react-native"
import { useSWRConfig } from "swr"
import { useFragments } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"
import type { Fragment } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii } from "../theme"
import { FragmentCard } from "../components/fragment-card"
import { QuickCapture } from "../components/quick-capture"
import { EmptyState } from "../components/empty-state"

type TabKey = "pending" | "all"

export function InboxScreen() {
  const colors = useColors()
  const [tab, setTab] = useState<TabKey>("pending")
  const { mutate } = useSWRConfig()

  const pendingQuery = useFragments({ status: "processed" })
  const allQuery = useFragments()

  const activeQuery = tab === "pending" ? pendingQuery : allQuery
  const fragments = activeQuery.data ?? []

  const handleConfirm = useCallback(async (id: string) => {
    await fragmentApi.confirm(id)
    pendingQuery.mutate()
    allQuery.mutate()
    mutate((key: string) => typeof key === "string" && key.includes("/today"))
  }, [pendingQuery, allQuery, mutate])

  const handleReject = useCallback(async (id: string) => {
    await fragmentApi.reject(id)
    pendingQuery.mutate()
    allQuery.mutate()
  }, [pendingQuery, allQuery])

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "all", label: "All" },
  ]

  if (activeQuery.error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={s.errorBox}>
          <AlertTriangle size={24} color={colors.destructive} />
          <Text style={[s.errorText, { color: colors.destructive }]}>
            {activeQuery.error.message ?? "Failed to load fragments"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: colors.foreground }]}>Inbox</Text>
      </View>

      {/* Quick Capture */}
      <View style={s.captureWrapper}>
        <QuickCapture placeholder="Capture a fragment..." />
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

      {/* List */}
      {activeQuery.isLoading && !activeQuery.data ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandFrom} />
        </View>
      ) : (
        <FlatList<Fragment>
          data={fragments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={s.itemWrapper}>
              <FragmentCard
                fragment={item}
                onConfirm={item.status === "processed" ? handleConfirm : undefined}
                onReject={item.status === "processed" ? handleReject : undefined}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Inbox size={32} color={colors.mutedForeground} />}
              title={tab === "pending" ? "No pending fragments" : "No fragments yet"}
              subtitle="Start by capturing a thought above"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => activeQuery.mutate()}
              tintColor={colors.brandFrom}
            />
          }
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
  title: {
    ...typography.h1,
  },
  captureWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
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
  tabText: {
    ...typography.bodyMedium,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: spacing["3xl"],
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
