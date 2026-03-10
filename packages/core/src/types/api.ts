// ============================================================
// API Response & Request Types
// Mapped 1:1 from backend controllers + Drizzle schema
// ============================================================

// --- Enums (mirror server-side PG enums) ---

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled" | "archived"
export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none"
export type EnergyLevel = "high" | "medium" | "low"
export type TaskSource = "manual" | "ai_generated" | "imported" | "recurring" | "template"

export type FragmentContentType = "text" | "voice" | "image" | "url" | "file" | "email" | "forward"
export type FragmentStatus = "pending" | "processing" | "processed" | "confirmed" | "rejected" | "failed"

export type EventType = "meeting" | "focus" | "reminder" | "deadline" | "personal" | "travel" | "break" | "other"
export type EventStatus = "tentative" | "confirmed" | "cancelled"
export type EventSource = "manual" | "ai_generated" | "imported" | "recurring" | "timeboxing"
export type BusyStatus = "busy" | "free" | "tentative"

export type KnowledgeType = "note" | "meeting_note" | "decision" | "reference" | "summary" | "snippet" | "insight"
export type KnowledgeSource = "manual" | "ai_generated" | "imported"

export type ProjectStatus = "active" | "paused" | "completed" | "archived"
export type SyncStatus = "local" | "synced" | "pending" | "conflict" | "error"
export type UserRole = "free" | "pro" | "admin"
export type ThemePreference = "system" | "light" | "dark"

export type NotificationType =
  | "task_due" | "task_overdue" | "event_reminder"
  | "fragment_pending" | "ai_completed" | "weekly_review"
  | "sync_conflict" | "integration_error" | "system"
  | "quota_warning" | "feature_announcement"

export type NotificationSeverity = "info" | "warning" | "urgent"

// --- Entity Types ---

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl: string | null
  locale: string
  timezone: string
}

export interface Fragment {
  id: string
  userId: string
  deviceId: string | null
  rawContent: string
  contentType: FragmentContentType
  contentHash: string | null
  normalizedContent: string | null
  inputSource: string
  inputDevice: string | null
  sourceApp: string | null
  sourceRef: string | null
  status: FragmentStatus
  processingAttempts: number
  lastError: string | null
  processedAt: string | null
  confirmedAt: string | null
  locale: string | null
  timezone: string | null
  location: Record<string, unknown> | null
  clientContext: Record<string, unknown>
  parentId: string | null
  isPinned: boolean
  isArchived: boolean
  metadata: Record<string, unknown>
  version: number
  capturedAt: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  ftsContent: string | null
}

export interface Task {
  id: string
  userId: string
  projectId: string | null
  parentId: string | null
  title: string
  description: string | null
  checklist: Record<string, unknown>[]
  status: TaskStatus
  priority: TaskPriority
  energyLevel: EnergyLevel | null
  startDate: string | null
  dueDate: string | null
  dueTime: string | null
  scheduledDate: string | null
  scheduledStart: string | null
  scheduledEnd: string | null
  estimatedMinutes: number | null
  actualMinutes: number | null
  isRecurring: boolean
  recurrenceRule: string | null
  recurrenceParentId: string | null
  sortOrder: string
  tags: string[]
  source: TaskSource
  externalId: string | null
  externalSource: string | null
  externalUrl: string | null
  syncStatus: SyncStatus
  syncVersion: number
  lastSyncedAt: string | null
  assigneeId: string | null
  creatorId: string | null
  version: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  metadata: Record<string, unknown>
  ftsContent: string | null
}

export interface CalendarEvent {
  id: string
  userId: string
  projectId: string | null
  taskId: string | null
  title: string
  description: string | null
  type: EventType
  color: string | null
  status: EventStatus
  visibility: string
  busyStatus: BusyStatus
  startTime: string
  endTime: string | null
  isAllDay: boolean
  originalTimezone: string | null
  location: string | null
  locationGeo: Record<string, unknown> | null
  conferenceUrl: string | null
  conferenceType: string | null
  reminders: EventReminder[]
  attendees: Record<string, unknown>[]
  organizerId: string | null
  isRecurring: boolean
  recurrenceRule: string | null
  recurrenceParentId: string | null
  recurrenceException: boolean
  source: EventSource
  externalId: string | null
  externalSource: string | null
  externalCalendarId: string | null
  externalUrl: string | null
  icalUid: string | null
  syncStatus: SyncStatus
  syncVersion: number
  lastSyncedAt: string | null
  tags: string[]
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  metadata: Record<string, unknown>
  ftsContent: string | null
}

export interface EventReminder {
  minutes: number
  method: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  icon: string | null
  color: string
  coverUrl: string | null
  status: ProjectStatus
  goal: string | null
  dueDate: string | null
  progress: number
  sortOrder: string
  externalId: string | null
  externalSource: string | null
  externalUrl: string | null
  syncStatus: SyncStatus
  syncVersion: number
  lastSyncedAt: string | null
  tags: string[]
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  metadata: Record<string, unknown>
  ftsContent: string | null
}

export interface Notification {
  id: string
  userId: string
  deviceId: string | null
  type: NotificationType
  title: string
  body: string | null
  severity: NotificationSeverity
  entityType: string | null
  entityId: string | null
  isRead: boolean
  readAt: string | null
  isPushed: boolean
  pushedAt: string | null
  pushChannel: string | null
  scheduledAt: string
  expiresAt: string | null
  createdAt: string
}

export interface Knowledge {
  id: string
  userId: string
  projectId: string | null
  title: string
  content: string
  type: KnowledgeType
  summary: string | null
  sourceUrl: string | null
  sourceTitle: string | null
  tags: string[]
  source: KnowledgeSource
  externalId: string | null
  externalSource: string | null
  externalUrl: string | null
  syncStatus: SyncStatus
  syncVersion: number
  lastSyncedAt: string | null
  version: number
  lastEditedBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  metadata: Record<string, unknown>
  ftsContent: string | null
}

// --- Auth ---

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  tokens: AuthTokens
  user: User
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// --- Dashboard ---

export interface TodayDashboard {
  date: string
  timezone: string
  tasks: {
    scheduled: Task[]
    overdue: Task[]
  }
  events: CalendarEvent[]
  pendingFragments: Fragment[]
  stats: {
    taskCounts: { status: string; count: number }[]
  }
}

export interface WeeklyDashboard {
  weekStart: string
  weekEnd: string
  timezone: string
  tasks: {
    scheduled: Task[]
    due: Task[]
    overdue: Task[]
  }
  events: CalendarEvent[]
}

// --- User Profile & Settings ---

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl: string | null
  locale: string
  timezone: string
  aiQuotaUsed: number
  createdAt: string
}

export interface UserSettings {
  id: string
  userId: string
  language: string
  theme: ThemePreference
  aiPreferences: Record<string, unknown>
  notificationSettings: Record<string, unknown>
  workPreferences: Record<string, unknown>
  defaultViews: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// --- Week Review ---

export interface WeekReview {
  weekStart: string
  weekEnd: string
  timezone: string
  completed: Task[]
  events: CalendarEvent[]
  knowledge: Knowledge[]
  fragmentsProcessed: number
}

// --- API Error ---

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
