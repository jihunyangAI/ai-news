import Link from "next/link";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { categoryTone } from "@/lib/category-color";
import { dashboardHref, type CategoryFilter } from "@/lib/dashboard-href";

const CHIP =
  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const IDLE = "border-border bg-surface text-foreground/70 hover:text-foreground";

// 칩마다 다른 부분: 앞의 색 점, 마우스를 올렸을 때 테두리, 선택됐을 때 모양
type ChipStyle = { dot?: string; hover: string; active: string };

const ALL_STYLE: ChipStyle = { hover: "hover:border-primary/40", active: "border-primary bg-primary-soft text-primary" };
const NONE_STYLE: ChipStyle = {
  dot: "bg-muted/50",
  hover: "hover:border-foreground/30",
  active: "border-foreground/30 bg-foreground/5 text-foreground",
};

function CategoryChip({
  category,
  active,
  count,
  style,
  children,
}: {
  category: CategoryFilter;
  active: boolean;
  count: number;
  style: ChipStyle;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={dashboardHref({ category })}
      aria-current={active ? "page" : undefined}
      className={`${CHIP} ${active ? style.active : `${IDLE} ${style.hover}`}`}
    >
      {style.dot && <span aria-hidden className={`size-2 shrink-0 rounded-full ${style.dot}`} />}
      {children}
      <span className={`text-xs ${active ? "opacity-70" : "text-muted"}`}>{count}</span>
    </Link>
  );
}

// 순서: 전체 → 카테고리(생성순) → 미분류 → 카테고리 추가 (ui.md 3.3). 카테고리는 색 점으로 구분하고, 선택된 칩은 그 색으로 채운다.
export function CategoryBar({
  active,
  categories,
  uncategorized,
  total,
}: {
  active: CategoryFilter;
  categories: { id: number; name: string; count: number }[];
  uncategorized: number;
  total: number;
}) {
  return (
    <nav aria-label="카테고리" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex items-center gap-2 whitespace-nowrap sm:flex-wrap">
        <li>
          <CategoryChip category={null} active={active === null} count={total} style={ALL_STYLE}>
            전체
          </CategoryChip>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <CategoryChip category={c.id} active={active === c.id} count={c.count} style={categoryTone(c.id)}>
              {c.name}
            </CategoryChip>
          </li>
        ))}
        <li>
          <CategoryChip category="none" active={active === "none"} count={uncategorized} style={NONE_STYLE}>
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
