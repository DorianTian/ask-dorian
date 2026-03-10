// @MVP - Phase 1 — Inbox
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
  Check,
  Pencil,
  X,
  HelpCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { processedFragments } from "@/lib/mock-data";
import type { ProcessedFragment } from "@/lib/types";

// -- Input modes --
type InputMode = "text" | "voice" | "document" | "screenshot" | "link";

const INPUT_MODES = [
  { key: "text" as const, icon: FileText, labelKey: "inputModeText" },
  { key: "voice" as const, icon: Mic, labelKey: "inputModeVoice" },
  { key: "document" as const, icon: FileUp, labelKey: "inputModeDocument" },
  { key: "screenshot" as const, icon: Camera, labelKey: "inputModeScreenshot" },
  { key: "link" as const, icon: Link2, labelKey: "inputModeLink" },
] as const;

// -- constants --

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  task: { label: "Task", className: "bg-blue-50 text-blue-600 border-blue-200" },
  event: { label: "Event", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  knowledge: { label: "Note", className: "bg-gray-50 text-gray-600 border-gray-200" },
  inspiration: { label: "Note", className: "bg-gray-50 text-gray-600 border-gray-200" },
};

const SOURCE_ICON: Record<string, typeof Monitor> = {
  "cmd-k": Monitor,
  mobile: Smartphone,
  email: Mail,
  "ios-shortcut": Zap,
  wechat: MessageCircle,
};
const SOURCE_LABEL: Record<string, string> = {
  "cmd-k": "⌘K",
  mobile: "Mobile",
  email: "Email",
  "ios-shortcut": "Shortcut",
  wechat: "WeChat",
};

const ENTITY_ICON: Record<string, typeof ListTodo> = {
  task: ListTodo,
  event: Calendar,
  knowledge: BookOpen,
};

// -- Fragment Card --

