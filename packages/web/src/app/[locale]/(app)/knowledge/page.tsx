"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import {
  Search,
  MoreHorizontal,
  Filter,
  Grid,
  List as ListIcon,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Link as LinkIcon,
  ChevronDown,
  Loader2,
  X,
  Eye,
  Archive,
  Trash2,
} from "lucide-react"
import { FragmentDetail } from "@/components/shared/fragment-detail"
import { useAuth } from "@/providers/auth-provider"
import { useFragments } from "@ask-dorian/core/hooks"
import type { Fragment } from "@ask-dorian/core/types"

const SYSTEM_EMAILS = new Set(["mock@askdorian.com", "test@askdorian.com"])

function mockFragment(id: string, contentType: Fragment["contentType"], inputSource: string, meta: { project: string; title: string; summary: string; tags: string[]; tasks?: string[] }, content: string, timestamp: string): Fragment {
  return {
    id, userId: "", deviceId: null, rawContent: content, contentType,
    contentHash: null, normalizedContent: content, inputSource,
    inputDevice: null, sourceApp: null, sourceRef: null,
    status: "confirmed", processingAttempts: 0, lastError: null,
    processedAt: timestamp, confirmedAt: timestamp,
    locale: null, timezone: null, location: null, clientContext: {},
    parentId: null, isPinned: false, isArchived: false,
    metadata: meta, version: 1,
    capturedAt: timestamp, createdAt: timestamp, updatedAt: timestamp,
    deletedAt: null, ftsContent: null,
  }
}

