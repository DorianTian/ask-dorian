"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import {
  Sparkles,
  ImageIcon,
  Mic,
  ArrowRight,
  Command,
} from "lucide-react"
import { fragmentApi } from "@ask-dorian/core/api"

interface QuickCaptureBarProps {
  onSearchOpen: () => void
}

export function QuickCaptureBar({ onSearchOpen }: QuickCaptureBarProps) {
  const [content, setContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const t = useTranslations("capture")

  const handleProcess = async () => {
    if (!content.trim() || isProcessing) return
    setIsProcessing(true)
    try {
      await fragmentApi.create({
        rawContent: content.trim(),
        contentType: "text",
        inputSource: "web_capture_bar",
      })
      setContent("")
    } catch {
      // silently fail — fragment will show as failed in stream
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="absolute bottom-12 left-0 right-0 px-4 md:px-8 z-20 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <motion.div
          layout
          className="bg-surface-dark/90 backdrop-blur-2xl rounded-2xl border border-border-dark shadow-2xl p-2 flex items-center gap-2 group focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300"
        >
          <div className="flex items-center pl-2">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="flex-1 px-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleProcess()}
              placeholder={t("placeholder")}
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-text-main placeholder:text-slate-600 text-sm font-medium py-2"
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center gap-1 pr-1">
            <button className="size-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-primary transition-all">
              <ImageIcon size={18} />
            </button>
            <button className="size-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-primary transition-all">
              <Mic size={18} />
            </button>
            <div className="w-px h-6 bg-border-dark mx-1" />
            <button
              onClick={handleProcess}
              disabled={isProcessing || !content.trim()}
              className="bg-primary text-white px-4 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
              {isProcessing ? (
                <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t("process")}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </motion.div>

        <div className="flex justify-center mt-3 gap-6">
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-primary transition-colors group"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 group-hover:border-primary/30 transition-colors">
              <Command size={8} />
              <span>K</span>
            </div>
            <span>{t("search")}</span>
          </button>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("neuralEngine")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
