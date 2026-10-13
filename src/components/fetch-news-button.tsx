"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchNews, type FetchNewsState } from "@/app/dashboard/actions";
import { NEWS_SOURCES } from "@/lib/rss/sources";

type Toast = { message: string; tone: "info" | "error" };

function toToast(state: FetchNewsState): Toast {
  if (!state.ok) return { message: state.error, tone: "error" };

  const { added, failedSources } = state;
  if (failedSources.length === NEWS_SOURCES.length) {
    return { message: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.", tone: "error" };
  }
  if (failedSources.length > 0) {
    const rest = added > 0 ? `나머지에서 새 기사 ${added}건을 추가했어요.` : "나머지에는 새 기사가 없어요.";
    return { message: `${failedSources.join(", ")}를 가져오지 못했어요. ${rest}`, tone: "error" };
  }
  return {
    message: added > 0 ? `새 기사 ${added}건을 추가했어요` : "새 기사가 없어요",
    tone: "info",
  };
}

export function FetchNewsButton() {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<Toast | null>(null);

  // 일반 토스트는 4초 뒤 사라지고, 오류 토스트는 닫을 때까지 남는다 (ui.md 4.5)
  useEffect(() => {
    if (toast?.tone !== "info") return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleClick() {
    setToast(null);
    startTransition(async () => {
      setToast(toToast(await fetchNews()));
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            가져오는 중…
          </>
        ) : (
          <>
            <span className="sm:hidden">가져오기</span>
            <span className="hidden sm:inline">뉴스 가져오기</span>
          </>
        )}
      </button>

      {toast && (
        <div
          role={toast.tone === "error" ? "alert" : "status"}
          className="fixed inset-x-4 bottom-6 z-20 flex items-center justify-between gap-3 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          <span>{toast.message}</span>
          {toast.tone === "error" && (
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="닫기"
              className="shrink-0 rounded px-1 text-background/70 hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </>
  );
}
