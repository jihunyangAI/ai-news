import { asc, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { processArticle } from "./ai/process-article";

export type EnrichResult = {
  processed: number;
  failed: number;
  // 한 번에 처리하는 개수를 넘어 다음 가져오기로 미룬 기사 수
  remaining: number;
};

// 한 번의 가져오기에서 Claude로 처리하는 최대 기사 수. 버튼 응답 시간을 제한한다.
const BATCH_LIMIT = 20;
// rate limit에 대비한 동시 호출 수
const CONCURRENCY = 4;

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      await worker(items[next++]);
    }
  });
  await Promise.all(runners);
}

// titleKo가 null인 기사를 최신순으로 번역·요약·분류한다. 실패한 기사는 null로 남아 다음 가져오기 때 다시 처리된다.
export async function enrichPendingArticles(): Promise<EnrichResult> {
  const pending = await db
    .select({ id: articles.id, originalTitle: articles.originalTitle, description: articles.description })
    .from(articles)
    .where(isNull(articles.titleKo))
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(BATCH_LIMIT);

  if (pending.length === 0) return { processed: 0, failed: 0, remaining: 0 };

  // 카테고리 변경은 이후 처리하는 기사부터 적용된다 (PRD F6)
  const categoryOptions = await db
    .select({ id: categories.id, name: categories.name, description: categories.description })
    .from(categories)
    .orderBy(asc(categories.id));

  let processed = 0;
  let failed = 0;
  await runWithConcurrency(pending, CONCURRENCY, async (article) => {
    try {
      const result = await processArticle(article, categoryOptions);
      await db.update(articles).set(result).where(eq(articles.id, article.id));
      processed++;
    } catch (error) {
      console.error(`[enrich] 기사 ${article.id} 처리 실패`, error);
      failed++;
    }
  });

  const [{ total }] = await db.select({ total: count() }).from(articles).where(isNull(articles.titleKo));
  return { processed, failed, remaining: total - failed };
}