/** Generate relative ISO timestamp: daysAgo=0 is today, hours/minutes set the time */
function relativeTs(daysAgo: number, hours: number, minutes: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

const MOCK_FRAGMENTS: Fragment[] = [
  mockFragment("demo-1", "text", "Phoenix", {
    project: "Phoenix", title: "Neural Synapse Mapping",
    summary: "Extracted findings regarding the latency of signal propagation between synthetic nodes.",
    tags: ["Neuroscience", "AI"],
    tasks: ["Verify scaling laws on G-900 cluster", "Document non-linear relationship findings"],
  }, "Detailed analysis of propagation delay in synthetic neural architectures. Observations indicate a non-linear relationship between node density and signal attenuation. Further testing required on the G-900 cluster to verify scaling laws.", relativeTs(0, 14, 20)),
  mockFragment("demo-2", "image", "Research", {
    project: "Research", title: "Visual Cortex Simulation",
    summary: "Latest simulation results from the G-900 cluster. High fidelity textures rendered.",
    tags: ["Simulation", "VRAM"],
    tasks: ["Optimize Crystalline cache for lower VRAM usage"],
  }, "Simulation run #842. Parameters: 4K resolution, 120fps target. VRAM usage peaked at 22GB. Texture streaming efficiency improved by 15% using the new Crystalline cache algorithm.", relativeTs(1, 9, 45)),
  mockFragment("demo-3", "text", "Bio-Gen", {
    project: "Bio-Gen", title: "CRISPR Editing Log",
    summary: "Automated sequence verification for the last batch. All markers within 0.01% deviation.",
    tags: ["Genomics", "CRISPR"],
  }, "Verification of sequence batch B-99. All 48 markers confirmed. Deviation is minimal, suggesting high stability in the current editing medium. Recommended for Phase 2 trials.", relativeTs(2, 18, 12)),
  mockFragment("demo-4", "url", "Q-Link", {
    project: "Q-Link", title: "Quantum Entanglement Protocol",
    summary: "Initial tests on long-range entanglement stability. Coherence maintained for 4.2ms.",
    tags: ["Quantum", "Networking"],
    tasks: ["Scale entanglement distance to 50km", "Benchmark throughput against classical link"],
  }, "Protocol Q-1.2. Established stable link between nodes A and B (distance: 12km). Coherence time exceeded previous records. Data throughput reached 1.2 Gbps.", relativeTs(3, 11, 30)),
  mockFragment("demo-5", "voice", "Eco-Net", {
    project: "Eco-Net", title: "Sustainable Energy Grid",
    summary: "Optimization algorithms for distributed solar arrays. Efficiency increased by 12%.",
    tags: ["Energy", "SmartGrid"],
  }, "Voice memo transcript: \"The new array optimization seems to be working. We are seeing a significant jump in efficiency during peak hours. Need to check the inverter logs for any thermal issues.\"", relativeTs(4, 16, 55)),
  mockFragment("demo-6", "text", "NLP-X", {
    project: "NLP-X", title: "Linguistic Pattern Analysis",
    summary: "Cross-lingual semantic drift observed in multi-modal training sets.",
    tags: ["Linguistics", "LLM"],
    tasks: ["Adjust loss function weights for Romance languages", "Run comparison against V3 embeddings"],
  }, "Analysis of training set V4. Semantic drift detected in high-dimensional embeddings. Drift is most prominent in abstract concepts across Romance languages. Adjusting loss function weights.", relativeTs(5, 13, 10)),
]

type FragmentType = "all" | "text" | "image" | "voice" | "url"

function getTypeIcon(type: string) {
  switch (type) {
    case "text":
      return <MessageSquare size={14} />
    case "image":
      return <ImageIcon size={14} />
    case "voice":
      return <Mic size={14} />
    case "url":
      return <LinkIcon size={14} />
    default:
      return null
  }
}

function getProject(f: Fragment): string {
  return (f.metadata?.project as string) || f.inputSource
}

function getTitle(f: Fragment): string {
  return (f.metadata?.title as string) || (f.normalizedContent || f.rawContent).split("\n")[0].slice(0, 80)
}

function getSummary(f: Fragment): string {
  return (f.metadata?.summary as string) || f.rawContent
}

function getTags(f: Fragment): string[] {
  const tags = f.metadata?.tags
  if (Array.isArray(tags)) return tags as string[]
  return [f.contentType]
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

export default function KnowledgePage() {
  const t = useTranslations("knowledge")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<FragmentType>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const user = useAuth((s) => s.user)
  const { data: fragments, isLoading } = useFragments({ status: "confirmed" })

  // Demo/system accounts: fallback to mock data when no real fragments
  const isSystemAccount = !!user?.email && SYSTEM_EMAILS.has(user.email)
  const apiItems = fragments ?? []
  const items = apiItems.length > 0 ? apiItems : isSystemAccount ? MOCK_FRAGMENTS : apiItems

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true)
      const timer = setTimeout(() => setIsSearching(false), 600)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  // Close card menu on outside click
  const menuRef = useRef<HTMLDivElement | null>(null)
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

  const handleArchive = useCallback((f: Fragment, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenuId(null)
    // TODO: call archive API — for now show browser confirm
    if (window.confirm(`Archive "${getTitle(f)}"?`)) {
      // archiveFragment(f.id)
    }
  }, [])

  const handleDelete = useCallback((f: Fragment, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Delete "${getTitle(f)}"? This action cannot be undone.`)) {
      // deleteFragment(f.id)
    }
  }, [])
  const filteredItems = items.filter((f) => {
    const title = getTitle(f)
    const summary = getSummary(f)
    const tags = getTags(f)
    const matchesSearch =
      !searchQuery ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === "all" || f.contentType === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-main">
              {t("title")}
            </h1>
            <p className="text-slate-500 mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2 relative">
            <div className="flex bg-surface-dark border border-border-dark rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white/5 text-primary"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white/5 text-primary"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ListIcon size={16} />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium bg-surface-dark ${
                  isFilterOpen
                    ? "border-primary text-primary"
                    : "border-border-dark text-slate-300 hover:bg-white/5"
                }`}
              >
                <Filter size={14} />
                <span className="capitalize">
                  {selectedType === "all" ? t("filter") : selectedType}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden">
                  {(
                    [
                      "all",
                      "text",
                      "image",
                      "voice",
                      "url",
                    ] as FragmentType[]
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/5 ${
                        selectedType === type
                          ? "text-primary bg-primary/5"
                          : "text-slate-400"
                      }`}
                    >
                      <div className="size-5 flex items-center justify-center">
                        {type === "all" ? (
                          <Filter size={14} />
                        ) : (
                          getTypeIcon(type)
                        )}
                      </div>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <Search
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              isFocused ? "text-primary" : "text-slate-500"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t("searchPlaceholder")}
            className={`w-full bg-surface-dark/80 border rounded-xl pl-12 pr-12 py-3.5 text-sm outline-none transition-all duration-300 ${
              isFocused
                ? "border-primary shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "border-border-dark shadow-none"
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            {isSearching ? (
              <Loader2 size={18} className="text-primary animate-spin" />
            ) : (
              searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )
            )}
          </div>
        </div>

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : (
            filteredItems.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFragment(f)}
                className={`bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer active:scale-[0.99] ${
                  viewMode === "list" ? "flex-row items-center" : ""
                }`}
              >
                <div
                  className={`flex justify-between items-start ${
                    viewMode === "list"
                      ? "flex-col gap-2 min-w-[120px]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {getProject(f)}
                    </span>
                    <div className="text-slate-500 opacity-50">
                      {getTypeIcon(f.contentType)}
                    </div>
                  </div>
                  <div className="relative" ref={openMenuId === f.id ? menuRef : undefined}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === f.id ? null : f.id)
                      }}
                      className={`text-slate-500 hover:text-white transition-colors ${openMenuId === f.id ? "text-white" : ""}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenuId === f.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(null)
                            setSelectedFragment(f)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={(e) => handleArchive(f, e)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Archive size={14} />
                          <span>Archive</span>
                        </button>
                        <div className="border-t border-white/5" />
                        <button
                          onClick={(e) => handleDelete(f, e)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`flex-1 ${viewMode === "list" ? "px-4" : ""}`}
                >
                  <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                    {getTitle(f)}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-1 leading-relaxed mt-1">
                    {getSummary(f)}
                  </p>
                </div>
                <div
                  className={`flex flex-wrap gap-2 ${
                    viewMode === "list"
                      ? "mt-0 pt-0 border-t-0"
                      : "mt-auto pt-4 border-t border-white/5"
                  }`}
                >
                  {getTags(f).map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSearchQuery(tag)
                      }}
                      className="text-[10px] text-slate-500 font-mono hover:text-primary cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">
              {t("noResults")} &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      <FragmentDetail
        fragment={selectedFragment ? fragmentToDetail(selectedFragment) : null}
        onClose={() => setSelectedFragment(null)}
      />
    </div>
  )
}
