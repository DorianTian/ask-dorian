// @MVP - Phase 1
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FolderKanban,
  Pencil,
  Tag,
  Timer,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tasks, fragments, projects } from '@/lib/mock-data';

const statusColor: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
  postponed: 'bg-amber-100 text-amber-700',
};

const statusLabel: Record<string, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
  postponed: 'Postponed',
};

const priorityConfig: Record<string, { color: string; dot: string }> = {
  urgent: { color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  high: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  medium: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  low: {
    color: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export default function TaskDetailPage() {
  const t = useTranslations('taskDetail');

  // Use tasks[0] as showcase data
  const task = tasks[0];
  const project = projects.find((p) => p.id === task.projectId);
  const sourceFragment = task.sourceFragmentId
    ? fragments.find((f) => f.id === task.sourceFragmentId)
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/today"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t('back')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">
          {task.title}
        </span>
      </div>

      {/* Status & Priority Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('status')}
          </span>
          <Select defaultValue={task.status}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['todo', 'in-progress', 'done', 'postponed'] as const).map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${statusColor[s]}`}
                    >
                      {statusLabel[s]}
                    </Badge>
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('priority')}
          </span>
          <Select defaultValue={task.priority}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${priorityConfig[p].dot}`}
                    />
                    <span className="capitalize text-sm">{p}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {task.title}
              <Pencil className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            </h1>
          </div>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('description')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {task.description || t('noDescription')}
              </p>
            </CardContent>
          </Card>

          {/* Metadata Grid */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {t('dueDate')}
                  </div>
                  <p className="text-sm font-medium">{task.dueDate || '—'}</p>
                </div>

                {/* Due Time */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="size-3.5" />
                    {t('dueTime')}
                  </div>
                  <p className="text-sm font-medium">{task.dueTime || '—'}</p>
                </div>

                {/* Estimated Time */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Timer className="size-3.5" />
                    {t('estimatedTime')}
                  </div>
                  <p className="text-sm font-medium">
                    {task.estimatedMinutes
                      ? `${task.estimatedMinutes} ${t('minutes')}`
                      : '—'}
                  </p>
                </div>

                {/* Actual Time */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Timer className="size-3.5" />
                    {t('actualTime')}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">—</p>
                </div>

                {/* Project */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FolderKanban className="size-3.5" />
                    {t('project')}
                  </div>
                  {project ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm font-medium">
                        {project.name}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('noProject')}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Tag className="size-3.5" />
                    {t('tags')}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.length > 0 ? (
                      task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {/* Scheduled Date (Timeboxing) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {t('scheduledDate')}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">—</p>
                </div>

                {/* Scheduled Time (Timeboxing) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="size-3.5" />
                    {t('scheduledTime')}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t('createdAt')}:{' '}
              {new Date(task.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {task.completedAt && (
              <span>
                {t('completedAt')}:{' '}
                {new Date(task.completedAt).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Source Fragment Card */}
          {sourceFragment && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                  <Pencil className="size-3.5" />
                  {t('sourceFragment')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 p-3">
                  <p className="text-sm leading-relaxed">
                    {sourceFragment.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      {sourceFragment.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(sourceFragment.createdAt).toLocaleString(
                        'zh-CN',
                        {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button className="w-full gap-2" variant="default">
                <CheckCircle2 className="size-4" />
                {t('markDone')}
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Clock className="size-4" />
                {t('postpone')}
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <CalendarPlus className="size-4" />
                {t('addToCalendar')}
              </Button>
              <Separator />
              <Button
                className="w-full gap-2 text-destructive hover:text-destructive"
                variant="ghost"
              >
                <Trash2 className="size-4" />
                {t('delete')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
