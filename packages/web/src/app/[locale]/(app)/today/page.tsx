"use client"

import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useRituals } from "@ask-dorian/core/hooks"
import { ritualApi } from "@ask-dorian/core/api"
import {
  Activity,
  Clock,
  Terminal,
  CheckCircle2,
  Sparkles,
  Play,
  FastForward,
  Loader2,
} from "lucide-react"

const timelineBlocks = [
  {
    id: "t1",
    start: 8,
    end: 9,
    title: "Morning Ritual",
    subtitle: "COMPLETED • 45 MIN",
    status: "completed" as const,
  },
  {
    id: "t2",
    start: 9,
    end: 10.5,
    title: "UI Refinement Sprint",
    subtitle: "45:12 REMAINING",
    status: "active" as const,
  },
  {
    id: "drop",
    start: 10.5,
    end: 11,
    title: "",
    subtitle: "",
    status: "drop" as const,
  },
  {
    id: "t3",
    start: 11,
    end: 12,
    title: "Weekly Sync (Team)",
    subtitle: "Video Call • Meeting Link",
    status: "future" as const,
  },
  {
    id: "t4",
    start: 12,
    end: 13,
    title: "Mindful Lunch",
    subtitle: "Away from screen",
    status: "future" as const,
  },
  {
    id: "t5",
    start: 14,
    end: 16,
    title: "Deep Work Block",
    subtitle: "Board Meeting Prep",
    status: "future" as const,
  },
]

function getBlockStyle(start: number, end: number) {
  const dayStart = 8
  const dayEnd = 18
  const totalHours = dayEnd - dayStart
  const top = ((start - dayStart) / totalHours) * 100
  const height = ((end - start) / totalHours) * 100
  return { top: `${top}%`, height: `${height}%` }
}

export default function TodayPage() {
  const t = useTranslations("today")
  const { data: ritualData, isLoading: ritualsLoading } = useRituals()
  const { mutate } = useSWRConfig()

  const toggleRitual = async (id: string) => {
    await ritualApi.toggleComplete(id)
    mutate("/rituals")
  }

  const bootProgress = ritualData?.progress
    ? ritualData.progress.total > 0
      ? Math.round(
          (ritualData.progress.completed / ritualData.progress.total) * 100,
        )
      : 0
    : 0

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6 pb-20 lg:pb-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity size={20} className="text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-text-main">
              {t("dailyTelemetry")}
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {t("systemActive")} — {t("userStatus")}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-surface-dark border border-border-dark rounded-xl px-4 py-2">
          <Clock size={14} className="text-primary" />
          <span className="text-xs font-mono font-bold text-primary">
            {t("tMinus")} 08:42:15
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Execution Timeline */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-slate-500 px-1">
            {t("executionTimeline")}
          </h3>

          <div className="relative bg-surface-dark/20 rounded-2xl border border-border-dark overflow-hidden" style={{ height: 560 }}>
            {/* Dot grid background */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Time axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col justify-between py-4 z-10">
              {[8, 10, 12, 14, 16, 18].map((h) => (
                <span key={h} className="text-[10px] font-mono font-black text-slate-600 text-right pr-2">
                  {h.toString().padStart(2, "0")}:00
                </span>
              ))}
            </div>

            {/* Current time indicator */}
            <div
              className="absolute left-14 right-4 z-20 flex items-center pointer-events-none"
              style={{ top: "15%" }}
            >
              <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <div className="h-px flex-1 bg-primary/40" />
              <span className="text-[9px] font-mono font-bold text-primary bg-bg-dark/80 px-1.5 py-0.5 rounded">
                09:12
              </span>
            </div>

            {/* Timeline blocks */}
            <div className="absolute left-14 right-4 top-0 bottom-0">
              {timelineBlocks.map((block) => {
                const style = getBlockStyle(block.start, block.end)
                if (block.status === "completed") {
                  return (
                    <div
                      key={block.id}
                      className="absolute left-0 right-0 px-2"
                      style={style}
                    >
                      <div className="h-full bg-black/40 rounded-xl border border-white/5 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-500 line-through">
                            {block.title}
                          </p>
                          <p className="text-[10px] font-mono text-slate-600">
                            {block.subtitle}
                          </p>
                        </div>
                        <CheckCircle2 size={14} className="text-primary/50" />
                      </div>
                    </div>
                  )
                }
                if (block.status === "active") {
                  return (
                    <div
                      key={block.id}
                      className="absolute left-0 right-0 px-2"
                      style={style}
                    >
                      <div className="h-full bg-primary/10 rounded-xl border border-primary/50 p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-bold text-text-main">
                            {block.title}
                          </p>
                          <p className="text-[10px] font-mono text-primary mt-1">
                            {block.subtitle}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all">
                            <Play size={10} />
                            {t("complete")}
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all border border-white/10">
                            <FastForward size={10} />
                            {t("extend")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
                if (block.status === "drop") {
                  return (
                    <div
                      key={block.id}
                      className="absolute left-0 right-0 px-2"
                      style={style}
                    >
                      <div className="h-full border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer">
                        <Sparkles size={12} className="text-primary/50" />
                        <span className="text-[10px] font-mono font-bold text-primary/50 uppercase">
                          {t("insertFragment")}
                        </span>
                      </div>
                    </div>
                  )
                }
                return (
                  <div
                    key={block.id}
                    className="absolute left-0 right-0 px-2"
                    style={style}
                  >
                    <div className="h-full bg-white/[0.02] rounded-xl border border-white/5 p-3 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer">
                      <p className="text-xs font-bold text-slate-400">
                        {block.title}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                        {block.subtitle}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Briefing + Boot + Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Briefing Card */}
          <div className="bg-surface-dark border border-primary/20 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                  {t("morningBrief")}
                </span>
              </div>
              <div className="space-y-2">
                {["briefContent1", "briefContent2", "briefContent3"].map((key) => (
                  <p key={key} className="text-xs text-slate-400 font-mono flex items-start gap-2">
                    <span className="text-primary/50 mt-0.5">→</span>
                    {t(key)}
                  </p>
                ))}
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
                <p className="text-xs font-mono font-bold text-primary">
                  {t("briefCritical")}
                </p>
              </div>
            </div>
          </div>

          {/* Boot Sequence (Rituals) */}
          <div className="bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-slate-500">
                {t("bootSequence")}
              </h3>
              <span className="text-[10px] font-mono font-bold text-primary">
                {bootProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${bootProgress}%` }}
              />
            </div>

            <div className="space-y-2">
              {ritualsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : !ritualData?.items.length ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  {t("noRituals")}
                </p>
              ) : (
                ritualData.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleRitual(item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <div
                      className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? "bg-primary border-primary text-white"
                          : "border-slate-700 group-hover:border-primary/50"
                      }`}
                    >
                      {item.completed && <CheckCircle2 size={10} />}
                    </div>
                    <span
                      className={`text-sm font-medium transition-all ${
                        item.completed
                          ? "text-slate-600 line-through"
                          : "text-text-main"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("focusScore"), value: "92" },
              { label: t("deepWork"), value: "4.5", unit: t("hrs") },
              { label: t("syncCount"), value: "12" },
              { label: t("energyPeak"), value: "10:00" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-surface-dark/30 border border-border-dark rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <p className="text-[9px] font-black font-mono uppercase tracking-[0.2em] text-slate-600 group-hover:text-primary transition-colors">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-text-main mt-1 font-mono">
                  {stat.value}
                  {stat.unit && (
                    <span className="text-xs text-slate-600 ml-0.5">{stat.unit}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
