// @MVP - Phase 1 — Today Dashboard (Timeline-centric)
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Send,
  Brain,
  Timer,
  Play,
  ListTodo,
  Calendar,
  BookOpen,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import {
  tasks,
  scheduleEvents,
  todayStats,
  processedFragments,
  pipelineStats,
} from "@/lib/mock-data";

// -- Priority --
const priorityBorder: Record<string, string> = {
  urgent: "priority-p0",
  high: "priority-p1",
  medium: "priority-p2",
  low: "priority-p3",
};

const EVENT_COLOR: Record<string, string> = {
  meeting: "bg-violet-50 border-l-violet-400 text-violet-700",
  focus: "bg-emerald-50 border-l-emerald-400 text-emerald-700",
  reminder: "bg-amber-50 border-l-amber-400 text-amber-700",
  event: "bg-blue-50 border-l-blue-400 text-blue-700",
};

const ENTITY_ICON: Record<string, typeof ListTodo> = {
  task: ListTodo,
  event: Calendar,
  knowledge: BookOpen,
};

// Timeline items — merge events + AI-scheduled tasks into one ordered list
interface TimelineItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  type: "event" | "ai-task";
  eventType?: string;
  location?: string;
  priority?: string;
  projectName?: string;
  estimatedMinutes?: number;
  aiScheduled?: boolean;
}

