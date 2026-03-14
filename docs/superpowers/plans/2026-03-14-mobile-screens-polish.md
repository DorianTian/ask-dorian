# Mobile Screens Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish three mobile screens — align Today timeline with Web implementation, clean up Weekly screen, add Knowledge detail Bottom Sheet.

**Architecture:** Direct edits to three existing screen files. No new files, no new dependencies, no new routes. Today timeline gets collision detection + absolute-positioned time axis from Web. Weekly removes two unused modules and reorders days. Knowledge adds a Modal-based Bottom Sheet for detail view.

**Tech Stack:** React Native, Animated API, Modal, existing theme tokens, lucide-react-native.

**Spec:** `docs/superpowers/specs/2026-03-14-mobile-screens-polish-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| EDIT | `packages/mobile/src/screens/today-screen.tsx` | Timeline: constants, time axis, collision detection, block positioning |
| EDIT | `packages/mobile/src/screens/weekly-screen.tsx` | Remove 2 modules, reorder daily timeline |
| EDIT | `packages/mobile/src/screens/knowledge-screen.tsx` | Bottom Sheet detail, search outline removal |

---

## Chunk 1: Today Timeline Alignment

### Task 1: Update timeline constants and helpers

**Files:**
- Modify: `packages/mobile/src/screens/today-screen.tsx:30-41` (constants), `packages/mobile/src/screens/today-screen.tsx:64-67` (hourToPercent)

- [ ] **Step 1: Update constants**

Replace the constants block (lines 30-39):

```typescript
// --- Constants ---

const TL_START = 6
const TL_END = 24
const TL_RANGE = TL_END - TL_START // 18
const TIMELINE_HEIGHT = 720
const TIME_AXIS_WIDTH = 60
const WIDE_BREAKPOINT = 768

const TIME_LABELS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
```

- [ ] **Step 2: Update hourToPercent function**

Replace `hourToPercent` (line 64-67):

```typescript
/** Convert an hour fraction to a percentage offset within the timeline. */
function pct(hour: number): number {
  return ((Math.max(TL_START, Math.min(TL_END, hour)) - TL_START) / TL_RANGE) * 100
}
```

Then rename all usages of `hourToPercent` to `pct` throughout the file (used in `renderTimelineBlock` and `renderTimeline`).

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add packages/mobile/src/screens/today-screen.tsx
git commit -m "refactor(mobile): update today timeline constants to 6AM-24:00 range"
```

---

### Task 2: Add collision detection to buildTimelineBlocks

**Files:**
- Modify: `packages/mobile/src/screens/today-screen.tsx:43-113` (TimelineBlock interface + buildTimelineBlocks)

- [ ] **Step 1: Update TimelineBlock interface**

Add `col` and `totalCols` fields:

```typescript
interface TimelineBlock {
  id: string
  startHour: number
  endHour: number
  time: string
  title: string
  sub: string
  type: "event" | "task"
  status: "completed" | "active" | "future"
  col: number
  totalCols: number
}
```

- [ ] **Step 2: Add collision detection to buildTimelineBlocks**

Replace the end of `buildTimelineBlocks` (after `blocks.sort(...)`, before `return blocks`):

```typescript
  blocks.sort((a, b) => a.startHour - b.startHour)

  // Collision detection: assign column index for overlapping blocks
  const assigned: TimelineBlock[] = blocks.map((b) => ({ ...b, col: 0, totalCols: 1 }))
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
  return assigned
```

Remove the old `return blocks` line.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add packages/mobile/src/screens/today-screen.tsx
git commit -m "feat(mobile): add collision detection to today timeline blocks"
```

---

### Task 3: Rewrite time axis to use absolute positioning

**Files:**
- Modify: `packages/mobile/src/screens/today-screen.tsx` — `renderTimeline` function (lines 314-390) and styles

- [ ] **Step 1: Add blocksWidth state**

At the top of `TodayScreen` component, after other state declarations (~line 124):

```typescript
const [blocksWidth, setBlocksWidth] = useState(0)
```

- [ ] **Step 2: Rewrite the time axis in renderTimeline**

Replace the time axis `<View>` inside `renderTimeline` (the `s.timeAxis` View with `TIME_LABELS.map`):

```tsx
{/* Time axis labels — absolutely positioned */}
<View style={[s.timeAxis, { borderRightColor: colors.border + "80" }]}>
  {TIME_LABELS.map((h) => (
    <Text
      key={h}
      style={[
        s.timeAxisLabel,
        {
          color: colors.textMuted,
          position: "absolute",
          top: `${pct(h)}%`,
          right: 0,
          transform: [{ translateY: -6 }],
        },
        mono,
      ]}
    >
      {h === 24 ? "00:00" : `${String(h).padStart(2, "0")}:00`}
    </Text>
  ))}
