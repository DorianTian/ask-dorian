import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Circle, CheckCircle2 } from "lucide-react-native"
import type { Task, TaskPriority } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii, type Colors } from "../theme"

const priorityColorKey: Record<TaskPriority, keyof Colors | null> = {
  urgent: "priorityP0",
  high: "priorityP1",
  medium: "priorityP2",
  low: "priorityP3",
  none: null,
}

const priorityLabels: Record<TaskPriority, string> = {
  urgent: "P0",
  high: "P1",
  medium: "P2",
  low: "P3",
  none: "",
}

interface TaskItemProps {
  task: Task
  onComplete?: (id: string) => Promise<void>
}

export function TaskItem({ task, onComplete }: TaskItemProps) {
  const colors = useColors()
  const isDone = task.status === "done"
  const pKey = priorityColorKey[task.priority]
  const borderColor = pKey ? (colors[pKey] as string) : "transparent"

  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: borderColor,
          borderLeftWidth: pKey ? 3 : 1,
        },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={() => onComplete?.(task.id)}
        disabled={isDone}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isDone ? (
          <CheckCircle2 size={18} color={colors.statusSuccess} />
        ) : (
          <Circle size={18} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={s.body}>
        <Text
          style={[
            s.title,
            { color: isDone ? colors.mutedForeground : colors.foreground },
            isDone && s.strikethrough,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={s.meta}>
          {task.priority !== "none" && pKey && (
            <Text style={[s.metaText, { color: colors[pKey] as string }]}>
              {priorityLabels[task.priority]}
            </Text>
          )}
          {task.dueDate && (
            <Text style={[s.metaText, { color: colors.mutedForeground }]}>
              {task.dueDate}
            </Text>
          )}
          {task.estimatedMinutes != null && (
            <Text style={[s.metaText, { color: colors.mutedForeground }]}>
              {task.estimatedMinutes}m
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  meta: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metaText: {
    ...typography.tiny,
  },
})
