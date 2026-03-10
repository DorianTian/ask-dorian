-- ============================================================
-- Ask Dorian — 完整数据库 Schema (PostgreSQL 16 + pgvector)
-- ============================================================
-- 版本: v1.1
-- 日期: 2026-03-10
-- 设计原则:
--   1. FK + 多态混用：确定性 1:N 用 FK，动态跨类型关系用 entity_relationship
--   2. ENUM 用于极其稳定的分类，VARCHAR + CHECK 用于可能变更的分类
--   3. 所有可变实体表带 version（乐观锁）+ deleted_at（软删除）+ fts_vector（全文搜索）
--   4. 跨端就绪：devices 表 + device_id 引用 + sync_cursor
--   5. 集成就绪：external_id/source/url + integrations 表
--   6. 中文全文搜索：应用层 nodejieba 分词 → fts_content 列 → simple 分词器
--      （AWS RDS 不支持 pg_jieba/zhparser，故在应用层完成中文分词）
--   7. 向量搜索：HNSW(m=16, ef_construction=200)，查询时 ef_search=100
-- ============================================================

-- ========================
-- 0. 扩展
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID 生成
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector 向量搜索
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- 三元组索引（模糊搜索 Phase 2）

-- ========================
-- 1. 枚举类型（仅用于极其稳定的分类）
-- ========================