</View>
```

- [ ] **Step 3: Add onLayout to blocksArea**

In `renderTimeline`, update the `blocksArea` View to capture width:

```tsx
<View
  style={s.blocksArea}
  onLayout={(e) => setBlocksWidth(e.nativeEvent.layout.width)}
>
```

- [ ] **Step 4: Update timeAxis style**

In the StyleSheet, update `timeAxis`:

```typescript
timeAxis: {
  width: TIME_AXIS_WIDTH,
  position: "relative",
  borderRightWidth: 1,
  paddingRight: spacing.sm,
  height: TIMELINE_HEIGHT,
},
```

Remove the old `justifyContent: "space-between"` and `paddingVertical: 4`.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add packages/mobile/src/screens/today-screen.tsx
git commit -m "feat(mobile): rewrite time axis to absolute positioning"
```

---

### Task 4: Update block positioning to use pixel-based collision layout

**Files:**
- Modify: `packages/mobile/src/screens/today-screen.tsx` — `renderTimelineBlock` callback (lines 186-308) and styles

- [ ] **Step 1: Update renderTimelineBlock for collision-aware positioning**

In `renderTimelineBlock`, update the positioning logic for all 3 block types (completed, active, future). Replace the `style` prop calculations.

For **completed blocks** (the first return branch):

```tsx
const topPct = pct(Math.max(block.startHour, TL_START))
const bottomPct = pct(Math.min(block.endHour, TL_END))
const heightPct = Math.max(bottomPct - topPct, 3)

// Collision-aware positioning
const leftPx = blocksWidth > 0 ? (block.col / block.totalCols) * blocksWidth : 0
const widthPx = blocksWidth > 0 ? (blocksWidth / block.totalCols) - 4 : undefined

return (
  <View
    key={block.id}
    style={[
      s.posBlock,
      {
        top: `${topPct}%`,
        height: `${heightPct}%`,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderColor: colors.border + "80",
        opacity: 0.6,
        ...(widthPx != null ? { left: leftPx, width: widthPx } : {}),
      },
    ]}
  >
```

Apply the same `leftPx`/`widthPx` pattern to **active blocks** (`posBlockActive` style) and **future blocks**.

- [ ] **Step 2: Update posBlock and posBlockActive styles**

Remove the fixed `left: 0, right: spacing.md` from `posBlock` and `posBlockActive` styles. Add defaults:

```typescript
posBlock: {
  position: "absolute",
  left: 0,
  right: 0,
  borderWidth: 1,
  borderRadius: radii.xl,
  padding: spacing.md,
  justifyContent: "center",
},
posBlockActive: {
  position: "absolute",
  left: 0,
  right: 0,
  borderWidth: 1,
  borderRadius: radii.xl,
  padding: spacing.lg,
  gap: spacing.sm,
  zIndex: 20,
  shadowColor: "#10B981",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 15,
  elevation: 6,
},
```

The inline `left`/`width` from collision detection will override these defaults when `blocksWidth > 0`.

- [ ] **Step 3: Update dropZone positioning**

The drop zone also needs to use `pct` instead of hardcoded `"75%"`:

```tsx
<View
  style={[
    s.dropZone,
    {
      top: timelineBlocks.length > 0
        ? `${pct(Math.max(...timelineBlocks.map(b => b.endHour)) + 0.5)}%`
        : "75%",
      height: "5%",
      borderColor: colors.brandFrom + "4D",
      backgroundColor: colors.brandFrom + "0D",
    },
  ]}
>
```

- [ ] **Step 4: Update the timelineCard minHeight**

In styles, update:

```typescript
timelineCard: {
  borderRadius: radii.xl,
  borderWidth: 1,
  padding: spacing.lg,
  minHeight: TIMELINE_HEIGHT + 80,
  overflow: "hidden",
},
```

- [ ] **Step 5: Add `blocksWidth` to renderTimelineBlock deps**

Update the `useCallback` dependency array:

```typescript
const renderTimelineBlock = useCallback(
  (block: TimelineBlock) => {
    // ... existing code ...
  },
  [colors, mono, activeRemainingMin, completeTask, blocksWidth],
)
```

- [ ] **Step 6: Update nowPercent and showNowLine**

Replace the now-line positioning calculations:

