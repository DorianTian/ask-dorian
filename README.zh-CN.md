<p align="center">
  <h1 align="center">Ask Dorian</h1>
  <p align="center"><strong>掌控碎片化</strong> — 让碎片输入自动变成可执行结果。</p>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## Ask Dorian 是什么？

一个智能个人执行中枢，捕获你的碎片想法、链接、语音备忘和截图，然后利用 AI 自动将它们结构化为任务、日程、知识和下一步行动。

**不是**笔记工具。**不是**通用 AI 聊天。而是一个**碎片输入驱动的个人执行中枢**。

**核心链路：** 碎片输入 → AI 结构化理解 → 日历/任务联动 → 今日面板执行 → 周复盘沉淀

## 产品展示

### 今日驾驶舱 `[MVP]`

> 聚合今天要做的一切：任务、日程、待处理碎片、专注时间。

<!-- ![今日驾驶舱](docs/screenshots/01-today.png) -->
`📸 截图待补充`

### 收集箱 `[MVP]`

> 统一碎片入口 — 文本、链接、语音、截图，AI 自动分类。

<!-- ![收集箱](docs/screenshots/02-inbox.png) -->
`📸 截图待补充`

### 本周面板 `[MVP]`

> 一周计划总览：优先级排序、空档时间、重要事项一目了然。

<!-- ![本周面板](docs/screenshots/03-weekly.png) -->
`📸 截图待补充`

### 项目视图 `[MVP]`

> 按项目/主题组织任务、知识和事件，上下文持续关联。

<!-- ![项目视图](docs/screenshots/04-projects.png) -->
`📸 截图待补充`

### 回顾 `[MVP]`

> 自动生成周报：完成项、延期项、关键决策、知识沉淀。

<!-- ![回顾](docs/screenshots/05-review.png) -->
`📸 截图待补充`

### 日历

> 完整日历视图，支持任务 Timeboxing 拖拽排程。

<!-- ![日历](docs/screenshots/06-calendar.png) -->
`📸 截图待补充`

### 知识库

> 沉淀的知识、灵感、笔记，支持全文搜索与双向关联。

<!-- ![知识库](docs/screenshots/07-knowledge.png) -->
`📸 截图待补充`

### 设置

> 主题、语言、AI 偏好、集成、订阅管理。

<!-- ![设置](docs/screenshots/08-settings.png) -->
`📸 截图待补充`

### 通知中心

> 任务到期、碎片待处理、周回顾就绪，统一提醒。

<!-- ![通知中心](docs/screenshots/09-notifications.png) -->
`📸 截图待补充`

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **统一碎片收集** | 文本 / 链接 / 语音 / 截图，一个入口全收录 |
| **AI 智能分类** | 自动识别任务 / 日程 / 知识 / 灵感，置信度分级处理 |
| **今日驾驶舱** | 聚合今日任务、日程、会议准备，降低切换成本 |
| **日历联动** | 任务与日历双向联动，支持 Timeboxing 拖拽排程 |
| **项目归因** | 碎片自动关联到项目，长期上下文可追溯 |
| **周复盘** | 自动汇总完成项、延期项、关键决策与知识沉淀 |
| **国际化** | 中文 / English 双语支持 |
| **Command Palette** | `Cmd+K` 快速捕获、搜索、导航（规划中） |

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| 图标 | Lucide React |
| 图表 | Recharts |
| 国际化 | next-intl |
| 后端 | Node.js (Koa.js) |
| 数据库 | MySQL 8.0 |
| AI | Claude API (Sonnet) |
| 部署 | AWS EC2 + RDS + Cloudflare + PM2 |

## 架构

```
askdorian.com ──\                     /──→ Next.js (:3000)
                 → Cloudflare → EC2 Nginx
aix-hub.com ────/                     \──→ Koa.js API (:4000)
                                            │
                                       RDS MySQL 8.0
```

| 资源 | 规格 |
|------|------|
| EC2 | t3.medium (2C4G)，Ubuntu 24.04，新加坡 (ap-southeast-1) |
| RDS | MySQL 8.0，db.t3.micro |
| CDN & SSL | Cloudflare (Full 模式) |
| 进程管理 | PM2 |
| 反向代理 | Nginx |

## 快速开始

```bash
# 克隆
git clone https://github.com/your-username/ask-dorian.git
cd ask-dorian

# 安装依赖
pnpm install

# 启动展示页（UI 原型）
pnpm dev:showcase

# 打开 http://localhost:3000
```

## 项目结构

```
ask-dorian/
├── packages/
│   └── showcase/              # UI 展示图（原型页面）
│       ├── src/
│       │   ├── app/[locale]/  # 页面（i18n 路由）
│       │   ├── components/    # 布局 + shadcn/ui（28 个组件）
│       │   ├── lib/           # Mock 数据、类型、工具函数
│       │   ├── i18n/          # next-intl 配置
│       │   └── messages/      # zh.json、en.json
│       └── middleware.ts      # 语言检测与重定向
├── docs/
│   └── prd-supplement.md      # PRD 补充方案与竞品分析
├── CLAUDE.md                  # 项目上下文
└── pnpm-workspace.yaml
```

## 路线图

- [x] UI 展示 — 10 个页面 + Mock 数据
- [x] 国际化 — 中文 / English
- [ ] 截图展示图
- [ ] 后端 API (Koa.js)
- [ ] 数据库 Schema (MySQL)
- [ ] 认证（邮箱 + OAuth）
- [ ] AI 智能分类（Claude API）
- [ ] Google Calendar 集成
- [ ] PWA 支持
- [ ] Command Palette (`Cmd+K`)
- [ ] 每日仪式（晨间规划 + 日终回顾）

## 许可证

私有项目 — 保留所有权利。
