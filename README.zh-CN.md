<p align="center">
  <h1 align="center">Ask Dorian</h1>
  <p align="center"><strong>别再丢失碎片了。自动把一切变成行动。</strong></p>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## 问题

你收到一条消息 —— "下周三对齐 OKR"。你想着等会儿加到日历里。然后忘了。

你收藏了一篇好文章。再也没打开过。

开会时突然有个好想法。散会后就忘了。

**你的碎片散落在 5 个以上的 app 里，大部分悄无声息地消失了。**

Notion 要你整理。Todoist 要你手动输入。日历要你自己排。每个工具都在等 *你* 来干活。

## 解决方案

Ask Dorian 是碎片输入和有序生活之间，缺失的那层自动化。

**丢进来就行。AI 帮你搞定。**

```
碎片输入 → AI 分类 → 任务 / 日程 / 知识 → 执行 → 复盘
```

| | Notion | Todoist | Ask Dorian |
|---|---|---|---|
| 输入 | 手动建页面 | 手动加任务 | 任意输入 — 文字、语音、截图、链接 |
| 分类 | 你打标签 | 你归项目 | AI 自动分类 |
| 生成任务 | 你写 | 你写 | AI 自动提取 |
| 排日程 | 你设 | 部分 | AI 识别时间，自动创建 |
| 知识沉淀 | 无 | 无 | AI 自动归档 |
| 学习成本 | 高 | 中 | **零** |

**别人说"你来整理"。我们说"你丢进来，AI 帮你整理"。**

## 产品展示

### 今日驾驶舱

你的每日指挥中心 — 任务、日程、待处理碎片、专注时间。零上下文切换。

![今日驾驶舱](docs/screenshots/01-today.png)

### 收集箱（Fragment Hub）

核心入口。文字、语音、文档、截图、链接 — 选择 AI 技能，点击处理。6 步 AI 管线自动完成分类、实体提取和动作生成。

![收集箱](docs/screenshots/02-inbox.png)

### AI 技能

定义 AI 如何处理你的碎片。5 个内置技能 + 自定义技能，支持编辑处理管线。

![AI 技能](docs/screenshots/03-skills.png)

### 项目

按项目组织任务、知识和事件。内置进度追踪和看板视图。

![项目](docs/screenshots/04-projects.png)

## 为谁而做？

**一人公司、独立开发者、自媒体创作者** — 每天身兼多职，被碎片信息淹没，却没有助理帮忙整理。

如果你已经在付费 2-3 个效率工具，却还是在丢失碎片，Ask Dorian 替代的是它们之间的手动粘合工作。

## 核心能力

| 能力 | 说明 |
|------|------|
| **多模态采集** | 文字 / 语音 / 文档 / 截图 / 链接，一个入口 |
| **AI 处理管线** | 6 步：分析 → 分类 → 提取 → 生成 → 关联 → 校验 |
| **可配置 AI 技能** | 默认 + 自定义，管线步骤可编辑 |
| **今日驾驶舱** | 任务、日程、碎片、专注时间一览 |
| **项目归因** | 碎片自动关联到项目 |
| **周复盘** | 自动汇总已完成、延期、决策、知识 |
| **晨间规划 + 日终回顾** | 每日规划与反思仪式 |
| **国际化** | 中文 / English |
| **Command Palette** | `Cmd+K` 快速捕获、搜索、导航 |

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| 国际化 | next-intl |
| AI | Claude API |
| 后端 | Node.js (Koa.js) |
| 数据库 | MySQL 8.0 |
| 部署 | AWS |

## 快速开始

```bash
git clone https://github.com/your-username/ask-dorian.git
cd ask-dorian
pnpm install
pnpm dev:showcase
# 打开 http://localhost:3000
```

## 路线图

- [x] UI 原型 — 27+ 路由
- [x] AI 技能管理
- [x] Smart Input Hub（多模态采集）
- [x] 详情页、登录注册、引导流程、设置
- [x] Command Palette、晨间规划、日终回顾
- [ ] 后端 API
- [ ] AI 分类引擎
- [ ] 付费集成
- [ ] Google Calendar 同步
- [ ] PWA

## 许可证

私有项目 — 保留所有权利。
