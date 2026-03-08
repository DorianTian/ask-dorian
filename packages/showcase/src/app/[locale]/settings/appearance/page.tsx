// @Phase2+
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Sun, Moon, Monitor, Palette, Type, PanelLeft } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Theme = "light" | "dark" | "system"
type Density = "compact" | "default" | "comfortable"
type FontSize = "small" | "medium" | "large"

export default function AppearancePage() {
  const t = useTranslations("settingsAppearance")

  const [theme, setTheme] = useState<Theme>("light")
  const [density, setDensity] = useState<Density>("default")
  const [fontSize, setFontSize] = useState<FontSize>("medium")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const themeOptions = [
    { value: "light" as Theme, icon: Sun, label: t("light") },
    { value: "dark" as Theme, icon: Moon, label: t("dark") },
    { value: "system" as Theme, icon: Monitor, label: t("system") },
  ]

  const densityOptions = [
    { value: "compact" as Density, label: t("compact") },
    { value: "default" as Density, label: t("default") },
    { value: "comfortable" as Density, label: t("comfortable") },
  ]

  const fontSizeOptions = [
    { value: "small" as FontSize, label: t("small") },
    { value: "medium" as FontSize, label: t("medium") },
    { value: "large" as FontSize, label: t("large") },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" />
            {t("theme")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  theme === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <option.icon className="size-6" />
                <span className={`text-sm ${theme === option.value ? "font-medium" : ""}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Density */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="size-4" />
            {t("density")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {densityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDensity(option.value)}
                className={`rounded-lg border-2 px-4 py-2.5 text-sm transition-colors ${
                  density === option.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="size-4" />
            {t("fontSize")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFontSize(option.value)}
                className={`rounded-lg border-2 px-4 py-2.5 text-sm transition-colors ${
                  fontSize === option.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Default */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PanelLeft className="size-4" />
            {t("sidebarDefault")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="sidebar-toggle" className="text-sm">
              {t("sidebarDefault")}
            </Label>
            <Switch
              id="sidebar-toggle"
              checked={sidebarExpanded}
              onCheckedChange={setSidebarExpanded}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
