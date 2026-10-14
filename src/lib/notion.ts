import { Client, isFullDatabase, isFullPage } from "@notionhq/client";
import type { ArticleCard } from "./articles";
import { sourceLabel } from "./format";

// Notion API는 내부 integration 토큰으로 직접 호출한다 (PRD F7). Notion 호출은 이 파일에만 둔다.
// 토큰이 없어도 대시보드는 열려야 하므로 import 시점이 아니라 저장할 때 확인한다.
let client: Client | null = null;

function notion() {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN이 설정되지 않았습니다. .env.local을 확인하세요.");
  }
  client ??= new Client({ auth: process.env.NOTION_TOKEN });
  return client;
}

// API 버전 2025-09-03부터 페이지는 데이터베이스가 아니라 데이터 소스 아래에 만든다.
// 데이터베이스 ID로 첫 데이터 소스를 한 번 찾아 재사용한다. 실패하면 다음 저장 때 다시 찾는다.
let dataSourceId: Promise<string> | null = null;

function getDataSourceId() {
  dataSourceId ??= (async () => {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) throw new Error("NOTION_DATABASE_ID가 설정되지 않았습니다. .env.local을 확인하세요.");
    const database = await notion().databases.retrieve({ database_id: databaseId });
    const source = isFullDatabase(database) ? database.data_sources[0] : undefined;
    if (!source) throw new Error(`Notion 데이터베이스 ${databaseId}에 데이터 소스가 없습니다.`);
    return source.id;
  })();
  dataSourceId.catch(() => {
    dataSourceId = null;
  });
  return dataSourceId;
}

// Notion 제한: 텍스트 조각은 2000자, select 값은 100자이고 쉼표를 쓸 수 없다.
const text = (content: string) => [{ text: { content: content.slice(0, 2000) } }];
const selectName = (name: string) => name.replaceAll(",", " ").slice(0, 100);

export type NotionArticle = Pick<
  ArticleCard,
  "titleKo" | "originalTitle" | "summaryKo" | "description" | "categoryName" | "source" | "sourceUrl" | "publishedAt"
>;

// 'AI 뉴스 저장함' 데이터베이스에 행을 만들고 페이지 URL을 돌려준다.
// 속성 이름은 Notion 데이터베이스와 같아야 한다. Claude 처리 전 기사는 원문 제목과 RSS 본문을 대신 쓴다 (카드와 같은 규칙).
export async function createNotionPage(article: NotionArticle) {
  const summary = article.summaryKo ?? article.description;
  const page = await notion().pages.create({
    parent: { data_source_id: await getDataSourceId() },
    properties: {
      제목: { title: text(article.titleKo ?? article.originalTitle) },
      카테고리: { select: { name: selectName(article.categoryName ?? "미분류") } },
      출처: { select: { name: sourceLabel(article.source) } },
      "원문 링크": { url: article.sourceUrl },
      발행일: { date: { start: article.publishedAt.toISOString() } },
    },
    children: summary ? [{ paragraph: { rich_text: text(summary) } }] : [],
  });
  if (!isFullPage(page)) throw new Error("Notion이 페이지 URL을 돌려주지 않았습니다.");
  return page.url;
}