-- 用户角色：free/pro/admin 几乎不会改
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('free', 'pro', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 碎片内容类型：输入的媒体形式
DO $$ BEGIN
  CREATE TYPE fragment_content_type AS ENUM (
    'text',            -- 文本输入
    'voice',           -- 语音转文字
    'image',           -- 图片/截图 OCR
    'url',             -- 链接抓取
    'file',            -- 文件摘要
    'email',           -- 邮件转发
    'forward'          -- 第三方消息转发
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 任务状态：状态机稳定
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'todo',            -- 待办
    'in_progress',     -- 进行中
    'done',            -- 已完成
    'cancelled',       -- 已取消
    'archived'         -- 已归档
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 任务优先级
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM (
    'urgent',          -- P0 紧急
    'high',            -- P1 高
    'medium',          -- P2 中
    'low',             -- P3 低
    'none'             -- 未设置
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 专注力等级（Sunsama 模式）
DO $$ BEGIN
  CREATE TYPE energy_level AS ENUM (
    'high',            -- 深度工作
    'medium',          -- 日常事务
    'low'              -- 机械操作
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 实体类型：多态关联 + 向量表共用
DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM (
    'fragment',
    'task',
    'event',
    'knowledge',
    'project'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 关系类型：实体间关系
DO $$ BEGIN
  CREATE TYPE relation_type AS ENUM (
    'generated_from',  -- 碎片 → 实体
    'belongs_to',      -- 实体 → 项目（补充 FK 覆盖不到的场景）
    'depends_on',      -- 前置依赖
    'blocks',          -- 阻塞关系
    'related_to',      -- 语义关联
    'split_from',      -- 碎片拆分
    'merged_from',     -- 合并来源
    'derived_from',    -- 衍生
    'references',      -- 引用
    'duplicate_of'     -- 重复标记
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;


-- ========================
-- 2. users — 用户表
-- ========================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                      -- 用户唯一 ID
  email               VARCHAR(255) UNIQUE NOT NULL,
                      -- 登录邮箱，全局唯一
  password_hash       VARCHAR(255) NOT NULL,
                      -- bcrypt(password, cost=12)
  name                VARCHAR(100) NOT NULL,
                      -- 显示名称
  avatar_url          TEXT,
                      -- 头像 URL（S3 / 第三方 OAuth 头像）
  timezone            VARCHAR(50) NOT NULL DEFAULT 'Asia/Shanghai',
                      -- 用户默认时区（IANA 格式）
  role                user_role NOT NULL DEFAULT 'free',
                      -- 用户角色（订阅等级）
  locale              VARCHAR(10) NOT NULL DEFAULT 'zh',
                      -- 用户界面语言偏好
  wechat_openid       VARCHAR(128) UNIQUE,
                      -- 微信 OpenID（Phase 3 微信登录）
  apple_sub           VARCHAR(255) UNIQUE,
                      -- Apple Sign In subject ID（Phase 3 iOS）
  google_sub          VARCHAR(255) UNIQUE,
                      -- Google OAuth subject ID

  -- ====== 配额跟踪 ======
  ai_quota_used       INT NOT NULL DEFAULT 0,
                      -- 当月 AI 调用次数（定时重置）
  ai_quota_reset_at   TIMESTAMPTZ,
                      -- 配额重置时间
  storage_used_bytes  BIGINT NOT NULL DEFAULT 0,
                      -- 已用存储空间（附件）

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_email            ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_wechat           ON users (wechat_openid) WHERE wechat_openid IS NOT NULL;


-- ========================
-- 3. user_settings — 用户设置表
-- ========================
CREATE TABLE IF NOT EXISTS user_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        -- 1:1 关联用户

  -- ====== 外观 ======
  language              VARCHAR(10) NOT NULL DEFAULT 'zh',
                        -- 界面语言
  theme                 VARCHAR(20) NOT NULL DEFAULT 'system',
                        -- system | light | dark

  -- ====== AI 偏好 ======
  ai_preferences        JSONB NOT NULL DEFAULT '{}',
                        -- {auto_confirm: false, default_model: 'haiku', tone: 'concise', ...}

  -- ====== 通知偏好 ======
  notification_settings JSONB NOT NULL DEFAULT '{}',
                        -- {task_due: true, event_reminder: true, weekly_review: true,
                        --  quiet_hours: {start: "22:00", end: "08:00"}, ...}

  -- ====== 工作偏好 ======
  work_preferences      JSONB NOT NULL DEFAULT '{}',
                        -- {work_hours: {start: "09:00", end: "18:00"},
                        --  focus_duration: 90, break_duration: 15,
                        --  default_task_duration: 30, week_start: "monday",
                        --  daily_planning_time: "08:30", ...}

  -- ====== 默认视图 ======
  default_views         JSONB NOT NULL DEFAULT '{}',
                        -- {home_page: "today", task_sort: "priority", calendar_view: "week", ...}

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========================
-- 4. devices — 设备表
-- ========================
-- 跨端核心：注册用户的每个设备，管理推送和同步
CREATE TABLE IF NOT EXISTS devices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- ====== 设备信息 ======
  device_name         VARCHAR(200),
                      -- 用户可见名称："MacBook Pro" / "iPhone 15"
  device_type         VARCHAR(20) NOT NULL,
                      -- desktop | mobile | tablet | watch
  platform            VARCHAR(20) NOT NULL,
                      -- web | pwa | tauri | ios | android | wechat_mini
  app_version         VARCHAR(50),
                      -- 客户端版本号
  os_info             VARCHAR(100),
                      -- "macOS 15.2" / "iOS 18.1"
  device_fingerprint  VARCHAR(255),
                      -- 设备指纹（辅助去重识别）

  -- ====== 推送通道 ======
  push_token          TEXT,
                      -- APNs device token / FCM token / Web Push subscription JSON
  push_provider       VARCHAR(20),
                      -- apns | fcm | web_push | wechat
  push_enabled        BOOLEAN NOT NULL DEFAULT TRUE,

  -- ====== 同步游标 ======
  sync_cursor         JSONB NOT NULL DEFAULT '{}',
                      -- 每个实体类型的同步水位
                      -- {fragments: "2026-03-10T12:00:00Z", tasks: "...", events: "...", ...}

  -- ====== 状态 ======
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_unique      ON devices (user_id, platform, device_fingerprint)
                                           WHERE device_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_device_user               ON devices (user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_device_push               ON devices (push_provider)
                                           WHERE push_token IS NOT NULL AND push_enabled = TRUE;


-- ========================
-- 5. sessions — 会话表
-- ========================
-- JWT refresh token 管理 + 设备绑定
CREATE TABLE IF NOT EXISTS sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id           UUID REFERENCES devices(id) ON DELETE SET NULL,
                      -- 绑定设备（跨设备登出的基础）

  refresh_token_hash  VARCHAR(64) NOT NULL,
                      -- SHA-256(refresh_token)，不存明文
  previous_token_hash VARCHAR(64),
                      -- 上一次轮换前的 refresh_token_hash
                      -- 用于 Reuse Detection：旧 token 被重放 → 判定泄露 → revoke session
  ip_address          INET,
                      -- 登录 IP
  user_agent          TEXT,
                      -- 浏览器/客户端 User-Agent

  expires_at          TIMESTAMPTZ NOT NULL,
                      -- refresh token 过期时间
  revoked_at          TIMESTAMPTZ,
                      -- 主动登出/踢下线时标记
  last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                      -- 最后活跃时间（每次 refresh 更新）

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_user          ON sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_token         ON sessions (refresh_token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_prev_token   ON sessions (previous_token_hash) WHERE previous_token_hash IS NOT NULL AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_device        ON sessions (device_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_cleanup       ON sessions (expires_at) WHERE revoked_at IS NULL;


-- ========================
-- 6. projects — 项目表
-- ========================
-- 组织维度：任务、事件、知识都可以归属到项目
CREATE TABLE IF NOT EXISTS projects (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- ====== 内容 ======
  name                VARCHAR(200) NOT NULL,
                      -- 项目名称
  description         TEXT,
                      -- 项目描述（Markdown）
  icon                VARCHAR(50),
                      -- 项目图标：emoji 或 lucide icon name
  color               VARCHAR(20) NOT NULL DEFAULT '#6366f1',
                      -- 项目主色调（hex）
  cover_url           TEXT,
                      -- 项目封面图

  -- ====== 状态 ======
  status              VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'paused', 'completed', 'archived')),

  -- ====== 目标与进度 ======
  goal                TEXT,
                      -- 项目目标描述
  due_date            DATE,
  progress            SMALLINT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
                      -- 完成百分比

  -- ====== 排序 ======
  sort_order          VARCHAR(255) NOT NULL DEFAULT '0|hzzzzz:',
                      -- Fractional indexing

  -- ====== 外部集成 ======
  external_id         VARCHAR(255),
  external_source     VARCHAR(50),
                      -- linear | notion | jira | asana
  external_url        VARCHAR(1000),
  sync_status         VARCHAR(20) NOT NULL DEFAULT 'local'
                      CHECK (sync_status IN ('local', 'synced', 'pending', 'conflict', 'error')),
  sync_version        INT NOT NULL DEFAULT 0,
  last_synced_at      TIMESTAMPTZ,

  -- ====== 标签 ======
  tags                TEXT[] NOT NULL DEFAULT '{}',

  -- ====== 跨端 ======
  version             INT NOT NULL DEFAULT 1,
                      -- 乐观锁版本号

  -- ====== 时间 ======
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,

  metadata            JSONB NOT NULL DEFAULT '{}',

  -- ====== 全文搜索（应用层 nodejieba 分词写入） ======
  fts_content         TEXT,
                      -- 应用层分词后的内容（空格分隔）
                      -- 原始: "数据平台重构" → 分词: "数据 平台 重构"
  fts_vector          TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('simple', coalesce(fts_content, ''))
                      ) STORED
);

CREATE INDEX IF NOT EXISTS idx_project_user_status   ON projects (user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_external      ON projects (external_source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_tags          ON projects USING GIN (tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_fts           ON projects USING GIN (fts_vector);


-- ========================
-- 7. fragments — 碎片表
-- ========================
-- 产品核心：用户所有输入的原始记录
-- 设计原则：raw_content 写入后不可变，所有处理结果在关联表中
CREATE TABLE IF NOT EXISTS fragments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id           UUID REFERENCES devices(id) ON DELETE SET NULL,
                      -- 哪个设备捕获的碎片

  -- ====== 内容（raw_content 不可变） ======
  raw_content         TEXT NOT NULL,
                      -- 用户原始输入
  content_type        fragment_content_type NOT NULL DEFAULT 'text',
                      -- 内容类型，决定后续处理管道
  content_hash        VARCHAR(64),
                      -- SHA-256(raw_content)，去重 + embedding 变更检测
  normalized_content  TEXT,
                      -- AI 标准化后的内容（可更新）

  -- ====== 来源追踪 ======
  input_source        VARCHAR(50) NOT NULL DEFAULT 'inbox'
                      CHECK (input_source IN (
                        'cmd_k', 'inbox', 'voice', 'wechat', 'slack', 'telegram',
                        'email', 'chrome_ext', 'api', 'import', 'shortcut', 'share_sheet'
                      )),
                      -- 输入来源渠道（VARCHAR + CHECK，方便扩展新渠道）
  input_device        VARCHAR(50),
                      -- 输入设备类型：desktop | mobile | tablet | watch
  source_app          VARCHAR(100),
                      -- 来源应用标识
  source_ref          VARCHAR(500),
                      -- 来源方唯一标识，幂等去重
                      -- 格式：{source}:{id}

  -- ====== AI 处理状态 ======
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'processed', 'confirmed', 'rejected', 'failed')),
  processing_attempts SMALLINT NOT NULL DEFAULT 0,
                      -- 重试计数，超过 3 次标记 failed
  last_error          TEXT,
  processed_at        TIMESTAMPTZ,
  confirmed_at        TIMESTAMPTZ,

  -- ====== 上下文辅助 ======
  locale              VARCHAR(10),
                      -- 检测到的输入语言
  timezone            VARCHAR(50),
                      -- 捕获时用户时区
  location            JSONB,
                      -- {lat, lng, name, address}
  client_context      JSONB NOT NULL DEFAULT '{}',
                      -- 客户端环境快照

  -- ====== 组织 ======
  parent_id           UUID REFERENCES fragments(id) ON DELETE SET NULL,
                      -- 拆分来源
  is_pinned           BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,

  -- ====== 扩展 ======
  metadata            JSONB NOT NULL DEFAULT '{}',
                      -- 按 content_type 不同存不同结构

  -- ====== 跨端 ======
  version             INT NOT NULL DEFAULT 1,

  -- ====== 时间 ======
  captured_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                      -- 用户主观捕获时间（离线输入后同步时可能与 created_at 不同）
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,

  -- ====== 全文搜索（应用层 nodejieba 分词写入） ======
  fts_content         TEXT,
                      -- 原始: "3点和老板讨论用户增长" → 分词: "3点 老板 讨论 用户 增长"
  fts_vector          TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('simple', coalesce(fts_content, ''))
                      ) STORED
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_frag_source_ref    ON fragments (source_ref) WHERE source_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_frag_user_status          ON fragments (user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_frag_user_time            ON fragments (user_id, captured_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_frag_content_hash         ON fragments (content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_frag_parent               ON fragments (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_frag_device               ON fragments (device_id) WHERE device_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_frag_fts                  ON fragments USING GIN (fts_vector);


-- ========================
-- 8. tasks — 任务表
-- ========================
CREATE TABLE IF NOT EXISTS tasks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- ====== 组织关系（确定性 FK） ======
  project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_id           UUID REFERENCES tasks(id) ON DELETE CASCADE,
                      -- 子任务（最多 2 层）

  -- ====== 内容 ======
  title               VARCHAR(500) NOT NULL,
  description         TEXT,
  checklist           JSONB NOT NULL DEFAULT '[]',
                      -- [{id, text, checked, sort_order}]

  -- ====== 状态与优先级 ======
  status              task_status NOT NULL DEFAULT 'todo',
  priority            task_priority NOT NULL DEFAULT 'none',
  energy_level        energy_level,
                      -- 所需专注力

  -- ====== 时间规划 ======
  start_date          DATE,
                      -- 计划开始日期
  due_date            DATE,
                      -- 截止日期
  due_time            TIMETZ,
                      -- 精确截止时间
  scheduled_date      DATE,
                      -- 排入执行日期（今日面板核心）
  scheduled_start     TIMESTAMPTZ,
                      -- Timeboxing 开始
  scheduled_end       TIMESTAMPTZ,
                      -- Timeboxing 结束

  -- ====== 工作量 ======
  estimated_minutes   SMALLINT,
  actual_minutes      SMALLINT,

  -- ====== 循环 ======
  is_recurring        BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule     VARCHAR(255),
                      -- iCal RRULE 格式
  recurrence_parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
                      -- 循环模板任务 ID

  -- ====== 排序 ======
  sort_order          VARCHAR(255) NOT NULL DEFAULT '0|hzzzzz:',
                      -- Fractional indexing

  -- ====== 标签 ======
  tags                TEXT[] NOT NULL DEFAULT '{}',

  -- ====== 来源追踪 ======
  source              VARCHAR(20) NOT NULL DEFAULT 'manual'
                      CHECK (source IN ('manual', 'ai_generated', 'imported', 'recurring', 'template')),

  -- ====== 外部集成 ======
  external_id         VARCHAR(255),
  external_source     VARCHAR(50),
                      -- linear | jira | todoist | notion | asana
  external_url        VARCHAR(1000),
  sync_status         VARCHAR(20) NOT NULL DEFAULT 'local'
                      CHECK (sync_status IN ('local', 'synced', 'pending', 'conflict', 'error')),
  sync_version        INT NOT NULL DEFAULT 0,
  last_synced_at      TIMESTAMPTZ,

  -- ====== 协作预留 ======
  assignee_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id          UUID REFERENCES users(id) ON DELETE SET NULL,

  -- ====== 跨端 ======
  version             INT NOT NULL DEFAULT 1,

  -- ====== 时间 ======
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,

  metadata            JSONB NOT NULL DEFAULT '{}',

  -- ====== 全文搜索（应用层 nodejieba 分词写入） ======
  fts_content         TEXT,
                      -- 分词后的 title + description
  fts_vector          TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('simple', coalesce(fts_content, ''))
                      ) STORED
);

CREATE INDEX IF NOT EXISTS idx_task_user_status      ON tasks (user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_task_user_scheduled   ON tasks (user_id, scheduled_date)
                                       WHERE deleted_at IS NULL AND status NOT IN ('done', 'cancelled', 'archived');
CREATE INDEX IF NOT EXISTS idx_task_user_due         ON tasks (user_id, due_date)
                                       WHERE deleted_at IS NULL AND due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_project          ON tasks (project_id) WHERE project_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_task_parent           ON tasks (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_external         ON tasks (external_source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_tags             ON tasks USING GIN (tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_task_fts              ON tasks USING GIN (fts_vector);


-- ========================
-- 9. events — 日程表
-- ========================
CREATE TABLE IF NOT EXISTS events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- ====== 组织关系 ======
  project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id             UUID REFERENCES tasks(id) ON DELETE SET NULL,
                      -- Timeboxing：任务排入日历产生的事件

  -- ====== 内容 ======
  title               VARCHAR(500) NOT NULL,
  description         TEXT,
  type                VARCHAR(20) NOT NULL DEFAULT 'other'
                      CHECK (type IN ('meeting', 'focus', 'reminder', 'deadline', 'personal', 'travel', 'break', 'other')),
  color               VARCHAR(20),

  -- ====== 状态 ======
  status              VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
  visibility          VARCHAR(20) NOT NULL DEFAULT 'default'
                      CHECK (visibility IN ('default', 'public', 'private')),
  busy_status         VARCHAR(20) NOT NULL DEFAULT 'busy'
                      CHECK (busy_status IN ('busy', 'free', 'tentative')),
                      -- AI 排程冲突检测核心字段

  -- ====== 时间 ======
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ,
  is_all_day          BOOLEAN NOT NULL DEFAULT FALSE,
  original_timezone   VARCHAR(50),
                      -- 创建时的时区（跨时区场景）

  -- ====== 地点 ======
  location            VARCHAR(500),
  location_geo        JSONB,
                      -- {lat, lng, address, place_id}
  conference_url      VARCHAR(1000),
  conference_type     VARCHAR(50),
                      -- zoom | google_meet | tencent | feishu | teams

  -- ====== 提醒 ======
  reminders           JSONB NOT NULL DEFAULT '[{"minutes": 15, "method": "push"}]',
                      -- [{minutes, method}]

  -- ====== 参与者 ======
  attendees           JSONB NOT NULL DEFAULT '[]',
                      -- [{user_id?, name, email, rsvp, role}]
  organizer_id        UUID REFERENCES users(id) ON DELETE SET NULL,

  -- ====== 循环事件 ======
  is_recurring        BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule     VARCHAR(255),
  recurrence_parent_id UUID REFERENCES events(id) ON DELETE SET NULL,
  recurrence_exception BOOLEAN NOT NULL DEFAULT FALSE,

  -- ====== 来源追踪 ======
  source              VARCHAR(20) NOT NULL DEFAULT 'manual'
                      CHECK (source IN ('manual', 'ai_generated', 'imported', 'recurring', 'timeboxing')),

  -- ====== 外部集成 ======
  external_id         VARCHAR(255),
  external_source     VARCHAR(50),
                      -- google | outlook | feishu | apple
  external_calendar_id VARCHAR(255),
                      -- 第三方日历 ID
  external_url        VARCHAR(1000),
  ical_uid            VARCHAR(500),
                      -- RFC 5545 UID，跨日历系统全局唯一标识
  sync_status         VARCHAR(20) NOT NULL DEFAULT 'local'
                      CHECK (sync_status IN ('local', 'synced', 'pending', 'conflict', 'error')),
  sync_version        INT NOT NULL DEFAULT 0,
  last_synced_at      TIMESTAMPTZ,

  -- ====== 标签 ======
  tags                TEXT[] NOT NULL DEFAULT '{}',

  -- ====== 跨端 ======
  version             INT NOT NULL DEFAULT 1,

  -- ====== 时间 ======
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,

  metadata            JSONB NOT NULL DEFAULT '{}',

  -- ====== 全文搜索（应用层 nodejieba 分词写入） ======
  fts_content         TEXT,
                      -- 分词后的 title + description + location
  fts_vector          TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('simple', coalesce(fts_content, ''))
                      ) STORED
);

CREATE INDEX IF NOT EXISTS idx_event_user_range      ON events (user_id, start_time, end_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_user_busy       ON events (user_id, start_time, end_time)
                                       WHERE deleted_at IS NULL AND status = 'confirmed' AND busy_status = 'busy';
CREATE INDEX IF NOT EXISTS idx_event_user_type       ON events (user_id, type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_project         ON events (project_id) WHERE project_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_task            ON events (task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_ical_uid        ON events (ical_uid) WHERE ical_uid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_external        ON events (external_source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_recurring       ON events (recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_tags            ON events USING GIN (tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_fts             ON events USING GIN (fts_vector);


-- ========================
-- 10. knowledge — 知识表
-- ========================
-- 沉淀层：碎片经 AI 处理 + 用户确认后沉淀为知识
CREATE TABLE IF NOT EXISTS knowledge (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- ====== 内容 ======
  title               VARCHAR(500) NOT NULL,
  content             TEXT NOT NULL,
                      -- Markdown 正文
  type                VARCHAR(30) NOT NULL DEFAULT 'note'
                      CHECK (type IN ('note', 'meeting_note', 'decision', 'reference', 'summary', 'snippet', 'insight')),
  summary             TEXT,
                      -- AI 生成的摘要
  source_url          VARCHAR(1000),
  source_title        VARCHAR(500),

  -- ====== 标签 ======
  tags                TEXT[] NOT NULL DEFAULT '{}',

  -- ====== 来源追踪 ======
  source              VARCHAR(20) NOT NULL DEFAULT 'manual'
                      CHECK (source IN ('manual', 'ai_generated', 'imported')),
  external_id         VARCHAR(255),
  external_source     VARCHAR(50),
                      -- notion | obsidian | roam
  external_url        VARCHAR(1000),
  sync_status         VARCHAR(20) NOT NULL DEFAULT 'local'
                      CHECK (sync_status IN ('local', 'synced', 'pending', 'conflict', 'error')),
  sync_version        INT NOT NULL DEFAULT 0,
  last_synced_at      TIMESTAMPTZ,

  -- ====== 版本 ======
  version             INT NOT NULL DEFAULT 1,
  last_edited_by      UUID REFERENCES users(id) ON DELETE SET NULL,

  -- ====== 时间 ======
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,

  metadata            JSONB NOT NULL DEFAULT '{}',

  -- ====== 全文搜索（应用层 nodejieba 分词写入） ======
  fts_content         TEXT,
                      -- 分词后的 title + content + summary
  fts_vector          TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('simple', coalesce(fts_content, ''))
                      ) STORED
);

CREATE INDEX IF NOT EXISTS idx_knowledge_user        ON knowledge (user_id, type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_project     ON knowledge (project_id) WHERE project_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_tags        ON knowledge USING GIN (tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_fts         ON knowledge USING GIN (fts_vector);


-- ========================
-- 11. entity_relationship — 实体关系表（多态关联）
-- ========================
-- 只存动态的、跨类型的关系；确定性 1:N 走直接 FK
CREATE TABLE IF NOT EXISTS entity_relationship (
  from_id             UUID NOT NULL,
  from_entity         entity_type NOT NULL,
  to_id               UUID NOT NULL,
  to_entity           entity_type NOT NULL,
  relation            relation_type NOT NULL,

  confidence          REAL,
                      -- AI 推断的关系置信度（0.0 ~ 1.0），NULL = 用户手动
  created_by          VARCHAR(20) NOT NULL DEFAULT 'system'
                      CHECK (created_by IN ('user', 'ai', 'sync', 'system')),
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (from_id, to_id, relation),
  CHECK (from_id != to_id OR relation = 'duplicate_of')
);

CREATE INDEX IF NOT EXISTS idx_er_from               ON entity_relationship (from_id, from_entity, relation);
CREATE INDEX IF NOT EXISTS idx_er_to                 ON entity_relationship (to_id, to_entity, relation);
CREATE INDEX IF NOT EXISTS idx_er_type_relation      ON entity_relationship (from_entity, relation);


-- ========================
-- 12. embeddings — 向量嵌入表
-- ========================
CREATE TABLE IF NOT EXISTS embeddings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type         entity_type NOT NULL,
  entity_id           UUID NOT NULL,
  content_hash        VARCHAR(64) NOT NULL,
                      -- SHA-256(被 embed 的内容)
  embedding           vector(1536) NOT NULL,
                      -- text-embedding-3-small 输出
  model               VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
                      -- 模型标识（换模型时可区分）
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_emb_user_vector       ON embeddings
                                       USING hnsw (embedding vector_cosine_ops)
                                       WITH (m = 16, ef_construction = 200);
                                       -- m=16: 个人工具数据量级（< 10M vectors）足够
                                       -- ef_construction=200: 比默认 64 高，索引质量更好
                                       -- 查询时需设置: SET hnsw.ef_search = 100;
CREATE INDEX IF NOT EXISTS idx_emb_user_entity       ON embeddings (user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_emb_content_hash      ON embeddings (content_hash);


-- ========================
-- 13. ai_process_logs — AI 处理日志表
-- ========================
CREATE TABLE IF NOT EXISTS ai_process_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fragment_id         UUID REFERENCES fragments(id) ON DELETE SET NULL,

  process_type        VARCHAR(50) NOT NULL
                      CHECK (process_type IN (
                        'fragment_classify', 'fragment_process', 'context_enrich',
                        'weekly_review', 'duplicate_detect', 'auto_schedule',
                        'knowledge_summarize', 'task_estimate'
                      )),

  -- ====== 输入快照 ======
  context_snapshot    JSONB NOT NULL,
  prompt_sent         JSONB NOT NULL,

  -- ====== 输出 ======
  ai_response         JSONB NOT NULL,
  parsed_result       JSONB,

  -- ====== 模型信息 ======
  model_used          VARCHAR(100) NOT NULL,
  model_version       VARCHAR(50),

  -- ====== 性能指标 ======
  input_tokens        INT NOT NULL,
  output_tokens       INT NOT NULL,
  total_tokens        INT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  processing_time_ms  INT NOT NULL,
  embedding_time_ms   INT,

  -- ====== 状态 ======
  status              VARCHAR(20) NOT NULL DEFAULT 'success'
                      CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  error_message       TEXT,

  -- ====== 成本 ======
  estimated_cost_usd  DECIMAL(10, 6),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_log_user           ON ai_process_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_log_fragment       ON ai_process_logs (fragment_id) WHERE fragment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_log_type           ON ai_process_logs (process_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_log_model          ON ai_process_logs (model_used, created_at DESC);


-- ========================
-- 14. notifications — 通知表
-- ========================
CREATE TABLE IF NOT EXISTS notifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id           UUID REFERENCES devices(id) ON DELETE SET NULL,
                      -- 定向推送到某设备（NULL = 推送到所有设备）

  type                VARCHAR(50) NOT NULL
                      CHECK (type IN (
                        'task_due', 'task_overdue', 'event_reminder',
                        'fragment_pending', 'ai_completed', 'weekly_review',
                        'sync_conflict', 'integration_error', 'system',
                        'quota_warning', 'feature_announcement'
                      )),
  title               VARCHAR(500) NOT NULL,
  body                TEXT,
  severity            VARCHAR(20) NOT NULL DEFAULT 'info'
                      CHECK (severity IN ('info', 'warning', 'urgent')),

  -- ====== 关联实体 ======
  entity_type         entity_type,
  entity_id           UUID,

  -- ====== 状态 ======
  is_read             BOOLEAN NOT NULL DEFAULT FALSE,
  read_at             TIMESTAMPTZ,
  is_pushed           BOOLEAN NOT NULL DEFAULT FALSE,
  pushed_at           TIMESTAMPTZ,
  push_channel        VARCHAR(20),
                      -- push | email | sms

  -- ====== 调度 ======
  scheduled_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread     ON notifications (user_id, scheduled_at DESC) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_pending_push    ON notifications (scheduled_at) WHERE is_pushed = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_entity          ON notifications (entity_type, entity_id) WHERE entity_type IS NOT NULL;


-- ========================
-- 15. integrations — 第三方集成表
-- ========================
CREATE TABLE IF NOT EXISTS integrations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  provider            VARCHAR(50) NOT NULL
                      CHECK (provider IN (
                        'google', 'outlook', 'feishu', 'apple',
                        'slack', 'notion', 'linear', 'jira', 'todoist',
                        'telegram', 'wechat', 'github', 'asana'
                      )),
  provider_account_id VARCHAR(255),
                      -- 第三方账户标识

  -- ====== OAuth 凭证（加密存储） ======
  access_token_enc    TEXT NOT NULL,
                      -- AES-256-GCM 加密后的 access token
  refresh_token_enc   TEXT,
  token_expires_at    TIMESTAMPTZ,
  scopes              TEXT[] NOT NULL DEFAULT '{}',
                      -- 授权范围

  -- ====== 同步配置 ======
  sync_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  sync_direction      VARCHAR(20) NOT NULL DEFAULT 'bidirectional'
                      CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
  sync_config         JSONB NOT NULL DEFAULT '{}',
                      -- {calendar_ids: [...], channel_ids: [...], ...}
  last_sync_at        TIMESTAMPTZ,
  last_sync_error     TEXT,

  -- ====== 状态 ======
  status              VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'expired', 'revoked', 'error')),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_integration_user      ON integrations (user_id, status);
CREATE INDEX IF NOT EXISTS idx_integration_sync      ON integrations (provider, status) WHERE sync_enabled = TRUE;


-- ========================
-- 16. attachments — 附件表
-- ========================
CREATE TABLE IF NOT EXISTS attachments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  entity_type         entity_type NOT NULL,
  entity_id           UUID NOT NULL,

  file_name           VARCHAR(500) NOT NULL,
  file_type           VARCHAR(100) NOT NULL,
                      -- MIME type
  file_size           BIGINT NOT NULL,
                      -- 字节数
  storage_key         VARCHAR(1000) NOT NULL,
                      -- S3 key: attachments/{user_id}/{yyyy-MM}/{uuid}.{ext}
  storage_provider    VARCHAR(20) NOT NULL DEFAULT 's3'
                      CHECK (storage_provider IN ('s3', 'local')),
  thumbnail_key       VARCHAR(1000),
                      -- 缩略图 S3 key

  metadata            JSONB NOT NULL DEFAULT '{}',
                      -- image: {width, height}, pdf: {pages}, audio: {duration_ms}

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_attach_entity         ON attachments (entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attach_user           ON attachments (user_id, created_at DESC) WHERE deleted_at IS NULL;
