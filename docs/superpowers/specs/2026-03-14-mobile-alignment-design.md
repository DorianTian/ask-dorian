# Mobile Package Full Alignment Design Spec

> **Status**: Approved
> **Date**: 2026-03-14
> **Scope**: Mobile package screens, navigation, onboarding — fully align with reference project (`~/Downloads/ask-dorian-mobile/`)

---

## 一、概述

将 `packages/mobile` 的模块结构和视觉语言完全对齐参考项目。参考项目是一个 web 原型（React + Tailwind），需要转换为 React Native（StyleSheet + React Navigation）。

**设计原则：**
- 模块结构 1:1 对齐参考项目（5 主屏 + 4 Onboarding）
- 视觉语言统一 HUD/Terminal 风格（已在 today-screen / weekly-screen 建立）
- 技术栈不变：React Native + React Navigation + Zustand + SWR + lucide-react-native
- 不需要的旧文件直接删除

---

## 二、导航结构

### 2.1 Bottom Tabs（匹配参考 BottomNav）

```
┌─────────┬──────────┬──────────┬──────────┬──────────┐
│  Today  │  Review  │  + FAB   │ Library  │ Settings │
│  Home   │ Calendar │  Plus    │ BookOpen │ Settings │
│         │  Check   │ (center) │          │          │
└─────────┴──────────┴──────────┴──────────┴──────────┘
```

| 位置 | Tab Label | Icon | Screen | 参考文件 |
|------|-----------|------|--------|----------|
| 1 | Today | `Home` | TodayScreen | `Dashboard.tsx` ✅ 已完成 |
| 2 | Review | `CalendarCheck` | WeeklyScreen | `WeeklyReview.tsx` ✅ 已完成 |
| 3 | + (FAB) | `Plus` | DailyReviewScreen | `DailyReview.tsx` **NEW** |
| 4 | Library | `BookOpen` | KnowledgeScreen | `KnowledgeBase.tsx` **NEW** |
| 5 | Settings | `Settings` | SettingsScreen | `Settings.tsx` **NEW** |

**Center FAB 实现：** 参考项目用一个凸起的圆形 Plus 按钮作为中间 tab。在 React Navigation 中通过 `tabBarButton` 自定义渲染实现，导航到 DailyReview 屏幕。

### 2.2 Auth/Onboarding Stack（替换 login/register）

```
Onboarding1 → Onboarding2 → Onboarding3 → Onboarding4 → Main (Dashboard)
     │              │              │              │
     └──────────────┴──────────────┴──── Skip ────┘
```

| Screen | 内容 | 参考文件 |
|--------|------|----------|
| Onboarding1 | Welcome — "Ask Dorian. Stop losing fragments" + Get Started | `Onboarding1.tsx` |
| Onboarding2 | Fragment-First Philosophy — Diamond icon + Continue/Skip | `Onboarding2.tsx` |
| Onboarding3 | Magic Processing — Input→AI→Structured Task 演示 | `Onboarding3.tsx` |
| Onboarding4 | You're all set — Connect Google Calendar / Skip | `Onboarding4.tsx` |

---

## 三、新建屏幕设计

### 3.1 DailyReviewScreen（参考 `DailyReview.tsx`）

卡片式碎片 review 界面，用户逐条处理待确认的 fragment。

**结构：**
- Header：标题 "Daily Review" + 待处理数 + time block badge
- 主卡片（当前 fragment）：
  - 状态标签（Pending Task / Knowledge Node）
  - 捕获时间
  - 标题 + 原文引用块（左边框 primary）
  - 两个 action button：Discard（outline, hover→红） / Accept & Schedule（primary, 完成后变 "Scheduled" + 动画）
- 后续卡片（半透明预览）

**数据：** 可连接 `useFragments({ status: "processed" })` 或用 mock 数据。

### 3.2 KnowledgeScreen（参考 `KnowledgeBase.tsx`）

知识库搜索 + grid/list 双视图。

**结构：**
- Header：标题 "Knowledge Library"
- 右上角：Grid/List 切换 + Filter 按钮
- 搜索栏：full-width input，icon left，clear button right
- 知识卡片列表：
  - Grid 模式：2 列网格
  - List 模式：单列全宽
  - 卡片内容：type badge（icon + label）、标题、描述（截断）、tags、时间
  - Hover/press 效果：border→primary，轻微上移

**数据：** Mock 数据，3 张卡片（Strategy / Research / Archive 三种类型）。

### 3.3 SettingsScreen（参考 `Settings.tsx`）

用户设置页面，分组列表样式。

**结构：**
- 用户信息卡片：头像（Image / 渐变占位）、用户名、邮箱、"Manage Account" link
- Preferences 分组：
  - Appearance（Moon icon，值 "Dark"，ChevronRight）
  - Notifications（Bell icon）
  - Language & Region（Globe icon）
- Privacy & Security 分组：
  - Data Privacy（Shield icon）
  - Connected Devices（Smartphone icon）
- Log Out 按钮（红色 outline，底部）

**交互：** Log Out 调用 `useAuth((s) => s.logout)`，回到 Onboarding。

### 3.4 Onboarding 1-4（参考 `Onboarding1-4.tsx`）

4 页引导流程，全屏 dark 背景 + brand gradient glow。

**Onboarding1 — Welcome：**
- 背景：两个 primary glow blur circle
- 中心：hero 图片（Image + opacity/mix blend）
- 底部：Step 01 badge → 标题 "Ask Dorian." → 副标题 "Stop losing fragments of your brilliance" → 说明文字
- CTA：Get Started button → 进度指示点（3 dots）

**Onboarding2 — Fragment-First：**
- 顶部：X (skip) + "Ask Dorian" title
- 中心：方形图片区域 + Diamond icon overlay
- 底部：标题 "Fragment-First Philosophy" → 副标题 → 进度指示点 → Continue + Skip Intro

