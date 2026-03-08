# Ask Dorian — PRD 补充方案

> 本文档为原 PRD 的补充，基于对标产品（Sunsama / Motion / Linear / Notion / Akiflow / Raycast）的竞争分析，补充顶级 ToC 产品必需但原 PRD 缺失的模块。

---

## 一、缺失页面与模块补充

### 1.1 认证与用户体系（原 PRD 完全缺失）

| 页面 | 路由 | 核心功能 | 优先级 |
|------|------|---------|--------|
| 注册 | `/auth/register` | 邮箱注册 + OAuth（Google / Apple / GitHub） | MVP |
| 登录 | `/auth/login` | 邮箱密码 + OAuth + 记住登录 | MVP |
| 忘记密码 | `/auth/forgot-password` | 邮箱重置流程 | MVP |
| Onboarding 向导 | `/onboarding` | 新用户引导（见 1.2） | MVP |

**设计原则**：
- 注册 → 立即可用，不强制绑定任何集成（对标 Raycast 的低门槛入口，避免 Motion 的重前置设置）
- OAuth 登录一步到位，减少密码摩擦
- 邮箱验证可延迟（先用起来，24h 内验证）

### 1.2 Onboarding 引导流程（原 PRD 缺失）

**核心指标**：First Value in < 60 seconds

流程设计（对标 Sunsama 的 Guided Tour）：
```
Step 1: 欢迎页 → 选择使用场景（知识工作者 / 自由职业 / 团队管理者 / 个人用户）
Step 2: 快速体验 → 输入一句话碎片 → 看到 AI 实时分类结果
Step 3: 查看今日面板 → 展示分类后的碎片已出现在任务列表
Step 4: （可选）连接 Google Calendar
Step 5: 完成 → 进入主界面
```

**渐进式引导**：
- Day 1：只展示 Inbox + 今日面板
- Day 3：提示使用本周面板
- Week 1：提示项目归因
- Week 2：自动生成第一份周回顾

### 1.3 全局快速捕获（原 PRD 提到"统一入口"但缺少 UX 设计）

**这是产品最核心的交互，必须做到行业一流。**

对标 Raycast / Akiflow 的 Quick Capture：

| 平台 | 触发方式 | 响应要求 |
|------|---------|---------|
| Desktop Web | `Cmd+K` / `Ctrl+K` 全局 Command Palette | < 200ms 弹出 |
| Desktop Web | 右下角悬浮按钮（收起状态） | 始终可见 |
| Mobile Web | 底部固定 FAB（Floating Action Button） | 一键展开输入 |
| 未来 PWA | 通知栏快捷入口 | 系统级 |

**Command Palette 设计**（对标 Linear `Cmd+K`）：
```
输入模式：
  - 默认：自然语言碎片输入 → AI 自动分类
  - /task：直接创建任务
  - /note：创建知识笔记
  - /idea：记录灵感
  - /meeting：创建会议记录
  - /search：全局搜索

导航模式（输入 > 时切换）：
  - > today → 跳转今日面板
  - > inbox → 跳转收集箱
  - > settings → 跳转设置
```

### 1.4 全局搜索（原 PRD 缺失）

| 搜索范围 | 描述 |
|---------|------|
| 碎片 | 全文搜索所有历史碎片输入 |
| 任务 | 按标题、描述、标签搜索 |
| 日程 | 按事件名称、参与人搜索 |
| 项目 | 按名称、描述搜索 |
| 知识 | 全文搜索知识库内容 |

通过 Command Palette 统一入口，类似 Notion 的全局搜索体验。

### 1.5 日历页（原 PRD 提到联动但无独立页面）

路由：`/calendar`

| 视图 | 描述 |
|------|------|
| 月视图 | 概览日程密度，任务截止日标记 |
| 周视图 | 主力视图，时间块 + 任务 timeboxing |
| 日视图 | 详细时间轴，拖拽排程 |

**核心交互**：
- 任务可拖拽到日历时间块上（Timeboxing，对标 Sunsama）
- 拖拽时自动计算当日剩余可用时间
- 过度安排预警："今天已安排 10 小时，超出建议工作时间"