function FragmentCard({ pf }: { pf: ProcessedFragment }) {
  const t = useTranslations("inbox");
  const SourceIcon = SOURCE_ICON[pf.inputSource];
  const ai = pf.aiResult;
  const primaryType = ai.generatedEntities[0]?.type ?? "task";
  const badge = TYPE_BADGE[primaryType] ?? TYPE_BADGE.task;

  return (
    <Card className="border-border hover:border-foreground/10 transition-colors">
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] font-medium ${badge.className}`}>
            {badge.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground">·</span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <SourceIcon className="size-3" />
            {SOURCE_LABEL[pf.inputSource]}
          </div>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">
            {new Date(pf.capturedAt).toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>

        {/* Raw input */}
        <p className="text-sm text-muted-foreground">
          &ldquo;{pf.rawContent}&rdquo;
        </p>

        <Separator />

        {/* AI suggestion area */}
        <div className="rounded-md bg-muted/50 px-3 py-2.5 space-y-2">
          <p className="text-xs leading-relaxed">{ai.interpretation}</p>

          {ai.matchedEntities.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <GitBranch className="size-3 text-muted-foreground shrink-0" />
              {ai.matchedEntities.map((e, i) => {
                const Icon = ENTITY_ICON[e.type] ?? ListTodo;
                return (
                  <Badge key={i} variant="secondary" className="text-[10px] gap-1 font-normal h-5">
                    <Icon className="size-2.5" />
                    {e.title}
                  </Badge>
                );
              })}
            </div>
          )}

          {ai.generatedEntities.length > 0 && (
            <div className="space-y-1">
              {ai.generatedEntities.map((entity, i) => {
                const Icon = ENTITY_ICON[entity.type] ?? ListTodo;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Icon className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">{entity.title}</span>
                    {entity.dueDate && (
                      <span className="text-[11px] text-muted-foreground">{entity.dueDate}</span>
                    )}
                    {entity.time && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="size-2.5" />
                        {entity.time}
                      </span>
                    )}
                    {entity.isRecurring && <Repeat className="size-3 text-muted-foreground" />}
                  </div>
                );
              })}
            </div>
          )}

          {ai.conflicts.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              <span>
                {ai.conflicts[0].description} —{" "}
                <span className="font-medium">{ai.conflicts[0].suggestion}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-medium ${
                ai.confidence >= 0.9
                  ? "text-emerald-600"
                  : ai.confidence >= 0.7
                    ? "text-blue-600"
                    : "text-amber-600"
              }`}
            >
              {Math.round(ai.confidence * 100)}% {t("confidence")}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {pf.processingTimeMs}ms
            </span>
            {ai.isSplit && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-violet-300 text-violet-600">
                Split ×{ai.splitCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {ai.userPrompt ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{ai.userPrompt.message}</span>
            {ai.userPrompt.options.map((option, i) => (
              <Button key={i} variant={i === 0 ? "default" : "outline"} size="sm" className="text-xs h-7">
                {option}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
              <Check className="size-3" />
              {t("accept")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
              <Pencil className="size-3" />
              {t("editAction")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground">
              <X className="size-3" />
              {t("ignore")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -- Shimmer Card --

function ShimmerCard() {
  return (
    <Card className="border-border">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="ai-shimmer h-5 w-12 rounded" />
          <div className="ai-shimmer h-4 w-16 rounded" />
        </div>
        <p className="text-sm text-muted-foreground italic">
          &ldquo;下午和设计师过一下新版收集箱的交互稿&rdquo;
        </p>
        <div className="ai-shimmer h-16 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// -- Tab button --

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-1 pb-2 text-sm transition-colors border-b-2 ${
        active
          ? "border-foreground text-foreground font-medium"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// -- main --

type FilterTab = "all" | "tasks" | "events" | "notes" | "uncertain";

export default function InboxPage() {
  const t = useTranslations("inbox");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const taskCount = processedFragments.filter(
    (pf) => pf.aiResult.generatedEntities.some((e) => e.type === "task"),
  ).length;
  const eventCount = processedFragments.filter(
    (pf) => pf.aiResult.generatedEntities.some((e) => e.type === "event"),
  ).length;
  const uncertainCount = processedFragments.filter(
    (pf) => pf.processStatus === "needs_confirmation",
  ).length;

  const filteredFragments = processedFragments.filter((pf) => {
    if (activeTab === "all") return true;
    if (activeTab === "uncertain") return pf.processStatus === "needs_confirmation";
    if (activeTab === "tasks") return pf.aiResult.generatedEntities.some((e) => e.type === "task");
    if (activeTab === "events") return pf.aiResult.generatedEntities.some((e) => e.type === "event");
    if (activeTab === "notes") return pf.aiResult.generatedEntities.some((e) => e.type === "knowledge");
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Smart Input Hub ── */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          {/* Input Area — varies by mode */}
          {inputMode === "text" || inputMode === "link" ? (
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputMode === "link" ? "https://..." : t("inputPlaceholder")}
              className="min-h-[100px] resize-none text-sm"
            />
          ) : inputMode === "voice" ? (
            <div className="min-h-[100px] rounded-lg border bg-muted/30 flex flex-col items-center justify-center gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className="relative flex size-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-4 bg-red-500" />
                </span>
                <span className="text-sm font-medium text-red-600">
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
              <span className="text-xs text-muted-foreground font-mono">00:12</span>
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

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-4 border-b border-border">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          {t("filterAll")} ({processedFragments.length})
        </TabButton>
        <TabButton active={activeTab === "tasks"} onClick={() => setActiveTab("tasks")}>
          {t("filterTasks")} ({taskCount})
        </TabButton>
        <TabButton active={activeTab === "events"} onClick={() => setActiveTab("events")}>
          {t("filterEvents")} ({eventCount})
        </TabButton>
        <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>
          {t("filterNotes")}
        </TabButton>
        {uncertainCount > 0 && (
          <TabButton active={activeTab === "uncertain"} onClick={() => setActiveTab("uncertain")}>
            <span className="flex items-center gap-1">
              <HelpCircle className="size-3" />
              {uncertainCount}
            </span>
          </TabButton>
        )}
      </div>

      {/* ── Fragment List ── */}
      <div className="space-y-3">
        <ShimmerCard />
        {filteredFragments.map((pf) => (
          <FragmentCard key={pf.id} pf={pf} />
        ))}
      </div>

      {filteredFragments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="size-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{t("emptyInbox")}</p>
        </div>
      )}
    </div>
  );
}
