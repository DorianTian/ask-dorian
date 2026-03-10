// @MVP - Phase 1 — Projects
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { projects, tasks, knowledgeItems, scheduleEvents } from "@/lib/mock-data";

// -- Priority border --
const priorityBorder: Record<string, string> = {
  urgent: "priority-p0",
  high: "priority-p1",
  medium: "priority-p2",
  low: "priority-p3",
};

// -- Status label --
const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  archived: "bg-muted text-muted-foreground",
};

type ActiveTab = "tasks" | "events" | "notes" | "activity";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");

  const selected = projects.find((p) => p.id === selectedProject);

  // -- Project Detail View --
  if (selected) {
    const projectTasks = tasks.filter((t) => t.projectId === selected.id);
    const projectKnowledge = knowledgeItems.filter((k) => k.projectId === selected.id);
    const projectEvents = scheduleEvents.filter((e) => e.projectId === selected.id);

    // Group tasks by priority
    const priorities = ["urgent", "high", "medium", "low"] as const;
    const tasksByPriority = priorities
      .map((p) => ({
        priority: p,
        tasks: projectTasks.filter((t) => t.priority === p),
      }))
      .filter((g) => g.tasks.length > 0);

    const overdueTasks = projectTasks.filter(
      (t) => t.status !== "done" && t.dueDate && t.dueDate < "2026-03-10",
    );

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="size-3.5" />
            {t("allProjects")}
          </button>
          <div className="flex items-center gap-3">
            <div
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <Badge className={`text-[10px] ${STATUS_STYLE[selected.status] ?? ""}`}>
              {selected.status}
            </Badge>
          </div>
          {selected.description && (
            <p className="text-sm text-muted-foreground mt-1 ml-6">
              {selected.description}
            </p>
          )}
          <div className="flex items-center gap-3 ml-6 mt-2 text-xs text-muted-foreground">
            <span>
              {selected.completedTaskCount}/{selected.taskCount} tasks
            </span>
            <span>·</span>
            <span>{projectKnowledge.length} notes</span>
            <span>·</span>
            <span>{projectEvents.length} events</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border">
          {(["tasks", "events", "notes", "activity"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 pb-2 text-sm transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(tab === "notes" ? "knowledge" : tab)}
            </button>
          ))}
        </div>

        {/* Tasks tab content */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {overdueTasks.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="size-3.5" />
                {overdueTasks.length} overdue
              </div>
            )}
            {tasksByPriority.map((group) => (
              <div key={group.priority} className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-1">
                  P{priorities.indexOf(group.priority)}
                </p>
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors ${priorityBorder[task.priority]}`}
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="size-4 text-muted-foreground/50 shrink-0" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <Link
                      href={`/tasks/${task.id}`}
                      className={`text-sm flex-1 hover:underline ${
                        task.status === "done"
                          ? "line-through text-muted-foreground"
                          : "font-medium"
                      }`}
                    >
                      {task.title}
                    </Link>
                    {task.dueDate && (
                      <span
                        className={`text-[11px] flex items-center gap-0.5 ${
                          task.status !== "done" && task.dueDate < "2026-03-10"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Clock className="size-2.5" />
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== "tasks" && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {activeTab} view
          </div>
        )}
      </div>
    );
  }

  // -- Project Grid View --
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <Button size="sm" className="gap-1.5 h-8">
          <Plus className="size-3.5" />
          {t("newProject")}
        </Button>
      </div>

      {/* Project Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => {
          const overdue = tasks.filter(
            (t) =>
              t.projectId === project.id &&
              t.status !== "done" &&
              t.dueDate &&
              t.dueDate < "2026-03-10",
          );
          const progress =
            project.taskCount > 0
              ? Math.round(
                  (project.completedTaskCount / project.taskCount) * 100,
                )
              : 0;

          return (
            <Card
              key={project.id}
              className="cursor-pointer border-border hover:border-foreground/15 transition-colors"
              onClick={() => setSelectedProject(project.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm font-semibold">{project.name}</span>
                  <Badge
                    className={`text-[9px] ml-auto ${
                      STATUS_STYLE[project.status] ?? ""
                    }`}
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {project.completedTaskCount}/{project.taskCount} tasks
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-1"
                  style={
                    {
                      "--tw-progress-fill": project.color,
                    } as React.CSSProperties
                  }
                />
                {overdue.length > 0 && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {overdue.length} overdue
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* New Project Card */}
        <Card className="cursor-pointer border-dashed border-border hover:border-foreground/15 transition-colors flex items-center justify-center min-h-[120px]">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="size-5" />
            <span className="text-sm">{t("newProject")}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
