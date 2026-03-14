"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Search, Bell, Zap, Moon, Sun, Command, BellOff } from "lucide-react"

interface HeaderProps {
  title: string
  subtitle?: string
  onSearchOpen: () => void
}

export function Header({ title, subtitle, onSearchOpen }: HeaderProps) {
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("header")

  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (!showNotifications) return
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showNotifications])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  // Focus Mode: toggle body class to hide sidebar, capture bar, and dim non-essential UI
  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add("focus-mode")
    } else {
      document.body.classList.remove("focus-mode")
    }
    return () => document.body.classList.remove("focus-mode")
  }, [isFocusMode])

  return (
    <header className="h-16 border-b border-border-dark flex items-center justify-between px-4 md:px-8 bg-surface-dark/30 backdrop-blur-md sticky top-0 z-50">
      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4 overflow-hidden">
        <h2 className="text-base md:text-lg font-black tracking-tight text-text-main truncate">
          {title}
        </h2>
        {subtitle && (
          <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate hidden sm:inline">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${
            isFocusMode
              ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap size={14} className={isFocusMode ? "animate-pulse" : ""} />
          <span className="hidden sm:inline">
            {isFocusMode ? t("focusActive") : t("focusMode")}
          </span>
        </button>

        <button
          onClick={onSearchOpen}
          className="hidden lg:flex items-center gap-3 bg-surface-dark border border-border-dark rounded-xl px-4 py-1.5 text-xs w-48 xl:w-64 text-slate-500 hover:border-primary/50 transition-all group"
        >
          <Search
            size={16}
            className="group-hover:text-primary transition-colors"
          />
          <span className="flex-1 text-left">{t("searchPlaceholder")}</span>
          <div className="flex items-center gap-1 px-1 py-0.5 bg-white/5 rounded border border-white/10 text-[8px] font-bold">
            <Command size={8} />
            <span>K</span>
          </div>
        </button>

        <button
          onClick={toggleTheme}
          className="size-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-slate-400"
          title={
            resolvedTheme === "light"
              ? "Switch to Dark Mode"
              : "Switch to Light Mode"
          }
        >
          {resolvedTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="size-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors relative text-slate-400"
          >
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 size-1.5 bg-primary rounded-full" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface-dark border border-border-dark rounded-xl p-4 shadow-2xl z-50">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                Notifications
              </p>
              <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                <BellOff size={24} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No new notifications</p>
                <p className="text-[10px] mt-1 text-slate-600">You&apos;re all caught up</p>
              </div>
            </div>
          )}
        </div>

        <div className="size-8 rounded-lg bg-slate-800 border border-border-dark overflow-hidden lg:hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
            D
          </div>
        </div>
      </div>
    </header>
  )
}
