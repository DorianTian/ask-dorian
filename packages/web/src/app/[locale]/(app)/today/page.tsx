'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSWRConfig } from 'swr';
import { useTodayDashboard } from '@ask-dorian/core/hooks';
import { ritualApi, taskApi, eventApi } from '@ask-dorian/core/api';
import {
  buildTimelineBlocks,
  hourToPercent,
  type TimelineBlock,
} from '@ask-dorian/core/utils';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';

// --- Date offset helpers ---

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateLabel(date: Date, isToday: boolean): string {
  if (isToday) return 'Today';
  return date.toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function TodayPage() {
  const t = useTranslations('today');
  const { mutate } = useSWRConfig();

  // --- Date navigation state ---
  const [dateOffset, setDateOffset] = useState(0);
  const isToday = dateOffset === 0;
  const targetDate = useMemo(
    () => addDays(new Date(), dateOffset),
    [dateOffset],
  );
  const targetDateStr = useMemo(
    () => (isToday ? undefined : formatDateISO(targetDate)),
    [isToday, targetDate],
  );

  const { data: dashboard, isLoading } = useTodayDashboard(targetDateStr);

  // --- Add ritual inline form state ---
  const [showAddRitual, setShowAddRitual] = useState(false);
  const [newRitualTitle, setNewRitualTitle] = useState('');
  const [isAddingRitual, setIsAddingRitual] = useState(false);
  const addRitualInputRef = useRef<HTMLInputElement>(null);

  // --- Stat card expand state ---
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

  const [briefExpanded, setBriefExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Focus the input when the add-ritual form appears
  useEffect(() => {
    if (showAddRitual) {
      addRitualInputRef.current?.focus();
    }
  }, [showAddRitual]);

  const toggleRitual = async (id: string) => {
    await ritualApi.toggleComplete(id);
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/today'),
      undefined,
      { revalidate: true },
    );
  };

  const completeTask = async (id: string) => {
    await taskApi.complete(id);
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/today'),
      undefined,
      { revalidate: true },
    );
  };

  // "Done" for events — just dismiss from active view (no status change needed, time-based)
  const dismissEvent = async (id: string) => {
    // Mark event as confirmed/done by setting status to confirmed (already default)
    // In practice this is a visual dismiss — events complete by time passing
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/today'),
      undefined,
      { revalidate: true },
    );
  };

  // Extend block by 30 minutes
  const extendBlock = async (block: {
    id: string;
    type: 'event' | 'task';
    end: number;
  }) => {
    const newEnd = new Date();
    newEnd.setHours(
      Math.floor(block.end + 0.5),
      Math.round(((block.end + 0.5) % 1) * 60),
      0,
      0,
    );
    const newEndISO = newEnd.toISOString();

    if (block.type === 'event') {
      await eventApi.update(block.id, { endTime: newEndISO });
    } else {
      await taskApi.update(block.id, { scheduledEnd: newEndISO });
    }
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/today'),
      undefined,
      { revalidate: true },
    );
  };

  const addRitual = useCallback(async () => {
    const title = newRitualTitle.trim();
    if (!title || isAddingRitual) return;
    setIsAddingRitual(true);
    try {
      await ritualApi.create({ title });
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/today'),
        undefined,
        { revalidate: true },
      );
      setNewRitualTitle('');
      setShowAddRitual(false);
    } finally {
      setIsAddingRitual(false);
    }
  }, [newRitualTitle, isAddingRitual, mutate]);

  // Derived data
  const ritualData = dashboard?.rituals;
  const ritualItems = ritualData?.items ?? [];
  const completedRituals = ritualItems.filter((r) => r.completed).length;

  const timelineBlocks = useMemo(() => {
    if (!dashboard) return [];
    return buildTimelineBlocks(
      dashboard.events,
      dashboard.tasks.scheduled,
      now,
    );
  }, [dashboard, now]);

  // Stats
  const scheduledCount = dashboard?.tasks.scheduled.length ?? 0;
  const overdueCount = dashboard?.tasks.overdue.length ?? 0;
  const pendingCount = dashboard?.pendingFragments.length ?? 0;
  const eventCount = dashboard?.events.length ?? 0;
  const doneCount =
    dashboard?.tasks.scheduled.filter((t) => t.status === 'done').length ?? 0;

  // Current time position for timeline
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const nowLabel = now
    .toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase();

  // Only show full-screen spinner on initial load (no data at all)
  // When switching dates, keepPreviousData shows old data until new arrives
  if (isLoading && !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      {/* AI Summary Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 bg-surface-dark border border-primary/20 shadow-2xl shadow-primary/5 group cursor-pointer">
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
              <Sparkles size={14} />
              <span>{t('aiSummary')}</span>
            </div>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-text-main group-hover:text-white transition-colors">
              {eventCount > 0 && (
                <>
                  You have{' '}
                  <span className="text-primary font-bold">
                    {eventCount} events
                  </span>{' '}
                  scheduled.{' '}
                </>
              )}
              {scheduledCount > 0 && (
                <>
                  <span className="text-primary font-bold">
                    {scheduledCount} tasks
                  </span>{' '}
                  to complete.{' '}
                </>
              )}
              {pendingCount > 0 && (
                <>
                  <span className="text-primary font-bold">
                    {pendingCount} fragments
                  </span>{' '}
                  pending review.
                </>
              )}
              {eventCount === 0 &&
                scheduledCount === 0 &&
                pendingCount === 0 && <>{t('briefEmpty')}</>}
            </p>
          </div>
          <button
            onClick={() => setBriefExpanded(!briefExpanded)}
            className="bg-white/5 hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 text-text-main whitespace-nowrap flex items-center gap-2 group/btn active:scale-95"
          >
            {briefExpanded ? 'Collapse' : t('fullBriefing')}
            <ArrowUpRight
              size={14}
              className={`transition-transform ${briefExpanded ? 'rotate-90' : 'group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5'}`}
            />
          </button>
        </div>

        {/* Expanded briefing detail */}
        {briefExpanded && (
          <div className="relative z-10 mt-4 pt-4 border-t border-primary/10 space-y-3 text-sm text-slate-400 font-mono">
            <p className="flex gap-2">
              <span className="text-primary/70">{'>'}</span>{' '}
              <span>
                <span className="text-primary font-bold">
                  {ritualItems.length} rituals
                </span>{' '}
                configured. {completedRituals} completed today.
              </span>
            </p>
            {overdueCount > 0 && (
              <p className="flex gap-2">
                <span className="text-orange-400/70">{'>'}</span>{' '}
                <span>
                  <span className="text-orange-400 font-bold">WARNING:</span>{' '}
                  {overdueCount} overdue tasks need attention.
                </span>
              </p>
            )}
            <p className="flex gap-2">
              <span className="text-primary/70">{'>'}</span>{' '}
              <span>
                Focus recommendation: prioritize{' '}
                <span className="text-white bg-white/10 px-1 py-0.5 rounded border border-white/10">
                  {timelineBlocks.find((b) => b.status === 'active')?.title ??
                    'deep work'}
                </span>{' '}
                block.
              </span>
            </p>
            <div className="p-3 bg-black/40 rounded-xl border border-primary/20 mt-2">
              <p className="text-[10px] text-primary/70 mb-1 tracking-widest uppercase">
                // Synthesized directive
              </p>
              <p className="text-slate-200 text-sm">
                {doneCount < scheduledCount
                  ? `Complete remaining ${scheduledCount - doneCount} tasks before end of day.`
                  : 'All scheduled tasks done. Great work — review fragments or plan tomorrow.'}
              </p>
            </div>
          </div>
        )}

        <div className="absolute -right-12 -top-12 size-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-500" />
      </section>

      {/* Overdue alert — only show for today or past dates, not future */}
      {overdueCount > 0 && dateOffset <= 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
              {t('overdue')} ({overdueCount})
            </span>
          </div>
          {dashboard?.tasks.overdue.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-red-500/5"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => completeTask(task.id)}
                  className="size-4 rounded border border-red-400/50 hover:bg-red-400/20 transition-colors flex items-center justify-center"
                />
                <span className="text-xs text-red-300">{task.title}</span>
              </div>
              {task.dueDate && (
                <span className="text-[10px] font-mono text-red-500/60">
                  {task.dueDate}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main: Morning Ritual + Daily Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Morning Ritual Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              {t('bootSequence')}
            </h3>
            <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              {completedRituals} / {ritualItems.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {ritualItems.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                {t('noRituals')}
              </p>
            ) : (
              ritualItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleRitual(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${
                    item.isFocus
                      ? 'bg-surface-dark border-primary/50 ring-1 ring-primary/20 shadow-lg shadow-primary/5'
                      : 'bg-surface-dark/40 border-border-dark/50 hover:border-primary/30'
                  }`}
                >
                  <div
                    className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      item.completed
                        ? 'bg-primary border-primary text-white'
                        : 'border-slate-700 group-hover:border-primary/50'
                    }`}
                  >
                    {item.completed && <CheckCircle2 size={12} />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold transition-all ${
                        item.completed
                          ? 'text-slate-600 line-through'
                          : 'text-text-main'
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.isFocus && (
                      <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
                        Focus Phase • 45m
                      </p>
                    )}
                  </div>
                  {item.isFocus && (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                      Timeboxing
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {showAddRitual ? (
            <div className="w-full border-2 border-primary/50 rounded-2xl p-4 space-y-3 bg-surface-dark/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  New Ritual
                </span>
                <button
                  onClick={() => {
                    setShowAddRitual(false);
                    setNewRitualTitle('');
                  }}
                  className="size-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-text-main hover:bg-white/5 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <input
                ref={addRitualInputRef}
                type="text"
                value={newRitualTitle}
                onChange={(e) => setNewRitualTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addRitual();
                  if (e.key === 'Escape') {
                    setShowAddRitual(false);
                    setNewRitualTitle('');
                  }
                }}
                placeholder="Ritual title..."
                className="w-full bg-black/20 border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                onClick={addRitual}
                disabled={!newRitualTitle.trim() || isAddingRitual}
                className="w-full py-2.5 bg-primary text-bg-dark text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isAddingRitual ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PlusCircle size={14} />
                )}
                Add Ritual
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddRitual(true)}
              className="w-full py-4 border-2 border-dashed border-border-dark rounded-2xl text-slate-600 text-xs font-black uppercase tracking-widest hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <PlusCircle
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Add Element
            </button>
          )}
        </div>

        {/* Daily Timeline Column */}
        <div id="timeline" className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              {t('executionTimeline')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateOffset((d) => d - 1)}
                className="size-8 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center text-slate-500 hover:text-text-main hover:border-primary/50 transition-all active:scale-90"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  if (dateOffset !== 0) setDateOffset(0);
                }}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isToday
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-surface-dark text-text-main border border-border-dark hover:border-primary/50 cursor-pointer'
                }`}
              >
                {formatDateLabel(targetDate, isToday)}
              </button>
              <button
                onClick={() => setDateOffset((d) => d + 1)}
                className="size-8 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center text-slate-500 hover:text-text-main hover:border-primary/50 transition-all active:scale-90"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {(() => {
            // Timeline range: 6AM to midnight (18 hours)
            const TL_START = 0;
            const TL_END = 24;
            const TL_HEIGHT = 900; // px
            const nowPct = hourToPercent(nowHour, TL_START, TL_END);
            const timeLabels = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

            return (
              <div
                ref={(el) => {
                  // Auto-scroll to current time on mount
                  if (el && !el.dataset.scrolled) {
                    const scrollPct = nowPct / 100;
                    const scrollTarget = scrollPct * TL_HEIGHT - 200; // center current time ~200px from top
                    el.scrollTop = Math.max(0, scrollTarget);
                    el.dataset.scrolled = '1';
                  }
                }}
                className="bg-surface-dark/20 rounded-3xl border border-border-dark overflow-y-auto custom-scrollbar"
                style={{ height: 500 }}
              >
                <div className="relative" style={{ height: TL_HEIGHT }}>
                  {/* Dot grid background */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Time axis labels (left column) */}
                  <div className="absolute left-0 top-0 bottom-0 w-[70px] z-10 border-r border-border-dark/50">
                    {timeLabels.map((h) => (
                      <span
                        key={h}
                        className="text-[10px] text-slate-600 font-black font-mono text-right block pr-3"
                        style={{
                          position: 'absolute',
                          top: `${hourToPercent(h, TL_START, TL_END)}%`,
                          transform: 'translateY(-50%)',
                          right: 0,
                          paddingTop: h === 0 ? 12 : 0,
                        }}
                      >
                        {h === 24
                          ? '00:00'
                          : `${h.toString().padStart(2, '0')}:00`}
                      </span>
                    ))}
                  </div>

                  {/* Current Time Indicator */}
                  <div
                    className="absolute left-[70px] right-4 z-20 flex items-center pointer-events-none"
                    style={{ top: `${nowPct}%` }}
                  >
                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <div className="h-px flex-1 bg-primary/40" />
                    <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black shadow-lg shadow-primary/20 ml-1">
                      {nowLabel}
                    </span>
                  </div>

                  {/* Timeline blocks — absolute positioned */}
                  <div className="absolute left-[70px] right-4 top-0 bottom-0">
                    {timelineBlocks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <p className="text-xs text-slate-500 font-mono">
                          {t('noEvents')}
                        </p>
                        <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-4 rounded-2xl flex items-center justify-center gap-3 hover:border-primary/50 transition-all cursor-pointer group/box active:scale-[0.99] w-full max-w-sm">
                          <Sparkles
                            size={16}
                            className="text-primary/50 group-hover/box:scale-110 transition-transform"
                          />
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/50 italic">
                            Drop task to timebox
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {timelineBlocks.map((block) => {
                          const topPct = hourToPercent(
                            block.start,
                            TL_START,
                            TL_END,
                          );
                          const heightPct = Math.max(
                            hourToPercent(block.end, TL_START, TL_END) - topPct,
                            4,
                          ); // min 4% height
                          const isShort = block.end - block.start < 0.75;

                          return (
                            <div
                              key={block.id}
                              className="absolute px-1"
                              style={{
                                top: `${topPct}%`,
                                height: `${heightPct}%`,
                                minHeight: 48,
                                left: `${(block.col / block.totalCols) * 100}%`,
                                width: `${100 / block.totalCols}%`,
                                zIndex: block.status === 'active' ? 20 : 1,
                              }}
                            >
                              {block.status === 'completed' ? (
                                <div className="h-full bg-black/40 border border-border-dark/50 rounded-xl p-3 flex items-center justify-between opacity-60 hover:opacity-80 transition-all cursor-pointer">
                                  <div>
                                    <p
                                      className={`text-xs font-bold text-slate-500 ${isShort ? '' : 'mb-0.5'}`}
                                    >
                                      {block.title}
                                    </p>
                                    {!isShort && (
                                      <p className="text-[10px] text-slate-600 font-mono uppercase">
                                        Completed • {block.subtitle}
                                      </p>
                                    )}
                                  </div>
                                  <CheckCircle2
                                    size={14}
                                    className="text-primary/50"
                                  />
                                </div>
                              ) : block.status === 'active' ? (
                                <div className="h-full bg-primary/10 border border-primary/50 ring-1 ring-primary/20 rounded-xl p-3 flex flex-col justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] z-20 cursor-pointer overflow-hidden">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                                      <p className="text-sm font-bold text-text-main truncate">
                                        {block.title}
                                      </p>
                                      <span className="text-[9px] font-mono text-slate-500 uppercase shrink-0">
                                        {block.subtitle}
                                      </span>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          block.type === 'task'
                                            ? completeTask(block.id)
                                            : dismissEvent(block.id);
                                        }}
                                        className="bg-primary text-bg-dark text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-1"
                                      >
                                        <CheckCircle2 size={10} />{' '}
                                        {block.type === 'task'
                                          ? 'Complete'
                                          : 'Done'}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          extendBlock(block);
                                        }}
                                        className="bg-black/40 border border-border-dark/50 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-black/60 transition-colors"
                                      >
                                        +30m
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full bg-surface-dark/40 border border-border-dark/50 rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer">
                                  <div>
                                    <p className="text-xs font-bold text-text-main">
                                      {block.title}
                                    </p>
                                    {!isShort && (
                                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                                        {block.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Drop Zone — below last block, z-0 so active blocks stay on top */}
                        <div
                          className="absolute left-0 right-0 px-2 z-0"
                          style={{
                            top: `${hourToPercent(Math.max(...timelineBlocks.map((b) => b.end)) + 0.5, TL_START, TL_END)}%`,
                            height: '6%',
                            minHeight: 40,
                          }}
                        >
                          <div
                            className="h-full border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer group/box active:scale-[0.99]"
                            onClick={() => {
                              // Focus the quick capture bar input
                              const input =
                                document.querySelector<HTMLInputElement>(
                                  '[data-capture-input]',
                                );
                              if (input) {
                                input.focus();
                                input.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            <Sparkles
                              size={14}
                              className="text-primary/50 group-hover/box:text-primary transition-colors"
                            />
                            <span className="text-[10px] font-mono font-bold text-primary/50 group-hover/box:text-primary transition-colors tracking-widest uppercase">
                              Insert_Fragment
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-24">
        {[
          {
            label: t('statFocus'),
            value: '—',
            trend: undefined,
            detail:
              'Focus tracking available in Phase 2. Track your deep focus sessions and flow states.',
          },
          {
            label: t('statDeepWork'),
            value: '—',
            unit: 'hrs',
            detail:
              'Deep work tracking coming soon. Measures uninterrupted work blocks of 90+ minutes.',
          },
          {
            label: t('statTasksDone'),
            value: `${doneCount}/${scheduledCount}`,
            detail: `${doneCount} of ${scheduledCount} scheduled tasks completed today. ${overdueCount > 0 ? `${overdueCount} overdue.` : 'No overdue tasks.'}`,
          },
          {
            label: t('statEnergyPeak'),
            value: '—',
            detail:
              'Energy tracking available in Phase 2. Identifies your peak productivity hours.',
          },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => setExpandedStat(expandedStat === i ? null : i)}
            className="bg-surface-dark/30 border border-border-dark p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.2em] group-hover:text-primary transition-colors">
                {stat.label}
              </p>
              <MoreHorizontal
                size={14}
                className={`transition-colors ${expandedStat === i ? 'text-primary' : 'text-slate-700 group-hover:text-slate-400'}`}
              />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-text-main group-hover:text-white transition-colors">
                {stat.value}
                {stat.unit && (
                  <span className="text-xs font-bold text-slate-600 ml-1 uppercase">
                    {stat.unit}
                  </span>
                )}
              </span>
              {stat.trend && (
                <span className="text-[10px] text-primary font-black mb-1">
                  {stat.trend}
                </span>
              )}
            </div>
            {expandedStat === i && (
              <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-border-dark/50 leading-relaxed font-mono">
                {stat.detail}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
