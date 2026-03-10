"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useAuth } from "@/providers/auth-provider"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/today")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
