"use client";

import { useState, useTransition } from "react";
import { fetchNews, type FetchNewsState } from "@/app/dashboard/actions";
import { NEWS_SOURCES } from "@/lib/rss/sources";
import { Toast, type ToastMessage } from "./toast";

// 번역 결과 문구. 실패나 미룬 기사는 다음 가져오기 때 다시 처리된다는 점을 함께 알린다.
function enrichMessage({ processed, failed, remaining }: { processed: number; failed: number; remaining: number }) {
  const parts: string[] = [];
  if (processed > 0) parts.push(`${processed}건을 번역했어요.`);
  if (failed > 0) parts.push(`${failed}건은 번역하지 못했어요. 다음에 가져올 때 다시 시도해요.`);
  if (remaining > 0) parts.push(`남은 ${remaining}건은 다음에 가져올 때 번역해요.`);
  return parts.join(" ");
}

function toToast(state: FetchNewsState): ToastMessage {
  if (!state.ok) return { message: state.error, tone: "error" };

  const { added, failedSources, failed } = state;
  const enrich = enrichMessage(state);
  const withEnrich = (message: string) => (enrich ? `${message.replace(/\.?$/, ".")} ${enrich}` : message);

  if (failedSources.length === NEWS_SOURCES.length) {
    return { message: withEnrich("뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요."), tone: "error" };
  }
  if (failedSources.length > 0) {
    const rest = added > 0 ? `나머지에서 새 기사 ${added}건을 추가했어요.` : "나머지에는 새 기사가 없어요.";
    return { message: withEnrich(`${failedSources.join(", ")}를 가져오지 못했어요. ${rest}`), tone: "error" };
  }
  return {
    message: withEnrich(added > 0 ? `새 기사 ${added}건을 추가했어요` : "새 기사가 없어요"),
    tone: failed > 0 ? "error" : "info",
  };
}

export function FetchNewsButton() {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function handleClick() {
    setToast(null);
    startTransition(async () => {
      try {
        setToast(toToast(await fetchNews()));
      } catch {
        // 네트워크 끊김 등으로 액션 호출 자체가 실패하면 에러 바운더리 대신 토스트로 알린다
        setToast({ message: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.", tone: "error" });
      }
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

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
