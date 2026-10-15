"use server";

import { refresh } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  CategoryInput,
  createCategory,
  deleteCategory as removeCategory,
  DuplicateCategoryNameError,
  updateCategory as saveCategory,
} from "@/lib/categories";

type FieldErrors = { name?: string; description?: string };

// 실패하면 입력값을 돌려준다. 폼 액션이 끝나면 React가 입력창을 비우므로 이 값으로 다시 채운다.
export type CategoryFormState =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: FieldErrors; values?: { name: string; description: string } }
  | null;

export type DeleteCategoryState = { ok: true } | { ok: false; error: string } | null;

const LOGIN_REQUIRED = { ok: false, error: "로그인이 필요해요." } as const;

function readValues(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

function readId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

// 추가와 수정이 같이 쓰는 검증·저장·오류 변환
async function submitCategory(
  formData: FormData,
  save: (input: CategoryInput) => Promise<void>,
): Promise<CategoryFormState> {
  const values = readValues(formData);
  const parsed = CategoryInput.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      values,
      fieldErrors: { name: fieldErrors.name?.[0], description: fieldErrors.description?.[0] },
    };
  }

  try {
    await save(parsed.data);
  } catch (error) {
    if (error instanceof DuplicateCategoryNameError) {
      return { ok: false, values, fieldErrors: { name: "이미 있는 이름이에요." } };
    }
    console.error("[category] 저장 실패", error);
    return { ok: false, values, error: "카테고리를 저장하지 못했어요. 다시 시도해 주세요." };
  }

  refresh();
  return { ok: true };
}

// Server Actions are reachable by direct POST, so each one checks auth as well as proxy.ts
export async function addCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const { userId } = await auth();
  if (!userId) return LOGIN_REQUIRED;
  return submitCategory(formData, createCategory);
}

export async function editCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const { userId } = await auth();
  if (!userId) return LOGIN_REQUIRED;
  const id = readId(formData);
  if (id === null) return { ok: false, error: "카테고리를 찾지 못했어요. 새로고침 후 다시 시도해 주세요." };
  return submitCategory(formData, (input) => saveCategory(id, input));
}

export async function deleteCategory(_prev: DeleteCategoryState, formData: FormData): Promise<DeleteCategoryState> {
  const { userId } = await auth();
  if (!userId) return LOGIN_REQUIRED;
  const id = readId(formData);
  if (id === null) return { ok: false, error: "카테고리를 찾지 못했어요. 새로고침 후 다시 시도해 주세요." };

  try {
    await removeCategory(id);
  } catch (error) {
    console.error("[category] 삭제 실패", error);
    return { ok: false, error: "카테고리를 삭제하지 못했어요. 다시 시도해 주세요." };
  }
  refresh();
  return { ok: true };
}
