"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import {
  HelpCircle,
  MessageSquare,
  Book,
  Shield,
  LifeBuoy,
  ExternalLink,
  ChevronRight,
  Search,
  CheckCircle2,
} from "lucide-react"

export default function SupportPage() {
  const t = useTranslations("support")

  const categories = [
    {
      icon: Book,
      title: t("documentation"),
      desc: t("documentationDesc"),
      color: "text-indigo-500",
    },
    {
      icon: HelpCircle,
      title: t("faq"),
      desc: t("faqDesc"),
      color: "text-emerald-500",
    },
    {
      icon: Shield,
      title: t("privacySecurity"),
      desc: t("privacySecurityDesc"),
      color: "text-blue-500",
    },
    {
      icon: LifeBuoy,
      title: t("directSupport"),
      desc: t("directSupportDesc"),
      color: "text-rose-500",
    },
  ]

  const systemStatus = [
    { name: t("neuralEngine"), status: "operational" as const },
    { name: t("fragmentExtraction"), status: "operational" as const },
    { name: t("cloudSync"), status: "operational" as const },
    { name: t("searchIndexing"), status: "degraded" as const },
  ]

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            {t("title")}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">{t("subtitle")}</p>
          <div className="max-w-2xl mx-auto relative mt-8">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full bg-surface-dark border border-border-dark rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all shadow-xl shadow-black/20"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 flex gap-6 group hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer"
            >
              <div
                className={`size-14 rounded-2xl bg-white/5 flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <cat.icon size={28} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <ChevronRight
                    size={18}
                    className="text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all"
                  />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feedback Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="size-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <MessageSquare size={40} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold text-text-main">
              {t("suggestionTitle")}
            </h3>
            <p className="text-slate-400">{t("suggestionDesc")}</p>
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
            {t("sendFeedback")}
          </button>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-main">
              {t("systemStatus")}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={12} />
              {t("allOperational")}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {systemStatus.map((sys, i) => (
              <div
                key={i}
                className="bg-surface-dark/40 border border-border-dark rounded-xl p-4 flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-400">
                  {sys.name}
                </span>
                {sys.status === "operational" ? (
                  <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                ) : (
                  <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-8 border-t border-border-dark flex flex-wrap justify-center gap-8">
          <button className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
            {t("termsOfService")} <ExternalLink size={12} />
          </button>
          <button className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
            {t("privacyPolicy")} <ExternalLink size={12} />
          </button>
          <button className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
            {t("cookiePolicy")} <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
