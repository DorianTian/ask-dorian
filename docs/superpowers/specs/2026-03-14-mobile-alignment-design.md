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

**Center FAB 实现：** 使用自定义 `tabBar` prop 替代默认 tab bar，以支持 FAB 凸起效果（默认 tab bar 会 clip overflow）。FAB 不显示 label，其余 4 个 tab 正常显示 icon + label。FAB 需要根据 `useSafeAreaInsets().bottom` 动态调整垂直位置，兼容有/无 home indicator 的设备。

### 2.2 Onboarding Stack（替换 login/register）

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

### 2.3 Onboarding / Auth 状态机

参考项目无真实认证（纯 useState 导航）。Mobile 有现有 auth 基础设施，需要协调。

**MVP 方案：** Onboarding 完成即进入主界面，跳过登录。

```
App 启动
  │
  ├─ AsyncStorage: hasCompletedOnboarding === false
  │     → OnboardingStack (1→2→3→4)
  │     → 完成/Skip → 设置 hasCompletedOnboarding = true → MainTabs
  │
  └─ AsyncStorage: hasCompletedOnboarding === true
        → MainTabs (直接进入)
```

**关键决策：**
- 新增 `hasCompletedOnboarding` flag 存储在 AsyncStorage（通过 `lib/storage.ts`）
- `root-navigator.tsx` 的判断逻辑从 `isAuthenticated` 改为 `hasCompletedOnboarding`
- 现有 `auth-provider.tsx` 和 `useAuth` 保留不动（未来加登录时复用）
- Settings "Log Out" → 清除 `hasCompletedOnboarding` + 清除 auth tokens → 回到 Onboarding1
- Onboarding 完成后不触发真实登录（MVP 只做视觉对齐）

**进度指示点标准化（修正参考项目的不一致）：**
- 统一为 4 个点，当前步骤用长条高亮，其余为小圆点
- Onboarding4 不显示进度点（终态页面）

---

## 三、新建屏幕设计

### 3.1 DailyReviewScreen（参考 `DailyReview.tsx`）

卡片式碎片 review 界面，用户逐条处理待确认的 fragment。

**结构：**
- Header：标题 "Daily Review" + 待处理数 + time block badge（右侧，primary/10 bg）
- 主卡片（当前 fragment）：
  - 状态标签（pulsing dot + "Pending Task"）
  - 捕获时间（Clock icon + "Captured 2h ago"）
  - 标题（大号 bold）
  - 原文引用块（bg-bg/40, border-left-4 primary/40, italic text）
  - 两个 action button 并排：
    - Discard（outline, X icon, press→红色高亮）
    - Accept & Schedule（primary bg, Check icon, 完成后 text 变 "Scheduled"）
- 后续卡片（opacity-60 预览，简化信息）

**动画：** Accept 按钮完成后的 Check icon scale+rotate 效果，使用 RN `Animated` API（轻量，无需额外依赖）。

**数据：** Mock 数据（2 张卡片），与参考项目内容一致。

### 3.2 KnowledgeScreen（参考 `KnowledgeBase.tsx`）

知识库搜索 + grid/list 双视图。

**结构：**
- Header：标题 "Knowledge Library"
- 右上角：Grid/List 切换（LayoutGrid/List icon toggle）+ Filter 按钮（ChevronDown）
- 搜索栏：full-width input（Search icon left, X clear right），圆角，focus 时 border→primary + shadow
- 知识卡片列表：
  - Grid 模式：`FlatList` numColumns={2}，固定 2 列
  - List 模式：`FlatList` numColumns={1}，全宽卡片，水平布局（badge/title/tags/time 一行）
  - 卡片内容：type badge（icon + label, pill 样式）、标题、描述（line-clamp）、tags（#tag mono 格式）、时间
  - Press 效果：TouchableOpacity activeOpacity

**数据：** Mock 数据 3 张卡片：
1. "Q4 Market Expansion Thesis" — Strategy (Diamond icon)
2. "Neural Lattice Performance" — Research (FlaskConical icon)
3. "Legacy System Deprecation" — Archive (Archive icon)

### 3.3 SettingsScreen（参考 `Settings.tsx`）

