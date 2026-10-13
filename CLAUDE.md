# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 상태

`create-next-app`으로 막 만든 상태다. 앱 코드는 아직 없고, `src/app`에는 기본 템플릿만 있다. 기능 명세는 `PRD.md`다. 구현 전에 반드시 읽는다. 기능 F1~F7, 데이터 모델, 미결 사항(9장)이 정리되어 있다.

UI 가이드는 `ui.md`다. 화면이나 컴포넌트를 만들거나 고치기 전에 반드시 읽는다. 디자인 토큰, 레이아웃, 컴포넌트별 Tailwind 클래스, 상태 화면, 문구 규칙이 정리되어 있다. 색상 hex 값을 컴포넌트에 직접 쓰지 않고 `ui.md`의 토큰을 쓴다.

## 명령어

- `npm run dev`: 개발 서버 (Turbopack)
- `npm run build`: 프로덕션 빌드와 TypeScript 검사
- `npm run lint`: ESLint (flat config, `eslint.config.mjs`)
- 테스트 도구는 아직 설정되지 않았다

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
  - 응답은 `zod`로 검증한다. 실패한 기사는 저장하지 않으며, 다음 가져오기 때 다시 시도된다.
  - rate limit에 대비해 동시 처리 개수를 제한하고 병렬로 처리한다.
- **Notion 저장**: 서버가 Claude API의 **MCP 커넥터**로 Notion 원격 MCP 서버를 호출한다. 저장 대상은 운영자의 Notion 워크스페이스 하나이고, 페이지 URL을 `notion_saves`에 기록한다. 저장 위치와 OAuth 토큰 처리 방식은 아직 미결이다 (PRD 9장).
- **카테고리 변경**은 이후 가져오는 기사부터 적용된다. 기존 기사는 다시 분류하지 않는다.

## 환경변수

`.env.example`을 `.env.local`로 복사해서 쓴다. Clerk publishable key에는 `NEXT_PUBLIC_` 접두사가 필요하다. `ANTHROPIC_API_KEY`와 Notion 토큰은 서버에서만 쓴다.
