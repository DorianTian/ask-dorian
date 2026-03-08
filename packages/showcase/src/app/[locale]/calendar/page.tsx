// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "@/i18n/navigation"
import { scheduleEvents } from "@/lib/mock-data"

const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00 - 19:00

export default function CalendarPage() {
  const t = useTranslations("calendar")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"><ChevronLeft className="size-4" /></Button>
          <span className="text-sm font-medium">March 2026</span>
          <Button variant="ghost" size="sm"><ChevronRight className="size-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="week">
            <TabsList className="h-8">
              <TabsTrigger value="month" className="text-xs">{t("month")}</TabsTrigger>
              <TabsTrigger value="week" className="text-xs">{t("week")}</TabsTrigger>
              <TabsTrigger value="day" className="text-xs">{t("day")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            {t("newEvent")}
          </Button>
        </div>
      </div>

      {/* Day View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Sunday, March 8, 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {hours.map((hour) => {
              const event = scheduleEvents.find((e) => {
                const h = new Date(e.startTime).getHours()
                return h === hour && e.startTime.startsWith("2026-03-08")
              })
              return (
                <div key={hour} className="flex min-h-[48px] border-t">
                  <div className="w-16 shrink-0 py-1 text-xs text-muted-foreground text-right pr-3">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  <div className="flex-1 py-1 pl-3">
                    {event && (
                      <Link href={`/calendar/${event.id}`}>
                        <div
                          className={`rounded-md px-2 py-1.5 text-xs hover:opacity-80 transition-opacity ${
                            event.type === "focus"
                              ? "bg-blue-50 border border-blue-200 text-blue-700"
                              : event.type === "meeting"
                                ? "bg-purple-50 border border-purple-200 text-purple-700"
                                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          }`}
                        >
                          <p className="font-medium">{event.title}</p>
                          {event.location && (
                            <p className="text-[10px] opacity-70">{event.location}</p>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
