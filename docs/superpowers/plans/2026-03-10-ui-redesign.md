# UI Redesign: Fragment-First Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign showcase UI from sidebar+timeline layout to top-nav+Fragment-Feed layout, making the "碎片 → AI 理解 → 结构化执行" pipeline visible as the core UX.

**Architecture:** Replace sidebar navigation with horizontal top nav bar. Rewrite Today page from timeline to Fragment Feed (碎片流). Rewrite Weekly page to four-quadrant layout. Add semantic CSS tokens for dual theme support. All changes are pure frontend mock data — no backend involved.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (base-nova), next-intl, Lucide React

**Spec:** `docs/superpowers/specs/2026-03-10-ui-redesign-design.md`

---

## File Structure

### Files to Create

| File | Responsibility |
|------|---------------|
| `src/components/layout/top-nav.tsx` | Horizontal top navigation bar (logo + 3 primary tabs + 2 secondary + ⌘K) |
| `src/components/fragment-card.tsx` | Fragment Feed card component (raw input → AI result → entities → actions) |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/layout-shell.tsx` | Replace SidebarProvider/AppSidebar with TopNav, restructure main layout |
| `src/app/globals.css` | Add semantic color CSS variables (green/purple/orange/indigo for fragment entities) |
| `src/lib/types.ts` | Add `FragmentFeedItem` interface for Today page |
| `src/lib/mock-data.ts` | Add `fragmentFeedItems` array with fragment processing stories |
| `src/messages/zh.json` | Add i18n keys for fragment feed, top nav, new sections |
| `src/messages/en.json` | Same i18n keys in English |
| `src/app/[locale]/today/page.tsx` | Rewrite to Fragment Feed layout |
| `src/app/[locale]/weekly/page.tsx` | Rewrite to four-quadrant layout |
| `src/app/[locale]/inbox/page.tsx` | Minor: adapt to new layout (no sidebar) |
| `src/app/[locale]/projects/page.tsx` | Minor: adapt to new layout |
| `src/app/[locale]/review/page.tsx` | Minor: adapt to new layout, fix bar chart opacity |

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/layout/app-sidebar.tsx` | Replaced by top-nav.tsx |

### Files NOT Touched

- All `src/components/ui/*.tsx` (shadcn components unchanged)
- Phase 2+ pages (calendar, knowledge, settings, notifications, onboarding, skills)
- Detail pages (`[id]/page.tsx`)
- `command-palette.tsx`, `keyboard-shortcuts.tsx` (keep as-is)
- i18n config files (routing.ts, request.ts, navigation.ts)
- middleware.ts

---

## Chunk 1: Foundation (CSS + Types + Mock Data + i18n)

### Task 1: Add semantic color CSS variables

**Files:**
- Modify: `packages/showcase/src/app/globals.css`

- [ ] **Step 1: Add semantic color variables to `:root`**

In `globals.css`, after the fragment type colors block (line 115), add:

```css
  /* --- Semantic Colors (固定, 不随主题变) --- */
  --semantic-green: oklch(0.627 0.194 149);
  --semantic-purple: oklch(0.685 0.169 293);
  --semantic-orange: oklch(0.705 0.213 47);
  --semantic-indigo: oklch(0.585 0.233 264);
  --semantic-red: oklch(0.637 0.237 25);
```

- [ ] **Step 2: Register in `@theme inline` block**

Add to `@theme inline` (after line 59):

```css
  --color-semantic-green: var(--semantic-green);
  --color-semantic-purple: var(--semantic-purple);
  --color-semantic-orange: var(--semantic-orange);
  --color-semantic-indigo: var(--semantic-indigo);
  --color-semantic-red: var(--semantic-red);
```

- [ ] **Step 3: Add fragment entity tag utility classes**

After `.priority-p3` (line 213), add:

