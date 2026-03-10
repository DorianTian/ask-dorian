"use client"

import { useTranslations } from "next-intl"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  Target,
  Clock,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
} from "lucide-react"
import { useSWRConfig } from "swr"

import { useWeeklyDashboard } from "@ask-dorian/core/hooks"
import { taskApi } from "@ask-dorian/core/api"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskItem } from "@/components/shared/task-item"
import { EventItem } from "@/components/shared/event-item"

export default function WeeklyPage() {
  const t = useTranslations("weekly")
  const { data, error, isLoading, mutate: mutateDashboard } = useWeeklyDashboard()
  const { mutate } = useSWRConfig()

  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "M/d", { locale: zhCN })
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "M/d", { locale: zhCN })

  async function handleCompleteTask(id: string) {
    await taskApi.complete(id)
    mutateDashboard()
    mutate((key: string) => typeof key === "string" && key.includes("/tasks"))
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {weekStart} — {weekEnd}
          </p>
        </div>
        {data && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{data.tasks.scheduled.length + data.tasks.due.length} tasks</span>
            <span>{data.events.length} events</span>
            {data.tasks.overdue.length > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {data.tasks.overdue.length} overdue
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Four-Quadrant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Q1: Focus — AI arranged priorities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-brand-from" />
                {t("focus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-56">
                <div className="space-y-2 pr-2">
                  {[...data.tasks.scheduled]
                    .sort((a, b) => {
                      const order = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }
                      return order[a.priority] - order[b.priority]
                    })
                    .slice(0, 8)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  {data.tasks.scheduled.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      本周没有安排任务
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Q2: Time Allocation — Events timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-fragment-event" />
                {t("timeAllocation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-56">
                <div className="space-y-2 pr-2">
                  {data.events.map((event) => (
                    <EventItem key={event.id} event={event} compact />
                  ))}
                  {data.events.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      本周没有日程
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator className="col-span-full my-0 hidden md:block" />

          {/* Q3: Decisions — needs user input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <HelpCircle className="h-4 w-4 text-fragment-uncertain" />
                {t("decisions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-56">
                <div className="space-y-2 pr-2">
                  {data.tasks.due.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                  {data.tasks.overdue.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                  {data.tasks.due.length === 0 &&
                    data.tasks.overdue.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        没有需要决策的事项
                      </p>
                    )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Q4: Progress — stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {t("progress")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Task stats */}
                <div className="grid grid-cols-3 gap-3">
                  <StatBlock
                    label="Scheduled"
                    value={data.tasks.scheduled.length}
                    color="text-foreground"
                  />
                  <StatBlock
                    label="Due"
                    value={data.tasks.due.length}
                    color="text-fragment-uncertain"
                  />
                  <StatBlock
                    label="Overdue"
                    value={data.tasks.overdue.length}
                    color="text-destructive"
                  />
                </div>

                <Separator />

                {/* Events count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{data.events.length} events this week</span>
                </div>

                {/* Estimated time */}
                <div className="text-sm text-muted-foreground">
                  Total estimated:{" "}
                  <span className="font-medium text-foreground">
                    {data.tasks.scheduled.reduce(
                      (sum, t) => sum + (t.estimatedMinutes ?? 0),
                      0,
                    )}
                    m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-md bg-muted/50 p-3 text-center">
      <p className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
