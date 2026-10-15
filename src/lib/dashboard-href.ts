// null = 전체, "none" = 미분류, 숫자 = 해당 카테고리 id
export type CategoryFilter = number | "none" | null;

// 대시보드 URL. 필터는 ?category=<id|none>, 검색어는 ?q=, 페이지는 ?page=N으로 둔다 (ui.md 3.3)
export function dashboardHref({
  category = null,
  q = "",
  page = 1,
}: {
  category?: CategoryFilter;
  q?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (category !== null) params.set("category", String(category));
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}
