# Ask Dorian — UI Design System

> **Version**: v2.0
> **Design Direction**: Fragment-First — 碎片处理中枢，不是待办清单
> **Status**: Confirmed, implementation plan ready

---

## 目录

- [一、Design Philosophy](#一design-philosophy)
- [二、Color System](#二color-system)
- [三、Typography & Spacing](#三typography--spacing)
- [四、Animation Rules](#四animation-rules)
- [五、Navigation](#五navigation)
- [六、Page Design — Today (Fragment Feed)](#六page-design--today-fragment-feed)
- [七、Page Design — Inbox](#七page-design--inbox)
- [八、Page Design — Weekly (Four Quadrant)](#八page-design--weekly-four-quadrant)
- [九、Page Design — Projects](#九page-design--projects)
- [十、Page Design — Review](#十page-design--review)
- [十一、Dual Theme System](#十一dual-theme-system)
- [十二、Multi-Platform Design](#十二multi-platform-design)
- [十三、Wow Moments](#十三wow-moments)

---

## 一、Design Philosophy

### v2.0 核心转变

**Fragment-First** — 用户看到的是 "AI 为我做了什么"，不是 "我有哪些任务"。

| v1.x | v2.0 |
|------|------|
| 主角是 Timeline（时间线=日程表） | 主角是 Fragment Feed（碎片流） |
| AI 是侧边面板附属品 | AI 理解过程是核心视觉叙事 |
| 碎片输入和处理过程不可见 | 每条碎片展示完整处理链路 |
| 和 Todoist / Sunsama 无差别 | 差异化：碎片 → AI 理解 → 结构化执行 |
| Sidebar 导航 10 项 | Top nav 5 项 + ⌘K |
| 单主题 (Light only) | Dual theme (Light + Dark) |

### 设计原则

- **Fragment-First**: 碎片流是主角，不是任务清单
- **AI 过程可见**: 原始输入 → AI 理解 → 实体提取 → 执行动作
- **主题统一**: Light/Dark 两套完整主题，不混搭
- **三端一致叙事**: Web/Desktop/Mobile 同一个碎片处理故事，不同详细度
- **克制的精致**: 所有视觉装饰服务于功能

---

## 二、Color System

### Semantic Colors (固定，不随主题变)

| Color | Purpose | Hex | OKLCH |
|-------|---------|-----|-------|
| Green | 进行中 / 已完成 | #22c55e | `oklch(0.627 0.194 149)` |
| Purple | AI 元素 | #a78bfa | `oklch(0.685 0.169 293)` |
| Orange | 待决策 / 警告 | #f59e0b | `oklch(0.705 0.213 47)` |
| Indigo | 日程 / 事件 | #6366f1 | `oklch(0.585 0.233 264)` |
| Red | P0 / 紧急 / 错误 | #ef4444 | `oklch(0.637 0.237 25)` |

### Brand Colors (AI-only)

- Brand from: `oklch(0.585 0.233 264)` (Indigo)
- Brand to: `oklch(0.585 0.233 293)` (Violet)
- CSS utility: `.bg-brand-gradient`, `.text-brand-gradient`
- 使用场景：AI shimmer、AI badge (✦)、Logo icon
- 禁止用于：普通按钮、导航、卡片边框

### Priority Colors (border-left 3px)

| Priority | Token | Color |
|----------|-------|-------|
| P0 Critical | `--priority-p0` | Red |
| P1 High | `--priority-p1` | Orange |
| P2 Medium | `--priority-p2` | Blue |
| P3 Low | `--priority-p3` | Gray |

### Fragment Entity Tag Styles

| Entity | CSS Class | Visual |
|--------|-----------|--------|
| 📌 Task | `.entity-task` | Indigo bg/text |
| 📅 Event | `.entity-event` | Green bg/text |
| 👤 Person | `.entity-person` | Orange bg/text |
| 📁 Project | `.entity-project` | Purple bg/text |
| 🕐 Time | `.entity-time` | Light blue bg/text |
| 📝 Knowledge | `.entity-knowledge` | Gray bg/text |

---

## 三、Typography & Spacing

### Font
- Sans: system `--font-sans` (Geist/Inter) + `"PingFang SC"` 中文 fallback
- Mono: `--font-geist-mono` (timestamps, code, metrics)

### Scale
| Token | Size | Usage |
|-------|------|-------|
| `text-xs` / `text-[10px]` | 10-12px | Badges, timestamps, entity tags, confidence |
| `text-sm` | 14px | Body text, task titles, fragment raw input |
| `text-base` | 16px | Section titles, input text |
| `text-lg` | 18px | Page greeting |
| `text-xl` | 20px | Focus timer, stat numbers |

### Spacing
- Card padding: `p-4` (CardContent)
- Section gap: `space-y-6` (page level), `space-y-3` (within cards)
- Grid gap: `gap-4` (quadrant/stats), `gap-6` (section level)
- Page padding: `p-4 md:p-6` (per-page, not in shell)

---

## 四、Animation Rules

### 允许的动画
1. **功能性过渡** — AI shimmer (processing indicator), page transition fade
2. **状态反馈** — hover highlight, button press, opacity transitions

### 禁止的动画
- Confetti / 粒子效果 / 弹性回弹 / 空状态脉冲 / 纯装饰性动效

### AI Shimmer

```css
.ai-shimmer {
  background: linear-gradient(90deg, var(--muted) 0%, oklch(0.92 0.03 264) 50%, var(--muted) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

---

## 五、Navigation

### v2.0: 水平顶部导航 (替代 v1.x Sidebar)

```
┌──────────────────────────────────────────────────────────────┐
│ ✦ Dorian   [今日] [本周] [项目]         收集箱(3) 回顾  ⌘K │
└──────────────────────────────────────────────────────────────┘
```

| 区域 | 内容 | 说明 |
|------|------|------|
| Logo | ✦ Dorian | Brand gradient icon + text |
| Primary (3) | 今日 / 本周 / 项目 | 高频页面，tab 样式 |
| Secondary (2) | 收集箱 (badge) / 回顾 | 较低频，右侧 |
| Tool | ⌘K | 命令面板入口 |
| Util | 🌐 | LocaleSwitcher |

### ⌘K 命令面板覆盖

通过 ⌘K 访问（不再占导航栏位）：
- 知识库搜索、日历视图、设置、通知中心、AI 技能、全局搜索

### Layout Shell

```
┌──────────────────────────────────────────────┐
│  TopNav (h-12, border-b, bg-card)            │
├──────────────────────────────────────────────┤
│                                              │
│  <main> (flex-1, each page controls padding) │
│                                              │
└──────────────────────────────────────────────┘
```

- 无 sidebar wrapper
- 每个页面自行管理 padding 和布局
- CommandPalette + KeyboardShortcuts 渲染在 main 外

---

## 六、Page Design — Today (Fragment Feed)

**v2.0 核心变化：从四象限 Dashboard → Fragment Feed 碎片流**

### Layout: Main + Side Panel

```
┌─────────────────────────────────────┬──────────────────┐
│           Fragment Feed             │   Compact Panel  │
│                                     │                  │
│  [碎片输入框 — 文字/语音/截图/粘贴]   │  📊 今日概览     │
│                                     │  (4 格统计)      │
│  ✦ Dorian 处理记录                   │                  │
│                                     │  ⚡ 待决策       │
│  ┌─ Fragment Card ──────────────┐   │  (冲突/模糊意图)  │
│  │ 🎤 原始输入（来源+原文+时间）  │   │                  │
│  │ ┌─ AI 理解结果 ────────────┐ │   │  📅 紧凑时间线   │
│  │ │ ✦ AI 已理解 · 92%       │ │   │  (dot + title)   │
│  │ │ 📌任务 👤人物 📅时间 📁项目│ │   │                  │
│  │ │ → 将创建 P1 任务         │ │   │                  │
│  │ │ [✓确认] [✎编辑] [忽略]   │ │   │                  │
│  │ └────────────────────────┘ │   │                  │
│  └────────────────────────────┘   │                  │
└─────────────────────────────────────┴──────────────────┘
```

Grid: `grid-cols-1 lg:grid-cols-[1fr_340px]`

### Fragment Input (Hero Element)

- 输入框: `rounded-xl bg-secondary border p-4`
- Placeholder: "说点什么，Dorian 来处理..."
- 4 个 channel chip: ⌨️ 文字 / 🎤 语音 / 📸 截图 / 📋 粘贴

### Fragment Card Structure

每张卡片讲一条碎片的处理故事：

1. **来源** — Icon (Mic/MessageSquare/Camera/Clipboard) + 输入渠道 + 时间差
2. **原始输入** — 引号包裹的原文，italic
3. **AI 理解结果** — 紫色边框容器:
   - Status badge: "AI 正在理解..." / "AI 已理解" / "已自动执行"
   - 置信度百分比
   - Entity tags: 结构化实体标签（用 entity-* CSS classes）
   - Action text: "→ 将创建 P1 任务 · 安排到明天"
4. **操作按钮** (仅 pending 状态): ✓ 确认 / ✎ 编辑 / 忽略

### Fragment 状态

| 状态 | 视觉 |
|------|------|
| processing | 紫色 shimmer 进度条，实体逐步浮现 |
| pending | 完整卡片 + 操作按钮 |
| auto-executed | 降低透明度 (opacity-50)，绿色 ✓ 标记 |

### Right Side Panel

- **今日概览** — 2×2 stats grid (碎片已处理/待确认/自动执行/今日事项)
- **待决策** — orange border-left cards (时间冲突/模糊意图)
- **紧凑时间线** — time + dot + title, NOW 绿色指示线, AI 安排标 ✦

### Mobile
- Side panel 折叠到底部或隐藏
- Fragment Feed 全宽
- 碎片输入框 sticky top

---

## 七、Page Design — Inbox

与 v1.x 一致，不做大改动。主要调整：
- 适配 TopNav 布局（页面自带 padding）
- 硬编码文案替换为 i18n keys
- 保持 5 种输入模式 + Fragment Card + Filter Tabs

---

## 八、Page Design — Weekly (Four Quadrant)

**v2.0 核心变化：从 7-column grid → 四象限布局**

```
┌─────────────────────────┬─────────────────────────┐
│   🎯 本周焦点            │   📅 时间分配            │
│   AI 挑选的最重要任务     │   7 天紧凑日历           │
│   (AI 已安排)            │   (每天色块=事项密度)    │
├─────────────────────────┼─────────────────────────┤
│   ⏳ 待你决策            │   📊 本周进度            │
│   未安排/待处理/冲突      │   完成率/专注时数/AI洞察  │
│   (需要你参与)           │                         │
└─────────────────────────┴─────────────────────────┘
```

Grid: `grid-cols-1 md:grid-cols-2 gap-4`

**上半 = AI 已安排好的，下半 = 需要你参与决策的。**

| 象限 | 数据来源 | 内容 |
|------|----------|------|
| 🎯 焦点 | tasks[] sorted by priority | Top 3-4 任务 + priority badge + project + due |
| 📅 时间 | scheduleEvents[] | Mon-Sun 行，每天 colored chips |
| ⏳ 决策 | unscheduled tasks + pendingDecisions | 未安排列表 + 冲突警告 |
| 📊 进度 | weeklyReview | Progress bar + focus hours + AI insight |

---

## 九、Page Design — Projects

与 v1.x 一致，适配 TopNav 布局（页面自带 padding）。

---

## 十、Page Design — Review

与 v1.x 一致，修复：
- Bar chart opacity: 0.15 → 0.6（柱状图可见）
- 硬编码 "focus" 替换为 `t("focusLabel")`

---

## 十一、Dual Theme System

### 原则

- 语义色（Green/Purple/Orange/Indigo/Red）固定不变
- Light/Dark 只调 surface 层（背景/卡片/边框/文字）
- 不做局部混搭 — 主题内视觉完全统一

### Surface Tokens

| Token | Light | Dark |
|-------|-------|------|
| bg-primary | #ffffff | #111111 |
| bg-page | #fafafa | #0a0a0a |
| bg-secondary | #f5f5f5 | #1a1a1a |
| bg-hover | #f0f0f0 | #262626 |
| border | #e8e8e8 | #222222 |
| text-primary | #111111 | #e5e5e5 |
| text-secondary | #666666 | #888888 |
| text-muted | #999999 | #666666 |

### CSS Variables

已在 `globals.css` 定义 `:root` (Light) 和 `.dark` (Dark) 两套完整变量。

---

## 十二、Multi-Platform Design

### 三端定位

| 端 | 主界面 | 快捷入口 | 技术栈 |
|----|--------|----------|--------|
| Web | 完整 Fragment Feed + 全功能 | — | Next.js |
| Desktop | 复用 Web 布局 + 原生标题栏 | Menubar popup (⌘⇧D) | Tauri |
| Mobile | 轻量 Today + Fragment Feed | 通知 / Share Sheet | React Native |

### Desktop 独占能力 (6 项)

1. **Menubar 常驻** — 菜单栏快速输入碎片
2. **应用上下文感知** — Accessibility API，碎片自动关联当前 App 项目
3. **智能剪贴板监听** — 复制内容 AI 判断是否值得捕获
4. **系统级专注模式** — 联动 macOS Focus，屏蔽干扰 App
5. **可交互原生通知** — 通知栏直接确认/编辑 AI 结果
6. **全局 ⌘K** — 任何 App 内唤起搜索+捕获

### Mobile 设计

- 顶部问候 + 碎片待确认数
- 碎片输入框（文字 + 语音 + 截图）
- Fragment Card（待确认碎片）
- 今日概览统计
- 底部 3 Tab: 今日 / 捕获 / 收集箱
- 独占: Share Sheet 捕获

### 三端能力矩阵

| 能力 | Web | Desktop | Mobile |
|------|-----|---------|--------|
| Fragment Feed | ✓ | ✓ 复用 | 轻量版 |
| 全功能页面 | ✓ | ✓ 复用 | — |
| Menubar 常驻 | — | ✓ | — |
| 上下文感知 | — | ✓ | — |
| 剪贴板监听 | — | ✓ | — |
| 专注模式 | — | ✓ | — |
| 全局 ⌘K | 页面内 | ✓ 全局 | — |
| 原生通知 | 浏览器 | ✓ | ✓ |
| Share Sheet | — | — | ✓ |
| 离线缓存 | 有限 | SQLite | SQLite |

### Responsive Breakpoints

| Breakpoint | Range | Layout |
|------------|-------|--------|
| Mobile | < 768px | 单列, Fragment Feed only |
| Tablet | 768-1024px | 双列紧凑 |
| Desktop | 1024px+ | Full Feed + Side Panel |

---

## 十三、Wow Moments

1. **Fragment Feed 碎片流** — 打开 Today，看到的不是任务清单，是 AI 为你处理碎片的过程。每条碎片从原始输入到结构化执行，链路可见。
2. **多通道碎片汇聚** — 🎤语音 / 📸截图 / 💬文字 / 📋剪贴板，来源可视化，让用户感知"多通道汇聚"的价值。
3. **AI 实体提取** — 彩色标签展示 AI 从非结构化输入中提取的结构化实体（任务/事件/人物/项目/时间），核心能力可视化。
4. **Desktop 上下文感知** — 知道你在用 VS Code/Slack/Chrome，碎片自动关联对应项目，零手动操作。
5. **⌘K 全局命令面板** — 键盘驱动，搜索+捕获+快速操作，不切换窗口。

---

## 关联文档

| Document | Path |
|----------|------|
| Technical Architecture | `docs/architecture/technical-architecture.md` |
| Database Schema | `docs/architecture/database-schema.sql` |
| Auth Design | `docs/architecture/auth-design.md` |
| API Response Format | `docs/architecture/api-response-format.md` |
| Implementation Plan | `docs/architecture/plans/2026-03-10-ui-redesign.md` |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-03-10 | Initial design system |
| v1.1 | 2026-03-10 | Sidebar 改为 Light Gray; Today 四象限; Inbox 多模态 |
| v2.0 | 2026-03-10 | **Fragment-First redesign**: Sidebar → TopNav; Today → Fragment Feed; Weekly → Four Quadrant; Dual theme; Multi-platform design |
