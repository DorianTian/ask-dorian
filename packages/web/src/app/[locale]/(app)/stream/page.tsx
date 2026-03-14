"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useFragments } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"
import type { Fragment, FragmentStatus } from "@ask-dorian/core/types"
import { FragmentDetail } from "@/components/shared/fragment-detail"
import {
  UploadCloud,
  LayoutList,
  LayoutGrid,
  Loader2,
  Mic,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  MoreHorizontal,
  Archive,
  Trash2,
} from "lucide-react"

function getTypeIcon(type: string, size = 24) {
  switch (type) {
    case "voice":
      return <Mic size={size} className="text-primary" />
    case "image":
      return <ImageIcon size={size} className="text-primary" />
    case "url":
      return <LinkIcon size={size} className="text-primary" />
    default:
      return <Sparkles size={size} className="text-primary" />
  }
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase()
}

function fragmentToDetail(f: Fragment) {
  return {
    id: f.id,
    type: f.contentType,
    content: f.normalizedContent || f.rawContent,
    status: f.status,
    timestamp: new Date(f.capturedAt).toLocaleDateString(),
    extractedData: {
      title: (f.metadata?.title as string) || undefined,
      tasks: Array.isArray(f.metadata?.tasks) ? (f.metadata.tasks as string[]) : undefined,
      calendarEvent: f.metadata?.calendarEvent as { date: string; time: string } | undefined,
      tags: Array.isArray(f.metadata?.tags) ? (f.metadata.tags as string[]) : undefined,
    },
  }
}