```typescript
const nowPercent = pct(nowHour)
const showNowLine = nowHour >= TL_START && nowHour <= TL_END
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 8: Commit**

```bash
git add packages/mobile/src/screens/today-screen.tsx
git commit -m "feat(mobile): add collision-aware block positioning to today timeline"
```

---

## Chunk 2: Weekly Screen Cleanup

### Task 5: Remove TOPIC_CLUSTERS and SET_VECTOR from weekly-screen

**Files:**
- Modify: `packages/mobile/src/screens/weekly-screen.tsx`

- [ ] **Step 1: Remove TopicNode component**

Delete the `TopicNode` function component (lines 130-186).

- [ ] **Step 2: Remove unused state and computed values**

Delete `vectorText` useState (line 194):
```typescript
// DELETE: const [vectorText, setVectorText] = useState("")
```

Delete `clusters` useMemo (lines 294-312):
```typescript
// DELETE: const clusters = useMemo(() => { ... }, [data, colors.brandFrom])
```

- [ ] **Step 3: Remove Topic Clusters render section**

Delete the entire Topic Clusters `<View>` section (lines 510-546):
```tsx
// DELETE: {/* Topic Clusters */} <View style={[s.sectionCard, ...]}>...</View>
```

- [ ] **Step 4: Remove Set Vector render section**

Delete the entire Set Vector `<View>` section (lines 551-584):
```tsx
// DELETE: {/* Set Vector */} <View style={[s.sectionCard, ...]}>...</View>
```

- [ ] **Step 5: Clean up unused imports**

Remove `TextInput` from react-native imports.
Remove `Target` from lucide-react-native imports (verify it's not used elsewhere first).

- [ ] **Step 6: Clean up unused styles**

Delete from StyleSheet:
- `clusterMap`
- `clusterEmpty`
- `vectorHint`
- `vectorInput`
- `commitBtn`
- `commitBtnText`

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 8: Commit**

```bash
git add packages/mobile/src/screens/weekly-screen.tsx
git commit -m "refactor(mobile): remove TOPIC_CLUSTERS and SET_VECTOR from weekly screen"
```

---

### Task 6: Reorder DAILY_TIMELINE with Today first

**Files:**
- Modify: `packages/mobile/src/screens/weekly-screen.tsx` — `weekDays` useMemo

- [ ] **Step 1: Update weekDays sorting**

Find the `weekDays` useMemo (around line 228) and add Today-first logic at the end, before the `return days`:

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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/src/screens/weekly-screen.tsx
git commit -m "feat(mobile): reorder weekly daily timeline with Today first"
```

---

## Chunk 3: Knowledge Screen — Bottom Sheet + Search Fix

### Task 7: Add Bottom Sheet detail view to Knowledge screen

**Files:**
- Modify: `packages/mobile/src/screens/knowledge-screen.tsx`

- [ ] **Step 1: Add imports**

Add to the react-native import:

```typescript
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native"
```

Add `X` to lucide imports (already imported, verify), add `useRef` to React import:

```typescript
import React, { useState, useCallback, useRef } from "react"
```

- [ ] **Step 2: Add selectedItem state and animation ref**

Inside `KnowledgeScreen` component, after existing state:

```typescript
const [selectedItem, setSelectedItem] = useState<Knowledge | null>(null)
const slideAnim = useRef(new Animated.Value(0)).current
const screenHeight = Dimensions.get("window").height
```

- [ ] **Step 3: Add open/close handlers**

```typescript
const openSheet = useCallback((item: Knowledge) => {
  setSelectedItem(item)
  Animated.spring(slideAnim, {
    toValue: 1,
    useNativeDriver: true,
    tension: 65,
    friction: 11,
  }).start()
}, [slideAnim])

const closeSheet = useCallback(() => {
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  }).start(() => setSelectedItem(null))
}, [slideAnim])
```

- [ ] **Step 4: Update card onPress handlers**

Update `renderGridItem`:

```typescript
const renderGridItem = useCallback(
  ({ item }: { item: Knowledge }) => (
    <KnowledgeCardGrid item={item} colors={colors} onPress={() => openSheet(item)} />
  ),
  [colors, openSheet]
)
```

Update `renderListItem`:

```typescript
const renderListItem = useCallback(
  ({ item }: { item: Knowledge }) => (
    <KnowledgeCardList item={item} colors={colors} onPress={() => openSheet(item)} />
  ),
  [colors, openSheet]
)
```

Update `KnowledgeCardGrid` and `KnowledgeCardList` props to accept and use `onPress`:

```typescript
function KnowledgeCardGrid({
  item,
  colors,
  onPress,
}: {
  item: Knowledge
  colors: ReturnType<typeof useColors>
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[s.gridCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
```

Same for `KnowledgeCardList`.

- [ ] **Step 5: Add Bottom Sheet Modal**