### 1.6 知识库（原 PRD 仅在回顾中提到）

路由：`/knowledge`

| 功能 | 描述 |
|------|------|
| 知识卡片列表 | 按时间/分类/项目浏览 |
| 全文搜索 | 搜索所有知识内容 |
| 标签系统 | 多维标签分类 |
| 关联关系 | 知识 ↔ 任务 / 项目 / 碎片的双向链接 |
| 收藏 | 重要知识标星 |

### 1.7 设置中心（原 PRD 缺失）

路由：`/settings`

| 设置项 | 子页面 | 描述 |
|--------|-------|------|
| 通用 | `/settings` | 语言切换（中/英）、时区 |
| 账号 | `/settings/account` | 个人信息、密码、2FA |
| 外观 | `/settings/appearance` | 主题（亮/暗/系统）、密度 |
| 通知 | `/settings/notifications` | 邮件/推送/应用内通知开关 |
| AI 偏好 | `/settings/ai` | 分类行为、分类置信度阈值、自动/确认模式 |
| 集成 | `/settings/integrations` | Google Calendar / Outlook / Slack 等 |
| 订阅 | `/settings/subscription` | 计划管理、账单、用量 |
| 数据 | `/settings/data` | 数据导出（JSON/CSV）、账号删除 |

### 1.8 通知中心（原 PRD 缺失）

路由：`/notifications`

| 通知类型 | 触发条件 |
|---------|---------|
| 任务到期提醒 | 任务距 deadline < 24h |
| 逾期提醒 | 任务超过 deadline 未完成 |
| 碎片待处理 | 碎片 > 2h 未分类 |
| 周回顾就绪 | 每周日自动生成 |
| 系统通知 | 版本更新、订阅到期等 |

**推送策略**：
- 应用内：实时
- 浏览器推送：可配置开关
- 邮件摘要：每日/每周汇总（可配置）
- 智能免打扰：专注时间段内不推送

---

## 二、核心交互补充

### 2.1 键盘快捷键体系（对标 Linear）

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 全局命令面板 | `Cmd+K` / `Ctrl+K` | 搜索 + 导航 + 创建 |
| 快速捕获 | `Cmd+N` / `Ctrl+N` | 打开碎片输入 |
| 显示快捷键列表 | `?` | 覆盖层展示所有快捷键 |
| 跳转今日 | `G` then `T` | 两键序列 |
| 跳转收集箱 | `G` then `I` | |
| 跳转本周 | `G` then `W` | |
| 跳转项目 | `G` then `P` | |
| 标记完成 | `D` | 选中任务时 |
| 延后任务 | `S` | Snooze/Postpone |
| 设置优先级 | `1-4` | 1=urgent, 2=high, 3=medium, 4=low |

### 2.2 AI 分类置信度机制（原 PRD 缺失）

```
高置信度 (>= 0.9)：自动分类，不打扰用户，右下角 toast 提示
中置信度 (0.7 ~ 0.9)：自动分类 + 显示"AI 建议"标签，用户可一键确认或修改
低置信度 (< 0.7)：不自动分类，标记为"待处理"，要求用户手动分类
```

**用户纠错**：
- 用户修改分类时记录 correction，用于未来 prompt tuning
- 记录格式：`{ original: "knowledge", corrected: "task", content: "...", timestamp }`

### 2.3 每日仪式（对标 Sunsama，原 PRD 缺失）

**晨间规划**（每天首次打开时触发）：
```
Step 1: 展示今日已有安排（日历事件 + 到期任务）
Step 2: 展示昨日未完成任务 → 选择今日继续 or 延后
Step 3: 展示 Inbox 待处理碎片 → 快速分类
Step 4: 今日面板已就绪 → 开始工作
```

**日终回顾**（晚间主动触发或提醒）：
```
Step 1: 展示今日完成情况
Step 2: 未完成任务 → 明日 or 重新排期
Step 3: 记录今日收获/感悟（可选）
Step 4: 生成日报摘要
```

### 2.4 拖拽交互（原 PRD 缺失）

