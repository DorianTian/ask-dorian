// @MVP - Phase 1
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Palette,
  Users,
  User,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TOTAL_STEPS = 5;

const useCaseOptions = [
  { key: "knowledgeWorker", icon: Briefcase },
  { key: "freelancer", icon: Palette },
  { key: "teamLead", icon: Users },
  { key: "personal", icon: User },
] as const;

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("welcome")}</h1>
          <p className="text-sm text-muted-foreground">{t("welcomeDesc")}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`size-2.5 rounded-full transition-all ${
                  i === currentStep
                    ? "bg-primary scale-125"
                    : i < currentStep
                      ? "bg-primary/50"
                      : "bg-muted-foreground/25"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {t("stepOf", { current: currentStep + 1, total: TOTAL_STEPS })}
          </span>
        </div>

        {/* Step Content */}
        <div className="min-h-[320px] flex flex-col">
          {/* Step 1: Choose use case */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">{t("step1Title")}</h2>
                <p className="text-sm text-muted-foreground">{t("step1Desc")}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {useCaseOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedUseCase === option.key;
                  return (
                    <Card
                      key={option.key}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedUseCase(option.key)}
                    >
                      <CardContent className="flex flex-col items-center gap-3 py-6">
                        <div
                          className={`flex size-12 items-center justify-center rounded-xl transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-6" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-primary" : ""
                          }`}
                        >
                          {t(option.key)}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Try fragment input */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">{t("step2Title")}</h2>
                <p className="text-sm text-muted-foreground">{t("step2Desc")}</p>
              </div>
              <Card className="mt-4">
                <CardContent className="py-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      AI-powered classification
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      placeholder={t("step2Placeholder")}
                      className="pr-10 h-12 text-sm"
                      readOnly
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-8 p-0"
                    >
                      <Send className="size-4 text-primary" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI ready to classify your fragment
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: See result */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">{t("step3Title")}</h2>
                <p className="text-sm text-muted-foreground">{t("step3Desc")}</p>
              </div>
              <Card className="mt-4 border-blue-200 bg-blue-50/30">
                <CardContent className="py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        Task
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        95% confidence
                      </span>
                    </div>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </div>
                  <div className="space-y-3 rounded-lg border bg-background p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Title
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        Align Q2 OKR with product team
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Due Date
                        </span>
                        <p className="text-sm">Next Wednesday</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Priority
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-orange-600 bg-orange-50"
                        >
                          High
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="size-3 text-primary" />
                    Auto-classified by AI in 0.3s
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Connect calendar */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">{t("step4Title")}</h2>
                <p className="text-sm text-muted-foreground">{t("step4Desc")}</p>
              </div>
              <Card className="mt-4">
                <CardContent className="flex flex-col items-center gap-6 py-10">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                    <Calendar className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Google Calendar</p>
                    <p className="text-xs text-muted-foreground">
                      Sync events and schedule tasks
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Calendar className="size-4" />
                    {t("connectGoogle")}
                  </Button>
                  <button
                    onClick={handleNext}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                  >
                    {t("skipForNow")}
                  </button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: All set */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="size-10 text-emerald-500" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">{t("step5Title")}</h2>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {t("step5Desc")}
                  </p>
                </div>
                <Button size="lg" className="gap-2 mt-4">
                  {t("finish")}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < TOTAL_STEPS - 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              {t("skip")}
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleNext}>
              {t("next")}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
