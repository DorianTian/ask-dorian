"use client"

import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Sparkles, Inbox, AlertTriangle } from "lucide-react"
import { useSWRConfig } from "swr"

import { useTodayDashboard } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"
import { taskApi } from "@ask-dorian/core/api"

import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FragmentCard } from "@/components/shared/fragment-card"
import { TaskItem, TaskItemSkeleton } from "@/components/shared/task-item"
import { EventItem, EventItemSkeleton } from "@/components/shared/event-item"
import { QuickCapture } from "@/components/shared/quick-capture"
import { EmptyState } from "@/components/shared/empty-state"

export default function TodayPage() {
  const t = useTranslations("today")
  const { data, error, isLoading, mutate: mutateDashboard } = useTodayDashboard()
  const { mutate } = useSWRConfig()

  const today = format(new Date(), "M月d日 EEEE", { locale: zhCN })

  async function handleConfirmFragment(id: string) {
    await fragmentApi.confirm(id)
    mutateDashboard()
    mutate((key: string) => typeof key === "string" && key.includes("/fragments"))
  }

  async function handleRejectFragment(id: string) {
    await fragmentApi.reject(id)
    mutateDashboard()
  }

  async function handleCompleteTask(id: string) {
    await taskApi.complete(id)
    mutateDashboard()
  }

  // --- Error ---
  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
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
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
        </div>
        {data && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{data.tasks.scheduled.length} tasks</span>
            <span>{data.events.length} events</span>
            {data.pendingFragments.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {data.pendingFragments.length} pending
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Quick Capture */}
      <QuickCapture className="mb-6" placeholder={t("addFragment")} />

      {/* Main Content: Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Fragment Feed (3/5) */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-from" />
            <h2 className="text-sm font-medium">{t("fragmentFeed")}</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : data && data.pendingFragments.length > 0 ? (
            <div className="space-y-3">
              {data.pendingFragments.map((fragment) => (
                <FragmentCard
                  key={fragment.id}
                  fragment={fragment}
                  onConfirm={handleConfirmFragment}
                  onReject={handleRejectFragment}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="h-8 w-8" />}
              title={t("noFragments")}
              description="使用上方输入框或 ⌘K 快速记录碎片"
            />
          )}
        </div>

        {/* Right: Timeline (2/5) */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium">{t("timeline")}</h2>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  {i % 2 === 0 ? <TaskItemSkeleton /> : <EventItemSkeleton />}
                </div>
              ))}
            </div>
          ) : data ? (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2 pr-3">
                {/* Overdue tasks (if any) */}
                {data.tasks.overdue.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-destructive">
                      Overdue ({data.tasks.overdue.length})
                    </p>
                    {data.tasks.overdue.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                    <Separator className="my-2" />
                  </>
                )}

                {/* Events */}
                {data.events.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}

                {/* Scheduled tasks */}
                {data.tasks.scheduled.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                  />
                ))}

                {data.events.length === 0 &&
                  data.tasks.scheduled.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      今天没有日程安排
                    </p>
                  )}
              </div>
            </ScrollArea>
          ) : null}
        </div>
      </div>
    </div>
  )
}