| 场景 | 交互 |
|------|------|
| 任务 → 日历 | 拖拽任务到时间块完成 timeboxing |
| 任务 → 项目 | 拖拽归因到项目 |
| 碎片 → 分类 | 拖拽碎片到分类快捷区 |
| 任务优先级排序 | 拖拽重新排序 |
| 周视图跨天迁移 | 拖拽任务到其他日期 |

---

## 三、数据模型补充（原 PRD 缺失）

### 3.1 核心实体 Schema

```typescript
// 碎片 Fragment
interface Fragment {
  id: string
  userId: string
  content: string
  type: "text" | "link" | "image" | "voice" | "document"
  status: "unprocessed" | "classified" | "archived"
  classification?: "task" | "schedule" | "knowledge" | "inspiration" | "follow-up"
  confidence?: number        // AI 分类置信度 0-1
  projectId?: string
  metadata?: {
    url?: string             // link 类型
    imageUrl?: string        // image 类型
    voiceUrl?: string        // voice 类型
    duration?: number        // voice 时长(秒)
    extractedText?: string   // OCR/ASR 提取文本
  }
  corrections?: Array<{     // 用户纠错记录
    from: string
    to: string
    timestamp: string
  }>
  createdAt: string
  processedAt?: string
}

// 任务 Task
interface Task {
  id: string
  userId: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done" | "postponed"
  priority: "urgent" | "high" | "medium" | "low"
  dueDate?: string
  dueTime?: string
  scheduledDate?: string     // timeboxing 到的具体日期
  scheduledStart?: string    // timeboxing 开始时间
  scheduledEnd?: string      // timeboxing 结束时间
  projectId?: string
  tags: string[]
  estimatedMinutes?: number
  actualMinutes?: number
  isRecurring?: boolean
  recurringRule?: string     // cron-like 规则
  sourceFragmentId?: string
  createdAt: string
  completedAt?: string
}

// 日程 ScheduleEvent
interface ScheduleEvent {
  id: string
  userId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: "meeting" | "focus" | "reminder" | "event"
  location?: string
  projectId?: string
  attendees?: string[]
  prepNotes?: string
  externalCalendarId?: string  // Google Calendar 同步 ID
  sourceFragmentId?: string
}

// 项目 Project
interface Project {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  icon?: string
  status: "active" | "paused" | "archived"
  createdAt: string
  archivedAt?: string
}

// 知识 KnowledgeItem
interface KnowledgeItem {
  id: string
  userId: string
  title: string
  content: string
  category: string
  tags: string[]
  projectId?: string
  linkedTaskIds?: string[]     // 双向关联任务
  sourceFragmentId?: string
  isStarred: boolean
  createdAt: string
  updatedAt: string
}
```

---

## 四、商业化补充（原 PRD 过于粗略）

### 4.1 订阅分层

| 层级 | 价格 | 限制 | 核心权益 |
|------|------|------|---------|
| Free | $0 | 50 碎片/月，基础 AI 分类 | Inbox + 今日面板 + 基础周回顾 |
| Pro | $9.99/月 | 无限碎片，高级 AI | 全功能 + 日历同步 + 数据导出 + 高级 AI（推理/建议） |
| Team（Phase 3） | $19.99/人/月 | — | 协作 + 共享项目 + 管理后台 |

### 4.2 付费转化钩子

```
Free 用户接近 50 碎片限额时 → 提示升级
Free 用户使用高级功能（日历同步）→ 引导升级
Free 用户查看周回顾只展示基础数据 → 完整版需 Pro
14 天 Pro 免费试用（注册即送）
```

---

## 五、技术约束与性能目标

### 5.1 性能指标（对标 Linear）

| 指标 | 目标 | 说明 |
|------|------|------|
| 首屏加载 | < 1.5s | LCP, 含 CDN |
| Command Palette 弹出 | < 200ms | 本地 UI，不等待 API |
| AI 分类响应 | < 3s | Claude API Sonnet |
| 全局搜索结果 | < 500ms | MySQL FULLTEXT + 缓存 |
| 碎片输入到存储 | < 300ms | 乐观更新，后台同步 |
| 页面导航 | < 300ms | Next.js 预加载 |

### 5.2 MVP 输入能力边界

