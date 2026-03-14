# Rituals Feature Design Spec

> **Status**: Approved
> **Date**: 2026-03-14
> **Scope**: Server (DB + API) + Core package (types + API + hooks) + Today dashboard integration

---

## 一、概述

Ritual（晨间仪式）是 Today 的核心模块。用户定义一组每日固定习惯（冥想、冷水浴、日志等），每天勾选完成，系统记录历史打卡用于统计分析。

**设计原则：**
- 独立轻量表，不复用 tasks 表（语义不同）
- 可选关联 Task（`task_id nullable`），桥接但不耦合
- 保留完成历史（独立 `ritual_completions` 表），支持 Review 统计
- 纯清单型，无时间绑定（Timeline 中作为整体 block 渲染）

---

## 二、数据模型

### 2.1 `rituals` 表 — 用户仪式模板

```sql
CREATE TABLE rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  is_focus BOOLEAN NOT NULL DEFAULT false,
  sort_order VARCHAR(255) NOT NULL DEFAULT '0|hzzzzz:',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_rituals_user_active ON rituals (user_id) WHERE is_active = true AND deleted_at IS NULL;
```

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `task_id` | UUID FK → tasks, nullable | 可选关联 Task，SET NULL on delete |
| `title` | VARCHAR(200) | 仪式标题 |
| `is_focus` | BOOLEAN | Focus Phase 标记（Timeboxing badge） |
| `sort_order` | VARCHAR(255) | Fractional indexing，与 tasks/projects 一致 |
| `is_active` | BOOLEAN | 软停用（暂停参与每日列表） |
| `version` | INT | 乐观锁，跨端冲突检测 |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | 软删除 |

### 2.2 `ritual_completions` 表 — 每日打卡记录

```sql
CREATE TABLE ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ritual_completion_unique ON ritual_completions (ritual_id, completed_date);
CREATE INDEX idx_ritual_completions_user_date ON ritual_completions (user_id, completed_date);
```

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | UUID PK | |
| `ritual_id` | UUID FK → rituals CASCADE | |
| `user_id` | UUID FK → users CASCADE | 冗余，方便按用户聚合 |
| `completed_date` | DATE | 打卡日期 |
| `completed_at` | TIMESTAMPTZ | 实际打卡时间 |

**约束：** `(ritual_id, completed_date)` UNIQUE — 同一仪式同一天只能打一次。

---

## 三、API 端点

### 3.1 `GET /api/v1/rituals` — 获取仪式列表（含今日完成状态）

**Auth:** Required

