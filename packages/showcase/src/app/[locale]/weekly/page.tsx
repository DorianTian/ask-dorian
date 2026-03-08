// @MVP - Phase 1
"use client"

import { useTranslations } from "next-intl"
import {
  CalendarRange,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { tasks, scheduleEvents } from "@/lib/mock-data"

const weekDays = ["Mon 3/9", "Tue 3/10", "Wed 3/11", "Thu 3/12", "Fri 3/13", "Sat 3/14", "Sun 3/15"]

export default function WeeklyPage() {
  const t = useTranslations("weekly")

  const activeTasks = tasks.filter((t) => t.status !== "done")
  const highPriorityTasks = tasks.filter(
    (t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "done"
  )

  return (
    <div className="space-y-6">
      {/* Week Overview Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>{t("weekPlan")}</CardDescription>
            <CardTitle className="text-2xl">{activeTasks.length} tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={40} className="h-1.5" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>{t("priorities")}</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {highPriorityTasks.length} high priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>{t("freeSlots")}</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">6 slots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Available for scheduling</p>
          </CardContent>
        </Card>
      </div>

      {/* Week Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="size-4" />
            {t("schedulePlan")} — Week 11
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={day} className="space-y-2">
                <div
                  className={`text-center text-xs font-medium py-1.5 rounded ${
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {day}
                </div>
                {/* Mock time blocks */}
                {index === 0 && (
                  <>
                    <div className="rounded border border-blue-200 bg-blue-50 p-1.5 text-[10px]">
                      <p className="font-medium text-blue-700">Focus: CDC</p>
                      <p className="text-blue-500">9:00–12:00</p>
                    </div>
                    <div className="rounded border border-purple-200 bg-purple-50 p-1.5 text-[10px]">
                      <p className="font-medium text-purple-700">1:1 Meeting</p>
                      <p className="text-purple-500">14:00</p>
                    </div>
                  </>
                )}
                {index === 1 && (
                  <div className="rounded border border-orange-200 bg-orange-50 p-1.5 text-[10px]">
                    <p className="font-medium text-orange-700">Q2 OKR Report</p>
                    <p className="text-orange-500">Due</p>
                  </div>
                )}
                {index === 2 && (
                  <div className="rounded border border-red-200 bg-red-50 p-1.5 text-[10px]">
                    <p className="font-medium text-red-700">OKR Meeting</p>
                    <p className="text-red-500">14:00–15:30</p>
                  </div>
                )}
                {index === 4 && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 p-1.5 text-[10px]">
                    <p className="font-medium text-emerald-700">Dentist</p>
                    <p className="text-emerald-500">15:00</p>
                  </div>
                )}
                {/* Empty slots */}
                {![0, 1, 2, 4].includes(index) && (
                  <div className="rounded border border-dashed border-muted-foreground/20 p-1.5 text-center text-[10px] text-muted-foreground">
                    Free
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-4 text-amber-500" />
            {t("importantItems")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {highPriorityTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
              <AlertTriangle className="size-4 text-orange-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.projectName && (
                    <span className="text-xs text-muted-foreground">{task.projectName}</span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Clock className="size-3" />
                      {task.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">{task.priority}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