| 输入类型 | MVP 支持 | Phase 2 |
|---------|---------|---------|
| 文本 | ✅ 核心 | — |
| 链接 | ✅ URL metadata 提取 | 深度内容解析 |
| 截图/图片 | ❌ | VLM OCR |
| 语音 | ❌ | ASR (Whisper) |
| 文档片段 | ❌ | PDF/文档解析 |

### 5.3 移动端策略

| 阶段 | 方案 | 说明 |
|------|------|------|
| MVP | Responsive Web | Tailwind 响应式，移动端可用 |
| Phase 2 | PWA | Service Worker 离线捕获 + 安装到桌面 |
| Phase 3 | 评估 Native | 根据用户需求决定 |

**移动端重点**：
- 碎片输入（移动端核心场景）
- 今日面板查看与打勾
- 通知查看
- 不需要在移动端做复杂排程

---

## 六、集成策略（原 PRD 缺失）

| 阶段 | 集成 | 方向 |
|------|------|------|
| MVP | — | 先独立运行，验证核心价值 |
| Phase 2 | Google Calendar | 双向同步日程 |
| Phase 2 | Google/Apple OAuth | 登录 |
| Phase 3 | Outlook Calendar | 双向同步 |
| Phase 3 | Slack / 企业微信 | 入站 webhook → 碎片 |
| Phase 4 | Open API | 第三方开发者接入 |

**设计原则**：独立运行优先，集成是放大器不是依赖（避免 Akiflow 的重集成模式）。

---

## 七、错误处理与边缘情况（原 PRD 缺失）

| 场景 | 处理方式 |
|------|---------|
| AI 分类失败 | 碎片保存为"未分类"，不丢失数据；提示用户手动分类 |
| AI API 超时 | 碎片先本地暂存，后台重试；用户看到"分类中"状态 |
| 网络断开 | 输入暂存 IndexedDB/localStorage，联网后批量同步 |
| AI 分类争议 | 提供"不同意"按钮 + 手动分类 + 反馈记录 |
| API 配额耗尽 | Free 用户提示升级；Pro 用户降级为不带 AI 的手动模式 |
| 日历同步冲突 | 以外部日历（Google）为主，本地变更标记冲突让用户选择 |

---

## 八、竞品差异化总结

### 8.1 核心竞争力定位

```
vs Sunsama：Sunsama 依赖集成拉取任务 → Ask Dorian 从碎片原生创造任务
vs Motion：Motion 是黑箱自动排程 → Ask Dorian 展示 AI 推理过程，用户有掌控感
vs Notion：Notion 是空白画布无限灵活 → Ask Dorian 是强观点执行流程，减少决策疲劳
vs Akiflow：Akiflow 手动分类 → Ask Dorian AI 自动分类 + 上下文理解
vs Raycast：Raycast 是系统级工具 → Ask Dorian 是完整的执行中枢平台
```

### 8.2 必须对标的 UX 模式

| 模式 | 来源 | 在 Ask Dorian 的实现 |
|------|------|---------------------|
| Global Quick Capture | Raycast, Akiflow | `Cmd+K` Command Palette + 悬浮按钮 |
| Guided Daily Ritual | Sunsama | 晨间规划 + 日终回顾引导流 |
| Keyboard-first | Linear | 完整快捷键体系 + `?` 快捷键发现 |
| `/` Slash Command | Notion | 输入框 `/task` `/note` `/idea` 等 |
| Timeboxing 可视化 | Sunsama, Akiflow | 任务 ↔ 日历双面板拖拽 |
| 乐观更新 / 即时响应 | Linear | 所有交互 < 200ms，不等 API |

---

## 九、MVP 页面全景（更新版）

