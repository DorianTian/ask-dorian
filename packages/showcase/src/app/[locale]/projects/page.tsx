// @MVP - Phase 1
"use client"

import { useTranslations } from "next-intl"
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  CalendarClock,
  MoreHorizontal,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { projects, tasks, knowledgeItems, scheduleEvents } from "@/lib/mock-data"

export default function ProjectsPage() {
  const t = useTranslations("projects")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <Button size="sm" className="gap-1.5">
          <Plus className="size-3.5" />
          {t("newProject")}
        </Button>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id)
          const projectKnowledge = knowledgeItems.filter((k) => k.projectId === project.id)
          const projectEvents = scheduleEvents.filter((e) => e.projectId === project.id)
          const progress = project.taskCount > 0
            ? Math.round((project.completedTaskCount / project.taskCount) * 100)
            : 0

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {project.completedTaskCount}/{project.taskCount} tasks
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    {projectTasks.length} {t("tasks")}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3" />
                    {projectKnowledge.length} {t("knowledge")}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3" />
                    {projectEvents.length} {t("events")}
                  </span>
                </div>

                <Badge variant="outline" className="text-[10px]">
                  {project.status}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Project Detail (first project as example) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: projects[0].color }}
            />
            <CardTitle>{projects[0].name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">{t("tasks")}</TabsTrigger>
              <TabsTrigger value="knowledge">{t("knowledge")}</TabsTrigger>
              <TabsTrigger value="events">{t("events")}</TabsTrigger>
              <TabsTrigger value="context">{t("context")}</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4 space-y-2">
              {tasks
                .filter((t) => t.projectId === projects[0].id)
                .map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                    {task.status === "done" ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm flex-1 ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Clock className="size-3" />
                        {task.dueDate}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                  </div>
                ))}
            </TabsContent>

            {["knowledge", "events", "context"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  {tab} view — content here
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
