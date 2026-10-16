import type { ArticleCard } from "@/lib/articles";
import { categoryTone } from "@/lib/category-color";
import { formatPublishedAt, sourceLabel } from "@/lib/format";
import { DeleteNewsButton } from "./delete-news-button";
import { NotionSaveButton } from "./notion-save-button";

// 미분류 카드는 회색 띠와 회색 글자를 쓴다 (ui.md 4.1)
const UNCATEGORIZED = { stripe: "bg-muted/40", text: "text-muted", hover: "hover:border-foreground/20" };

const SKELETON_COUNT = 6;

// 카드의 띠·이름·hover 테두리 색을 카테고리 바 칩과 같은 순서로 고른다
function cardTone(colorIndex: number | null, categoryName: string | null) {
  if (colorIndex === null || !categoryName) return UNCATEGORIZED;
  const { dot, text, hover } = categoryTone(colorIndex);
  return { stripe: dot, text, hover };
}

// colorIndex: 기사 카테고리의 순서(생성순). null이면 미분류다.
// 왼쪽 띠와 카테고리 이름이 카테고리 바 칩과 같은 색을 쓴다.
// 제목 링크가 카드 전체를 덮어(after:inset-0) 카드 어디를 눌러도 원문이 열린다. 버튼들은 relative z-10으로 그 위에 둔다.
export function NewsCard({ article, colorIndex }: { article: ArticleCard; colorIndex: number | null }) {
  const tone = cardTone(colorIndex, article.categoryName);
  const summary = article.summaryKo ?? article.description;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface py-6 pr-6 pl-7 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-primary ${tone.hover}`}
    >
      {/* 카테고리 색 띠. hover 때 조금 두꺼워진다 */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 transition-[width] duration-200 ease-out group-hover:w-1.5 motion-reduce:transition-none ${tone.stripe}`}
      />

      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className={`truncate font-semibold ${tone.text}`}>{article.categoryName ?? "미분류"}</span>
        <p className="flex shrink-0 items-baseline gap-2">
          <span className="font-semibold text-foreground/70">{sourceLabel(article.source)}</span>
          <time dateTime={article.publishedAt.toISOString()} className="text-muted tabular-nums">
            {formatPublishedAt(article.publishedAt)}
          </time>
        </p>
      </div>

      <h2 className="mt-3">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          data-card-link
          className="flex items-start gap-3 text-lg font-bold leading-snug tracking-tight break-keep text-foreground outline-none after:absolute after:inset-0 sm:text-xl"
        >
          {/* Claude 처리 전에는 원문 제목과 RSS 본문을 대신 보여준다 */}
          <span className="line-clamp-2 text-pretty">{article.titleKo ?? article.originalTitle}</span>
          <span
            aria-hidden
            className="mt-0.5 shrink-0 text-base font-medium text-muted transition duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:translate-0"
          >
            ↗
          </span>
          <span className="sr-only">(새 탭에서 원문 열기)</span>
        </a>
      </h2>

      {summary && <p className="mt-3 line-clamp-3 text-[15px] leading-7 break-keep text-foreground/80">{summary}</p>}

      {/* 남는 높이를 채워 하단을 카드 바닥에 붙이고, 높이가 빠듯해도 요약과 하단 사이를 최소 20px 띄운다 */}
      <div aria-hidden className="min-h-5 flex-1" />
      <div className="flex items-center justify-between gap-3">
        {/* 평소에는 숨기고 hover·키보드 포커스 때 보인다. hover가 없는 터치 기기에서는 항상 보인다 */}
        <div className="relative z-10 -ml-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <DeleteNewsButton articleId={article.id} />
        </div>
        <div className="relative z-10 shrink-0">
          <NotionSaveButton articleId={article.id} savedUrl={article.notionPageUrl} />
        </div>
      </div>
    </article>
  );
}

export function NewsGridSkeleton() {
  return (
    <ul aria-hidden className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <li
          key={i}
          className="relative flex h-64 animate-pulse flex-col overflow-hidden rounded-2xl border border-border bg-surface py-6 pr-6 pl-7 motion-reduce:animate-none"
        >
          <span className="absolute inset-y-0 left-0 w-1 bg-foreground/10" />
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-foreground/10" />
            <div className="h-3 w-24 rounded bg-foreground/10" />
          </div>
          <div className="mt-4 h-5 w-11/12 rounded bg-foreground/10" />
          <div className="mt-2 h-5 w-2/3 rounded bg-foreground/10" />
          <div className="mt-4 h-4 w-full rounded bg-foreground/10" />
          <div className="mt-3 h-4 w-4/5 rounded bg-foreground/10" />
          <div className="mt-auto ml-auto h-9 w-24 rounded-lg bg-foreground/10" />
        </li>
      ))}
    </ul>
  );
}
