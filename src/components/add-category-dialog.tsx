"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { addCategory } from "@/app/categories/actions";
import { CategoryFormFields } from "./category-form-fields";
import { PRIMARY_BUTTON, SECONDARY_BUTTON, SPINNER } from "./ui-classes";

function AddCategoryForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(addCategory, null);

  // 추가에 성공하면 모달을 닫는다. 새 칩은 Server Action의 refresh()로 나타난다.
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction}>
      <CategoryFormFields idPrefix="add-category" state={state} autoFocus />
      <div className="mt-6 flex items-center justify-between gap-3">
        <Link
          href="/categories"
          className="rounded text-sm text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          카테고리 관리
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={onDone} className={SECONDARY_BUTTON}>
            취소
          </button>
          <button type="submit" disabled={pending} aria-busy={pending} className={PRIMARY_BUTTON}>
            {pending && <span className={SPINNER} aria-hidden />}
            {pending ? "추가 중…" : "추가"}
          </button>
        </div>
      </div>
    </form>
  );
}

// 카테고리 바 맨 끝의 '카테고리 추가' 버튼과 모달 (ui.md 3.3, 4.4)
export function AddCategoryDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // 열 때마다 폼을 새로 만들어 이전 입력과 오류를 지운다
  const [formKey, setFormKey] = useState(0);

  function open() {
    setFormKey((key) => key + 1);
    dialogRef.current?.showModal();
  }

  // <dialog>는 Esc로 닫히고, 닫히면 열기 전에 포커스가 있던 버튼으로 포커스가 돌아간다
  const close = useCallback(() => dialogRef.current?.close(), []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-border px-4 text-sm font-medium text-muted hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span aria-hidden className="text-base leading-none">
          +
        </span>
        카테고리 추가
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="add-category-title"
        // 패널 바깥(배경)을 누르면 닫는다. 패널 안쪽 클릭은 안쪽 div가 받는다.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="add-category-title" className="text-lg font-semibold">
              카테고리 추가
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="rounded px-1 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              ✕
            </button>
          </div>
          <AddCategoryForm key={formKey} onDone={close} />
        </div>
      </dialog>
    </>
  );
}
