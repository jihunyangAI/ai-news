import Parser from "rss-parser";
import { NEWS_SOURCES, type NewsSource, type SourceKey } from "./sources";

export type FeedItem = {
  sourceUrl: string;
  source: SourceKey;
  originalTitle: string;
  description: string | null;
  publishedAt: Date;
};

export type FeedResult = {
  items: FeedItem[];
  failedSources: NewsSource[];
};

const WINDOW_MS = 24 * 60 * 60 * 1000;
// The Verge puts the whole article body in the feed; keep enough for a 3-4 sentence summary
const MAX_DESCRIPTION_LENGTH = 2000;

const parser = new Parser({ timeout: 10_000 });

function toDescription(snippet: string | undefined) {
  const text = snippet?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > MAX_DESCRIPTION_LENGTH ? `${text.slice(0, MAX_DESCRIPTION_LENGTH)}…` : text;
}

async function fetchSource(source: NewsSource, since: number): Promise<FeedItem[]> {
  const feed = await parser.parseURL(source.feedUrl);
  const items: FeedItem[] = [];

  for (const item of feed.items) {
    const link = item.link?.trim();
    const title = item.title?.trim();
    const published = item.isoDate ? new Date(item.isoDate) : null;
    // 링크·제목·날짜가 없는 항목은 저장 기준을 만들 수 없으므로 버린다
    if (!link || !title || !published || Number.isNaN(published.getTime())) continue;
    if (published.getTime() < since) continue;

    items.push({
      sourceUrl: link,
      source: source.key,
      originalTitle: title,
      description: toDescription(item.contentSnippet),
      publishedAt: published,
    });
  }
  return items;
}

// 최근 24시간 기사만 가져온다. 한 소스가 실패해도 나머지 소스는 계속 처리한다.
export async function fetchRecentFeedItems(now = Date.now()): Promise<FeedResult> {
  const since = now - WINDOW_MS;
  const results = await Promise.allSettled(NEWS_SOURCES.map((source) => fetchSource(source, since)));

  const items: FeedItem[] = [];
  const failedSources: NewsSource[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error(`[rss] ${NEWS_SOURCES[i].name} 가져오기 실패`, result.reason);
      failedSources.push(NEWS_SOURCES[i]);
    }
  });
  return { items, failedSources };
}