Add before the closing `</SafeAreaView>` in the return:

```tsx
{/* Bottom Sheet Detail */}
<Modal
  visible={selectedItem !== null}
  transparent
  animationType="none"
  onRequestClose={closeSheet}
>
  <Pressable style={s.sheetBackdrop} onPress={closeSheet}>
    <Animated.View
      style={[
        s.sheetContainer,
        {
          backgroundColor: colors.card,
          height: screenHeight * 0.7,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [screenHeight * 0.7, 0],
            }),
          }],
        },
      ]}
    >
      <Pressable onPress={() => {}} style={{ flex: 1 }}>
        {/* Drag handle */}
        <View style={s.sheetHandle}>
          <View style={[s.sheetHandleBar, { backgroundColor: colors.border }]} />
        </View>

        {/* Header: badge + close */}
        <View style={s.sheetHeader}>
          <View
            style={[
              s.typeBadge,
              { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" },
            ]}
          >
            <FileText size={12} color={colors.brandFrom} />
            <Text style={[s.typeBadgeText, { color: colors.brandFrom }]}>
              {selectedItem?.type}
            </Text>
          </View>
          <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Title + time */}
        <View style={s.sheetTitleSection}>
          <Text style={[s.sheetTitle, { color: colors.foreground }]}>
            {selectedItem?.title}
          </Text>
          <Text style={[s.sheetTime, { color: colors.textMuted }, mono]}>
            {selectedItem ? formatRelativeTime(selectedItem.updatedAt) : ""}
          </Text>
        </View>

        {/* Divider */}
        <View style={[s.sheetDivider, { backgroundColor: colors.border + "40" }]} />

        {/* Content */}
        <ScrollView
          style={s.sheetContent}
          contentContainerStyle={s.sheetContentInner}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[s.sheetContentText, { color: colors.textSecondary }]}>
            {selectedItem?.content}
          </Text>
        </ScrollView>

        {/* Tags */}
        {selectedItem && selectedItem.tags.length > 0 && (
          <>
            <View style={[s.sheetDivider, { backgroundColor: colors.border + "40" }]} />
            <View style={s.sheetTags}>
              {selectedItem.tags.map((tag) => (
                <Text key={tag} style={[s.tagText, { color: colors.textMuted }]}>
                  #{tag}
                </Text>
              ))}
            </View>
          </>
        )}
      </Pressable>
    </Animated.View>
  </Pressable>
</Modal>
```

- [ ] **Step 6: Add Bottom Sheet styles**

Add to the StyleSheet:

```typescript
// Bottom Sheet
sheetBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "flex-end",
},
sheetContainer: {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: "hidden",
},
sheetHandle: {
  alignItems: "center",
  paddingVertical: 12,
},
sheetHandleBar: {
  width: 40,
  height: 4,
  borderRadius: 2,
},
sheetHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingBottom: 16,
},
sheetTitleSection: {
  paddingHorizontal: 20,
  paddingBottom: 16,
  gap: 4,
},
sheetTitle: {
  fontSize: 22,
  fontWeight: "700",
},
sheetTime: {
  fontSize: 11,
},
sheetDivider: {
  height: 1,
  marginHorizontal: 20,
},
sheetContent: {
  flex: 1,
  paddingHorizontal: 20,
},
sheetContentInner: {
  paddingVertical: 16,
},
sheetContentText: {
  fontSize: 14,
  lineHeight: 22,
},
sheetTags: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  paddingHorizontal: 20,
  paddingVertical: 16,
},
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 8: Commit**

```bash
git add packages/mobile/src/screens/knowledge-screen.tsx
git commit -m "feat(mobile): add bottom sheet detail view to knowledge screen"
```

---

### Task 8: Remove search input outline

**Files:**
- Modify: `packages/mobile/src/screens/knowledge-screen.tsx` — `searchInput` style

- [ ] **Step 1: Update searchInput style**

In the StyleSheet, update `searchInput` to remove border:

```typescript
searchInput: {
  width: "100%",
  borderRadius: 12,
  paddingLeft: 48,
  paddingRight: 48,
  paddingVertical: 14,
  fontSize: 14,
},
```

Remove the `borderWidth: 1` — the `borderColor` will be removed from inline styles too. Update the inline style where `searchInput` is used to remove `borderColor`:

```tsx
<TextInput
  style={[
    s.searchInput,
    {
      backgroundColor: colors.card + "CC",
      color: colors.foreground,
    },
  ]}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/mobile && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/src/screens/knowledge-screen.tsx
git commit -m "fix(mobile): remove search input border in knowledge screen"
```
