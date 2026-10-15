import Form from "next/form";
import Link from "next/link";
import { inputClass, SECONDARY_BUTTON, TEXT_BUTTON } from "@/components/ui-classes";
import { dashboardHref, type CategoryFilter } from "@/lib/dashboard-href";

export const SEARCH_MAX_LENGTH = 100;

// GET 폼이라 '검색' 버튼이나 Enter로 /dashboard?q=…로 이동한다. 선택한 카테고리는 유지하고 페이지는 1로 돌아간다.
export function SearchForm({ q, category }: { q: string; category: CategoryFilter }) {
  return (
    <Form action="/dashboard" role="search" className="flex items-center gap-2 lg:shrink-0">
      {category !== null && <input type="hidden" name="category" value={String(category)} />}
      {/* key: 검색어가 바뀌어 다시 그려질 때(검색 지우기 등) 입력창 값도 맞춘다 */}
      <input
        key={q}
        type="search"
        name="q"
        defaultValue={q}
        maxLength={SEARCH_MAX_LENGTH}
        placeholder="제목이나 요약으로 검색"
        aria-label="뉴스 검색"
        className={`${inputClass(false)} max-w-md lg:w-56`}
      />
      <button type="submit" className={SECONDARY_BUTTON}>
        검색
      </button>
      {q && (
        <Link href={dashboardHref({ category })} className={`${TEXT_BUTTON} ml-1 whitespace-nowrap`}>
          검색 지우기
        </Link>
      )}
    </Form>
  );
}
