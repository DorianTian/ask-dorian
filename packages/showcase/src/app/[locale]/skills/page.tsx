"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Sparkles,
  FileText,
  Link2,
  Calendar,
  ListTree,
  FileBarChart,
  Code,
  Plus,
  Settings,
  Zap,
  ArrowRight,
  Pencil,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Skill {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  steps: string[]
  enabled: boolean
  isDefault: boolean
  trigger?: string
  outputFormat?: string
  model?: string
}

const defaultSkills: Skill[] = [
  {
    id: "s1",
    name: "智能分类",
    description: "自动识别碎片类型并分类为任务/日程/知识/灵感",
    icon: Sparkles,
    color: "text-purple-500 bg-purple-500/10",
    steps: ["输入分析", "意图识别", "分类", "置信度评估", "输出"],
    enabled: true,
    isDefault: true,
    trigger: "allTextInput",
    outputFormat: "分类结果",
    model: "sonnet",
  },
  {
    id: "s2",
    name: "会议纪要整理",
    description: "从语音/文本中提取会议要点、决策和待办事项",
    icon: FileText,
    color: "text-blue-500 bg-blue-500/10",
    steps: ["语音转文字", "要点提取", "决策识别", "生成待办", "关联项目"],
    enabled: true,
    isDefault: true,
    trigger: "voiceInput",
    outputFormat: "任务 + 知识条目",
    model: "sonnet",
  },
  {
    id: "s3",
    name: "链接摘要",
    description: "自动抓取链接内容，生成摘要和关键要点",
    icon: Link2,
    color: "text-green-500 bg-green-500/10",
    steps: ["URL 解析", "内容抓取", "摘要生成", "要点提取", "存入知识库"],
    enabled: true,
    isDefault: true,
    trigger: "containsLink",
    outputFormat: "知识条目",
    model: "haiku",
  },
  {
    id: "s4",
    name: "日程提取",
    description: "从自然语言中识别时间、地点、参与人，自动创建日程",
    icon: Calendar,
    color: "text-orange-500 bg-orange-500/10",
    steps: ["时间解析", "地点识别", "参与人提取", "冲突检测", "创建事件"],
    enabled: true,
    isDefault: true,
    trigger: "allTextInput",
    outputFormat: "日程",
    model: "sonnet",
  },
  {
    id: "s5",
    name: "任务分解",
    description: "将复杂描述拆解为具体可执行的子任务，自动设置优先级",
    icon: ListTree,
    color: "text-red-500 bg-red-500/10",
    steps: ["目标理解", "子任务拆分", "优先级评估", "依赖排序", "生成任务"],
    enabled: true,
    isDefault: true,
    trigger: "allInput",
    outputFormat: "任务",
    model: "sonnet",
  },
] as Skill[]

const customSkills: Skill[] = [
  {
    id: "c1",
    name: "周报生成",
    description: "汇总本周完成项、延期项，生成结构化周报",
    icon: FileBarChart,
    color: "text-indigo-500 bg-indigo-500/10",
    steps: ["数据汇总", "分类统计", "亮点提取", "生成报告"],
    enabled: true,
    isDefault: false,
    trigger: "allInput",
    outputFormat: "知识条目",
    model: "sonnet",
  },
  {
    id: "c2",
    name: "代码片段归档",
    description: "识别代码片段，自动标注语言和用途，存入知识库",
    icon: Code,
    color: "text-cyan-500 bg-cyan-500/10",
    steps: ["语言检测", "用途分析", "标签生成", "归档"],
    enabled: false,
    isDefault: false,
    trigger: "allTextInput",
    outputFormat: "知识条目",
    model: "haiku",
  },
] as Skill[]

function StepsPipeline({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
            {step}
          </Badge>
          {index < steps.length - 1 && (
            <ArrowRight className="size-3 text-muted-foreground shrink-0" />
          )}
        </div>
      ))}
    </div>
  )
}

function SkillCard({
  skill,
  onToggle,
  onEdit,
}: {
  skill: Skill
  onToggle: (id: string) => void
  onEdit: (skill: Skill) => void
}) {
  const t = useTranslations("skills")
  const IconComponent = skill.icon

  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center size-9 rounded-lg ${skill.color}`}>
              <IconComponent className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
            </div>
          </div>
          <Switch
            checked={skill.enabled}
            onCheckedChange={() => onToggle(skill.id)}
            aria-label={skill.enabled ? t("enabled") : t("disabled")}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {t("steps")}
          </p>
          <StepsPipeline steps={skill.steps} />
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={skill.enabled ? "default" : "outline"} className="text-[10px]">
            {skill.enabled ? t("enabled") : t("disabled")}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onEdit(skill)}
          >
            <Pencil className="size-3" />
            {t("edit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SkillsPage() {
  const t = useTranslations("skills")

  const [defaults, setDefaults] = useState(defaultSkills)
  const [customs, setCustoms] = useState(customSkills)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  function handleToggle(id: string) {
    setDefaults((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
    setCustoms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  function handleEdit(skill: Skill) {
    setSelectedSkill(skill)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="size-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          {t("newSkill")}
        </Button>
      </div>

      {/* Default Skills */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t("defaultSkills")}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {defaults.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onToggle={handleToggle}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* Custom Skills */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t("customSkills")}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customs.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onToggle={handleToggle}
              onEdit={handleEdit}
            />
          ))}

          {/* Create New Skill Card */}
          <Card className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
              <div className="flex items-center justify-center size-12 rounded-full border-2 border-dashed border-muted-foreground/30">
                <Plus className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{t("createCustom")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("createCustomDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skill Detail Dialog */}
      <Dialog
        open={selectedSkill !== null}
        onOpenChange={(open) => !open && setSelectedSkill(null)}
      >
        {selectedSkill && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center size-8 rounded-lg ${selectedSkill.color}`}
                >
                  <selectedSkill.icon className="size-4" />
                </div>
                {t("skillDetail")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("name")}
                </Label>
                <p className="text-sm font-medium">{selectedSkill.name}</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("desc")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {selectedSkill.description}
                </p>
              </div>

              <Separator />

              {/* Trigger */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("trigger")}
                </Label>
                <Select defaultValue={selectedSkill.trigger}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allTextInput">{t("allTextInput")}</SelectItem>
                    <SelectItem value="containsLink">{t("containsLink")}</SelectItem>
                    <SelectItem value="voiceInput">{t("voiceInput")}</SelectItem>
                    <SelectItem value="allInput">{t("allInput")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Processing Pipeline */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("pipeline")}
                </Label>
                <div className="space-y-2">
                  {selectedSkill.steps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm flex-1">{step}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {selectedSkill.model === "sonnet" ? "Sonnet" : "Haiku"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Output Format */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("outputFormat")}
                </Label>
                <Badge variant="secondary">{selectedSkill.outputFormat}</Badge>
              </div>

              {/* Model Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("model")}
                </Label>
                <Select defaultValue={selectedSkill.model}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haiku">Haiku</SelectItem>
                    <SelectItem value="sonnet">Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
