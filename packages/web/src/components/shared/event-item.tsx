"use client"

import { format } from "date-fns"
import { Clock, MapPin, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@ask-dorian/core/types"

interface EventItemProps {
  event: CalendarEvent
  compact?: boolean
}

export function EventItem({ event, compact }: EventItemProps) {
  const startTime = format(new Date(event.startTime), "HH:mm")
  const endTime = event.endTime
    ? format(new Date(event.endTime), "HH:mm")
    : null

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-accent/30",
        "border-l-[3px] border-l-fragment-event",
      )}
    >
      {/* Time */}
      <div className="mt-0.5 shrink-0 text-right">
        <p className="text-xs font-medium tabular-nums">{startTime}</p>
        {endTime && !compact && (
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {endTime}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{event.title}</p>
        {!compact && (
          <div className="mt-1 flex items-center gap-3">
            {event.location && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
            {event.conferenceUrl && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Video className="h-3 w-3" />
                Online
              </span>
            )}
            {event.isAllDay && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                All day
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function EventItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
      <div className="h-4 w-10 rounded bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/4 rounded bg-muted" />
      </div>
    </div>
  )
}
