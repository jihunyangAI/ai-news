import type { ArticleCard } from "./articles";

const SOURCE_LABELS: Record<ArticleCard["source"], string> = {
  techcrunch: "TechCrunch",
  theverge: "The Verge",
};

export function sourceLabel(source: ArticleCard["source"]) {
  return SOURCE_LABELS[source];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const relative = new Intl.RelativeTimeFormat("ko-KR", { numeric: "auto" });
// 서버 시간대가 UTC여도 한국 시간 기준으로 표시한다
const absolute = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" });

// 24시간 이내는 상대 시간('3시간 전'), 그 외는 '2026. 10. 14.' 형식 (ui.md 4.1)
export function formatPublishedAt(date: Date, now = Date.now()) {
  const diff = now - date.getTime();
  if (diff < 0 || diff >= DAY_MS) return absolute.format(date);

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return relative.format(-minutes, "minute");
  return relative.format(-Math.floor(minutes / 60), "hour");
}
