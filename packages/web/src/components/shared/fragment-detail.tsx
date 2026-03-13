"use client"

import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Calendar,
  Clock,
  Share2,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Sparkles,
  Mic,
  Image as ImageIcon,
  Link as LinkIcon,
  Bookmark,
} from "lucide-react"

interface FragmentDetailFragment {
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

interface FragmentDetailProps {
  fragment: FragmentDetailFragment | null
  onClose: () => void
}

function getTypeIcon(type: string) {
  switch (type) {
    case "thought":
      return <Sparkles size={20} />
    case "screenshot":
    case "image":
      return <ImageIcon size={20} />
    case "voice":
      return <Mic size={20} />
    case "link":
    case "url":
      return <LinkIcon size={20} />
    default:
      return <Sparkles size={20} />
  }
}

export function FragmentDetail({ fragment, onClose }: FragmentDetailProps) {
  const t = useTranslations("fragment")

  if (!fragment) return null

  return (
    <AnimatePresence>
      {fragment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-surface-dark border border-border-dark rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Visual Side */}
            <div className="w-full md:w-2/5 bg-slate-900/50 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-border-dark">
              {fragment.imageUrl ? (
                <img
                  src={fragment.imageUrl}
                  alt="Source"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="size-32 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <div className="text-primary scale-[2]">
                    {getTypeIcon(fragment.type)}
                  </div>
                </div>
              )}
              <div className="absolute top-6 left-6 px-3 py-1.5 bg-bg-dark/80 backdrop-blur rounded-xl text-xs font-black uppercase tracking-widest text-primary border border-primary/20">
                {fragment.type}
              </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border-dark flex justify-between items-center bg-surface-dark/50">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {getTypeIcon(fragment.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-main leading-tight">
                      {fragment.extractedData?.title || t("fragmentAnalysis")}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {t("captured")} {fragment.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-slate-500 hover:text-primary hover:bg-white/5 rounded-xl transition-all">
                    <Bookmark size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
                {/* Original Content */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {t("originalInput")}
                  </h4>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative group">
                    <p className="text-slate-300 text-lg leading-relaxed italic">
                      &quot;{fragment.content}&quot;
                    </p>
                    <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-primary transition-all">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* Extracted Intelligence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {t("actionableTasks")}
                    </h4>
                    {fragment.extractedData?.tasks &&
                    fragment.extractedData.tasks.length > 0 ? (
                      <ul className="space-y-3">
                        {fragment.extractedData.tasks.map((task, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-primary/20 transition-all group cursor-pointer"
                          >
                            <CheckCircle2
                              size={18}
                              className="text-primary mt-0.5 shrink-0"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-text-main">
                              {task}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600 italic">
                        {t("noTasks")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {t("contextTags")}
                    </h4>
                    <div className="space-y-6">
                      {fragment.extractedData?.calendarEvent && (
                        <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            {fragment.extractedData.calendarEvent.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            {fragment.extractedData.calendarEvent.time}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {fragment.extractedData?.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-bold text-primary hover:bg-primary hover:text-white cursor-pointer transition-all"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-border-dark bg-surface-dark/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors group">
                  <Trash2
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  {t("deleteFragment")}
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/5">
                    <Share2 size={16} /> {t("saveChanges")}
                  </button>
                  <button className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {t("saveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
