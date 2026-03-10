import { eq, and, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { entityRelationship } from "../db/schema/entity-relationship.js";

export type NewEntityRelationship = typeof entityRelationship.$inferInsert;
export type EntityRelationship = typeof entityRelationship.$inferSelect;

interface CreateRelationInput {
  fromEntityType: string;
  fromEntityId: string;
  toEntityType: string;
  toEntityId: string;
  relationType: string;
  confidence?: number;
  createdBy?: string;
}

export const entityRelationshipRepo = {
  async create(input: CreateRelationInput): Promise<EntityRelationship> {
    const rows = await db
      .insert(entityRelationship)
      .values({
        fromId: input.fromEntityId,
        fromEntity: input.fromEntityType as "fragment" | "task" | "event" | "knowledge" | "project",
        toId: input.toEntityId,
        toEntity: input.toEntityType as "fragment" | "task" | "event" | "knowledge" | "project",
        relation: input.relationType as "generated_from" | "belongs_to" | "depends_on" | "blocks" | "related_to" | "split_from" | "merged_from" | "derived_from" | "references" | "duplicate_of",
        confidence: input.confidence,
        createdBy: input.createdBy ?? "system",
      })
      .onConflictDoNothing()
      .returning();
    return rows[0]!;
  },

  /** Find all relationships where entity is source */
  async findFrom(
    entityId: string,
    entityType: string,
  ): Promise<EntityRelationship[]> {
    return db
      .select()
      .from(entityRelationship)
      .where(
        and(
          eq(entityRelationship.fromId, entityId),
          eq(
            entityRelationship.fromEntity,
            entityType as "fragment" | "task" | "event" | "knowledge" | "project",
          ),
        ),
      );
  },

  /** Find all relationships where entity is target */
  async findTo(
    entityId: string,
    entityType: string,
  ): Promise<EntityRelationship[]> {
    return db
      .select()
      .from(entityRelationship)
      .where(
        and(
          eq(entityRelationship.toId, entityId),
          eq(
            entityRelationship.toEntity,
            entityType as "fragment" | "task" | "event" | "knowledge" | "project",
          ),
        ),
      );
  },

  /** Find all relationships involving an entity (both directions) */
  async findAll(
    entityId: string,
    entityType: string,
  ): Promise<EntityRelationship[]> {
    return db
      .select()
      .from(entityRelationship)
      .where(
        or(
          and(
            eq(entityRelationship.fromId, entityId),
            eq(
              entityRelationship.fromEntity,
              entityType as "fragment" | "task" | "event" | "knowledge" | "project",
            ),
          ),
          and(
            eq(entityRelationship.toId, entityId),
            eq(
              entityRelationship.toEntity,
              entityType as "fragment" | "task" | "event" | "knowledge" | "project",
            ),
          ),
        ),
      );
  },

  /** Find relationships where the entity is target, filtered by relation type */
  async findByTargetEntity(
    entityType: string,
    entityId: string,
    relationType: string,
  ): Promise<EntityRelationship[]> {
    return db
      .select()
      .from(entityRelationship)
      .where(
        and(
          eq(entityRelationship.toId, entityId),
          eq(
            entityRelationship.toEntity,
            entityType as "fragment" | "task" | "event" | "knowledge" | "project",
          ),
          eq(
            entityRelationship.relation,
            relationType as "generated_from" | "belongs_to" | "depends_on" | "blocks" | "related_to" | "split_from" | "merged_from" | "derived_from" | "references" | "duplicate_of",
          ),
        ),
      );
  },

  async deleteRelation(
    fromId: string,
    toId: string,
    relation: string,
  ): Promise<boolean> {
    const rows = await db
      .delete(entityRelationship)
      .where(
        and(
          eq(entityRelationship.fromId, fromId),
          eq(entityRelationship.toId, toId),
          eq(
            entityRelationship.relation,
            relation as "generated_from" | "belongs_to" | "depends_on" | "blocks" | "related_to" | "split_from" | "merged_from" | "derived_from" | "references" | "duplicate_of",
          ),
        ),
      )
      .returning();
    return rows.length > 0;
  },
};
