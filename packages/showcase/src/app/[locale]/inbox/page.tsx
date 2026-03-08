// @MVP - Phase 1
"use client";

import { useState } from "react";
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
  Loader2,
  FileText,
  FileUp,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  Wand2,
  ClipboardList,
  LinkIcon,
  CalendarClock,
  GitBranch,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
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

type InputMode = "text" | "voice" | "document" | "screenshot" | "link";

const INPUT_MODES = [
  { key: "text" as const, icon: FileText, labelKey: "inputModeText" },
  { key: "voice" as const, icon: Mic, labelKey: "inputModeVoice" },
  { key: "document" as const, icon: FileUp, labelKey: "inputModeDocument" },
  { key: "screenshot" as const, icon: Camera, labelKey: "inputModeScreenshot" },
  { key: "link" as const, icon: Link2, labelKey: "inputModeLink" },
] as const;

const SKILL_OPTIONS = [
  { value: "auto-classify", emoji: "\uD83D\uDD2E", labelZh: "\u667A\u80FD\u5206\u7C7B", labelEn: "Smart Classify" },
  { value: "meeting-notes", emoji: "\uD83D\uDCCB", labelZh: "\u4F1A\u8BAE\u7EAA\u8981\u6574\u7406", labelEn: "Meeting Notes" },
  { value: "link-summary", emoji: "\uD83D\uDD17", labelZh: "\u94FE\u63A5\u6458\u8981", labelEn: "Link Summary" },
  { value: "schedule-extract", emoji: "\uD83D\uDCC5", labelZh: "\u65E5\u7A0B\u63D0\u53D6", labelEn: "Schedule Extract" },
  { value: "task-decompose", emoji: "\uD83D\uDCE6", labelZh: "\u4EFB\u52A1\u5206\u89E3", labelEn: "Task Decompose" },
];

const PIPELINE_STEPS = [
  { stepKey: "pipelineStep1", resultZh: "\u6587\u672C\u8F93\u5165", resultEn: "Text Input" },
  { stepKey: "pipelineStep2", resultZh: "\u4EFB\u52A1+\u65E5\u7A0B", resultEn: "Task+Schedule" },
  { stepKey: "pipelineStep3", resultZh: "\u65F6\u95F4/\u4EBA\u7269/\u4E3B\u9898", resultEn: "Time/People/Topic" },
  { stepKey: "pipelineStep4", resultZh: "\u521B\u5EFA\u4EFB\u52A1+\u4E8B\u4EF6", resultEn: "Create Task+Event" },
  { stepKey: "pipelineStep5", resultZh: "\u2192 \u6570\u636E\u5E73\u53F0", resultEn: "\u2192 Data Platform" },
  { stepKey: "pipelineStep6", resultZh: "95% \u7F6E\u4FE1\u5EA6", resultEn: "95% Confidence" },
];

