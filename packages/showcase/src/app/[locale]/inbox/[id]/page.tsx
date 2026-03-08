// @MVP - Phase 1
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  ListTodo,
  Lightbulb,
  Link2,
  FileText,
  Target,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { fragments, projects } from "@/lib/mock-data";

const classificationColor = {
  task: "text-blue-600 bg-blue-50 border-blue-200",
  schedule: "text-purple-600 bg-purple-50 border-purple-200",
  knowledge: "text-emerald-600 bg-emerald-50 border-emerald-200",
  inspiration: "text-amber-600 bg-amber-50 border-amber-200",
  "follow-up": "text-orange-600 bg-orange-50 border-orange-200",
};

const classificationIcon = {
  task: ListTodo,
  schedule: Calendar,
  knowledge: BookOpen,
  inspiration: Lightbulb,
  "follow-up": Target,
};

const statusColor = {
  classifying: "text-violet-600 bg-violet-50 border-violet-200",
  unprocessed: "text-amber-600 bg-amber-50 border-amber-200",
  classified: "text-emerald-600 bg-emerald-50 border-emerald-200",
  archived: "text-gray-600 bg-gray-50 border-gray-200",
};

const statusLabel = {
  classifying: "Classifying",
  unprocessed: "Unprocessed",
  classified: "Classified",
  archived: "Archived",
};

const typeIcon = {
  text: FileText,
  link: Link2,
  image: FileText,
  voice: FileText,
  document: FileText,
};

// Mock AI-extracted structured data for fragment f2 (knowledge type)
const mockExtractedData = {
  category: "Product Methodology",
  keyPoints: [
    "Focus on outcomes, not features",
    "Iterate on understanding, not just code",
    "Product quality = team thinking quality",
  ],
  sourceTitle: "Product Thinking - Linear Blog",
  sourceUrl: "https://linear.app/blog/product-thinking",
};

// Mock correction history
const mockCorrections = [
  {
    id: "c1",
    from: "inspiration",
    to: "knowledge",
    reason: "The link is an article with structured insights, better categorized as knowledge rather than inspiration.",
    correctedAt: "2026-03-08T08:35:00",
  },
];

export default function FragmentDetailPage() {
  const t = useTranslations("fragmentDetail");

  // Use fragments[2] (f2) as showcase data
  const fragment = fragments[2];
  const TypeIcon = typeIcon[fragment.type];
  const ClassIcon = fragment.classification
    ? classificationIcon[fragment.classification]
    : null;
  const matchedProject = fragment.projectId
    ? projects.find((p) => p.id === fragment.projectId)
    : null;

  const confidencePercent = fragment.confidence
    ? Math.round(fragment.confidence * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header: Back + Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/inbox"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
        <Badge variant="outline" className={statusColor[fragment.status]}>
          {statusLabel[fragment.status]}
        </Badge>
      </div>

      {/* Original Fragment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TypeIcon className="size-4 text-muted-foreground" />
            {t("originalContent")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            {fragment.type === "link" ? (
              <a
                href={fragment.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {fragment.content}
              </a>
            ) : (
              <p className="text-sm">{fragment.content}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(fragment.createdAt).toLocaleString("en", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-violet-500" />
            {t("aiAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classification Result */}
          {fragment.classification && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Brain className="size-4 text-muted-foreground" />
                {t("classification")}
              </h3>
              <div className="flex items-center gap-3">
                {ClassIcon && (
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg border ${classificationColor[fragment.classification]}`}
                  >
                    <ClassIcon className="size-4" />
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className={classificationColor[fragment.classification]}
                >
                  {fragment.classification}
                </Badge>
              </div>

              {/* Confidence Progress */}
              {fragment.confidence !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t("confidence")}
                    </span>
                    <span className="text-xs font-medium tabular-nums">
                      {confidencePercent}%
                    </span>
                  </div>
                  <Progress value={confidencePercent} />
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Reasoning */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="size-4 text-muted-foreground" />
              {t("reasoning")}
            </h3>
            <blockquote className="border-l-2 border-violet-300 bg-violet-50/50 dark:bg-violet-950/20 pl-4 py-3 rounded-r-md">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                {fragment.reasoning ||
                  "This link points to a blog post from Linear about product methodology. The content is structured knowledge — article insights and best practices — rather than a specific task or schedule item. Classified as knowledge with high confidence."}
              </p>
            </blockquote>
          </div>

          <Separator />

          {/* Structured Extraction */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              {t("structuredData")}
            </h3>

            {/* Knowledge extraction for f2 */}
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground min-w-[100px] shrink-0">
                  {t("extractedCategory")}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {mockExtractedData.category}
                </Badge>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground min-w-[100px] shrink-0">
                  {t("extractedTitle")}
                </span>
                <span className="text-sm">{mockExtractedData.sourceTitle}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">
                  {t("extractedKeyPoints")}
                </span>
                <ul className="space-y-1.5">
                  {mockExtractedData.keyPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-medium">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Project Match */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" />
              {t("projectMatch")}
            </h3>
            {matchedProject ? (
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: matchedProject.color }}
                />
                <span className="text-sm">{matchedProject.name}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No project matched
              </p>
            )}
          </div>

          {/* Processed At */}
          {fragment.processedAt && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground">
                {t("processedAt")}:{" "}
                {new Date(fragment.processedAt).toLocaleString("en", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Suggested Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("suggestedActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              {t("confirmClassification")}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {t("changeClassification")}:
              </span>
              <Select defaultValue="knowledge">
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">
                    <ListTodo className="size-3.5" />
                    Task
                  </SelectItem>
                  <SelectItem value="schedule">
                    <Calendar className="size-3.5" />
                    Schedule
                  </SelectItem>
                  <SelectItem value="knowledge">
                    <BookOpen className="size-3.5" />
                    Knowledge
                  </SelectItem>
                  <SelectItem value="inspiration">
                    <Lightbulb className="size-3.5" />
                    Inspiration
                  </SelectItem>
                  <SelectItem value="follow-up">
                    <Target className="size-3.5" />
                    Follow-up
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" className="gap-1.5">
              <AlertTriangle className="size-3.5" />
              {t("manualProcess")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Corrections History */}
      {mockCorrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("corrections")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCorrections.map((correction) => (
                <div
                  key={correction.id}
                  className="rounded-lg border border-dashed p-3 space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="text-[10px] line-through text-muted-foreground"
                    >
                      {correction.from}
                    </Badge>
                    <ArrowLeft className="size-3 rotate-180 text-muted-foreground" />
                    <Badge variant="secondary" className="text-[10px]">
                      {correction.to}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {correction.reason}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(correction.correctedAt).toLocaleString("en", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
