"use client"

import { usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"

const routeKeys: Record<string, string> = {
  "/today": "nav.today",
  "/inbox": "nav.inbox",
  "/weekly": "nav.weekly",
  "/projects": "nav.projects",
  "/review": "nav.review",
  "/calendar": "nav.calendar",
  "/knowledge": "nav.knowledge",
  "/settings": "nav.settings",
  "/notifications": "nav.notifications",
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const t = useTranslations()
  const locale = useLocale()

  const strippedPath = pathname.replace(`/${locale}`, "") || "/"

  const matchedRoute = Object.keys(routeKeys).find(
    (route) => strippedPath === route || strippedPath.startsWith(`${route}/`)
  )
  const pageTitle = matchedRoute
    ? t(routeKeys[matchedRoute])
    : "Ask Dorian"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4!" />
          <h1 className="text-sm font-medium">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
