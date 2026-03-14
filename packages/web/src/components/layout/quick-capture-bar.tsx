"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { motion } from "framer-motion"
import {
  Sparkles,
  ImageIcon,
  Mic,
  ArrowRight,
} from "lucide-react"
import { fragmentApi } from "@ask-dorian/core/api"

interface QuickCaptureBarProps {
  onSearchOpen: () => void
}

export function QuickCaptureBar({ onSearchOpen }: QuickCaptureBarProps) {
  const [content, setContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations("capture")
  const { mutate } = useSWRConfig()

  const handleProcess = async () => {
    if (!content.trim() || isProcessing) return
    setIsProcessing(true)
    try {
      const result = await fragmentApi.create({
        rawContent: content.trim(),
        contentType: "text",
        inputSource: "web_capture_bar",
      })
      if (result.ok) {
        setContent("")
        mutate((key: unknown) => typeof key === "string" && (key.startsWith("/fragments") || key === "/today"))
      }
    } catch {
      // network error — silently fail
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div data-capture-bar className="fixed bottom-4 lg:bottom-8 left-0 lg:left-64 right-0 px-4 md:px-8 z-40 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <motion.div
          layout
          className="bg-surface-dark/70 backdrop-blur-2xl rounded-2xl border border-border-dark p-2 flex flex-col gap-2 focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles size={18} />
            </div>

            <input
              type="text"
              data-capture-input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleProcess()}
              placeholder={t("placeholder")}
              className="flex-1 min-w-0 bg-transparent border-none outline-0 focus:ring-0 text-text-main placeholder:text-slate-500 text-sm font-medium py-2"
              disabled={isProcessing}
            />

            <div className="flex items-center gap-1 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setContent((prev) => prev ? `${prev} [${file.name}]` : `[${file.name}]`)
                  }
                  e.target.value = ""
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-white/5 hidden sm:block"
                title="Attach image"
              >
                <ImageIcon size={18} />
              </button>
              <button
                onClick={() => setIsRecording((prev) => !prev)}
                className={`p-2 transition-colors rounded-lg hidden sm:flex items-center justify-center relative ${
                  isRecording
                    ? "text-red-500 bg-red-500/10"
                    : "text-slate-400 hover:text-primary hover:bg-white/5"
                }`}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                <Mic size={18} />
                {isRecording && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing || !content.trim()}
                className="bg-primary text-white px-3 sm:px-4 h-9 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform ml-1 shrink-0 disabled:opacity-30 disabled:grayscale flex items-center gap-1.5"
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
          </div>

          <div className="flex items-center justify-between px-2 pb-1">
            <button
              onClick={onSearchOpen}
              className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
            >
              ⌘K {t("search")}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                {t("neuralEngine")}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
