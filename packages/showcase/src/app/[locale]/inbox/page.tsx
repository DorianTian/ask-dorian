// @MVP - Phase 1
"use client";

import { useTranslations } from "next-intl";
import {
  Inbox,
  Send,
  Image,
  Link2,
  Mic,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  BookOpen,
  Lightbulb,
  ListTodo,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { fragments } from "@/lib/mock-data";

const classificationIcon = {
  task: ListTodo,
  schedule: Calendar,
  knowledge: BookOpen,
  inspiration: Lightbulb,
  "follow-up": ArrowRight,
};

const classificationColor = {
  task: "text-blue-600 bg-blue-50 border-blue-200",
  schedule: "text-purple-600 bg-purple-50 border-purple-200",
  knowledge: "text-emerald-600 bg-emerald-50 border-emerald-200",
  inspiration: "text-amber-600 bg-amber-50 border-amber-200",
  "follow-up": "text-orange-600 bg-orange-50 border-orange-200",
};

export default function InboxPage() {
  const t = useTranslations("inbox");

  const unprocessed = fragments.filter((f) => f.status === "unprocessed");
  const classified = fragments.filter((f) => f.status === "classified");

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="rounded-lg border bg-muted/30 p-4 min-h-[80px]">
                <p className="text-sm text-muted-foreground">
                  {t("inputPlaceholder")}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Image className="size-3.5" />
                    {t("uploadImage")}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Link2 className="size-3.5" />
                    {t("pasteLink")}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Mic className="size-3.5" />
                    {t("voiceInput")}
                  </Button>
                </div>
                <Button size="sm" className="gap-1.5">
                  <Sparkles className="size-3.5" />
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fragment List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            {t("allItems")} ({fragments.length})
          </TabsTrigger>
          <TabsTrigger value="unprocessed">
            {t("unprocessed")} ({unprocessed.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">{t("tasks")}</TabsTrigger>
          <TabsTrigger value="schedules">{t("schedules")}</TabsTrigger>
          <TabsTrigger value="knowledge">{t("knowledge")}</TabsTrigger>
          <TabsTrigger value="inspiration">{t("inspiration")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {fragments.map((fragment) => {
            const Icon = fragment.classification
              ? classificationIcon[fragment.classification]
              : Circle;
            const colorClass = fragment.classification
              ? classificationColor[fragment.classification]
              : "";

            return (
              <Card key={fragment.id}>
                <CardContent className="flex items-start gap-3 py-4">
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                      fragment.status === "classified" ? colorClass : "bg-muted"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{fragment.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(fragment.createdAt).toLocaleString("en", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                      {fragment.classification && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${colorClass}`}
                        >
                          {fragment.classification}
                        </Badge>
                      )}
                      {fragment.confidence && (
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(fragment.confidence * 100)}% confidence
                        </span>
                      )}
                      {fragment.status === "unprocessed" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-amber-600 border-amber-300"
                        >
                          pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {fragment.status === "unprocessed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                      >
                        <Sparkles className="size-3" />
                        {t("classify")}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Other tabs show same content for prototype */}
        {["unprocessed", "tasks", "schedules", "knowledge", "inspiration"].map(
          (tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                {t("allItems")} — filtered view
              </div>
            </TabsContent>
          ),
        )}
      </Tabs>
    </div>
  );
}