| 页面 | 路由 | 阶段 | 说明 |
|------|------|------|------|
| 注册/登录 | `/auth/*` | MVP | 邮箱 + OAuth |
| Onboarding | `/onboarding` | MVP | 新用户引导 |
| 今日驾驶舱 | `/today` | MVP | 含晨间规划引导 |
| 收集箱 | `/inbox` | MVP | 碎片输入 + AI 分类 |
| 本周面板 | `/weekly` | MVP | 周计划 + 优先级 |
| 项目视图 | `/projects` | MVP | 项目归因 + 上下文 |
| 回顾 | `/review` | MVP | 周报 + 知识沉淀 |
| 日历 | `/calendar` | Phase 2 | 完整日历 + timeboxing |
| 知识库 | `/knowledge` | Phase 2 | 独立知识管理 |
| 设置 | `/settings/*` | Phase 2（语言/外观 MVP） | 完整设置中心 |
| 通知中心 | `/notifications` | Phase 2 | 统一通知 |
| Command Palette | 全局覆盖层 | MVP | `Cmd+K` 快速捕获 |

---

## 十、AI Engine Layer（原 PRD 完全缺失）

> **设计原则**：Thin Service — 一个 prompt、一次 API call、structured JSON output。不做 pipeline DAG，不做 model routing。

### 10.1 核心定位

AI 在 Ask Dorian 中只做**一件事**：把一段非结构化碎片文本 → 结构化可执行数据。

这不是一个 AI 产品，是一个**用 AI 做脏活的执行工具**。AI 层越薄越好。

### 10.2 Single Prompt, Single Call

一次 Claude API call 完成所有处理：classification + entity extraction + action suggestion。

**Request**:

```typescript
// POST /api/ai/classify
interface ClassifyRequest {
  content: string          // 用户输入的碎片原文
  type: "text" | "link"    // MVP 只支持文本和链接
  userContext?: {
    projects: string[]     // 用户现有项目名列表（用于 project attribution）
    timezone: string
  }
}
```

**Prompt 设计**（System Prompt + User Prompt，单轮）：

```
System:
You are a personal productivity assistant. Classify the user's input fragment
and extract structured data. Respond ONLY with valid JSON matching the schema.

Rules:
1. classification: choose exactly one of [task, schedule, knowledge, inspiration, follow-up]
2. confidence: 0.0 to 1.0, be honest about ambiguity
3. For tasks: extract title, priority, due date if mentioned
4. For schedules: extract event title, datetime, location, attendees
5. For knowledge: extract title, category, key points
6. If the fragment mentions a project name from the user's project list, set projectMatch
7. suggestedActions: 1-3 concrete next steps

User:
Fragment: "{content}"
User's existing projects: [{projects}]
Current time: {now}
```

**Response** (Claude structured output / tool_use):

```typescript
interface ClassifyResponse {
  classification: "task" | "schedule" | "knowledge" | "inspiration" | "follow-up"
  confidence: number
  structured: {
    // task
    title?: string
    priority?: "urgent" | "high" | "medium" | "low"
    dueDate?: string
    // schedule
    eventTitle?: string
    startTime?: string
    endTime?: string
    location?: string
    attendees?: string[]
    // knowledge
    category?: string
    keyPoints?: string[]
    // common
    tags?: string[]
  }
  projectMatch?: string           // 匹配到的项目名
  suggestedActions?: string[]     // AI 建议的下一步
  reasoning?: string              // AI 分类理由（中置信度时展示给用户）
}
```

### 10.3 调用流程

```
用户输入碎片
    │
    ▼
Frontend: 乐观保存碎片（status: "classifying"）
    │
    ▼
POST /api/fragments  →  写入 DB（status: "classifying"）
    │                        │
    ▼                        ▼
SSE 推送 "分类中" 状态    POST /api/ai/classify（Koa → Claude API）
                              │
                              ▼
                         Claude 返回 JSON
                              │
                              ▼
                    confidence >= 0.9 → 自动分类，toast 通知
                    confidence 0.7~0.9 → 自动分类 + "AI 建议"标签
                    confidence < 0.7 → 标记"待处理"，等用户确认
                              │
                              ▼
                    UPDATE fragment SET status, classification, structured_data
                              │
                              ▼
                    SSE 推送分类结果 → 前端实时更新
```

### 10.4 Weekly Review 生成

另一个 AI 调用场景，同样是 single call：

