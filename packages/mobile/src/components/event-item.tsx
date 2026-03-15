import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Clock, MapPin, Video } from "lucide-react-native"
import { format } from "date-fns"
import type { CalendarEvent } from "@ask-dorian/core/types"
import { useColors, spacing, typography, radii } from "../theme"

interface EventItemProps {
  event: CalendarEvent
}

export function EventItem({ event }: EventItemProps) {
  const colors = useColors()

  const start = new Date(event.startTime)
  const end = event.endTime ? new Date(event.endTime) : null
  const timeStr = end
    ? `${format(start, "HH:mm")} — ${format(end, "HH:mm")}`
    : format(start, "HH:mm")

  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: colors.fragmentEvent,
          borderLeftWidth: 3,
        },
      ]}
    >
      <View style={s.timeRow}>
        <Clock size={12} color={colors.fragmentEvent} />
        <Text style={[s.time, { color: colors.fragmentEvent }]}>{timeStr}</Text>
        {event.isAllDay && (
          <View style={[s.badge, { backgroundColor: `${colors.fragmentEvent}20` }]}>
            <Text style={[s.badgeText, { color: colors.fragmentEvent }]}>All Day</Text>
          </View>
        )}
      </View>

      <Text style={[s.title, { color: colors.foreground }]} numberOfLines={2}>
        {event.title}
      </Text>

      {(event.location || event.conferenceUrl) && (
        <View style={s.locRow}>
          {event.location && (
            <View style={s.locItem}>
              <MapPin size={10} color={colors.mutedForeground} />
              <Text style={[s.locText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
          {event.conferenceUrl && (
            <View style={s.locItem}>
              <Video size={10} color={colors.mutedForeground} />
              <Text style={[s.locText, { color: colors.mutedForeground }]}>Meeting Link</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  time: {
    ...typography.captionMedium,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.full,
    marginLeft: spacing.xs,
  },
  badgeText: {
    ...typography.tiny,
  },
  title: {
    ...typography.body,
  },
  locRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  locItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locText: {
    ...typography.caption,
  },
})
