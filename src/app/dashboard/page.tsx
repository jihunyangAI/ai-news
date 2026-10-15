import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CategoryBar } from "@/components/category-bar";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { NewsCard, NewsGridSkeleton } from "@/components/news-card";
import { Pagination } from "@/components/pagination";
import { SEARCH_MAX_LENGTH, SearchForm } from "@/components/search-form";
import { TEXT_BUTTON } from "@/components/ui-classes";
import { ARTICLES_PER_PAGE, getArticles, getCategoryCounts } from "@/lib/articles";
import { dashboardHref, type CategoryFilter } from "@/lib/dashboard-href";

export const metadata: Metadata = {
  title: "뉴스 대시보드 | AI뉴스 수집기",
};

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">뉴스 대시보드</h1>
      <Suspense
        fallback={
          <div className="mt-12">
            <NewsGridSkeleton />
          </div>
        }
      >
        <NewsList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// ?page=N. 숫자가 아니거나 1보다 작으면 1페이지로 본다.
function parsePage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

// ?category=<id|none>. 없는 카테고리 id나 잘못된 값이면 전체로 본다.
function parseCategory(value: string | string[] | undefined, categoryIds: number[]): CategoryFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "none") return "none";
  const id = Number(raw);
  return Number.isInteger(id) && categoryIds.includes(id) ? id : null;
}

// ?q=검색어. 앞뒤 공백을 지우고 너무 길면 자른다. 비어 있으면 검색하지 않는다.
function parseQuery(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, SEARCH_MAX_LENGTH);
}

async function NewsList({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  // Read fresh rows on every request; relative times on the cards also need the request time
  await connection();

  // proxy.ts already redirects signed-out users; check again next to the data access
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const q = parseQuery(params.q);
  const counts = await getCategoryCounts(q);
  const allTotal = counts.categories.reduce((sum, c) => sum + c.count, counts.uncategorized);
  const category = parseCategory(
    params.category,
    counts.categories.map((c) => c.id),
  );
  const total =
    category === null
      ? allTotal
      : category === "none"
        ? counts.uncategorized
        : (counts.categories.find((c) => c.id === category)?.count ?? 0);

  const totalPages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  // 범위를 넘는 페이지는 마지막 페이지를 보여준다
  const page = Math.min(parsePage(params.page), totalPages);
  const articles = await getArticles({ page, category, q });
  // 카드 배지 색은 카테고리 바와 같게 카테고리 순서(생성순)로 고른다
  const colorIndexById = new Map(counts.categories.map((c, index) => [c.id, index]));

  return (
    <>
      <p className="mt-1 text-sm text-muted">{q ? `'${q}' 검색 결과 ${total}건` : `총 ${total}건`}</p>
      {/* 넓은 화면에서는 카테고리 줄 오른쪽 끝에 검색창, 좁은 화면에서는 카테고리 아래에 둔다 */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <CategoryBar
          active={category}
          q={q}
          categories={counts.categories}
          uncategorized={counts.uncategorized}
          total={allTotal}
        />
        <SearchForm q={q} category={category} />
      </div>
      {q && articles.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted">&apos;{q}&apos;에 맞는 뉴스가 없어요</p>
          <Link href={dashboardHref({ category })} className={TEXT_BUTTON}>
            검색 지우기
          </Link>
        </div>
      ) : allTotal === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted">아직 수집한 뉴스가 없어요</p>
          <FetchNewsButton />
        </div>
      ) : articles.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted">이 카테고리에는 아직 뉴스가 없어요</p>
          <Link
            href="/dashboard"
            className="rounded text-sm font-medium text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            전체 보기
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id}>
              <NewsCard
                article={article}
                colorIndex={article.categoryId === null ? null : (colorIndexById.get(article.categoryId) ?? null)}
              />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} category={category} q={q} />
    </>
  );
}
