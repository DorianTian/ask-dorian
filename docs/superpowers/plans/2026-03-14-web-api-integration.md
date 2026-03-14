# Web Frontend API Integration Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded mock data in 5 web pages with real API calls using existing core hooks, adding loading/error/empty states.

**Architecture:** Each page imports SWR hooks from `@ask-dorian/core/hooks` (already wrapped in `SWRProvider`). Mutations use API wrappers from `@ask-dorian/core/api` + SWR `mutate()` for cache invalidation. No new files created — only page modifications.

**Tech Stack:** React 19, SWR, Zustand, next-intl, Tailwind CSS 4, @ask-dorian/core hooks & API

---

## Prerequisites

All infrastructure is already in place:
- `SWRProvider` wraps the app in `packages/web/src/app/[locale]/layout.tsx`
- `AuthProvider` initializes the API client with token injection
- Core hooks (`useRituals`, `useTodayDashboard`, `useFragments`, etc.) are exported from `@ask-dorian/core/hooks`
- Core API wrappers (`ritualApi`, `fragmentApi`, `userApi`, etc.) are exported from `@ask-dorian/core/api`
- Server API has 57 endpoints fully functional

## File Map

| Operation | Path | Description |
|-----------|------|-------------|
| MODIFY | `packages/web/src/app/[locale]/(app)/today/page.tsx` | Today dashboard — rituals + timeline + stats |
| MODIFY | `packages/web/src/app/[locale]/(app)/stream/page.tsx` | Stream/Inbox — fragments list + create |
| MODIFY | `packages/web/src/app/[locale]/(app)/settings/page.tsx` | Settings — user profile + preferences |
| MODIFY | `packages/web/src/app/[locale]/(app)/knowledge/page.tsx` | Knowledge — processed fragments display |
| MODIFY | `packages/web/src/app/[locale]/(app)/review/page.tsx` | Review — weekly stats + accomplishments |

---

## Chunk 1: Today Page

### Task 1: Today Page — Rituals Integration

Replace hardcoded `defaultRituals` with `useRituals()` hook. Wire toggle to `ritualApi.toggleComplete()`.

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/today/page.tsx`

**Context:**
- Current mock: `defaultRituals` array (4 items with `id`, `key`, `completed`)
- Core hook: `useRituals(date?)` → returns `RitualListResponse { items: RitualWithCompletion[], progress: RitualProgress }`
- Core API: `ritualApi.toggleComplete(id, date?)` → returns `RitualToggleResponse`
- Rituals are in the right sidebar "Boot Sequence" section (lines 280-327)
- `bootProgress` computed from completed count

- [ ] **Step 1: Replace ritual mock data with useRituals hook**

Remove the `defaultRituals` const and `useState(defaultRituals)`. Import and use `useRituals()` from core.

Replace lines 1-20 (imports + mock data) and the ritual state/toggle logic (lines 84-93) with:

```typescript
"use client"

