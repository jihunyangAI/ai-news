"use client";

import { useEffect, useEffectEvent } from "react";

export type ToastMessage = { message: string; tone: "info" | "error" };

// ui.md 4.5: 일반 토스트는 4초 뒤 사라지고, 오류 토스트는 닫을 때까지 남는다
export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (toast?.tone !== "info") return;
    const timer = setTimeout(close, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="fixed inset-x-4 bottom-6 z-20 flex items-center justify-between gap-3 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      <span>{toast.message}</span>
      {toast.tone === "error" && (
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="shrink-0 rounded px-1 text-background/70 hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ✕
        </button>
      )}
    </div>
  );
}
