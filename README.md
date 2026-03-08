<p align="center">
  <h1 align="center">Ask Dorian</h1>
  <p align="center"><strong>Master Your Fragments</strong> — Turn fragmented inputs into actionable results, automatically.</p>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## What is Ask Dorian?

A fragment-driven personal execution hub. Capture anything — text, voice, links, screenshots — and let AI automatically structure it into tasks, schedules, knowledge, and next actions.

**Not** a note-taking app. **Not** a generic workspace. It's about one thing: **fragments in, executable output out.**

```
Fragment Input → AI Skills → Tasks / Schedules / Knowledge → Execute → Review
```

## Product Showcase

### Today's Dashboard

Your daily command center — tasks, schedule, pending fragments, focus time. Everything you need, zero context switching.

![Today's Dashboard](docs/screenshots/01-today.png)

### Fragment Hub (Inbox)

The core entry point. Throw in anything — text, voice, documents, screenshots, links. Pick an AI skill, hit process. The AI pipeline handles classification, entity extraction, and action generation automatically.

![Fragment Hub](docs/screenshots/02-inbox.png)

### AI Skills

Define how AI processes your fragments. 5 built-in skills (Smart Classify, Meeting Notes, Link Summary, Schedule Extract, Task Decompose) + custom skills with editable processing pipelines.

![AI Skills](docs/screenshots/03-skills.png)

### Projects

Tasks, knowledge, and events organized by project context. Progress tracking, Kanban view, and activity timeline built in.

![Projects](docs/screenshots/04-projects.png)

---

## Core Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────┐
│  Capture     │───→│  AI Process   │───→│  Structured     │───→│  Execute  │
│              │    │              │    │  Output         │    │          │
│ Text/Voice/  │    │ Classify +   │    │ Tasks +         │    │ Today +  │
│ Doc/Screenshot│   │ Extract +    │    │ Schedules +     │    │ Calendar │
│ /Link        │    │ Generate     │    │ Knowledge       │    │ + Review │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| **Multi-modal Capture** | Text / voice / documents / screenshots / links — one entry |
| **AI Processing Pipeline** | 6-step pipeline: analyze → classify → extract → generate → link → validate |
| **Configurable AI Skills** | Default + custom skills with editable pipeline steps |
| **Today's Dashboard** | Tasks, schedule, pending fragments, focus time in one view |
| **Project Context** | Fragments auto-linked to projects for long-term traceability |
| **Weekly Review** | Auto-summarize: completed, delayed, decisions, knowledge |
| **Morning Plan + Evening Review** | Daily ritual for planning and reflection |
| **i18n** | Chinese / English |
| **Command Palette** | `Cmd+K` quick capture, search, navigation |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui (base-nova) |
| Icons | Lucide React |
| Charts | Recharts |
| i18n | next-intl |
| Formatting | Prettier (OpenMetadata rules) |
| Backend | Node.js (Koa.js) — planned |
| Database | MySQL 8.0 — planned |
| AI | Claude API (Sonnet) — planned |
| Deployment | AWS EC2 + RDS + Cloudflare + PM2 |

## Architecture

```
askdorian.com ──\                     /──→ Next.js (:3000)
                 → Cloudflare → EC2 Nginx
aix-hub.com ────/                     \──→ Koa.js API (:4000)
                                            │
                                       RDS MySQL 8.0
```

## Getting Started

```bash
# Clone
git clone https://github.com/your-username/ask-dorian.git
cd ask-dorian

# Install dependencies
pnpm install

# Run showcase (UI prototype)
pnpm dev:showcase

# Open http://localhost:3000
```

## Project Structure

```
ask-dorian/
├── packages/
│   └── showcase/              # UI prototype (27+ routes)
│       ├── src/
│       │   ├── app/[locale]/  # Pages with i18n routing
│       │   ├── components/    # Layout + shadcn/ui (28 components)
│       │   ├── lib/           # Mock data, types, utils
│       │   ├── i18n/          # next-intl config
│       │   └── messages/      # zh.json, en.json
│       └── middleware.ts      # Locale detection & redirect
├── docs/
│   ├── screenshots/           # Product screenshots
│   └── prd-supplement.md      # PRD supplement
├── .prettierrc.yaml           # Prettier config (OpenMetadata rules)
└── pnpm-workspace.yaml
```

## Roadmap

- [x] UI Showcase — 27+ routes with mock data
- [x] i18n — Chinese / English
- [x] AI Skills management page
- [x] Smart Input Hub (multi-modal capture)
- [x] Detail pages (tasks, inbox, knowledge, projects, calendar)
- [x] Auth pages + Onboarding wizard
- [x] Settings sub-pages (appearance, AI, integrations, subscription, data)
- [x] Morning Plan + Evening Review dialogs
- [x] Command Palette (`Cmd+K`)
- [x] Prettier formatting (OpenMetadata rules)
- [ ] Backend API (Koa.js)
- [ ] Database schema (MySQL)
- [ ] Auth (Email + OAuth)
- [ ] AI classification (Claude API)
- [ ] Google Calendar integration
- [ ] PWA support

## License

Private — All rights reserved.
