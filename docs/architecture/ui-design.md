# Ask Dorian — UI Design System

> **Version**: v3.0
> **Design Direction**: Emerald Dark-First — 结晶美学，碎片优先
> **Status**: 已实现，基于 packages/web 实际代码

---

## 目录

- [一、Design Philosophy](#一design-philosophy)
- [二、Color System](#二color-system)
- [三、Typography](#三typography)
- [四、Spacing & Layout](#四spacing--layout)
- [五、Animation Rules](#五animation-rules)
- [六、Navigation](#六navigation)
- [七、Page Designs](#七page-designs)
- [八、Component Patterns](#八component-patterns)
- [九、GlobalSearch — Cmd+K 覆盖层](#九globalsearch--cmdk-覆盖层)
- [十、Dual Theme System](#十dual-theme-system)
- [十一、Multi-Platform Design](#十一multi-platform-design)
- [十二、Wow Moments](#十二wow-moments)
- [关联文档与 Changelog](#关联文档与-changelog)

---

## 一、Design Philosophy

### v3.0 核心转变

**Emerald Dark-First** — 从 Fragment-First 的功能导向，进化到有明确视觉个性的暗色结晶美学。

| v2.0 | v3.0 |
|------|------|
| Top Nav 水平导航 | 左侧 Sidebar w-64（Desktop）+ 底部 Bottom Nav（Mobile） |
| Indigo/Violet 品牌色 | Emerald (#10b981 dark / #059669 light) 单主品牌色 |
| 亮色主题为主 | **Dark 优先**，`defaultTheme="dark"`，Light 作为切换选项 |
| Fragment Feed 主角 | Fragment Stream 独立页 + Today Dashboard 并行 |
| 纯功能型 | 装饰性 Orbs + Crystalline Gradient + Glass Panel 结晶质感 |
| Vite SPA | Next.js 15 + next-themes + framer-motion |

### 设计原则

- **Dark-First**: 默认暗色，所有视觉决策优先保证暗色下的可读性与质感
- **Crystalline Aesthetic**: Glass Panel、Radial Gradient Orbs、backdrop-blur，产生"凝固光影"的质感
- **Emerald as Signal**: Emerald 仅用于 primary 元素（active 状态、CTA、AI 指示器、进度条），不滥用
- **Fragment-First Philosophy**: 产品核心仍是碎片输入 → AI 理解 → 结构化结果，设计叙事围绕这个流程
- **克制精致**: 装饰元素（orbs、gradient lines）不干扰信息层级，背景层永远服务于内容层

---

## 二、Color System

### 主品牌色 — Emerald

| 场景 | Token | 值 |
|------|-------|----|
| Dark 主题 primary | `--primary` | `#10b981` (Emerald 500) |
| Light 主题 primary | `--primary` | `#059669` (Emerald 600) |
| Dark glow | `--primary-glow` | `rgba(16, 185, 129, 0.15)` |
| Light glow | `--primary-glow` | `rgba(5, 150, 105, 0.10)` |
| focus ring | `--ring` | 同 primary |
| shimmer 高光 | inline | `rgba(16, 185, 129, 0.15)` |

### Surface Tokens

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--bg` | `#09090b` | `#fafafa` | 页面底色 |
| `--surface` | `#18181b` | `#ffffff` | 卡片、Sidebar、面板 |
| `--border` | `#27272a` | `#e5e7eb` | 分隔线、卡片边框 |
| `--text` | `#f8fafc` | `#0f172a` | 主文字 |
| `--muted-foreground` | `#94a3b8` | `#64748b` | 次要文字、描述 |

### shadcn semantic token 映射

globals.css 同时维护 shadcn 标准 token（`--background`、`--foreground`、`--card` 等），保证 shadcn/ui 组件库（Button、Dialog 等）在两套主题下均正常渲染。两套 token 体系通过 `@theme inline` 在 Tailwind 4 中统一暴露。

### Slate 调色板（辅助文字）

整套 UI 中辅助文字统一使用 `slate-*` 系列（非自定义 token），具体分级：

| 颜色 | 用途 |
|------|------|
| `text-slate-400` | 导航项非激活文字、描述文字 |
| `text-slate-500` | 次要标签、时间戳、placeholder |
| `text-slate-600` | 极弱提示、group label、monospace 时间 |
| `text-slate-700` | 几乎不可见的装饰性元素 |

### Support Page 例外色

Support 页的 category icon 使用固定语义色（不跟随 primary 变化）：

| 分类 | 颜色 |
|------|------|
| Documentation | `text-indigo-500` |
| FAQ | `text-emerald-500` |
| Privacy & Security | `text-blue-500` |
| Direct Support | `text-rose-500` |

---

## 三、Typography

### 字体

```css
/* globals.css @theme inline */
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```

- 通过 `next/font/google` 加载 Inter，注入 `--font-sans` CSS variable
- 根元素 `@apply font-sans`
- Monospace（时间、指标、代码）直接使用 `font-mono`（Tailwind 默认 mono stack）

### 字重规范

| 用途 | 类名 |
|------|------|
| 普通正文 | `font-medium` |
| 卡片标题、Setting item | `font-bold` |
| 页面大标题、stats 数值 | `font-black` |
| 导航 section label（全大写）| `font-black uppercase tracking-widest` |
| 徽章、tag、badge | `font-bold uppercase tracking-widest` 或 `tracking-tighter` |

### 字号分级

| Token | 尺寸 | 典型场景 |
|-------|------|----------|
| `text-[8px]` | 8px | Cmd+K 徽章内文字 |
| `text-[9px]` | 9px | QuickCaptureBar 底部提示 |
| `text-[10px]` | 10px | Section label、Badge、时间戳、NavItem sub |
| `text-xs` | 12px | 描述文字、tooltip、stat unit |
| `text-sm` | 14px | 正文、列表项、input |
| `text-base` | 16px | Header 标题（md 以下）|
| `text-lg` | 18px | Header 标题（md 以上）、卡片标题 |
| `text-xl` | 20px | 段落强调 |
| `text-2xl` | 24px | Settings 用户名 |
| `text-3xl` | 30px | Knowledge 页标题 |
| `text-4xl` | 36px | Review 页标题、stat 数值 |
| `text-6xl/8xl` | 60/96px | Landing Hero 标题 |

### Tracking 规范

- 普通标题：`tracking-tight`
- Hero 大字：`tracking-tighter`
- Section label / Badge：`tracking-widest`（配合 uppercase）
- 极小 badge：`tracking-[0.2em]` 或 `tracking-tighter`

---

## 四、Spacing & Layout

### AppShell 结构

```
┌─────────────────────────────────────────────────────────────┐
│  <div class="flex h-screen overflow-hidden bg-bg-dark">     │
│  ┌──────────────────┬────────────────────────────────────┐  │
│  │  Sidebar w-64    │  <main class="flex-1 flex-col">    │  │
│  │  (hidden <lg)    │                                    │  │
│  │                  │  ┌──────────────────────────────┐  │  │
│  │  Logo            │  │  Header h-16 (sticky z-50)   │  │  │
│  │  NavItems        │  └──────────────────────────────┘  │  │
│  │  ...             │                                    │  │
│  │  DailyGoal       │  ┌──────────────────────────────┐  │  │
│  │  Settings        │  │  <div flex-1 min-h-0>        │  │  │
│  │  UserInfo        │  │   AnimatePresence / page     │  │  │
│  └──────────────────┘  │  </div>                      │  │  │
│                        └──────────────────────────────┘  │  │
│                                                           │  │
│                        QuickCaptureBar (absolute bottom)  │  │
│                        GlobalSearch (fixed overlay)       │  │
│  </div>                                                   │  │
└─────────────────────────────────────────────────────────────┘
  Mobile: Sidebar 隐藏，Bottom Nav fixed bottom
```

### Sidebar 尺寸

- 宽度：`w-64`（256px），`hidden lg:flex`
- 背景：`bg-surface-dark/30 border-r border-border-dark`
- Logo 区：`p-6`
- Nav 区：`px-4 space-y-1`
- 底部区：`p-4 mt-auto space-y-4`

### Header 尺寸

- 高度：`h-16`
- 位置：`sticky top-0 z-50`
- 背景：`bg-surface-dark/30 backdrop-blur-md border-b border-border-dark`
- 横向内边距：`px-4 md:px-8`

### 页面内容区

- 页面滚动容器：`flex-1 overflow-y-auto custom-scrollbar`
- 页面内边距：`p-4 md:p-8`（各页自管理）
- 最大宽度（centered 布局）：`max-w-4xl` 或 `max-w-6xl mx-auto`
- 移动端底部留白：`pb-20 lg:pb-0`（为 Bottom Nav 让位）

### 卡片与间距

| 场景 | 值 |
|------|----|
| 卡片圆角 | `rounded-2xl`（主卡片）、`rounded-xl`（小元素）、`rounded-3xl`（Modal、头像） |
| 卡片内边距 | `p-6`（标准）、`p-4`（紧凑）|
| Section 间距 | `space-y-8` |
| 列表项间距 | `space-y-3`、`space-y-4` |
| Grid gap | `gap-6`（卡片网格）、`gap-4`（紧凑网格）|

---

## 五、Animation Rules

### 动画框架

使用 `framer-motion`（全局），`tw-animate-css`（Tailwind utility 级别辅助）。

### 页面切换动画

AppShell 通过 `AnimatePresence mode="wait"` 包裹 `{children}`，每次路由变更触发：

```tsx
// app-shell.tsx
<motion.div
  key={pathname}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
>
```

### AI Shimmer

用于 AI 处理进行中的视觉反馈（ai-shimmer CSS class）：

```css
/* globals.css */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.ai-shimmer {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    rgba(16, 185, 129, 0.15) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

### Hover 微交互

整套 UI 的 hover 效果统一规范：

| 交互 | 类名 |
|------|------|
| 卡片浮起 | `hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300` |
| 卡片边框发光 | `hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10` |
| 图标 hover 变 primary | `group-hover:text-primary transition-colors` |
| 标题 hover 变 primary | `group-hover:text-primary transition-colors` |
| 图标 scale up | `group-hover:scale-110 transition-transform` |
| 箭头向右移动 | `group-hover:translate-x-1 transition-transform` |
| 按钮点击收缩 | `active:scale-[0.98]` 或 `active:scale-95` |
| CTA hover 放大 | `hover:scale-105` |

### 允许的其他动画

- `animate-spin`（加载 spinner）
- `animate-pulse`（状态指示点、Focus Mode 图标）
- Login 页 framer-motion `initial: {opacity:0, scale:0.95}`

### 禁止的动画

- Confetti、粒子效果、弹性回弹、纯装饰性脉冲
- 超过 500ms 的 transition（除背景 orb blur 等 purely decorative 元素外）

---

## 六、Navigation

### Desktop Sidebar（w-64，lg 以上显示）

```
┌─────────────────────────────────────────┐
│  [Bot icon]  Dorian          [+ circle] │  ← Logo + QuickAdd
├─────────────────────────────────────────┤
│  MAIN NAVIGATION                        │  ← section label
│                                         │
│  [LayoutDashboard]  Today         >     │  ← active: bg-primary/10 border-primary/20
│  [Zap]              Stream              │  ← inactive: text-slate-400
│  [Library]          Library             │
│  [History]          Review              │
│                                         │
│  SUPPORT                                │
│  [HelpCircle]       Support             │
│  [Sparkles]         What's New          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ DAILY GOAL  ████████░░  65% done  │  │  ← DailyGoal card
│  └───────────────────────────────────┘  │
│  [Settings] Settings                    │
│  ─────────────────────────────────────  │
│  [Avatar]  UserName     PRO    [LogOut] │  ← UserInfo
└─────────────────────────────────────────┘
```

**激活状态样式**：`bg-primary/10 text-primary border border-primary/20 font-bold` + `<ChevronRight>` 图标

**非激活样式**：`text-slate-400 hover:text-text-main hover:bg-white/5`

### Mobile Bottom Navigation（lg 以下，fixed bottom）

```
┌──────────────────────────────────────────────┐
│  [Dashboard]  [Zap]  [Library]  [History]  [Settings] │
│   Today      Stream  Library    Review    Settings     │
└──────────────────────────────────────────────┘
```

- 背景：`bg-bg-dark/80 backdrop-blur-xl border-t border-border-dark`
- 激活：`text-primary`，非激活：`text-slate-500`
- 图标尺寸 20px + 10px label（uppercase tracking-tighter）
- z-index: `z-50`

### Header

位于 `main` 区域顶部，sticky：

```
┌──────────────────────────────────────────────────────────────┐
│  [Page Title]  [subtitle]   [Focus Mode]  [Search⌘K]  [🌙] [🔔] │
└──────────────────────────────────────────────────────────────┘
```

| 元素 | 说明 |
|------|------|
| Page Title | `text-base md:text-lg font-black tracking-tight` |
| Subtitle | `text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500`，sm 以下隐藏 |
| Focus Mode 按钮 | 激活：`bg-primary/20 border-primary text-primary`；图标 `animate-pulse` |
| Search 搜索框 | Desktop only（`hidden lg:flex`），宽 `w-48 xl:w-64`，显示 `⌘K` 徽章 |
| 主题切换 | `Moon` / `Sun` icon，`size-9 rounded-xl hover:bg-white/5` |
| 通知铃铛 | `Bell` icon + `size-1.5 bg-primary rounded-full` 红点 |
| 移动端 Avatar | `hidden` on lg，`size-8 rounded-lg` gradient 头像 |

### QuickCaptureBar

浮在 main 区域底部（`absolute bottom-12`），Settings 页隐藏：

```
┌──────────────────────────────────────────────────────────────┐
│  [✦]  Type anything to capture…      [📷] [🎤]  |  Process →  │
└──────────────────────────────────────────────────────────────┘
         ⌘K Search                 • Neural Engine Active
```

- 容器：`bg-surface-dark/90 backdrop-blur-2xl rounded-2xl border border-border-dark`
- `focus-within`: `border-primary/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]`
- 左侧 icon：`size-9 rounded-xl bg-primary/10 text-primary`（Sparkles）
- 右侧附件按钮：ImageIcon / Mic，hover 变 primary
- 提交按钮：`bg-primary text-white px-4 h-9 rounded-xl shadow-lg shadow-primary/20`
- 底部：⌘K 提示 + `size-1 bg-emerald-500 animate-pulse` + "Neural Engine" 标签

---

## 七、Page Designs

### 7.1 Landing Page（`/`）

路由：`packages/web/src/app/page.tsx`，无需认证，强制暗色（硬编码 `bg-[#09090b]`）。

**布局层次**：

1. **Background Layer**（`pointer-events-none`）
   - 顶部渐变：`h-[800px] bg-gradient-to-b from-emerald-500/10 to-transparent`
   - 左侧 Orb：`size-[600px] bg-emerald-500/5 rounded-full blur-[120px]`
   - 右侧 Orb：`size-[500px] bg-indigo-500/5 rounded-full blur-[100px]`
2. **Nav**：Logo（Diamond icon + "Dorian"）+ 链接（Philosophy/Features/Pricing）+ "Sign In" 白色胶囊按钮
3. **Hero**（framer-motion `initial opacity:0 y:20`）：
   - Fragment-First 徽章：`bg-emerald-500/10 border-emerald-500/20 text-emerald-500`
   - 大标题：`CRYSTALLIZE YOUR THOUGHTS`，第二行文字渐变：`from-emerald-500 via-indigo-400 to-emerald-500/60`
   - 副标题：`text-slate-400`
   - CTA：`bg-emerald-500 ... rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105`
   - 次要 CTA："Watch Demo" 空心圆角按钮
4. **App Preview** Mockup（`rounded-3xl border border-white/10 bg-[#18181b]/40 backdrop-blur-sm`）：
   - 悬浮 Feature Card（Instant Extraction / Context Aware），`bg-[#18181b]/70 backdrop-blur-xl`
   - 底部渐变遮罩 `bg-gradient-to-t from-[#09090b]`
5. **Footer**：`border-t border-white/5`，Privacy / Terms / Security 链接，hover 变 emerald

### 7.2 Login Page（`/[locale]/login`）

路由：`(auth)/login/page.tsx`，全屏居中，暗色。

**结构**：

- 顶部/底部各一条水平渐变线：`h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent`
- 中央卡片（`max-w-md`，framer-motion `scale: 0.95 → 1`）：
  - Logo：`size-16 bg-primary rounded-2xl shadow-2xl shadow-primary/40`，Diamond icon
  - 标题 + 副标题
  - **Continue with Email** 按钮 → 展开 Email 表单（AnimatePresence）
  - 分隔线 + GitHub / Google 两个半宽按钮
  - 服务条款文字
- 背景 Orb：`size-[800px] bg-primary/5 rounded-full blur-[120px] -z-10`

**Email Form 展开动画**：`motion.form initial opacity:0 y:10` → `animate opacity:1 y:0`

### 7.3 Today Page（`/[locale]/today`）

路由：`(app)/today/page.tsx`，主 Dashboard。

**整体布局**：`p-4 md:p-8 space-y-8`

1. **AI Summary Banner**（full-width rounded-2xl）
   - 背景：`bg-surface-dark border border-primary/20`
   - Sparkles 徽章 + 自然语言 AI 摘要文字 + "Full Briefing" 按钮
   - 右上角 Orb：`size-48 bg-primary/10 blur-[80px]`，hover 时 `bg-primary/20`
2. **主内容 Grid**：`grid-cols-1 lg:grid-cols-12 gap-8`
   - **Morning Ritual**（`lg:col-span-5`）：可勾选清单，focus 项有 `ring-1 ring-primary/20` + `timeboxing` 标签
   - **Daily Timeline**（`lg:col-span-7`）：`h-[480px]` 相对定位容器，`grid-cols-[60px_1fr]` 时间轴，dot grid 背景
3. **Stats Section**：`grid-cols-2 lg:grid-cols-4`，4 个 stat 卡片（Focus Score / Deep Work / Tasks Done / Energy Peak）
   - hover：`border-primary/50`，数值 `text-2xl font-black`，趋势值 `text-primary`

**Daily Timeline 特殊元素**：
- 当前时间指示线：`h-px bg-primary/30` + `bg-primary text-white px-2 py-0.5 rounded-full` 标签，位置 `top-[160px]`
- Drop Zone 槽：`border-2 border-dashed border-primary/20`，hover `border-primary/50`，Sparkles icon
- 点阵背景：`radial-gradient(circle at 2px 2px, white 1px, transparent 0) 24px 24px` opacity 3%

### 7.4 Fragment Stream Page（`/[locale]/stream`）

路由：`(app)/stream/page.tsx`，碎片流。

**整体布局**：`max-w-4xl mx-auto p-8 space-y-8`

1. **页头**：标题（`text-2xl font-bold`）+ 视图切换（List / Grid toggle，`bg-surface-dark border border-border-dark rounded-lg`）
2. **Tab Bar**：`flex border-b border-border-dark gap-8`，激活：`text-primary font-bold border-b-2 border-primary`
3. **Fragment Card 列表 / Grid**：
   - 容器：`bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-6`
   - hover：`hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01]`
   - 原始内容引用块：`bg-bg-dark/40 rounded-xl p-3 border-l-4 border-primary/40`，斜体
   - Tag 徽章：`text-primary bg-primary/5 border border-primary/10`，`#Tag` 前缀
   - Status 文字：`text-primary font-bold uppercase tracking-widest text-[10px]`
4. **Drop Zone**：`border-2 border-dashed border-border-dark`，大号 UploadCloud icon，hover `border-primary/40 bg-primary/5`

### 7.5 Knowledge Library Page（`/[locale]/knowledge`）

路由：`(app)/knowledge/page.tsx`，知识库。

**整体布局**：`max-w-6xl mx-auto p-4 md:p-8 space-y-8`

1. **页头**：标题（`text-3xl font-bold`）+ Grid/List 视图切换 + Filter 下拉（点击展开绝对定位下拉菜单）
2. **搜索框**：
   - `bg-surface-dark/80 border rounded-xl pl-12 pr-12 py-3.5`
   - focus 状态：`border-primary shadow-[0_0_20px_rgba(16,185,129,0.15)]`
   - 搜索中：`Loader2 animate-spin text-primary`；有内容：X 清空按钮
3. **知识卡片 Grid**（默认）：`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
   - 卡片：`bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-6`
   - hover：`hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02]`
   - Project badge：`bg-primary/10 text-primary border border-primary/20 rounded-full`
   - 标题：hover 变 `text-primary`
   - Tags：`text-slate-500 font-mono`，hover 变 `text-primary`，`#` 前缀
4. **空结果状态**：`text-center py-20 text-slate-500`

### 7.6 Weekly Review Page（`/[locale]/review`）

路由：`(app)/review/page.tsx`，周复盘。

**整体布局**：`max-w-4xl mx-auto p-4 md:p-8 space-y-8`

1. **页头**：标题（`text-4xl font-black tracking-tight`）+ Share / Export Report 按钮
2. **Stats Grid**（`grid-cols-1 md:grid-cols-3 gap-6`）：
   - 3 个 stat 卡片（Focus Score / Deep Work / Completed Tasks）
   - 数值：`text-4xl font-black`，hover 变 `text-primary`，trend：`text-primary text-sm font-bold`
3. **Focus Intensity Chart**（手写柱状图）：
   - 7 根柱子，`flex items-end justify-between h-48`
   - 每根：`bg-primary/40 rounded-t-sm`，hover `bg-primary/60`
   - Tooltip：绝对定位，opacity-0 → group-hover:opacity-100
   - X轴：Mon/Tue/Wed/Thu/Fri/Sat/Sun，`font-mono uppercase tracking-widest text-[10px]`
4. **Key Accomplishments + Upcoming Focus**（`grid-cols-1 md:grid-cols-2 gap-8`）：
   - 每项：`p-4 rounded-xl bg-surface-dark/40 border border-border-dark/50`
   - Accomplishment 左侧：`size-2 rounded-full bg-primary`，hover `scale-150`
   - Upcoming 左侧：ArrowRight icon，hover `translate-x-1`
5. **Dorian's Weekly Insight**（framer-motion 淡入）：
   - `bg-primary/5 border border-primary/20 rounded-2xl p-8`
   - 右下角 Orb：`size-64 bg-primary/10 blur-[100px]`，hover `bg-primary/20 duration-700`
   - Sparkles icon，点击 "View Patterns" 链接

### 7.7 Settings Page（`/[locale]/settings`）

路由：`(app)/settings/page.tsx`，设置，QuickCaptureBar 在此页隐藏。

**整体布局**：`max-w-2xl mx-auto p-4 md:p-8`

1. **Profile Section**：`size-132 rounded-3xl`头像，hover 显示 Camera 覆盖层，右下角 primary 编辑按钮
2. **Account & Security 分组**：SettingItem 列表（Profile Info / Security & Privacy / Custom Icons / Subscription）
   - 每项：`border-b border-white/5 last:border-none hover:bg-white/5`
   - icon 容器：`size-10 rounded-xl bg-white/5 group-hover:bg-primary/10 group-hover:text-primary`
3. **AI Preferences 分组**：
   - Classification Threshold Slider：`accent-primary`，数值 `text-primary font-mono font-bold text-lg`
   - "Customize" 按钮触发 Modal
   - Auto-Crystallize Toggle：自定义 toggle（`w-10 h-5 rounded-full bg-primary / bg-slate-700`）
4. **System 分组**：Notifications / Language / Connected Devices / Data Management
5. **Sign Out 按钮**：`bg-red-500/5 hover:bg-red-500/10 text-red-500 border-red-500/10`，LogOut 图标 hover `translate-x-[-4px]`
6. **Threshold Modal**（AnimatePresence）：
   - 背景：`bg-bg-dark/80 backdrop-blur-sm`
   - 卡片：`bg-surface-dark border border-border-dark rounded-3xl p-8`，framer-motion `scale:0.9 → 1`
   - 大号数字显示：`text-4xl font-black text-primary font-mono`
   - 保存按钮：`bg-primary text-white rounded-2xl shadow-lg shadow-primary/20`

### 7.8 Support Page（`/[locale]/support`）

路由：`(app)/support/page.tsx`。

**整体布局**：`max-w-4xl mx-auto p-4 md:p-8 space-y-12`

1. **Hero Section**：居中标题 + 搜索框（`rounded-2xl focus:border-primary`）
2. **Categories Grid**（`grid-cols-1 md:grid-cols-2 gap-6`）：4 张卡片（framer-motion 逐项淡入）
   - icon 容器：`size-14 rounded-2xl bg-white/5`，每类有独立语义色
   - hover：`border-primary/30 bg-white/5`，ChevronRight `group-hover:translate-x-1`
3. **Feedback Banner**：`bg-primary/5 border border-primary/20 rounded-3xl`，大号 MessageSquare + CTA 按钮
4. **System Status Grid**（`grid-cols-1 sm:grid-cols-2 md:grid-cols-4`）：
   - operational：`size-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`
   - degraded：`size-2 bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]`
5. **Footer Links**：`border-t border-border-dark`，Terms / Privacy / Cookie Policy + ExternalLink icon

---

## 八、Component Patterns

### glass-panel

```css
/* globals.css */
.glass-panel {
  @apply bg-surface-dark/70 backdrop-blur-xl border border-border-dark/50;
}
```

用于需要玻璃质感的浮层（如 Floating Feature Card）。

### crystalline-gradient

```css
/* globals.css */
.crystalline-gradient {
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent),
    radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent);
}
```

页面主容器背景点缀，产生"翡翠折光"的结晶感。

### custom-scrollbar

```css
/* globals.css */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-border-dark rounded-full; }
```

所有页面主滚动容器均添加此类，保持极简滚动条风格。

### Fragment Card

标准碎片卡片结构（Stream 页、Knowledge 页通用）：

```
┌──────────────────────────────────────────────────────┐
│  [Status badge]                          [timestamp]  │
│  Card Title (hover → text-primary)                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │ "原始内容" (border-l-4 border-primary/40 斜体)  │ │
│  └─────────────────────────────────────────────────┘ │
│  #Tag1  #Tag2  #Tag3                                  │
└──────────────────────────────────────────────────────┘
```

容器：`bg-surface-dark/40 border border-border-dark/50 rounded-2xl p-6`

### SettingItem

```tsx
// settings/page.tsx
<div className="flex items-center justify-between p-4 border-b border-white/5 last:border-none hover:bg-white/5 cursor-pointer group">
  <div className="flex items-center gap-4">
    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
  <ChevronRight className="text-slate-600 group-hover:text-text-main" />
</div>
```

### Decorative Orb

所有大 blur 圆形装饰元素的通用模式：

```tsx
<div className="absolute -right-12 -top-12 size-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
```

- 尺寸按场景调整（`size-48` → `size-64` → `size-[800px]`）
- 模糊半径：`blur-[80px]` / `blur-[100px]` / `blur-[120px]`
- 默认 5-15% opacity，hover 时加强

### Gradient Separator Lines

Login 页顶/底装饰线，亦可用于 section 分隔：

```tsx
<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
```

---

## 九、GlobalSearch — Cmd+K 覆盖层

**触发方式**：`⌘K`（macOS）/ `Ctrl+K`（Windows），AppShell 全局监听 keydown。Header 搜索框按钮也可触发。

**位置**：`fixed inset-0 z-[100]`，AppShell 最外层渲染。

**结构**：

```
┌──────────────────────────────────────────────────┐
│  bg-bg-dark/60 backdrop-blur-md (点击关闭)         │
│  ┌────────────────────────────────────────────┐  │
│  │  bg-surface-dark border border-border-dark │  │
│  │  rounded-2xl max-w-2xl shadow-2xl          │  │
│  │                                            │  │
│  │  [Search icon]  Search input…    [⌘K] [X]  │  │
│  │  ──────────────────────────────────────── │  │
│  │  [结果列表]                                │  │
│  │    [icon]  Title                 →         │  │
│  │    [icon]  Title                 →         │  │
│  │  ──────────────────────────────────────── │  │
│  │  ↑↓ NAVIGATE  ↵ SELECT        GLOBAL SEARCH│  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**搜索框 focus 状态**：`border-primary/50 bg-primary/5`，Search icon 变 `text-primary`，⌘K 徽章变 `bg-primary/20 border-primary/30 text-primary`

**结果项 hover**：`hover:bg-primary/10`，图标变 `text-primary`，ArrowRight `opacity-0 → group-hover:opacity-100 group-hover:translate-x-1`

**动画**：framer-motion `initial scale:0.95 y:-20` → `animate scale:1 y:0`，backdrop `opacity:0 → 1`

**搜索内容类型**：navigation（页面跳转）+ fragment（知识片段）

---

## 十、Dual Theme System

### 架构

使用 `next-themes` 管理主题，AppShell / ThemeProvider 设置 `defaultTheme="dark"`。

通过 `@custom-variant dark (&:is(.dark *))` 在 Tailwind 4 中注册 dark variant，`.dark` class 挂载在 `<html>` 元素上（next-themes 默认行为）。

### CSS 变量双套

```css
/* :root — Light Theme */
:root {
  --primary: #059669;           /* Emerald 600 */
  --primary-glow: rgba(5, 150, 105, 0.1);
  --bg: #fafafa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text: #0f172a;
}

/* .dark — Dark Theme（default） */
.dark {
  --primary: #10b981;           /* Emerald 500 */
  --primary-glow: rgba(16, 185, 129, 0.15);
  --bg: #09090b;
  --surface: #18181b;
  --border: #27272a;
  --text: #f8fafc;
}
```

### 主题切换按钮

Header 右侧：
- Dark 时显示 `<Sun size={18} />`
- Light 时显示 `<Moon size={18} />`
- 调用 `useTheme()` 的 `setTheme(resolvedTheme === "dark" ? "light" : "dark")`

### 主题一致性原则

- **语义色保持稳定**：`text-emerald-500`（support page status）、`text-red-500`（logout button）等固定语义色在两套主题下视觉含义不变
- **Slate 调色板跟随系统**：dark 下 slate-400/500/600 已足够有对比度，light 下略暗但可读
- **不做局部混搭**：不允许在页面的某个区域强制反转主题

---

## 十一、Multi-Platform Design

### 三端定位

| 端 | 主界面 | 输入渠道 | 技术栈 | 状态 |
|----|--------|----------|--------|------|
| Web | 完整 AppShell + 所有页面 | QuickCaptureBar + Cmd+K | Next.js 15 | MVP ✓ |
| Desktop | 复用 Web + 原生标题栏 | 菜单栏弹出（⌘⇧D）+ 全局 Cmd+K | Tauri | 规划中 |
| Mobile | 轻量 Today + Stream | Share Extension + 语音 | React Native | 规划中 |

### Responsive Breakpoints

| Breakpoint | 范围 | 布局变化 |
|------------|------|----------|
| Mobile | < 1024px | Sidebar 隐藏；Bottom Nav 显示；padding `p-4`；QuickCaptureBar 窄屏适配 |
| Desktop | ≥ 1024px | Sidebar `w-64` 显示；Bottom Nav 隐藏；padding `p-8`；Header 搜索框显示 |

关键 breakpoint 为 `lg`（1024px），无 `md` 级别的 sidebar 状态。

### Desktop 独占能力（规划）

1. Menubar 常驻 — 任何 App 内快速捕获碎片
2. 应用上下文感知 — Accessibility API 自动关联当前 App
3. 智能剪贴板监听 — 复制即捕获
4. 系统级专注模式 — 联动 macOS Focus
5. 可交互原生通知 — 通知栏直接确认 AI 结果
6. 全局 ⌘K — 跨 App 搜索+捕获

### Mobile 设计（规划）

- 底部 3 Tab（Today / Capture / Stream）
- Share Sheet 接入
- 语音输入 → Whisper API
- React Native 复用同一品牌色系 + Emerald primary

---

## 十二、Wow Moments

**1. Crystalline Landing**
打开 landing page，大字 "CRYSTALLIZE YOUR THOUGHTS" 配合翡翠绿渐变字 + 背景 radial orbs，第一眼传达"这不是普通的任务管理工具"。

**2. Fragment 原始 → 结晶 过程**
Stream 页每张 Fragment Card，从原始语音/截图/文字（斜体引用块）到结构化标签+标题，用户看到 AI"结晶化"自己思维碎片的全过程。

**3. QuickCaptureBar 聚焦光晕**
输入框聚焦时，`shadow-[0_0_30px_rgba(16,185,129,0.1)]` 光晕扩散，底部 `animate-pulse` 绿点 + "Neural Engine" 标签，暗示 AI 随时待命。

**4. Cmd+K 全局搜索**
从任意页面，任意时刻，`⌘K` 唤起全屏覆盖搜索。背景 `backdrop-blur-md`，搜索框获焦时边框发绿光，键盘驱动的 power-user 体验。

**5. Today — AI Summary Banner**
每天打开 Today，最顶部是 Dorian 对今天的自然语言总结，配合右上角渐隐 orb 装饰，不是冰冷的 dashboard，是有温度的 AI 陪伴感。

**6. Daily Goal 进度条**
Sidebar 底部的 Daily Goal 卡片，hover 时进度条从 65% 微微增加到 70%（CSS transition），细微的正向反馈。

**7. Hover 微交互统一感**
整套 UI 的 hover 行为高度一致：所有卡片 `-translate-y-1`、所有图标 `group-hover:text-primary`、所有箭头 `translate-x-1`。形成强烈的系统感和精致感。

**8. Weekly Review Insight**
Review 页底部 Dorian's Weekly Insight，右下角有 `size-64 bg-primary/10 blur-[100px]` 大 orb，hover 时 orb 加深（`duration-700` 慢速过渡），营造"AI 在思考"的视觉隐喻。

---

## 关联文档与 Changelog

### 关联文档

| Document | Path |
|----------|------|
| Technical Architecture | `docs/architecture/technical-architecture.md` |
| Database Schema | `docs/architecture/database-schema.sql` |
| Auth Design | `docs/architecture/auth-design.md` |
| API Response Format | `docs/architecture/api-response-format.md` |
| globals.css | `packages/web/src/app/globals.css` |
| AppShell | `packages/web/src/components/layout/app-shell.tsx` |
| Sidebar | `packages/web/src/components/layout/sidebar.tsx` |
| GlobalSearch | `packages/web/src/components/layout/global-search.tsx` |

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-03-10 | Initial design system |
| v1.1 | 2026-03-10 | Sidebar 改为 Light Gray；Today 四象限；Inbox 多模态 |
| v2.0 | 2026-03-10 | Fragment-First redesign：Sidebar → TopNav；Today → Fragment Feed；Weekly → Four Quadrant；Dual theme；Multi-platform design |
| v3.0 | 2026-03-13 | **Emerald Dark-First**：迁移到 Next.js；Sidebar 回归（w-64）；暗色优先（defaultTheme="dark"）；品牌色从 Indigo/Violet → Emerald；新增 Landing、Login、Stream、Knowledge、Settings、Support 页面设计；GlobalSearch Cmd+K；framer-motion 页面切换；QuickCaptureBar；全面基于实际代码整理 |
