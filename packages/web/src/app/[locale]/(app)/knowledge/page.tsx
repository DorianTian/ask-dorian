"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"

type FragmentType = "all" | "thought" | "screenshot" | "voice" | "link"

const cards = [
  {
    title: "Neural Synapse Mapping",
    project: "Phoenix",
    tags: ["Neuroscience", "AI"],
    summary:
      "Extracted findings regarding the latency of signal propagation between synthetic nodes.",
    type: "thought",
  },
  {
    title: "Visual Cortex Simulation",
    project: "Research",
    tags: ["Simulation", "VRAM"],
    summary:
      "Latest simulation results from the G-900 cluster. High fidelity textures rendered.",
    type: "screenshot",
  },
  {
    title: "CRISPR Editing Log",
    project: "Bio-Gen",
    tags: ["Genomics", "CRISPR"],
    summary:
      "Automated sequence verification for the last batch. All markers within 0.01% deviation.",
    type: "thought",
  },
  {
    title: "Quantum Entanglement Protocol",
    project: "Q-Link",
    tags: ["Quantum", "Networking"],
    summary:
      "Initial tests on long-range entanglement stability. Coherence maintained for 4.2ms.",
    type: "link",
  },
  {
    title: "Sustainable Energy Grid",
    project: "Eco-Net",
    tags: ["Energy", "SmartGrid"],
    summary:
      "Optimization algorithms for distributed solar arrays. Efficiency increased by 12%.",
    type: "voice",
  },
  {
    title: "Linguistic Pattern Analysis",
    project: "NLP-X",
    tags: ["Linguistics", "LLM"],
    summary:
      "Cross-lingual semantic drift observed in multi-modal training sets.",
    type: "thought",
  },
]

function getTypeIcon(type: string) {
  switch (type) {
    case "thought":
      return <MessageSquare size={14} />
    case "screenshot":
      return <ImageIcon size={14} />
    case "voice":
      return <Mic size={14} />
    case "link":
      return <LinkIcon size={14} />
    default:
      return null
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

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true)
      const timer = setTimeout(() => setIsSearching(false), 600)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesType = selectedType === "all" || card.type === selectedType
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
                      "thought",
                      "screenshot",
                      "voice",
                      "link",
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
          {filteredCards.map((card, i) => (
            <div
              key={i}
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
                    {card.project}
                  </span>
                  <div className="text-slate-500 opacity-50">
                    {getTypeIcon(card.type)}
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div
                className={`flex-1 ${viewMode === "list" ? "px-4" : ""}`}
              >
                <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-1 leading-relaxed mt-1">
                  {card.summary}
                </p>
              </div>
              <div
                className={`flex flex-wrap gap-2 ${
                  viewMode === "list"
                    ? "mt-0 pt-0 border-t-0"
                    : "mt-auto pt-4 border-t border-white/5"
                }`}
              >
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-slate-500 font-mono hover:text-primary cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">
              {t("noResults")} &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
