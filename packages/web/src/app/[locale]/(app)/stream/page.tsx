"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useFragments } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"
import type { FragmentStatus } from "@ask-dorian/core/types"
import {
  UploadCloud,
  LayoutList,
  LayoutGrid,
  Loader2,
  Send,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react"

function getContentTypeIcon(type: string) {
  switch (type) {
    case "voice":
      return Mic
    case "image":
      return ImageIcon
    default:
      return MessageSquare
  }
}

function getStatusLabel(status: FragmentStatus, t: (key: string) => string) {
  const map: Record<FragmentStatus, string> = {
    pending: t("statusPending"),
    processing: t("statusProcessing"),
    processed: t("statusProcessed"),
    confirmed: t("statusConfirmed"),
    rejected: t("statusRejected"),
    failed: t("statusFailed"),
  }
  return map[status] ?? status
}

function formatTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then

  if (diffMs < 0) return new Date(iso).toLocaleDateString()

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return new Date(iso).toLocaleDateString()
}

export default function StreamPage() {
  const t = useTranslations("stream")
  const { mutate } = useSWRConfig()

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processed">("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [newContent, setNewContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statusFilter = activeTab === "all" ? undefined : { status: activeTab }
  const { data: fragments, isLoading } = useFragments(statusFilter)

  const handleSubmit = useCallback(async () => {
    const trimmed = newContent.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      await fragmentApi.create({
        rawContent: trimmed,
        contentType: "text",
        inputSource: "web",
      })
      setNewContent("")
      mutate((key: unknown) => typeof key === "string" && key.startsWith("/fragments"))
    } finally {
      setIsSubmitting(false)
    }
  }, [newContent, isSubmitting, mutate])

  const handleConfirm = useCallback(async (id: string) => {
    await fragmentApi.confirm(id)
    mutate((key: unknown) => typeof key === "string" && key.startsWith("/fragments"))
  }, [mutate])

  const handleReject = useCallback(async (id: string) => {
    await fragmentApi.reject(id)
    mutate((key: unknown) => typeof key === "string" && key.startsWith("/fragments"))
  }, [mutate])

  const tabs = [
    { id: "all" as const, label: t("allFragments") },
    { id: "pending" as const, label: t("pendingReview") },
    { id: "processed" as const, label: t("processed") },
  ]

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-main tracking-tight">
              {t("title")}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex bg-surface-dark p-1 rounded-lg border border-border-dark shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-slate-800 text-text-main"
                  : "text-slate-500 hover:text-text-main"
              }`}
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-800 text-text-main"
                  : "text-slate-500 hover:text-text-main"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Quick capture */}
        <div className="relative bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-4">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={t("capturePlaceholder")}
            rows={2}
            className="w-full bg-transparent text-text-main placeholder:text-slate-500 text-sm resize-none outline-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-600">
              &#x2318;+Enter {t("toSend")}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newContent.trim() || isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {t("capture")}
            </button>
          </div>
        </div>

        <div className="flex border-b border-border-dark gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-slate-500 hover:text-text-main"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!fragments || fragments.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={40} className="text-slate-600 mb-4" />
            <h3 className="text-text-main font-bold text-lg">{t("noFragments")}</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">{t("noFragmentsDesc")}</p>
          </div>
        )}

        {/* Fragment list */}
        {!isLoading && fragments && fragments.length > 0 && (
          <div
            className={`space-y-6 ${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0"
                : ""
            }`}
          >
            {fragments.map((f) => {
              const Icon = getContentTypeIcon(f.contentType)
              return (
                <div
                  key={f.id}
                  className="group relative bg-surface-dark/40 border border-border-dark/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 cursor-pointer active:scale-[0.99] p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {getStatusLabel(f.status, t)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formatTime(f.capturedAt)}
                    </span>
                  </div>

                  <div className="bg-bg-dark/40 rounded-xl p-3 border-l-4 border-primary/40 mb-4 group-hover:bg-bg-dark/60 transition-colors">
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                      {f.normalizedContent || f.rawContent}
                    </p>
                  </div>

                  {f.status === "processed" && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConfirm(f.id)
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 size={12} />
                        {t("confirm")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReject(f.id)
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle size={12} />
                        {t("reject")}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-border-dark rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 group hover:border-primary/40 hover:bg-primary/5 transition-all bg-surface-dark/20 cursor-pointer">
              <div className="size-16 rounded-full bg-surface-dark flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all">
                <UploadCloud size={32} />
              </div>
              <div>
                <h4 className="text-text-main font-bold group-hover:text-primary transition-colors">
                  {t("dropMore")}
                </h4>
                <p className="text-slate-500 text-sm mt-1 max-w-[240px]">
                  {t("dropMoreDesc")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
