"use client";

import { useState, useTransition } from "react";
import { saveToNotion } from "@/app/dashboard/actions";
import { Toast, type ToastMessage } from "./toast";
import { FOCUS, SECONDARY_BUTTON, SPINNER } from "./ui-classes";

// ui.md 4.3 Notion 저장 버튼 상태: 저장 전 → 저장 중 → 저장됨(Notion 링크). 실패하면 버튼으로 돌아오고 토스트로 알린다.
export function NotionSaveButton({ articleId, savedUrl }: { articleId: number; savedUrl: string | null }) {
  // 이번에 저장한 URL. 다른 사람이 저장해 새로 받은 savedUrl도 반영되도록 상태에 복사하지 않고 합쳐서 쓴다.
  const [url, setUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const shownUrl = url ?? savedUrl;

  if (shownUrl) {
    return (
      <a
        href={shownUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 rounded text-sm font-medium text-success ${FOCUS}`}
      >
        ✓ 저장됨 ↗
      </a>
    );
  }

  function handleClick() {
    setToast(null);
    startTransition(async () => {
      try {
        const result = await saveToNotion(articleId);
        if (result.ok) setUrl(result.url);
        else setToast({ message: result.error, tone: "error" });
      } catch {
        // 네트워크 끊김 등으로 액션 호출 자체가 실패하면 에러 바운더리 대신 토스트로 알린다
        setToast({ message: "Notion에 저장하지 못했어요. 다시 시도해 주세요.", tone: "error" });
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
        className={SECONDARY_BUTTON}
      >
        {isPending ? (
          <>
            <span className={SPINNER} aria-hidden />
            저장 중…
          </>
        ) : (
          "Notion 저장"
        )}
      </button>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
