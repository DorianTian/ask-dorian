// @MVP - Phase 1 — Main Workspace
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Circle,
  Clock,
  CalendarClock,
  ArrowRight,
  ArrowUpRight,
  Sun,
  Moon,
  Sparkles,
  Send,
  ListTodo,
  Calendar,
  BookOpen,
  Brain,
  AlertTriangle,
  Smartphone,
  Monitor,
  Mail,
  Zap,
  MessageCircle,
  GitBranch,
  Repeat,
  ChevronDown,
  ChevronUp,
  Command,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';
import {
  tasks,
  scheduleEvents,
  todayStats,
  pipelineStats,
  processedFragments,
} from '@/lib/mock-data';
import type { ProcessedFragment } from '@/lib/types';
import { MorningPlanning } from '@/components/morning-planning';
import { EveningReview } from '@/components/evening-review';

// -- constants --

const priorityDot: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-400',
};

const SOURCE_ICON = {
  'cmd-k': Monitor,
  mobile: Smartphone,
  email: Mail,
  'ios-shortcut': Zap,
  wechat: MessageCircle,
};
const SOURCE_LABEL: Record<string, string> = {
  'cmd-k': '⌘K',
  mobile: '手机',
  email: '邮件',
  'ios-shortcut': '快捷指令',
  wechat: '微信',
};

const ENTITY_ICON = {
  task: ListTodo,
  event: Calendar,
  knowledge: BookOpen,
};
const ENTITY_COLOR = {
  task: 'text-blue-500 bg-blue-500/10',
  event: 'text-violet-500 bg-violet-500/10',
  knowledge: 'text-emerald-500 bg-emerald-500/10',
};

const EVENT_BORDER: Record<string, string> = {
  meeting: 'border-l-violet-500',
  focus: 'border-l-emerald-500',
  reminder: 'border-l-amber-500',
  event: 'border-l-blue-500',
};

// -- Feed Item --

