import Link from "next/link";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { LinkPending } from "./link-pending";
import { categoryTone } from "@/lib/category-color";
import { dashboardHref, type CategoryFilter } from "@/lib/dashboard-href";

const CHIP =
  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const IDLE = "border-border bg-surface text-foreground/70 hover:text-foreground";

// 칩마다 다른 부분: 앞의 색 점, 마우스를 올렸을 때 테두리, 선택됐을 때 모양
type ChipStyle = { dot?: string; hover: string; active: string };

const ALL_STYLE: ChipStyle = {
  hover: "hover:border-primary/40",
  active: "border-primary bg-primary-soft text-primary",
};
const NONE_STYLE: ChipStyle = {
  dot: "bg-muted/50",
  hover: "hover:border-foreground/30",
  active: "border-foreground/30 bg-foreground/5 text-foreground",
};

function CategoryChip({
  category,
  q,
  active,
  count,
  style,
  children,
}: {
  category: CategoryFilter;
  q: string;
  active: boolean;
  count: number;
  style: ChipStyle;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={dashboardHref({ category, q })}
      aria-current={active ? "page" : undefined}
      className={`${CHIP} ${active ? style.active : `${IDLE} ${style.hover}`}`}
    >
      {style.dot && <span aria-hidden className={`size-2 shrink-0 rounded-full ${style.dot}`} />}
      {children}
      <span className={`text-xs ${active ? "opacity-70" : "text-muted"}`}>
        <LinkPending>{count}</LinkPending>
      </span>
    </Link>
  );
}

// 순서: 전체 → 카테고리(생성순) → 미분류 → 카테고리 추가 (ui.md 3.3). 카테고리는 색 점으로 구분하고, 선택된 칩은 그 색으로 채운다.
// 검색 중이면 칩을 눌러도 검색어를 유지하고, 칩의 수는 검색에 걸린 기사 수다.
export function CategoryBar({
  active,
  q = "",
  categories,
  uncategorized,
  total,
}: {
  active: CategoryFilter;
  q?: string;
  categories: { id: number; name: string; count: number }[];
  uncategorized: number;
  total: number;
}) {
  return (
    <nav aria-label="카테고리" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:min-w-0 lg:flex-1">
      <ul className="flex items-center gap-2 whitespace-nowrap sm:flex-wrap">
        <li>
          <CategoryChip q={q} category={null} active={active === null} count={total} style={ALL_STYLE}>
            전체
          </CategoryChip>
        </li>
        {categories.map((c, index) => (
          <li key={c.id}>
            <CategoryChip q={q} category={c.id} active={active === c.id} count={c.count} style={categoryTone(index)}>
              {c.name}
            </CategoryChip>
          </li>
        ))}
        <li>
          <CategoryChip q={q} category="none" active={active === "none"} count={uncategorized} style={NONE_STYLE}>
            미분류
          </CategoryChip>
        </li>
        <li>
          <AddCategoryDialog />
        </li>
      </ul>
    </nav>
  );
}
