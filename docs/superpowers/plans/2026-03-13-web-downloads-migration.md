# Web Frontend Migration — Downloads UI to Next.js

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current web package UI with the Downloads ask-dorian Vite SPA design (100% visual parity), while keeping Next.js architecture + core API integration.

**Architecture:** Emerald dark-first design system with glass-panel effects. Sidebar (w-64) + Header + floating QuickCaptureBar layout. 8 pages from Downloads adapted to Next.js file-based routing with next-intl i18n. All mock data replaced by @ask-dorian/core SWR hooks.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, framer-motion, next-intl, next-themes, @ask-dorian/core (API client + SWR hooks + Zustand auth), lucide-react

**Spec:** `docs/superpowers/specs/2026-03-13-web-downloads-migration-design.md`

**Source reference:** `~/Downloads/ask-dorian/src/` — all components, styles, and copy originate here.

---

## File Structure

### New files

```
src/app/(landing)/page.tsx                      # Landing page (public, no locale prefix)
src/app/(landing)/layout.tsx                    # Landing layout (minimal, no providers)
src/app/[locale]/(app)/stream/page.tsx          # Stream (replaces inbox)
src/app/[locale]/(app)/knowledge/page.tsx       # Library
src/app/[locale]/(app)/settings/page.tsx        # Settings
src/app/[locale]/(app)/support/page.tsx         # Support & Help
src/components/layout/sidebar.tsx               # Desktop sidebar + mobile bottom nav
src/components/layout/header.tsx                # Sticky header with search, focus mode
src/components/layout/quick-capture-bar.tsx     # Floating capture bar
src/components/layout/global-search.tsx         # ⌘K search overlay
src/components/shared/fragment-card.tsx         # (rewrite) Fragment display card
src/components/shared/fragment-detail.tsx       # Fragment detail modal
```

### Modified files

```
package.json                                    # +framer-motion, -recharts/-react-day-picker/-cmdk
src/app/globals.css                             # Complete replacement → Downloads design tokens
src/app/layout.tsx                              # Font Inter, lang="en"
src/app/page.tsx                                # Redirect → /en/today (was /zh/today)
src/app/[locale]/layout.tsx                     # defaultTheme="dark"
src/app/[locale]/(app)/layout.tsx               # New AppShell with Sidebar
src/app/[locale]/(app)/today/page.tsx           # Complete rewrite → Dashboard
src/app/[locale]/(app)/review/page.tsx          # Complete rewrite → WeeklyReview
src/app/[locale]/(auth)/layout.tsx              # Downloads Login styling (full-screen dark)
src/app/[locale]/(auth)/login/page.tsx          # Complete rewrite → Downloads Login
src/components/layout/app-shell.tsx             # Rewrite → Sidebar + Header + CaptureBar
src/i18n/routing.ts                             # defaultLocale: "en"
src/messages/en.json                            # Full English copy from Downloads
src/messages/zh.json                            # Add new page keys
```

### Deleted files

```
src/app/[locale]/(app)/inbox/page.tsx           # Replaced by stream
src/app/[locale]/(app)/weekly/page.tsx          # Removed
src/app/[locale]/(app)/projects/page.tsx        # Removed
src/app/[locale]/(auth)/register/page.tsx       # Removed
src/components/layout/top-nav.tsx               # Replaced by sidebar + header
src/components/layout/command-palette.tsx        # Replaced by global-search
src/components/shared/task-item.tsx             # Not used in Downloads pages
src/components/shared/event-item.tsx            # Not used
src/components/shared/quick-capture.tsx         # Replaced by quick-capture-bar
src/components/shared/empty-state.tsx           # Not used
```

---

## Chunk 1: Foundation (Dependencies, Design Tokens, Config)

### Task 1: Update dependencies

**Files:**
- Modify: `packages/web/package.json`

- [ ] **Step 1: Add framer-motion, remove unused packages**

```bash
cd packages/web
pnpm add framer-motion
pnpm remove recharts react-day-picker cmdk
```

- [ ] **Step 2: Verify install succeeded**

Run: `pnpm ls framer-motion --depth=0`
Expected: `framer-motion` listed

- [ ] **Step 3: Commit**

```bash
git add packages/web/package.json ../../pnpm-lock.yaml
git commit -m "chore(web): add framer-motion, remove recharts/react-day-picker/cmdk"
```

---

### Task 2: Replace globals.css with Downloads design system

**Files:**
- Modify: `packages/web/src/app/globals.css`

- [ ] **Step 1: Replace globals.css**

