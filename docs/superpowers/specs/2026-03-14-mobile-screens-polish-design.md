# Mobile Screens Polish Design Spec

> **Status**: Approved
> **Date**: 2026-03-14
> **Scope**: Mobile package — today-screen, weekly-screen, knowledge-screen

---

## 一、概述

四项 Mobile 端 UI/交互改进，对齐 Web 端实现质量，提升移动端可用性。

**设计原则：**
- 对齐 Web 已验证的 Timeline 实现（时间轴绝对定位、碰撞检测）
- YAGNI：不引入新依赖，用 RN 原生能力实现
- 保持现有 HUD 风格和 theme tokens 不变

---

## 二、改动清单

| # | 模块 | 改动 | 文件 |
|---|------|------|------|
| 1 | Today Timeline | 对齐 Web 时间轴实现 | `today-screen.tsx` |
| 2 | Weekly 去模块 | 删除 TOPIC_CLUSTERS + SET_VECTOR | `weekly-screen.tsx` |
| 3 | Weekly Today 置顶 | DAILY_TIMELINE 当前日期排第一 | `weekly-screen.tsx` |
| 4 | Knowledge 详情 | 点击卡片弹出 Bottom Sheet | `knowledge-screen.tsx` |
| 5 | Knowledge 搜索框 | 去掉 search input 的 outline/border | `knowledge-screen.tsx` |

---

## 三、Today Timeline 对齐 Web（改动 #1）

### 3.1 时间范围

| 维度 | 当前 (Mobile) | 目标 (对齐 Web) |
|------|--------------|----------------|
| 起始时间 | 08:00 | 06:00 |
| 结束时间 | 18:00 | 24:00 |
| 跨度 | 10h | 18h |
| 标签数量 | 6 个 | 10 个 |
| 标签集合 | `[08,10,12,14,16,18]` | `[6,8,10,12,14,16,18,20,22,24]` |
| 容器高度 | 600px | 720px |
| 时间轴宽度 | 50px | 60px |

### 3.2 时间标签绝对定位

**当前：** 时间轴用 `justifyContent: "space-between"` 均匀分布标签。

**改为：** 时间轴容器 `position: "relative"`，每个标签 `position: "absolute"`，`top` 由 `pct(hour)` 计算：

```typescript
const TL_START = 6
const TL_END = 24
const TL_RANGE = TL_END - TL_START // 18
const TL_HEIGHT = 720

function pct(h: number): number {
  return ((Math.max(TL_START, Math.min(TL_END, h)) - TL_START) / TL_RANGE) * 100
}

const TIME_LABELS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
```

渲染：
```tsx
<View style={[s.timeAxis, { height: TL_HEIGHT }]}>
  {TIME_LABELS.map((h) => (
    <Text
      key={h}
      style={[
        s.timeAxisLabel,
        { position: "absolute", top: `${pct(h)}%`, transform: [{ translateY: -6 }] },
      ]}
    >
      {h === 24 ? "00:00" : `${String(h).padStart(2, "0")}:00`}
    </Text>
  ))}
</View>
```

### 3.3 碰撞检测

复用 Web 的碰撞检测算法，为 `TimelineBlock` 添加 `col` 和 `totalCols` 字段：

```typescript
interface TimelineBlock {
  // ...existing fields...
  col: number      // 0-based column index within overlap group
  totalCols: number // total columns in overlap group
}
```

算法（与 web `buildTimelineBlocks` 行 93-109 一致）：

```typescript
const assigned = blocks.map((b) => ({ ...b, col: 0, totalCols: 1 }))
for (let i = 0; i < assigned.length; i++) {
  const group = [i]
  for (let j = i + 1; j < assigned.length; j++) {
    if (assigned[j].startHour < assigned[i].endHour) {
      group.push(j)
    }
  }
  if (group.length > 1) {
    group.forEach((idx, col) => {
      assigned[idx].col = col
      assigned[idx].totalCols = Math.max(assigned[idx].totalCols, group.length)
    })
  }
}
```

### 3.4 Block 宽度计算

**当前：** 所有 block `left: 0, right: spacing.md`（全宽）。

**改为：** 根据碰撞检测结果计算宽度：

```typescript
// 在 renderTimelineBlock 中
const leftPct = (block.col / block.totalCols) * 100
const widthPct = 100 / block.totalCols

style={{
  top: `${topPct}%`,
  height: `${heightPct}%`,
  left: `${leftPct}%`,
  width: `${widthPct}%`,
  // 移除固定的 left: 0, right: spacing.md
}}
```

注意：RN 不支持百分比 `left` + `width` 组合在 absolute positioning 下的所有场景。需要在 `blocksArea` 上使用 `onLayout` 获取实际宽度，然后用像素值计算：

```typescript
const [blocksWidth, setBlocksWidth] = useState(0)

<View style={s.blocksArea} onLayout={(e) => setBlocksWidth(e.nativeEvent.layout.width)}>
  {/* blocks use pixel-based left/width */}
</View>

// In renderTimelineBlock:
const leftPx = (block.col / block.totalCols) * blocksWidth
const widthPx = (blocksWidth / block.totalCols) - 4 // 4px gap
```

### 3.5 视觉参考

Block 样式对齐 `~/Downloads/ask-dorian-mobile/src/components/Dashboard.tsx`：
- **Active block**: green glow border, `EXECUTING` pulse badge + `REMAINING` 倒计时, 大标题 + 引用字幕, `COMPLETE` + `EXTEND` 按钮
- **Future block**: 深色卡片, icon + 标题, 可附加 context badge（如天气 `68°F`）
- **Completed block**: 半透明, check icon + strikethrough
- **Drop zone**: dashed green border, `INSERT_FRAGMENT` 居中

