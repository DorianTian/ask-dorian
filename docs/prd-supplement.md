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
