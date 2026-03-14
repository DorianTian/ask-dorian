"use client"

import { useState, useEffect, type ReactNode } from "react"
import { usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { QuickCaptureBar } from "./quick-capture-bar"
import { GlobalSearch } from "./global-search"

function usePageMeta(pathname: string) {
  const t = useTranslations()

  if (pathname.includes("/today"))
    return { title: t("today.greeting"), subtitle: t("today.date") }
  if (pathname.includes("/stream"))
    return { title: t("stream.title"), subtitle: "Live" }
  if (pathname.includes("/knowledge"))
    return { title: t("knowledge.title") }
  if (pathname.includes("/review"))
    return { title: t("review.title") }
  if (pathname.includes("/settings"))
    return { title: t("settings.title") }
  if (pathname.includes("/support"))
    return { title: t("support.title") }
  return { title: "Ask Dorian" }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { title, subtitle } = usePageMeta(pathname)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  const isSettingsPage = pathname.includes("/settings")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark text-text-main font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <Header
          title={title}
          subtitle={subtitle}
          onSearchOpen={() => setIsSearchOpen(true)}
        />

        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0 h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {!isSettingsPage && (
          <QuickCaptureBar onSearchOpen={() => setIsSearchOpen(true)} />
        )}

        <GlobalSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </main>
    </div>
  )
}
