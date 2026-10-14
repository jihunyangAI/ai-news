import type { ArticleCard } from "@/lib/articles";
import { categoryTone } from "@/lib/category-color";
import { formatPublishedAt, sourceLabel } from "@/lib/format";

function CategoryBadge({ colorIndex, name }: { colorIndex: number | null; name: string | null }) {
  // 카테고리 바 칩과 같은 카테고리 색, 미분류는 회색 (ui.md 4.2)
  const tone = colorIndex !== null && name ? categoryTone(colorIndex).badge : "bg-foreground/5 text-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {name ?? "미분류"}
    </span>
  );
}

// colorIndex: 기사 카테고리의 순서(생성순). null이면 미분류다.
export function NewsCard({ article, colorIndex }: { article: ArticleCard; colorIndex: number | null }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge colorIndex={colorIndex} name={article.categoryName} />
        <p className="text-xs text-muted">
          {sourceLabel(article.source)} ·{" "}
          <time dateTime={article.publishedAt.toISOString()}>
            {formatPublishedAt(article.publishedAt)}
          </time>
        </p>
      </div>

      <h2
        title={article.originalTitle}
        className="mt-3 line-clamp-2 text-base font-semibold leading-snug sm:text-lg"
      >
        {/* Claude 처리 전에는 원문 제목과 RSS 본문을 대신 보여준다 */}
        {article.titleKo ?? article.originalTitle}
      </h2>
      {(article.summaryKo ?? article.description) && (
        <p className="mt-2 line-clamp-4 text-[15px] leading-7 text-foreground/80">
          {article.summaryKo ?? article.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm font-medium text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          원문 보기 ↗
        </a>
      </div>
    </article>
  );
}

export function NewsGridSkeleton() {
  return (
    <ul aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="flex h-64 animate-pulse flex-col gap-3 rounded-2xl border border-border bg-surface p-5 motion-reduce:animate-none"
        >
          <div className="h-5 w-20 rounded-full bg-foreground/10" />
          <div className="h-5 w-11/12 rounded bg-foreground/10" />
          <div className="h-4 w-full rounded bg-foreground/10" />
          <div className="h-4 w-full rounded bg-foreground/10" />
          <div className="h-4 w-2/3 rounded bg-foreground/10" />
        </li>
      ))}
    </ul>
  );
}
