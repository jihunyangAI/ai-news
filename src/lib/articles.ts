import { and, asc, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";
import type { CategoryFilter } from "./dashboard-href";

export type ArticleCard = Awaited<ReturnType<typeof getArticles>>[number];

export const ARTICLES_PER_PAGE = 9;

function categoryCondition(category: CategoryFilter): SQL | undefined {
  if (category === null) return undefined;
  if (category === "none") return isNull(articles.categoryId);
  return eq(articles.categoryId, category);
}

// 검색어가 한국어 제목·요약 또는 원문 제목·description에 들어 있는 기사 (대소문자 무시).
// 검색어의 %, _, \는 LIKE 특수문자가 아니라 글자 그대로 찾는다.
function searchCondition(q: string): SQL | undefined {
  if (!q) return undefined;
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  return or(
    ilike(articles.titleKo, pattern),
    ilike(articles.summaryKo, pattern),
    ilike(articles.originalTitle, pattern),
    ilike(articles.description, pattern),
  );
}

// 발행일 최신순. 카테고리가 없으면(미분류) categoryName은 null이다.
export async function getArticles({ page, category, q = "" }: { page: number; category: CategoryFilter; q?: string }) {
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
      // 카드 배지 색을 고를 때 이 카테고리의 순서를 찾는 데 쓴다
      categoryId: categories.id,
      categoryName: categories.name,
      // null = 아직 Notion에 저장하지 않은 기사
      notionPageUrl: notionSaves.notionPageUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(notionSaves, eq(notionSaves.articleId, articles.id))
    .where(and(categoryCondition(category), searchCondition(q)))
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(ARTICLES_PER_PAGE)
    .offset((page - 1) * ARTICLES_PER_PAGE);
}

// Notion 저장 기록은 FK가 ON DELETE CASCADE라 같이 지워진다
export async function deleteArticle(id: number) {
  await db.delete(articles).where(eq(articles.id, id));
}

// 카테고리 바와 카테고리 관리 화면용: 생성순 카테고리별 기사 수와 미분류 기사 수.
// 검색어가 있으면 검색에 걸린 기사만 센다.
export async function getCategoryCounts(q = "") {
  const [byCategory, [uncategorized]] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        count: count(articles.id),
      })
      .from(categories)
      // 검색 조건을 ON 절에 둬야 검색 결과가 0건인 카테고리도 목록에 남는다
      .leftJoin(articles, and(eq(articles.categoryId, categories.id), searchCondition(q)))
      .groupBy(categories.id)
      .orderBy(asc(categories.createdAt), asc(categories.id)),
    db
      .select({ count: count() })
      .from(articles)
      .where(and(isNull(articles.categoryId), searchCondition(q))),
  ]);
  return { categories: byCategory, uncategorized: uncategorized.count };
}
