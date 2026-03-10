// ============================================================
// API Request Types
// Mapped from backend Zod validation schemas
// ============================================================

import type { TaskPriority, EnergyLevel, ThemePreference } from "./api"

// --- Auth ---

export interface DeviceInfo {
  deviceType: "desktop" | "mobile" | "tablet" | "watch"
  platform: "web" | "pwa" | "tauri" | "ios" | "android" | "wechat_mini"
  deviceName?: string
  appVersion?: string
  osInfo?: string
  deviceFingerprint?: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  deviceInfo: DeviceInfo
}

export interface LoginRequest {
  email: string
  password: string
  deviceInfo: DeviceInfo
}

export interface GoogleOAuthRequest {
  googleSub: string
  email: string
  name: string
  avatarUrl?: string
  deviceInfo: DeviceInfo
}

export interface RefreshTokenRequest {
  refreshToken: string
  deviceId: string
}

// --- Fragment ---

export interface CreateFragmentRequest {
  rawContent: string
  contentType?: string
  inputSource?: string
  inputDevice?: string
  sourceApp?: string
  sourceRef?: string
  locale?: string
  timezone?: string
  location?: Record<string, unknown>
  clientContext?: Record<string, unknown>
  parentId?: string
}

export interface ListFragmentsParams {
  status?: string
  limit?: number
  offset?: number
}

// --- Task ---

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId?: string
  parentId?: string
  priority?: TaskPriority
  energyLevel?: EnergyLevel
  startDate?: string
  dueDate?: string
  dueTime?: string
  scheduledDate?: string
  scheduledStart?: string
  scheduledEnd?: string
  estimatedMinutes?: number
  tags?: string[]
}

export type UpdateTaskRequest = Partial<CreateTaskRequest> & {
  status?: string
}

export interface ListTasksParams {
  status?: string
  projectId?: string
  limit?: number
  offset?: number
}

// --- Event ---

export interface CreateEventRequest {
  title: string
  description?: string
  startTime: string
  endTime?: string
  type?: string
  location?: string
  projectId?: string
  isAllDay?: boolean
  reminders?: { minutes: number; method: string }[]
  attendees?: Record<string, unknown>[]
}

export type UpdateEventRequest = Partial<CreateEventRequest>

export interface ListEventsParams {
  start?: string
  end?: string
  limit?: number
  offset?: number
}

// --- Project ---

export interface CreateProjectRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  goal?: string
  dueDate?: string
  tags?: string[]
}

export type UpdateProjectRequest = Partial<CreateProjectRequest> & {
  status?: string
}

export interface ListProjectsParams {
  status?: string
  limit?: number
  offset?: number
}

// --- Knowledge ---

export interface CreateKnowledgeRequest {
  title: string
  content: string
  knowledgeType?: string
  summary?: string
  sourceUrl?: string
  sourceTitle?: string
  projectId?: string
  tags?: string[]
}

export type UpdateKnowledgeRequest = Partial<Omit<CreateKnowledgeRequest, "knowledgeType">> & {
  type?: string
}

export interface ListKnowledgeParams {
  type?: string
  projectId?: string
  limit?: number
  offset?: number
}

// --- User ---

export interface UpdateProfileRequest {
  name?: string
  avatarUrl?: string | null
  locale?: string
  timezone?: string
}

export interface UpdateSettingsRequest {
  language?: string
  theme?: ThemePreference
  aiPreferences?: Record<string, unknown>
  notificationSettings?: Record<string, unknown>
  workPreferences?: Record<string, unknown>
  defaultViews?: Record<string, unknown>
}

// --- Notification ---

export interface ListNotificationsParams {
  unreadOnly?: boolean
  limit?: number
  offset?: number
}

// --- Review ---

export interface ReviewParams {
  weekStart: string
  timezone?: string
}
