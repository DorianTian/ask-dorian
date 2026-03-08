// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import { Bell, Check, Clock, AlertTriangle, Info, Inbox } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { notifications } from "@/lib/mock-data"

const typeIcon = {
  "task-due": Clock,
  overdue: AlertTriangle,
  "fragment-pending": Inbox,
  "review-ready": Check,
  system: Info,
}

const typeColor = {
  "task-due": "text-blue-600",
  overdue: "text-red-600",
  "fragment-pending": "text-amber-600",
  "review-ready": "text-emerald-600",
  system: "text-muted-foreground",
}

export default function NotificationsPage() {
  const t = useTranslations("notifications")

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{unreadCount} {t("unread")}</Badge>
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          <Check className="size-3" />
          {t("markAllRead")}
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
          <TabsTrigger value="unread">{t("unread")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("taskReminders")}</TabsTrigger>
          <TabsTrigger value="system">{t("systemNotices")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcon[notification.type]
            const color = typeColor[notification.type]
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                  !notification.read ? "border-l-2 border-l-primary" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 py-4">
                  <Icon className={`size-5 shrink-0 mt-0.5 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString("en", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {["unread", "tasks", "system"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              {tab} filtered view
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
