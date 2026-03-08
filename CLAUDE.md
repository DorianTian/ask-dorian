# Ask Dorian - Project Context

## Product Overview

**Ask Dorian** — 掌控碎片化，让碎片输入自动变成可执行结果。

面向个人用户的 ToC 智能工作助手工作台产品，独立品牌，面向市场推广。
核心链路：碎片输入 → AI 结构化理解 → 日历/任务联动 → 今日面板执行 → 周复盘沉淀。

- **品牌名**: Ask Dorian
- **域名**: askdorian.com (前端) / aix-hub.com (后端 API)
- **定位**: 不是笔记工具，不是通用 AI 聊天，而是"碎片输入驱动的个人执行中枢"
- **对标产品**: Sunsama / Motion / Linear / Notion / Akiflow / Raycast

## Architecture

### Deployment (共用 aix-ops-hub 机器)

- **1 x EC2 t3.medium** (2C4G, ap-southeast-1 Singapore)
- **1 x RDS MySQL 8.0** (db.t3.micro)
- **Cloudflare** — DNS + CDN + SSL
- **Nginx** — 按域名反向代理 (:3000 frontend / :4000 API)
- **PM2** — 进程管理

### Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui (base-nova)
- **Backend**: Node.js (Koa.js) — 独立进程，非 Next.js API Routes
- **Database**: MySQL 8.0
- **AI**: Claude API (Sonnet)
- **Charts**: Recharts
- **Icons**: Lucide React
- **i18n**: next-intl (中文 + English)

### Why Separate Frontend & Backend

- 工作流引擎需要 long-running process + background jobs + timers
- Next.js API Routes 是 request-response 模型，不适合
- 后端 API 可独立复用

## Monorepo Structure (pnpm)

```
ask-dorian/
├── packages/
│   └── showcase/           # UI showcase (原型展示图, Next.js)
│       ├── src/
│       │   ├── app/[locale]/   # i18n 路由 pages
│       │   ├── components/
│       │   │   ├── layout/     # Layout shell, sidebar, locale switcher
│       │   │   └── ui/         # shadcn/ui components (28个)
│       │   ├── lib/            # mock-data, types, utils
│       │   ├── i18n/           # next-intl config (request, routing, navigation)
│       │   └── messages/       # zh.json, en.json
│       ├── middleware.ts       # i18n locale middleware
│       └── ...config files
├── docs/
│   └── prd-supplement.md   # PRD 补充方案（竞品分析 + 缺失模块）
├── pnpm-workspace.yaml
├── package.json
├── CLAUDE.md
└── .gitignore
```

## Packages

### @ask-dorian/showcase
UI 原型展示图，用于 Git 展示和产品演示。纯前端 mock 数据，不连接后端。
与未来的正式前端 package 完全独立。

## Pages

### MVP (Phase 1) — 标记 `@MVP`

| Page | Route | Description |
|------|-------|-------------|
| 今日驾驶舱 | `/today` | 今天任务、日程、跟进项、待处理碎片、专注时间 |
| 收集箱 | `/inbox` | 统一碎片输入 + AI 分类展示 |
| 本周面板 | `/weekly` | 一周计划、优先级、空档时间、重要事项 |
| 项目视图 | `/projects` | 按项目/主题组织的任务、知识、事件 |
| 回顾 | `/review` | 周报、完成项、延期项、关键决策、知识沉淀 |

### Extended (Phase 2+) — 标记 `@Phase2+`

| Page | Route | Description |
|------|-------|-------------|
| 日历 | `/calendar` | 完整日历视图 + timeboxing |
| 知识库 | `/knowledge` | 知识沉淀、搜索、标签、关联 |
| 设置 | `/settings` | 通用/外观/语言/AI 偏好/集成/订阅/数据 |
| 账号管理 | `/settings/account` | 个人信息、安全、订阅计划 |
| 通知中心 | `/notifications` | 任务到期/逾期/碎片待处理/系统通知 |

## i18n Strategy

- 使用 `next-intl` — 路由模式 `/[locale]/...`
- 默认语言：中文 (zh)
- 支持语言：中文 (zh)、英文 (en)
- Message files: `src/messages/zh.json`, `src/messages/en.json`
- 所有 UI 文案通过 message files 管理，不硬编码

## Code Conventions

- Follow global CLAUDE.md conventions (no `any`, import order, function components only)
- shadcn/ui style: base-nova, neutral base color, CSS variables
- Mock data in `src/lib/mock-data.ts`, types in `src/lib/types.ts`
- Layout: `LayoutShell` (SidebarProvider + header with locale switcher)
- All pages `"use client"` in showcase
- i18n keys: dot notation `page.section.label`

## Key Documents

| Document | Path |
|----------|------|
| PRD 补充方案 | `docs/prd-supplement.md` |
| Showcase Package | `packages/showcase/` |
| Setup Skill | `.claude/skills/setup-project/SKILL.md` |

## Development Commands

```bash
pnpm install                                    # Install all
pnpm dev:showcase                               # Dev server (localhost:3000)
pnpm build:showcase                             # Build
pnpm lint:showcase                              # Lint
```
