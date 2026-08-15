import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

/** A place BBQ knowledge comes from: a synced Drive folder, a Keep export, etc. */
export const sources = sqliteTable("sources", {
  id: id(),
  kind: text("kind").notNull(),
  config: text("config", { mode: "json" })
    .notNull()
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** One file or note pulled from a source, before chunking. */
export const sourceItems = sqliteTable(
  "source_items",
  {
    id: id(),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    /** Stable identity within the source — for a folder, the relative path. */
    externalId: text("external_id").notNull(),
    title: text("title"),
    content: text("content"),
    contentHash: text("content_hash"),
    /** bbq | non_bbq | ambiguous — null until the classifier has run. */
    classification: text("classification"),
    /** pending | indexed | discarded */
    status: text("status").notNull().default("pending"),
    metadata: text("metadata", { mode: "json" })
      .notNull()
      .$type<Record<string, unknown>>()
      .default({}),
    fetchedAt: integer("fetched_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("source_items_source_external_idx").on(t.sourceId, t.externalId),
    index("source_items_status_idx").on(t.status),
  ],
);

/**
 * A retrievable slice of a source item. Embeddings are stored as raw
 * float32 bytes and scored with a brute-force cosine scan — at this corpus
 * size that is well under a millisecond, so there is no vector index.
 */
export const chunks = sqliteTable(
  "chunks",
  {
    id: id(),
    sourceItemId: text("source_item_id")
      .notNull()
      .references(() => sourceItems.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    text: text("text").notNull(),
    tokenCount: integer("token_count"),
    embedding: blob("embedding", { mode: "buffer" }),
  },
  (t) => [index("chunks_source_item_idx").on(t.sourceItemId)],
);

export const conversations = sqliteTable("conversations", {
  id: id(),
  title: text("title"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const messages = sqliteTable("messages", {
  id: id(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  citations: text("citations", { mode: "json" })
    .notNull()
    .$type<unknown[]>()
    .default([]),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