```typescript
// POST /api/ai/weekly-review
interface WeeklyReviewRequest {
  completedTasks: Task[]
  delayedTasks: Task[]
  newFragments: Fragment[]
  newKnowledge: KnowledgeItem[]
  weekRange: { start: string; end: string }
}

// Claude 返回
interface WeeklyReviewResponse {
  summary: string              // 一句话总结本周
  completedHighlights: string[] // 重点完成项
  delayedAnalysis: string       // 延期原因分析
  keyDecisions: string[]        // 本周关键决策
  knowledgeSediment: string[]   // 知识沉淀要点
  nextWeekSuggestions: string[] // 下周建议
}
```

### 10.5 Model 选型与成本

| 场景 | Model | 原因 | 预估成本/次 |
|------|-------|------|------------|
| 碎片分类 | Claude Haiku | 简单分类任务，速度优先 | ~$0.001 |
| 周回顾生成 | Claude Sonnet | 需要更强的总结和推理能力 | ~$0.01 |

**成本控制**：
- Free tier: 50 次分类/月 ≈ $0.05（几乎可忽略）
- Pro tier: 按实际用量，无硬上限，但预估人均 $0.5~1.0/月
- 不做 model routing 逻辑——直接硬编码 model ID，等量级上来再优化

### 10.6 错误处理（极简）

```typescript
async function classifyFragment(fragment: Fragment): Promise<ClassifyResponse> {
  try {
    const result = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: buildPrompt(fragment) }],
    })
    return parseResponse(result)
  } catch (error) {
    // 唯一的降级策略：保存碎片，标记未分类，不丢数据
    await updateFragment(fragment.id, { status: "unprocessed" })
    return { classification: "follow-up", confidence: 0, structured: {} }
  }
}
```

**不做的事**：
- ❌ 不做重试队列（碎片量小，失败了用户手动分类即可）
- ❌ 不做 prompt 版本管理（直接改代码）
- ❌ 不做 A/B test（等有用户数据再说）
- ❌ 不做 streaming（分类结果很短，不需要流式渲染）

---

## 十一、Backend API 设计（原 PRD 缺失）

> Koa.js RESTful API，前缀 `/api/v1`。

### 11.1 认证

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/register` | POST | 邮箱注册 |
| `/api/v1/auth/login` | POST | 邮箱登录，返回 JWT |
| `/api/v1/auth/oauth/google` | GET | Google OAuth 跳转 |
| `/api/v1/auth/oauth/google/callback` | GET | OAuth 回调 |
| `/api/v1/auth/refresh` | POST | 刷新 access token |
| `/api/v1/auth/forgot-password` | POST | 发送重置邮件 |
| `/api/v1/auth/reset-password` | POST | 重置密码 |

**Token 策略**：
- Access Token: JWT, 15min 过期, 存内存
- Refresh Token: opaque token, 30d 过期, httpOnly cookie
- 不用 session（无状态，适合单机部署也适合未来扩展）

### 11.2 碎片

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/fragments` | POST | 创建碎片（触发异步 AI 分类） |
| `/api/v1/fragments` | GET | 查询碎片列表（支持 status/classification 过滤） |
| `/api/v1/fragments/:id` | GET | 碎片详情 |
| `/api/v1/fragments/:id` | PATCH | 修改分类（用户纠错） |
| `/api/v1/fragments/:id` | DELETE | 删除碎片 |
| `/api/v1/fragments/:id/classify` | POST | 手动触发重新分类 |

### 11.3 任务

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/tasks` | POST | 创建任务 |
| `/api/v1/tasks` | GET | 查询任务（status/priority/date/project 过滤） |
| `/api/v1/tasks/:id` | PATCH | 更新任务（状态、优先级、排期） |
| `/api/v1/tasks/:id` | DELETE | 删除任务 |
| `/api/v1/tasks/today` | GET | 今日任务聚合（今日面板用） |
| `/api/v1/tasks/weekly` | GET | 本周任务聚合 |
| `/api/v1/tasks/:id/postpone` | POST | 延后任务 |
| `/api/v1/tasks/reorder` | PUT | 拖拽排序 |

### 11.4 日程

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/events` | POST | 创建日程 |
| `/api/v1/events` | GET | 查询日程（date range 过滤） |
| `/api/v1/events/:id` | PATCH | 更新日程 |
| `/api/v1/events/:id` | DELETE | 删除日程 |

