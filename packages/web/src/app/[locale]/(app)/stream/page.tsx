"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { UploadCloud, LayoutList, LayoutGrid } from "lucide-react"

const mockFragments = [
  {
    id: "1",
    type: "voice",
    content:
      "Need to schedule a meeting with the design team about the new dashboard layout. Also, remind me to review the Q3 budget proposal before Friday.",
    status: "processed" as const,
    timestamp: "2 min ago",
    extractedData: {
      title: "Design Team Sync & Budget Review",
      tasks: [
        "Schedule meeting with design team",
        "Review Q3 budget proposal before Friday",
      ],
      calendarEvent: { date: "Friday", time: "10:00 AM" },
      tags: ["Design", "Budget"],
    },
  },
  {
    id: "2",
    type: "screenshot",
    content:
      "Screenshot of a Figma prototype showing the new onboarding flow with 4 steps.",
    status: "processing" as const,
    timestamp: "15 min ago",
    extractedData: {
      title: "Onboarding Flow Prototype",
      tags: ["Figma", "UX"],
    },
  },
  {
    id: "3",
    type: "thought",
    content:
      "The current authentication flow has too many steps. We should consider implementing social login (Google, GitHub) to reduce friction. Also look into passwordless auth via magic links.",
    status: "processed" as const,
    timestamp: "1 hr ago",
    extractedData: {
      title: "Auth Flow Optimization Ideas",
      tasks: [
        "Research social login integration",
        "Evaluate magic link authentication",
        "Audit current auth flow steps",
      ],
      tags: ["Auth", "UX", "Security"],
    },
  },
]

export default function StreamPage() {
  const t = useTranslations("stream")
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const tabs = [
    { id: "all", label: t("allFragments") },
    { id: "pending", label: t("pendingReview") },
    { id: "processed", label: t("processed") },
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

        <div
          className={`space-y-6 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0"
              : ""
          }`}
        >
          {mockFragments.map((f) => (
            <div
              key={f.id}
              className="group relative bg-surface-dark/40 border border-border-dark/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 cursor-pointer active:scale-[0.99] p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {f.status === "processing"
                      ? "AI Extraction in Progress"
                      : "Knowledge Extracted"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {f.timestamp}
                </span>
              </div>
              <h3 className="text-text-main text-lg font-bold mb-3 tracking-tight leading-snug group-hover:text-primary transition-colors">
                {f.extractedData?.title || "Fragment Analysis"}
              </h3>
              <div className="bg-bg-dark/40 rounded-xl p-3 border-l-4 border-primary/40 mb-4 group-hover:bg-bg-dark/60 transition-colors">
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  &quot;{f.content}&quot;
                </p>
              </div>
              {f.extractedData?.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {f.extractedData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

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
      </div>
    </div>
  )
}
