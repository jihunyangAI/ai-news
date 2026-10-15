// 대시보드 제목 옆 전체 뉴스 수 배지. 강조색은 동작에만 쓰므로(ui.md 1장) 회색 톤으로 둔다.
const BADGE =
  "inline-flex h-7 items-center rounded-full border border-border bg-surface px-3 text-sm font-medium text-foreground/70 shadow-sm";

export function NewsCountBadge({ count }: { count: number }) {
  return (
    <span className={BADGE}>
      총&nbsp;<span className="font-semibold text-foreground tabular-nums">{count.toLocaleString("ko-KR")}</span>개의
      뉴스
    </span>
  );
}

export function NewsCountBadgeSkeleton() {
  return (
    <span
      className="inline-block h-7 w-28 animate-pulse rounded-full bg-foreground/10 motion-reduce:animate-none"
      aria-hidden
    />
  );
}
