"use server";

import { refresh } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { enrichPendingArticles, type EnrichResult } from "@/lib/enrich";
import { importLatestArticles, type IngestResult } from "@/lib/ingest";
import { ArticleNotFoundError, saveArticleToNotion } from "@/lib/notion-save";

export type FetchNewsState =
  | ({ ok: true } & IngestResult & EnrichResult)
  | { ok: false; error: string };

export async function fetchNews(): Promise<FetchNewsState> {
  // Server Actions are reachable by direct POST, so check auth here as well as in proxy.ts
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };

  try {
    const ingest = await importLatestArticles();
    // 원문 저장이 끝난 뒤 Claude로 번역·요약·분류한다. 이번에 못 한 기사는 다음 가져오기 때 이어서 처리한다.
    const enrich = await enrichPendingArticles();
    refresh();
    return { ok: true, ...ingest, ...enrich };
  } catch (error) {
    console.error("[fetchNews] 뉴스 가져오기 실패", error);
    return { ok: false, error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}

export type SaveToNotionState = { ok: true; url: string } | { ok: false; error: string };

const ARTICLE_NOT_FOUND = { ok: false, error: "저장할 뉴스를 찾지 못했어요. 목록을 새로고침해 주세요." } as const;

export async function saveToNotion(articleId: number): Promise<SaveToNotionState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요." };
  // Server Action 인자는 클라이언트가 마음대로 보낼 수 있으므로 다시 확인한다
  if (!Number.isInteger(articleId) || articleId <= 0) return ARTICLE_NOT_FOUND;

  try {
    return { ok: true, url: await saveArticleToNotion(articleId, userId) };
  } catch (error) {
    if (error instanceof ArticleNotFoundError) return ARTICLE_NOT_FOUND;
    console.error(`[saveToNotion] 기사 ${articleId} 저장 실패`, error);
    return { ok: false, error: "Notion에 저장하지 못했어요. 다시 시도해 주세요." };
  }
}
