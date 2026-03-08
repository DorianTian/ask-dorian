// @MVP - Phase 1
"use client"

import { useTranslations } from "next-intl"
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  CalendarClock,
  Inbox,
  Zap,
  ArrowRight,
  Timer,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { tasks, scheduleEvents, fragments, todayStats } from "@/lib/mock-data"

const priorityColor = {
  urgent: "text-red-600 bg-red-50",
  high: "text-orange-600 bg-orange-50",
  medium: "text-blue-600 bg-blue-50",
  low: "text-muted-foreground bg-muted",
}

export default function TodayPage() {
  const t = useTranslations("today")

  const todayTasks = tasks.filter(
    (task) => task.dueDate === "2026-03-08" || task.status === "in-progress"
  )
  const todayEvents = scheduleEvents.filter((e) =>
    e.startTime.startsWith("2026-03-08")
  )
  const pendingFragments = fragments.filter((f) => f.status === "unprocessed")

  const completionRate = Math.round(
    (todayStats.completedTasks / todayStats.totalTasks) * 100
  )

  return (
    <div className="space-y-6">
      {/* Greeting & Stats Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("greeting")}
          </h2>
          <p className="text-sm text-muted-foreground">
            2026-03-08 Sunday
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Zap className="size-3.5" />
          {t("quickCapture")}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("todayTasks")}</span>
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle>
              <span className="text-2xl font-bold">
                {todayStats.completedTasks}/{todayStats.totalTasks}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-1.5" />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("schedule")}</span>
              <CalendarClock className="size-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle>
              <span className="text-2xl font-bold">{todayStats.scheduledEvents}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("upcoming")}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("pendingFragments")}</span>
              <Inbox className="size-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle>
              <span className="text-2xl font-bold text-amber-600">
                {todayStats.pendingFragments}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("pendingFragments")}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("focusTime")}</span>
              <Timer className="size-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle>
              <span className="text-2xl font-bold">
                {Math.round(todayStats.focusMinutesCompleted / 60)}h/
                {Math.round(todayStats.focusMinutesPlanned / 60)}h
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={(todayStats.focusMinutesCompleted / todayStats.focusMinutesPlanned) * 100}
              className="h-1.5"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Today's Tasks */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4" />
              {t("todayTasks")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {task.status === "done" ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.status === "done" ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.projectName && (
                      <span className="text-xs text-muted-foreground">
                        {task.projectName}
                      </span>
                    )}
                    {task.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Clock className="size-3" />
                        {task.estimatedMinutes}min
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs shrink-0 ${priorityColor[task.priority]}`}
                >
                  {task.priority}
                </Badge>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    {t("markDone")}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    {t("postpone")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Schedule & Fragments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="size-4" />
                {t("schedule")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="text-xs text-muted-foreground w-12 shrink-0 pt-0.5">
                    {new Date(event.startTime).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground">
                        {event.location}
                      </p>
                    )}
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Fragments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                {t("pendingFragments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingFragments.length > 0 ? (
                pendingFragments.map((fragment) => (
                  <div
                    key={fragment.id}
                    className="rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                  >
                    <p className="text-sm">{fragment.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(fragment.createdAt).toLocaleTimeString("en", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                      <Button variant="outline" size="sm" className="text-xs h-6 gap-1">
                        {t("addToCalendar")}
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All fragments processed
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