function FragmentCard({
  fragment,
  openMenuId,
  onMenuToggle,
  menuRef,
  onConfirm,
  onReject,
  onSelect,
  onPin,
  onArchive,
  onDelete,
  t,
  tFragment,
}: {
  fragment: Fragment
  openMenuId: string | null
  onMenuToggle: (id: string) => void
  menuRef: React.RefObject<HTMLDivElement | null>
  onConfirm: (id: string) => void
  onReject: (id: string) => void
  onSelect: (f: Fragment) => void
  onPin: (id: string, currentPinned: boolean) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  t: (key: string) => string
  tFragment: (key: string) => string
}) {
  const isProcessing = fragment.status === "processing" || fragment.status === "pending"
  const title = (fragment.normalizedContent || fragment.rawContent).split("\n")[0].slice(0, 80)
  const isMenuOpen = openMenuId === fragment.id

  return (
    <div onClick={() => onSelect(fragment)} className="group relative bg-surface-dark/40 border border-border-dark/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 cursor-pointer active:scale-[0.99]">
      <div className="flex flex-col md:flex-row">
        {/* Visual / Source Area */}
        <div className="w-full md:w-1/3 aspect-video md:aspect-auto bg-slate-900/50 relative overflow-hidden flex items-center justify-center p-4 min-h-[200px]">
          <div className="size-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
            {getTypeIcon(fragment.contentType)}
          </div>
          <div className="absolute top-3 left-3 px-2 py-1 bg-bg-dark/80 backdrop-blur rounded text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 hover:bg-primary hover:text-white cursor-pointer transition-all">
            {fragment.contentType}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {isProcessing ? tFragment("aiExtracting") : tFragment("knowledgeExtracted")}
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {formatTimestamp(fragment.capturedAt)}
              </span>
            </div>

            <h3 className="text-text-main text-lg font-bold mb-3 tracking-tight leading-snug group-hover:text-primary transition-colors">
              {title || tFragment("fragmentAnalysis")}
            </h3>

            <div className="bg-bg-dark/40 rounded-xl p-3 border-l-4 border-primary/40 mb-4 group-hover:bg-bg-dark/60 transition-colors">
              <p className="text-slate-400 text-sm italic leading-relaxed">
                &quot;{fragment.rawContent}&quot;
              </p>
            </div>

            {isProcessing ? (
              <div className="flex items-center gap-2 text-slate-500 mb-4 animate-pulse">
                <Clock size={16} />
                <span className="text-xs font-medium italic">{tFragment("identifying")}</span>
              </div>
            ) : (
              fragment.inputSource && (
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    {new Date(fragment.capturedAt).toLocaleDateString()}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded border border-primary/10 hover:bg-primary hover:text-white cursor-pointer transition-all">
                #{fragment.contentType}
              </span>
              {fragment.inputSource && (
                <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded border border-primary/10 hover:bg-primary hover:text-white cursor-pointer transition-all">
                  #{fragment.inputSource}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {fragment.status === "processed" && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onConfirm(fragment.id) }}
                    className="p-2 text-emerald-500 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all"
                    title={t("confirm")}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </>
              )}
              {/* Bookmark / Pin toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); onPin(fragment.id, fragment.isPinned) }}
                className={`p-2 rounded-lg transition-all ${
                  fragment.isPinned
                    ? "text-primary bg-primary/10"
                    : "text-slate-500 hover:text-primary hover:bg-white/5"
                }`}
                title={fragment.isPinned ? t("unpinned") : t("pinned")}
              >
                <Bookmark size={16} fill={fragment.isPinned ? "currentColor" : "none"} />
              </button>
              {/* More menu */}
              <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                <button
                  onClick={(e) => { e.stopPropagation(); onMenuToggle(fragment.id) }}
                  className={`p-2 rounded-lg transition-all ${
                    isMenuOpen
                      ? "text-primary bg-white/5"
                      : "text-slate-500 hover:text-primary hover:bg-white/5"
                  }`}
                >
                  <MoreHorizontal size={16} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1 z-50 w-40 bg-slate-900 border border-border-dark/80 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-150">
                    <button
                      onClick={(e) => { e.stopPropagation(); onArchive(fragment.id) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-text-main transition-colors"
                    >
                      <Archive size={14} />
                      <span>{t("archive")}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(fragment.id) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>{t("delete")}</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(fragment) }}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-primary/20"
              >
                <span>{tFragment("viewDetails")}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StreamPage() {
  const t = useTranslations("stream")
  const tFragment = useTranslations("fragment")
  const { mutate } = useSWRConfig()

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processed">("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement | null>(null)

  const statusFilter = activeTab === "all" ? undefined : { status: activeTab }
  const { data: fragments, isLoading } = useFragments(statusFilter)

  // Close dropdown on outside click
  useEffect(() => {
    if (!openMenuId) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [openMenuId])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const invalidateFragments = useCallback(() => {
    mutate((key: unknown) => typeof key === "string" && key.startsWith("/fragments"))
  }, [mutate])

  const handleConfirm = useCallback(async (id: string) => {
    await fragmentApi.confirm(id)
    invalidateFragments()
  }, [invalidateFragments])

  const handleReject = useCallback(async (id: string) => {
    await fragmentApi.reject(id)
    invalidateFragments()
  }, [invalidateFragments])

  const handlePin = useCallback(async (id: string, currentPinned: boolean) => {
    const result = await fragmentApi.update(id, { isPinned: !currentPinned })
    if (result.ok) {
      setToast(currentPinned ? t("unpinned") : t("pinned"))
      invalidateFragments()
    }
  }, [invalidateFragments, t])

  const handleArchive = useCallback(async (id: string) => {
    setOpenMenuId(null)
    const result = await fragmentApi.update(id, { isArchived: true })
    if (result.ok) {
      setToast(t("archived"))
      invalidateFragments()
    }
  }, [invalidateFragments, t])

  const handleDelete = useCallback(async (id: string) => {
    setOpenMenuId(null)
    const result = await fragmentApi.delete(id)
    if (result.ok) {
      setToast(t("deleted"))
      invalidateFragments()
    }
  }, [invalidateFragments, t])

  const handleMenuToggle = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id))
  }, [])

  const handleDropZoneClick = useCallback(() => {
    setToast(t("dropZoneHint"))
  }, [t])

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
            {fragments.map((f) => (
              <FragmentCard
                key={f.id}
                fragment={f}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
                menuRef={menuRef}
                onConfirm={handleConfirm}
                onReject={handleReject}
                onSelect={setSelectedFragment}
                onPin={handlePin}
                onArchive={handleArchive}
                onDelete={handleDelete}
                t={t}
                tFragment={tFragment}
              />
            ))}

            {/* Drop Zone */}
            <div
              onClick={handleDropZoneClick}
              className="border-2 border-dashed border-border-dark rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 group hover:border-primary/40 hover:bg-primary/5 transition-all bg-surface-dark/20 cursor-pointer"
            >
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

      <FragmentDetail
        fragment={selectedFragment ? fragmentToDetail(selectedFragment) : null}
        onClose={() => setSelectedFragment(null)}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 border border-border-dark/80 rounded-lg shadow-xl text-sm text-text-main font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  )
}
