"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { format, startOfWeek, subWeeks } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  CheckCircle2,
  CalendarDays,
  BookOpen,
  Sparkles,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"

import { useWeekReview } from "@ask-dorian/core/hooks"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ReviewPage() {
  const t = useTranslations("review")

  const params = useMemo(() => {
    // Review last complete week by default
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), {
      weekStartsOn: 1,
    })
    return {
      weekStart: format(lastWeekStart, "yyyy-MM-dd"),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }, [])

  const { data, error, isLoading } = useWeekReview(params)

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        {data && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("thisWeek")}: {data.weekStart} — {data.weekEnd}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
              label={t("completed")}
              value={data.completed.length}
            />
            <StatCard
              icon={<CalendarDays className="h-5 w-5 text-fragment-event" />}
              label={t("events")}
              value={data.events.length}
            />
            <StatCard
              icon={<BookOpen className="h-5 w-5 text-brand-from" />}
              label={t("knowledge")}
              value={data.knowledge.length}
            />
            <StatCard
              icon={<Sparkles className="h-5 w-5 text-fragment-uncertain" />}
              label="Fragments"
              value={data.fragmentsProcessed}
            />
          </div>

          {/* Completed Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {t("completed")} ({data.completed.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.completed.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  这周没有完成的任务
                </p>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-1.5 pr-3">
                    {data.completed.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        <span className="flex-1 text-sm">{task.title}</span>
                        {task.completedAt && (
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(task.completedAt), "M/d HH:mm")}
                          </span>
                        )}
                        {task.priority !== "none" && (
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-fragment-event" />
                {t("events")} ({data.events.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.events.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  这周没有日程
                </p>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-1.5 pr-3">
                    {data.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5"
                      >
                        <div className="h-2 w-2 shrink-0 rounded-full bg-fragment-event" />
                        <span className="flex-1 text-sm">{event.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(event.startTime), "M/d HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Knowledge */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-brand-from" />
                {t("knowledge")} ({data.knowledge.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.knowledge.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  这周没有知识沉淀
                </p>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-2 pr-3">
                    {data.knowledge.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border px-3 py-2"
                      >
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.summary && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(item.createdAt), "M/d")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        {icon}
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
