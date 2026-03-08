"use client";

import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { Button } from "@/components/ui/button";

const routeKeys: Record<string, string> = {
  "/today": "nav.today",
  "/inbox": "nav.inbox",
  "/skills": "nav.skills",
  "/weekly": "nav.weekly",
  "/projects": "nav.projects",
  "/review": "nav.review",
  "/calendar": "nav.calendar",
  "/knowledge": "nav.knowledge",
  "/settings": "nav.settings",
  "/notifications": "nav.notifications",
};

const standaloneRoutes = ["/auth", "/onboarding"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();

  const strippedPath = pathname.replace(`/${locale}`, "") || "/";

  const isStandalone = standaloneRoutes.some((r) => strippedPath.startsWith(r));

  if (isStandalone) {
    return (
      <div className="min-h-svh flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="font-semibold text-sm">Ask Dorian</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  const matchedRoute = Object.keys(routeKeys).find(
    (route) => strippedPath === route || strippedPath.startsWith(`${route}/`),
  );
  const pageTitle = matchedRoute ? t(routeKeys[matchedRoute]) : "Ask Dorian";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4!" />
          <h1 className="text-sm font-medium">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
            >
              <span>⌘K</span>
            </Button>
            <LocaleSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
      <CommandPalette />
      <KeyboardShortcuts />
    </SidebarProvider>
  );
}
