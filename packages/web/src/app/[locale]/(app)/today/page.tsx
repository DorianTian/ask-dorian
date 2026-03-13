"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Sparkles,
  CheckCircle2,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react"

const defaultRituals = [
  { id: 1, title: "10min Mindful Breathing", completed: true },
  { id: 2, title: "Cold Shower (Level 3)", completed: true },
  { id: 3, title: "Review Product Specs", completed: false, focus: true },
  { id: 4, title: "Journaling (Daily Intentions)", completed: false },
]

export default function TodayPage() {
  const t = useTranslations("today")
  const [rituals, setRituals] = useState(defaultRituals)

  const toggleRitual = (id: number) => {
    setRituals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    )
  }

  const completedCount = rituals.filter((r) => r.completed).length

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      {/* AI Summary Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 bg-surface-dark border border-primary/20 shadow-2xl shadow-primary/5 group cursor-pointer">
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
              <Sparkles size={14} />
              <span>{t("aiSummaryBadge")}</span>
            </div>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-text-main group-hover:text-white transition-colors">
              {t("aiSummaryLine1")}{" "}
              <span className="text-primary font-bold">
                {t("aiSummaryHighlight1")}
              </span>{" "}
              {t("aiSummaryLine2")}{" "}
              <span className="text-primary font-bold">
                {t("aiSummaryHighlight2")}
              </span>
              .{" "}
              {t("aiSummaryLine3")}{" "}
              <span className="text-text-main underline decoration-primary/50 underline-offset-4 group-hover:text-white">
                {t("aiSummaryHighlight3")}
              </span>{" "}
              {t("aiSummaryLine4")}
            </p>
          </div>
          <button className="bg-white/5 hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 text-text-main whitespace-nowrap flex items-center gap-2 group/btn active:scale-95">
            {t("fullBriefing")}
            <ArrowUpRight
              size={14}
              className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
            />
          </button>
        </div>
        <div className="absolute -right-12 -top-12 size-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-500" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
        {/* Morning Ritual Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              {t("morningRitual")}
            </h3>
            <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              {completedCount} / {rituals.length} {t("done")}
            </span>
          </div>

          <div className="space-y-3">
            {rituals.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRitual(item.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${
                  item.focus
                    ? "bg-surface-dark border-primary/50 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                    : "bg-surface-dark/40 border-border-dark/50 hover:border-primary/30"
                }`}
              >
                <div
                  className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    item.completed
                      ? "bg-primary border-primary text-white"
                      : "border-slate-700 group-hover:border-primary/50"
                  }`}
                >
                  {item.completed && <CheckCircle2 size={12} />}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold transition-all ${
                      item.completed
                        ? "text-slate-600 line-through"
                        : "text-text-main"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.focus && (
                    <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
                      {t("focusPhase")}
                    </p>
                  )}
                </div>
                {item.focus && (
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                    {t("timeboxing")}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button className="w-full py-4 border-2 border-dashed border-border-dark rounded-2xl text-slate-600 text-xs font-black uppercase tracking-widest hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 group active:scale-[0.99]">
            <PlusCircle
              size={18}
              className="group-hover:scale-110 transition-transform"
            />{" "}
            {t("addElement")}
          </button>
        </div>

        {/* Daily Timeline Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              {t("dailyTimeline")}
            </h3>
            <div className="flex gap-2">
              <button className="size-8 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center text-slate-500 hover:text-text-main hover:border-primary/50 transition-all active:scale-90">
                <ChevronLeft size={16} />
              </button>
              <button className="size-8 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center text-slate-500 hover:text-text-main hover:border-primary/50 transition-all active:scale-90">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative bg-surface-dark/20 rounded-3xl border border-border-dark p-6 h-[480px] overflow-hidden group">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Current Time Indicator */}
            <div className="absolute top-[160px] left-0 right-0 z-20 flex items-center gap-2 pointer-events-none">
              <div className="h-px flex-1 bg-primary/30" />
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                {t("currentTime")}
              </span>
              <div className="h-px flex-1 bg-primary/30" />
            </div>

            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-[60px_1fr] gap-4 group/item cursor-pointer active:scale-[0.99] transition-transform">
                <span className="text-[10px] text-slate-600 font-black font-mono text-right mt-1 group-hover/item:text-primary transition-colors">
                  08:00
                </span>
                <div className="bg-primary/5 border-l-2 border-primary p-3 rounded-xl flex items-center justify-between hover:bg-primary/10 transition-all">
                  <div>
                    <p className="text-xs font-bold text-text-main">
                      {t("morningRitual")}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {t("completedTime")}
                    </p>
                  </div>
                  <CheckCircle2 size={14} className="text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-[60px_1fr] gap-4">
                <span className="text-[10px] text-slate-600 font-black font-mono text-right mt-1">
                  09:00
                </span>
                <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-4 rounded-2xl flex items-center justify-center gap-3 hover:border-primary/50 transition-all cursor-pointer group/box active:scale-[0.99]">
                  <Sparkles
                    size={16}
                    className="text-primary/50 group-hover/box:scale-110 transition-transform"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/50 italic">
                    {t("dropToTimebox")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[60px_1fr] gap-4 group/item cursor-pointer active:scale-[0.99] transition-transform">
                <span className="text-[10px] text-slate-600 font-black font-mono text-right mt-1 group-hover/item:text-primary transition-colors">
                  10:00
                </span>
                <div className="bg-white/5 border-l-2 border-white/20 p-3 rounded-xl hover:bg-white/10 transition-all">
                  <p className="text-xs font-bold text-text-main">
                    {t("weeklySync")}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    {t("videoCall")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[60px_1fr] gap-4 group/item cursor-pointer active:scale-[0.99] transition-transform">
                <span className="text-[10px] text-slate-600 font-black font-mono text-right mt-1 group-hover/item:text-primary transition-colors">
                  12:00
                </span>
                <div className="bg-primary/5 border-l-2 border-primary/50 p-3 rounded-xl flex items-center gap-3 hover:bg-primary/10 transition-all">
                  <Utensils size={14} className="text-primary" />
                  <div>
                    <p className="text-xs font-bold text-text-main">
                      {t("mindfulLunch")}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      {t("awayFromScreen")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-20 lg:pb-0">
        {[
          { label: t("focusScore"), value: "92", trend: "+4%" },
          { label: t("deepWork"), value: "3.2", unit: t("hrs") },
          { label: t("tasksDone"), value: "14/22" },
          { label: t("energyPeak"), value: "10:00 - 12:30" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-surface-dark/30 border border-border-dark p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.2em] group-hover:text-primary transition-colors">
                {stat.label}
              </p>
              <MoreHorizontal
                size={14}
                className="text-slate-700 group-hover:text-slate-400 transition-colors"
              />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-text-main group-hover:text-white transition-colors">
                {stat.value}
                {stat.unit && (
                  <span className="text-xs font-bold text-slate-600 ml-1 uppercase">
                    {stat.unit}
                  </span>
                )}
              </span>
              {stat.trend && (
                <span className="text-[10px] text-primary font-black mb-1">
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
