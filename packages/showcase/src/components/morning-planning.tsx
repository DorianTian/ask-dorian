"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
  CalendarClock,
  Inbox,
  Sparkles,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MorningPlanningProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOTAL_STEPS = 4

// -- Mock data hardcoded in component --
const yesterdayTasks = [
  { id: "yt1", title: "Code Review: Flink CDC connector", completed: true },
  { id: "yt2", title: "写周报", completed: true },
  { id: "yt3", title: "优化首屏加载性能", completed: false },
]

const pendingFragments = [
  {
    id: "pf1",
    content: "下周三和产品团队对齐 Q2 OKR，需要提前准备数据报告",
    time: "09:15",
  },
  {
    id: "pf2",
    content: "下午和设计师过一下新版收集箱的交互稿，重点看移动端适配",
    time: "10:02",
  },
]

const todaySchedule = [
  { id: "ts1", title: "深度工作：Flink CDC 开发", time: "09:00 - 12:00", type: "focus" },
  { id: "ts2", title: "1:1 with Tech Lead", time: "14:00 - 14:30", type: "meeting" },
  { id: "ts3", title: "Sprint Review", time: "16:00 - 17:00", type: "meeting" },
]

const todayTasksList = [
  { id: "tt1", title: "准备 Q2 OKR 数据报告", minutes: 120 },
  { id: "tt2", title: "Code Review: Flink CDC connector", minutes: 60 },
  { id: "tt3", title: "优化首屏加载性能", minutes: 180 },
]

export function MorningPlanning({ open, onOpenChange }: MorningPlanningProps) {
  const [step, setStep] = useState(1)
  const t = useTranslations("morningPlanning")

  const scheduledHours = todayTasksList.reduce((sum, t) => sum + t.minutes, 0) / 60

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    }
  }

  const handleSkip = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setStep(1)
    onOpenChange(false)
  }

  const stepTitles = [
    t("yesterdayReview"),
    t("pendingFragments"),
    t("todayPlan"),
    t("ready"),
  ]

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {stepTitles[step - 1]} ({step}/{TOTAL_STEPS})
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[280px]">
          {/* Step 1 - Yesterday Review */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("yesterdayReview")}
              </p>
              {yesterdayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {task.completed ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`text-sm flex-1 ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "font-medium"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.completed ? (
                    <Badge variant="secondary" className="text-xs text-emerald-600 bg-emerald-50">
                      {t("completed")}
                    </Badge>
                  ) : (
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        {t("continueToday")}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        {t("postpone")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 2 - Pending Fragments */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Inbox className="size-3.5" />
                {t("pendingFragments")}
              </p>
              {pendingFragments.map((fragment) => (
                <div
                  key={fragment.id}
                  className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-2"
                >
                  <p className="text-sm">{fragment.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {fragment.time}
                    </span>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                        <ArrowRight className="size-3" />
                        {t("quickClassify")}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        {t("processLater")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3 - Today Plan */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Schedule */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  {t("todayPlan")}
                </p>
                {todaySchedule.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">
                      {event.time}
                    </span>
                    <span className="text-sm flex-1">{event.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {todayTasksList.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <Circle className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1">{task.title}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Clock className="size-3" />
                      {task.minutes}min
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <p>{t("scheduledHours", { hours: scheduledHours.toFixed(1) })}</p>
                <p>{t("suggestedHours")}</p>
              </div>
            </div>
          )}

          {/* Step 4 - Ready */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] space-y-6">
              <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="size-8 text-emerald-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">{t("dashboardReady")}</p>
              </div>
              <Button size="lg" className="gap-2" onClick={handleClose}>
                {t("startWork")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <DialogFooter>
            {/* Step indicators */}
            <div className="flex items-center gap-1.5 mr-auto">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`size-1.5 rounded-full transition-colors ${
                    i + 1 === step
                      ? "bg-primary"
                      : i + 1 < step
                        ? "bg-primary/40"
                        : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              {t("skip")}
            </Button>
            <Button size="sm" onClick={handleNext}>
              {t("next")}
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
