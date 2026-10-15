"use client";

import { useState, useTransition } from "react";
import { deleteNews } from "@/app/dashboard/actions";
import { Toast, type ToastMessage } from "./toast";
import { FOCUS, SPINNER } from "./ui-classes";

// 카드 오른쪽 위 X 버튼. 성공하면 서버 액션의 refresh()로 목록이 다시 그려져 카드가 사라진다.
export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function handleClick() {
    setToast(null);
    startTransition(async () => {
      try {
        const result = await deleteNews(articleId);
        if (!result.ok) setToast({ message: result.error, tone: "error" });
      } catch {
        setToast({ message: "뉴스를 삭제하지 못했어요. 다시 시도해 주세요.", tone: "error" });
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
        aria-label="뉴스 삭제"
        title="뉴스 삭제"
        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-60 ${FOCUS}`}
      >
        {isPending ? <span className={SPINNER} aria-hidden /> : <span aria-hidden>✕</span>}
      </button>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