### 11.5 项目

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/projects` | POST | 创建项目 |
| `/api/v1/projects` | GET | 项目列表 |
| `/api/v1/projects/:id` | GET | 项目详情（含关联 tasks/knowledge/events） |
| `/api/v1/projects/:id` | PATCH | 更新项目 |
| `/api/v1/projects/:id` | DELETE | 归档项目 |

### 11.6 知识库

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/knowledge` | POST | 创建知识 |
| `/api/v1/knowledge` | GET | 知识列表（category/tag/search 过滤） |
| `/api/v1/knowledge/:id` | PATCH | 更新知识 |
| `/api/v1/knowledge/:id` | DELETE | 删除知识 |
| `/api/v1/knowledge/search` | GET | 全文搜索 |

### 11.7 周回顾 & 通知

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/reviews/weekly` | GET | 获取/生成周回顾 |
| `/api/v1/reviews/weekly/:weekId` | GET | 历史周回顾详情 |
| `/api/v1/notifications` | GET | 通知列表 |
| `/api/v1/notifications/:id/read` | POST | 标记已读 |
| `/api/v1/notifications/read-all` | POST | 全部已读 |

### 11.8 用户 & 设置

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/user/profile` | GET | 用户信息 |
| `/api/v1/user/profile` | PATCH | 更新信息 |
| `/api/v1/user/settings` | GET | 用户设置 |
| `/api/v1/user/settings` | PATCH | 更新设置 |
| `/api/v1/user/subscription` | GET | 订阅状态 |

---

## 十二、MySQL Schema（原 PRD 缺失）

> 基于第三节 TypeScript 接口，转化为 MySQL 8.0 DDL。

