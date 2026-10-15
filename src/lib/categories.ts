import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const CategoryInput = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(20, "이름은 20자 이내로 써 주세요."),
  // 비워 두면 null로 저장한다
  description: z
    .string()
    .trim()
    .max(200, "설명은 200자 이내로 써 주세요.")
    .transform((value) => value || null),
});

export type CategoryInput = z.infer<typeof CategoryInput>;

export class DuplicateCategoryNameError extends Error {}

// Postgres unique 위반(23505). Drizzle이 드라이버 오류를 cause로 감싸므로 따라 내려가며 찾는다.
function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ((error as { code?: unknown }).code === "23505") return true;
  return isUniqueViolation((error as { cause?: unknown }).cause);
}

async function assertNameAvailable(name: string, exceptId?: number) {
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      exceptId === undefined ? eq(categories.name, name) : and(eq(categories.name, name), ne(categories.id, exceptId)),
    )
    .limit(1);
  if (existing) throw new DuplicateCategoryNameError();
}

// 이름은 중복될 수 없다 (PRD F6). 미리 확인하고, 동시에 같은 이름이 들어오면 unique 제약으로 다시 막는다.
export async function createCategory(input: CategoryInput) {
  await assertNameAvailable(input.name);
  try {
    await db.insert(categories).values(input);
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateCategoryNameError();
    throw error;
  }
}

// 수정은 이후 가져오는 기사부터 적용된다. 기존 기사는 다시 분류하지 않는다.
export async function updateCategory(id: number, input: CategoryInput) {
  await assertNameAvailable(input.name, id);
  try {
    await db.update(categories).set(input).where(eq(categories.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateCategoryNameError();
    throw error;
  }
}

// 이 카테고리의 기사는 FK ON DELETE SET NULL로 미분류가 된다 (기사는 남는다)
export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}
