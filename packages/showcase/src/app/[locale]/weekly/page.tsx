// @MVP - Phase 1 — Weekly Planner
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { tasks, scheduleEvents } from "@/lib/mock-data";

// -- Priority colors --
const priorityBorder: Record<string, string> = {
  urgent: "priority-p0",
  high: "priority-p1",
  medium: "priority-p2",
  low: "priority-p3",
};

const EVENT_COLOR: Record<string, string> = {
  meeting: "bg-violet-50 border-l-violet-400 text-violet-700",
  focus: "bg-emerald-50 border-l-emerald-400 text-emerald-700",
  event: "bg-blue-50 border-l-blue-400 text-blue-700",
  reminder: "bg-amber-50 border-l-amber-400 text-amber-700",
};

// -- Week day data --
interface DayData {
  dayKey: string;
  date: string;
  dateStr: string;
  isToday: boolean;
  isWeekend: boolean;
}

const weekDays: DayData[] = [
  { dayKey: "mon", date: "2026-03-09", dateStr: "3/9", isToday: false, isWeekend: false },
  { dayKey: "tue", date: "2026-03-10", dateStr: "3/10", isToday: true, isWeekend: false },
  { dayKey: "wed", date: "2026-03-11", dateStr: "3/11", isToday: false, isWeekend: false },
  { dayKey: "thu", date: "2026-03-12", dateStr: "3/12", isToday: false, isWeekend: false },
  { dayKey: "fri", date: "2026-03-13", dateStr: "3/13", isToday: false, isWeekend: false },
  { dayKey: "sat", date: "2026-03-14", dateStr: "3/14", isToday: false, isWeekend: true },
  { dayKey: "sun", date: "2026-03-15", dateStr: "3/15", isToday: false, isWeekend: true },
];

export default function WeeklyPage() {
  const t = useTranslations("weekly");
  const [expandedDay, setExpandedDay] = useState<string>("2026-03-10");

  const allTasks = tasks;
  const completedCount = allTasks.filter((tk) => tk.status === "done").length;
  const totalCount = allTasks.length;
  const estimatedHours = allTasks
    .filter((tk) => tk.status !== "done" && tk.estimatedMinutes)
    .reduce((sum, tk) => sum + (tk.estimatedMinutes ?? 0), 0) / 60;

  const completionRate = Math.round((completedCount / totalCount) * 100);

  function getTasksForDay(dateStr: string) {
    return allTasks.filter((tk) => tk.dueDate === dateStr);
  }

  function getEventsForDay(dateStr: string) {
    return scheduleEvents.filter((e) => e.startTime.startsWith(dateStr));
  }

  // Unscheduled tasks
  const weekDates = weekDays.map((d) => d.date);
  const unscheduledTasks = allTasks.filter(
    (tk) =>
      tk.status !== "done" &&
      (!tk.dueDate || !weekDates.includes(tk.dueDate)),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {t("title")}
            </h2>
            <span className="text-sm text-muted-foreground">
              {t("weekRange", { start: "3/9", end: "3/15" })}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {t("completed")}{" "}
                <span className="font-medium text-foreground">
                  {completedCount}/{totalCount}
                </span>
              </span>
              <span>·</span>
              <span>
                {t("estimatedRemaining")}{" "}
                <span className="font-medium text-foreground">
                  {estimatedHours.toFixed(1)}h
                </span>
              </span>
              <span>·</span>
              <span>
                {t("freeSlots")}{" "}
                <span className="font-medium text-emerald-600">12h</span>
              </span>
            </div>
          </div>
          <Progress value={completionRate} className="h-1 mt-3 max-w-sm" />
        </div>
      </div>

      {/* ── Day-by-day List ── */}
      <div className="space-y-2">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day.date);
          const dayEvents = getEventsForDay(day.date);
          const itemCount = dayTasks.length + dayEvents.length;
          const isExpanded = expandedDay === day.date;

          return (
            <Card
              key={day.date}
              className={`border-border transition-colors ${
                day.isToday ? "border-l-2 border-l-[var(--brand-from)]" : ""
              } ${day.isWeekend && itemCount === 0 ? "opacity-50" : ""}`}
            >
              {/* Day header — always visible, clickable */}
              <button
                onClick={() => setExpandedDay(isExpanded ? "" : day.date)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span
                    className={`text-sm font-medium ${
                      day.isToday ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t(day.dayKey)}
                  </span>
                  <span
                    className={`text-sm ${
                      day.isToday ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {day.dateStr}
                  </span>
                  {day.isToday && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                      Today
                    </Badge>
                  )}
                </div>

                {/* Summary chips */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {dayEvents.map((event) => (
                    <span
                      key={event.id}
                      className={`text-[11px] rounded px-2 py-0.5 border-l-2 truncate max-w-[200px] ${
                        EVENT_COLOR[event.type] ?? EVENT_COLOR.event
                      }`}
                    >
                      {new Date(event.startTime).toLocaleTimeString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}{" "}
                      {event.title}
                    </span>
                  ))}
                  {dayTasks.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {dayTasks.filter((tk) => tk.status === "done").length}/{dayTasks.length} {t("completed").toLowerCase()}
                    </span>
                  )}
                </div>

                {isExpanded ? (
                  <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (itemCount > 0 || day.isToday) && (
                <CardContent className="pt-0 pb-3 space-y-1">
                  <Separator className="mb-2" />

                  {/* Events */}
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`flex gap-3 rounded-md px-3 py-2 border-l-2 ${
                        EVENT_COLOR[event.type] ?? "bg-muted border-l-border"
                      }`}
                    >
                      <div className="text-[11px] w-20 shrink-0 pt-0.5 font-mono opacity-70">
                        {new Date(event.startTime).toLocaleTimeString("en", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                        {" - "}
                        {new Date(event.endTime).toLocaleTimeString("en", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.title}</p>
                        {event.location && (
                          <p className="text-[11px] opacity-60 mt-0.5">
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Tasks */}
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 group hover:bg-muted/50 transition-colors ${priorityBorder[task.priority]}`}
                    >
                      {task.status === "done" ? (
                        <CheckCircle2 className="size-4 text-muted-foreground/40 shrink-0" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground/40 shrink-0 cursor-pointer hover:text-foreground transition-colors" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm ${
                            task.status === "done"
                              ? "line-through text-muted-foreground"
                              : "font-medium"
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.projectName && (
                            <span className="text-[11px] text-muted-foreground">
                              {task.projectName}
                            </span>
                          )}
                          {task.estimatedMinutes && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="size-2.5" />
                              {task.estimatedMinutes}m
                            </span>
                          )}
                          {task.sourceFragmentId && (
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 px-1.5 gap-0.5 text-violet-500 border-violet-200"
                            >
                              <Sparkles className="size-2" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty today */}
                  {itemCount === 0 && day.isToday && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      —
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Unscheduled ── */}
      {unscheduledTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ChevronDown className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("unscheduled")}
            </span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {unscheduledTasks.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors ${priorityBorder[task.priority]}`}
              >
                <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                <span className="text-sm">{task.title}</span>
                {task.estimatedMinutes && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                    <Clock className="size-2.5" />
                    ~{Math.round(task.estimatedMinutes / 60)}h
                  </span>
                )}
                {task.sourceFragmentId && (
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 gap-0.5 text-violet-500 border-violet-200"
                  >
                    <Sparkles className="size-2" />
                    AI
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