```css
/* --- Fragment Entity Tag Utilities --- */
.entity-task {
  background: oklch(0.585 0.233 264 / 12%);
  color: oklch(0.705 0.169 264);
}
.entity-event {
  background: oklch(0.627 0.194 149 / 12%);
  color: oklch(0.75 0.17 149);
}
.entity-person {
  background: oklch(0.705 0.213 47 / 12%);
  color: oklch(0.78 0.16 47);
}
.entity-project {
  background: oklch(0.685 0.169 293 / 12%);
  color: oklch(0.75 0.15 293);
}
.entity-time {
  background: oklch(0.585 0.233 264 / 8%);
  color: oklch(0.77 0.1 240);
}
.entity-knowledge {
  background: oklch(0.556 0 0 / 12%);
  color: oklch(0.65 0 0);
}
```

- [ ] **Step 4: Verify build**

Run: `cd packages/showcase && pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add packages/showcase/src/app/globals.css
git commit -m "style: add semantic color tokens and entity tag utilities"
```

---

### Task 2: Add FragmentFeedItem type

**Files:**
- Modify: `packages/showcase/src/lib/types.ts`

- [ ] **Step 1: Add FragmentFeedItem interface**

Append after `ProcessedFragment` interface (after line 143):

```typescript
// -- Fragment Feed Item (Today Page) --
export type FragmentSource = "voice" | "text" | "screenshot" | "clipboard"

export type FragmentFeedStatus = "processing" | "pending" | "auto-executed"

export interface FragmentEntity {
  type: "task" | "event" | "person" | "project" | "time" | "knowledge"
  label: string
}

export interface FragmentFeedItem {
  id: string
  rawContent: string
  source: FragmentSource
  sourceDetail: string
  capturedAt: string
  status: FragmentFeedStatus
  confidence?: number
  entities: FragmentEntity[]
  aiAction: string
  processingProgress?: number
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/showcase/src/lib/types.ts
git commit -m "feat: add FragmentFeedItem type for Today page fragment feed"
```

---

### Task 3: Add fragment feed mock data

**Files:**
- Modify: `packages/showcase/src/lib/mock-data.ts`

- [ ] **Step 1: Add import for new type**

At line 9 (after `ProcessedFragment` import), add `FragmentFeedItem`:

```typescript
import type {
  Fragment,
  Task,
  ScheduleEvent,
  Project,
  KnowledgeItem,
  WeeklyReview,
  AppNotification,
  ProcessedFragment,
  FragmentFeedItem,
} from "./types"
```

- [ ] **Step 2: Add fragmentFeedItems array**

Append at end of file (after `processedFragments`):

