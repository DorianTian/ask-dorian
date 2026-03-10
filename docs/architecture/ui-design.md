# Ask Dorian — UI Design System

> **Version**: v1.1
> **Design Direction**: 克制的精致 — Linear 信息密度 + Notion 干净舒适 + AI 环节点缀 Arc 质感
> **Status**: Confirmed & Implemented (showcase updated)

---

## 目录

- [一、Design Language](#一design-language)
- [二、Color System](#二color-system)
- [三、Typography & Spacing](#三typography--spacing)
- [四、Animation Rules](#四animation-rules)
- [五、Layout System](#五layout-system)
- [六、Page Design — Today Dashboard](#六page-design--today-dashboard)
- [七、Page Design — Inbox](#七page-design--inbox)
- [八、Page Design — Weekly](#八page-design--weekly)
- [九、Page Design — Projects](#九page-design--projects)
- [十、Page Design — Review](#十page-design--review)
- [十一、Cross-Platform Strategy](#十一cross-platform-strategy)
- [十二、Wow Moments](#十二wow-moments)

---

## 一、Design Language

**核心原则**：克制的精致 — 所有视觉装饰服务于功能，不为炫技而炫技。

- **Light mode** 为主视觉 — 白底灰线，信息密度优先
- **Light sidebar** — 浅灰背景 (`gray-100`)，与内容区自然过渡，靠 border-right 做视觉分隔 (Linear 风格)
- **Brand gradient** (Indigo→Violet, OKLCH) 仅用于 AI 相关元素
- **Grayscale** 处理所有非 AI 元素 — 不抢 AI 环节的视觉焦点
- **无 shadow** — Light mode 靠 border 区分层级，不用 box-shadow

---

## 二、Color System

### Brand Colors (AI-only)

OKLCH color space, perceptually uniform.

- Brand from: `oklch(0.585 0.233 264)` (Indigo)
- Brand to: `oklch(0.585 0.233 293)` (Violet)
- CSS utility: `.bg-brand-gradient`, `.text-brand-gradient`
- 使用场景：AI shimmer、AI insights 侧边条、"开始专注" CTA、Command K overlay、sidebar logo
- 禁止用于：普通按钮、导航、卡片边框、标签

### Semantic Colors (Light Mode)

| Token | OKLCH | Purpose |
|-------|-------|---------|
| `--background` | `oklch(0.995 0 0)` | Page background (near-white) |
| `--foreground` | `oklch(0.145 0 0)` | Primary text |
| `--card` | `oklch(1 0 0)` | Card background (pure white) |
| `--muted` | `oklch(0.97 0 0)` | Section background, AI suggestion area |
| `--muted-foreground` | `oklch(0.556 0 0)` | Secondary text |
| `--border` | `oklch(0.922 0 0)` | Card borders, dividers |

### Sidebar (Light Gray — Linear style)

| Token | Value | Purpose |
|-------|-------|---------|
| `--sidebar` | `oklch(0.97 0 0)` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.45 0 0)` | Inactive nav text |
| `--sidebar-accent` | `oklch(0.93 0 0)` | Hover/active item bg |
| `--sidebar-accent-foreground` | `oklch(0.145 0 0)` | Active item text |
| `--sidebar-border` | `oklch(0.91 0 0)` | Separator lines |

### Priority Colors (CSS custom properties + utility classes)

| Priority | Token | Usage |
|----------|-------|-------|
| P0 Critical | `--priority-p0` | Red, `.priority-p0` (3px border-left) |
| P1 High | `--priority-p1` | Orange, `.priority-p1` |
| P2 Medium | `--priority-p2` | Blue, `.priority-p2` |
| P3 Low | `--priority-p3` | Gray, `.priority-p3` |

### Fragment Type Colors

| Type | Token | Badge Style |
|------|-------|-------------|
| Task | `--fragment-task` | Blue bg/text |
| Event | `--fragment-event` | Green bg/text |
| Note | `--fragment-note` | Gray bg/text |
| Uncertain | `--fragment-uncertain` | Orange bg/text |

---

## 三、Typography & Spacing

### Font
- Sans: system `--font-sans` (Geist/Inter) + `"PingFang SC"` 中文 fallback
- Mono: `--font-geist-mono` (timestamps, code, metrics)

### Scale
| Token | Size | Usage |
|-------|------|-------|
| `text-xs` / `text-[10px]` / `text-[11px]` | 10-12px | Badges, timestamps, hints, confidence |
| `text-sm` | 14px | Body text, task titles, form labels |
| `text-base` | 16px | Section titles, input text |
| `text-lg` | 18px | Page title in header |
| `text-xl` | 20px | Focus timer display |

### Spacing
- Card padding: `pt-4` / `pt-5` (CardContent), `pb-2` (CardHeader compact)
- Section gap: `space-y-6` (page level), `space-y-4` (within cards)
- Grid gap: `gap-4` (四象限), `gap-6` (section level)
- Page wrapper: `mx-auto max-w-6xl` (content centered)
- Page padding: `p-4 md:p-6` (responsive)

---

## 四、Animation Rules

### 允许的动画
1. **功能性过渡** — AI shimmer (processing indicator), page transition fade, list layout animation
2. **状态反馈** — hover highlight (`hover:bg-muted/50`), button press, checkbox strikethrough, opacity transitions (`group-hover:opacity-100`)

### 禁止的动画
- Confetti / 粒子效果
- 弹性回弹 (spring bounce)
- 空状态脉冲 (pulse)
- 任何纯装饰性动效

### AI Shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.ai-shimmer {
  background: linear-gradient(90deg, var(--muted) 0%, oklch(0.92 0.03 264) 50%, var(--muted) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

### Duration & Easing
- Micro: `150ms ease-out` (hover, press)
- Layout: `200ms ease-in-out` (list reorder, collapse)
- Shimmer: `1.5s linear infinite`

---

## 五、Layout System

### Page Skeleton

```
┌───────────────────────────────────────────────┐
│ Sidebar (240px)  │     Content Area            │
│ light gray bg    │                              │
│ border-right     │  ┌─ Header (h-14) ────────┐ │
│                  │  │ PageTitle      ⌘K  🌐   │ │
│ [Logo+Gradient]  │  └────────────────────────┘ │
│                  │                              │
│ ─ Capture & AI ─ │  ┌─ Scrollable Content ───┐ │
│ · Inbox          │  │                        │ │
│ · Skills         │  │  max-w-6xl mx-auto     │ │
│ ─ Execute ─────  │  │  p-4 md:p-6            │ │
│ · Today          │  │                        │ │
│ · Weekly         │  └────────────────────────┘ │
│ · Projects       │                              │
│ · Calendar       │                              │
│ ─ Intelligence ─ │                              │
│ · Knowledge      │                              │
│ · Review         │                              │
│ ─ System ──────  │                              │
│ · Notifications  │                              │
│ · Settings       │                              │
│                  │                              │
│ [User Avatar D]  │                              │
└───────────────────────────────────────────────┘
```

### Sidebar
- Width: 240px (desktop), collapsible icon mode 48px (mobile sheet)
- Background: `--sidebar` (浅灰, `oklch(0.97 0 0)`)
- Logo: brand gradient icon (Sparkles) + "Ask Dorian" text
- Nav groups: 采集 & AI / 执行 / 知识沉淀 / 系统
- Active item: `bg-sidebar-accent` + `text-sidebar-accent-foreground`
- Footer: avatar + name + dropdown

### Header
- Height: `h-14` (56px)
- Left: SidebarTrigger + separator + page title (`text-sm font-semibold`)
- Right: ⌘K button (outline, `h-7`) + LocaleSwitcher
- Border: `border-b border-border`

---

## 六、Page Design — Today Dashboard

**哲学**：打开即进入执行模式。四象限让用户一眼看到全局。

### Layout: 2×2 Grid (`grid gap-4 lg:grid-cols-2`)

```
┌─────────────────┬─────────────────┐
│  Q1: Tasks      │  Q2: Schedule   │
│  今日任务列表    │  时间线 + 事件   │
│  优先级色条      │  当前时刻红线    │
│  hover 操作      │  色块区分类型    │
├─────────────────┼─────────────────┤
│  Q3: AI Feed    │  Q4: Focus      │
│  管道统计        │  专注计时器      │
│  待确认碎片      │  brand gradient  │
│  最近处理结果    │  三个 KPI 数字   │
└─────────────────┴─────────────────┘
```

### Header (页面顶部, grid 外)
- Greeting + 日期 + 任务完成统计
- Progress bar (`h-1`, 完成比例)
- 右侧: Quick Capture input (desktop only, Sparkles icon + placeholder)

### Q1: 今日任务
- Card header: CheckCircle2 icon + "今日任务" + 完成数/总数
- 活跃任务: checkbox + 标题 + 项目名 + 预估时间 + AI badge + priority 色条
- 已完成: separator 后, strikethrough + muted
- Hover: "标记完成" ghost button (opacity transition)

### Q2: 日程安排
- Card header: CalendarClock icon + "日程安排" + 跳转日历
- 当前时刻: 红色圆点 + 红色线 + 时间 (10:30)
- 事件: 色块 (`border-l-2`, 按类型着色: meeting=violet, focus=emerald, event=blue)
- 每事件: 时间 (font-mono) + 标题 + 地点

### Q3: AI 处理动态
- Card header: Brain icon + "AI 刚处理的" + 跳转 Inbox
- 管道统计: "5 碎片输入 → 4 任务 · 2 日程 · 1 知识"
- 待确认碎片: amber 背景, 原文 + AI 解读 + 确认按钮
- 已完成碎片: 原文 → 生成实体 (compact one-liner)

### Q4: 专注时间 & 统计
- Card header: Timer icon + "专注时间"
- 计时器: `text-3xl font-mono`, muted 背景, progress bar
- "开始专注" CTA: `bg-brand-gradient text-white` (唯一渐变按钮)
- 底部 3 列 KPI: 任务数 / 事件数 / 待处理碎片

### Mobile
- 四象限 → 单列堆叠: Q1 → Q2 → Q3 → Q4
- Quick Capture 移入 Q3 或 bottom sticky

---

## 七、Page Design — Inbox

**哲学**：零摩擦输入，多模态采集，AI 即时反馈。产品差异化核心页面。

### Smart Input Hub (Card, 页面顶部)

**5 种输入模式** (核心差异化):

| Mode | Icon | UI |
|------|------|----|
| 文字 (text) | FileText | Textarea, 自适应高度 |
| 语音 (voice) | Mic | 录音波形 + 红色脉冲指示 + 时长 |
| 文档 (document) | FileUp | 拖拽上传区 (border-dashed) |
| 截图 (screenshot) | Camera | 拖拽上传区 |
| 链接 (link) | Link2 | Textarea, placeholder "https://..." |

- 模式切换: 一排按钮, active 用 `variant="default"`, inactive 用 `variant="outline"`
- 提交按钮: "AI 处理" + Sparkles icon + Send icon
- 语音模式: `animate-ping` 红点 + 波形柱状图 (24 bars, random heights) + 时长显示

### Filter Tabs (Underline style)
- `All (N)` | `Tasks (N)` | `Events (N)` | `Notes` | `? (N)`
- `?` = Uncertain (AI 不确定, HelpCircle icon)
- Active: `border-b-2 border-foreground font-medium`
- Inactive: `border-transparent text-muted-foreground`

### Fragment Card

```
┌──────────────────────────────────────┐
│ [Task] · ⌘K Desktop      10:30      │  ← type badge + source + time
│ ──────────────────────────────────── │
│ "OKR"                                │  ← raw input (muted)
│ ──────────────────────────────────── │
│ ┌ bg-muted/50 ────────────────────┐ │
│ │ AI 解读文本                      │ │  ← AI suggestion area
│ │ 🔗 匹配实体 badges              │ │
│ │ 📋 生成实体 (icon + title + due) │ │
│ │ ⚠️ 冲突警告 (amber)             │ │
│ │ 82% confidence · 820ms          │ │
│ └─────────────────────────────────┘ │
│ [Accept ✓]  [Edit ✎]  [Ignore ×]   │  ← actions (ghost buttons)
│ — OR —                               │
│ "你想？" [选项1] [选项2] [选项3]     │  ← user prompt (needs_confirmation)
└──────────────────────────────────────┘
```

### Shimmer Card (AI 处理中)
- `.ai-shimmer` 占位块 (type badge + source 位置)
- 原始输入文本 (italic, muted)
- 内容区 shimmer 块

### Empty State
- Sparkles icon (muted/30) + 一行文案, 无动画

### Mobile
- Smart Input Hub 全宽
- 模式切换按钮横向滚动
- Fragment Cards 全宽

---

## 八、Page Design — Weekly

**哲学**：一周的"战略地图" — 回答"这周忙不忙、来不来得及"。

### Header
- 标题 + 周日期范围 + 翻页箭头 (ghost buttons)
- 三指标 inline: 已完成 N/M · 预估剩余 Xh · 空档 Yh
- 空档数字用 `text-emerald-600` 高亮

### 7-Column Day Grid
- `grid grid-cols-7`, 外层 `border rounded-lg overflow-hidden`
- 每列: day header (label + date) + separator + content area
- 今天列: `border-t-2 border-t-brand-from` + 标题加粗
- 周末列: `bg-muted/30` 降权
- 列间: `border-r border-border`
- 最小高度: `min-h-[200px]`

### Day Content
- 事件: 色块 badge (`rounded border px-1.5 py-1 text-[10px]`)
  - meeting: violet, focus: emerald, event: blue, reminder: amber
- 任务: checkbox + truncated title + priority 色条 (`text-[11px]`)
- 已完成: strikethrough + muted
- 空天: "—" 居中 (muted/40)

### Unscheduled Section
- ChevronDown + "未安排" label + count badge
- 任务列表: checkbox + title + 预估时长 + AI badge
- 可拖拽到某天列 (future enhancement)

### Mobile
- 7 列 → 水平滚动, snap 对齐
- 或切换为列表视图 (按天分组)

---

## 九、Page Design — Projects

**哲学**：Basecamp 按项目组织 + Linear 视觉密度。

### Project Card Grid (`grid gap-4 sm:grid-cols-2`)
- 项目色圆点 (8px, inline style `backgroundColor`)
- 项目名 (`font-semibold`) + 状态 badge (emerald=active, amber=paused, gray=archived)
- 描述 (`line-clamp-1`, muted)
- 进度: "N/M tasks" + 百分比 + Progress bar (`h-1`, 项目色填充)
- Overdue 警示: 红色 AlertCircle + "N overdue"
- Hover: `border-foreground/15` 加深
- 最后一格: "+ New Project" 虚线卡片 (`border-dashed`)

### Project Detail (Drill-down, same page state)
- `[← 返回]` 按钮 (ArrowLeft + text)
- 项目色圆点 + 名称 + 状态 badge
- 描述 + 统计 (tasks / notes / events)
- Tabs (underline style): Tasks | Events | Notes | Activity
- Tasks 按优先级分组 (P0/P1/P2/P3), section label: `text-[10px] uppercase tracking-widest`
- 已完成: checkbox filled + strikethrough
- Overdue 日期: `text-destructive`

### Mobile
- Card grid → 单列
- Detail: 全屏接管

---

## 十、Page Design — Review

**哲学**：仪式感回顾，但用克制表达。

### Header
- 标题 + 周标签 (e.g. "2026-W10 (3/2 - 3/8)")
- 导出按钮 (outline)

### Stats Bar (inline metrics)
- ✓ 完成数 (emerald) / ⊘ 延期数 (amber, 条件高亮) / ◷ 专注时长
- 完成率 progress bar (`h-1.5`)

### Completed vs Deferred (Two Column, `grid lg:grid-cols-2`)
- 左列 "已完成": CheckCircle2 + strikethrough + 完成日期 (mono)
- 右列 "延期": AlertTriangle + 标题 + 操作按钮
  - "移到下周" (ArrowRight) / "取消" (XCircle), ghost buttons

### AI Insights (Card)
- 左侧 3px brand gradient 竖条 (`border-image: linear-gradient(...)`)
- Sparkles icon + "本周观察" label
- 2-3 句 AI 生成的观察与建议

### Daily Breakdown Chart
- Recharts `BarChart`, 7 柱 (Mon-Sun)
- 柱色: `hsl(var(--foreground))` opacity 0.15 (极淡)
- 无 Y 轴 (hide), X 轴: day labels
- Bar radius: `[4, 4, 0, 0]`

### Mobile
- 双列 → 单列堆叠
- Chart 全宽

---

## 十一、Cross-Platform Strategy

### 断点
| Breakpoint | Range | Layout |
|------------|-------|--------|
| Mobile | < 768px | 单列, sidebar overlay (Sheet) |
| Tablet | 768-1024px | 双列 (紧凑) |
| Desktop | 1024px+ | 完整四象限/双列 + sidebar |

### 通用规则
- 最小触控目标: 36px (按钮、checkbox、nav items)
- 不用 `backdrop-filter: blur()` — 移动端性能杀手 (仅 Command K overlay 例外)
- 统一 CSS variables — 只改 layout，不改 design tokens
- `max-w-6xl` content area 保证大屏不过度拉伸

---

## 十二、Wow Moments

**"眼前一亮"来自信息密度的精准和 AI 环节的自然流畅，不是动效堆砌。**

1. **AI Processing Shimmer** — Inbox 输入后，卡片 shimmer 占位 → 结构化结果显现。用户感受：碎片真的被"理解"了。
2. **多模态输入** — 文字/语音/文档/截图/链接，一个入口全覆盖，语音模式有实时波形。用户感受：什么都能丢进去。
3. **四象限 Today** — 任务/日程/AI动态/专注，一屏掌控全天。用户感受：打开就知道该做什么。
4. **Command K** — `⌘K` 全局命令面板，instant search，覆盖所有操作。用户感受：键盘驱动，效率极高。
5. **Review AI Insights** — 周回顾中 AI 自动总结，brand gradient 侧边条标识。用户感受：有人在帮我复盘。

---

## 关联文档

| Document | Path |
|----------|------|
| Technical Architecture | `docs/architecture/technical-architecture.md` |
| Database Schema | `docs/architecture/database-schema.sql` |
| Auth Design | `docs/architecture/auth-design.md` |
| API Response Format | `docs/architecture/api-response-format.md` |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-03-10 | Initial design system |
| v1.1 | 2026-03-10 | Sidebar 改为 Light Gray (Linear style); Today 改为四象限布局; Inbox 恢复多模态输入 (5 modes) |
