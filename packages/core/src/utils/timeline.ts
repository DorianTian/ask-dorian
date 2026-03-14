/**
 * Shared timeline data processing for Today page.
 * Used by both web and mobile — single source of truth.
 */
import type { CalendarEvent, Task } from '../types/api';

// --- Types ---

export interface TimelineBlock {
  id: string;
  /** Start hour as fraction (e.g. 9.5 = 09:30) */
  start: number;
  /** End hour as fraction */
  end: number;
  /** Formatted start time (e.g. "09:30") */
  time: string;
  title: string;
  subtitle: string;
  type: 'event' | 'task';
  status: 'completed' | 'active' | 'future';
  /** Column index for overlapping blocks (0-based) */
  col: number;
  /** Total columns in this overlap group */
  totalCols: number;
}

// --- Helpers ---

/** Convert ISO timestamp to local hour fraction (e.g. "2026-03-14T09:30:00Z" → 17.5 in UTC+8) */
export function toHourFraction(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

/** Format hour fraction to HH:MM string */
export function formatHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

/** Convert hour fraction to percentage position within a timeline range */
export function hourToPercent(
  hour: number,
  rangeStart: number,
  rangeEnd: number,
): number {
  const range = rangeEnd - rangeStart;
  return (
    ((Math.max(rangeStart, Math.min(rangeEnd, hour)) - rangeStart) / range) *
    100
  );
}

// --- Core Logic ---

/**
 * Build timeline blocks from events and tasks.
 * Handles status calculation, sorting, and collision detection.
 */
export function buildTimelineBlocks(
  events: CalendarEvent[],
  tasks: Task[],
  now: Date,
): TimelineBlock[] {
  const blocks: Omit<TimelineBlock, 'col' | 'totalCols'>[] = [];
  const nowHour = now.getHours() + now.getMinutes() / 60;

  // Process events
  for (const ev of events) {
    if (!ev.startTime) continue;
    const start = toHourFraction(ev.startTime);
    const end = ev.endTime ? toHourFraction(ev.endTime) : start + 1;
    const isCompleted = end <= nowHour;
    const isActive = start <= nowHour && end > nowHour;

    blocks.push({
      id: ev.id,
      start,
      end,
      time: formatHour(start),
      title: ev.title,
      subtitle: ev.location ?? ev.type,
      type: 'event',
      status: isCompleted ? 'completed' : isActive ? 'active' : 'future',
    });
  }

  // Process scheduled tasks
  for (const task of tasks) {
    if (!task.scheduledStart) continue;
    const start = toHourFraction(task.scheduledStart);
    const end = task.scheduledEnd
      ? toHourFraction(task.scheduledEnd)
      : start + (task.estimatedMinutes ? task.estimatedMinutes / 60 : 0.5);

    blocks.push({
      id: task.id,
      start,
      end,
      time: formatHour(start),
      title: task.title,
      subtitle: task.estimatedMinutes ? `${task.estimatedMinutes}min` : '',
      type: 'task',
      status:
        task.status === 'done'
          ? 'completed'
          : start <= nowHour && end > nowHour
            ? 'active'
            : 'future',
    });
  }

  // Sort by start time
  blocks.sort((a, b) => a.start - b.start);

  // --- Collision detection: greedy column assignment ---
  const assigned: TimelineBlock[] = blocks.map((b) => ({
    ...b,
    col: 0,
    totalCols: 1,
  }));
  const columns: number[][] = [];

  for (let i = 0; i < assigned.length; i++) {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const hasOverlap = columns[col].some(
        (j) =>
          assigned[j].start < assigned[i].end &&
          assigned[j].end > assigned[i].start,
      );
      if (!hasOverlap) {
        columns[col].push(i);
        assigned[i].col = col;
        placed = true;
        break;
      }
    }
    if (!placed) {
      assigned[i].col = columns.length;
      columns.push([i]);
    }
  }

  // Set totalCols based on concurrent overlapping blocks
  for (let i = 0; i < assigned.length; i++) {
    let maxCols = 1;
    for (let j = 0; j < assigned.length; j++) {
      if (i === j) continue;
      if (
        assigned[j].start < assigned[i].end &&
        assigned[j].end > assigned[i].start
      ) {
        maxCols = Math.max(
          maxCols,
          Math.abs(assigned[i].col - assigned[j].col) + 1,
        );
      }
    }
    assigned[i].totalCols = Math.max(maxCols, assigned[i].totalCols);
  }

  // Non-overlapping blocks → full width
  for (let i = 0; i < assigned.length; i++) {
    const hasAnyOverlap = assigned.some(
      (b, j) =>
        i !== j && b.start < assigned[i].end && b.end > assigned[i].start,
    );
    if (!hasAnyOverlap) {
      assigned[i].col = 0;
      assigned[i].totalCols = 1;
    }
  }

  return assigned;
}
