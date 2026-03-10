"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useAuth } from "@/providers/auth-provider"
import { AppShell } from "@/components/layout/app-shell"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return <AppShell>{children}</AppShell>
}
