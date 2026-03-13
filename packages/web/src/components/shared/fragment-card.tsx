"use client"

import { useTranslations } from "next-intl"
import {
  Mic,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Bookmark,
  MoreHorizontal,
} from "lucide-react"

interface FragmentCardFragment {
  id: string
  type: string
  content: string
  status: string
  timestamp: string
  imageUrl?: string
  extractedData?: {
    title?: string
    tasks?: string[]
    calendarEvent?: { date: string; time: string }
    tags?: string[]
  }
}

interface FragmentCardProps {
  fragment: FragmentCardFragment
  onClick?: () => void
}

export function FragmentCard({ fragment, onClick }: FragmentCardProps) {
  const t = useTranslations("fragment")

  const renderIcon = () => {
    switch (fragment.type) {
      case "voice":
        return <Mic size={24} className="text-primary" />
      case "screenshot":
      case "image":
        return <ImageIcon size={24} className="text-primary" />
      case "link":
      case "url":
        return <LinkIcon size={24} className="text-primary" />
      default:
        return <Sparkles size={24} className="text-primary" />
    }
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-surface-dark/40 border border-border-dark/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex flex-col md:flex-row">
        {/* Visual/Source Area */}
        <div className="w-full md:w-1/3 aspect-video md:aspect-auto bg-slate-900/50 relative overflow-hidden flex items-center justify-center p-4">
          {fragment.imageUrl ? (
            <img
              src={fragment.imageUrl}
              alt="Source"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="size-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
              {renderIcon()}
            </div>
          )}
          <div className="absolute top-3 left-3 px-2 py-1 bg-bg-dark/80 backdrop-blur rounded text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 hover:bg-primary hover:text-white cursor-pointer transition-all">
            {fragment.type}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {fragment.status === "processing"
                    ? t("aiExtracting")
                    : t("knowledgeExtracted")}
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {fragment.timestamp}
              </span>
            </div>

            <h3 className="text-text-main text-lg font-bold mb-3 tracking-tight leading-snug group-hover:text-primary transition-colors">
              {fragment.extractedData?.title || t("fragmentAnalysis")}
            </h3>

            <div className="bg-bg-dark/40 rounded-xl p-3 border-l-4 border-primary/40 mb-4 group-hover:bg-bg-dark/60 transition-colors">
              <p className="text-slate-400 text-sm italic leading-relaxed">
                &quot;{fragment.content}&quot;
              </p>
            </div>

            {fragment.status === "processing" ? (
              <div className="flex items-center gap-2 text-slate-500 mb-4 animate-pulse">
                <Clock size={16} />
                <span className="text-xs font-medium italic">
                  {t("identifying")}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {fragment.extractedData?.calendarEvent && (
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      {fragment.extractedData.calendarEvent.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" />
                      {fragment.extractedData.calendarEvent.time}
                    </div>
                  </div>
                )}

                {fragment.extractedData?.tasks && (
                  <ul className="space-y-1.5">
                    {fragment.extractedData.tasks.map((task, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-300"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-primary mt-0.5"
                        />
                        {task}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {fragment.extractedData?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded border border-primary/10 hover:bg-primary hover:text-white cursor-pointer transition-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:text-primary hover:bg-white/5 rounded-lg transition-all">
                <Bookmark size={16} />
              </button>
              <button className="p-2 text-slate-500 hover:text-primary hover:bg-white/5 rounded-lg transition-all">
                <MoreHorizontal size={16} />
              </button>
              <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-primary/20">
                <span>{t("viewDetails")}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
