"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { useAuth } from "@/providers/auth-provider"
import { Loader2 } from "lucide-react"

export default function GitHubCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const githubOAuth = useAuth((s) => s.githubOAuth)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = searchParams.get("code")
    if (!code) {
      router.replace(`/${locale}/login`)
      return
    }

    githubOAuth(code).then((success) => {
      router.replace(success ? `/${locale}/today` : `/${locale}/login`)
    })
  }, [searchParams, router, locale, githubOAuth])

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  )
}
