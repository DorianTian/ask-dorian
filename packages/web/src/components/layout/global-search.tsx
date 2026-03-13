"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  Command,
  FileText,
  Settings,
  Layout,
  Clock,
  ArrowRight,
} from "lucide-react"

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

const searchItems = [
  { id: "1", title: "Dashboard", type: "navigation", icon: Layout, href: "/today" },
  { id: "2", title: "Knowledge Library", type: "navigation", icon: FileText, href: "/knowledge" },
  { id: "3", title: "Weekly Review", type: "navigation", icon: Clock, href: "/review" },
  { id: "4", title: "Settings", type: "navigation", icon: Settings, href: "/settings" },
  { id: "5", title: "Neural Synapse Mapping", type: "fragment", icon: FileText, href: "/knowledge" },
  { id: "6", title: "Quantum Entanglement Protocol", type: "fragment", icon: FileText, href: "/knowledge" },
]

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const t = useTranslations("search")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
    }
  }, [isOpen])

  const results = searchItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )

  const handleNavigate = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-surface-dark border border-border-dark rounded-2xl shadow-2xl overflow-hidden"
          >
            <div
              className={`flex items-center px-4 py-4 border-b transition-all duration-300 ${
                isFocused
                  ? "border-primary/50 bg-primary/5"
                  : "border-border-dark"
              }`}
            >
              <Search
                size={20}
                className={`mr-3 transition-colors ${
                  isFocused ? "text-primary" : "text-slate-500"
                }`}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t("placeholder")}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-lg text-text-main placeholder:text-slate-600"
              />
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded border transition-all ${
                  isFocused
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-white/5 border-white/10 text-slate-500"
                } text-[10px] font-bold`}
              >
                <Command size={10} />
                <span>K</span>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-1 text-slate-500 hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.href)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 group transition-all text-left"
                    >
                      <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-main">
                          {item.title}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                          {item.type}
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-500">
                    {t("noResults")} &quot;{query}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-white/5 border-t border-border-dark flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-white/10 rounded">↑↓</span>{" "}
                  {t("navigate")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-white/10 rounded">↵</span>{" "}
                  {t("select")}
                </span>
              </div>
              <span>{t("globalSearch")}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
