import type {
  Fragment,
  Task,
  ScheduleEvent,
  Project,
  KnowledgeItem,
  WeeklyReview,
  AppNotification,
  ProcessedFragment,
} from "./types"

// -- Fragments --
export const fragments: Fragment[] = [
  {
    id: "f0",
    content: "下午和设计师过一下新版收集箱的交互稿，重点看移动端适配",
    type: "text",
    status: "classifying",
    createdAt: "2026-03-08T10:02:00",
  },
  {
    id: "f1",
    content: "下周三和产品团队对齐 Q2 OKR，需要提前准备数据报告",
    type: "text",
    status: "unprocessed",
    createdAt: "2026-03-08T09:15:00",
  },
  {
    id: "f2",
    content: "https://linear.app/blog/product-thinking",
    type: "link",
    status: "classified",
    classification: "knowledge",
    confidence: 0.92,
    createdAt: "2026-03-08T08:30:00",
    processedAt: "2026-03-08T08:31:00",
  },
  {
    id: "f3",
    content: "灵感：可以用 LTTB 算法优化大数据量图表渲染",
    type: "text",
    status: "classified",
    classification: "inspiration",
    confidence: 0.88,
    reasoning: "内容提到了具体算法和优化思路，属于技术灵感而非具体任务。关联到 Ask Dorian 项目因涉及图表渲染。",
    projectId: "p2",
    createdAt: "2026-03-07T22:10:00",
    processedAt: "2026-03-07T22:11:00",
  },
  {
    id: "f4",
    content: "记得给房东转下个月房租",
    type: "text",
    status: "classified",
    classification: "task",
    confidence: 0.95,
    createdAt: "2026-03-07T20:00:00",
    processedAt: "2026-03-07T20:01:00",
  },
  {
    id: "f5",
    content: "会议纪要：决定采用 Flink CDC 替代批量同步方案，预计节省 40% 计算资源",
    type: "text",
    status: "classified",
    classification: "knowledge",
    confidence: 0.91,
    projectId: "p1",
    createdAt: "2026-03-07T17:30:00",
    processedAt: "2026-03-07T17:31:00",
  },
  {
    id: "f6",
    content: "周五下午 3 点牙医预约",
    type: "text",
    status: "classified",
    classification: "schedule",
    confidence: 0.97,
    createdAt: "2026-03-07T12:00:00",
    processedAt: "2026-03-07T12:01:00",
  },
]

// -- Tasks --
export const tasks: Task[] = [
  {
    id: "t1",
    title: "准备 Q2 OKR 数据报告",
    description: "收集 Q1 各项指标完成情况，准备 Q2 目标提案",
    status: "todo",
    priority: "high",
    dueDate: "2026-03-10",
    dueTime: "18:00",
    projectId: "p1",
    projectName: "数据平台",
    tags: ["报告", "OKR"],
    estimatedMinutes: 120,
    createdAt: "2026-03-08T09:15:00",
    sourceFragmentId: "f1",
  },
  {
    id: "t2",
    title: "Code Review: Flink CDC connector",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-03-08",
    projectId: "p1",
    projectName: "数据平台",
    tags: ["code-review", "flink"],
    estimatedMinutes: 60,
    createdAt: "2026-03-07T10:00:00",
  },
  {
    id: "t3",
    title: "转下个月房租",
    status: "todo",
    priority: "medium",
    dueDate: "2026-03-15",
    tags: ["生活"],
    createdAt: "2026-03-07T20:00:00",
    sourceFragmentId: "f4",
  },
  {
    id: "t4",
    title: "优化首屏加载性能",
    description: "分析 bundle size，lazy load 非关键模块",
    status: "todo",
    priority: "medium",
    dueDate: "2026-03-12",
    projectId: "p2",
    projectName: "Ask Dorian",
    tags: ["性能", "优化"],
    estimatedMinutes: 180,
    createdAt: "2026-03-06T14:00:00",
  },
  {
    id: "t5",
    title: "写周报",
    status: "done",
    priority: "low",
    dueDate: "2026-03-07",
    tags: ["常规"],
    createdAt: "2026-03-07T09:00:00",
    completedAt: "2026-03-07T17:00:00",
  },
  {
    id: "t6",
    title: "调研 next-intl vs react-i18next",
    status: "done",
    priority: "medium",
    projectId: "p2",
    projectName: "Ask Dorian",
    tags: ["调研", "i18n"],
    createdAt: "2026-03-05T10:00:00",
    completedAt: "2026-03-06T16:00:00",
  },
]

