// @MVP - Phase 1
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Send,
  FileText,
  Mic,
  FileUp,
  Camera,
  Link2,
  Upload,
  ListTodo,
  Calendar,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Loader2,
  Circle,
  MoreHorizontal,
  AlertTriangle,
  MessageCircle,
  Smartphone,
  Monitor,
  Mail,
  Zap,
  Brain,
  GitBranch,
  Repeat,
  Clock,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { fragments, processedFragments, pipelineStats } from "@/lib/mock-data";
import type { ProcessedFragment, AIGeneratedEntity } from "@/lib/types";

// -- constants --

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

type InputMode = "text" | "voice" | "document" | "screenshot" | "link";

const INPUT_MODES = [
  { key: "text" as const, icon: FileText, labelKey: "inputModeText" },
  { key: "voice" as const, icon: Mic, labelKey: "inputModeVoice" },
  { key: "document" as const, icon: FileUp, labelKey: "inputModeDocument" },
  { key: "screenshot" as const, icon: Camera, labelKey: "inputModeScreenshot" },
  { key: "link" as const, icon: Link2, labelKey: "inputModeLink" },
] as const;

const SOURCE_ICON = {
  "cmd-k": Monitor,
  mobile: Smartphone,
  email: Mail,
  "ios-shortcut": Zap,
  wechat: MessageCircle,
};
const SOURCE_LABEL: Record<string, string> = {
  "cmd-k": "⌘K",
  mobile: "手机",
  email: "邮件",
  "ios-shortcut": "快捷指令",
  wechat: "微信",
};

const ENTITY_ICON: Record<string, typeof ListTodo> = {
  task: ListTodo,
  event: Calendar,
  knowledge: BookOpen,
};
const ENTITY_COLOR: Record<string, string> = {
  task: "text-blue-500 bg-blue-500/10",
  event: "text-violet-500 bg-violet-500/10",
  knowledge: "text-emerald-500 bg-emerald-500/10",
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
};

// -- sub-components --