```typescript
// -- Fragment Feed Items (Today Page) --
export const fragmentFeedItems: FragmentFeedItem[] = [
  {
    id: "ff1",
    rawContent: "跟老王说一下那个数据迁移的事，下周三之前要搞定，优先级比较高",
    source: "voice",
    sourceDetail: "Desktop ⌘⇧D",
    capturedAt: "2026-03-10T11:18:00",
    status: "processing",
    entities: [
      { type: "task", label: "数据迁移跟进" },
      { type: "person", label: "老王" },
      { type: "time", label: "截止：下周三 (3/17)" },
      { type: "project", label: "数据平台" },
    ],
    aiAction: "正在匹配项目上下文并安排时间槽...",
    processingProgress: 60,
  },
  {
    id: "ff2",
    rawContent: "Slack 消息 — \"明天下午2点产品方案对齐会，拉上前端同学\"",
    source: "screenshot",
    sourceDetail: "macOS Share Sheet",
    capturedAt: "2026-03-10T11:08:00",
    status: "pending",
    confidence: 95,
    entities: [
      { type: "event", label: "产品方案对齐会" },
      { type: "time", label: "明天 14:00 (3/11)" },
      { type: "person", label: "前端同学" },
    ],
    aiAction: "将创建日历事件 · 已检查无时间冲突",
  },
  {
    id: "ff3",
    rawContent: "OKR 周报今天要写完",
    source: "text",
    sourceDetail: "Desktop ⌘⇧D",
    capturedAt: "2026-03-10T10:20:00",
    status: "auto-executed",
    confidence: 97,
    entities: [
      { type: "task", label: "写 OKR 周报" },
      { type: "time", label: "已安排：今日 12:30（午休后空档）" },
    ],
    aiAction: "AI 找到 12:30-13:00 空档，已插入日程",
  },
  {
    id: "ff4",
    rawContent: "react-flow 升级到 v12 后 edge label 渲染有 bug，viewport 缩放时偏移",
    source: "clipboard",
    sourceDetail: "VS Code 复制",
    capturedAt: "2026-03-10T08:45:00",
    status: "auto-executed",
    confidence: 93,
    entities: [
      { type: "knowledge", label: "react-flow v12 bug" },
      { type: "project", label: "数据资产平台" },
    ],
    aiAction: "存入知识库 · 关联\"血缘DAG\"上下文",
  },
]

// -- Today Page Stats --
export const fragmentStats = {
  totalProcessed: 7,
  pendingConfirm: 2,
  autoExecuted: 3,
  todayEvents: 4,
}

// -- Today Page Pending Decisions --
export const pendingDecisions = [
  { id: "pd1", title: "时间冲突", description: "14:00 — 1:1 与方案对齐会重叠" },
  { id: "pd2", title: "模糊意图", description: "\"那个报告下周前要交\" — 需要归类" },
]
```

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/lib/mock-data.ts
git commit -m "feat: add fragment feed mock data for Today page"
```

---

### Task 4: Add i18n keys

**Files:**
- Modify: `packages/showcase/src/messages/zh.json`
- Modify: `packages/showcase/src/messages/en.json`

- [ ] **Step 1: Add keys to zh.json**

Add the following top-level sections to `zh.json`:

```json
"topNav": {
  "today": "今日",
  "weekly": "本周",
  "projects": "项目",
  "inbox": "收集箱",
  "review": "回顾"
},
"fragmentFeed": {
  "greeting": "早上好，启胤",
  "greetingAfternoon": "下午好，启胤",
  "greetingEvening": "晚上好，启胤",
  "dateSummary": "{date} — Dorian 已处理 {processed} 条碎片，{pending} 条待确认",
  "inputPlaceholder": "说点什么，Dorian 来处理...",
  "channelText": "文字",
  "channelVoice": "语音",
  "channelScreenshot": "截图",
  "channelClipboard": "粘贴",
  "feedTitle": "Dorian 处理记录",
  "feedCount": "今日 {count} 条",
  "aiUnderstanding": "AI 正在理解...",
  "aiUnderstood": "AI 已理解",
  "aiAutoExecuted": "已自动执行",
  "analyzing": "分析中",
  "confidence": "{value}% 置信度",
  "confirm": "确认",
  "edit": "编辑",
  "dismiss": "忽略",
  "done": "已处理",
  "sourceVoice": "语音输入",
  "sourceText": "快捷输入",
  "sourceScreenshot": "截图识别",
  "sourceClipboard": "剪贴板捕获",
  "entityTask": "任务",
  "entityEvent": "事件",
  "entityPerson": "人物",
  "entityProject": "项目",
  "entityTime": "时间",
  "entityKnowledge": "知识",
  "statsProcessed": "碎片已处理",
  "statsPending": "待确认",
  "statsAutoExecuted": "自动执行",
  "statsTodayEvents": "今日事项",
  "pendingDecisions": "待决策",
  "compactTimeline": "今日时间线",
  "now": "现在"
},
"weeklyQuad": {
  "title": "本周面板",
  "weekRange": "{start} — {end}",
  "focusTitle": "本周焦点",
  "focusDesc": "AI 挑选的最重要任务",
  "scheduleTitle": "时间分配",
  "scheduleDesc": "7 天事项密度",
  "decisionsTitle": "待你决策",
  "decisionsDesc": "未安排的任务和待处理碎片",
  "progressTitle": "本周进度",
  "progressDesc": "完成率与专注时数",
  "completionRate": "完成率",
  "focusHours": "专注时数",
  "tasksCompleted": "{done}/{total} 任务",
  "aiInsight": "AI 洞察",
  "unscheduledTasks": "未安排任务",
  "pendingFragments": "待处理碎片",
  "conflicts": "时间冲突",
  "mon": "周一",
  "tue": "周二",
  "wed": "周三",
  "thu": "周四",
  "fri": "周五",
  "sat": "周六",
  "sun": "周日"
}
```

- [ ] **Step 2: Add matching keys to en.json**

Add the same structure with English translations:

```json
"topNav": {
  "today": "Today",
  "weekly": "Weekly",
  "projects": "Projects",
  "inbox": "Inbox",
  "review": "Review"
},
"fragmentFeed": {
  "greeting": "Good morning",
  "greetingAfternoon": "Good afternoon",
  "greetingEvening": "Good evening",
  "dateSummary": "{date} — Dorian processed {processed} fragments, {pending} pending",
  "inputPlaceholder": "Say something, Dorian will handle it...",
  "channelText": "Text",
  "channelVoice": "Voice",
  "channelScreenshot": "Screenshot",
  "channelClipboard": "Paste",
  "feedTitle": "Dorian Activity",
  "feedCount": "Today {count}",
  "aiUnderstanding": "AI understanding...",
  "aiUnderstood": "AI understood",
  "aiAutoExecuted": "Auto-executed",
  "analyzing": "Analyzing",
  "confidence": "{value}% confidence",
  "confirm": "Confirm",
  "edit": "Edit",
  "dismiss": "Dismiss",
  "done": "Done",
  "sourceVoice": "Voice input",
  "sourceText": "Quick input",
  "sourceScreenshot": "Screenshot OCR",
  "sourceClipboard": "Clipboard capture",
  "entityTask": "Task",
  "entityEvent": "Event",
  "entityPerson": "Person",
  "entityProject": "Project",
  "entityTime": "Time",
  "entityKnowledge": "Knowledge",
  "statsProcessed": "Processed",
  "statsPending": "Pending",
  "statsAutoExecuted": "Auto-executed",
  "statsTodayEvents": "Today Events",
  "pendingDecisions": "Decisions",
  "compactTimeline": "Today Timeline",
  "now": "Now"
},
"weeklyQuad": {
  "title": "Weekly Board",
  "weekRange": "{start} — {end}",
  "focusTitle": "Weekly Focus",
  "focusDesc": "AI-picked top priorities",
  "scheduleTitle": "Time Allocation",
  "scheduleDesc": "7-day event density",
  "decisionsTitle": "Needs Your Decision",
  "decisionsDesc": "Unscheduled tasks and pending fragments",
  "progressTitle": "Weekly Progress",
  "progressDesc": "Completion rate and focus hours",
  "completionRate": "Completion",
  "focusHours": "Focus Hours",
  "tasksCompleted": "{done}/{total} tasks",
  "aiInsight": "AI Insight",
  "unscheduledTasks": "Unscheduled",
  "pendingFragments": "Pending Fragments",
  "conflicts": "Conflicts",
  "mon": "Mon",
  "tue": "Tue",
  "wed": "Wed",
  "thu": "Thu",
  "fri": "Fri",
  "sat": "Sat",
  "sun": "Sun"
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/messages/zh.json packages/showcase/src/messages/en.json
git commit -m "i18n: add fragment feed and weekly quadrant translation keys"
```

---

## Chunk 2: Navigation (TopNav + Layout Shell)

### Task 5: Create TopNav component

**Files:**
- Create: `packages/showcase/src/components/layout/top-nav.tsx`

- [ ] **Step 1: Create top-nav.tsx**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, Inbox } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

const primaryTabs = [
  { key: "today", href: "/today" },
  { key: "weekly", href: "/weekly" },
  { key: "projects", href: "/projects" },
] as const;

const secondaryTabs = [
  { key: "inbox", href: "/inbox", badge: 3 },
  { key: "review", href: "/review" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("topNav");

  const strippedPath = pathname.replace(`/${locale}`, "") || "/";

  function isActive(href: string) {
    return strippedPath === href || strippedPath.startsWith(`${href}/`);
  }

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border bg-card px-4 md:px-6">
      {/* Logo */}
      <Link href="/today" className="flex items-center gap-2 mr-8">
        <div className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient">
          <Sparkles className="size-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm hidden sm:inline">Dorian</span>
      </Link>

      {/* Primary tabs */}
      <nav className="flex items-center gap-1">
        {primaryTabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isActive(tab.href)
                ? "bg-accent font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {t(tab.key)}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        {/* Secondary tabs */}
        {secondaryTabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
              isActive(tab.href)
                ? "bg-accent font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {tab.key === "inbox" && <Inbox className="size-3.5" />}
            {t(tab.key)}
            {"badge" in tab && tab.badge > 0 && (
              <Badge variant="destructive" className="h-4 min-w-4 px-1 text-[10px] leading-none">
                {tab.badge}
              </Badge>
            )}
          </Link>
        ))}

        {/* ⌘K */}
        <Button
          variant="outline"
          size="sm"
          className="ml-2 h-7 gap-1.5 rounded-md border-border/60 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>⌘K</span>
        </Button>

        {/* Locale */}
        <LocaleSwitcher />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd packages/showcase && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/components/layout/top-nav.tsx
git commit -m "feat: add TopNav horizontal navigation component"
```

---

### Task 6: Rewrite LayoutShell to use TopNav

**Files:**
- Modify: `packages/showcase/src/components/layout/layout-shell.tsx`

- [ ] **Step 1: Rewrite layout-shell.tsx**

Replace entire file content:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

const standaloneRoutes = ["/auth", "/onboarding"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();

  const strippedPath = pathname.replace(`/${locale}`, "") || "/";
  const isStandalone = standaloneRoutes.some((r) => strippedPath.startsWith(r));

  if (isStandalone) {
    return (
      <div className="min-h-svh flex flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">Ask Dorian</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 overflow-auto">{children}</main>
      <CommandPalette />
      <KeyboardShortcuts />
    </div>
  );
}
```

**Key changes:**
- Removed all sidebar imports (SidebarProvider, SidebarInset, SidebarTrigger, AppSidebar, Separator)
- Removed routeKeys map (page title now handled by each page, not the shell)
- Main content area no longer has fixed padding (each page controls its own padding)
- `<main>` no longer has `p-4 md:p-6` — Today page needs full-width grid layout

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd packages/showcase && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/components/layout/layout-shell.tsx
git commit -m "feat: replace sidebar layout with top nav in LayoutShell"
```

---

### Task 7: Delete app-sidebar.tsx

**Files:**
- Delete: `packages/showcase/src/components/layout/app-sidebar.tsx`

- [ ] **Step 1: Delete the file**

```bash
rm packages/showcase/src/components/layout/app-sidebar.tsx
```

- [ ] **Step 2: Search for remaining imports**

Run: `grep -r "app-sidebar" packages/showcase/src/`
Expected: No results (layout-shell.tsx no longer imports it)

- [ ] **Step 3: Verify build**

Run: `cd packages/showcase && pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add -u packages/showcase/src/components/layout/app-sidebar.tsx
git commit -m "refactor: remove sidebar navigation component"
```

---

## Chunk 3: Today Page (Fragment Feed)

### Task 8: Create FragmentCard component

**Files:**
- Create: `packages/showcase/src/components/fragment-card.tsx`

- [ ] **Step 1: Create fragment-card.tsx**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Mic, MessageSquare, Camera, Clipboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FragmentFeedItem, FragmentSource } from "@/lib/types";

const sourceIcons: Record<FragmentSource, React.ElementType> = {
  voice: Mic,
  text: MessageSquare,
  screenshot: Camera,
  clipboard: Clipboard,
};

const sourceColors: Record<FragmentSource, string> = {
  voice: "bg-indigo-500/15 text-indigo-400",
  text: "bg-purple-500/15 text-purple-400",
  screenshot: "bg-amber-500/15 text-amber-400",
  clipboard: "bg-emerald-500/15 text-emerald-400",
};

const entityStyles: Record<string, string> = {
  task: "entity-task",
  event: "entity-event",
  person: "entity-person",
  project: "entity-project",
  time: "entity-time",
  knowledge: "entity-knowledge",
};

const entityIcons: Record<string, string> = {
  task: "📌",
  event: "📅",
  person: "👤",
  project: "📁",
  time: "🕐",
  knowledge: "📝",
};

interface FragmentCardProps {
  item: FragmentFeedItem;
}

export function FragmentCard({ item }: FragmentCardProps) {
  const t = useTranslations("fragmentFeed");
  const SourceIcon = sourceIcons[item.source];

  const sourceLabel = {
    voice: t("sourceVoice"),
    text: t("sourceText"),
    screenshot: t("sourceScreenshot"),
    clipboard: t("sourceClipboard"),
  }[item.source];

  const timeDiff = getTimeDiff(item.capturedAt);

  return (
    <Card
      className={`relative transition-opacity ${
        item.status === "auto-executed" ? "opacity-50" : ""
      }`}
    >
      {item.status === "auto-executed" && (
        <div className="absolute top-3 right-3 text-xs font-semibold text-emerald-500 flex items-center gap-1">
          ✓ {t("done")}
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Raw input */}
        <div className="flex gap-3">
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${sourceColors[item.source]}`}
          >
            <SourceIcon className="size-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm italic text-foreground/80 leading-relaxed">
              &ldquo;{item.rawContent}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {sourceLabel} · {timeDiff} · {item.sourceDetail}
            </p>
          </div>
        </div>

        {/* AI result */}
        <div className="rounded-lg border border-purple-500/10 bg-purple-500/[0.03] p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400">
              {item.status === "processing"
                ? `✦ ${t("aiUnderstanding")}`
                : item.status === "auto-executed"
                  ? `✓ ${t("aiAutoExecuted")}`
                  : `✦ ${t("aiUnderstood")}`}
            </span>
            {item.confidence && (
              <span className="text-xs text-muted-foreground">
                {t("confidence", { value: item.confidence })}
              </span>
            )}
          </div>

          {/* Processing bar */}
          {item.status === "processing" && (
            <div className="h-0.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 ai-shimmer"
                style={{ width: `${item.processingProgress ?? 50}%` }}
              />
            </div>
          )}

          {/* Entity tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.entities.map((entity, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${entityStyles[entity.type]}`}
              >
                {entityIcons[entity.type]} {entity.label}
              </span>
            ))}
          </div>

          {/* AI action */}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>→</span> {item.aiAction}
          </p>

          {/* Action buttons (only for pending) */}
          {item.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              >
                ✓ {t("confirm")}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                ✎ {t("edit")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
              >
                {t("dismiss")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeDiff(capturedAt: string): string {
  const now = new Date("2026-03-10T11:20:00");
  const captured = new Date(capturedAt);
  const diffMs = now.getTime() - captured.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH} 小时前`;
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd packages/showcase && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/components/fragment-card.tsx
git commit -m "feat: add FragmentCard component for fragment feed"
```

---

### Task 9: Rewrite Today page

**Files:**
- Modify: `packages/showcase/src/app/[locale]/today/page.tsx`

- [ ] **Step 1: Rewrite today/page.tsx**

Replace entire file content with Fragment Feed layout:
- Left (main area): Greeting + Fragment input bar + Fragment feed (FragmentCard list)
- Right (side panel): Stats grid (4 cards) + Pending decisions + Compact timeline

Key structure:
```
<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] min-h-[calc(100svh-48px)]">
  <div className="p-6">  {/* Fragment Feed */}
    <Greeting />
    <FragmentInput />
    <FeedHeader />
    {fragmentFeedItems.map(item => <FragmentCard item={item} />)}
  </div>
  <div className="border-l p-5 bg-card/50">  {/* Side panel */}
    <StatsGrid />
    <PendingDecisions />
    <CompactTimeline />
  </div>
</div>
```

Data sources:
- `fragmentFeedItems` from mock-data
- `fragmentStats` from mock-data
- `pendingDecisions` from mock-data
- `scheduleEvents` from mock-data (filtered to today: 2026-03-10)
- Compact timeline: event time + dot + title, with NOW indicator at 11:20
- Stats grid: 4 cards (碎片已处理/待确认/自动执行/今日事项)
- Pending decisions: orange border-left cards

All text via `useTranslations("fragmentFeed")`.

- [ ] **Step 2: Verify dev server**

Run: `cd packages/showcase && pnpm dev`
Navigate to `http://localhost:3000/zh/today`
Expected: Fragment Feed layout renders correctly

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/app/\\[locale\\]/today/page.tsx
git commit -m "feat: rewrite Today page with Fragment Feed layout"
```

---

## Chunk 4: Weekly Page (Four Quadrant)

### Task 10: Rewrite Weekly page

**Files:**
- Modify: `packages/showcase/src/app/[locale]/weekly/page.tsx`

- [ ] **Step 1: Rewrite weekly/page.tsx**

Replace entire file with four-quadrant layout:

```
<div className="p-6 space-y-6">
  <h1>本周面板 · 3/9 — 3/15</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card> 🎯 本周焦点 — AI 挑选的 Top 任务 </Card>
    <Card> 📅 时间分配 — 7天紧凑视图 </Card>
    <Card> ⏳ 待你决策 — 未安排任务+待处理碎片 </Card>
    <Card> 📊 本周进度 — 完成率+专注时数+AI 洞察 </Card>
  </div>
</div>
```

Quadrant details:
1. **本周焦点**: Top 3-4 tasks from `tasks[]` sorted by priority, each showing priority badge + project + due date
2. **时间分配**: Mon-Sun compact row, each day showing colored dots/chips for events (indigo=meeting, green=focus, purple=AI task)
3. **待你决策**: Unscheduled tasks (tasks without dueDate set) + pending fragments count + `pendingDecisions`
4. **本周进度**: Progress bar (completedTasks/totalTasks from weeklyReview), focus hours (focusMinutes/60), one AI insight text

All text via `useTranslations("weeklyQuad")`.

- [ ] **Step 2: Verify dev server**

Navigate to `http://localhost:3000/zh/weekly`
Expected: Four-quadrant layout renders correctly

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/app/\\[locale\\]/weekly/page.tsx
git commit -m "feat: rewrite Weekly page with four-quadrant layout"
```

---

## Chunk 5: Remaining Pages Adaptation + Cleanup

### Task 11: Fix Review page bar chart opacity

**Files:**
- Modify: `packages/showcase/src/app/[locale]/review/page.tsx`

- [ ] **Step 1: Fix bar chart opacity**

Find `opacity: 0.15` or similar low opacity value in the bar chart section, change to `opacity: 0.6` or higher to make bars visible.

- [ ] **Step 2: Commit**

```bash
git add packages/showcase/src/app/\\[locale\\]/review/page.tsx
git commit -m "fix: make review page bar chart bars visible"
```

---

### Task 12: Adapt remaining MVP pages for new layout

**Files:**
- Modify: `packages/showcase/src/app/[locale]/inbox/page.tsx`
- Modify: `packages/showcase/src/app/[locale]/projects/page.tsx`
- Modify: `packages/showcase/src/app/[locale]/review/page.tsx`

Since the new layout-shell no longer wraps content in `<main className="p-4 md:p-6">`, each page needs to ensure it has its own padding wrapper.

- [ ] **Step 1: Check each page has a padding wrapper**

Each page's root element should have `className="p-4 md:p-6"` (or appropriate padding). The Today page handles its own padding in the grid layout.

For inbox, projects, review — wrap the existing content in a `<div className="p-4 md:p-6">` if not already present.

- [ ] **Step 2: Verify all 5 MVP routes render**

Navigate to each route and verify no layout breaks:
- `/zh/today` — Fragment Feed
- `/zh/inbox` — Fragment input + cards
- `/zh/weekly` — Four quadrants
- `/zh/projects` — Project list
- `/zh/review` — Review charts

- [ ] **Step 3: Commit**

```bash
git add packages/showcase/src/app/\\[locale\\]/inbox/page.tsx packages/showcase/src/app/\\[locale\\]/projects/page.tsx packages/showcase/src/app/\\[locale\\]/review/page.tsx
git commit -m "fix: add padding wrappers for pages after layout change"
```

---

### Task 13: Final build verification

- [ ] **Step 1: Run full build**

Run: `cd packages/showcase && pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run lint**

Run: `cd packages/showcase && pnpm lint`
Expected: No lint errors

- [ ] **Step 3: Test i18n switching**

Navigate to `/zh/today`, switch to EN, verify English labels render correctly. Switch back to ZH.

- [ ] **Step 4: Final commit if any remaining changes**

```bash
git status
# If clean, skip. If changes, add and commit.
```
