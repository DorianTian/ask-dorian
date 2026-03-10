"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import {
  Sun,
  Calendar,
  FolderOpen,
  Inbox,
  RotateCcw,
  Settings,
  Plus,
  Search,
  Moon,
  Monitor,
  LogOut,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/providers/auth-provider"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("nav")
  const router = useRouter()
  const { setTheme } = useTheme()
  const logout = useAuth((s) => s.logout)

  // ⌘K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const navigate = useCallback(
    (path: string) => {
      router.push(path)
      setOpen(false)
    },
    [router],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="搜索页面、操作..." />
      <CommandList>
        <CommandEmpty>没有找到结果</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="导航">
          <CommandItem onSelect={() => navigate("/today")}>
            <Sun className="mr-2 h-4 w-4" />
            {t("today")}
          </CommandItem>
          <CommandItem onSelect={() => navigate("/weekly")}>
            <Calendar className="mr-2 h-4 w-4" />
            {t("weekly")}
          </CommandItem>
          <CommandItem onSelect={() => navigate("/projects")}>
            <FolderOpen className="mr-2 h-4 w-4" />
            {t("projects")}
          </CommandItem>
          <CommandItem onSelect={() => navigate("/inbox")}>
            <Inbox className="mr-2 h-4 w-4" />
            {t("inbox")}
          </CommandItem>
          <CommandItem onSelect={() => navigate("/review")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("review")}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="快捷操作">
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            新建碎片
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            新建任务
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Theme */}
        <CommandGroup heading="外观">
          <CommandItem
            onSelect={() => {
              setTheme("light")
              setOpen(false)
            }}
          >
            <Sun className="mr-2 h-4 w-4" />
            浅色模式
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme("dark")
              setOpen(false)
            }}
          >
            <Moon className="mr-2 h-4 w-4" />
            深色模式
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme("system")
              setOpen(false)
            }}
          >
            <Monitor className="mr-2 h-4 w-4" />
            跟随系统
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Account */}
        <CommandGroup heading="账号">
          <CommandItem
            onSelect={() => {
              logout()
              setOpen(false)
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