用户设置页面，分组列表样式。

**结构：**
- 用户信息卡片：头像（Image uri / 渐变占位 fallback）、用户名 "Dorian"、邮箱、"Manage Account" text button (primary)
- Preferences 分组（section header + 分组卡片）：
  - Appearance（Moon icon → 值 "Dark" + ChevronRight）
  - Notifications（Bell icon → ChevronRight）
  - Language & Region（Globe icon → ChevronRight）
- Privacy & Security 分组：
  - Data Privacy（Shield icon → ChevronRight）
  - Connected Devices（Smartphone icon → ChevronRight）
- Log Out 按钮（红色 outline border, 底部，LogOut icon + text）

**交互：**
- 设置项只展示入口，press 无响应（MVP）
- Log Out → 清除 `hasCompletedOnboarding` → 回到 Onboarding1

### 3.4 Onboarding 1-4（参考 `Onboarding1-4.tsx`）

4 页引导流程，全屏 dark 背景 + brand glow 效果。

**Onboarding1 — Welcome：**
- 背景：两个 primary 色 glow 圆形（用大尺寸半透明 View + borderRadius 模拟 blur）
- 中心：hero 图片（`Image` uri + opacity 0.4）
- 底部：Step 01 badge（pill 样式）→ 标题 "Ask Dorian." → 副标题 → 说明文字
- CTA："Get Started" full-width primary button → 进度指示（bar + 2 dots）

**Onboarding2 — Fragment-First：**
- 顶部：X close button (left) + "Ask Dorian" title (center)
- 中心：方形图片区域（Image + 半透明 overlay）+ Diamond icon 居中叠加
- 底部：标题 "Fragment-First Philosophy" → 副标题 → 进度指示 → "Continue" button + "Skip Intro" text

**Onboarding3 — Magic Processing：**
- 顶部：← back button + "First Value" title
- 进度指示点
- 标题 "Magic Processing" → 说明
- Demo 卡片（primary/5 bg, primary/20 border）：
  - Input Note（dark card, italic text）
  - AI thinking indicator（pulsing BrainCircuit icon + "AI is thinking..."）
  - Structured Task（dark card, border-left-4 primary, title + Calendar/User details + CheckCircle）
- 底部："Continue" + "Skip for now"

**Onboarding4 — You're all set：**
- 顶部：← back + "Step 3 of 3"
- CheckCircle icon（大号 48px, 带背景 glow View）
- 标题 "You're all set!" → 说明
- Google Calendar 连接卡片（glass card: Image + 说明 + "Connect Google Calendar" button）
- "Skip for now" text button

**渐变/模糊处理：** 参考项目大量使用 radial-gradient 和 blur。RN 不原生支持这些效果：
- Radial gradient → 用大尺寸半透明圆形 View（`borderRadius: 999`, `opacity: 0.1-0.2`）模拟
- `blur-[100px]` → 跳过 blur filter，靠大尺寸 + 低透明度实现近似效果
- 不引入 `react-native-linear-gradient` 或 `expo-linear-gradient`（避免增加依赖，纯色/半透明足够）

---

## 四、文件变更清单

### 4.1 删除（9 files）

| 路径 | 原因 |
|------|------|
| `screens/auth/login-screen.tsx` | 被 Onboarding 替换 |
| `screens/auth/register-screen.tsx` | 被 Onboarding 替换 |
| `screens/inbox-screen.tsx` | 参考项目无此模块 |
| `screens/projects-screen.tsx` | 参考项目无此模块 |
| `screens/review-screen.tsx` | 被 WeeklyScreen (Review tab) 替代 |
| `components/fragment-card.tsx` | 仅被 inbox-screen 使用，一并删除 |
| `components/task-item.tsx` | 仅被 review-screen 使用，删除后无消费者 |
| `components/event-item.tsx` | 仅被 review-screen 使用，删除后无消费者 |
| `components/empty-state.tsx` | 所有消费者 (inbox/review/projects) 均被删除，无消费者 |

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

### 4.3 修改（5 files）

