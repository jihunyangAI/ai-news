import { asc, count, desc, eq, isNull, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import type { CategoryFilter } from "./dashboard-href";

export type ArticleCard = Awaited<ReturnType<typeof getArticles>>[number];

export const ARTICLES_PER_PAGE = 9;

function categoryCondition(category: CategoryFilter): SQL | undefined {
  if (category === null) return undefined;
  if (category === "none") return isNull(articles.categoryId);
  return eq(articles.categoryId, category);
}

// 발행일 최신순. 카테고리가 없으면(미분류) categoryName은 null이다.
export async function getArticles({ page, category }: { page: number; category: CategoryFilter }) {
  return db
    .select({
      id: articles.id,
      sourceUrl: articles.sourceUrl,
      source: articles.source,
      originalTitle: articles.originalTitle,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      description: articles.description,
      publishedAt: articles.publishedAt,
      // 카테고리 색(categoryTone)을 고르는 데 쓴다
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(categoryCondition(category))
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(ARTICLES_PER_PAGE)
    .offset((page - 1) * ARTICLES_PER_PAGE);
}

// 카테고리 바용: 생성순 카테고리별 기사 수와 미분류 기사 수
export async function getCategoryCounts() {
  const [byCategory, [uncategorized]] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name, count: count(articles.id) })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.createdAt), asc(categories.id)),
    db.select({ count: count() }).from(articles).where(isNull(articles.categoryId)),
  ]);
  return { categories: byCategory, uncategorized: uncategorized.count };
}
