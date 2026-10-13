import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  // Claude 분류 프롬프트에 넣는 분류 기준 힌트
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  // 중복 판별 기준. 이미 있는 URL은 Claude를 다시 호출하지 않는다.
  sourceUrl: text("source_url").notNull().unique(),
  source: text("source", { enum: ["techcrunch", "theverge"] }).notNull(),
  originalTitle: text("original_title").notNull(),
  // RSS description(HTML 제거). Claude 요약의 입력으로 쓴다.
  description: text("description"),
  // null = 아직 Claude로 처리하지 않은 기사. 다음 처리 때 채운다.
  titleKo: text("title_ko"),
  summaryKo: text("summary_ko"),
  // null = 미분류. 카테고리가 삭제되면 미분류로 바뀐다.
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notionSaves = pgTable("notion_saves", {
  id: serial("id").primaryKey(),
  // 기사당 저장 1회
  articleId: integer("article_id")
    .notNull()
    .unique()
    .references(() => articles.id, { onDelete: "cascade" }),
  notionPageUrl: text("notion_page_url").notNull(),
  // Clerk userId
  savedBy: text("saved_by").notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});
