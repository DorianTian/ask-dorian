"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquareText,
  Mic,
  Image,
  Link2,
  FileText,
  ArrowRight,
  CalendarPlus,
  ListTodo,
  BookOpen,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Fragment, FragmentContentType } from "@ask-dorian/core/types"

// ---------------------------------------------------------------------------
// Content Type Icons
// ---------------------------------------------------------------------------

const contentTypeConfig: Record<
  FragmentContentType,
  { icon: typeof MessageSquareText; label: string }
> = {
  text: { icon: MessageSquareText, label: "Text" },
  voice: { icon: Mic, label: "Voice" },
  image: { icon: Image, label: "Image" },
  url: { icon: Link2, label: "URL" },
  file: { icon: FileText, label: "File" },
  email: { icon: FileText, label: "Email" },
  forward: { icon: FileText, label: "Forward" },
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const statusConfig = {
  pending: { color: "bg-amber-500", label: "等待处理" },
  processing: { color: "bg-blue-500", label: "AI 处理中" },
  processed: { color: "bg-indigo-500", label: "已处理" },
  confirmed: { color: "bg-green-500", label: "已确认" },
  rejected: { color: "bg-muted-foreground", label: "已拒绝" },
  failed: { color: "bg-destructive", label: "失败" },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FragmentCardProps {
  fragment: Fragment
  onConfirm?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
  compact?: boolean
}

export function FragmentCard({
  fragment,
  onConfirm,
  onReject,
  compact = false,
}: FragmentCardProps) {
  const [acting, setActing] = useState<"confirm" | "reject" | null>(null)

  const typeConfig = contentTypeConfig[fragment.contentType]
  const TypeIcon = typeConfig.icon
  const status = statusConfig[fragment.status]
  const isActionable = fragment.status === "processed"
  const isProcessing = fragment.status === "processing"

  async function handleAction(action: "confirm" | "reject") {
    setActing(action)
    try {
      if (action === "confirm") await onConfirm?.(fragment.id)
      else await onReject?.(fragment.id)
    } finally {
      setActing(null)
    }
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all",
        isProcessing && "ai-shimmer",
        fragment.status === "rejected" && "opacity-50",
      )}
    >
      {/* Status indicator line */}
      <div className={cn("absolute left-0 top-0 h-full w-1", status.color)} />

      <CardContent className={cn("pl-4", compact ? "py-3" : "py-4")}>
        {/* Header: type + time + status */}
        <div className="mb-2 flex items-center gap-2">
          <span title={typeConfig.label}>
            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(fragment.capturedAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto text-[10px]",
              isProcessing && "animate-pulse border-blue-500/50 text-blue-500",
            )}
          >
            {status.label}
          </Badge>
        </div>

        {/* L1: Raw Input */}
        <div className="mb-2">
          <p className="text-sm leading-relaxed">{fragment.rawContent}</p>
        </div>

        {/* L2: AI Understanding (if processed) */}
        {fragment.normalizedContent && (
          <div className="mb-2 flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-from" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                AI 理解
              </p>
              <p className="mt-0.5 text-sm">
                {fragment.normalizedContent}
              </p>
            </div>
          </div>
        )}

        {/* L3: Extracted Entities */}
        {!compact && hasMetadataEntities(fragment.metadata) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {"tasks" in fragment.metadata && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <ListTodo className="h-3 w-3" />
                Task
              </Badge>
            )}
            {"events" in fragment.metadata && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <CalendarPlus className="h-3 w-3" />
                Event
              </Badge>
            )}
            {"knowledge" in fragment.metadata && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <BookOpen className="h-3 w-3" />
                Knowledge
              </Badge>
            )}
          </div>
        )}

        {/* L4: Actions */}
        {isActionable && onConfirm && onReject && (
          <div className="flex items-center gap-2 pt-1">
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Button
              size="sm"
              variant="default"
              className="h-7 gap-1 px-3 text-xs"
              disabled={acting !== null}
              onClick={() => handleAction("confirm")}
            >
              {acting === "confirm" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              确认执行
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-3 text-xs text-muted-foreground"
              disabled={acting !== null}
              onClick={() => handleAction("reject")}
            >
              {acting === "reject" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              忽略
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function hasMetadataEntities(metadata: Record<string, unknown>): boolean {
  return (
    Object.keys(metadata).length > 0 &&
    ("tasks" in metadata || "events" in metadata || "knowledge" in metadata)
  )
}
