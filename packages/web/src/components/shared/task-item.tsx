"use client"

import { Circle, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, TaskPriority } from "@ask-dorian/core/types"

const priorityClasses: Record<TaskPriority, string> = {
  urgent: "border-l-[3px] border-l-priority-p0",
  high: "border-l-[3px] border-l-priority-p1",
  medium: "border-l-[3px] border-l-priority-p2",
  low: "border-l-[3px] border-l-priority-p3",
  none: "",
}

const priorityLabels: Record<TaskPriority, string> = {
  urgent: "P0",
  high: "P1",
  medium: "P2",
  low: "P3",
  none: "",
}

interface TaskItemProps {
  task: Task
  onComplete?: (id: string) => Promise<void>
  showProject?: boolean
}

export function TaskItem({ task, onComplete, showProject }: TaskItemProps) {
  const isDone = task.status === "done"

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-accent/30",
        priorityClasses[task.priority],
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onComplete?.(task.id)}
        className={cn(
          "mt-0.5 shrink-0 transition-colors",
          isDone
            ? "text-green-500"
            : "text-muted-foreground hover:text-foreground",
        )}
        disabled={isDone}
      >
        {isDone ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            isDone && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {task.priority !== "none" && (
            <span
              className={cn(
                "text-[10px] font-medium",
                task.priority === "urgent" && "text-priority-p0",
                task.priority === "high" && "text-priority-p1",
                task.priority === "medium" && "text-priority-p2",
                task.priority === "low" && "text-priority-p3",
              )}
            >
              {priorityLabels[task.priority]}
            </span>
          )}
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground">
              {task.dueDate}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-[10px] text-muted-foreground">
              {task.estimatedMinutes}m
            </span>
          )}
          {showProject && task.projectId && (
            <span className="text-[10px] text-muted-foreground">
              {task.projectId.slice(0, 6)}...
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function TaskItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
      <div className="mt-0.5 h-4 w-4 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  )
}
