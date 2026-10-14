import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";
import { createNotionPage } from "./notion";

export class ArticleNotFoundError extends Error {}

// 기사를 Notion에 저장하고 페이지 URL을 돌려준다. 이미 저장한 기사는 Notion을 다시 부르지 않는다 (PRD F7).
export async function saveArticleToNotion(articleId: number, userId: string) {
  const [article] = await db
    .select({
      titleKo: articles.titleKo,
      originalTitle: articles.originalTitle,
      summaryKo: articles.summaryKo,
      description: articles.description,
      categoryName: categories.name,
      source: articles.source,
      sourceUrl: articles.sourceUrl,
      publishedAt: articles.publishedAt,
      savedUrl: notionSaves.notionPageUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(notionSaves, eq(notionSaves.articleId, articles.id))
    .where(eq(articles.id, articleId))
    .limit(1);
  if (!article) throw new ArticleNotFoundError();
  if (article.savedUrl) return article.savedUrl;

  const url = await createNotionPage(article);

  // 두 사람이 같은 기사를 동시에 저장하면 Notion 페이지가 둘 생길 수 있다.
  // articleId unique 제약으로 먼저 기록된 페이지만 남기고, 나중 것은 로그로 남긴다.
  const [inserted] = await db
    .insert(notionSaves)
    .values({ articleId, notionPageUrl: url, savedBy: userId })
    .onConflictDoNothing({ target: notionSaves.articleId })
    .returning({ url: notionSaves.notionPageUrl });
  if (inserted) return inserted.url;

  const [existing] = await db
    .select({ url: notionSaves.notionPageUrl })
    .from(notionSaves)
    .where(eq(notionSaves.articleId, articleId));
  console.warn(`[notion] 기사 ${articleId}가 동시에 저장되어 Notion 페이지가 중복됐어요: ${url}`);
  return existing?.url ?? url;
}