**Query:**
| Param | Type | Default | 说明 |
|-------|------|---------|------|
| `date` | string (YYYY-MM-DD) | today | 查询哪天的完成状态 |

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "10min Mindful Breathing",
      "taskId": null,
      "isFocus": false,
      "sortOrder": "a0",
      "isActive": true,
      "version": 1,
      "completed": true,
      "completedAt": "2026-03-14T06:30:00Z",
      "createdAt": "2026-03-01T00:00:00Z",
      "updatedAt": "2026-03-01T00:00:00Z",
      "deletedAt": null
    }
  ],
  "progress": {
    "completed": 2,
    "total": 4
  }
}
```

**Note:** 无分页 — rituals 是小集合（预期 <20 条），使用 `progress` 而非 `pagination`，类似聚合端点模式。

**实现：** `SELECT rituals.* LEFT JOIN ritual_completions ON (ritual_id = id AND completed_date = $date) WHERE user_id = ? AND is_active = true AND deleted_at IS NULL ORDER BY sort_order`

### 3.2 `POST /api/v1/rituals` — 创建仪式

**Auth:** Required

**Body:**
```json
{
  "title": "Cold Shower (Level 3)",
  "isFocus": false,
  "taskId": null
}
```

**Validation (Zod):**
- `title`: string, 1-200 chars, required
- `isFocus`: boolean, optional, default false
- `taskId`: uuid, optional

**Response 201:** 创建的 ritual 对象

**逻辑：** `sort_order` 自动生成，追加到末尾。如果 `taskId` 提供，验证 task 存在且属于当前用户。

### 3.3 `PATCH /api/v1/rituals/:id` — 更新仪式

**Auth:** Required

**Body (partial):**
```json
{
  "title": "Cold Shower (Level 5)",
  "isFocus": true,
  "sortOrder": "a1V",
  "isActive": false,
  "taskId": "uuid-or-null"
}
```

**Response 200:** 更新后的 ritual 对象

### 3.4 `DELETE /api/v1/rituals/:id` — 删除仪式

**Auth:** Required

**Response 204:** 软删除（设置 `deleted_at`），completions 保留用于历史统计。

### 3.5 `POST /api/v1/rituals/:id/toggle-complete` — Toggle 打卡

**Auth:** Required

**Body:**
```json
{
  "date": "2026-03-14"
}
```

- `date`: string (YYYY-MM-DD), optional, default today

**逻辑：**
- 如果 `(ritual_id, date)` 不存在 → INSERT completion → `{ completed: true, completedAt }`
- 如果已存在 → DELETE completion → `{ completed: false, completedAt: null }`

**Response 200:**
```json
{
  "completed": true,
  "completedAt": "2026-03-14T07:15:00Z"
}
```

### 3.6 `GET /api/v1/rituals/stats` — 统计（Review 页用）

**Auth:** Required

**Query:**
| Param | Type | Required | 说明 |
|-------|------|----------|------|
| `from` | string (YYYY-MM-DD) | yes | 开始日期 |
| `to` | string (YYYY-MM-DD) | yes | 结束日期 |

**Response 200:**
```json
{
  "completionRate": 0.85,
  "totalCompleted": 24,
  "totalPossible": 28,
  "currentStreak": 5,
  "bestStreak": 12,
  "dailyBreakdown": [
    { "date": "2026-03-09", "completed": 4, "total": 4 },
    { "date": "2026-03-10", "completed": 3, "total": 4 }
  ]
}
```

**计算逻辑：**
- `totalPossible` = 对 [from, to] 范围内每天：计算 `is_active=true AND created_at <= 该日 AND (deleted_at IS NULL OR deleted_at > 该日)` 的 rituals 数量，求和
- 一天"全部完成" = 当日 completions 数量 == 当日 active rituals 数量（如果 active rituals 数量变化，4/4 和 3/3 都算全部完成）
- `currentStreak` = 从今天往回数，连续全部完成的天数（遇到未全部完成的一天即停止）
- `bestStreak` = 历史所有记录中最长连续全部完成天数

---

## 四、Server 分层实现

### 4.1 DB Schema (Drizzle)

新增文件：`packages/server/src/db/schema/rituals.ts`

### 4.2 Repository

新增文件：`packages/server/src/repositories/ritual-repo.ts`

方法：
- `create(data)` — INSERT
- `findByUserId(userId)` — 获取 active rituals
- `findById(id)` — 单条
- `updateById(id, data)` — UPDATE
- `softDelete(id, userId)` — 软删除（设置 deleted_at）
- `findCompletionsForDate(userId, date)` — 查询某日所有 completions
- `insertCompletion(ritualId, userId, date)` — 打卡
- `deleteCompletion(ritualId, date)` — 取消打卡
- `getStats(userId, from, to)` — 聚合统计

### 4.3 Service

新增文件：`packages/server/src/services/ritual-service.ts`

方法：
- `list(userId, date)` — rituals + completions JOIN + progress 计算
- `create(userId, data)` — 创建 + sort_order 生成 + taskId 校验
- `update(userId, id, data)` — 更新 + taskId 校验
- `delete(userId, id)` — 删除
- `toggleComplete(userId, id, date)` — toggle 打卡
- `getStats(userId, from, to)` — streak 计算

### 4.4 Controller

新增文件：`packages/server/src/controllers/ritual-controller.ts`

Zod schemas + 6 个 handler 方法。

### 4.5 Routes

新增文件：`packages/server/src/routes/rituals.ts`

注册到 `routes/index.ts`。

---

## 五、Core 包同步

### 5.1 Types

`core/src/types/api.ts` 新增：
```typescript
// Pure entity (matches DB row) — returned by POST/PATCH
export interface Ritual {
  id: string
  userId: string
  taskId: string | null
  title: string
  isFocus: boolean
  sortOrder: string
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// Date-scoped list item — returned by GET /rituals (with completion status for a specific date)
export interface RitualWithCompletion extends Ritual {
  completed: boolean
  completedAt: string | null
}

export interface RitualProgress {
  completed: number
  total: number
}

export interface RitualListResponse {
  items: RitualWithCompletion[]
  progress: RitualProgress
}

export interface RitualToggleResponse {
  completed: boolean
  completedAt: string | null
}

export interface RitualDailyBreakdown {
  date: string
  completed: number
  total: number
}

export interface RitualStats {
  completionRate: number
  totalCompleted: number
  totalPossible: number
  currentStreak: number
  bestStreak: number
  dailyBreakdown: RitualDailyBreakdown[]
}
```

`core/src/types/requests.ts` 新增：
```typescript
export interface CreateRitualRequest {
  title: string
  isFocus?: boolean
  taskId?: string | null
}

export type UpdateRitualRequest = Partial<{
  title: string
  isFocus: boolean
  sortOrder: string
  isActive: boolean
  taskId: string | null
}>

export interface RitualStatsParams {
  from: string
  to: string
}
```

### 5.2 API

新增 `core/src/api/rituals.ts`：
```typescript
export const ritualApi = {
  list(date?: string)
  create(data: CreateRitualRequest)
  update(id: string, data: UpdateRitualRequest)
  delete(id: string)
  toggleComplete(id: string, date?: string)   // POST /rituals/:id/toggle-complete
  getStats(params: RitualStatsParams)
}
```

### 5.3 Hooks

新增 `core/src/hooks/use-rituals.ts`：
```typescript
export function useRituals(date?: string)     // SWR hook
export function useRitualStats(params)        // SWR hook
```

---

## 六、Today 联动

现有 `GET /api/v1/today` 响应扩展：

```typescript
interface TodayDashboard {
  // 已有字段...
  rituals: RitualListResponse  // ← 新增
}
```

`today-controller.ts` 并行查询 `ritualService.list(userId, today)` 合并到响应中。

---

## 七、不做的事（YAGNI）

- ❌ Ritual 分组/分类（Morning/Evening）
- ❌ Ritual 时间绑定（方案 B 已确认）
- ❌ Ritual 模板库/推荐
- ❌ 完成 ritual 自动同步关联 task 状态（保持松耦合，用户手动管理）
- ❌ Ritual 的 FTS/embedding（不参与搜索）

---

## 八、文件清单

| 操作 | 路径 |
|------|------|
| NEW | `packages/server/src/db/schema/rituals.ts` |
| EDIT | `packages/server/src/db/schema/index.ts` — 导出新 schema |
| NEW | `packages/server/src/repositories/ritual-repo.ts` |
| NEW | `packages/server/src/services/ritual-service.ts` |
| NEW | `packages/server/src/controllers/ritual-controller.ts` |
| NEW | `packages/server/src/routes/rituals.ts` |
| EDIT | `packages/server/src/routes/index.ts` — 注册新路由 |
| EDIT | `packages/server/src/controllers/today-controller.ts` — 合并 rituals |
| EDIT | `docs/architecture/database-schema.sql` — 新增 2 张表 DDL |
| EDIT | `packages/core/src/types/api.ts` — 新增 Ritual 类型 |
| EDIT | `packages/core/src/types/requests.ts` — 新增 request 类型 |
| NEW | `packages/core/src/api/rituals.ts` |
| EDIT | `packages/core/src/api/index.ts` — 导出 |
| NEW | `packages/core/src/hooks/use-rituals.ts` |
| EDIT | `packages/core/src/hooks/index.ts` — 导出 |
