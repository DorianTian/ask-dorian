# 多态关联模式 — Ask Dorian 实体关系设计

> **定位**：架构设计级 — 覆盖设计动机、底层原理、方案对比、Ask Dorian 落地实践
> **约定**：PostgreSQL 16 + Drizzle ORM + TypeScript

---

## 目录

- [一、背景与设计动机](#一背景与设计动机)
- [二、核心原理与底层实现](#二核心原理与底层实现)
- [三、方案对比——四种实体关系方案](#三方案对比四种实体关系方案)
- [四、业界实践参考](#四业界实践参考)
- [五、Ask Dorian 落地方案——混用策略](#五ask-dorian-落地方案混用策略)
- [六、缺陷与局限](#六缺陷与局限)
- [七、生产踩坑与最佳实践](#七生产踩坑与最佳实践)

---

## 一、背景与设计动机

### 问题场景

Ask Dorian 有 **5 种核心实体类型**：

| 实体 | 说明 |
|------|------|
| `fragment` | 碎片 — 用户原始输入 |
| `task` | 任务 — 可执行项 |
| `event` | 日程 — 时间块 |
| `knowledge` | 知识 — 沉淀内容 |
| `project` | 项目 — 组织维度 |

这些实体之间存在**异构的、动态的**关系：

- 一条碎片可以**生成**一个任务 + 一个事件（`fragment → task`, `fragment → event`）
- 一个任务可以**依赖**另一个任务（`task → task`）
- 一条知识可以**关联**一个任务（`knowledge → task`）
- AI 可以检测到两个碎片是**重复**的（`fragment → fragment`）

### 没有多态前怎么做？

传统做法：每种关系一张表。

```
fragment_tasks          (fragment_id, task_id)
fragment_events         (fragment_id, event_id)
fragment_knowledge      (fragment_id, knowledge_id)
task_dependencies       (task_id, depends_on_task_id)
knowledge_tasks         (knowledge_id, task_id)
knowledge_events        (knowledge_id, event_id)
event_tasks             (event_id, task_id)
fragment_fragments      (fragment_id, related_fragment_id)
...
```

**5 种实体类型之间的关系表数量 = C(5,2) × 关系类型数**，轻松超过 20 张表。这就是**表爆炸问题**。

### 核心矛盾

| 需求 | 传统 FK | 期望 |
|------|---------|------|
| 添加新关系类型 | 建新表 | 加一行 |
| 查询"某实体的所有关联" | UNION 20+ 张表 | 一条 SQL |
| 添加新实体类型 | 建 N 张新关系表 | ENUM 加一个值 |

**多态关联模式**正是为了解决这个矛盾。

---

## 二、核心原理与底层实现

### 两种形式

#### 形式 1：Polymorphic FK（单表引用多表）

```
comments 表:
  id, body, commentable_type, commentable_id

  commentable_type = 'post'    → commentable_id 指向 posts.id
  commentable_type = 'photo'   → commentable_id 指向 photos.id
  commentable_type = 'video'   → commentable_id 指向 videos.id
```

**特点**：一对多关系的多态端。Rails ActiveRecord 的 `belongs_to :commentable, polymorphic: true` 就是这种。

#### 形式 2：Polymorphic Join Table（独立关系表）

```
entity_relationship 表:
  from_id, from_entity, to_id, to_entity, relation

  from_entity = 'fragment', to_entity = 'task', relation = 'generated_from'
  from_entity = 'task',     to_entity = 'task', relation = 'depends_on'
```

**特点**：多对多 + 多类型 + 多关系。Ask Dorian 使用此形式。

### 为什么无法使用 FK 约束

```sql
-- ❌ 这是不可能的：
ALTER TABLE entity_relationship
  ADD FOREIGN KEY (from_id) REFERENCES fragments(id);  -- from_id 也可能指向 tasks!
```

PostgreSQL 的 FK 约束要求**一个列只能引用一张表**。当 `from_id` 可能指向 5 张不同的表时，数据库级 FK 无法实现。

**后果**：引用完整性必须在**应用层**保证。

### 索引策略

```sql
-- 正向查询：某实体发出的所有关系
CREATE INDEX idx_er_from ON entity_relationship (from_id, from_entity, relation);
-- 查询："这个碎片生成了哪些实体？"
-- WHERE from_id = $1 AND from_entity = 'fragment' AND relation = 'generated_from'

-- 反向查询：某实体被谁关联
CREATE INDEX idx_er_to ON entity_relationship (to_id, to_entity, relation);
-- 查询："这个任务是从哪个碎片生成的？"
-- WHERE to_id = $1 AND to_entity = 'task' AND relation = 'generated_from'

-- 类型查询：某类关系的所有记录
CREATE INDEX idx_er_type_relation ON entity_relationship (from_entity, relation);
-- 查询："所有碎片生成关系"
-- WHERE from_entity = 'fragment' AND relation = 'generated_from'
```

**复合主键** `(from_id, to_id, relation)` 保证同两个实体间同类型关系唯一。

### 查询路径分析

```
┌─────────────────────────────────────────────────────────┐
│ 正向查询 (from → to)                                     │
│ "碎片 X 生成了哪些实体？"                                   │
│                                                          │
│ SELECT to_entity, to_id                                  │
│ FROM entity_relationship                                 │
│ WHERE from_id = X AND relation = 'generated_from'        │
│                                                          │
│ 走索引 idx_er_from → 命中率高                               │
├─────────────────────────────────────────────────────────┤
│ 反向查询 (to → from)                                      │
│ "任务 Y 从哪个碎片生成的？"                                  │
│                                                          │
│ SELECT from_entity, from_id                              │
│ FROM entity_relationship                                 │
│ WHERE to_id = Y AND relation = 'generated_from'          │
│                                                          │
│ 走索引 idx_er_to → 命中率高                                │
├─────────────────────────────────────────────────────────┤
│ 条件 JOIN (需要加载实际实体)                                 │
│ "碎片 X 生成的所有任务的详情"                                │
│                                                          │
│ SELECT t.*                                               │
│ FROM entity_relationship er                              │
│ JOIN tasks t ON er.to_id = t.id                          │
│ WHERE er.from_id = X                                     │
│   AND er.relation = 'generated_from'                     │
│   AND er.to_entity = 'task'                              │
│                                                          │
│ 两步：先走索引找关系，再 JOIN 实体表                          │
└─────────────────────────────────────────────────────────┘
```

---

## 三、方案对比——四种实体关系方案

| 维度 | 传统 FK（每种关系一张表） | 多态关联表 | EAV 模式 | 图数据库（Neo4j） |
|------|------------------------|-----------|----------|-----------------|
| **引用完整性** | ✅ FK 约束，数据库兜底 | ❌ 应用层保证 | ❌ 无约束 | ❌ 应用层保证 |
| **查询复杂度** | 低（直接 JOIN） | 中（条件 JOIN） | 高（pivot 转换） | 低（Cypher 原生） |
| **索引效率** | 高（单列 FK 索引） | 中（复合索引） | 低（通用索引） | 高（原生图索引） |
| **跨类型查询** | 差（UNION 多表） | ✅ 一条 SQL | ✅ 一条 SQL | ✅ 原生支持 |
| **扩展新实体类型** | 建 N 张新表 | ENUM 加一个值 | 无需改动 | 加 label |
| **扩展新关系类型** | 建新表 | ENUM 加一个值 | 加行 | 加 relationship type |
| **适用规模** | 任意（最成熟） | 百万~千万级 | 不推荐 | 亿级关系 |
| **运维成本** | 中（表多但简单） | 低（一张表） | 高（复杂查询） | 高（独立服务） |
| **生态兼容** | 所有 ORM 原生支持 | 需要手动映射 | 需要手动映射 | 需要专用驱动 |

### 结论

| 场景 | 推荐方案 |
|------|---------|
| 关系固定、类型少 | 传统 FK |
| 异构实体、关系动态、中等规模 | **多态关联表** ← Ask Dorian |
| 关系是核心业务（社交图谱、推荐系统） | 图数据库 |
| 属性极度灵活（CMS） | EAV（但要三思） |

---

## 四、业界实践参考

### LinkedIn DataHub（第一梯队）

- **模型**：基于 Pegasus schema 的**图模型**
- **实体标识**：URN（Uniform Resource Name），如 `urn:li:dataset:(urn:li:dataPlatform:hive,SampleTable,PROD)`
- **关系存储**：MySQL/PostgreSQL 存实体元数据 + Neo4j/Elasticsearch 存图关系
- **特点**：双存储架构，关系查询走图数据库
- **评价**：架构最严谨，但运维复杂度高，适合企业级。社区最大，生产验证最多。

### OpenMetadata（第二梯队靠前）

- **模型**：`entity_relationship` 表（单一关系型数据库）
- **字段**：`fromId, toId, fromEntity, toEntity, relation (integer)`
- **特点**：纯 RDBMS 方案，不引入图数据库，简单直接
- **评价**：2021 年开源，发展较快。`entity_relationship` 设计是标准的多态关联模式，没有特别创新，但工程上够用。

### Apache Atlas（成熟但老旧）

- **模型**：JanusGraph 图数据库 + HBase/Cassandra 后端
- **特点**：完全图原生，关系是一等公民
- **评价**：与 Hadoop 生态深度绑定，架构偏重，新项目不推荐。

### Ask Dorian 的选择

**纯 RDBMS 多态关联**（类似 OpenMetadata 但更轻量）。原因：

1. 实体类型只有 5 种，不需要图数据库的表达力
2. 关系查询不是核心瓶颈（个人工具，不是社交图谱）
3. 已有 PostgreSQL，不想引入第二个数据存储
4. 运维简单是第一优先级（单人/小团队）

---

## 五、Ask Dorian 落地方案——混用策略

### 核心决策

**不是"全部多态"也不是"全部 FK"，而是混用。**

```
确定性 1:N 关系 → 直接 FK
  task.project_id    → projects.id  ✅ FK 约束
  event.project_id   → projects.id  ✅ FK 约束
  event.task_id      → tasks.id     ✅ FK 约束
  task.parent_id     → tasks.id     ✅ FK 约束

动态跨类型关系 → 多态关联表
  fragment → task        (generated_from)
  fragment → event       (generated_from)
  task → task            (depends_on / blocks)
  knowledge → any        (related_to / references)
  any → any              (duplicate_of)
```

**分界线**：如果关系的 `from_entity` 和 `to_entity` 在编码时就能确定，用 FK；否则用多态表。

### DDL

```sql
CREATE TYPE entity_type AS ENUM ('fragment', 'task', 'event', 'knowledge', 'project');

CREATE TYPE relation_type AS ENUM (
  'generated_from',    -- 碎片 → 实体
  'belongs_to',        -- 补充 FK 覆盖不到的归属
  'depends_on',        -- 前置依赖
  'blocks',            -- 阻塞
  'related_to',        -- 语义关联
  'split_from',        -- 碎片拆分
  'merged_from',       -- 合并来源
  'derived_from',      -- 衍生
  'references',        -- 引用
  'duplicate_of'       -- 重复标记
);

CREATE TABLE entity_relationship (
  from_id       UUID NOT NULL,
  from_entity   entity_type NOT NULL,
  to_id         UUID NOT NULL,
  to_entity     entity_type NOT NULL,
  relation      relation_type NOT NULL,

  confidence    REAL,                    -- AI 推断置信度，NULL = 用户手动
  created_by    VARCHAR(20) NOT NULL DEFAULT 'system'
                CHECK (created_by IN ('user', 'ai', 'sync', 'system')),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (from_id, to_id, relation),
  CHECK (from_id != to_id OR relation = 'duplicate_of')
);

CREATE INDEX idx_er_from          ON entity_relationship (from_id, from_entity, relation);
CREATE INDEX idx_er_to            ON entity_relationship (to_id, to_entity, relation);
CREATE INDEX idx_er_type_relation ON entity_relationship (from_entity, relation);
```

### Drizzle ORM Schema 示例

```typescript
import { pgTable, uuid, pgEnum, real, varchar, jsonb, timestamp, primaryKey, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const entityTypeEnum = pgEnum('entity_type', [
  'fragment', 'task', 'event', 'knowledge', 'project',
]);

export const relationTypeEnum = pgEnum('relation_type', [
  'generated_from', 'belongs_to', 'depends_on', 'blocks',
  'related_to', 'split_from', 'merged_from', 'derived_from',
  'references', 'duplicate_of',
]);

export const entityRelationship = pgTable(
  'entity_relationship',
  {
    fromId: uuid('from_id').notNull(),
    fromEntity: entityTypeEnum('from_entity').notNull(),
    toId: uuid('to_id').notNull(),
    toEntity: entityTypeEnum('to_entity').notNull(),
    relation: relationTypeEnum('relation').notNull(),
    confidence: real('confidence'),
    createdBy: varchar('created_by', { length: 20 }).notNull().default('system'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.fromId, table.toId, table.relation] }),
    check('no_self_ref', sql`${table.fromId} != ${table.toId} OR ${table.relation} = 'duplicate_of'`),
  ]
);
```

### 查询示例

```typescript
// 正向：碎片生成了哪些实体
const generated = await db
  .select()
  .from(entityRelationship)
  .where(
    and(
      eq(entityRelationship.fromId, fragmentId),
      eq(entityRelationship.fromEntity, 'fragment'),
      eq(entityRelationship.relation, 'generated_from')
    )
  );

// 反向：任务是从哪个碎片生成的
const source = await db
  .select()
  .from(entityRelationship)
  .where(
    and(
      eq(entityRelationship.toId, taskId),
      eq(entityRelationship.toEntity, 'task'),
      eq(entityRelationship.relation, 'generated_from')
    )
  );

// 跨类型遍历：某实体的所有关联（正向 + 反向）
const allRelations = await db.execute(sql`
  SELECT 'outgoing' AS direction, to_entity, to_id, relation
  FROM entity_relationship
  WHERE from_id = ${entityId}
  UNION ALL
  SELECT 'incoming' AS direction, from_entity, from_id, relation
  FROM entity_relationship
  WHERE to_id = ${entityId}
`);
```

---

## 六、缺陷与局限

### 1. 无 FK 约束 → 孤儿记录风险

删除一个 task 后，`entity_relationship` 中 `to_id = task.id` 的记录不会自动删除。

**三道应用层防线：**

```
第一道：事务保护
  删除实体时，在同一事务中删除相关关系记录

第二道：软删除
  实体不真删，标记 deleted_at
  查询关系时 JOIN 实体表过滤 deleted_at IS NULL

第三道：定时清理
  后台 Job 定期扫描 entity_relationship
  检查 from_id / to_id 是否在对应实体表中存在
  不存在则清理（记录日志）
```

### 2. 条件 JOIN 复杂度

查询关系时拿到 `(entity_type, entity_id)`，需要根据 type 决定 JOIN 哪张表。

```typescript
// 需要手动分发
const details = await Promise.all(
  relations.map(async (rel) => {
    switch (rel.toEntity) {
      case 'task':
        return db.select().from(tasks).where(eq(tasks.id, rel.toId));
      case 'event':
        return db.select().from(events).where(eq(events.id, rel.toId));
      // ...
    }
  })
);
```

**优化**：封装 `EntityLoader` 服务，按 type 批量加载，避免 N+1。

### 3. 不适合超大规模

当 `entity_relationship` 达到**亿级行**时，复合索引的 B-Tree 深度增大，查询延迟上升。

**Ask Dorian 的情况**：个人工具，单用户关系量级 < 10 万，完全不是问题。即使 10 万用户，总量也在千万级，PostgreSQL 轻松应对。

---

## 七、生产踩坑与最佳实践

### 坑点 1：删除实体忘删关系

**根因**：没有 FK CASCADE，应用代码遗漏清理。

**解决方案**：
```typescript
// Repository 层封装，删除实体时自动清理关系
async deleteTask(taskId: string) {
  await db.transaction(async (tx) => {
    // 清理所有相关关系（正向 + 反向）
    await tx.delete(entityRelationship).where(
      or(
        eq(entityRelationship.fromId, taskId),
        eq(entityRelationship.toId, taskId)
      )
    );
    // 软删除实体
    await tx.update(tasks).set({ deletedAt: new Date() }).where(eq(tasks.id, taskId));
  });
}
```

### 坑点 2：type 字段拼写不一致

**根因**：用 VARCHAR 存 type，`'Task'` / `'task'` / `'TASK'` 混乱。

**解决方案**：使用 PostgreSQL ENUM，数据库层面保证类型安全。

```sql
CREATE TYPE entity_type AS ENUM ('fragment', 'task', 'event', 'knowledge', 'project');
-- 插入 'Task' 会报错，强制小写
```

### 坑点 3：双向关系存一条还是两条？

**问题**：A `related_to` B，是存一条还是两条？

**Ask Dorian 约定**：
| 关系类型 | 存储方式 | 原因 |
|----------|---------|------|
| `generated_from` | 单向（from=碎片, to=实体） | 有明确方向 |
| `depends_on` | 单向（from=依赖方, to=被依赖方） | 有明确方向 |
| `blocks` | 单向（from=阻塞方, to=被阻塞方） | 有明确方向 |
| `related_to` | **单向，只存一条** | 反向查询走 `idx_er_to` 索引 |
| `duplicate_of` | **单向，只存一条** | A duplicate_of B，不需要 B duplicate_of A |

**原则：永远只存一条，查询时用 UNION 双向索引覆盖**。避免双条记录的一致性维护问题。

### 最佳实践汇总

| 实践 | 说明 |
|------|------|
| 事务清理 | 删除实体时在同一事务中清理关系 |
| ENUM 不用 VARCHAR | entity_type 和 relation_type 用 ENUM |
| 单向存储 | 所有关系只存一条，用双向索引支持反向查询 |
| 批量加载 | EntityLoader 按 type 分组批量查询，避免 N+1 |
| 定时巡检 | 后台 Job 检测孤儿记录 |
| confidence 字段 | AI 创建的关系带置信度，方便后续过滤低置信关系 |
| created_by 字段 | 区分关系来源，用户手动创建的权重 > AI 推断的 |