export default function TodayPage() {
  const t = useTranslations("today");
  const [inputValue, setInputValue] = useState("");

  const todayTasks = tasks.filter(
    (task) => task.status !== "done" && task.status !== "postponed",
  );
  const doneTasks = tasks.filter((task) => task.status === "done");

  const todayEvents = scheduleEvents.filter((e) =>
    e.startTime.startsWith("2026-03-10"),
  );

  const completionRate = Math.round(
    (todayStats.completedTasks / todayStats.totalTasks) * 100,
  );

  // AI pending fragments
  const pendingFragments = processedFragments.filter(
    (pf) => pf.processStatus === "needs_confirmation",
  );
  const completedFragments = processedFragments.filter(
    (pf) => pf.processStatus === "completed",
  );

  // Build merged timeline — events + AI-suggested task time slots
  const eventItems: TimelineItem[] = todayEvents.map((e) => ({
    id: e.id,
    time: new Date(e.startTime).toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    endTime: new Date(e.endTime).toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    title: e.title,
    type: "event" as const,
    eventType: e.type,
    location: e.location,
  }));

  // AI-suggested task slots (simulate AI scheduling tasks into free time)
  const aiTaskItems: TimelineItem[] = [
    {
      id: "ai-t1",
      time: "12:30",
      endTime: "14:00",
      title: "准备 Q2 OKR 数据报告",
      type: "ai-task",
      priority: "high",
      projectName: "数据平台",
      estimatedMinutes: 120,
      aiScheduled: true,
    },
    {
      id: "ai-t4",
      time: "17:00",
      endTime: "18:00",
      title: "优化首屏加载性能",
      type: "ai-task",
      priority: "medium",
      projectName: "Ask Dorian",
      estimatedMinutes: 60,
      aiScheduled: true,
    },
  ];

  const timelineItems = [...eventItems, ...aiTaskItems].sort(
    (a, b) => a.time.localeCompare(b.time),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("greeting")}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">
              {t("dateDisplay")}
            </p>
            <Separator orientation="vertical" className="h-3" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {todayStats.completedTasks}
              </span>
              /{todayStats.totalTasks} {t("completed")}
              <span className="mx-1.5">·</span>
              {todayStats.scheduledEvents} {t("events")}
            </p>
          </div>
          <Progress value={completionRate} className="h-1 mt-3 max-w-xs" />
        </div>
        {/* Quick Capture */}
        <div className="hidden md:flex items-center gap-2 w-72">
          <div className="relative flex-1">
            <Sparkles className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-violet-500" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("captureBarPlaceholder")}
              className="w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0">
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main: Timeline + Sidebar ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* ══ Left: Day Timeline ══ */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-medium">
                  {t("schedule")}
                </CardTitle>
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-0.5 text-violet-500 border-violet-200">
                  <Sparkles className="size-2" />
                  AI {t("autoClassify")}
                </Badge>
              </div>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-6 px-2 text-muted-foreground">
                  <ArrowUpRight className="size-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {/* Current time indicator */}
            <div className="flex items-center gap-2 py-1 mb-2">
              <div className="size-2 rounded-full bg-red-500" />
              <div className="flex-1 h-px bg-red-500/40" />
              <span className="text-[10px] text-red-500 font-mono">10:30</span>
            </div>

            {/* Timeline entries */}
            <div className="relative pl-4 border-l border-border space-y-1">
              {timelineItems.map((item) => (
                <div key={item.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[21px] top-3 size-2 rounded-full ${
                    item.type === "ai-task"
                      ? "bg-violet-400 ring-2 ring-violet-100"
                      : "bg-border"
                  }`} />

                  {item.type === "event" ? (
                    /* Event block */
                    <div className={`flex gap-3 rounded-md px-3 py-2.5 border-l-2 ml-2 ${
                      EVENT_COLOR[item.eventType ?? "event"] ?? "bg-muted border-l-border"
                    }`}>
                      <div className="text-[11px] w-20 shrink-0 pt-0.5 font-mono opacity-70">
                        {item.time}
                        {item.endTime && (
                          <span className="block">{item.endTime}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.location && (
                          <p className="text-[11px] opacity-60 mt-0.5">{item.location}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* AI-scheduled task block */
                    <div className={`flex gap-3 rounded-md px-3 py-2.5 ml-2 bg-violet-50/50 border border-violet-100 border-dashed ${
                      priorityBorder[item.priority ?? "medium"]
                    }`}>
                      <div className="text-[11px] w-20 shrink-0 pt-0.5 font-mono text-violet-500">
                        {item.time}
                        {item.endTime && (
                          <span className="block">{item.endTime}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium">{item.title}</p>
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1 gap-0.5 text-violet-500 border-violet-200 shrink-0">
                            <Sparkles className="size-2" />
                            AI
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.projectName && (
                            <span className="text-[11px] text-muted-foreground">{item.projectName}</span>
                          )}
                          {item.estimatedMinutes && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="size-2.5" />
                              {item.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      <Circle className="size-4 text-muted-foreground/40 shrink-0 mt-0.5 cursor-pointer hover:text-foreground transition-colors" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Done tasks */}
            {doneTasks.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="space-y-0.5">
                  {doneTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-1.5">
                      <CheckCircle2 className="size-4 text-muted-foreground/40 shrink-0" />
                      <span className="text-sm text-muted-foreground line-through">
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ══ Right Sidebar ══ */}
        <div className="space-y-4">
          {/* Focus Timer — compact */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Timer className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-medium">
                  {t("focusTime")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/50 px-4 py-4 text-center space-y-2">
                <p className="text-2xl font-mono font-light tracking-wider">
                  {Math.floor(todayStats.focusMinutesCompleted / 60)}:
                  {String(todayStats.focusMinutesCompleted % 60).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground">
                  / {todayStats.focusMinutesPlanned}min {t("focusPlanned")}
                </p>
                <Progress
                  value={(todayStats.focusMinutesCompleted / todayStats.focusMinutesPlanned) * 100}
                  className="h-1"
                />
                <Button size="sm" className="bg-brand-gradient text-white hover:opacity-90 transition-opacity gap-1.5">
                  <Play className="size-3.5" />
                  {t("startFocus")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Feed — compact */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="size-4 text-violet-500" />
                  <CardTitle className="text-sm font-medium">
                    {t("aiFeedTitle")}
                  </CardTitle>
                </div>
                <Link href="/inbox">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-6 px-2 text-muted-foreground">
                    {t("viewAll")}
                    <ArrowUpRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Pipeline stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>{pipelineStats.todayInputs} {t("pipelineInputs")}</span>
                <span>→</span>
                <span>{pipelineStats.generatedTasks} {t("pipelineTasks")}</span>
                <span>·</span>
                <span>{pipelineStats.generatedEvents} {t("pipelineEvents")}</span>
              </div>

              {/* Pending confirmations */}
              {pendingFragments.slice(0, 1).map((pf) => (
                <div key={pf.id} className="rounded-md bg-amber-50 px-3 py-2 space-y-1.5">
                  <p className="text-xs text-amber-800">
                    &ldquo;{pf.rawContent}&rdquo;
                  </p>
                  <p className="text-[11px] text-amber-600 line-clamp-2">
                    {pf.aiResult.interpretation}
                  </p>
                  {pf.aiResult.userPrompt && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pf.aiResult.userPrompt.options.slice(0, 2).map((opt, i) => (
                        <Button key={i} variant={i === 0 ? "default" : "outline"} size="sm" className="text-[10px] h-6">
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Recent completed */}
              {completedFragments.slice(0, 2).map((pf) => (
                <div key={pf.id} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-muted-foreground">&ldquo;{pf.rawContent}&rdquo;</span>
                    <span className="mx-1">→</span>
                    {pf.aiResult.generatedEntities.slice(0, 1).map((e, i) => {
                      const Icon = ENTITY_ICON[e.type] ?? ListTodo;
                      return (
                        <span key={i} className="inline-flex items-center gap-0.5 font-medium text-foreground">
                          <Icon className="size-2.5" />
                          {e.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border p-3">
              <p className="text-lg font-semibold">{todayStats.totalTasks}</p>
              <p className="text-[10px] text-muted-foreground">{t("todayTasks")}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-lg font-semibold">{todayStats.scheduledEvents}</p>
              <p className="text-[10px] text-muted-foreground">{t("events")}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-lg font-semibold">{todayStats.pendingFragments}</p>
              <p className="text-[10px] text-muted-foreground">{t("pendingFragments")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
