"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Inbox as InboxIcon, AlertTriangle } from "lucide-react"
import { useSWRConfig } from "swr"

import { useFragments } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FragmentCard } from "@/components/shared/fragment-card"
import { QuickCapture } from "@/components/shared/quick-capture"
import { EmptyState } from "@/components/shared/empty-state"

export default function InboxPage() {
  const t = useTranslations("inbox")
  const { data: fragments, error, isLoading, mutate: mutateFragments } = useFragments()
  const { mutate } = useSWRConfig()

  const pending = fragments?.filter(
    (f) => f.status === "pending" || f.status === "processing" || f.status === "processed",
  ) ?? []
  const confirmed = fragments?.filter((f) => f.status === "confirmed") ?? []
  const rejected = fragments?.filter((f) => f.status === "rejected") ?? []

  async function handleConfirm(id: string) {
    await fragmentApi.confirm(id)
    mutateFragments()
    mutate("/today")
  }

  async function handleReject(id: string) {
    await fragmentApi.reject(id)
    mutateFragments()
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        {fragments && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pending.length} 待处理 · {confirmed.length} 已确认
          </p>
        )}
      </div>

      {/* Quick Capture */}
      <QuickCapture className="mb-6" />

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            {t("pending")}
            {pending.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed" className="gap-1.5">
            {t("processed")}
            <Badge variant="outline" className="h-5 min-w-5 px-1 text-[10px]">
              {confirmed.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={<InboxIcon className="h-10 w-10" />}
              title={t("empty")}
              description="所有碎片都已处理完毕"
            />
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-3 pr-3">
                {pending.map((fragment) => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Processed Tab */}
        <TabsContent value="processed" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : confirmed.length === 0 ? (
            <EmptyState
              icon={<InboxIcon className="h-10 w-10" />}
              title="还没有已确认的碎片"
            />
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-3 pr-3">
                {confirmed.map((fragment) => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    compact
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
