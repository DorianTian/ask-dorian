import React, { useState, useRef, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Check, X, Clock, ArrowRight, Inbox } from "lucide-react-native"
import { useFragments } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"
import type { Fragment } from "@ask-dorian/core/types"
import { useColors } from "../theme"

const mono = Platform.select({
  ios: { fontFamily: "Menlo" as const },
  android: { fontFamily: "monospace" as const },
})

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function contentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: "Text Note",
    voice: "Voice Memo",
    image: "Image",
    url: "Link",
    file: "File",
    email: "Email",
    forward: "Forwarded",
  }
  return labels[type] ?? "Fragment"
}

export function DailyReviewScreen() {
  const colors = useColors()
  const { data: fragments, isLoading, mutate } = useFragments({ status: "processed" })
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set())

  const pendingItems = (fragments ?? []).filter((f) => !processedIds.has(f.id))
  const currentItem = pendingItems[0] ?? null
  const nextItem = pendingItems[1] ?? null

  const handleConfirm = useCallback(async (id: string) => {
    await fragmentApi.confirm(id)
    setProcessedIds((prev) => new Set(prev).add(id))
    mutate()
  }, [mutate])

  const handleReject = useCallback(async (id: string) => {
    await fragmentApi.reject(id)
    setProcessedIds((prev) => new Set(prev).add(id))
    mutate()
  }, [mutate])

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => mutate()} tintColor={colors.brandFrom} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Daily Review</Text>
            <Text style={[s.headerSubtitle, { color: colors.textTertiary }]}>
              {isLoading
                ? "Loading..."
                : `${pendingItems.length} item${pendingItems.length !== 1 ? "s" : ""} need your attention`}
            </Text>
          </View>
        </View>

        {isLoading && !fragments ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brandFrom} />
          </View>
        ) : pendingItems.length === 0 ? (
          <View style={s.emptyContainer}>
            <Inbox size={48} color={colors.mutedForeground} />
            <Text style={[s.emptyTitle, { color: colors.foreground }]}>All caught up!</Text>
            <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
              No pending fragments to review.
            </Text>
          </View>
        ) : (
          <View style={s.cardsContainer}>
            {/* Main Card */}
            {currentItem && (
              <FragmentReviewCard
                fragment={currentItem}
                colors={colors}
                onConfirm={() => handleConfirm(currentItem.id)}
                onReject={() => handleReject(currentItem.id)}
                isMain
              />
            )}

            {/* Next Card (dimmed) */}
            {nextItem && (
              <View style={[
                s.secondaryCard,
                {
                  backgroundColor: colors.card + "66",
                  borderColor: colors.border + "80",
                },
              ]}>
                <View style={s.statusRow}>
                  <View style={s.statusLeft}>
                    <View style={[s.statusDot, { backgroundColor: colors.textMuted }]} />
                    <Text style={[s.statusLabel, { color: colors.textTertiary }]}>
                      {contentTypeLabel(nextItem.contentType)}
                    </Text>
                  </View>
                </View>
                <Text style={[s.secondaryTitle, { color: colors.textTertiary }]} numberOfLines={1}>
                  {nextItem.rawContent.slice(0, 80)}
                </Text>
                <Text style={[s.secondaryDesc, { color: colors.textMuted }]} numberOfLines={1}>
                  Captured {formatRelativeTime(nextItem.capturedAt)}
                </Text>
                <View style={s.reviewNextRow}>
                  <Text style={[s.reviewNextText, { color: colors.textMuted }]}>Review Next</Text>
                  <ArrowRight size={14} color={colors.textMuted} />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function FragmentReviewCard({
  fragment,
  colors,
  onConfirm,
  onReject,
  isMain,
}: {
  fragment: Fragment
  colors: ReturnType<typeof useColors>
  onConfirm: () => void
  onReject: () => void
  isMain: boolean
}) {
  const [isCompleted, setIsCompleted] = useState(false)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  const pulseAnim = useRef(new Animated.Value(1)).current
  React.useEffect(() => {
    if (!isCompleted) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [isCompleted, pulseAnim])

  const handleAccept = useCallback(() => {
    setIsCompleted(true)
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => onConfirm())
  }, [scaleAnim, rotateAnim, onConfirm])

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: ["-10deg", "0deg", "10deg"],
  })

  return (
    <View
      style={[
        s.mainCard,
        {
          backgroundColor: colors.card + "66",
          borderColor: isCompleted ? colors.brandFrom + "80" : colors.border + "80",
        },
        isCompleted && {
          shadowColor: colors.brandFrom,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 30,
          elevation: 4,
        },
      ]}
    >
      {/* Status row */}
      <View style={s.statusRow}>
        <View style={s.statusLeft}>
          <Animated.View
            style={[
              s.statusDot,
              { backgroundColor: colors.brandFrom },
              !isCompleted && { opacity: pulseAnim },
            ]}
          />
          <Text style={[s.statusLabel, { color: colors.brandFrom }]}>
            {contentTypeLabel(fragment.contentType)}
          </Text>
        </View>
        <View style={s.captureTimeRow}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={[s.captureTimeText, { color: colors.textMuted }]}>
            Captured {formatRelativeTime(fragment.capturedAt)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View
        style={[
          s.quoteBlock,
          {
            backgroundColor: colors.background + "66",
            borderLeftColor: colors.brandFrom + "66",
          },
        ]}
      >
        <Text style={[s.quoteText, { color: colors.textTertiary }]} numberOfLines={5}>
          {fragment.rawContent}
        </Text>
      </View>

      {/* Source info */}
      {fragment.inputSource && (
        <Text style={[s.sourceText, { color: colors.textMuted }]}>
          via {fragment.inputSource}{fragment.sourceApp ? ` · ${fragment.sourceApp}` : ""}
        </Text>
      )}

      {/* Action buttons */}
      <View style={s.actionsRow}>
        <TouchableOpacity
          style={[
            s.discardButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={onReject}
          activeOpacity={0.7}
        >
          <X size={16} color={colors.foreground} />
          <Text style={[s.discardText, { color: colors.foreground }]} numberOfLines={1}>
            Discard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAccept}
          style={[
            s.acceptButton,
            {
              backgroundColor: isCompleted ? "#059669" : colors.brandFrom,
              shadowColor: isCompleted ? "#059669" : colors.brandFrom,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
            }}
          >
            <Check size={16} color="#FFFFFF" />
          </Animated.View>
          <Text style={s.acceptText} numberOfLines={1}>
            {isCompleted ? "Confirmed" : "Confirm"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 32,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },

  // Loading / Empty
  loadingContainer: { paddingTop: 80, alignItems: "center" },
  emptyContainer: { paddingTop: 80, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },

  // Cards container
  cardsContainer: { gap: 24 },

  // Main Card
  mainCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },

  // Status row
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },

  // Capture time
  captureTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  captureTimeText: {
    fontSize: 10,
    ...mono,
  },

  // Quote block
  quoteBlock: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },

  // Source text
  sourceText: {
    fontSize: 11,
    marginBottom: 16,
    ...mono,
  },

  // Action buttons
  actionsRow: {
    flexDirection: "row",
    gap: 16,
  },
  discardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  discardText: {
    fontWeight: "500",
    fontSize: 14,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  acceptText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },

  // Secondary Card
  secondaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    opacity: 0.6,
  },
  secondaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  secondaryDesc: {
    fontSize: 14,
    marginBottom: 16,
  },

  // Review Next
  reviewNextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewNextText: {
    fontSize: 12,
    fontWeight: "700",
  },
})
