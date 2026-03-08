// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Inbox,
  ListTodo,
  BookOpen,
  HardDrive,
  Trash2,
  UserX,
  AlertTriangle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const dataStats = [
  { icon: Inbox, labelKey: "totalFragments" as const, value: "1,284" },
  { icon: ListTodo, labelKey: "totalTasks" as const, value: "356" },
  { icon: BookOpen, labelKey: "totalKnowledge" as const, value: "89" },
  { icon: HardDrive, labelKey: "storage" as const, value: "2.4 GB" },
]

export default function DataPage() {
  const t = useTranslations("settingsData")

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Data Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("dataStats")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {dataStats.map((stat) => (
              <div
                key={stat.labelKey}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-4"
              >
                <stat.icon className="size-5 text-muted-foreground" />
                <span className="text-lg font-semibold">{stat.value}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {t(stat.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="size-4" />
            {t("exportData")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("exportAll")}</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <FileJson className="size-4" />
                {t("exportJSON")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="size-4" />
                {t("exportCSV")}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("exportFragments")} / {t("exportTasks")} / {t("exportKnowledge")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Inbox className="size-4" />
                {t("exportFragments")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ListTodo className="size-4" />
                {t("exportTasks")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="size-4" />
                {t("exportKnowledge")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-600">
            <AlertTriangle className="size-4" />
            {t("dangerZone")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("clearData")}</p>
              <p className="text-xs text-muted-foreground">{t("clearDataWarning")}</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="size-4" />
              {t("clearData")}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">{t("deleteAccount")}</p>
              <p className="text-xs text-muted-foreground">{t("deleteAccountWarning")}</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2">
              <UserX className="size-4" />
              {t("deleteAccount")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
