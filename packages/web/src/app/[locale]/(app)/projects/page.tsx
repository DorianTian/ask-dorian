"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import {
  FolderOpen,
  Plus,
  AlertTriangle,
  MoreHorizontal,
  Archive,
  Trash2,
} from "lucide-react"

import { useProjects } from "@ask-dorian/core/hooks"
import { projectApi } from "@ask-dorian/core/api"
import type { ProjectStatus } from "@ask-dorian/core/types"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/shared/empty-state"

const statusLabels: Record<ProjectStatus, string> = {
  active: "进行中",
  paused: "暂停",
  completed: "已完成",
  archived: "已归档",
}

const statusColors: Record<ProjectStatus, string> = {
  active: "bg-green-500",
  paused: "bg-amber-500",
  completed: "bg-blue-500",
  archived: "bg-muted-foreground",
}

export default function ProjectsPage() {
  const t = useTranslations("projects")
  const { data: projects, error, isLoading, mutate } = useProjects()

  const active = projects?.filter((p) => p.status === "active") ?? []
  const other = projects?.filter((p) => p.status !== "active") ?? []

  async function handleArchive(id: string) {
    await projectApi.update(id, { status: "archived" })
    mutate()
  }

  async function handleDelete(id: string) {
    await projectApi.delete(id)
    mutate()
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          {projects && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {active.length} {t("active")} · {projects.length} total
            </p>
          )}
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t("create")}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : projects && projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-10 w-10" />}
          title="还没有项目"
          description="创建第一个项目来组织你的任务和知识"
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t("create")}
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active" className="gap-1.5">
              {t("active")}
              <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                {active.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              {t("all")}
              <Badge variant="outline" className="h-5 min-w-5 px-1 text-[10px]">
                {projects?.length ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <ProjectGrid
              projects={active}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <ProjectGrid
              projects={projects ?? []}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function ProjectGrid({
  projects,
  onArchive,
  onDelete,
}: {
  projects: Array<{
    id: string
    name: string
    description: string | null
    icon: string | null
    color: string
    status: ProjectStatus
    progress: number
    dueDate: string | null
    tags: string[]
  }>
  onArchive: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group relative transition-all hover:shadow-sm"
        >
          {/* Color bar */}
          <div
            className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
            style={{ backgroundColor: project.color }}
          />

          <CardContent className="pl-4 pt-4">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {project.icon && (
                  <span className="text-lg">{project.icon}</span>
                )}
                <h3 className="font-medium">{project.name}</h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onArchive(project.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(project.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {project.description && (
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Status + Due */}
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-[10px]">
                <div className={`h-1.5 w-1.5 rounded-full ${statusColors[project.status]}`} />
                {statusLabels[project.status]}
              </Badge>
              {project.dueDate && (
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(project.dueDate), "M/d")}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full transition-all bg-brand-gradient"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {project.progress}%
              </span>
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