Replace the entire file with the Downloads emerald design system. Keep the shadcn imports at top, add Downloads color tokens + custom classes:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Downloads emerald tokens */
  --color-primary: var(--primary);
  --color-bg-dark: var(--bg);
  --color-surface-dark: var(--surface);
  --color-border-dark: var(--border);
  --color-text-main: var(--text);
  --color-primary-glow: var(--primary-glow);

  /* shadcn semantic tokens (keep for ui/ components) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
}

:root {
  /* === Dark theme (default) — from Downloads === */
  --primary: #10b981;
  --primary-glow: rgba(16, 185, 129, 0.15);
  --bg: #09090b;
  --surface: #18181b;
  --border: #27272a;
  --text: #f8fafc;

  /* shadcn mapped to dark by default */
  --background: #09090b;
  --foreground: #f8fafc;
  --card: #18181b;
  --card-foreground: #f8fafc;
  --popover: #18181b;
  --popover-foreground: #f8fafc;
  --secondary: #27272a;
  --secondary-foreground: #f8fafc;
  --muted: #27272a;
  --muted-foreground: #94a3b8;
  --accent: #27272a;
  --accent-foreground: #f8fafc;
  --destructive: #ef4444;
  --input: #27272a;
  --ring: #10b981;
  --radius: 0.75rem;
}

.light {
  /* === Light theme — from Downloads === */
  --primary: #059669;
  --primary-glow: rgba(5, 150, 105, 0.1);
  --bg: #fafafa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text: #0f172a;

  /* shadcn mapped to light */
  --background: #fafafa;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --secondary: #f5f5f5;
  --secondary-foreground: #0f172a;
  --muted: #f5f5f5;
  --muted-foreground: #64748b;
  --accent: #f0fdf4;
  --accent-foreground: #0f172a;
  --destructive: #ef4444;
  --input: #e5e7eb;
  --ring: #059669;
}

@layer base {
  * {
    @apply border-border-dark outline-ring/50;
  }
  body {
    @apply bg-bg-dark text-text-main antialiased transition-colors duration-300;
  }
  html {
    @apply font-sans;
  }
}

/* --- Downloads Glass Panel --- */
.glass-panel {
  @apply bg-surface-dark/70 backdrop-blur-xl border border-border-dark/50;
}

/* --- Downloads Crystalline Gradient --- */
.crystalline-gradient {
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent),
              radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent);
}

/* --- Downloads Custom Scrollbar --- */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-border-dark rounded-full;
}

/* --- AI Shimmer Animation --- */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.ai-shimmer {
  background: linear-gradient(90deg, var(--surface) 0%, rgba(16, 185, 129, 0.15) 50%, var(--surface) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/globals.css
git commit -m "style(web): replace design system with Downloads emerald dark-first tokens"
```

---

### Task 3: Update i18n routing + root redirects

**Files:**
- Modify: `packages/web/src/i18n/routing.ts`
- Modify: `packages/web/src/app/page.tsx`
- Modify: `packages/web/src/app/layout.tsx`

- [ ] **Step 1: Change default locale to "en"**

`src/i18n/routing.ts`:
```typescript
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
})
```

- [ ] **Step 2: Update root page redirect**

`src/app/page.tsx`:
```typescript
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/en/today")
}
```

- [ ] **Step 3: Update root layout lang + font**

`src/app/layout.tsx`:
```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Dorian — Crystallize Your Thoughts",
  description:
    "Your premium AI thought partner. Capture fragments of knowledge, voice memos, and screenshots. Watch them transform into actionable insights.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Update next-themes to use `.light` class (matching Downloads)**

In `src/app/[locale]/layout.tsx`, the ThemeProvider already has `attribute="class"` and `defaultTheme="dark"`. Downloads uses `.light` class on root for light mode. We need next-themes to add `light` class for light theme instead of `dark` for dark theme.

Update the ThemeProvider value prop — no change needed since dark is default (no class) and light will add `.light` class. But we need to verify: next-themes by default adds `.dark` class. We need it to NOT add `.dark` and instead add `.light`.

Actually, the simplest approach: keep next-themes as-is with `.dark` class, but remap our CSS. In globals.css, dark is already the `:root` default, and `.light` is the override. Since next-themes adds `.dark` class but our dark styles are on `:root`, this works — `.dark` class is redundant but harmless. For light mode, next-themes removes `.dark` class, so `:root` (dark) still applies — **problem**.

**Fix**: Use `@custom-variant dark (&:is(.dark *))` which is already in globals.css. We need to swap the approach:
- `:root` = light (shadcn default)
- `.dark` = dark theme

OR keep Downloads approach but set next-themes to use `class` with value mapping.

**Simplest**: Set next-themes `themes={["light", "dark"]}` with `defaultTheme="dark"`. It adds `.dark` class. Change CSS selectors from `.light` to use the standard `.dark` approach:
- `:root` = light values
- `.dark` = dark values

This way Downloads' `:root` dark values go under `.dark`, and `.light` values go under `:root`.

Update `src/app/globals.css` `:root` and `.dark` blocks (swap them from Step 1):

```css
:root {
  /* === Light theme === */
  --primary: #059669;
  --primary-glow: rgba(5, 150, 105, 0.1);
  --bg: #fafafa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text: #0f172a;

  --background: #fafafa;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --secondary: #f5f5f5;
  --secondary-foreground: #0f172a;
  --muted: #f5f5f5;
  --muted-foreground: #64748b;
  --accent: #f0fdf4;
  --accent-foreground: #0f172a;
  --destructive: #ef4444;
  --input: #e5e7eb;
  --ring: #059669;
  --radius: 0.75rem;
}

.dark {
  /* === Dark theme (default visually) === */
  --primary: #10b981;
  --primary-glow: rgba(16, 185, 129, 0.15);
  --bg: #09090b;
  --surface: #18181b;
  --border: #27272a;
  --text: #f8fafc;

  --background: #09090b;
  --foreground: #f8fafc;
  --card: #18181b;
  --card-foreground: #f8fafc;
  --popover: #18181b;
  --popover-foreground: #f8fafc;
  --secondary: #27272a;
  --secondary-foreground: #f8fafc;
  --muted: #27272a;
  --muted-foreground: #94a3b8;
  --accent: #27272a;
  --accent-foreground: #f8fafc;
  --destructive: #ef4444;
  --input: #27272a;
  --ring: #10b981;
}
```

