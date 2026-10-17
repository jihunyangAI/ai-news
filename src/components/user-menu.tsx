"use client";

import { UserButton } from "@clerk/nextjs";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// UserButton은 Clerk가 로드되기 전에는 아무것도 그리지 않는다. 서버는 항상 로드 전이지만,
// Suspense 안의 헤더가 늦게 hydration되는 사이 브라우저에서 Clerk가 먼저 로드되면 첫 렌더가 서버 HTML과 달라진다.
// hydration 중에는 서버와 같은 빈 자리를 그리고, 그 뒤에 UserButton을 그린다.
export function UserMenu() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return hydrated ? <UserButton /> : <span aria-hidden className="size-7" />;
}