| 路径 | 改动 |
|------|------|
| `navigation/types.ts` | AuthStack → OnboardingStack ParamList；MainTab → 新 5 tab |
| `navigation/auth-stack.tsx` | 重命名为 onboarding-stack，Login/Register → Onboarding1-4 |
| `navigation/main-tabs.tsx` | 5 tab 重构 + 自定义 tabBar + center FAB |
| `navigation/root-navigator.tsx` | `isAuthenticated` → `hasCompletedOnboarding` 判断逻辑 |
| `App.tsx` | 更新 linking config screens + StatusBar `light-content` |

### 4.4 保留不变

| 路径 | 说明 |
|------|------|
| `screens/today-screen.tsx` | ✅ 已完成 |
| `screens/weekly-screen.tsx` | ✅ 已完成 |
| `theme/colors.ts` | ✅ 已完成 |
| `theme/spacing.ts` | 不变 |
| `theme/index.ts` | 不变 |
| `components/quick-capture.tsx` | TodayScreen 使用，保留 |
| `providers/auth-provider.tsx` | 保留（未来加登录复用） |
| `lib/config.ts` | 不变 |
| `lib/storage.ts` | 不变 |
| `index.web.tsx` | 不变（linking config 变更在 App.tsx 处理） |

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
| `hover:...` | `TouchableOpacity` activeOpacity={0.7} |
| `animate-pulse` | RN `Animated` loop (opacity 0.4→1→0.4) 或静态展示 |
| `<img src="...">` | `<Image source={{ uri: "..." }} resizeMode="cover" />` |
| `backdrop-blur-*` | 跳过，用半透明背景色近似 |
| `bg-gradient-*` / `radial-gradient` | 大尺寸半透明圆形 View 模拟（不引入 gradient 库） |
| `env(safe-area-inset-bottom)` | `SafeAreaView` edges / `useSafeAreaInsets()` |

### 5.2 Center FAB 实现

需要自定义 `tabBar` 而非仅 `tabBarButton`（默认 tab bar 会 clip overflow）：

```typescript
// main-tabs.tsx
function CustomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        if (route.name === "DailyReview") {
          // Center FAB - 凸起按钮
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.fab}
              activeOpacity={0.8}
            >
              <Plus size={32} color="#fff" />
            </TouchableOpacity>
          )
        }
        // 普通 tab icon + label
        const { options } = descriptors[route.key]
        const isFocused = state.index === index
        return (
          <TouchableOpacity key={route.key} onPress={() => navigation.navigate(route.name)} style={styles.tabItem}>
            {options.tabBarIcon?.({ focused: isFocused, color: isFocused ? brandFrom : mutedFg, size: 20 })}
            <Text style={[styles.tabLabel, { color: isFocused ? brandFrom : mutedFg }]}>
              {options.tabBarLabel as string}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

<Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
```

### 5.3 屏幕 Header 模式

所有新屏幕沿用 today-screen/weekly-screen 的模式：
- React Navigation `headerShown: false`
- 屏幕内部自绘 header（`SafeAreaView` edges={["top"]} + 自定义 View）
- 统一 HUD 风格：icon + 标题 + mono subtitle

### 5.4 Onboarding 图片处理

参考项目使用外部 Google 图片 URL。在 RN 中：
- 使用 `<Image source={{ uri }} resizeMode="cover" />` 加载
- 设置合理的 fallback（纯色/渐变背景代替，图片加载失败不影响布局）
- Onboarding4 日历图片同理

---

## 六、不做的事（YAGNI）

- ❌ Onboarding 中实际的 Google Calendar OAuth 集成（按钮存在但 MVP 只导航到主界面）
- ❌ Knowledge 页面的真实 API 调用（MVP 用 mock 数据）
- ❌ Settings 中的子页面（Appearance / Notifications 等只展示入口，press 无响应）
- ❌ DailyReview 的真实 fragment API 集成（MVP 用 mock 数据展示交互）
- ❌ Sidebar（参考项目的 Sidebar 是 desktop-only，mobile 不需要）
- ❌ i18n（mobile MVP 先英文硬编码，后续再加）
- ❌ 引入 gradient 库（radial-gradient 用半透明 View 近似）
- ❌ 真实认证流程（Onboarding 完成即进入主界面）