当前 `renderTimelineBlock` 已实现以上元素，对齐时间轴定位后视觉效果即与参考一致。

### 3.6 不做的事

- 不加日期导航（mobile Today 只看当天）
- active block 豪华样式保留（移动端需要大按钮交互）
- Drop Zone（INSERT_FRAGMENT）保持当前逻辑

---

## 四、Weekly 去掉 TOPIC_CLUSTERS + SET_VECTOR（改动 #2）

### 4.1 删除内容

**删除组件：**
- `TopicNode` 函数组件（行 130-186）

**删除 state/computed：**
- `vectorText` useState（行 194）
- `clusters` useMemo（行 294-312）

**删除渲染 section：**
- `{/* Topic Clusters */}` section（行 510-546）
- `{/* Set Vector */}` section（行 551-584）

**删除未使用的 import：**
- 移除 `TextInput` from react-native
- 移除 `Target` from lucide-react-native（如果其他地方不用）

**删除 styles：**
- `clusterMap`, `clusterEmpty`
- `vectorHint`, `vectorInput`, `commitBtn`, `commitBtnText`

### 4.2 保留内容

页面结构变为：
1. HUD Header
2. Telemetry Grid (2x2)
3. AI Analysis Terminal Card
4. Anomalous Fragments (Overdue)
5. Daily Timeline

---

## 五、Weekly DAILY_TIMELINE Today 置顶（改动 #3）

### 5.1 排序逻辑

**当前：** `weekDays` 按周一到周日正序排列。

**改为：** Today 排第一，其余按原顺序：

```typescript
const weekDays = useMemo(() => {
  const days: { date: Date; label: string; dateKey: string }[] = []
  const start = startOfWeek(now, { weekStartsOn: 1 })
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i)
    days.push({
      date: d,
      label: format(d, "EEE M/d"),
      dateKey: format(d, "yyyy-MM-dd"),
    })
  }
  // Today first, then the rest in original order
  const todayIdx = days.findIndex((d) => isToday(d.date))
  if (todayIdx > 0) {
    const [today] = days.splice(todayIdx, 1)
    days.unshift(today)
  }
  return days
}, [])
```

---

## 六、Knowledge Bottom Sheet 详情（改动 #4）

### 6.1 交互流程

```
用户点击 Knowledge 卡片 (grid 或 list)
  → setSelectedItem(item)
  → Modal visible = true
  → Bottom Sheet 从底部弹起（半屏，约 70% 高度）
  → 显示完整详情

用户点击 backdrop / 下拉拖拽 / 点击关闭按钮
  → setSelectedItem(null)
  → Modal 关闭
```

### 6.2 实现方式

使用 RN `Modal` + `Animated.View`，不引入第三方库：

```typescript
const [selectedItem, setSelectedItem] = useState<Knowledge | null>(null)
const slideAnim = useRef(new Animated.Value(0)).current

// Show: Animated.spring slideAnim to 1
// Hide: Animated.timing slideAnim to 0, then setSelectedItem(null)
```

### 6.3 Bottom Sheet 内容布局

```
┌──────────────────────────────────┐
│         ── 拖拽条 ──             │
│                                  │
│  [REFERENCE]  badge     ×  close │
│                                  │
│  Title (大字)                     │
│  Updated: 2h ago                 │
│                                  │
│  ─────────────────────────────── │
│                                  │
│  Content (ScrollView, 纯文本)     │
│  完整的 knowledge.content         │
│                                  │
│  ─────────────────────────────── │
│                                  │
│  #tag1  #tag2  #tag3             │
│                                  │
└──────────────────────────────────┘
```

### 6.4 样式规格

- Sheet 高度：`70%` 屏幕高度
- 背景：`colors.card`，顶部 `borderRadius: 24`
- 拖拽条：居中，`width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border`
- Backdrop：`backgroundColor: "rgba(0,0,0,0.6)"`
- Type Badge：复用现有 `typeBadge` 样式
- Title：`fontSize: 22, fontWeight: "700"`
- Content：`fontSize: 14, lineHeight: 22, color: colors.textSecondary`
- Tags：复用现有 `tagText` 样式
- 关闭按钮：右上角 X icon

### 6.5 搜索框去 outline（改动 #5）

去掉搜索输入框的 `borderWidth: 1` 和 `borderColor`，改为无边框样式：

```typescript
searchInput: {
  // 删除 borderWidth: 1
  // 删除 borderColor
  backgroundColor: colors.card + "CC", // 保留背景色区分
  borderRadius: 12,
  // ...其余不变
}
```

### 6.6 卡片样式微调

当前 RN 卡片样式已经接近参考 UI（glow circle, type badge, tags），**不需要大幅调整**。仅做：
- Grid 卡片点击时传入 `onPress={() => setSelectedItem(item)}`
- List 卡片同上

### 6.6 不做的事

- 不做 Markdown 渲染（Phase 2）
- 不做滑动关闭手势（用简单的 backdrop 点击关闭 + X 按钮）
- 不做编辑功能

---

## 七、文件清单

| 操作 | 路径 |
|------|------|
| EDIT | `packages/mobile/src/screens/today-screen.tsx` |
| EDIT | `packages/mobile/src/screens/weekly-screen.tsx` |
| EDIT | `packages/mobile/src/screens/knowledge-screen.tsx` |

---

## 八、不做的事（YAGNI）

- ❌ 日期导航（mobile Today 只看当天）
- ❌ 引入第三方 bottom-sheet 库
- ❌ Knowledge Markdown 渲染
- ❌ Knowledge 编辑功能
- ❌ 新增 navigation route（详情用 Modal 不用跳转）
