import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import {
  MessageSquare,
  Mic,
  Image as ImageIcon,
  Link,
  Sparkles,
  Check,
  X,
  ListTodo,
  Calendar,
  BookOpen,
} from "lucide-react-native"
import type { Fragment, FragmentContentType } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii } from "../theme"

// ---------------------------------------------------------------------------
// Content type icon + color
// ---------------------------------------------------------------------------

const typeConfig: Record<FragmentContentType, { icon: typeof MessageSquare; colorKey: string }> = {
  text: { icon: MessageSquare, colorKey: "fragmentText" },
  voice: { icon: Mic, colorKey: "fragmentVoice" },
  image: { icon: ImageIcon, colorKey: "fragmentImage" },
  url: { icon: Link, colorKey: "fragmentUrl" },
  file: { icon: Link, colorKey: "fragmentUrl" },
  email: { icon: MessageSquare, colorKey: "fragmentText" },
  forward: { icon: MessageSquare, colorKey: "fragmentText" },
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status, colors }: { status: Fragment["status"]; colors: ReturnType<typeof useColors> }) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    pending: { label: "Pending", bg: colors.muted, fg: colors.mutedForeground },
    processing: { label: "Processing", bg: `${colors.statusProcessing}20`, fg: colors.statusProcessing },
    processed: { label: "Ready", bg: `${colors.brandFrom}20`, fg: colors.brandFrom },
    confirmed: { label: "Confirmed", bg: `${colors.statusSuccess}20`, fg: colors.statusSuccess },
    rejected: { label: "Rejected", bg: `${colors.destructive}20`, fg: colors.destructive },
    failed: { label: "Failed", bg: `${colors.destructive}20`, fg: colors.destructive },
  }
  const cfg = map[status] ?? map.pending

  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.badgeText, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

interface FragmentCardProps {
  fragment: Fragment
  onConfirm?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
}

export function FragmentCard({ fragment, onConfirm, onReject }: FragmentCardProps) {
  const colors = useColors()
  const [confirming, setConfirming] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const cfg = typeConfig[fragment.contentType] ?? typeConfig.text
  const TypeIcon = cfg.icon
  const iconColor = colors[cfg.colorKey as keyof typeof colors] as string

  const timeAgo = getTimeAgo(fragment.capturedAt)
  const meta = fragment.metadata as Record<string, unknown> | undefined
  const hasTasks = meta && Array.isArray(meta.tasks) && meta.tasks.length > 0
  const hasEvents = meta && Array.isArray(meta.events) && meta.events.length > 0
  const hasKnowledge = meta && Array.isArray(meta.knowledge) && meta.knowledge.length > 0

  async function handleConfirm() {
    if (!onConfirm) return
    setConfirming(true)
    try { await onConfirm(fragment.id) } finally { setConfirming(false) }
  }

  async function handleReject() {
    if (!onReject) return
    setRejecting(true)
    try { await onReject(fragment.id) } finally { setRejecting(false) }
  }

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* L1: Type + time + status */}
      <View style={s.header}>
        <TypeIcon size={14} color={iconColor} />
        <Text style={[s.time, { color: colors.mutedForeground }]}>{timeAgo}</Text>
        <View style={{ flex: 1 }} />
        <StatusBadge status={fragment.status} colors={colors} />
      </View>

      {/* L2: Raw content */}
      <Text style={[s.content, { color: colors.foreground }]} numberOfLines={4}>
        {fragment.rawContent}
      </Text>

      {/* L3: AI understanding */}
      {fragment.normalizedContent && (
        <View style={[s.aiBox, { backgroundColor: `${colors.brandFrom}08` }]}>
          <Sparkles size={12} color={colors.brandFrom} />
          <Text style={[s.aiText, { color: colors.mutedForeground }]} numberOfLines={2}>
            {fragment.normalizedContent}
          </Text>
        </View>
      )}

      {/* L4: Extracted entities */}
      {(hasTasks || hasEvents || hasKnowledge) && (
        <View style={s.entities}>
          {hasTasks && (
            <View style={[s.entityBadge, { backgroundColor: `${colors.brandFrom}15` }]}>
              <ListTodo size={10} color={colors.brandFrom} />
              <Text style={[s.entityText, { color: colors.brandFrom }]}>
                {(meta!.tasks as unknown[]).length} task(s)
              </Text>
            </View>
          )}
          {hasEvents && (
            <View style={[s.entityBadge, { backgroundColor: `${colors.fragmentEvent}15` }]}>
              <Calendar size={10} color={colors.fragmentEvent} />
              <Text style={[s.entityText, { color: colors.fragmentEvent }]}>
                {(meta!.events as unknown[]).length} event(s)
              </Text>
            </View>
          )}
          {hasKnowledge && (
            <View style={[s.entityBadge, { backgroundColor: `${colors.statusSuccess}15` }]}>
              <BookOpen size={10} color={colors.statusSuccess} />
              <Text style={[s.entityText, { color: colors.statusSuccess }]}>
                {(meta!.knowledge as unknown[]).length} note(s)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* L5: Actions (only for processed fragments) */}
      {fragment.status === "processed" && (onConfirm || onReject) && (
        <View style={s.actions}>
          {onReject && (
            <TouchableOpacity
              style={[s.actionBtn, { borderColor: colors.border }]}
              onPress={handleReject}
              disabled={rejecting || confirming}
              activeOpacity={0.7}
            >
              {rejecting ? (
                <ActivityIndicator size="small" color={colors.mutedForeground} />
              ) : (
                <>
                  <X size={14} color={colors.mutedForeground} />
                  <Text style={[s.actionText, { color: colors.mutedForeground }]}>Reject</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {onConfirm && (
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnPrimary, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              disabled={confirming || rejecting}
              activeOpacity={0.7}
            >
              {confirming ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <>
                  <Check size={14} color={colors.primaryForeground} />
                  <Text style={[s.actionText, { color: colors.primaryForeground }]}>Confirm</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  time: {
    ...typography.caption,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    ...typography.tiny,
  },
  content: {
    ...typography.body,
  },
  aiBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  aiText: {
    ...typography.caption,
    flex: 1,
  },
  entities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  entityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  entityText: {
    ...typography.tiny,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionBtnPrimary: {
    borderWidth: 0,
  },
  actionText: {
    ...typography.captionMedium,
  },
})
