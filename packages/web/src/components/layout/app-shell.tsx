"use client"

import type { ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TopNav } from "./top-nav"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={300}>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 px-6 py-5">{children}</main>
      </div>
    </TooltipProvider>
  )
}
