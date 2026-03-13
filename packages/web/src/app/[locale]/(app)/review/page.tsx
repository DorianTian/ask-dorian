"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Target,
  Zap,
  Share2,
  Download,
} from "lucide-react"

export default function ReviewPage() {
  const t = useTranslations("review")

  const stats = [
    {
      label: t("focusScore"),
      value: "92",
      trend: "+4%",
      icon: Target,
      sub: t("aboveAverage"),
    },
    {
      label: t("deepWork"),
      value: "24.5",
      unit: "hrs",
      icon: Zap,
      sub: t("deepWorkTarget"),
    },
    {
      label: t("completed"),
      value: "48",
      unit: "tasks",
      icon: CheckCircle2,
      sub: t("completionRate"),
    },
  ]

  const accomplishments = [
    "Finalized Q3 Strategic Roadmap",
    "Successfully launched Beta v2.0",
    "Onboarded 5 new enterprise clients",
    "Reduced system latency by 15%",
  ]

  const upcomingFocus = [
    "Prepare for Board Meeting",
    "Draft Q4 Marketing Plan",
    "Internal Security Audit",
    "Team Offsite Planning",
  ]

  const chartData = [40, 60, 50, 80, 95, 70, 85]
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-text-main">
              {t("title")}
            </h1>
            <p className="text-slate-500">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-dark border border-border-dark px-4 py-2 rounded-lg text-sm font-medium text-text-main flex items-center gap-2 hover:bg-white/5 hover:border-primary/50 transition-all">
              <Share2 size={16} className="text-primary" /> {t("share")}
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
              <Download size={16} /> {t("exportReport")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-primary group-hover:scale-110 transition-transform origin-left">
                <stat.icon size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-text-main group-hover:text-primary transition-colors">
                  {stat.value}
                </span>
                {stat.trend ? (
                  <span className="text-primary text-sm font-bold">
                    {stat.trend}
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm font-normal">
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Focus Intensity Chart */}
        <div className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 hover:border-primary/20 transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <p className="text-base font-bold text-text-main">
              {t("focusIntensity")}
            </p>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> {t("deep")}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-700" />{" "}
                {t("shallow")}
              </div>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {chartData.map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end gap-1 group/bar"
              >
                <div
                  className="w-full bg-primary/40 rounded-t-sm relative transition-all group-hover/bar:bg-primary/60"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                    {h}% Focus
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-[10%] rounded-b-sm" />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
            {days.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        {/* Accomplishments & Upcoming Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <CheckCircle2 size={20} className="text-primary" />
              {t("keyAccomplishments")}
            </h3>
            <div className="space-y-3">
              {accomplishments.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-surface-dark/40 border border-border-dark/50 hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="size-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                  <span className="text-sm text-slate-300 group-hover:text-text-main transition-colors">
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              {t("upcomingFocus")}
            </h3>
            <div className="space-y-3">
              {upcomingFocus.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-surface-dark/40 border border-border-dark/50 hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <ArrowRight
                    size={16}
                    className="text-primary group-hover:translate-x-1 transition-transform"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-text-main transition-colors">
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dorian's Weekly Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-8 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">
                {t("weeklyInsightTitle")}
              </h3>
              <p className="text-slate-400 text-base leading-relaxed whitespace-pre-line">
                {t("weeklyInsightBody")}
              </p>
              <button className="text-primary font-bold text-sm flex items-center gap-2 hover:underline group/link">
                {t("viewPatterns")}{" "}
                <ArrowRight
                  size={14}
                  className="group-hover/link:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 size-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700" />
        </motion.div>
      </div>
    </div>
  )
}
