// @Phase2+
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar, User, Mail, MessageSquare, MessagesSquare } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Integration {
  id: string
  icon: React.ComponentType<{ className?: string }>
  nameKey: string
  name: string
  description: string
  connected: boolean
  phase3?: boolean
}

const initialIntegrations: Integration[] = [
  {
    id: "google-calendar",
    icon: Calendar,
    nameKey: "googleCalendar",
    name: "Google Calendar",
    description: "双向同步日历事件",
    connected: true,
  },
  {
    id: "google-account",
    icon: User,
    nameKey: "googleAccount",
    name: "Google Account",
    description: "OAuth 登录",
    connected: true,
  },
  {
    id: "outlook-calendar",
    icon: Mail,
    nameKey: "outlookCalendar",
    name: "Outlook Calendar",
    description: "同步 Outlook 日历",
    connected: false,
  },
  {
    id: "slack",
    icon: MessageSquare,
    nameKey: "slack",
    name: "Slack",
    description: "接收碎片推送",
    connected: false,
  },
  {
    id: "wecom",
    icon: MessagesSquare,
    nameKey: "wecom",
    name: "企业微信",
    description: "接收碎片推送",
    connected: false,
    phase3: true,
  },
]

export default function IntegrationsPage() {
  const t = useTranslations("settingsIntegrations")

  const [integrations, setIntegrations] = useState(initialIntegrations)

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <integration.icon className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{integration.name}</p>
                {integration.phase3 && (
                  <Badge variant="outline" className="text-xs">
                    Phase 3
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {integration.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  integration.connected
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-500"
                }
              >
                {integration.connected ? t("connected") : t("notConnected")}
              </Badge>
              <Button
                variant={integration.connected ? "outline" : "default"}
                size="sm"
                onClick={() => toggleConnection(integration.id)}
                disabled={integration.phase3}
              >
                {integration.connected ? t("disconnect") : t("connect")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
