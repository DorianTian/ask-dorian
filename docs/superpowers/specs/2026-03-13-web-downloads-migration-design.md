# Web Frontend Migration — Downloads UI to Next.js

> **Date**: 2026-03-13
> **Status**: Pending approval
> **Scope**: packages/web only (mobile/desktop untouched)

---

## 一、Overview

Migrate the Downloads ask-dorian Vite SPA UI (design, components, interactions, copy) into the existing Next.js 16 web package. The result should be **visually and functionally identical** to the Downloads version, running on the Next.js architecture with real API integration via `@ask-dorian/core`.

### What changes

- Design system: Neutral → Emerald dark-first with glass-panel effects
- Layout: TopNav → Sidebar (desktop) + mobile bottom nav
- Pages: 8 pages from Downloads (replaces current 7)
- Components: All from Downloads, adapted to Next.js
- Copy/content: 100% from Downloads (English)
- Animations: Add framer-motion throughout
- i18n default: zh → en

### What stays

- Next.js 16 framework + file-based routing
- next-intl i18n mechanism (routing, middleware, message files)
- `@ask-dorian/core` API client, types, hooks, stores
- SWR data fetching
- Zustand auth store + auth-provider
- shadcn/ui base component library (restyled)
- Deployment config (next.config.ts, middleware.ts)

---

## 二、Pages

### Final route map (8 pages)

| Route | Page | Source |
|-------|------|--------|
| `/` | Landing | Downloads `Landing.tsx` — public, no auth |
| `/[locale]/(auth)/login` | Login | Downloads `Login.tsx` — replaces current login+register |
| `/[locale]/(app)/today` | Dashboard | Downloads `Dashboard.tsx` |
| `/[locale]/(app)/stream` | Stream | Downloads `FragmentStream.tsx` (was `/inbox`) |
| `/[locale]/(app)/knowledge` | Library | Downloads `KnowledgeLibrary.tsx` |
| `/[locale]/(app)/review` | Review | Downloads `WeeklyReview.tsx` |
| `/[locale]/(app)/settings` | Settings | Downloads `Settings.tsx` |
| `/[locale]/(app)/support` | Support & Help | Downloads `Support.tsx` |

### Pages removed

- `/[locale]/(app)/weekly` — deleted
- `/[locale]/(app)/projects` — deleted
- `/[locale]/(auth)/register` — merged into login (OAuth + email buttons)

---

## 三、Design System

### Color tokens (replaces current OKLch neutral)

```css
:root {
  /* Dark theme (default) */
  --primary: #10b981;       /* Emerald 500 */
  --primary-glow: rgba(16, 185, 129, 0.15);
  --bg: #09090b;
  --surface: #18181b;
  --border: #27272a;
  --text: #f8fafc;
}

.light {
  --primary: #059669;       /* Emerald 600 */
  --primary-glow: rgba(5, 150, 105, 0.1);
  --bg: #fafafa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text: #0f172a;
}
```

### Tailwind theme mapping

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-primary: var(--primary);
  --color-bg-dark: var(--bg);
  --color-surface-dark: var(--surface);
  --color-border-dark: var(--border);
  --color-text-main: var(--text);
}
```

### Visual effects

| Effect | CSS |
|--------|-----|
| Glass panel | `bg-surface-dark/70 backdrop-blur-xl border border-border-dark/50` |
| Crystalline gradient | `radial-gradient(circle at top right, rgba(16,185,129,0.1), transparent)` |
| Custom scrollbar | 4px width, transparent track, border-dark thumb |
| Primary glow | `shadow-primary/20`, `border-primary/20` |
| Active press | `active:scale-[0.98]` on all clickable elements |
| Hover elevation | `hover:-translate-y-1 hover:scale-[1.01]` on cards |

### Typography

- Font: Inter (via Google Fonts or system)
- Micro-labels: `text-[10px] font-black uppercase tracking-[0.2em]`
- Headings: `font-black tracking-tight`
- Body: `text-sm font-medium`
- Mono: font-mono for timestamps, percentages, versions

### Border radius

- Default containers: `rounded-2xl` (16px)
- Large containers: `rounded-3xl` (24px)
- Buttons/badges: `rounded-xl` (12px)
- Small chips: `rounded-full` or `rounded-lg`

---

## 四、Layout Architecture

### App Shell (authenticated pages)

```
┌────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────┐  │
│ │           │ │ Header (h-16, sticky)            │  │
│ │  Sidebar  │ ├──────────────────────────────────┤  │
│ │  (w-64)   │ │                                  │  │
│ │  hidden   │ │  Page Content                    │  │
│ │  <lg      │ │                                  │  │
│ │           │ │                                  │  │
│ │           │ │ ┌──────────────────────────────┐ │  │
│ │           │ │ │ Quick Capture Bar (floating) │ │  │
│ │           │ │ └──────────────────────────────┘ │  │
│ └──────────┘ └──────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐ │
│ │ Mobile Bottom Nav (lg:hidden, fixed)           │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### Sidebar content (from Downloads)

