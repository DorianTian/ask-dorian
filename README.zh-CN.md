<p align="center">
  <h1 align="center">Ask Dorian</h1>
  <p align="center"><strong>掌控碎片化</strong> — 让碎片输入自动变成可执行结果。</p>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## Ask Dorian 是什么？

碎片驱动的个人执行中枢。随手丢入任何内容 — 文字、语音、链接、截图 — AI 自动将其结构化为任务、日程、知识和下一步行动。

**不是**笔记工具。**不是**通用工作台。核心只做一件事：**碎片进，可执行结果出。**

```
碎片输入 → AI 技能处理 → 任务 / 日程 / 知识 → 执行 → 复盘
```

## 产品展示

### 今日驾驶舱

你的每日指挥中心 — 任务、日程、待处理碎片、专注时间。一个页面搞定一切，零上下文切换。

![今日驾驶舱](docs/screenshots/01-today.png)

### 收集箱（Fragment Hub）

核心入口。丢入任何东西 — 文字、语音、文档、截图、链接。选择 AI 技能，点击处理。AI 管线自动完成分类、实体提取和动作生成。

![收集箱](docs/screenshots/02-inbox.png)

### AI 技能

定义 AI 如何处理你的碎片。5 个内置技能（智能分类、会议纪要整理、链接摘要、日程提取、任务分解）+ 自定义技能，支持编辑处理管线。

![AI 技能](docs/screenshots/03-skills.png)

### 项目

按项目维度组织任务、知识和事件。内置进度追踪、看板视图和活动时间线。

![项目](docs/screenshots/04-projects.png)

---

## 核心链路

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────┐
│  采集        │───→│  AI 处理      │───→│  结构化输出      │───→│  执行     │
│              │    │              │    │                 │    │          │
│ 文字/语音/   │    │ 分类 +        │    │ 任务 +          │    │ 今日 +   │
│ 文档/截图/链接│    │ 提取 +        │    │ 日程 +          │    │ 日历 +   │
│              │    │ 生成          │    │ 知识            │    │ 复盘     │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────┘
```

## 核心能力

| 能力 | 说明 |
|------|------|
| **多模态采集** | 文字 / 语音 / 文档 / 截图 / 链接，一个入口全收录 |
| **AI 处理管线** | 6 步管线：分析 → 分类 → 提取 → 生成 → 关联 → 校验 |
| **可配置 AI 技能** | 默认 + 自定义技能，支持编辑管线步骤 |
| **今日驾驶舱** | 任务、日程、待处理碎片、专注时间一览 |
| **项目归因** | 碎片自动关联到项目，长期上下文可追溯 |
| **周复盘** | 自动汇总：已完成、延期项、关键决策、知识沉淀 |
| **晨间规划 + 日终回顾** | 每日仪式，规划与反思 |
| **国际化** | 中文 / English 双语 |
| **Command Palette** | `Cmd+K` 快速捕获、搜索、导航 |

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui (base-nova) |
| 图标 | Lucide React |
| 图表 | Recharts |
| 国际化 | next-intl |
| 格式化 | Prettier (OpenMetadata 规则) |
| 后端 | Node.js (Koa.js) — 规划中 |
| 数据库 | MySQL 8.0 — 规划中 |
| AI | Claude API (Sonnet) — 规划中 |
| 部署 | AWS EC2 + RDS + Cloudflare + PM2 |

## 架构

```
askdorian.com ──\                     /──→ Next.js (:3000)
                 → Cloudflare → EC2 Nginx
aix-hub.com ────/                     \──→ Koa.js API (:4000)
                                            │
                                       RDS MySQL 8.0
```

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
│   └── showcase/              # UI 原型（27+ 路由）
│       ├── src/
│       │   ├── app/[locale]/  # 页面（i18n 路由）
│       │   ├── components/    # 布局 + shadcn/ui（28 个组件）
│       │   ├── lib/           # Mock 数据、类型、工具函数
│       │   ├── i18n/          # next-intl 配置
│       │   └── messages/      # zh.json、en.json
│       └── middleware.ts      # 语言检测与重定向
├── docs/
│   ├── screenshots/           # 产品截图
│   └── prd-supplement.md      # PRD 补充方案
├── .prettierrc.yaml           # Prettier 配置（OpenMetadata 规则）
└── pnpm-workspace.yaml
```

## 路线图

- [x] UI 展示 — 27+ 路由 + Mock 数据
- [x] 国际化 — 中文 / English
- [x] AI 技能管理页面
- [x] Smart Input Hub（多模态采集）
- [x] 详情页（任务、收集箱、知识、项目、日历）
- [x] 登录注册 + 引导流程
- [x] 设置子页面（外观、AI、集成、订阅、数据）
- [x] 晨间规划 + 日终回顾弹窗
- [x] Command Palette (`Cmd+K`)
- [x] Prettier 格式化（OpenMetadata 规则）
- [ ] 后端 API (Koa.js)
- [ ] 数据库 Schema (MySQL)
- [ ] 认证（邮箱 + OAuth）
- [ ] AI 智能分类（Claude API）
- [ ] Google Calendar 集成
- [ ] PWA 支持

## 许可证

私有项目 — 保留所有权利。