export default function InboxPage() {
  const t = useTranslations("inbox");

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [selectedSkill, setSelectedSkill] = useState("auto-classify");
  const [inputValue, setInputValue] = useState("");
  const [pipelineExpanded, setPipelineExpanded] = useState(true);

  const classifying = fragments.filter((f) => f.status === "classifying");
  const unprocessed = fragments.filter((f) => f.status === "unprocessed");
  const classified = fragments.filter((f) => f.status === "classified");

  return (
    <div className="space-y-6">
      {/* Smart Input Hub */}
      <Card className="border-2 border-dashed border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 via-background to-fuchsia-50/30 dark:from-violet-950/20 dark:via-background dark:to-fuchsia-950/10">
        <CardContent className="pt-6 pb-5">
          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center size-8 rounded-lg bg-violet-100 dark:bg-violet-900/50">
              <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-violet-700 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              {t("smartInputTitle")}
            </h2>
          </div>

          {/* Input Area — changes based on mode */}
          <div className="mb-4">
            {inputMode === "text" || inputMode === "link" ? (
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  inputMode === "link"
                    ? "https://..."
                    : t("inputPlaceholder")
                }
                className="min-h-[120px] bg-background/80 backdrop-blur-sm border-violet-200 dark:border-violet-800 focus-visible:border-violet-400 focus-visible:ring-violet-300/50 resize-none"
              />
            ) : inputMode === "voice" ? (
              <div className="min-h-[120px] rounded-lg border border-violet-200 dark:border-violet-800 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex size-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-4 bg-red-500" />
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t("voiceRecording")}
                  </span>
                </div>
                {/* Waveform placeholder */}
                <div className="flex items-center gap-0.5 h-8">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-violet-400/60 dark:bg-violet-500/60 rounded-full"
                      style={{
                        height: `${Math.max(4, Math.sin(i * 0.5) * 16 + Math.random() * 12 + 8)}px`,
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-mono">00:12</span>
                <p className="text-xs text-muted-foreground">{t("recordingHint")}</p>
              </div>
            ) : (
              /* document / screenshot — drop zone */
              <div className="min-h-[120px] rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-700 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition-colors cursor-pointer">
                <div className="flex items-center justify-center size-12 rounded-full bg-violet-100 dark:bg-violet-900/50">
                  <Upload className="size-5 text-violet-500" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t("dropzoneHint")}
                </p>
              </div>
            )}
          </div>

          {/* Input Mode Switcher */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {INPUT_MODES.map((mode) => {
              const ModeIcon = mode.icon;
              const isActive = inputMode === mode.key;
              return (
                <Button
                  key={mode.key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`gap-1.5 text-xs h-8 ${
                    isActive
                      ? "bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-700"
                      : "hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-700 dark:hover:text-violet-400"
                  }`}
                  onClick={() => setInputMode(mode.key)}
                >
                  <ModeIcon className="size-3.5" />
                  {t(mode.labelKey)}
                </Button>
              );
            })}
          </div>

          {/* Bottom Row: Skill Selector + Submit */}
          <div className="flex items-center justify-between gap-3">
            {/* AI Skill Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("selectedSkill")}:
              </span>
              <Select value={selectedSkill} onValueChange={(v) => { if (v) setSelectedSkill(v); }}>
                <SelectTrigger className="h-8 text-xs gap-1 border-violet-200 dark:border-violet-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_OPTIONS.map((skill) => (
                    <SelectItem key={skill.value} value={skill.value}>
                      <span>{skill.emoji}</span>
                      <span>{skill.labelZh}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              size="sm"
              className="gap-2 h-9 px-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-violet-500/20"
            >
              <Sparkles className="size-4" />
              {t("aiProcess")}
              <Send className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Processing Pipeline Demo */}
      <Card className="border-violet-100 dark:border-violet-900/50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-violet-500" />
              <h3 className="text-sm font-semibold">{t("pipelineDemo")}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1 text-muted-foreground"
              onClick={() => setPipelineExpanded((prev) => !prev)}
            >
              {pipelineExpanded ? (
                <>
                  {t("pipelineCollapse")}
                  <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  {t("pipelineExpand")}
                  <ChevronDown className="size-3.5" />
                </>
              )}
            </Button>
          </div>

          {pipelineExpanded && (
            <div className="space-y-5">
              {/* Raw Input */}
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  Raw Input:
                </p>
                <p className="text-sm">
                  &quot;\u4E0B\u5468\u4E09\u548C\u4EA7\u54C1\u56E2\u961F\u5BF9\u9F50 Q2 OKR\uFF0C\u9700\u8981\u63D0\u524D\u51C6\u5907&quot;
                </p>
              </div>

              {/* Pipeline Steps — 2 rows of 3 */}
              <div className="space-y-4">
                {/* Row 1: Steps 1-3 */}
                <div className="flex items-start">
                  {PIPELINE_STEPS.slice(0, 3).map((step, idx) => (
                    <div key={step.stepKey} className="flex items-start flex-1">
                      <div className="flex flex-col items-center flex-1">
                        {/* Node */}
                        <div className="flex items-center justify-center size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 relative">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {idx + 1}
                          </span>
                          <div className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="size-2 text-white" strokeWidth={3} />
                          </div>
                        </div>
                        {/* Label */}
                        <span className="text-xs font-medium mt-1.5 text-center">
                          {t(step.stepKey)}
                        </span>
                        {/* Result */}
                        <span className="text-[10px] text-muted-foreground mt-0.5 text-center">
                          [{step.resultZh}]
                        </span>
                      </div>
                      {/* Connector line */}
                      {idx < 2 && (
                        <div className="flex-shrink-0 mt-4 w-8 lg:w-12">
                          <div className="h-0.5 bg-emerald-300 dark:bg-emerald-700 w-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Row 2: Steps 4-6 */}
                <div className="flex items-start">
                  {PIPELINE_STEPS.slice(3, 6).map((step, idx) => (
                    <div key={step.stepKey} className="flex items-start flex-1">
                      <div className="flex flex-col items-center flex-1">
                        {/* Node */}
                        <div className="flex items-center justify-center size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 relative">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {idx + 4}
                          </span>
                          <div className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="size-2 text-white" strokeWidth={3} />
                          </div>
                        </div>
                        {/* Label */}
                        <span className="text-xs font-medium mt-1.5 text-center">
                          {t(step.stepKey)}
                        </span>
                        {/* Result */}
                        <span className="text-[10px] text-muted-foreground mt-0.5 text-center">
                          [{step.resultZh}]
                        </span>
                      </div>
                      {/* Connector line */}
                      {idx < 2 && (
                        <div className="flex-shrink-0 mt-4 w-8 lg:w-12">
                          <div className="h-0.5 bg-emerald-300 dark:bg-emerald-700 w-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Results */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t("pipelineOutput")}:
                </p>
                <div className="flex gap-3">
                  {/* Task Card */}
                  <div className="flex-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ListTodo className="size-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Task
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {"\u51C6\u5907 Q2 OKR \u62A5\u544A"}
                    </p>
                  </div>
                  {/* Schedule Card */}
                  <div className="flex-1 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="size-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        Schedule
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {"3/11 \u5BF9\u9F50\u4F1A\u8BAE"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fragment List */}
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
          <TabsTrigger value="inspiration">{t("inspiration")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {fragments.map((fragment) => {
            const isClassifying = fragment.status === "classifying";
            const isMidConfidence =
              fragment.confidence !== undefined &&
              fragment.confidence >= 0.7 &&
              fragment.confidence < 0.9;

            const Icon = isClassifying
              ? Loader2
              : fragment.classification
                ? classificationIcon[fragment.classification]
                : Circle;
            const colorClass = fragment.classification
              ? classificationColor[fragment.classification]
              : "";

            return (
              <Link key={fragment.id} href={`/inbox/${fragment.id}`} className="block">
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="flex items-start gap-3 py-4">
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
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(fragment.confidence * 100)}% confidence
                        </span>
                      )}
                      {isMidConfidence && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-sky-600 border-sky-300"
                        >
                          {t("aiSuggestion")}
                        </Badge>
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
                    {isMidConfidence && fragment.reasoning && (
                      <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-medium">{t("reasoning")}: </span>
                          {fragment.reasoning}
                        </p>
                      </div>
                    )}
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
              </Link>
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