1. **Logo**: Bot icon + "Dorian" text
2. **New button**: PlusCircle
3. **Main Navigation**:
   - Today (LayoutDashboard) → `/today`
   - Stream (Zap) → `/stream`
   - Library (Library) → `/knowledge`
   - Review (History) → `/review`
4. **Support section**:
   - Help Center (HelpCircle) → `/support`
   - What's New (Sparkles)
5. **Daily Goal**: progress bar ("5 of 8 Deep Work units complete")
6. **Settings** (Settings) → `/settings`
7. **User**: avatar + "Alex Johnson" + "Pro Plan" + logout

### Header content (from Downloads)

- Left: Page title + optional subtitle
- Right: Focus Mode toggle, Search bar (⌘K, desktop only), Theme toggle (Moon/Sun), Notifications bell (with dot), User avatar (mobile only)

### Quick Capture Bar (from Downloads)

- Floating at bottom of main content area
- Hidden on Settings page
- Structure: Sparkles icon + text input + Image button + Mic button + "Process" button
- Below bar: ⌘K search hint + "Neural Engine Active" indicator

### Mobile Bottom Nav

- 5 items: Today, Stream, Library, Review, Settings
- Icon + 10px uppercase label

---

## 五、Components

### Layout components (new/replaced)

| Component | File | Source |
|-----------|------|--------|
| AppShell | `components/layout/app-shell.tsx` | Rewrite — Sidebar + Header + main + CaptureBar |
| Sidebar | `components/layout/sidebar.tsx` | Downloads `Sidebar.tsx` |
| Header | `components/layout/header.tsx` | Downloads `Header.tsx` |
| QuickCaptureBar | `components/layout/quick-capture-bar.tsx` | Downloads App.tsx capture bar section |
| GlobalSearch | `components/layout/global-search.tsx` | Downloads `GlobalSearch.tsx` |
| ThemeToggle | `components/layout/theme-toggle.tsx` | Keep current, adapt to Downloads style |

### Shared components (new/replaced)

| Component | File | Source |
|-----------|------|--------|
| FragmentCard | `components/shared/fragment-card.tsx` | Downloads `FragmentCard.tsx` — 100% copy |
| FragmentDetail | `components/shared/fragment-detail.tsx` | Downloads `FragmentDetail.tsx` — 100% copy |

### Components removed

- `components/layout/top-nav.tsx` — replaced by Sidebar + Header
- `components/layout/command-palette.tsx` — replaced by GlobalSearch
- `components/shared/task-item.tsx` — not used in Downloads pages
- `components/shared/event-item.tsx` — not used in Downloads pages
- `components/shared/quick-capture.tsx` — replaced by QuickCaptureBar
- `components/shared/empty-state.tsx` — not used in Downloads pages

### shadcn/ui components

Keep all 18 existing shadcn/ui components. CSS variables will be updated to match emerald theme. No component removals needed.

---

## 六、Page Content & Copy (100% from Downloads)

### Landing page

- Nav: Diamond logo + "Dorian" + Philosophy/Features/Pricing links + "Sign In" button
- Hero badge: "Fragment-First Philosophy"
- Headline: "CRYSTALLIZE YOUR THOUGHTS" (gradient text)
- Subtext: "Dorian is your premium AI thought partner. Capture fragments of knowledge, voice memos, and screenshots. Watch them transform into actionable insights."
- CTA: "Start Your Flow" + "Watch Demo"
- App preview image with floating feature cards ("Instant Extraction", "Context Aware")
- Footer: "Dorian AI © 2024" + Privacy/Terms/Security links

### Login page

- Back to home link
- Diamond logo (size-16, rounded-2xl)
- "Welcome Back" heading
- "Sign in to your crystalline flow." subtext
- "Continue with Email" button (primary)
- Divider: "Or continue with"
- Github + Google buttons (2-col grid)
- Terms/Privacy agreement text

### Dashboard (Today)

- **AI Summary Banner**: "AI Morning Summary" badge, "You have 4 deep-work sessions scheduled. Your energy peak is predicted at 10 AM. Priority: Finish the UI Refinement before 12:00." + "Full Briefing" button
- **Morning Ritual** (left column, col-span-5):
  - Items: "10min Mindful Breathing", "Cold Shower (Level 3)", "Review Product Specs" (focus), "Journaling (Daily Intentions)"
  - Toggleable checkboxes, focus item has timeboxing badge
  - "Add Element" dashed button