function EntityCard({ entity }: { entity: AIGeneratedEntity }) {
  const Icon = ENTITY_ICON[entity.type] ?? ListTodo;
  const color = ENTITY_COLOR[entity.type] ?? "text-muted-foreground bg-muted";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center size-6 rounded-md ${color}`}
      >
        <Icon className="size-3" />
      </div>
      <span className="text-sm">{entity.title}</span>
      {entity.priority && (
        <span
          className={`size-1.5 rounded-full ${PRIORITY_DOT[entity.priority]}`}
        />
      )}
      {entity.dueDate && (
        <span className="text-[11px] text-muted-foreground">
          {entity.dueDate}
        </span>
      )}
      {entity.time && (
        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
          <Clock className="size-2.5" />
          {entity.time}
        </span>
      )}
      {entity.project && (
        <span className="text-[11px] text-muted-foreground">
          {entity.project}
        </span>
      )}
      {entity.isRecurring && <Repeat className="size-3 text-muted-foreground" />}
    </div>
  );
}

function ProcessedFragmentCard({ pf }: { pf: ProcessedFragment }) {
  const SourceIcon = SOURCE_ICON[pf.inputSource];
  const isConfirm = pf.processStatus === "needs_confirmation";
  const ai = pf.aiResult;

  return (
    <Card
      className={isConfirm ? "border-amber-200 dark:border-amber-800/50" : ""}
    >
      <CardContent className="pt-4 space-y-3">
        {/* Raw input + source */}
        <div className="flex items-start gap-3">
          <div
            className={`flex items-center justify-center size-8 rounded-lg shrink-0 ${
              isConfirm ? "bg-amber-500/10" : "bg-violet-500/10"
            }`}
          >
            <Brain
              className={`size-4 ${isConfirm ? "text-amber-500" : "text-violet-500"}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              &ldquo;{pf.rawContent}&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant="outline"
                className="text-[10px] h-5 gap-1 font-normal"
              >
                <SourceIcon className="size-3" />
                {SOURCE_LABEL[pf.inputSource]}
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono">
                {new Date(pf.capturedAt).toLocaleTimeString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  ai.confidence >= 0.9
                    ? "text-emerald-600"
                    : ai.confidence >= 0.7
                      ? "text-blue-600"
                      : "text-amber-600"
                }`}
              >
                {Math.round(ai.confidence * 100)}%
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {pf.processingTimeMs}ms
              </span>
              {ai.isSplit && (
                <Badge
                  variant="outline"
                  className="text-[10px] text-violet-600 border-violet-300"
                >
                  拆分为 {ai.splitCount} 项
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* AI interpretation */}
        <p className="text-xs text-muted-foreground leading-relaxed pl-11">
          {ai.interpretation}
        </p>

        {/* Matched entities */}
        {ai.matchedEntities.length > 0 && (
          <div className="flex items-center gap-2 pl-11 flex-wrap">
            <GitBranch className="size-3.5 text-blue-500 shrink-0" />
            {ai.matchedEntities.map((e, i) => {
              const Icon = ENTITY_ICON[e.type] ?? ListTodo;
              return (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[11px] gap-1 font-normal"
                >
                  <Icon className="size-3" />
                  {e.title}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Generated entities */}
        {ai.generatedEntities.length > 0 && (
          <div className="pl-11 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              生成 {ai.generatedEntities.length} 个事项
            </p>
            <div className="space-y-1.5">
              {ai.generatedEntities.map((entity, i) => (
                <EntityCard key={i} entity={entity} />
              ))}
            </div>
          </div>
        )}

        {/* Conflicts */}
        {ai.conflicts.length > 0 && (
          <div className="pl-11 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2">
            {ai.conflicts.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300"
              >
                <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                <span>
                  {c.description} —{" "}
                  <span className="font-medium">{c.suggestion}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Confirm prompt */}
        {ai.userPrompt && (
          <div className="pl-11 flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-muted-foreground">
              {ai.userPrompt.message}
            </span>
            {ai.userPrompt.options.map((option, i) => (
              <Button
                key={i}
                variant={i === 0 ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -- main page --

export default function InboxPage() {
  const t = useTranslations("inbox");

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [inputValue, setInputValue] = useState("");

  const classifying = fragments.filter((f) => f.status === "classifying");
  const unprocessed = fragments.filter((f) => f.status === "unprocessed");

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-violet-500/10">
            <Sparkles className="size-4 text-violet-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("smartInputTitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Smart Input Hub ── */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          {/* Input Area */}
          {inputMode === "text" || inputMode === "link" ? (
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                inputMode === "link" ? "https://..." : t("inputPlaceholder")
              }
              className="min-h-[100px] resize-none text-sm"
            />
          ) : inputMode === "voice" ? (
            <div className="min-h-[100px] rounded-lg border bg-muted/30 flex flex-col items-center justify-center gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className="relative flex size-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-4 bg-red-500" />
                </span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {t("voiceRecording")}
                </span>
              </div>
              <div className="flex items-center gap-0.5 h-8">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-violet-400/60 rounded-full"
                    style={{
                      height: `${Math.max(4, Math.sin(i * 0.5) * 16 + Math.random() * 12 + 8)}px`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                00:12
              </span>
            </div>
          ) : (
            <div className="min-h-[100px] rounded-lg border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center gap-3 p-6 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                <Upload className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("dropzoneHint")}
              </p>
            </div>
          )}

          {/* Input Mode Switcher + Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {INPUT_MODES.map((mode) => {
                const ModeIcon = mode.icon;
                const isActive = inputMode === mode.key;
                return (
                  <Button
                    key={mode.key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setInputMode(mode.key)}
                  >
                    <ModeIcon className="size-3.5" />
                    {t(mode.labelKey)}
                  </Button>
                );
              })}
            </div>
            <Button size="sm" className="gap-2 h-9 px-5">
              <Sparkles className="size-4" />
              {t("aiProcess")}
              <Send className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ── AI Processing Showcase ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-violet-500/10">
            <Brain className="size-4 text-violet-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Dorian 处理实况</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pipelineStats.todayInputs} 碎片输入 →{" "}
              {pipelineStats.generatedTasks} 任务 ·{" "}
              {pipelineStats.generatedEvents} 日程 ·{" "}
              {pipelineStats.generatedKnowledge} 知识
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {processedFragments.map((pf) => (
            <ProcessedFragmentCard key={pf.id} pf={pf} />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Fragment History ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-muted">
            <Settings className="size-4 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">历史记录</h3>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              {t("allItems")} ({fragments.length})
            </TabsTrigger>
            <TabsTrigger value="unprocessed">
              {t("unprocessed")} ({unprocessed.length + classifying.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">{t("tasks")}</TabsTrigger>
            <TabsTrigger value="schedules">{t("schedules")}</TabsTrigger>
            <TabsTrigger value="knowledge">{t("knowledge")}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {fragments.map((fragment) => {
              const isClassifying = fragment.status === "classifying";
              const Icon = isClassifying
                ? Loader2
                : fragment.classification
                  ? classificationIcon[fragment.classification]
                  : Circle;
              const colorClass = fragment.classification
                ? classificationColor[fragment.classification]
                : "";

              return (
                <Link
                  key={fragment.id}
                  href={`/inbox/${fragment.id}`}
                  className="block"
                >
                  <Card className="hover:bg-muted/30 transition-colors">
                    <CardContent className="flex items-start gap-3 py-3">
                      <div
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                          isClassifying
                            ? "bg-muted border-dashed"
                            : fragment.status === "classified"
                              ? colorClass
                              : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`size-4 ${isClassifying ? "animate-spin text-muted-foreground" : ""}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{fragment.content}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted-foreground">
                            {new Date(fragment.createdAt).toLocaleString("en", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                          {isClassifying && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-violet-600 border-violet-300 animate-pulse"
                            >
                              {t("classifying")}
                            </Badge>
                          )}
                          {fragment.classification && (
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${colorClass}`}
                            >
                              {fragment.classification}
                            </Badge>
                          )}
                          {fragment.confidence && (
                            <span
                              className={`text-[11px] font-medium ${
                                fragment.confidence >= 0.9
                                  ? "text-emerald-600"
                                  : fragment.confidence >= 0.7
                                    ? "text-blue-600"
                                    : "text-amber-600"
                              }`}
                            >
                              {Math.round(fragment.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </TabsContent>

          {["unprocessed", "tasks", "schedules", "knowledge"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                {t("allItems")} — filtered view
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
