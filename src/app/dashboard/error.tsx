"use client";

import { useEffect } from "react";
import { SECONDARY_BUTTON } from "@/components/ui-classes";

// ui.md 5장 '목록 오류': DB를 읽지 못하면 Next 기본 오류 화면 대신 안내와 '다시 시도'를 보여준다.
// 헤더(layout)는 그대로 남고, 이 화면이 대시보드 본문 자리를 대신한다.
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // 서버 오류는 브라우저에 digest만 오므로, 서버 로그와 맞춰 볼 수 있게 남긴다
    console.error("[dashboard] 목록을 불러오지 못했어요", error.digest ?? error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">뉴스 대시보드</h1>
      <div
        role="alert"
        className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center"
      >
        <p className="text-sm text-muted">뉴스를 불러오지 못했어요</p>
        <button type="button" onClick={() => retry()} className={SECONDARY_BUTTON}>
          다시 시도
        </button>
      </div>
    </main>
  );
}
