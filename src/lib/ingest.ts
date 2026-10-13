import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { fetchRecentFeedItems, type FeedItem } from "./rss/fetch-feeds";

export type IngestResult = {
  added: number;
  failedSources: string[];
};

// RSS 원문만 저장한다. titleKo·summaryKo는 null로 두고 이후 Claude 처리 단계가 채운다.
export async function importLatestArticles(): Promise<IngestResult> {
  const { items, failedSources } = await fetchRecentFeedItems();

  // 같은 URL이 한 번의 가져오기 안에서 겹치면 처음 것만 쓴다
  const unique = new Map<string, FeedItem>();
  for (const item of items) {
    if (!unique.has(item.sourceUrl)) unique.set(item.sourceUrl, item);
  }

  // DB에 이미 있는 URL은 제외한다. Claude를 붙이면 이 이후의 기사만 호출 대상이 된다.
  if (unique.size > 0) {
    const existing = await db
      .select({ sourceUrl: articles.sourceUrl })
      .from(articles)
      .where(inArray(articles.sourceUrl, [...unique.keys()]));
    for (const row of existing) unique.delete(row.sourceUrl);
  }

  let added = 0;
  if (unique.size > 0) {
    // 동시에 가져오기를 눌러도 unique 제약에 걸리는 행은 조용히 건너뛴다
    const inserted = await db
      .insert(articles)
      .values([...unique.values()])
      .onConflictDoNothing({ target: articles.sourceUrl })
      .returning({ id: articles.id });
    added = inserted.length;
  }

  return { added, failedSources: failedSources.map((source) => source.name) };
}
