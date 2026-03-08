// -- Fragment (碎片) --
export interface Fragment {
  id: string
  content: string
  type: "text" | "link" | "image" | "voice" | "document"
  status: "unprocessed" | "classified" | "archived"
  classification?: "task" | "schedule" | "knowledge" | "inspiration" | "follow-up"
  confidence?: number
  projectId?: string
  createdAt: string
  processedAt?: string
}

// -- Task --
export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done" | "postponed"
  priority: "urgent" | "high" | "medium" | "low"
  dueDate?: string
  dueTime?: string
  projectId?: string
  projectName?: string
  tags: string[]
  estimatedMinutes?: number
  createdAt: string
  completedAt?: string
  sourceFragmentId?: string
}

// -- Schedule Event --
export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: "meeting" | "focus" | "reminder" | "event"
  location?: string
  projectId?: string
  attendees?: string[]
  prepNotes?: string
  sourceFragmentId?: string
}

// -- Project --
export interface Project {
  id: string
  name: string
  description?: string
  color: string
  status: "active" | "paused" | "archived"
  taskCount: number
  completedTaskCount: number
  createdAt: string
}

// -- Knowledge --
export interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  projectId?: string
  projectName?: string
  sourceFragmentId?: string
  createdAt: string
  updatedAt: string
}

// -- Weekly Review --
export interface WeeklyReview {
  weekLabel: string
  completedTasks: number
  totalTasks: number
  delayedTasks: number
  keyDecisions: string[]
  knowledgeItems: number
  focusMinutes: number
}

// -- Notification --
export interface AppNotification {
  id: string
  type: "task-due" | "overdue" | "fragment-pending" | "review-ready" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}
