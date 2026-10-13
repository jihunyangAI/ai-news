"use server";

import { refresh } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { importLatestArticles, type IngestResult } from "@/lib/ingest";

export type FetchNewsState =
  | ({ ok: true } & IngestResult)
  | { ok: false; error: string };

export async function fetchNews(): Promise<FetchNewsState> {
  // Server Actions are reachable by direct POST, so check auth here as well as in proxy.ts
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };

  try {
    const result = await importLatestArticles();
    refresh();
    return { ok: true, ...result };
  } catch (error) {
    console.error("[fetchNews] 뉴스 가져오기 실패", error);
    return { ok: false, error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}
