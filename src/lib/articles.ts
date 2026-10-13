import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export type ArticleCard = Awaited<ReturnType<typeof getArticles>>[number];

export const ARTICLES_PER_PAGE = 9;

// 발행일 최신순. 카테고리가 없으면(미분류) categoryName은 null이다.
export async function getArticles({ page }: { page: number }) {
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
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(ARTICLES_PER_PAGE)
    .offset((page - 1) * ARTICLES_PER_PAGE);
}

export async function countArticles() {
  const [row] = await db.select({ total: count() }).from(articles);
  return row.total;
}
