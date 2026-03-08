"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  FileText,
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
import { Textarea } from "@/components/ui/textarea"

interface EveningReviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOTAL_STEPS = 3

// -- Mock data --
const completedTasks = [
  { id: "ct1", title: "Code Review: Flink CDC connector" },
  { id: "ct2", title: "准备 Q2 OKR 数据报告" },
  { id: "ct3", title: "1:1 with Tech Lead" },
  { id: "ct4", title: "Sprint Review 参会" },
]

const unfinishedTasks = [
  { id: "ut1", title: "优化首屏加载性能" },
  { id: "ut2", title: "转下个月房租" },
]

export function EveningReview({ open, onOpenChange }: EveningReviewProps) {
  const [step, setStep] = useState(1)
  const [reflection, setReflection] = useState("")
  const t = useTranslations("eveningReview")

  const totalTasks = completedTasks.length + unfinishedTasks.length

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
    setReflection("")
    onOpenChange(false)
  }

  const stepTitles = [
    t("todaySummary"),
    t("unfinishedTasks"),
    t("reflections"),
  ]

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-500" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {stepTitles[step - 1]} ({step}/{TOTAL_STEPS})
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[280px]">
          {/* Step 1 - Today Summary */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted/50 p-3 flex-1 text-center">
                  <p className="text-2xl font-bold">
                    {completedTasks.length}/{totalTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("tasksCompleted", {
                      completed: completedTasks.length,
                      total: totalTasks,
                    })}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 flex-1 text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Clock className="size-4" />
                    2h30m
                  </p>
                  <p className="text-xs text-muted-foreground">{t("focusTime")}</p>
                </div>
              </div>

              {/* Completed */}
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-muted-foreground line-through">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Unfinished */}
              <div className="space-y-2">
                {unfinishedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/30 p-2.5">
                    <Circle className="size-4 text-amber-500 shrink-0" />
                    <span className="text-sm">{task.title}</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto text-amber-600 bg-amber-100">
                      {t("unfinishedTasks")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 - Unfinished Tasks Disposition */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("unfinishedTasks")}
              </p>
              {unfinishedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border p-3 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Circle className="size-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <div className="flex gap-1.5 pl-6">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      {t("continueTomorrow")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      {t("reschedule")}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground">
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3 - Reflections */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  {t("reflections")}
                </p>
                <Textarea
                  placeholder={t("reflectionPlaceholder")}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5">
                  <FileText className="size-3.5" />
                  {t("generateReport")}
                </Button>
                <Button className="flex-1 gap-1.5" onClick={handleClose}>
                  <CheckCircle2 className="size-3.5" />
                  {t("finishReview")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 3 && (
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
