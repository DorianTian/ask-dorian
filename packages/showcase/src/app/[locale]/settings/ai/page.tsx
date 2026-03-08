// @Phase2+
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Bot, Gauge, Eye, CalendarDays, Cpu } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AIPreferencesPage() {
  const t = useTranslations("settingsAI")

  const [classificationMode, setClassificationMode] = useState("auto")
  const [highConfidence, setHighConfidence] = useState([0.9])
  const [lowConfidence, setLowConfidence] = useState([0.7])
  const [showReasoning, setShowReasoning] = useState(true)
  const [autoWeeklyReview, setAutoWeeklyReview] = useState(true)
  const [reviewDay, setReviewDay] = useState("monday")
  const [modelPreference, setModelPreference] = useState("quality")

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Classification Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="size-4" />
            {t("classificationMode")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={classificationMode}
            onValueChange={setClassificationMode}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="text-sm cursor-pointer">
                {t("autoClassify")}
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="confirm" id="confirm" />
              <Label htmlFor="confirm" className="text-sm cursor-pointer">
                {t("confirmClassify")}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Confidence Threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="size-4" />
            {t("confidenceThreshold")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t("highConfidence")}</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {highConfidence[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={highConfidence}
              onValueChange={(v) => setHighConfidence(Array.isArray(v) ? v : [v])}
              min={0.7}
              max={1.0}
              step={0.01}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t("lowConfidence")}</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {lowConfidence[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={lowConfidence}
              onValueChange={(v) => setLowConfidence(Array.isArray(v) ? v : [v])}
              min={0.0}
              max={0.7}
              step={0.01}
            />
          </div>
        </CardContent>
      </Card>

      {/* Show AI Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="size-4" />
            {t("showReasoning")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-reasoning" className="text-sm">
              {t("showReasoning")}
            </Label>
            <Switch
              id="show-reasoning"
              checked={showReasoning}
              onCheckedChange={setShowReasoning}
            />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            {t("weeklyReview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-review" className="text-sm">
              {t("autoGenerate")}
            </Label>
            <Switch
              id="auto-review"
              checked={autoWeeklyReview}
              onCheckedChange={setAutoWeeklyReview}
            />
          </div>
          {autoWeeklyReview && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t("generateDay")}</Label>
              <Select value={reviewDay} onValueChange={(v) => v && setReviewDay(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">{t("sunday")}</SelectItem>
                  <SelectItem value="monday">{t("monday")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="size-4" />
            {t("modelPreference")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={modelPreference}
            onValueChange={setModelPreference}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="speed" id="speed" />
              <Label htmlFor="speed" className="text-sm cursor-pointer">
                {t("speedFirst")}
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="quality" id="quality" />
              <Label htmlFor="quality" className="text-sm cursor-pointer">
                {t("qualityFirst")}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