This is **incompatible with Task 2 Step 1** — need to merge. Update Task 2 to use `:root` = light, `.dark` = dark from the start.

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/i18n/routing.ts packages/web/src/app/page.tsx packages/web/src/app/layout.tsx packages/web/src/app/globals.css
git commit -m "config(web): default locale en, dark theme, Inter font, emerald tokens"
```

---

### Task 4: Update i18n message files

**Files:**
- Modify: `packages/web/src/messages/en.json`
- Modify: `packages/web/src/messages/zh.json`

- [ ] **Step 1: Replace en.json with full Downloads copy**

All English text extracted verbatim from Downloads components:

```json
{
  "nav": {
    "today": "Today",
    "stream": "Stream",
    "library": "Library",
    "review": "Review",
    "settings": "Settings",
    "support": "Help Center",
    "whatsNew": "What's New",
    "mainNavigation": "Main Navigation"
  },
  "landing": {
    "philosophy": "Philosophy",
    "features": "Features",
    "pricing": "Pricing",
    "signIn": "Sign In",
    "badge": "Fragment-First Philosophy",
    "headline": "CRYSTALLIZE",
    "headlineGradient": "YOUR THOUGHTS",
    "subtitle": "Dorian is your premium AI thought partner. Capture fragments of knowledge, voice memos, and screenshots. Watch them transform into actionable insights.",
    "cta": "Start Your Flow",
    "demo": "Watch Demo",
    "instantExtraction": "Instant Extraction",
    "instantExtractionDesc": "AI identifies tasks from voice memos in milliseconds.",
    "contextAware": "Context Aware",
    "contextAwareDesc": "Dorian remembers your projects and previous fragments.",
    "copyright": "Dorian AI © 2024",
    "privacy": "Privacy",
    "terms": "Terms",
    "security": "Security"
  },
  "login": {
    "back": "Back to home",
    "welcome": "Welcome Back",
    "subtitle": "Sign in to your crystalline flow.",
    "continueEmail": "Continue with Email",
    "divider": "Or continue with",
    "github": "Github",
    "google": "Google",
    "agreement": "By continuing, you agree to Dorian's",
    "termsOfService": "Terms of Service",
    "and": "and",
    "privacyPolicy": "Privacy Policy"
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password",
    "loginError": "Invalid email or password"
  },
  "today": {
    "greeting": "Good Morning, Dorian",
    "date": "Tuesday, Oct 24",
    "aiSummaryBadge": "AI Morning Summary",
    "aiSummary": "You have <strong>4 deep-work sessions</strong> scheduled. Your energy peak is predicted at <strong>10 AM</strong>. Priority: <u>Finish the UI Refinement</u> before 12:00.",
    "fullBriefing": "Full Briefing",
    "morningRitual": "Morning Ritual",
    "done": "Done",
    "addElement": "Add Element",
    "dailyTimeline": "Daily Timeline",
    "dropToTimebox": "Drop task to timebox",
    "completed": "Completed",
    "focusScore": "Focus Score",
    "deepWork": "Deep Work",
    "tasksDone": "Tasks Done",
    "energyPeak": "Energy Peak"
  },
  "stream": {
    "title": "Stream",
    "subtitle": "Real-time AI processing of your incoming data.",
    "allFragments": "All Fragments",
    "pendingReview": "Pending Review",
    "processed": "Processed",
    "dropMore": "Drop more fragments",
    "dropMoreDesc": "Dorian will automatically extract tasks and data for you."
  },
  "knowledge": {
    "title": "Library",
    "subtitle": "AI-curated fragments of your collective intelligence.",
    "searchPlaceholder": "Search your knowledge base...",
    "filter": "Filter",
    "noResults": "No fragments found matching"
  },
  "review": {
    "title": "Review",
    "subtitle": "Your accomplishments, delayed tasks, and key insights from the past week.",
    "share": "Share",
    "exportReport": "Export Report",
    "focusScore": "Focus Score",
    "aboveAverage": "Above average (88)",
    "deepWork": "Deep Work",
    "deepWorkTarget": "Target: 20 hrs/week",
    "completed": "Completed",
    "completionRate": "82% completion rate",
    "focusIntensity": "Focus Intensity Over Time",
    "deep": "Deep",
    "shallow": "Shallow",
    "keyAccomplishments": "Key Accomplishments",
    "upcomingFocus": "Upcoming Focus",
    "weeklyInsightTitle": "Dorian's Weekly Insight",
    "weeklyInsightBody": "Your productivity peaked on Thursday during the deep work session. I noticed a pattern: your most complex tasks are resolved faster when preceded by a 15-minute meditation.\n\nNext week, I suggest scheduling your \"Board Meeting Prep\" for Thursday morning to leverage this high-performance window.",
    "viewPatterns": "View detailed productivity patterns"
  },
  "settings": {
    "premiumMember": "Premium Member",
    "accountSecurity": "Account & Security",
    "profileInfo": "Profile Information",
    "securityPrivacy": "Security & Privacy",
    "twoFactorActive": "Two-factor authentication active",
    "customIcons": "Custom Icons",
    "customIconsDesc": "Upload or select custom icons for fragments",
    "subscription": "Subscription",
    "subscriptionDesc": "Active • Pro Plan ($12/mo)",
    "aiPreferences": "AI Preferences",
    "classificationThreshold": "Classification Threshold",
    "classificationThresholdDesc": "Determines AI confidence for auto-sorting.",
    "customizeThreshold": "Customize Threshold",
    "autoCrystallize": "Auto-Crystallize",
    "autoCrystallizeDesc": "Automatically process fragments after 5 mins.",
    "system": "System",
    "notifications": "Notifications",
    "notificationsDesc": "Push, Email, and Slack",
    "language": "Language & Region",
    "languageDesc": "English (US) • UTC-7",
    "connectedDevices": "Connected Devices",
    "connectedDevicesDesc": "iPhone 15 Pro, MacBook Pro",
    "dataManagement": "Data Management",
    "dataManagementDesc": "Export or delete your data",
    "signOut": "Sign Out",
    "version": "Dorian AI v2.4.0-stable",
    "buildId": "Build ID: 8f2c9a1",
    "granularTitle": "Granular Threshold Control",
    "granularDesc": "Fine-tune the AI classification sensitivity.",
    "precisionValue": "Precision Value",
    "directInput": "Direct Input",
    "sensitivity": "Sensitivity",
    "ultraHigh": "Ultra High",
    "balanced": "Balanced",
    "highRecall": "High Recall",
    "savePreferences": "Save Preferences"
  },
  "support": {
    "title": "How can we help?",
    "subtitle": "Find answers, learn best practices, or get in touch with our team to optimize your workflow.",
    "searchPlaceholder": "Search help articles...",
    "documentation": "Documentation",
    "documentationDesc": "Detailed guides on how to use Dorian to its full potential.",
    "faq": "FAQ",
    "faqDesc": "Quick answers to the most common questions.",
    "privacySecurity": "Privacy & Security",
    "privacySecurityDesc": "Learn how we protect your collective intelligence.",
    "directSupport": "Direct Support",
    "directSupportDesc": "Get in touch with our human support team.",
    "suggestionTitle": "Have a suggestion?",
    "suggestionDesc": "We're constantly evolving Dorian based on user feedback. Tell us what you'd like to see next.",
    "sendFeedback": "Send Feedback",
    "systemStatus": "System Status",
    "allOperational": "All Systems Operational",
    "neuralEngine": "Neural Engine",
    "fragmentExtraction": "Fragment Extraction",
    "cloudSync": "Cloud Sync",
    "searchIndexing": "Search Indexing",
    "termsOfService": "Terms of Service",
    "privacyPolicy": "Privacy Policy",
    "cookiePolicy": "Cookie Policy"
  },
  "capture": {
    "placeholder": "Ask Dorian or capture a fragment...",
    "process": "Process",
    "search": "Search",
    "neuralEngine": "Neural Engine Active"
  },
  "search": {
    "placeholder": "Search fragments, navigation, settings...",
    "navigate": "to navigate",
    "select": "to select",
    "globalSearch": "Dorian Global Search",
    "navigation": "navigation",
    "fragment": "fragment",
    "noResults": "No results found for"
  },
  "sidebar": {
    "dailyGoal": "Daily Goal",
    "dailyGoalProgress": "5 of 8 Deep Work units complete",
    "proPlan": "Pro Plan"
  },
  "header": {
    "focusMode": "Focus Mode",
    "focusActive": "Focus Active",
    "searchPlaceholder": "Search..."
  },
  "fragment": {
    "aiExtracting": "AI Extraction in Progress",
    "knowledgeExtracted": "Knowledge Extracted",
    "fragmentAnalysis": "Fragment Analysis",
    "identifying": "Dorian is identifying actionable insights...",
    "viewDetails": "View Details",
    "deleteFragment": "Delete Fragment",
    "saveChanges": "Save Changes",
    "originalInput": "Original Input",
    "actionableTasks": "Actionable Tasks",
    "noTasks": "No tasks identified in this fragment.",
    "contextTags": "Context & Tags",
    "captured": "Captured"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "share": "Share"
  }
}
```

- [ ] **Step 2: Update zh.json with matching keys**

Add all new keys with Chinese translations. Keep existing translations, add new ones for stream, knowledge, settings, support, landing, login, capture, search, sidebar, header, fragment sections.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/messages/
git commit -m "i18n(web): full English copy from Downloads + matching Chinese keys"
```

