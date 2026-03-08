<p align="center">
  <h1 align="center">Ask Dorian</h1>
  <p align="center"><strong>Stop losing fragments. Auto-convert everything into action.</strong></p>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## The Problem

You receive a message — "Sync OKR next Wednesday". You think you'll add it to your calendar later. You forget.

You bookmark an article. Never read it again.

A great idea pops up during a meeting. By the time it's over, it's gone.

**Your fragments are scattered across 5+ apps, and most of them die in silence.**

Notion requires you to organize. Todoist requires you to type. Calendar requires you to schedule. Every tool expects *you* to do the work.

## The Solution

Ask Dorian is the missing automation layer between your fragmented inputs and your organized life.

**Throw anything in. AI handles the rest.**

```
Fragment Input → AI Classification → Tasks / Schedules / Knowledge → Execute → Review
```

| | Notion | Todoist | Ask Dorian |
|---|---|---|---|
| Input | Manual pages | Manual tasks | Anything — text, voice, screenshots, links |
| Classify | You tag it | You file it | AI does it |
| Create tasks | You write it | You write it | AI extracts it |
| Schedule | You set it | Partial | AI detects time and creates events |
| Learn | Zero | Zero | AI archives knowledge automatically |
| Learning curve | High | Medium | **Zero** |

**Others say "you organize". We say "you throw it in, AI organizes".**

## Product Showcase

### Today's Dashboard

Your daily command center — tasks, schedule, pending fragments, focus time. Zero context switching.

![Today's Dashboard](docs/screenshots/01-today.png)

### Fragment Hub

The core entry point. Text, voice, documents, screenshots, links — pick an AI skill, hit process. The 6-step AI pipeline handles classification, entity extraction, and action generation automatically.

![Fragment Hub](docs/screenshots/02-inbox.png)

### AI Skills

Define how AI processes your fragments. 5 built-in skills + custom skills with editable processing pipelines.

![AI Skills](docs/screenshots/03-skills.png)

### Projects

Tasks, knowledge, and events organized by project. Progress tracking and Kanban view built in.

![Projects](docs/screenshots/04-projects.png)

## Who is this for?

**Solo founders, indie developers, and content creators** who juggle multiple roles and get overwhelmed by fragmented information every day — but don't have an assistant to organize it all.

If you're already paying for 2-3 productivity tools and still losing track of things, Ask Dorian replaces the manual glue work between them.

## Features

| Feature | Description |
|---------|-------------|
| **Multi-modal Capture** | Text / voice / documents / screenshots / links — one entry |
| **AI Processing Pipeline** | 6-step: analyze → classify → extract → generate → link → validate |
| **Configurable AI Skills** | Default + custom skills with editable pipelines |
| **Today's Dashboard** | Tasks, schedule, fragments, focus time in one view |
| **Project Context** | Fragments auto-linked to projects |
| **Weekly Review** | Auto-summarize completed, delayed, decisions, knowledge |
| **Morning Plan + Evening Review** | Daily planning and reflection rituals |
| **i18n** | Chinese / English |
| **Command Palette** | `Cmd+K` quick capture, search, navigation |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| i18n | next-intl |
| AI | Claude API |
| Backend | Node.js (Koa.js) |
| Database | MySQL 8.0 |
| Deployment | AWS |

## Getting Started

```bash
git clone https://github.com/your-username/ask-dorian.git
cd ask-dorian
pnpm install
pnpm dev:showcase
# Open http://localhost:3000
```

## Roadmap

- [x] UI Prototype — 27+ routes
- [x] AI Skills management
- [x] Smart Input Hub (multi-modal capture)
- [x] Detail pages, auth, onboarding, settings
- [x] Command Palette, morning plan, evening review
- [ ] Backend API
- [ ] AI classification engine
- [ ] Payment integration
- [ ] Google Calendar sync
- [ ] PWA

## License

Private — All rights reserved.
