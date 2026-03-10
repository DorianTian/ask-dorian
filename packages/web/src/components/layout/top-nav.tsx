"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useUnreadCount } from "@ask-dorian/core/hooks"
import { cn } from "@/lib/utils"
import {
  Sun,
  Calendar,
  FolderOpen,
  Inbox,
  RotateCcw,
  Bell,
  Search,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import { CommandPalette } from "./command-palette"

const primaryLinks = [
  { href: "/today", icon: Sun, labelKey: "today" },
  { href: "/weekly", icon: Calendar, labelKey: "weekly" },
  { href: "/projects", icon: FolderOpen, labelKey: "projects" },
] as const

const secondaryLinks = [
  { href: "/inbox", icon: Inbox, labelKey: "inbox" },
  { href: "/review", icon: RotateCcw, labelKey: "review" },
] as const

export function TopNav() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.count ?? 0

  return (
    <>
      <CommandPalette />
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-6 px-6">
          {/* Logo */}
          <Link
            href="/today"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-brand-gradient text-lg font-bold">D</span>
            <span className="hidden text-sm sm:inline">Ask Dorian</span>
          </Link>

          {/* Primary Nav */}
          <nav className="flex items-center gap-1">
            {primaryLinks.map(({ href, icon: Icon, labelKey }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                  title={t(labelKey)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t(labelKey)}</span>
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="h-4 w-px bg-border" />

          {/* Secondary Nav */}
          <nav className="flex items-center gap-1">
            {secondaryLinks.map(({ href, icon: Icon, labelKey }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                  title={t(labelKey)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t(labelKey)}</span>
                </Link>
              )
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* ⌘K Trigger */}
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 gap-2 border-muted bg-muted/50 px-3 text-xs text-muted-foreground hover:bg-muted sm:flex"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                  }),
                )
              }}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">搜索...</span>
              <kbd className="pointer-events-none rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                ⌘K
              </kbd>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Link
              href="/today"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={t("notifications")}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  )
}
