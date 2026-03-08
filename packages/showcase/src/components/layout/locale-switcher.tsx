"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggleLocale() {
    const nextLocale = locale === "zh" ? "en" : "zh"
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-1.5 text-xs">
      <Languages className="size-3.5" />
      {locale === "zh" ? "EN" : "中文"}
    </Button>
  )
}