import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import {
  Activity,
  Clock,
  Terminal,
  CheckCircle2,
  Sparkles,
  Play,
  FastForward,
  Loader2,
} from "lucide-react"
import { useRituals } from "@ask-dorian/core/hooks"
import { ritualApi } from "@ask-dorian/core/api"
```

Replace TodayPage function opening:

```typescript
export default function TodayPage() {
  const t = useTranslations("today")
  const { mutate } = useSWRConfig()
  const { data: ritualData, isLoading: ritualsLoading } = useRituals()

  const rituals = ritualData?.items ?? []
  const progress = ritualData?.progress ?? { completed: 0, total: 0 }
  const bootProgress = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

  const toggleRitual = async (id: string) => {
    const result = await ritualApi.toggleComplete(id)
    if (result.ok) {
      mutate((key) => typeof key === "string" && key.startsWith("/rituals"))
    }
  }
```

- [ ] **Step 2: Update Boot Sequence JSX to use API data**

Replace the Boot Sequence section (lines 280-327). Key changes:
- `rituals.map(...)` iterates `RitualWithCompletion[]` instead of local array
- `item.title` instead of `t(item.key)` — real titles from API
- `item.completed` is already a boolean
- `toggleRitual(item.id)` uses string UUID
- Add loading state when `ritualsLoading`

```tsx
{/* Boot Sequence (Rituals) */}
<div className="bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-5 space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-slate-500">
      {t("bootSequence")}
    </h3>
    <span className="text-[10px] font-mono font-bold text-primary">
      {bootProgress}%
    </span>
  </div>

  {/* Progress bar */}
  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
    <div
      className="h-full bg-primary rounded-full transition-all duration-500"
      style={{ width: `${bootProgress}%` }}
    />
  </div>

  <div className="space-y-2">
    {ritualsLoading ? (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="text-primary animate-spin" />
      </div>
    ) : rituals.length === 0 ? (
      <p className="text-xs text-slate-600 text-center py-4 font-mono">
        {t("noRituals")}
      </p>
    ) : (
      rituals.map((item) => (
        <div
          key={item.id}
          onClick={() => toggleRitual(item.id)}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98] group"
        >
          <div
            className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
              item.completed
                ? "bg-primary border-primary text-white"
                : "border-slate-700 group-hover:border-primary/50"
            }`}
          >
            {item.completed && <CheckCircle2 size={10} />}
          </div>
          <span
            className={`text-sm font-medium transition-all ${
              item.completed
                ? "text-slate-600 line-through"
                : "text-text-main"
            }`}
          >
            {item.title}
          </span>
        </div>
      ))
    )}
  </div>
</div>
```

- [ ] **Step 3: Add i18n key for empty state**

Add `"noRituals"` key to both message files.

`packages/web/src/messages/zh.json` — in the `"today"` section add:
```json
"noRituals": "暂无晨间仪式，去设置中添加"
```

`packages/web/src/messages/en.json` — in the `"today"` section add:
```json
"noRituals": "No rituals yet. Add some in settings."
```

- [ ] **Step 4: Keep timeline and stats as mock (for now)**

The timeline blocks require events + tasks data with scheduled times, which most users won't have yet. The AI Briefing is content-only. The stats grid is placeholder. These stay as-is in this task — they'll be integrated when there's real event/task data to display.

Remove the `ritualHydrate`, `ritualMeditate`, `ritualRead`, `ritualStretch` i18n keys from message files only if they are no longer referenced. (They are — the mock used `t(item.key)` which no longer applies, so they can be left for now and cleaned up later.)

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm --filter web exec tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/today/page.tsx packages/web/src/messages/zh.json packages/web/src/messages/en.json
git commit -m "feat(web): integrate rituals API in today page

Replace hardcoded ritual mock data with useRituals() SWR hook.
Toggle completion calls ritualApi.toggleComplete() with cache
invalidation. Added loading and empty states."
```

---

## Chunk 2: Stream Page

### Task 2: Stream Page — Fragments Integration

Replace `mockFragments` with `useFragments()` hook. Add tab filtering by status. Wire up text fragment creation.

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/stream/page.tsx`

**Context:**
- Current mock: `mockFragments` (3 items with `type`, `content`, `status`, `extractedData`)
- Core hook: `useFragments(params?)` → `Fragment[]`
- Core API: `fragmentApi.create(body)`, `fragmentApi.confirm(id)`, `fragmentApi.reject(id)`
- Fragment type has `rawContent`, `contentType`, `status`, `metadata` — different shape from mock's `extractedData`
- Status values: `"pending" | "processing" | "processed" | "confirmed" | "rejected" | "failed"`

- [ ] **Step 1: Replace imports and mock data**

Replace the entire file with API-integrated version:

```typescript
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  UploadCloud,
  LayoutList,
  LayoutGrid,
  Loader2,
  Send,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useSWRConfig } from "swr"
import { useFragments } from "@ask-dorian/core/hooks"
import { fragmentApi } from "@ask-dorian/core/api"
import type { Fragment, FragmentStatus } from "@ask-dorian/core/types"
```

- [ ] **Step 2: Replace page component with API-driven version**

Key changes:
- Use `useFragments({ status })` with tab-driven status param
- Map `Fragment` fields to display: `rawContent`, `contentType`, `status`, `createdAt`
- Fragment `metadata` may contain extracted data (populated by AI pipeline)
- Add a text input area for creating new fragments via `fragmentApi.create()`
- Add confirm/reject buttons for `processed` status fragments
- Add loading state

```typescript
function getContentTypeIcon(type: string) {
  switch (type) {
    case "voice": return <Mic size={14} />
    case "image": return <ImageIcon size={14} />
    default: return <MessageSquare size={14} />
  }
}

function getStatusLabel(status: FragmentStatus, t: ReturnType<typeof useTranslations>) {
  switch (status) {
    case "pending": return t("statusPending")
    case "processing": return t("statusProcessing")
    case "processed": return t("statusProcessed")
    case "confirmed": return t("statusConfirmed")
    case "rejected": return t("statusRejected")
    case "failed": return t("statusFailed")
    default: return status
  }
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString()
}

export default function StreamPage() {
  const t = useTranslations("stream")
  const { mutate } = useSWRConfig()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [newContent, setNewContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statusParam = activeTab === "all" ? undefined : activeTab
  const { data: fragments, isLoading } = useFragments(
    statusParam ? { status: statusParam } : undefined
  )

  const tabs = [
    { id: "all", label: t("allFragments") },
    { id: "pending", label: t("pendingReview") },
    { id: "processed", label: t("processed") },
  ]

  const handleSubmit = async () => {
    if (!newContent.trim() || isSubmitting) return
    setIsSubmitting(true)
    const result = await fragmentApi.create({
      rawContent: newContent.trim(),
      contentType: "text",
      inputSource: "web",
    })
    if (result.ok) {
      setNewContent("")
      mutate((key) => typeof key === "string" && key.startsWith("/fragments"))
    }
    setIsSubmitting(false)
  }

  const handleConfirm = async (id: string) => {
    const result = await fragmentApi.confirm(id)
    if (result.ok) {
      mutate((key) => typeof key === "string" && key.startsWith("/fragments"))
    }
  }

  const handleReject = async (id: string) => {
    const result = await fragmentApi.reject(id)
    if (result.ok) {
      mutate((key) => typeof key === "string" && key.startsWith("/fragments"))
    }
  }

  const items = fragments ?? []

  // ... rest of JSX below
}
```

- [ ] **Step 3: Replace JSX body**

Replace the entire return JSX. Key differences from mock version:
- Quick capture input area at top (textarea + send button)
- Fragment cards show `rawContent` (or `normalizedContent` if available)
- Cards for `processed` status show confirm/reject action buttons
- Loading spinner when `isLoading`
- Empty state when no fragments

```tsx
return (
  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main tracking-tight">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex bg-surface-dark p-1 rounded-lg border border-border-dark shadow-sm">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-slate-800 text-text-main"
                : "text-slate-500 hover:text-text-main"
            }`}
          >
            <LayoutList size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-slate-800 text-text-main"
                : "text-slate-500 hover:text-text-main"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Quick Capture */}
      <div className="bg-surface-dark/40 border border-border-dark rounded-2xl p-4">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={t("capturePlaceholder")}
          rows={2}
          className="w-full bg-transparent text-sm text-text-main placeholder-slate-600 resize-none outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit()
            }
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-[10px] text-slate-600 font-mono">
            ⌘+Enter {t("toSend")}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!newContent.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
          >
            {isSubmitting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            {t("capture")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-dark gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative py-4 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-slate-500 hover:text-text-main"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <UploadCloud size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">{t("noFragments")}</p>
          <p className="text-slate-600 text-sm mt-1">{t("noFragmentsDesc")}</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
          }
        >
          {items.map((f) => (
            <div
              key={f.id}
              className="group relative bg-surface-dark/40 border border-border-dark/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 cursor-pointer active:scale-[0.99] p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-primary">
                  {getContentTypeIcon(f.contentType)}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {getStatusLabel(f.status, t)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {formatTime(f.capturedAt)}
                </span>
              </div>

              <div className="bg-bg-dark/40 rounded-xl p-3 border-l-4 border-primary/40 mb-4 group-hover:bg-bg-dark/60 transition-colors">
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  &quot;{f.normalizedContent || f.rawContent}&quot;
                </p>
              </div>

              {f.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {f.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Confirm/Reject for processed fragments */}
              {f.status === "processed" && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConfirm(f.id) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <CheckCircle2 size={12} />
                    {t("confirm")}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReject(f.id) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    <XCircle size={12} />
                    {t("reject")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)
```

- [ ] **Step 4: Add i18n keys**

`packages/web/src/messages/zh.json` — in `"stream"` section add:
```json
"capturePlaceholder": "输入想法、笔记、或任何碎片...",
"toSend": "发送",
"capture": "捕获",
"noFragments": "暂无碎片",
"noFragmentsDesc": "在上方输入框中捕获你的第一个碎片",
"confirm": "确认",
"reject": "拒绝",
"statusPending": "待处理",
"statusProcessing": "AI 处理中",
"statusProcessed": "已提取",
"statusConfirmed": "已确认",
"statusRejected": "已拒绝",
"statusFailed": "处理失败"
```

`packages/web/src/messages/en.json` — in `"stream"` section add:
```json
"capturePlaceholder": "Drop a thought, note, or any fragment...",
"toSend": "to send",
"capture": "Capture",
"noFragments": "No fragments yet",
"noFragmentsDesc": "Capture your first fragment using the input above",
"confirm": "Confirm",
"reject": "Reject",
"statusPending": "Pending",
"statusProcessing": "AI Processing",
"statusProcessed": "Extracted",
"statusConfirmed": "Confirmed",
"statusRejected": "Rejected",
"statusFailed": "Failed"
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm --filter web exec tsc --noEmit`
Expected: No errors

**Note:** The `Fragment` type has a `tags: string[]` field but it doesn't exist in the DB schema (fragments table has no tags column). If TypeScript errors on `f.tags`, check the Fragment type definition. The Fragment type may not have `tags` — in that case, remove the tags section from the JSX or extract tags from `f.metadata`.

- [ ] **Step 6: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/stream/page.tsx packages/web/src/messages/zh.json packages/web/src/messages/en.json
git commit -m "feat(web): integrate fragments API in stream page

Replace mock fragments with useFragments() hook. Add quick capture
input, tab filtering by status, confirm/reject actions for processed
fragments. Added loading and empty states."
```

---

## Chunk 3: Settings + Knowledge + Review Pages

### Task 3: Settings Page — User Profile Integration

Replace hardcoded user info with `useAuth` user data (already in Zustand store from login). Wire settings persistence to `userApi`.

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/settings/page.tsx`

**Context:**
- Current mock: `"Alex Johnson"`, `"alex.j@example.com"` hardcoded in JSX
- `useAuth` already imported — the auth store has `user: User` with `name`, `email`, `role`
- For settings persistence: `userApi.updateSettings()` can save AI preferences
- Keep the visual structure identical — just swap data sources

- [ ] **Step 1: Replace hardcoded user info with auth store data**

Add `user` selector to existing `useAuth`:

```typescript
const logout = useAuth((s) => s.logout)
const user = useAuth((s) => s.user)
```

Replace the profile section:
- `"Alex Johnson"` → `{user?.name ?? "User"}`
- `"alex.j@example.com"` → `{user?.email}`
- Premium/free badge based on `user?.role`

```tsx
{/* Profile Avatar */}
<div className="flex flex-col items-center gap-4 py-8">
  <div className="relative group cursor-pointer">
    <div className="size-32 rounded-3xl border-4 border-primary/20 overflow-hidden shadow-2xl shadow-primary/10 group-hover:border-primary/40 transition-all bg-surface-dark flex items-center justify-center">
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
      ) : (
        <User size={48} className="text-slate-600" />
      )}
    </div>
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
      <Camera size={24} className="text-white" />
    </div>
    <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl border-4 border-bg-dark shadow-lg hover:scale-110 active:scale-95 transition-transform z-10">
      <User size={18} />
    </button>
  </div>
  <div className="text-center">
    <h2 className="text-2xl font-bold text-text-main">{user?.name ?? "User"}</h2>
    <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
      {user?.role === "pro" ? t("premiumMember") : t("freeMember")}
    </p>
  </div>
</div>
```

Replace the profile email in SettingItem:
```tsx
<SettingItem
  icon={User}
  title={t("profileInfo")}
  subtitle={user?.email ?? ""}
/>
```

- [ ] **Step 2: Add i18n key for free member**

`packages/web/src/messages/zh.json` — in `"settings"` add:
```json
"freeMember": "免费用户"
```

`packages/web/src/messages/en.json` — in `"settings"` add:
```json
"freeMember": "Free Member"
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm --filter web exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/settings/page.tsx packages/web/src/messages/zh.json packages/web/src/messages/en.json
git commit -m "feat(web): show real user profile in settings page

Replace hardcoded 'Alex Johnson' with auth store user data.
Display actual name, email, avatar, and role badge."
```

### Task 4: Knowledge Page — Fragments Integration

Replace hardcoded `cards` array with `useFragments({ status: "confirmed" })`. Map Fragment fields to card display.

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/knowledge/page.tsx`

**Context:**
- Current mock: 6 `KnowledgeCard` objects with `title`, `project`, `tags`, `summary`, `type`, `content`
- Real data: `Fragment` has `rawContent`, `normalizedContent`, `contentType`, `metadata`, `status`
- Fragment doesn't have `project` or `summary` fields — these are AI-generated and may be in `metadata`
- Knowledge page should show confirmed/processed fragments as "crystallized knowledge"
- Client-side search/filter stays — just operates on real data instead of mock
- The `FragmentDetail` component accepts a specific shape — may need to adapt

- [ ] **Step 1: Replace imports and remove mock data**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Search,
  MoreHorizontal,
  Filter,
  Grid,
  List as ListIcon,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Link as LinkIcon,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react"
import { FragmentDetail } from "@/components/shared/fragment-detail"
import { useFragments } from "@ask-dorian/core/hooks"
import type { Fragment } from "@ask-dorian/core/types"
```

Remove the `KnowledgeCard` interface and `cards` const entirely (lines 21-165).

- [ ] **Step 2: Replace component logic**

Map Fragment content type to the filter types. Adapt `getTypeIcon` for Fragment `contentType` values.

```typescript
type FragmentType = "all" | "text" | "image" | "voice" | "url"

function getTypeIcon(type: string) {
  switch (type) {
    case "text": return <MessageSquare size={14} />
    case "image": return <ImageIcon size={14} />
    case "voice": return <Mic size={14} />
    case "url": return <LinkIcon size={14} />
    default: return <MessageSquare size={14} />
  }
}

export default function KnowledgePage() {
  const t = useTranslations("knowledge")
  const { data: fragments, isLoading } = useFragments({ status: "confirmed" })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<FragmentType>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null)

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true)
      const timer = setTimeout(() => setIsSearching(false), 600)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  const items = fragments ?? []

  const filteredItems = items.filter((f) => {
    const content = f.normalizedContent || f.rawContent
    const matchesSearch =
      !searchQuery ||
      content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      selectedType === "all" || f.contentType === selectedType
    return matchesSearch && matchesType
  })
```

- [ ] **Step 3: Update card rendering JSX**

Replace card rendering to use `Fragment` fields:
- `card.title` → `f.normalizedContent?.slice(0, 60) || f.rawContent.slice(0, 60)` (use first 60 chars as title)
- `card.summary` → `f.rawContent` (full raw content as summary)
- `card.project` → omit (Fragment has no project field)
- `card.tags` → `f.tags` (if available) or empty array
- `card.type` → `f.contentType`
- `card.timestamp` → `new Date(f.capturedAt).toLocaleDateString()`

```tsx
{filteredItems.map((f) => (
  <div
    key={f.id}
    onClick={() => setSelectedFragment(f)}
    className={`bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer active:scale-[0.99] ${
      viewMode === "list" ? "flex-row items-center" : ""
    }`}
  >
    <div
      className={`flex justify-between items-start ${
        viewMode === "list" ? "flex-col gap-2 min-w-[120px]" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
          {f.contentType}
        </span>
        <div className="text-slate-500 opacity-50">
          {getTypeIcon(f.contentType)}
        </div>
      </div>
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-slate-500 hover:text-white transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>
    </div>
    <div className={`flex-1 ${viewMode === "list" ? "px-4" : ""}`}>
      <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">
        {f.normalizedContent?.slice(0, 80) || f.rawContent.slice(0, 80)}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mt-1">
        {f.rawContent}
      </p>
    </div>
    <div
      className={`flex flex-wrap gap-2 ${
        viewMode === "list"
          ? "mt-0 pt-0 border-t-0"
          : "mt-auto pt-4 border-t border-white/5"
      }`}
    >
      <span className="text-[10px] text-slate-500 font-mono">
        {new Date(f.capturedAt).toLocaleDateString()}
      </span>
    </div>
  </div>
))}
```

- [ ] **Step 4: Update filter dropdown types**

Change filter options to match Fragment `contentType` values:

```tsx
{(["all", "text", "image", "voice", "url"] as FragmentType[]).map((type) => (
```

- [ ] **Step 5: Update FragmentDetail usage**

The `FragmentDetail` component expects a specific shape. Check if it's compatible with `Fragment` type. If not, adapt the prop by mapping:

```tsx
<FragmentDetail
  fragment={selectedFragment ? {
    id: selectedFragment.id,
    title: selectedFragment.normalizedContent?.slice(0, 80) || selectedFragment.rawContent.slice(0, 80),
    type: selectedFragment.contentType,
    content: selectedFragment.rawContent,
    timestamp: new Date(selectedFragment.capturedAt).toLocaleString(),
    status: selectedFragment.status,
    extractedData: {
      title: selectedFragment.normalizedContent?.slice(0, 80),
      tags: selectedFragment.tags ?? [],
    },
  } : null}
  onClose={() => setSelectedFragment(null)}
/>
```

Check the `FragmentDetail` component's interface — if it doesn't match, adapt the mapping above to fit.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `pnpm --filter web exec tsc --noEmit`
Expected: No errors. Fix any type mismatches between `Fragment` and `FragmentDetail`'s expected props.

- [ ] **Step 7: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/knowledge/page.tsx
git commit -m "feat(web): integrate fragments API in knowledge page

Replace hardcoded knowledge cards with useFragments({ status:
'confirmed' }). Adapted card rendering, search, and filter to
use real Fragment data."
```

### Task 5: Review Page — Weekly Review Integration

Replace hardcoded stats, accomplishments, and chart data with `useWeekReview()` and `useRitualStats()`.

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/review/page.tsx`

**Context:**
- Current mock: `stats` (3 items), `accomplishments` (4 strings), `upcomingFocus` (4 strings), `chartData` (7 numbers)
- Core hook: `useWeekReview(params)` → `WeekReview { completed: Task[], events, knowledge, fragmentsProcessed }`
- Core hook: `useRitualStats(params)` → `RitualStats { completionRate, dailyBreakdown, currentStreak, bestStreak }`
- `WeekReview.completed` is `Task[]` — use task titles as accomplishments
- Upcoming focus = tasks with future `dueDate` — not available in WeekReview (which is backward-looking)

- [ ] **Step 1: Replace imports and add hooks**

```typescript
"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Target,
  Zap,
  Share2,
  Download,
  Loader2,
} from "lucide-react"
import { useWeekReview, useRitualStats } from "@ask-dorian/core/hooks"
import { useTasks } from "@ask-dorian/core/hooks"
```

- [ ] **Step 2: Replace component with API-driven version**

Calculate current week start (Monday) for the review params:

```typescript
export default function ReviewPage() {
  const t = useTranslations("review")

  // Calculate current week start (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const weekStart = monday.toISOString().slice(0, 10)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const weekEnd = sunday.toISOString().slice(0, 10)

  const { data: review, isLoading: reviewLoading } = useWeekReview({ weekStart })
  const { data: ritualStats, isLoading: statsLoading } = useRitualStats({
    from: weekStart,
    to: weekEnd,
  })

  const isLoading = reviewLoading || statsLoading
  const completedTasks = review?.completed ?? []
  const dailyBreakdown = ritualStats?.dailyBreakdown ?? []

  const stats = [
    {
      label: t("focusScore"),
      value: ritualStats ? `${Math.round(ritualStats.completionRate * 100)}` : "—",
      trend: ritualStats?.currentStreak ? `${ritualStats.currentStreak}d streak` : undefined,
      icon: Target,
      sub: t("aboveAverage"),
    },
    {
      label: t("deepWork"),
      value: `${dailyBreakdown.length}`,
      unit: t("days"),
      icon: Zap,
      sub: ritualStats ? `${ritualStats.bestStreak}d ${t("bestStreak")}` : "",
    },
    {
      label: t("completed"),
      value: `${completedTasks.length}`,
      unit: "tasks",
      icon: CheckCircle2,
      sub: `${review?.fragmentsProcessed ?? 0} ${t("fragmentsProcessed")}`,
    },
  ]

  // Chart data from ritual daily breakdown
  const chartLabels = dailyBreakdown.map((d) => {
    const date = new Date(d.date)
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
  })
  const chartValues = dailyBreakdown.map((d) =>
    d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
  )
```

- [ ] **Step 3: Add loading state and update accomplishments**

Add loading check before the main content. Replace `accomplishments` with completed task titles. Replace `upcomingFocus` with upcoming events.

Wrap main content:
```tsx
{isLoading ? (
  <div className="flex items-center justify-center py-20">
    <Loader2 size={24} className="text-primary animate-spin" />
  </div>
) : (
  <>
    {/* ... existing stats grid, chart, accomplishments, insight ... */}
  </>
)}
```

Replace accomplishments list data:
```tsx
{completedTasks.slice(0, 6).map((task) => (
  <div key={task.id} className="flex items-center gap-3 p-4 rounded-xl bg-surface-dark/40 border border-border-dark/50 hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer group">
    <div className="size-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
    <span className="text-sm text-slate-300 group-hover:text-text-main transition-colors">
      {task.title}
    </span>
  </div>
))}
{completedTasks.length === 0 && (
  <p className="text-sm text-slate-600 text-center py-4">{t("noCompletedTasks")}</p>
)}
```

Replace chart with ritual daily breakdown:
```tsx
<div className="h-48 flex items-end justify-between gap-2">
  {chartValues.length > 0 ? chartValues.map((h, i) => (
    <div key={i} className="flex-1 flex flex-col justify-end gap-1 group/bar">
      <div
        className="w-full bg-primary/40 rounded-t-sm relative transition-all group-hover/bar:bg-primary/60"
        style={{ height: `${Math.max(h, 2)}%` }}
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
          {h}%
        </div>
      </div>
      <div className="w-full bg-slate-800 h-[10%] rounded-b-sm" />
    </div>
  )) : (
    <p className="text-sm text-slate-600 text-center w-full py-8">{t("noChartData")}</p>
  )}
</div>
{chartLabels.length > 0 && (
  <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
    {chartLabels.map((day, i) => (
      <span key={i}>{day}</span>
    ))}
  </div>
)}
```

- [ ] **Step 4: Add i18n keys**

`packages/web/src/messages/zh.json` — in `"review"` add:
```json
"days": "天",
"bestStreak": "最佳连续",
"fragmentsProcessed": "个碎片已处理",
"noCompletedTasks": "本周暂无已完成任务",
"noChartData": "暂无打卡数据"
```

`packages/web/src/messages/en.json` — in `"review"` add:
```json
"days": "days",
"bestStreak": "best streak",
"fragmentsProcessed": "fragments processed",
"noCompletedTasks": "No completed tasks this week",
"noChartData": "No ritual data yet"
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm --filter web exec tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/review/page.tsx packages/web/src/messages/zh.json packages/web/src/messages/en.json
git commit -m "feat(web): integrate review + ritual stats API in review page

Replace hardcoded stats and chart with useWeekReview() and
useRitualStats() hooks. Show real completed tasks, ritual
completion rates, and streak data."
```

---

## Post-Implementation

After all 5 tasks are done:

- [ ] Run full TypeScript check: `pnpm --filter web exec tsc --noEmit`
- [ ] Start dev server and verify all pages load: `pnpm dev:web`
- [ ] Verify no console errors on each page
- [ ] Clean up any unused i18n keys from mock data era
