# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 상태

Vercel(`ai-news` 프로젝트)에 운영 배포 중이다. 기능 명세는 `PRD.md`다. 구현 전에 반드시 읽는다. 기능 F1~F7, 데이터 모델, 미결 사항(9장)이 정리되어 있다.

UI 가이드는 `ui.md`다. 화면이나 컴포넌트를 만들거나 고치기 전에 반드시 읽는다. 디자인 토큰, 레이아웃, 컴포넌트별 Tailwind 클래스, 상태 화면, 문구 규칙이 정리되어 있다. 색상 hex 값을 컴포넌트에 직접 쓰지 않고 `ui.md`의 토큰을 쓴다.

## 작업 흐름

- 메인 브랜치는 `master`다. 기능 개발은 `/news-workflow`(`.claude/commands/`)를 따른다.
- **`master`에 push하면 곧바로 운영 배포된다.** 작업 브랜치를 push해 Vercel 프리뷰를 확인하고, 사용자가 고른 뒤에만 `master`에 병합하고 push한다.

## Next.js 버전 주의점

- Next.js 16.4 / React 19.3. AGENTS.md 지시대로, Next.js API를 쓰기 전에 `node_modules/next/dist/docs/`를 먼저 읽는다.
- `next.config.ts`에서 `cacheComponents`와 `partialPrefetching`이 켜져 있다. 데이터 가져오기와 캐싱은 Cache Components 방식을 따른다. 예전의 `fetch` 캐시나 route segment config 방식을 쓰지 않는다.
- Tailwind v4는 `next.config.ts`의 `@tailwindcss/turbopack`으로 연결되어 있다. `tailwind.config.js`는 없다.

## 계획된 아키텍처 (PRD.md 기준)

AI 뉴스 카드 앱: RSS → Claude(번역·요약·분류) → 카드 → 선택 시 Notion 저장. 모든 데이터는 사용자 간에 공유되며, 사용자별 개인화는 없다.

- **인증 (Clerk, `@clerk/nextjs`)**: 모든 페이지와 API 라우트는 로그인이 필요하다. Next.js middleware/proxy에서 막고, 라우트 핸들러에서도 다시 확인한다.
- **DB (Neon + Drizzle, `drizzle-orm` + `@neondatabase/serverless`, 마이그레이션은 `drizzle-kit`)**: 테이블은 `categories`, `articles`, `notion_saves` 세 개다.
  - `articles.sourceUrl`은 unique이며 중복 판별 기준이다.
  - `articles.categoryId`는 nullable FK이고 `ON DELETE SET NULL`이다. null은 '미분류'를 뜻한다.
  - `notion_saves.articleId`는 unique다 (기사당 저장 1회).
- **뉴스 가져오기**는 사용자가 버튼을 누를 때만 실행된다. 크론은 없다.
  - RSS 두 개를 `rss-parser`로 파싱한다. 한 소스가 실패해도 다른 소스는 계속 처리한다.
  - DB에 이미 있는 URL은 건너뛴다. 같은 URL로 Claude를 다시 호출하지 않는다.
  - 새 기사 1건당 Claude 호출은 **1회**(Haiku 계열 모델)다. 응답 JSON은 `titleKo`, `summaryKo`(3~4문장), `categoryId | null`이다. 프롬프트에는 현재 카테고리 목록(이름 + 설명)을 넣는다.
  - 최근 24시간 안에 발행된 기사만 가져온다. 기사는 RSS 원문(`originalTitle`, `description`)으로 먼저 저장하고 `titleKo`·`summaryKo`는 null로 둔다. 카드는 null이면 원문 제목과 description을 대신 보여준다.
  - 응답은 `zod`로 검증한다. Claude 처리 대상은 `titleKo`가 null인 기사이며, 실패하면 null로 남아 다음 가져오기 때 다시 시도된다.
  - rate limit에 대비해 동시 처리 개수를 제한하고 병렬로 처리한다. 한 번의 가져오기에서 처리하는 기사는 최대 20건이고, 나머지는 다음 가져오기 때 처리한다 (`src/lib/enrich.ts`).
  - Claude는 `@anthropic-ai/sdk`로 호출하되 **Vercel AI Gateway**(`AI_GATEWAY_API_KEY`)를 거친다. Anthropic 직접 결제가 막혀 우회한 것이다. 클라이언트 설정은 `src/lib/ai/client.ts` 한 곳에만 있으므로, Anthropic으로 직접 연결할 때는 이 파일만 바꾼다. 모델 ID는 Anthropic 공식 ID(`claude-haiku-5-5`)를 쓴다.
  - 초기 카테고리 5개는 마이그레이션 `drizzle/0002_seed_categories.sql`로 넣는다.
- **Notion 저장**: 서버가 **Notion API**(`@notionhq/client`, 내부 integration 토큰 `NOTION_TOKEN`)로 운영자 워크스페이스의 'AI 뉴스 저장함' 데이터베이스(`NOTION_DATABASE_ID`)에 페이지를 만들고, 페이지 URL을 `notion_saves`에 기록한다. Claude는 호출하지 않는다. Notion 호출은 `src/lib/notion.ts` 한 곳에 있다.
  - Claude API의 MCP 커넥터는 쓰지 않는다. Vercel AI Gateway가 `mcp_toolset` 도구를 400으로 거절한다 (2026-10-15 시험).
  - Notion API 버전 2025-09-03은 데이터 소스 단위로 페이지를 만든다. 데이터베이스 ID로 데이터 소스 ID를 한 번 조회해서 쓴다.
  - Notion 데이터베이스의 속성 이름(제목, 카테고리, 출처, 원문 링크, 발행일)은 코드와 맞아야 한다. Notion에서 속성 이름을 바꾸면 `src/lib/notion.ts`도 바꾼다.
- **카테고리 변경**은 이후 가져오는 기사부터 적용된다. 기존 기사는 다시 분류하지 않는다.

## 환경변수

`.env.example`을 `.env.local`로 복사해서 쓴다. Clerk publishable key에는 `NEXT_PUBLIC_` 접두사가 필요하다. `AI_GATEWAY_API_KEY`, `NOTION_TOKEN`은 서버에서만 쓴다.