// -- Schedule Events --
export const scheduleEvents: ScheduleEvent[] = [
  {
    id: "e1",
    title: "Q2 OKR 对齐会",
    startTime: "2026-03-11T14:00:00",
    endTime: "2026-03-11T15:30:00",
    type: "meeting",
    location: "会议室 A3",
    projectId: "p1",
    attendees: ["产品团队", "数据团队"],
    prepNotes: "准备 Q1 数据报告，列出 Q2 目标提案",
  },
  {
    id: "e2",
    title: "牙医预约",
    startTime: "2026-03-13T15:00:00",
    endTime: "2026-03-13T16:00:00",
    type: "event",
    location: "XXX 口腔诊所",
    sourceFragmentId: "f6",
  },
  {
    id: "e3",
    title: "深度工作：Flink CDC 开发",
    startTime: "2026-03-10T09:00:00",
    endTime: "2026-03-10T12:00:00",
    type: "focus",
    projectId: "p1",
  },
  {
    id: "e4",
    title: "1:1 with Tech Lead",
    startTime: "2026-03-10T14:00:00",
    endTime: "2026-03-10T14:30:00",
    type: "meeting",
  },
  {
    id: "e5",
    title: "Sprint Review",
    startTime: "2026-03-10T16:00:00",
    endTime: "2026-03-10T17:00:00",
    type: "meeting",
    projectId: "p1",
    attendees: ["全组"],
  },
]

// -- Projects --
export const projects: Project[] = [
  {
    id: "p1",
    name: "数据平台",
    description: "湖仓一体化专项 + Flink 架构升级",
    color: "oklch(0.623 0.214 259.815)",
    status: "active",
    taskCount: 12,
    completedTaskCount: 7,
    createdAt: "2026-01-15T00:00:00",
  },
  {
    id: "p2",
    name: "Ask Dorian",
    description: "个人执行中枢产品开发",
    color: "oklch(0.546 0.245 262.881)",
    status: "active",
    taskCount: 8,
    completedTaskCount: 3,
    createdAt: "2026-02-20T00:00:00",
  },
  {
    id: "p3",
    name: "技术分享",
    description: "团队内部技术分享与文档",
    color: "oklch(0.809 0.105 251.813)",
    status: "active",
    taskCount: 4,
    completedTaskCount: 2,
    createdAt: "2026-01-01T00:00:00",
  },
]

// -- Knowledge --
export const knowledgeItems: KnowledgeItem[] = [
  {
    id: "k1",
    title: "Flink CDC 替代批量同步方案决策",
    content: "决定采用 Flink CDC 替代批量同步方案，预计节省 40% 计算资源。关键考量：实时性要求、资源成本、运维复杂度。",
    category: "技术决策",
    tags: ["flink", "CDC", "架构"],
    projectId: "p1",
    projectName: "数据平台",
    sourceFragmentId: "f5",
    createdAt: "2026-03-07T17:30:00",
    updatedAt: "2026-03-07T17:30:00",
  },
  {
    id: "k2",
    title: "LTTB 降采样算法笔记",
    content: "Largest Triangle Three Buckets 算法，适用于大数据量时间序列可视化。保留视觉特征的同时大幅减少数据点。",
    category: "技术笔记",
    tags: ["算法", "可视化", "性能"],
    projectId: "p2",
    projectName: "Ask Dorian",
    sourceFragmentId: "f3",
    createdAt: "2026-03-07T22:10:00",
    updatedAt: "2026-03-07T22:10:00",
  },
  {
    id: "k3",
    title: "Product Thinking 文章摘要",
    content: "Linear 团队关于产品思维的博文要点：focus on outcomes, not features; iterate on understanding, not just code.",
    category: "阅读笔记",
    tags: ["产品", "方法论"],
    sourceFragmentId: "f2",
    createdAt: "2026-03-08T08:30:00",
    updatedAt: "2026-03-08T08:30:00",
  },
]