- **Daily Timeline** (right column, col-span-7):
  - Dot grid background
  - Current time indicator: "09:12 AM"
  - Blocks: 08:00 Morning Ritual (completed), 09:00 drop zone, 10:00 Weekly Sync (Team), 12:00 Mindful Lunch
- **Stats** (4-col grid): Focus Score "92" (+4%), Deep Work "3.2 hrs", Tasks Done "14/22", Energy Peak "10:00 - 12:30"

### Stream

- Header: "Stream" title + "Real-time AI processing of your incoming data." subtitle
- View toggle: List/Grid
- Tabs: "All Fragments", "Pending Review", "Processed"
- Fragment cards (via FragmentCard component)
- Drop zone: UploadCloud icon + "Drop more fragments" + "Dorian will automatically extract tasks and data for you."

### Library

- Header: "Library" title + "AI-curated fragments of your collective intelligence." subtitle
- Grid/List view toggle
- Filter dropdown: All, Thought, Screenshot, Voice, Link
- Search bar with loading spinner
- 6 mock cards: Neural Synapse Mapping, Visual Cortex Simulation, CRISPR Editing Log, Quantum Entanglement Protocol, Sustainable Energy Grid, Linguistic Pattern Analysis
- Each card: project badge + type icon + title + summary + tags

### Review

- Header: "Review" title + subtitle + Share/Export buttons
- 3 stat cards: Focus Score "92" (+4%), Deep Work "24.5 hrs", Completed "48 tasks"
- Focus Intensity bar chart (Mon-Sun: 40,60,50,80,95,70,85)
- Key Accomplishments (4 items)
- Upcoming Focus (4 items)
- Dorian's Weekly Insight card with gradient blob

### Settings

- Profile: avatar + "Alex Johnson" + "Premium Member"
- Account & Security: Profile Information, Security & Privacy, Custom Icons, Subscription
- AI Preferences: Classification Threshold slider (85%), Auto-Crystallize toggle
- Granular Threshold modal
- System: Notifications, Language & Region, Connected Devices, Data Management
- Sign Out button (red)
- Version: "Dorian AI v2.4.0-stable, Build ID: 8f2c9a1"

### Support & Help

- Hero: "How can we help?" + search bar
- 4-category grid: Documentation (indigo), FAQ (emerald), Privacy & Security (blue), Direct Support (rose)
- Feedback section: "Have a suggestion?"
- System Status: Neural Engine, Fragment Extraction, Cloud Sync, Search Indexing (degraded)
- Footer: Terms/Privacy/Cookie links

---

## 七、Data Layer Migration

### Mock → API mapping

| Downloads mock | Core API | Notes |
|---------------|----------|-------|
| `fragments` state in App.tsx | `useFragments()` + `fragmentApi` | SWR hook for list, API for create/confirm/reject |
| `processFragment()` Gemini | `fragmentApi.create()` | Server-side AI pipeline replaces client Gemini |
| Dashboard mock data | `useTodayDashboard()` | Server aggregation endpoint |
| Knowledge mock cards | `useKnowledge()` | Real knowledge entries |
| Review mock stats | `useWeekReview()` | Real week stats |
| User "Alex Johnson" | `useUser()` | Real user profile |
| Notification dot | `useUnreadCount()` | Real notification count |
| Search mock results | `searchApi.search()` | Real full-text + vector search |
| Ritual checkboxes | Local state (MVP) | Not backed by server yet — keep as client state |
| Daily Goal progress | Local state (MVP) | Not backed by server yet |

### Capture bar flow

1. User types in capture bar, clicks "Process" or presses Enter
2. Call `fragmentApi.create({ rawContent, contentType: 'text' })`
3. Server runs AI pipeline, returns fragment with `status: 'processing'`
4. SSE or polling updates fragment to `status: 'processed'` with extracted data
5. Fragment appears in Stream page

### Auth flow

- Landing `/` → click "Sign In" or "Start Your Flow" → `/login`
- Login page: "Continue with Email" → show email/password form (reuse current auth-provider logic)
- Google OAuth button → `authApi.googleOAuth()`
- After auth → redirect to `/today`
- Sidebar logout → `authApi.logout()` → redirect to `/`

---

## 八、i18n Changes

### Default locale

Change from `zh` to `en` in `src/i18n/routing.ts`:

```typescript
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
});
```

### Message files

- `en.json`: Extract all English copy from Downloads components into structured i18n keys
- `zh.json`: Keep existing Chinese translations, add new keys for new pages

### Key structure