**Onboarding3 — Magic Processing：**
- 顶部：← back + "First Value" title
- 进度指示点
- 标题 "Magic Processing" → 说明
- Demo 卡片：Input Note → AI thinking indicator → Structured Task（border-left primary）
- 底部：Continue + Skip

**Onboarding4 — You're all set：**
- 顶部：← back + "Step 3 of 3"
- CheckCircle icon（大，带 glow）
- 标题 "You're all set!" → 说明
- Google Calendar 连接卡片：日历图片 + 说明 + Connect 按钮
- Skip for now

---

## 四、文件变更清单

### 4.1 删除（6 files）

| 路径 | 原因 |
|------|------|
| `screens/auth/login-screen.tsx` | 被 Onboarding 替换 |
| `screens/auth/register-screen.tsx` | 被 Onboarding 替换 |
| `screens/inbox-screen.tsx` | 参考项目无此模块 |
| `screens/projects-screen.tsx` | 参考项目无此模块 |
| `screens/review-screen.tsx` | 被 WeeklyScreen (Review tab) 替代 |
| `components/fragment-card.tsx` | 仅被 inbox-screen 使用，一并删除 |

### 4.2 新建（7 files）

| 路径 | 对应参考 |
|------|----------|
| `screens/daily-review-screen.tsx` | `DailyReview.tsx` |
| `screens/knowledge-screen.tsx` | `KnowledgeBase.tsx` |
| `screens/settings-screen.tsx` | `Settings.tsx` |
| `screens/onboarding/onboarding1.tsx` | `Onboarding1.tsx` |
| `screens/onboarding/onboarding2.tsx` | `Onboarding2.tsx` |
| `screens/onboarding/onboarding3.tsx` | `Onboarding3.tsx` |
| `screens/onboarding/onboarding4.tsx` | `Onboarding4.tsx` |

### 4.3 修改（4 files）

| 路径 | 改动 |
|------|------|
| `navigation/types.ts` | AuthStack → Onboarding ParamList；MainTab → 新 5 tab |
| `navigation/auth-stack.tsx` | Login/Register → Onboarding1-4 |
| `navigation/main-tabs.tsx` | 5 tab 重构 + center FAB |
| `App.tsx` | 更新 linking config screens |

### 4.4 保留不变

| 路径 | 说明 |
|------|------|
| `screens/today-screen.tsx` | ✅ 已完成 |
| `screens/weekly-screen.tsx` | ✅ 已完成 |
| `theme/colors.ts` | ✅ 已完成 |
| `theme/spacing.ts` | 不变 |
| `theme/index.ts` | 不变 |
| `components/empty-state.tsx` | 通用组件，保留 |
| `components/quick-capture.tsx` | TodayScreen 使用，保留 |
| `components/task-item.tsx` | 可能被 DailyReview 使用，保留 |
| `components/event-item.tsx` | 可能被其他屏幕使用，保留 |
| `providers/auth-provider.tsx` | 不变 |
| `lib/config.ts` | 不变 |
| `lib/storage.ts` | 不变 |

### 4.5 文档更新

| 路径 | 改动 |
|------|------|
| `docs/architecture/technical-architecture.md` | 更新 mobile 目录结构 + 模块说明 |

---

## 五、技术实现约定

### 5.1 RN 转换模式（沿用 today-screen / weekly-screen 已建立的模式）

| Web (Tailwind) | React Native |
|---|---|
| `className="..."` | `StyleSheet.create()` |
| `bg-surface/30` | `{ backgroundColor: colors.card + "4D" }` (hex + alpha) |
| `border-primary/20` | `{ borderColor: colors.brandFrom + "33" }` |
| `font-mono` | `Platform.select({ ios: { fontFamily: "Menlo" }, android: { fontFamily: "monospace" } })` |
| `rounded-2xl` | `{ borderRadius: radii.xl }` |
| `text-[10px] uppercase tracking-widest` | `{ fontSize: 10, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" }` |
| `hover:...` | `TouchableOpacity` activeOpacity + active state |
| `animate-pulse` | RN Animated 或 `framer-motion` (如已有) 或静态 |
| `<img src="...">` | `<Image source={{ uri: "..." }} />` |
| `backdrop-blur-*` | 不支持 / 跳过 / 用半透明背景近似 |
| `bg-gradient-*` | `LinearGradient` (expo-linear-gradient) 或纯色近似 |
| `env(safe-area-inset-bottom)` | `SafeAreaView` edges |

### 5.2 Center FAB 实现

```typescript
// main-tabs.tsx
<Tab.Screen
  name="DailyReview"
  component={DailyReviewScreen}
  options={{
    tabBarButton: (props) => (
      <TouchableOpacity
        {...props}
        style={{
          top: -24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.brandFrom,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.brandFrom,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>
    ),
  }}
/>
```

### 5.3 Onboarding 图片处理

参考项目使用外部 Google 图片 URL。在 RN 中：
- 使用 `<Image source={{ uri }}` 加载
- 设置合理的 fallback（背景渐变色代替）
- `resizeMode="cover"`

---

## 六、不做的事（YAGNI）

- ❌ Onboarding 中实际的 Google Calendar OAuth 集成（按钮存在但 MVP 只导航到主界面）
- ❌ Knowledge 页面的真实 API 调用（MVP 用 mock 数据）
- ❌ Settings 中的子页面（Appearance / Notifications 等只展示入口，不跳转）
- ❌ DailyReview 的真实 fragment API 集成（MVP 用 mock 数据展示交互）
- ❌ Sidebar（参考项目的 Sidebar 是 desktop-only，mobile 不需要）
- ❌ i18n（mobile MVP 先英文硬编码，后续再加 i18n）
