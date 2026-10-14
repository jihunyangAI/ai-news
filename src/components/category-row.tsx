"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteCategory, editCategory } from "@/app/categories/actions";
import { categoryTone } from "@/lib/category-color";
import { CategoryFormFields } from "./category-form-fields";
import { DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON, SPINNER } from "./ui-classes";

type Category = { id: number; name: string; description: string | null; count: number };

function EditForm({ category, onDone }: { category: Category; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(editCategory, null);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={category.id} />
      <CategoryFormFields
        idPrefix={`category-${category.id}`}
        state={state}
        defaults={{ name: category.name, description: category.description ?? "" }}
        autoFocus
      />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onDone} className={SECONDARY_BUTTON}>
          취소
        </button>
        <button type="submit" disabled={pending} aria-busy={pending} className={PRIMARY_BUTTON}>
          {pending && <span className={SPINNER} aria-hidden />}
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

// 브라우저 확인창 대신 줄 안에서 한 번 더 묻는다. 기사는 지우지 않고 미분류로 바뀐다는 점을 알린다.
function DeleteConfirm({ category, onCancel }: { category: Category; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(deleteCategory, null);

  return (
    <form action={formAction} className="mt-4 rounded-xl bg-danger/5 p-4">
      <input type="hidden" name="id" value={category.id} />
      <p className="text-sm">
        &lsquo;{category.name}&rsquo; 카테고리를 삭제할까요?{" "}
        {category.count > 0 ? `기사 ${category.count}건은 미분류로 바뀌어요.` : "이 카테고리의 기사는 없어요."}
      </p>
      {state && !state.ok && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          취소
        </button>
        <button type="submit" disabled={pending} aria-busy={pending} className={DANGER_BUTTON}>
          {pending && <span className={SPINNER} aria-hidden />}
          {pending ? "삭제 중…" : "삭제"}
        </button>
      </div>
    </form>
  );
}

export function CategoryRow({ category }: { category: Category }) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const backToView = () => setMode("view");

  return (
    <li className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      {mode === "edit" ? (
        <EditForm category={category} onDone={backToView} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${categoryTone(category.id).dot}`} />
                <h2 className="font-semibold">{category.name}</h2>
                <span className="text-xs text-muted">기사 {category.count}건</span>
              </div>
              <p className={`mt-1.5 text-sm leading-6 ${category.description ? "text-foreground/80" : "text-muted"}`}>
                {category.description ?? "설명이 없어요. 설명을 쓰면 AI가 더 정확하게 분류해요."}
              </p>
            </div>
            {mode === "view" && (
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setMode("edit")} className={SECONDARY_BUTTON}>
                  수정
                </button>
                <button type="button" onClick={() => setMode("delete")} className={SECONDARY_BUTTON}>
                  삭제
                </button>
              </div>
            )}
          </div>
          {mode === "delete" && <DeleteConfirm category={category} onCancel={backToView} />}
        </>
      )}
    </li>
  );
}
