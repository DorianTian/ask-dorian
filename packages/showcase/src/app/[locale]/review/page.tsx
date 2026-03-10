// @MVP - Phase 1 — Review
"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  AlertTriangle,
  Timer,
  Download,
  Sparkles,
  ArrowRight,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { weeklyReview, tasks } from "@/lib/mock-data";

// -- Daily breakdown mock data --
const dailyData = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 3 },
  { day: "Wed", count: 1 },
  { day: "Thu", count: 2 },
  { day: "Fri", count: 0 },
  { day: "Sat", count: 0 },
  { day: "Sun", count: 0 },
];

export default function ReviewPage() {
  const t = useTranslations("review");

  const completionRate = Math.round(
    (weeklyReview.completedTasks / weeklyReview.totalTasks) * 100,
  );
  const focusHours = Math.round(weeklyReview.focusMinutes / 60);

  const completedTasks = tasks.filter((task) => task.status === "done");
  const delayedTasks = tasks.filter(
    (task) => task.status !== "done" && task.dueDate && task.dueDate < "2026-03-08",
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {weeklyReview.weekLabel}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Download className="size-3.5" />
          {t("export")}
        </Button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span className="text-sm">
            <span className="font-semibold text-foreground">
              {weeklyReview.completedTasks}
            </span>{" "}
            <span className="text-muted-foreground">{t("completedItems")}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <span className="text-sm">
            <span className={`font-semibold ${weeklyReview.delayedTasks > 0 ? "text-amber-600" : "text-foreground"}`}>
              {weeklyReview.delayedTasks}
            </span>{" "}
            <span className="text-muted-foreground">{t("delayedItems")}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="size-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-semibold text-foreground">{focusHours}h</span>{" "}
            <span className="text-muted-foreground">{t("focusLabel")}</span>
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("completionRate")}</span>
          <span className="font-medium text-foreground">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-1.5" />
      </div>

      {/* ── Completed vs Deferred ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completed */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("completedItems")} ({completedTasks.length})
          </p>
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
            >
              <CheckCircle2 className="size-4 text-muted-foreground/50 shrink-0" />
              <span className="text-sm text-muted-foreground line-through">
                {task.title}
              </span>
              {task.completedAt && (
                <span className="text-[10px] text-muted-foreground/50 ml-auto font-mono">
                  {new Date(task.completedAt).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Deferred */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("delayedItems")} ({delayedTasks.length})
          </p>
          {delayedTasks.length > 0 ? (
            delayedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                <span className="text-sm">{task.title}</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 gap-1">
                    <ArrowRight className="size-2.5" />
                    {t("moveToNextWeek")}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 gap-1 text-muted-foreground">
                    <XCircle className="size-2.5" />
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("noDelayed")}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* ── AI Insights ── */}
      <Card className="border-l-[3px] border-l-transparent bg-card" style={{ borderImage: "linear-gradient(to bottom, var(--brand-from), var(--brand-to)) 1" }}>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-brand-from" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("aiInsights")}
            </p>
          </div>
          <p className="text-sm leading-relaxed">
            {t("insightText")}
          </p>
        </CardContent>
      </Card>

      {/* ── Daily Breakdown Chart ── */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("dailyBreakdown")}
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barSize={28}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Bar
                dataKey="count"
                fill="hsl(var(--foreground))"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
