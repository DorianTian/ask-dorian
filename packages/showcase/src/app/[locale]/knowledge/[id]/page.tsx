// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Star,
  Tag,
  FolderOpen,
  Clock,
  Edit3,
  Trash2,
  Share2,
  FileText,
  LinkIcon,
  BookOpen,
  CheckCircle2,
  Circle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/navigation"
import { knowledgeItems, tasks, fragments } from "@/lib/mock-data"
import { useState } from "react"

export default function KnowledgeDetailPage() {
  const t = useTranslations("knowledgeDetail")
  const [starred, setStarred] = useState(false)

  // Use knowledgeItems[0]: Flink CDC 替代批量同步方案决策
  const item = knowledgeItems[0]

  // Related tasks (same project)
  const relatedTasks = tasks.filter((task) => task.projectId === item.projectId)

  // Source fragment
  const sourceFragment = fragments.find((f) => f.id === item.sourceFragmentId)

  // Related knowledge (other items, mock recommendations)
  const relatedKnowledge = knowledgeItems.filter((k) => k.id !== item.id).slice(0, 2)

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/knowledge">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            {t("back")}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setStarred(!starred)}
        >
          <Star className={`size-4 ${starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
          {starred ? t("unstar") : t("star")}
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>

      {/* Metadata Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary">{item.category}</Badge>
        {item.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="gap-1">
            <Tag className="size-3" />
            {tag}
          </Badge>
        ))}
        {item.projectName && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <FolderOpen className="size-3.5" />
            {item.projectName}
          </span>
        )}
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          {t("lastUpdated")}: {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4" />
                {t("title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed">{item.content}</p>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>关键考量因素：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>实时性要求：业务方需要分钟级数据可用性，批量同步的 T+1 模式已无法满足</li>
                    <li>资源成本：Flink CDC 增量同步相比全量批次可节省约 40% 计算资源</li>
                    <li>运维复杂度：CDC 需要维护 binlog 消费位点，但整体运维成本可控</li>
                    <li>数据一致性：通过 exactly-once 语义 + checkpoint 机制保证</li>
                  </ul>
                  <p className="mt-4">下一步行动：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>完成 Flink CDC connector 的 Code Review</li>
                    <li>准备 Q2 OKR 中的数据管道迁移计划</li>
                    <li>评估现有 7,000+ 表的迁移优先级</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit3 className="size-3.5" />
              {t("edit")}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Share2 className="size-3.5" />
              {t("share")}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="size-3.5" />
              {t("delete")}
            </Button>
          </div>
        </div>

        {/* Right Panel: Related Items */}
        <div className="space-y-6">
          {/* Related Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("relatedTasks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  {task.status === "done" ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
              ))}
              {relatedTasks.length === 0 && (
                <p className="text-xs text-muted-foreground">暂无关联任务</p>
              )}
            </CardContent>
          </Card>

          {/* Source Fragment */}
          {sourceFragment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("sourceFragment")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{sourceFragment.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{sourceFragment.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(sourceFragment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Knowledge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("relatedKnowledge")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedKnowledge.map((k) => (
                <div key={k.id} className="rounded-md border p-3 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="size-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{k.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{k.content}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-[10px]">{k.category}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