// -- Weekly Review --
export const weeklyReview: WeeklyReview = {
  weekLabel: "2026-W10 (3/2 - 3/8)",
  completedTasks: 8,
  totalTasks: 14,
  delayedTasks: 2,
  keyDecisions: [
    "采用 Flink CDC 替代批量同步",
    "确定 Ask Dorian 使用 next-intl 做国际化",
    "Q2 OKR 初稿完成",
  ],
  knowledgeItems: 3,
  focusMinutes: 960,
}

// -- Notifications --
export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "task-due",
    title: "任务即将到期",
    message: "Code Review: Flink CDC connector 今天到期",
    read: false,
    createdAt: "2026-03-08T08:00:00",
    actionUrl: "/today",
  },
  {
    id: "n2",
    type: "fragment-pending",
    title: "碎片待处理",
    message: "你有 1 条新碎片等待分类",
    read: false,
    createdAt: "2026-03-08T09:15:00",
    actionUrl: "/inbox",
  },
  {
    id: "n3",
    type: "review-ready",
    title: "周回顾已就绪",
    message: "本周回顾报告已自动生成",
    read: true,
    createdAt: "2026-03-07T18:00:00",
    actionUrl: "/review",
  },
]

// -- Dashboard Stats --
export const todayStats = {
  totalTasks: 4,
  completedTasks: 1,
  pendingFragments: 1,
  scheduledEvents: 3,
  focusMinutesPlanned: 180,
  focusMinutesCompleted: 120,
}

// -- Pipeline Stats (Today) --
export const pipelineStats = {
  todayInputs: 5,
  generatedTasks: 4,
  generatedEvents: 2,
  generatedKnowledge: 1,
  pendingConfirmation: 1,
  conflictsDetected: 1,
}