function FeedItem({ pf }: { pf: ProcessedFragment }) {
  const SourceIcon = SOURCE_ICON[pf.inputSource];
  const ai = pf.aiResult;
  const isConfirm = pf.processStatus === 'needs_confirmation';

  return (
    <Card
      className={
        isConfirm ? 'border-amber-200 dark:border-amber-800/50' : ''
      }
    >
      <CardContent className="pt-4 space-y-3">
        {/* Raw input + source */}
        <div className="flex items-start gap-3">
          <div
            className={`flex items-center justify-center size-8 rounded-lg shrink-0 ${
              isConfirm ? 'bg-amber-500/10' : 'bg-violet-500/10'
            }`}
          >
            <Brain
              className={`size-4 ${isConfirm ? 'text-amber-500' : 'text-violet-500'}`}
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
                {new Date(pf.capturedAt).toLocaleTimeString('en', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  ai.confidence >= 0.9
                    ? 'text-emerald-600'
                    : ai.confidence >= 0.7
                      ? 'text-blue-600'
                      : 'text-amber-600'
                }`}
              >
                {Math.round(ai.confidence * 100)}%
              </span>
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
              const Icon =
                ENTITY_ICON[e.type as keyof typeof ENTITY_ICON] ?? ListTodo;
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
          <div className="pl-11 space-y-1.5">
            {ai.generatedEntities.map((entity, i) => {
              const Icon = ENTITY_ICON[entity.type] ?? ListTodo;
              const color =
                ENTITY_COLOR[entity.type] ?? 'text-muted-foreground bg-muted';
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className={`flex items-center justify-center size-6 rounded-md ${color}`}
                  >
                    <Icon className="size-3" />
                  </div>
                  <span className="text-sm">{entity.title}</span>
                  {entity.priority && (
                    <span
                      className={`size-1.5 rounded-full ${priorityDot[entity.priority]}`}
                    />
                  )}
                  {entity.dueDate && (
                    <span className="text-[11px] text-muted-foreground">
                      {entity.dueDate}
                    </span>
                  )}
                  {entity.isRecurring && (
                    <Repeat className="size-3 text-muted-foreground" />
                  )}
                </div>
              );
            })}
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
                  {c.description} —{' '}
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
            {ai.userPrompt.options.map((opt, i) => (
              <Button
                key={i}
                variant={i === 0 ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
              >
                {opt}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -- main --

export default function TodayPage() {
  const t = useTranslations('today');
  const [morningOpen, setMorningOpen] = useState(false);
  const [eveningOpen, setEveningOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [feedExpanded, setFeedExpanded] = useState(true);

  const todayTasks = tasks.filter(
    (task) => task.dueDate === '2026-03-08' || task.status === 'in-progress',
  );
  const todayEvents = scheduleEvents.filter((e) =>
    e.startTime.startsWith('2026-03-08'),
  );
  const completionRate = Math.round(
    (todayStats.completedTasks / todayStats.totalTasks) * 100,
  );

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('greeting')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            2026年3月9日 · 周一
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setMorningOpen(true)}
          >
            <Sun className="size-3.5" />
            {t('morningPlan')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setEveningOpen(true)}
          >
            <Moon className="size-3.5" />
            {t('eveningReview')}
          </Button>
        </div>
      </div>

      {/* ── Quick Capture ── */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-violet-500" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('captureBarPlaceholder')}
                className="pl-10 h-11 text-sm"
              />
            </div>
            <Button className="h-11 gap-2">
              <Send className="size-4" />
              {t('captureBarSubmit')}
            </Button>
            <kbd className="hidden sm:flex items-center gap-0.5 rounded-md border bg-muted px-2.5 h-8 text-xs text-muted-foreground font-mono">
              <Command className="size-3" />K
            </kbd>
          </div>
        </CardContent>
      </Card>

      {/* ── Tasks + Schedule ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Tasks */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-lg bg-blue-500/10">
                  <CheckCircle2 className="size-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {t('todayTasks')}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {todayStats.completedTasks}/{todayStats.totalTasks}{' '}
                    {t('completed')}
                  </p>
                </div>
              </div>
              <Progress value={completionRate} className="h-1.5 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 group hover:bg-muted/50 transition-colors"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="size-[18px] text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="size-[18px] text-muted-foreground/40 shrink-0 cursor-pointer hover:text-emerald-500 transition-colors" />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/tasks/${task.id}`}
                    className={`text-sm font-medium hover:underline ${
                      task.status === 'done'
                        ? 'line-through text-muted-foreground'
                        : ''
                    }`}
                  >
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.projectName && (
                      <span className="text-[11px] text-muted-foreground">
                        {task.projectName}
                      </span>
                    )}
                    {task.estimatedMinutes && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="size-2.5" />
                        {task.estimatedMinutes}m
                      </span>
                    )}
                    {task.sourceFragmentId && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5 gap-0.5 text-violet-500 border-violet-200"
                      >
                        <Sparkles className="size-2" />
                        Dorian
                      </Badge>
                    )}
                  </div>
                </div>
                <div
                  className={`size-2 rounded-full shrink-0 ${priorityDot[task.priority]}`}
                />
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                    {t('markDone')}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                    {t('postpone')}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-lg bg-violet-500/10">
                  <CalendarClock className="size-4 text-violet-500" />
                </div>
                <CardTitle className="text-base">{t('schedule')}</CardTitle>
              </div>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  {t('viewAll')}
                  <ArrowUpRight className="size-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className={`flex gap-3 rounded-lg px-3 py-2.5 border-l-2 hover:bg-muted/50 transition-colors ${
                  EVENT_BORDER[event.type] ?? 'border-l-border'
                }`}
              >
                <div className="text-[11px] text-muted-foreground w-11 shrink-0 pt-0.5 font-mono">
                  {new Date(event.startTime).toLocaleTimeString('en', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/calendar/${event.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {event.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.location && (
                      <span className="text-[11px] text-muted-foreground">
                        {event.location}
                      </span>
                    )}
                    {event.sourceFragmentId && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5 gap-0.5 text-violet-500 border-violet-200"
                      >
                        <Sparkles className="size-2" />
                        Dorian
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Dorian Processing Feed ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-violet-500/10">
              <Brain className="size-4 text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('aiFeedTitle')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pipelineStats.todayInputs} {t('pipelineInputs')} →{' '}
                {pipelineStats.generatedTasks} {t('pipelineTasks')} ·{' '}
                {pipelineStats.generatedEvents} {t('pipelineEvents')} ·{' '}
                {pipelineStats.generatedKnowledge} {t('pipelineKnowledge')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setFeedExpanded(!feedExpanded)}
          >
            {feedExpanded ? (
              <>
                <ChevronUp className="size-4" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                展开
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {processedFragments.length}
                </Badge>
              </>
            )}
          </Button>
        </div>

        {feedExpanded && (
          <div className="space-y-3">
            {processedFragments.map((pf) => (
              <FeedItem key={pf.id} pf={pf} />
            ))}
          </div>
        )}
      </section>

      <MorningPlanning open={morningOpen} onOpenChange={setMorningOpen} />
      <EveningReview open={eveningOpen} onOpenChange={setEveningOpen} />
    </div>
  );
}
