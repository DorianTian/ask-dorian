// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  CalendarClock,
  Edit3,
  Archive,
  Tag,
  Activity,
  FileText,
  LinkIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/navigation"
import { projects, tasks, knowledgeItems, scheduleEvents } from "@/lib/mock-data"

export default function ProjectDetailPage() {
  const t = useTranslations("projectDetail")
  const [activeTab, setActiveTab] = useState("tasks")

  // Use projects[0]: 数据平台
  const project = projects[0]
  const projectTasks = tasks.filter((task) => task.projectId === project.id)
  const projectKnowledge = knowledgeItems.filter((k) => k.projectId === project.id)
  const projectEvents = scheduleEvents.filter((e) => e.projectId === project.id)

  const progress = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  const todoTasks = projectTasks.filter((task) => task.status === "todo")
  const inProgressTasks = projectTasks.filter((task) => task.status === "in-progress")
  const doneTasks = projectTasks.filter((task) => task.status === "done")

  // Mock activity log
  const activityLog = [
    { id: "a1", type: "task_complete", text: "完成任务「写周报」", time: "2026-03-07T17:00:00" },
    { id: "a2", type: "knowledge_add", text: "新增知识「Flink CDC 替代批量同步方案决策」", time: "2026-03-07T17:30:00" },
    { id: "a3", type: "fragment_link", text: "碎片关联到项目：会议纪要 - Flink CDC 决策", time: "2026-03-07T17:31:00" },
    { id: "a4", type: "task_create", text: "创建任务「准备 Q2 OKR 数据报告」", time: "2026-03-08T09:15:00" },
    { id: "a5", type: "event_add", text: "新增事件「Sprint Review」", time: "2026-03-08T10:00:00" },
  ]

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            {t("back")}
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Edit3 className="size-3.5" />
            {t("editProject")}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Archive className="size-3.5" />
            {t("archive")}
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            {t("newTask")}
          </Button>
        </div>
      </div>

      {/* Project Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="size-4 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant="outline">{project.status}</Badge>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {t("progress")}: {project.completedTaskCount}/{project.taskCount}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">{t("totalTasks")}</p>
            <p className="text-2xl font-bold">{project.taskCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">{t("completed")}</p>
            <p className="text-2xl font-bold text-emerald-600">{project.completedTaskCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">{t("inProgress")}</p>
            <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">{t("knowledgeCount")}</p>
            <p className="text-2xl font-bold text-purple-600">{projectKnowledge.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1">
            <CheckCircle2 className="size-3" />
            {t("tasks")}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1">
            <BookOpen className="size-3" />
            {t("knowledge")}
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1">
            <CalendarClock className="size-3" />
            {t("events")}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1">
            <Activity className="size-3" />
            {t("activity")}
          </TabsTrigger>
        </TabsList>

        {/* Tasks Kanban */}
        <TabsContent value="tasks" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Todo Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Circle className="size-3.5 text-muted-foreground" />
                {t("todo")} ({todoTasks.length})
              </h3>
              {todoTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="size-2.5" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {todoTasks.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">无待办任务</p>
              )}
            </div>

            {/* In Progress Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="size-3.5 text-blue-500" />
                {t("inProgress")} ({inProgressTasks.length})
              </h3>
              {inProgressTasks.map((task) => (
                <Card key={task.id} className="border-blue-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="size-2.5" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {inProgressTasks.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">无进行中任务</p>
              )}
            </div>

            {/* Done Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                {t("done")} ({doneTasks.length})
              </h3>
              {doneTasks.map((task) => (
                <Card key={task.id} className="border-emerald-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium line-through text-muted-foreground">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {doneTasks.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">无已完成任务</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Tab */}
        <TabsContent value="knowledge" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {projectKnowledge.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-3 text-xs">
                    {item.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        <Tag className="size-2.5 mr-0.5" />{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {projectKnowledge.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center col-span-2">暂无知识条目</p>
            )}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-4">
          <div className="space-y-3">
            {projectEvents.map((event) => {
              const start = new Date(event.startTime)
              const end = new Date(event.endTime)
              return (
                <div key={event.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="text-center shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {start.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm font-medium">
                      {start.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-auto self-stretch" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          event.type === "meeting"
                            ? "border-purple-200 text-purple-700"
                            : event.type === "focus"
                              ? "border-blue-200 text-blue-700"
                              : "border-emerald-200 text-emerald-700"
                        }`}
                      >
                        {event.type}
                      </Badge>
                      {event.location && <span>{event.location}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {projectEvents.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">暂无事件</p>
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <div className="space-y-0">
            {activityLog.map((log, idx) => (
              <div key={log.id} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className="size-2 rounded-full bg-muted-foreground shrink-0 mt-1.5" />
                  {idx < activityLog.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm">{log.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
