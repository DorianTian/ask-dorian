<p align="center">
  <h1 align="center">Ask Dorian</h1>
  <p align="center"><strong>Master Your Fragments</strong> — Turn fragmented inputs into actionable results, automatically.</p>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## What is Ask Dorian?

A smart personal execution hub that captures your fragmented thoughts, links, voice memos, and screenshots — then uses AI to automatically structure them into tasks, schedules, knowledge, and next actions.

**Not** a note-taking app. **Not** a generic AI chatbot. It's a **fragment-driven personal execution hub**.

**Core Flow:** Fragment Input → AI Understanding → Task/Calendar Linking → Today's Dashboard → Weekly Review

## Showcase

### Today's Dashboard `[MVP]`

> Everything you need today: tasks, schedule, pending fragments, focus time.

<!-- ![Today's Dashboard](docs/screenshots/01-today.png) -->
`📸 Screenshot coming soon`

### Inbox `[MVP]`

> Unified fragment entry — text, links, voice, screenshots. AI auto-classifies.

<!-- ![Inbox](docs/screenshots/02-inbox.png) -->
`📸 Screenshot coming soon`

### Weekly Board `[MVP]`

> Week-at-a-glance: priorities, free slots, important items.

<!-- ![Weekly Board](docs/screenshots/03-weekly.png) -->
`📸 Screenshot coming soon`

### Projects `[MVP]`

> Tasks, knowledge, and events organized by project. Context stays connected.

<!-- ![Projects](docs/screenshots/04-projects.png) -->
`📸 Screenshot coming soon`

### Review `[MVP]`

> Auto-generated weekly report: completed, delayed, key decisions, knowledge archive.

<!-- ![Review](docs/screenshots/05-review.png) -->
`📸 Screenshot coming soon`

### Calendar

> Full calendar view with task timeboxing via drag & drop.

<!-- ![Calendar](docs/screenshots/06-calendar.png) -->
`📸 Screenshot coming soon`

### Knowledge Base

> Accumulated knowledge, inspiration, and notes with full-text search.

<!-- ![Knowledge](docs/screenshots/07-knowledge.png) -->
`📸 Screenshot coming soon`

### Settings

> Theme, language, AI preferences, integrations, subscription.

<!-- ![Settings](docs/screenshots/08-settings.png) -->
`📸 Screenshot coming soon`

### Notifications

> Task reminders, pending fragments, weekly review alerts — all in one place.

<!-- ![Notifications](docs/screenshots/09-notifications.png) -->
`📸 Screenshot coming soon`

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Unified Fragment Capture** | Text / links / voice / screenshots — one entry point |
| **AI Classification** | Auto-detect tasks / schedules / knowledge / inspiration with confidence scoring |
| **Today's Dashboard** | Aggregate today's tasks, schedule, meeting prep — reduce context switching |
| **Calendar Sync** | Bi-directional task ↔ calendar linking with timeboxing |
| **Project Attribution** | Fragments auto-linked to projects for long-term context |
| **Weekly Review** | Auto-summarize completed items, delays, key decisions, and knowledge |
| **i18n** | Chinese / English bilingual support |
| **Command Palette** | `Cmd+K` for quick capture, search, and navigation (planned) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| i18n | next-intl |
| Backend | Node.js (Koa.js) |
| Database | MySQL 8.0 |
| AI | Claude API (Sonnet) |
| Deployment | AWS EC2 + RDS + Cloudflare + PM2 |

## Architecture

```
askdorian.com ──\                     /──→ Next.js (:3000)
                 → Cloudflare → EC2 Nginx
aix-hub.com ────/                     \──→ Koa.js API (:4000)
                                            │
                                       RDS MySQL 8.0
```

| Resource | Spec |
|----------|------|
| EC2 | t3.medium (2C4G), Ubuntu 24.04, Singapore (ap-southeast-1) |
| RDS | MySQL 8.0, db.t3.micro |
| CDN & SSL | Cloudflare (Full mode) |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |

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
│   └── showcase/              # UI showcase (prototype pages)
│       ├── src/
│       │   ├── app/[locale]/  # Pages with i18n routing
│       │   ├── components/    # Layout + shadcn/ui (28 components)
│       │   ├── lib/           # Mock data, types, utils
│       │   ├── i18n/          # next-intl config
│       │   └── messages/      # zh.json, en.json
│       └── middleware.ts      # Locale detection & redirect
├── docs/
│   └── prd-supplement.md      # PRD supplement & competitive analysis
├── CLAUDE.md                  # Project context
└── pnpm-workspace.yaml
```

## Roadmap

- [x] UI Showcase — 10 pages with mock data
- [x] i18n — Chinese / English
- [ ] Screenshot gallery
- [ ] Backend API (Koa.js)
- [ ] Database schema (MySQL)
- [ ] Auth (Email + OAuth)
- [ ] AI classification (Claude API)
- [ ] Google Calendar integration
- [ ] PWA support
- [ ] Command Palette (`Cmd+K`)
- [ ] Daily ritual (morning plan + evening review)

## License

Private — All rights reserved.