---

## Chunk 2: Layout Components

### Task 5: Create Sidebar component

**Files:**
- Create: `packages/web/src/components/layout/sidebar.tsx`

- [ ] **Step 1: Create sidebar.tsx**

Port Downloads `Sidebar.tsx` to Next.js:
- Replace `setScreen()` navigation with next-intl `Link` + `usePathname()`
- Replace hardcoded labels with `useTranslations("nav")` / `useTranslations("sidebar")`
- Keep all CSS classes, icons, layout structure identical to Downloads
- Desktop sidebar (w-64, hidden lg:flex) + mobile bottom nav (lg:hidden fixed bottom)
- Nav items: Today → `/today`, Stream → `/stream`, Library → `/knowledge`, Review → `/review`
- Support: Help Center → `/support`, What's New (non-functional)
- Footer: Daily Goal progress, Settings → `/settings`, User profile + Logout

Key adaptations:
- `currentScreen === item.id` → `pathname.includes(item.href)`
- `setScreen('dashboard')` → `<Link href="/today">`
- User name/avatar from `useAuth()` instead of hardcoded "Alex Johnson"
- Logout button calls `useAuth(s => s.logout)` + `router.push("/")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/layout/sidebar.tsx
git commit -m "feat(web): add Sidebar component from Downloads"
```

