// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FolderOpen,
  FileText,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  LinkIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/navigation"
import { scheduleEvents, tasks, fragments, projects } from "@/lib/mock-data"

export default function EventDetailPage() {
  const t = useTranslations("eventDetail")

  // Use scheduleEvents[0]: Q2 OKR 对齐会
  const event = scheduleEvents[0]

  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  // Related project
  const project = projects.find((p) => p.id === event.projectId)

  // Source fragment
  const sourceFragment = event.sourceFragmentId
    ? fragments.find((f) => f.id === event.sourceFragmentId)
    : null

  // Related tasks (same project)
  const relatedTasks = event.projectId
    ? tasks.filter((task) => task.projectId === event.projectId)
    : []

  const typeColorMap: Record<string, string> = {
    meeting: "border-purple-200 bg-purple-50 text-purple-700",
    focus: "border-blue-200 bg-blue-50 text-blue-700",
    reminder: "border-amber-200 bg-amber-50 text-amber-700",
    event: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }

  const typeColor = typeColorMap[event.type] || typeColorMap.event

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/calendar">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            {t("back")}
          </Button>
        </Link>
        <Badge className={`${typeColor} border`}>
          {t(event.type)}
        </Badge>
      </div>

      {/* Event Title */}
      <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>

      {/* Time Info */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {start.toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {start.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {end.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t("duration")}:
              {durationHours > 0 && ` ${durationHours} ${t("hours")}`}
              {durationMinutes > 0 && ` ${durationMinutes} ${t("minutes")}`}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("location")}</p>
                    <p className="text-sm">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("attendees")}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {event.attendees.map((attendee) => (
                        <Badge key={attendee} variant="secondary" className="text-xs">
                          {attendee}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Project */}
              {project && (
                <div className="flex items-center gap-3">
                  <FolderOpen className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("project")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm">{project.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Fragment */}
              {sourceFragment && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("sourceFragment")}</p>
                    <div className="rounded-md border bg-muted/50 p-2 mt-1">
                      <p className="text-xs">{sourceFragment.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prep Notes */}
          {event.prepNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  {t("prepNotes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="text-sm leading-relaxed">{event.prepNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit3 className="size-3.5" />
              {t("edit")}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="size-3.5" />
              {t("delete")}
            </Button>
          </div>
        </div>

        {/* Right: Related Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("relatedTasks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  {task.status === "done" ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={`flex-1 ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                </div>
              ))}
              {relatedTasks.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">暂无关联任务</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
