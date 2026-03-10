import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["free", "pro", "admin"]);

export const fragmentContentTypeEnum = pgEnum("fragment_content_type", [
  "text",
  "voice",
  "image",
  "url",
  "file",
  "email",
  "forward",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "cancelled",
  "archived",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
]);

export const energyLevelEnum = pgEnum("energy_level", [
  "high",
  "medium",
  "low",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "fragment",
  "task",
  "event",
  "knowledge",
  "project",
]);

export const relationTypeEnum = pgEnum("relation_type", [
  "generated_from",
  "belongs_to",
  "depends_on",
  "blocks",
  "related_to",
  "split_from",
  "merged_from",
  "derived_from",
  "references",
  "duplicate_of",
]);
