import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { NewsCard, NewsGridSkeleton } from "@/components/news-card";
import { Pagination } from "@/components/pagination";
import { ARTICLES_PER_PAGE, countArticles, getArticles } from "@/lib/articles";

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

async function NewsList({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  // Read fresh rows on every request; relative times on the cards also need the request time
  await connection();

  // proxy.ts already redirects signed-out users; check again next to the data access
  const { userId } = await auth();
  if (!userId) redirect("/");

  const total = await countArticles();
  const totalPages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  // 범위를 넘는 페이지는 마지막 페이지를 보여준다
  const page = Math.min(parsePage((await searchParams).page), totalPages);
  const articles = await getArticles({ page });

  return (
    <>
      <p className="mt-1 text-sm text-muted">총 {total}건</p>
      {articles.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted">아직 수집한 뉴스가 없어요</p>
          <FetchNewsButton />
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id}>
              <NewsCard article={article} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}