```json
{
  "nav": { "today": "Today", "stream": "Stream", "library": "Library", "review": "Review", "settings": "Settings", "support": "Help Center", "whatsNew": "What's New" },
  "landing": { "badge": "Fragment-First Philosophy", "headline": "CRYSTALLIZE", "headlineGradient": "YOUR THOUGHTS", "subtitle": "...", "cta": "Start Your Flow", "demo": "Watch Demo", ... },
  "login": { "back": "Back to home", "welcome": "Welcome Back", "subtitle": "Sign in to your crystalline flow.", "email": "Continue with Email", "divider": "Or continue with", ... },
  "today": { "aiSummaryBadge": "AI Morning Summary", "aiSummary": "...", "fullBriefing": "Full Briefing", "morningRitual": "Morning Ritual", "dailyTimeline": "Daily Timeline", ... },
  "stream": { "title": "Stream", "subtitle": "Real-time AI processing of your incoming data.", "tabs": { ... }, ... },
  "knowledge": { "title": "Library", "subtitle": "AI-curated fragments of your collective intelligence.", ... },
  "review": { "title": "Review", ... },
  "settings": { ... },
  "support": { "title": "How can we help?", ... }
}
```

---

## 九、Dependencies

### Add

| Package | Purpose |
|---------|---------|
| `framer-motion` | Page transitions, modal animations, hover effects |

### Remove

| Package | Reason |
|---------|--------|
| `recharts` | No charts in Downloads design (bar chart in Review is pure CSS) |
| `react-day-picker` | No calendar page |
| `cmdk` | Replaced by custom GlobalSearch |

---

## 十、Theme System

### next-themes integration

Current web uses `next-themes`. Downloads uses custom ThemeContext with `localStorage` + class toggle.

**Decision**: Keep `next-themes` (already integrated), but:
- Change default theme to `dark`
- Change class application: dark is default (no class), light adds `.light` class
- OR: keep standard next-themes behavior (`.dark` class on html) and map CSS variables accordingly

**Recommended**: Use next-themes with `defaultTheme="dark"` and map Downloads CSS variables to next-themes `.dark`/`.light` classes.

---

## 十一、Files Changed Summary

### New files

- `src/app/page.tsx` — Landing page (replaces redirect)
- `src/app/[locale]/(app)/stream/page.tsx`
- `src/app/[locale]/(app)/knowledge/page.tsx`
- `src/app/[locale]/(app)/settings/page.tsx`
- `src/app/[locale]/(app)/support/page.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/quick-capture-bar.tsx`
- `src/components/layout/global-search.tsx`
- `src/components/shared/fragment-card.tsx` (rewrite)
- `src/components/shared/fragment-detail.tsx`

### Modified files

- `src/app/globals.css` — Complete replacement with Downloads design tokens
- `src/app/layout.tsx` — Font change (Inter)
- `src/app/[locale]/(app)/layout.tsx` — New AppShell with Sidebar
- `src/app/[locale]/(app)/today/page.tsx` — Complete rewrite
- `src/app/[locale]/(app)/review/page.tsx` — Complete rewrite
- `src/app/[locale]/(auth)/login/page.tsx` — Complete rewrite
- `src/components/layout/app-shell.tsx` — Complete rewrite
- `src/components/layout/theme-toggle.tsx` — Style update
- `src/i18n/routing.ts` — Default locale en
- `src/messages/en.json` — Full English copy from Downloads
- `src/messages/zh.json` — Add new page keys

### Deleted files

- `src/app/[locale]/(app)/weekly/page.tsx`
- `src/app/[locale]/(app)/projects/page.tsx`
- `src/app/[locale]/(app)/inbox/page.tsx`
- `src/app/[locale]/(auth)/register/page.tsx`
- `src/components/layout/top-nav.tsx`
- `src/components/layout/command-palette.tsx`
- `src/components/shared/task-item.tsx`
- `src/components/shared/event-item.tsx`
- `src/components/shared/quick-capture.tsx`
- `src/components/shared/empty-state.tsx`

### Docs updated

- `docs/architecture/ui-design.md` — v3.0: Emerald theme, Sidebar layout, new page designs
- `docs/architecture/technical-architecture.md` — Updated route table, frontend architecture
- `CLAUDE.md` — Updated pages section, design system references

---

## 十二、Acceptance Criteria

1. Visually identical to Downloads on all 8 pages (dark theme)
2. Light theme works with emerald color variant
3. All copy/content matches Downloads exactly (via i18n en.json)
4. Sidebar navigation functional with active state highlighting
5. Mobile bottom nav works on < 1024px
6. Quick capture bar visible on all pages except Settings
7. Global search (⌘K) opens overlay with navigation items
8. Fragment detail modal opens on card click
9. Theme toggle (dark ↔ light) works
10. Auth flow: Landing → Login → Dashboard
11. Data fetched from real API via core hooks (graceful fallback when API unavailable)
12. i18n: switching to zh locale shows Chinese translations
13. `pnpm build:web` succeeds without errors
14. `pnpm lint:web` passes