```sql
-- 用户表
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,               -- UUID v4
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),             -- NULL if OAuth-only
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  oauth_provider ENUM('google', 'apple', 'github'),
  oauth_provider_id VARCHAR(255),
  locale ENUM('zh', 'en') NOT NULL DEFAULT 'zh',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Shanghai',
  settings JSON,                          -- 用户偏好（主题、通知开关等）
  subscription_tier ENUM('free', 'pro') NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_oauth (oauth_provider, oauth_provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 碎片表
CREATE TABLE fragments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'link', 'image', 'voice', 'document') NOT NULL DEFAULT 'text',
  status ENUM('classifying', 'unprocessed', 'classified', 'archived') NOT NULL DEFAULT 'classifying',
  classification ENUM('task', 'schedule', 'knowledge', 'inspiration', 'follow-up'),
  confidence DECIMAL(3,2),                -- AI 分类置信度 0.00~1.00
  structured_data JSON,                   -- AI 提取的结构化数据
  project_id CHAR(36),
  metadata JSON,                          -- url, imageUrl, voiceUrl, extractedText 等
  corrections JSON,                       -- 用户纠错记录 [{from, to, timestamp}]
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_classification (user_id, classification),
  INDEX idx_created (user_id, created_at DESC),
  FULLTEXT INDEX ft_content (content),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任务表
CREATE TABLE tasks (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in-progress', 'done', 'postponed') NOT NULL DEFAULT 'todo',
  priority ENUM('urgent', 'high', 'medium', 'low') NOT NULL DEFAULT 'medium',
  due_date DATE,
  due_time TIME,
  scheduled_date DATE,                    -- timeboxing 日期
  scheduled_start TIME,
  scheduled_end TIME,
  project_id CHAR(36),
  tags JSON,                              -- ["tag1", "tag2"]
  estimated_minutes INT UNSIGNED,
  actual_minutes INT UNSIGNED,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_rule VARCHAR(100),            -- cron-like
  sort_order INT NOT NULL DEFAULT 0,      -- 拖拽排序
  source_fragment_id CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_date (user_id, scheduled_date),
  INDEX idx_user_due (user_id, due_date),
  INDEX idx_user_project (user_id, project_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (source_fragment_id) REFERENCES fragments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 日程表
CREATE TABLE events (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  type ENUM('meeting', 'focus', 'reminder', 'event') NOT NULL DEFAULT 'event',
  location VARCHAR(500),
  project_id CHAR(36),
  attendees JSON,                          -- ["person1", "person2"]
  prep_notes TEXT,
  external_calendar_id VARCHAR(255),       -- Google Calendar 同步 ID
  source_fragment_id CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_time (user_id, start_time, end_time),
  INDEX idx_external (external_calendar_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 项目表
CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  icon VARCHAR(50),
  status ENUM('active', 'paused', 'archived') NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  INDEX idx_user_status (user_id, status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 知识表
CREATE TABLE knowledge (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags JSON,
  project_id CHAR(36),
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  source_fragment_id CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_category (user_id, category),
  INDEX idx_user_starred (user_id, is_starred),
  FULLTEXT INDEX ft_knowledge (title, content),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 知识-任务关联表
CREATE TABLE knowledge_task_links (
  knowledge_id CHAR(36) NOT NULL,
  task_id CHAR(36) NOT NULL,
  PRIMARY KEY (knowledge_id, task_id),
  FOREIGN KEY (knowledge_id) REFERENCES knowledge(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 周回顾表
CREATE TABLE weekly_reviews (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  week_start DATE NOT NULL,               -- 周一日期
  week_end DATE NOT NULL,                  -- 周日日期
  summary TEXT,
  ai_response JSON,                        -- AI 生成的完整回顾结构
  stats JSON,                              -- {completed, delayed, fragments, focusMinutes}
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_week (user_id, week_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 通知表
CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM('task_due', 'task_overdue', 'fragment_pending', 'review_ready', 'system') NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_type VARCHAR(50),                -- 'task', 'fragment', 'review'
  related_id CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_unread (user_id, is_read, created_at DESC),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refresh Token 表
CREATE TABLE refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE, -- bcrypt hash of token
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 十三、安全与限流（原 PRD 缺失）

### 13.1 API 安全

| 措施 | 实现 |
|------|------|
| 认证 | JWT Bearer Token（Authorization header） |
| CSRF | SameSite=Strict cookie + CSRF token（form 场景） |
| XSS | Content-Security-Policy header + React 自动转义 |
| SQL 注入 | 参数化查询（ORM / prepared statement），禁止拼接 SQL |
| Rate Limiting | koa-ratelimit, API: 100 req/min/user, Auth: 10 req/min/IP |
| CORS | 仅允许 askdorian.com origin |
| 密码 | bcrypt (cost=12), 最少 8 位 |
| 敏感数据 | AES-256 加密存储 API keys；日志脱敏 |

### 13.2 AI 调用限流

| 用户层级 | 碎片分类 | 周回顾 |
|---------|---------|--------|
| Free | 50 次/月 | 基础版（无 AI 生成，纯数据统计） |
| Pro | 无限制（但有 10 次/分钟速率限制） | 完整 AI 生成 |

```typescript
// 中间件层计数，简单高效
async function aiRateLimit(ctx, next) {
  const user = ctx.state.user
  if (user.tier === 'free') {
    const monthlyCount = await getMonthlyClassifyCount(user.id)
    if (monthlyCount >= 50) {
      ctx.throw(429, 'Monthly AI classification limit reached. Upgrade to Pro.')
    }
  }
  await next()
}
```

---

## 十四、离线与同步策略（原 PRD 缺失）

### 14.1 离线碎片捕获（MVP 最小方案）

```
网络正常：输入 → POST /api/fragments → DB → AI 分类
网络断开：输入 → localStorage 暂存 → 恢复后批量 POST
```

- 暂存格式：`askdorian_offline_fragments` key, JSON array
- 恢复检测：`navigator.onLine` + `online` event listener
- 恢复后按 createdAt 排序逐条提交，避免并发冲突
- 不做 IndexedDB（MVP 阶段 localStorage 够用，碎片都是小文本）

### 14.2 乐观更新

所有写操作使用乐观更新模式（对标 Linear）：

```
用户操作 → 立即更新 UI → 后台发 API → 成功则 noop，失败则 rollback + toast
```

关键场景：
- 标记任务完成 → 立即从列表移除 → API 失败则恢复
- 碎片分类修改 → 立即切换标签 → API 失败则恢复
- 拖拽排序 → 立即重排 → API 失败则恢复原顺序
