"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "@/i18n/navigation"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useAuth } from "@/providers/auth-provider"
import { useTodayDashboard } from "@ask-dorian/core/hooks"
import {
  LayoutDashboard,
  Zap,
  Library,
  Settings,
  History,
  PlusCircle,
  Bot,
  LogOut,
  ChevronRight,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react"

const navItems = [
  { id: "today", href: "/today", icon: LayoutDashboard },
  { id: "stream", href: "/stream", icon: Zap },
  { id: "library", href: "/knowledge", icon: Library },
  { id: "review", href: "/review", icon: History },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("nav")
  const tSidebar = useTranslations("sidebar")
  const logout = useAuth((s) => s.logout)
  const user = useAuth((s) => s.user)
  const { data: dashboard } = useTodayDashboard()
  const [showChangelog, setShowChangelog] = useState(false)
  const changelogRef = useRef<HTMLDivElement>(null)

  // Ritual progress for daily goal
  const ritualProgress = dashboard?.rituals?.progress
  const goalCompleted = ritualProgress?.completed ?? 0
  const goalTotal = ritualProgress?.total ?? 0
  const goalPercent = goalTotal > 0 ? Math.round((goalCompleted / goalTotal) * 100) : 0

  const isActive = (href: string) => pathname.includes(href)

  // Close changelog popover when clicking outside
  useEffect(() => {
    if (!showChangelog) return
    const handleClickOutside = (e: MouseEvent) => {
      if (changelogRef.current && !changelogRef.current.contains(e.target as Node)) {
        setShowChangelog(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showChangelog])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border-dark bg-surface-dark/30 flex-col hidden lg:flex">
        <div className="p-6 flex items-center justify-between">
          <Link href="/today" className="flex items-center gap-3 group">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Bot size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-main group-hover:text-primary transition-colors">
              Dorian
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-3">
            {t("mainNavigation")}
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                    : "text-slate-400 hover:text-text-main hover:bg-white/5"
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    active
                      ? ""
                      : "group-hover:text-primary transition-colors"
                  }
                />
                <span className="text-sm">{t(item.id as typeof navItems[number]["id"])}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}

          <div className="pt-8 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-3">
              Support
            </div>
            <Link
              href="/support"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive("/support")
                  ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                  : "text-slate-400 hover:text-text-main hover:bg-white/5"
              }`}
            >
              <HelpCircle
                size={20}
                className={
                  isActive("/support")
                    ? ""
                    : "group-hover:text-primary transition-colors"
                }
              />
              <span className="text-sm">{t("support")}</span>
              {isActive("/support") && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </Link>
            <div className="relative" ref={changelogRef}>
              <button
                onClick={() => setShowChangelog((prev) => !prev)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-text-main hover:bg-white/5 transition-all group"
              >
                <Sparkles
                  size={20}
                  className="group-hover:text-primary transition-colors"
                />
                <span className="text-sm">{t("whatsNew")}</span>
              </button>
              {showChangelog && (
                <div className="absolute left-full top-0 ml-2 w-72 bg-surface-dark border border-border-dark rounded-xl p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                      Changelog
                    </span>
                    <button
                      onClick={() => setShowChangelog(false)}
                      className="text-slate-500 hover:text-text-main transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-text-main">v0.1.0</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Initial release. Fragment capture, rituals, knowledge library.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <button
            onClick={() => router.push("/review")}
            className="w-full bg-primary/10 rounded-xl p-4 border border-primary/20 text-left hover:bg-primary/15 transition-all group"
          >
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
              {tSidebar("dailyGoal")}
            </p>
            <div className="w-full bg-border-dark h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <p className="text-[10px] mt-2 text-slate-400">
              {goalCompleted}/{goalTotal} {tSidebar("ritualsComplete")}
            </p>
          </button>

          <Link
            href="/settings"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
              isActive("/settings")
                ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                : "text-slate-400 hover:text-text-main hover:bg-white/5"
            }`}
          >
            <Settings
              size={20}
              className={
                isActive("/settings")
                  ? ""
                  : "group-hover:text-primary transition-colors"
              }
            />
            <span className="text-sm">{t("settings")}</span>
          </Link>

          <div className="flex items-center gap-3 px-2 pt-2 border-t border-border-dark group cursor-pointer">
            <div className="size-9 rounded-full bg-slate-800 border border-border-dark overflow-hidden group-hover:border-primary/50 transition-colors">
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "D"}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-text-main group-hover:text-primary transition-colors">
                {user?.name ?? "Dorian User"}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {tSidebar("proPlan")}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="text-slate-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-dark/80 backdrop-blur-xl border-t border-border-dark px-6 py-3 flex items-center justify-between z-50">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(item.href) ? "text-primary" : "text-slate-500"
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {t(item.id as typeof navItems[number]["id"])}
            </span>
          </Link>
        ))}
        <Link
          href="/settings"
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive("/settings") ? "text-primary" : "text-slate-500"
          }`}
        >
          <Settings size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {t("settings")}
          </span>
        </Link>
      </nav>
    </>
  )
}
