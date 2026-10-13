import Link from "next/link";

const ITEM =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const IDLE = `${ITEM} border border-border bg-surface text-foreground hover:bg-foreground/5`;
const CURRENT = `${ITEM} bg-primary text-white`;
const DISABLED = `${ITEM} border border-border bg-surface text-muted opacity-60`;

function pageHref(page: number) {
  return page === 1 ? "/dashboard" : `/dashboard?page=${page}`;
}

// 처음·끝·현재 주변 페이지만 보여주고 나머지는 '…'로 줄인다
function visiblePages(current: number, total: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) {
      pages.push(p);
    } else if (pages.at(-1) !== "gap") {
      pages.push("gap");
    }
  }
  return pages;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지" className="mt-8 flex justify-center">
      <ul className="flex items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={IDLE}>
              이전
            </Link>
          ) : (
            <span aria-disabled className={DISABLED}>
              이전
            </span>
          )}
        </li>
        {visiblePages(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={pageHref(p)}
                aria-current={p === page ? "page" : undefined}
                className={p === page ? CURRENT : IDLE}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className={IDLE}>
              다음
            </Link>
          ) : (
            <span aria-disabled className={DISABLED}>
              다음
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
