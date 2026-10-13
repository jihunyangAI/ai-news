export type SourceKey = "techcrunch" | "theverge";

export type NewsSource = {
  key: SourceKey;
  name: string;
  feedUrl: string;
};

// PRD 3장 뉴스 소스
export const NEWS_SOURCES: NewsSource[] = [
  {
    key: "techcrunch",
    name: "TechCrunch",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    key: "theverge",
    name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];
