// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import {
  Settings,
  User,
  Palette,
  Languages,
  Bell,
  Bot,
  Plug,
  CreditCard,
  Download,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const settingSections = [
  { icon: Palette, titleKey: "appearance", descKey: "Theme, font size, density" },
  { icon: Languages, titleKey: "language", descKey: "Display language" },
  { icon: Bell, titleKey: "notifications", descKey: "Email, push, in-app" },
  { icon: Bot, titleKey: "aiPreferences", descKey: "Classification behavior, prompts" },
  { icon: Plug, titleKey: "integrations", descKey: "Google Calendar, Slack, etc." },
  { icon: CreditCard, titleKey: "subscription", descKey: "Plan, billing, usage" },
  { icon: Download, titleKey: "dataExport", descKey: "Export your data" },
]

export default function SettingsPage() {
  const t = useTranslations("settings")

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            {t("account")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              D
            </div>
            <div>
              <p className="font-medium">Dorian User</p>
              <p className="text-sm text-muted-foreground">dorian@askdorian.com</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pro Plan</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" />
            {t("appearance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-2 rounded-lg border-2 border-primary p-3">
              <Sun className="size-5" />
              <span className="text-xs font-medium">{t("lightMode")}</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border p-3 hover:border-primary/50">
              <Moon className="size-5" />
              <span className="text-xs">{t("darkMode")}</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border p-3 hover:border-primary/50">
              <Monitor className="size-5" />
              <span className="text-xs">{t("systemMode")}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Other Setting Sections */}
      <div className="space-y-2">
        {settingSections.slice(1).map((section) => (
          <Card key={section.titleKey} className="cursor-pointer hover:bg-muted/30 transition-colors">
            <CardContent className="flex items-center gap-4 py-4">
              <section.icon className="size-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t(section.titleKey)}</p>
                <p className="text-xs text-muted-foreground">{section.descKey}</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
