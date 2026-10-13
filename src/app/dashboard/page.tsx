import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { NewsCard, NewsGridSkeleton } from "@/components/news-card";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "뉴스 대시보드 | AI뉴스 수집기",
};

export default function DashboardPage() {
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
        <NewsList />
      </Suspense>
    </main>
  );
}

async function NewsList() {
  // Read fresh rows on every request; relative times on the cards also need the request time
  await connection();

  // proxy.ts already redirects signed-out users; check again next to the data access
  const { userId } = await auth();
  if (!userId) redirect("/");

  const articles = await getArticles();

  return (
    <>
      <p className="mt-1 text-sm text-muted">총 {articles.length}건</p>
      {articles.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted">아직 수집한 뉴스가 없어요</p>
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
    </>
  );
}