---

### Task 6: Create Header component

**Files:**
- Create: `packages/web/src/components/layout/header.tsx`

- [ ] **Step 1: Create header.tsx**

Port Downloads `Header.tsx`:
- Props: `title: string`, `subtitle?: string`
- Focus Mode toggle (client state)
- Search bar (desktop, triggers GlobalSearch open via callback)
- Theme toggle using `next-themes` `useTheme()` instead of Downloads ThemeContext
- Notifications bell with dot indicator (from `useUnreadCount()` or hardcoded dot)
- User avatar (mobile only, from auth)
- All CSS classes identical to Downloads

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/layout/header.tsx
git commit -m "feat(web): add Header component from Downloads"
```

---

### Task 7: Create QuickCaptureBar component

**Files:**
- Create: `packages/web/src/components/layout/quick-capture-bar.tsx`

- [ ] **Step 1: Create quick-capture-bar.tsx**

Extract the capture bar JSX from Downloads `App.tsx` (lines 188-256):
- Sparkles icon + text input + Image/Mic buttons + Process button
- Below: ⌘K search hint + "Neural Engine Active" indicator
- framer-motion `motion.div` with `layout` prop
- Input calls `fragmentApi.create()` on Enter/Process click
- Processing state: spinner animation
- Props: `onSearchOpen: () => void`
- i18n: `useTranslations("capture")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/layout/quick-capture-bar.tsx
git commit -m "feat(web): add QuickCaptureBar component from Downloads"
```

---

### Task 8: Create GlobalSearch component

**Files:**
- Create: `packages/web/src/components/layout/global-search.tsx`

- [ ] **Step 1: Create global-search.tsx**

Port Downloads `GlobalSearch.tsx`:
- Props: `isOpen: boolean`, `onClose: () => void`
- framer-motion AnimatePresence for enter/exit
- Search input with focus styling
- Results: navigation items (Dashboard, Library, Review, Settings) + mock fragments
- Keyboard hint footer (↑↓ navigate, ↵ select)
- Navigation uses next-intl `useRouter()` + `router.push()`
- i18n: `useTranslations("search")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/layout/global-search.tsx
git commit -m "feat(web): add GlobalSearch overlay component from Downloads"
```

---

### Task 9: Rewrite AppShell + app layout

**Files:**
- Modify: `packages/web/src/components/layout/app-shell.tsx`
- Modify: `packages/web/src/app/[locale]/(app)/layout.tsx`

- [ ] **Step 1: Rewrite app-shell.tsx**

Replace TopNav-based shell with Sidebar + Header + CaptureBar + GlobalSearch:

```typescript
"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { QuickCaptureBar } from "./quick-capture-bar"
import { GlobalSearch } from "./global-search"
import { FragmentDetail } from "../shared/fragment-detail"

// Page title mapping based on pathname
function usePageMeta(pathname: string) {
  const t = useTranslations()
  // Map pathname segments to titles
  if (pathname.includes("/today")) return { title: t("today.greeting"), subtitle: t("today.date") }
  if (pathname.includes("/stream")) return { title: t("stream.title"), subtitle: "Live" }
  if (pathname.includes("/knowledge")) return { title: t("knowledge.title") }
  if (pathname.includes("/review")) return { title: t("review.title") }
  if (pathname.includes("/settings")) return { title: t("settings.title") }
  if (pathname.includes("/support")) return { title: t("support.title") }
  return { title: "Ask Dorian" }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { title, subtitle } = usePageMeta(pathname)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedFragment, setSelectedFragment] = useState(null)

  const isSettingsPage = pathname.includes("/settings")

  // ⌘K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark text-text-main font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <Header
          title={title}
          subtitle={subtitle}
          onSearchOpen={() => setIsSearchOpen(true)}
        />

        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0 h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {!isSettingsPage && (
          <QuickCaptureBar onSearchOpen={() => setIsSearchOpen(true)} />
        )}

        <GlobalSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <FragmentDetail
          fragment={selectedFragment}
          onClose={() => setSelectedFragment(null)}
        />
      </main>
    </div>
  )
}
```

Note: `settings.title` key doesn't exist yet in i18n — the `usePageMeta` hook will need a fallback or the settings page title can be hardcoded as "Settings" initially. We'll add all keys in Task 4.

- [ ] **Step 2: Keep (app)/layout.tsx as-is** — it already uses AppShell correctly. No change needed.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/layout/app-shell.tsx
git commit -m "feat(web): rewrite AppShell with Sidebar + Header + CaptureBar layout"
```

