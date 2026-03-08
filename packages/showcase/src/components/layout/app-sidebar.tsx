"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import {
  Sparkles,
  Sun,
  Inbox,
  CalendarRange,
  FolderKanban,
  RotateCcw,
  Calendar,
  BookOpen,
  Settings,
  Bell,
  ChevronUp,
} from "lucide-react"

import { Link } from "@/i18n/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  titleKey: string
  href: string
  icon: React.ElementType
  mvp?: boolean
}

const workspaceItems: NavItem[] = [
  { titleKey: "nav.today", href: "/today", icon: Sun, mvp: true },
  { titleKey: "nav.inbox", href: "/inbox", icon: Inbox, mvp: true },
  { titleKey: "nav.weekly", href: "/weekly", icon: CalendarRange, mvp: true },
  { titleKey: "nav.projects", href: "/projects", icon: FolderKanban, mvp: true },
  { titleKey: "nav.review", href: "/review", icon: RotateCcw, mvp: true },
]

const extendedItems: NavItem[] = [
  { titleKey: "nav.calendar", href: "/calendar", icon: Calendar },
  { titleKey: "nav.knowledge", href: "/knowledge", icon: BookOpen },
]

const systemItems: NavItem[] = [
  { titleKey: "nav.notifications", href: "/notifications", icon: Bell },
  { titleKey: "nav.settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()

  const strippedPath = pathname.replace(`/${locale}`, "") || "/"

  function isActive(href: string) {
    return strippedPath === href || strippedPath.startsWith(`${href}/`)
  }

  function renderNavGroup(items: NavItem[], label: string) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive(item.href)}
                  tooltip={t(item.titleKey)}
                >
                  <item.icon className="size-4" />
                  <span>{t(item.titleKey)}</span>
                  {item.mvp && (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                      MVP
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/today" />} tooltip="Ask Dorian">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Ask Dorian</span>
                <span className="truncate text-xs text-muted-foreground">
                  {t("common.tagline")}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {renderNavGroup(workspaceItems, t("sidebar.workspace"))}
        {renderNavGroup(extendedItems, t("sidebar.navigation"))}
        {renderNavGroup(systemItems, t("sidebar.system"))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Dorian User</span>
                  <span className="truncate text-xs text-muted-foreground">Pro Plan</span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>{t("sidebar.profile")}</DropdownMenuItem>
                <DropdownMenuItem>{t("nav.settings")}</DropdownMenuItem>
                <DropdownMenuItem>{t("sidebar.signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
