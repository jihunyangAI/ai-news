import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { CategoryRow } from "@/components/category-row";
import { TEXT_BUTTON } from "@/components/ui-classes";
import { getCategoryCounts } from "@/lib/articles";

export const metadata: Metadata = {
  title: "카테고리 관리 | AI뉴스 수집기",
};

export default function CategoriesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className={TEXT_BUTTON}>
        ← 대시보드로
      </Link>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">카테고리 관리</h1>
          <p className="mt-1 text-sm text-muted">
            AI가 기사를 분류할 때 이름과 설명을 참고해요. 바꾼 내용은 새로 가져오는 기사부터 적용돼요.
          </p>
        </div>
        <div className="shrink-0">
          <AddCategoryDialog />
        </div>
      </div>
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryList />
      </Suspense>
    </main>
  );
}

async function CategoryList() {
  // 매 요청마다 최신 목록과 기사 수를 읽는다
  await connection();

  // proxy.ts already redirects signed-out users; check again next to the data access
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { categories } = await getCategoryCounts();

  if (categories.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="text-sm text-muted">아직 카테고리가 없어요. 카테고리가 없으면 모든 기사가 미분류로 저장돼요.</p>
      </div>
    );
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} />
      ))}
    </ul>
  );
}

function CategoryListSkeleton() {
  return (
    <ul aria-hidden className="mt-6 flex flex-col gap-3">
      {Array.from({ length: 4 }, (_, i) => (
        <li
          key={i}
          className="flex h-24 animate-pulse flex-col gap-3 rounded-2xl border border-border bg-surface p-5 motion-reduce:animate-none"
        >
          <div className="h-5 w-32 rounded bg-foreground/10" />
          <div className="h-4 w-2/3 rounded bg-foreground/10" />
        </li>
      ))}
    </ul>
  );
}
