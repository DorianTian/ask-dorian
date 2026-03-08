---
name: setup-project
description: Initialize or scaffold packages/modules in the Ask Dorian monorepo. Covers Next.js 16 + React 19 + Tailwind 4 + shadcn/ui + next-intl i18n setup, including project config files, directory structure, shadcn component installation, and i18n wiring. Trigger when user asks to create a new package, scaffold a module, init project, or set up the tech stack.
user-invocable: true
---

# Ask Dorian — Project Scaffolding Skill

Set up or extend packages in the Ask Dorian pnpm monorepo.

## Arguments

$ARGUMENTS

If no arguments provided, default to scaffolding the full `packages/prototype` package.

## Tech Stack Reference

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui (base-nova style) | latest |
| Icons | Lucide React | latest |
| Charts | Recharts | 2.x |
| i18n | next-intl | latest |
| Package Manager | pnpm (monorepo) | 10.x |
| Linting | ESLint + eslint-config-next | 9.x |

## Scaffolding Checklist

When creating a new package (e.g., `packages/prototype`), generate the following:

### 1. Root Config (if not exists)

- `pnpm-workspace.yaml` — declare `packages/*`
- `package.json` — root with `private: true`, workspace scripts
- `.gitignore` — node_modules, .next, .env*, dist, etc.

### 2. Package Config Files

- `package.json` — name `@ask-dorian/<pkg>`, scripts (dev/build/start/lint)
- `tsconfig.json` — strict, paths `@/*` → `./src/*`, Next.js plugin
- `next.config.ts` — with `next-intl` plugin, i18n config
- `postcss.config.mjs` — `@tailwindcss/postcss`
- `eslint.config.mjs` — next core-web-vitals + typescript
- `components.json` — shadcn config (base-nova, neutral, CSS variables)

### 3. Directory Structure

```
src/
├── app/
│   ├── [locale]/           # i18n dynamic segment
│   │   ├── layout.tsx      # Root layout with locale provider
│   │   ├── page.tsx        # Redirect to /today
│   │   ├── today/page.tsx
│   │   ├── inbox/page.tsx
│   │   ├── weekly/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── review/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── knowledge/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   └── account/page.tsx
│   │   └── notifications/page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── layout-shell.tsx
│   │   └── app-sidebar.tsx
│   └── ui/                 # shadcn components (installed via CLI)
├── lib/
│   ├── mock-data.ts
│   ├── types.ts
│   └── utils.ts
├── i18n/
│   ├── request.ts          # next-intl getRequestConfig
│   └── routing.ts          # locale routing config
└── messages/
    ├── en.json
    └── zh.json
```

### 4. i18n Setup (next-intl)

- **Routing**: `/[locale]/...` pattern with middleware redirect
- **Default locale**: `zh`
- **Supported locales**: `['zh', 'en']`
- **Message files**: `src/messages/zh.json`, `src/messages/en.json`
- **Middleware**: `middleware.ts` at package root for locale detection
- **Config**: `src/i18n/request.ts` for `getRequestConfig`
- **Provider**: `NextIntlClientProvider` in `[locale]/layout.tsx`

### 5. shadcn/ui Components to Install

Minimum set for prototype:
```
button card badge tabs table separator avatar dropdown-menu
sidebar sheet scroll-area tooltip input textarea select
checkbox switch label dialog popover command calendar
skeleton progress slider radio-group chart
```

Install via: `pnpm dlx shadcn@latest add <component> --cwd packages/prototype`

### 6. Global CSS

Copy the CSS variables setup from aix-ops-hub's `globals.css`:
- Light/dark theme variables (oklch color space)
- Sidebar variables
- Chart color variables
- Border radius variables
- Font variables (Geist Sans + Geist Mono)

## Page Skeleton Pattern

Each page should follow this pattern (matching aix-ops-hub style):

```tsx
"use client"

import { useTranslations } from 'next-intl'
// ... imports

export default function PageName() {
  const t = useTranslations('pageName')

  return (
    <div className="space-y-6">
      {/* Page content with mock data */}
    </div>
  )
}
```

## Layout Pattern

- `LayoutShell`: SidebarProvider + SidebarInset + header (with SidebarTrigger + page title + locale switcher)
- `AppSidebar`: Collapsible sidebar with nav items, user menu footer, branding header
- Header should include a language switcher (zh/en toggle)

## MVP Marker Convention

Pages that are part of MVP should have a comment at the top:
```tsx
// @MVP - Phase 1
```

Non-MVP pages should have:
```tsx
// @Phase2+
```

## Post-Scaffold Verification

After scaffolding, verify:
1. `pnpm install` succeeds
2. `pnpm --filter prototype dev` starts without errors
3. All routes render placeholder content
4. Language switching works (zh ↔ en)
5. Sidebar navigation works
6. Dark mode toggle works (if included)
