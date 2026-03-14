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
  const accessToken = useAuth((s) => s.accessToken)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, router])

  // Not authenticated — redirect is pending, show nothing
  if (!isAuthenticated || !accessToken) return null

  return <AppShell>{children}</AppShell>
}