---

### Task 10: Update auth layout

**Files:**
- Modify: `packages/web/src/app/[locale]/(auth)/layout.tsx`

- [ ] **Step 1: Update auth layout to match Downloads Login styling**

Replace the centered white card layout with Downloads' full-screen dark background:

```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useAuth } from "@/providers/auth-provider"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/today")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  return <>{children}</>
}
```

The Login page itself will handle its own full-screen layout (matching Downloads).

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(auth)/layout.tsx
git commit -m "refactor(web): simplify auth layout, login page handles own layout"
```

---

## Chunk 3: Pages (Part 1 — Landing, Login, Today)

### Task 11: Create Landing page

**Files:**
- Create: `packages/web/src/app/(landing)/layout.tsx`
- Create: `packages/web/src/app/(landing)/page.tsx`
- Modify: `packages/web/src/app/page.tsx`

- [ ] **Step 1: Create landing layout**

`src/app/(landing)/layout.tsx` — minimal layout, no locale providers (landing is static):

```typescript
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

- [ ] **Step 2: Create landing page**

`src/app/(landing)/page.tsx` — port Downloads `Landing.tsx` verbatim:
- Nav: Diamond logo + "Dorian" + links + "Sign In" → `/en/login`
- Hero: badge, "CRYSTALLIZE YOUR THOUGHTS" gradient heading, subtitle, CTA buttons
- App preview image + floating feature cards
- Footer
- framer-motion animations (initial/animate)
- All copy hardcoded in English (landing is not i18n'd — single language marketing page)
- "Start Your Flow" → `/en/login`, "Sign In" → `/en/login`

- [ ] **Step 3: Update root page.tsx**

Since landing is now at `/(landing)/page.tsx`, remove the redirect from `src/app/page.tsx` — it's now handled by the (landing) route group. Actually, Next.js route groups `(landing)` still match `/`. So `src/app/page.tsx` and `src/app/(landing)/page.tsx` would conflict.

**Better approach**: Just make `src/app/page.tsx` the landing page directly (no route group needed).

Delete the `(landing)` route group idea. Instead, rewrite `src/app/page.tsx` as the landing page. It doesn't need i18n or auth providers since it's a static marketing page.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/page.tsx
git commit -m "feat(web): add Landing page from Downloads"
```

---

### Task 12: Rewrite Login page

**Files:**
- Modify: `packages/web/src/app/[locale]/(auth)/login/page.tsx`

- [ ] **Step 1: Rewrite login page**

Port Downloads `Login.tsx`:
- Full-screen dark bg with gradient lines and decorative orb
- Diamond logo (size-16)
- "Welcome Back" + "Sign in to your crystalline flow."
- "Continue with Email" button → shows inline email/password form (extend beyond Downloads mock)
- "Or continue with" divider + Github/Google buttons
- Terms agreement text
- "Back to home" → `/` (landing)
- framer-motion entrance animation
- Auth logic: `useAuth(s => s.login)` for email/password, `useAuth(s => s.googleOAuth)` for Google (if implemented)
- i18n: `useTranslations("login")`

Adaptation from Downloads: The Downloads Login only has mock buttons (onClick → setScreen). We need to add actual form state for email/password when "Continue with Email" is clicked (show input fields, submit calls auth store).

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(auth)/login/page.tsx
git commit -m "feat(web): rewrite Login page with Downloads design"
```

---

### Task 13: Rewrite Today/Dashboard page

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/today/page.tsx`

- [ ] **Step 1: Rewrite today page**

Port Downloads `Dashboard.tsx`:
- AI Summary Banner (emerald accent card with gradient blob)
- Morning Ritual checklist (4 items, local state toggles — not API-backed yet)
- Daily Timeline (grid with time blocks, current time indicator, drop zones)
- Stats grid (4 columns: Focus Score, Deep Work, Tasks Done, Energy Peak)
- All CSS classes identical to Downloads
- Use `useTodayDashboard()` hook for real data where available, fallback to Downloads mock data
- i18n: `useTranslations("today")`

Data mapping:
- Stats: if `dashboardData` available, use `dashboardData.stats.taskCounts` for "Tasks Done", else mock "14/22"
- Events: if `dashboardData?.events`, render in timeline, else mock timeline
- Morning Ritual: client-only state (no API)

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/today/page.tsx
git commit -m "feat(web): rewrite Today dashboard with Downloads design"
```

---

## Chunk 4: Pages (Part 2 — Stream, Knowledge, Review)

### Task 14: Create Stream page

**Files:**
- Create: `packages/web/src/app/[locale]/(app)/stream/page.tsx`

- [ ] **Step 1: Create stream page**

Port Downloads `FragmentStream.tsx`:
- Header: "Stream" title + subtitle
- View toggle: List/Grid
- Tabs: "All Fragments", "Pending Review", "Processed"
- Fragment cards using FragmentCard component
- Drop zone at bottom
- Data: `useFragments()` hook for real fragment list
- Click card → open FragmentDetail modal (via AppShell state or context)
- i18n: `useTranslations("stream")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/stream/page.tsx
git commit -m "feat(web): add Fragment Stream page from Downloads"
```

---

### Task 15: Create Library page

**Files:**
- Create: `packages/web/src/app/[locale]/(app)/knowledge/page.tsx`

- [ ] **Step 1: Create knowledge page**

Port Downloads `KnowledgeLibrary.tsx`:
- Header with Grid/List toggle + Filter dropdown
- Search bar with loading spinner (debounced 600ms)
- Card grid/list with project badge, type icon, title, summary, tags
- Filter by type: all/thought/screenshot/voice/link
- Data: `useKnowledge()` hook for real data, fallback to Downloads mock 6 cards
- Click card → open FragmentDetail
- i18n: `useTranslations("knowledge")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/knowledge/page.tsx
git commit -m "feat(web): add Knowledge Library page from Downloads"
```

---

### Task 16: Rewrite Review page

**Files:**
- Modify: `packages/web/src/app/[locale]/(app)/review/page.tsx`

- [ ] **Step 1: Rewrite review page**

Port Downloads `WeeklyReview.tsx`:
- Header: "Review" + subtitle + Share/Export buttons
- 3 stat cards: Focus Score, Deep Work, Completed
- Focus Intensity bar chart (pure CSS, 7 bars Mon-Sun)
- Key Accomplishments (4 items)
- Upcoming Focus (4 items)
- Dorian's Weekly Insight card with gradient blob
- Data: `useWeekReview()` hook for real stats, fallback to Downloads mock data
- framer-motion on insight card
- i18n: `useTranslations("review")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/review/page.tsx
git commit -m "feat(web): rewrite Review page with Downloads design"
```

---

## Chunk 5: Pages (Part 3 — Settings, Support) + Shared Components

### Task 17: Create Settings page

**Files:**
- Create: `packages/web/src/app/[locale]/(app)/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Port Downloads `Settings.tsx`:
- Profile card (avatar + name + "Premium Member")
- Account & Security section (4 SettingItem rows)
- AI Preferences: Classification Threshold slider + Auto-Crystallize toggle
- Granular Threshold modal (framer-motion AnimatePresence)
- System section (4 SettingItem rows)
- Sign Out button (red) → `useAuth(s => s.logout)`
- Version footer
- User data from `useAuth()` / `useUser()` where available
- i18n: `useTranslations("settings")`

Include the `SettingItem` sub-component inline (same file, not exported — matches Downloads pattern).

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/settings/page.tsx
git commit -m "feat(web): add Settings page from Downloads"
```

---

### Task 18: Create Support page

**Files:**
- Create: `packages/web/src/app/[locale]/(app)/support/page.tsx`

- [ ] **Step 1: Create support page**

Port Downloads `Support.tsx`:
- Hero: "How can we help?" + search bar
- 4-category grid (Documentation/FAQ/Privacy/Direct Support) with staggered framer-motion entrance
- Feedback section with CTA
- System Status grid (4 services, operational/degraded indicators)
- Footer links (Terms/Privacy/Cookie)
- i18n: `useTranslations("support")`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/app/[locale]/(app)/support/page.tsx
git commit -m "feat(web): add Support page from Downloads"
```

---

### Task 19: Rewrite FragmentCard component

**Files:**
- Modify: `packages/web/src/components/shared/fragment-card.tsx`

- [ ] **Step 1: Rewrite fragment-card.tsx**

Port Downloads `FragmentCard.tsx`:
- Visual/source area (left 1/3) with type icon or image
- Content area (right 2/3) with AI extraction status, title, quoted content, calendar/tasks, tags
- Footer: tags + bookmark/more/view details buttons
- All CSS classes identical to Downloads
- Map `@ask-dorian/core` Fragment type to Downloads display:
  - `contentType` → icon (Mic/ImageIcon/LinkIcon/Sparkles)
  - `status`: 'processing' → "AI Extraction in Progress", 'processed' → "Knowledge Extracted"
  - `rawContent` → quoted content block
  - `normalizedContent` / `metadata.extractedData` → title, tasks, tags, calendarEvent
- Props: `fragment: Fragment` (from core types), `onClick?: () => void`

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/shared/fragment-card.tsx
git commit -m "feat(web): rewrite FragmentCard with Downloads design"
```

---

### Task 20: Create FragmentDetail component

**Files:**
- Create: `packages/web/src/components/shared/fragment-detail.tsx`

- [ ] **Step 1: Create fragment-detail.tsx**

Port Downloads `FragmentDetail.tsx`:
- Full overlay modal (framer-motion AnimatePresence)
- 2-column: visual side (2/5) + content side (3/5)
- Header: type icon + title + timestamp + bookmark/close buttons
- Original Input section
- Actionable Tasks + Context & Tags sections (2-col grid)
- Footer: Delete / Share / Save Changes buttons
- Props: `fragment: Fragment | null`, `onClose: () => void`
- Delete calls `fragmentApi.delete()`
- All CSS classes identical to Downloads

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/shared/fragment-detail.tsx
git commit -m "feat(web): add FragmentDetail modal component from Downloads"
```

---

## Chunk 6: Cleanup + Docs + Verification

### Task 21: Delete old files

**Files:**
- Delete: `packages/web/src/app/[locale]/(app)/inbox/page.tsx`
- Delete: `packages/web/src/app/[locale]/(app)/weekly/page.tsx`
- Delete: `packages/web/src/app/[locale]/(app)/projects/page.tsx`
- Delete: `packages/web/src/app/[locale]/(auth)/register/page.tsx`
- Delete: `packages/web/src/components/layout/top-nav.tsx`
- Delete: `packages/web/src/components/layout/command-palette.tsx`
- Delete: `packages/web/src/components/shared/task-item.tsx`
- Delete: `packages/web/src/components/shared/event-item.tsx`
- Delete: `packages/web/src/components/shared/quick-capture.tsx`
- Delete: `packages/web/src/components/shared/empty-state.tsx`

- [ ] **Step 1: Delete all old files**

```bash
cd packages/web/src
rm app/\[locale\]/\(app\)/inbox/page.tsx
rm app/\[locale\]/\(app\)/weekly/page.tsx
rm app/\[locale\]/\(app\)/projects/page.tsx
rm app/\[locale\]/\(auth\)/register/page.tsx
rm components/layout/top-nav.tsx
rm components/layout/command-palette.tsx
rm components/shared/task-item.tsx
rm components/shared/event-item.tsx
rm components/shared/quick-capture.tsx
rm components/shared/empty-state.tsx
```

- [ ] **Step 2: Remove empty directories**

```bash
rmdir app/\[locale\]/\(app\)/inbox 2>/dev/null
rmdir app/\[locale\]/\(app\)/weekly 2>/dev/null
rmdir app/\[locale\]/\(app\)/projects 2>/dev/null
rmdir app/\[locale\]/\(auth\)/register 2>/dev/null
```

- [ ] **Step 3: Remove unused shadcn/ui command component**

Since we removed `cmdk` dependency, check if `components/ui/command.tsx` imports from cmdk. If so, delete it too.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(web): remove old pages and components replaced by Downloads design"
```

---

### Task 22: Update documentation

**Files:**
- Modify: `docs/architecture/ui-design.md`
- Modify: `docs/architecture/technical-architecture.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update ui-design.md to v3.0**

Major changes:
- Design direction: Emerald dark-first with glass-panel effects (not neutral)
- Color system: Emerald #10b981 primary (dark) / #059669 (light)
- Layout: Sidebar (w-64) + Header + floating QuickCaptureBar (not TopNav)
- Typography: Inter font, font-black headings, uppercase tracking micro-labels
- Visual effects: glass-panel, crystalline-gradient, custom-scrollbar
- Animation: framer-motion page transitions + modals + hover
- Pages: 8 pages (Landing, Login, Today, Stream, Knowledge, Review, Settings, Support)
- Remove: Weekly, Projects, Inbox page designs
- Add: Landing, Stream, Knowledge, Settings, Support page designs

- [ ] **Step 2: Update technical-architecture.md route table**

Update the frontend route table in the "前端页面与路由" section to reflect new 8-page structure. Remove references to weekly/projects/inbox routes.

- [ ] **Step 3: Update CLAUDE.md Pages section**

Replace the MVP/Extended pages tables with new 8-page structure. Update monorepo structure. Update design system references.

- [ ] **Step 4: Commit**

```bash
git add docs/ CLAUDE.md
git commit -m "docs: update ui-design v3.0, technical architecture, CLAUDE.md for Downloads migration"
```

---

### Task 23: Build + Lint verification

- [ ] **Step 1: Run lint**

```bash
cd packages/web && pnpm lint
```

Expected: No errors. Fix any TypeScript or ESLint issues.

- [ ] **Step 2: Run build**

```bash
cd packages/web && pnpm build
```

Expected: Build succeeds. Fix any build errors (missing imports, type errors, etc.)

- [ ] **Step 3: Run dev server and manually verify**

```bash
cd packages/web && pnpm dev
```

Check:
- Landing page at `http://localhost:3001/` — Downloads design, dark theme
- Login at `/en/login` — Downloads design with auth form
- Dashboard at `/en/today` — after login, Sidebar + Header + AI Summary + Ritual + Timeline
- Stream at `/en/stream` — Tabs + fragment cards
- Knowledge at `/en/knowledge` — Search + grid + filter
- Review at `/en/review` — Stats + bar chart + accomplishments
- Settings at `/en/settings` — Profile + AI prefs + system
- Support at `/en/support` — Help categories + system status
- ⌘K opens GlobalSearch overlay
- Theme toggle switches light/dark
- Mobile responsive: sidebar hidden, bottom nav visible

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix(web): resolve build/lint issues from migration"
```