// -- AI Processed Fragments (Showcase Demo) --
export const processedFragments: ProcessedFragment[] = [
  // 1. 模糊输入 — 只有两个字
  {
    id: "pf1",
    rawContent: "OKR",
    inputSource: "cmd-k",
    inputDevice: "desktop",
    capturedAt: "2026-03-09T10:30:00",
    processStatus: "needs_confirmation",
    processingTimeMs: 820,
    aiResult: {
      interpretation:
        "检测到与 Q2 OKR 相关的已有事项。你可能在提醒自己周三的 OKR 对齐会，或者准备工作。",
      confidence: 0.82,
      isSplit: false,
      matchedEntities: [
        { type: "event", title: "Q2 OKR 对齐会 · 周三 14:00" },
        { type: "task", title: "准备 Q2 OKR 数据报告 · 截止明天" },
      ],
      generatedEntities: [],
      conflicts: [],
      userPrompt: {
        message: "发现 2 个相关项，你想？",
        options: ["开始准备报告", "设置会议提醒", "其他意思..."],
      },
    },
  },
  // 2. 碎片化输入 — 关键词片段 + 日历冲突
  {
    id: "pf2",
    rawContent: "3点 老板 增长",
    inputSource: "mobile",
    inputDevice: "mobile",
    capturedAt: "2026-03-09T09:15:00",
    processStatus: "completed",
    processingTimeMs: 1100,
    aiResult: {
      interpretation:
        "推断为今天下午 3 点的临时会议，老板召集，讨论用户增长策略。检测到时间冲突。",
      confidence: 0.89,
      isSplit: false,
      matchedEntities: [
        { type: "project", title: "数据平台" },
      ],
      generatedEntities: [
        {
          type: "event",
          title: "用户增长策略讨论",
          time: "今天 15:00-16:00",
          detail: "参与人: 老板",
          project: "数据平台",
        },
        {
          type: "task",
          title: "准备增长数据 (DAU/MAU/留存)",
          priority: "high",
          dueDate: "今天 14:30",
          detail: "会前准备",
          project: "数据平台",
        },
      ],
      conflicts: [
        {
          description: "15:00-16:00 与已有「深度工作：性能优化」冲突",
          suggestion: "建议将专注时间移至明天上午",
        },
      ],
    },
  },
  // 3. 复合碎片 — 一段话拆分为多个事项
  {
    id: "pf3",
    rawContent:
      "站会上确定了几件事：CDC connector 这周必须上线；小王那边数据质量问题要我出个方案；另外下周技术分享轮到我了",
    inputSource: "cmd-k",
    inputDevice: "desktop",
    capturedAt: "2026-03-09T10:45:00",
    processStatus: "completed",
    processingTimeMs: 1450,
    aiResult: {
      interpretation: "识别为站会复合记录，包含 3 个独立事项，已拆分处理。",
      confidence: 0.94,
      isSplit: true,
      splitCount: 3,
      matchedEntities: [
        { type: "task", title: "Code Review: Flink CDC connector (进行中)" },
      ],
      generatedEntities: [
        {
          type: "task",
          title: "CDC connector 上线",
          priority: "urgent",
          dueDate: "本周五",
          project: "数据平台",
          detail: "关联已有 Code Review 任务，更新截止日",
        },
        {
          type: "task",
          title: "数据质量问题出方案",
          priority: "high",
          dueDate: "本周四",
          project: "数据平台",
          detail: "预估 2-3h · 明天上午有 3h 空档",
          tags: ["方案"],
        },
        {
          type: "task",
          title: "准备技术分享",
          priority: "medium",
          dueDate: "下周一",
          project: "技术分享",
          detail: "建议主题: Flink CDC 实践经验 (基于你近期 3 条知识沉淀)",
          tags: ["分享"],
        },
      ],
      conflicts: [],
    },
  },
  // 4. 生活事件 — AI 理解语义含义创建任务链
  {
    id: "pf4",
    rawContent: "下周二妈妈生日",
    inputSource: "ios-shortcut",
    inputDevice: "mobile",
    capturedAt: "2026-03-09T12:45:00",
    processStatus: "completed",
    processingTimeMs: 950,
    aiResult: {
      interpretation:
        "识别为重要个人事件。「生日」不只是日期标记，需要前置准备。已创建事件 + 任务链 + 年度循环。",
      confidence: 0.96,
      isSplit: false,
      matchedEntities: [],
      generatedEntities: [
        {
          type: "event",
          title: "妈妈生日",
          time: "下周二 全天",
          isRecurring: true,
          detail: "年度循环事件",
        },
        {
          type: "task",
          title: "买生日礼物",
          priority: "medium",
          dueDate: "下周一 (提前一天)",
          tags: ["生活"],
        },
        {
          type: "task",
          title: "订生日蛋糕",
          priority: "medium",
          dueDate: "下周一 (提前一天)",
          tags: ["生活"],
        },
        {
          type: "task",
          title: "发生日祝福",
          priority: "low",
          dueDate: "下周二 08:00",
          detail: "定时提醒",
          tags: ["生活"],
        },
      ],
      conflicts: [],
    },
  },
  // 5. 完全模糊 — 需要用户确认
  {
    id: "pf5",
    rawContent: "那个方案不行",
    inputSource: "wechat",
    inputDevice: "mobile",
    capturedAt: "2026-03-09T15:20:00",
    processStatus: "needs_confirmation",
    processingTimeMs: 780,
    aiResult: {
      interpretation:
        "检测到否定性评价，但无法确定指向哪个方案。你最近有 2 个进行中的方案相关事项。",
      confidence: 0.45,
      isSplit: false,
      matchedEntities: [
        { type: "task", title: "数据质量问题出方案" },
        { type: "knowledge", title: "Flink CDC 替代批量同步方案" },
      ],
      generatedEntities: [],
      conflicts: [],
      userPrompt: {
        message: "你说的是哪个方案？",
        options: [
          "数据质量方案 → 标记需要重做",
          "CDC 替代方案 → 更新知识记录",
          "其他方案 → 告诉我更多",
        ],
      },
    },
  },
]
