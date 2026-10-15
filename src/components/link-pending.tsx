"use client";

import { useLinkStatus } from "next/link";
import { SPINNER } from "./ui-classes";

// <Link> 안에서만 쓴다. 이동이 끝날 때까지 children 대신 스피너를 보여준다.
// data-link-pending은 대시보드 목록이 CSS(:has)로 이동 중인지 알아채는 표시다.
export function LinkPending({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (!pending) return children;
  return (
    <>
      <span data-link-pending aria-hidden className={SPINNER} />
      <span className="sr-only">{children}</span>
    </>
  );
}
