// @MVP - Phase 1
"use client"

import { useTranslations } from "next-intl"
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Timer,
  TrendingUp,
  Download,
  FileText,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { weeklyReview, tasks, knowledgeItems } from "@/lib/mock-data"

export default function ReviewPage() {
  const t = useTranslations("review")

  const completionRate = Math.round(
    (weeklyReview.completedTasks / weeklyReview.totalTasks) * 100
  )
  const focusHours = Math.round(weeklyReview.focusMinutes / 60)

  const completedTasks = tasks.filter((t) => t.status === "done")
  const delayedTasks = tasks.filter(
    (t) => t.status !== "done" && t.dueDate && t.dueDate < "2026-03-08"
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{weeklyReview.weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            {t("export")}
          </Button>
          <Button size="sm" className="gap-1.5">
            <FileText className="size-3.5" />
            {t("generateReport")}
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("completedItems")}</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              {weeklyReview.completedTasks}/{weeklyReview.totalTasks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-1.5" />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("delayedItems")}</span>
              <AlertTriangle className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {weeklyReview.delayedTasks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Need rescheduling</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>{t("knowledgeSediment")}</span>
              <BookOpen className="size-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl">{weeklyReview.knowledgeItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">New entries this week</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>Focus Time</span>
              <Timer className="size-4 text-violet-500" />
            </CardDescription>
            <CardTitle className="text-2xl text-violet-600">{focusHours}h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Deep work this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Key Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-amber-500" />
              {t("keyDecisions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyReview.keyDecisions.map((decision, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  {i + 1}
                </div>
                <p className="text-sm">{decision}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Knowledge Sediment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-emerald-500" />
              {t("knowledgeSediment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {knowledgeItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {item.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                  {item.projectName && (
                    <span className="text-[10px] text-muted-foreground">{item.projectName}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Completed & Delayed Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4 text-emerald-500" />
              {t("completedItems")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="line-through">{task.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              {t("delayedItems")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {delayedTasks.length > 0 ? (
              <div className="space-y-2">
                {delayedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                    <span>{task.title}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {task.dueDate}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No delayed items this week
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
