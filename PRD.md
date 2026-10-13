# PRD: AI 뉴스 요약 카드 앱

## 1. 개요

해외 AI 뉴스를 RSS로 수집하고, Claude API로 한국어 번역·요약·카테고리 분류를 거쳐 카드 형태로 보여주는 웹앱이다. 마음에 드는 뉴스는 버튼 하나로 Notion에 저장한다.

### 목표
- 해외 AI 뉴스를 한국어 요약으로 빠르게 훑어본다.
- 관심 카테고리별로 걸러 본다.
- 나중에 다시 볼 뉴스를 Notion에 모은다.

### 비목표 (이번 범위 아님)
- 주기적 자동 수집 (크론). 수집은 버튼을 눌렀을 때만 한다.
- 원문 페이지 크롤링. 요약은 RSS 내용만 사용한다.
- 사용자별 개인화. 뉴스와 카테고리는 모든 사용자가 공유한다.

## 2. 사용자와 시나리오

- **사용자**: 로그인한 사용자. 모든 사용자가 같은 뉴스·카테고리를 본다.
- **주요 시나리오**
  1. 앱에 접속하면 로그인 화면이 나온다. 로그인 후 뉴스 목록으로 이동한다.
  2. '뉴스 가져오기'를 누르면 새 기사가 번역·요약·분류되어 카드로 추가된다.
  3. 카테고리 탭(또는 필터)을 눌러 해당 카테고리 뉴스만 본다.
  4. 카드의 'Notion 저장'을 누르면 Notion에 저장되고 버튼이 '저장됨'으로 바뀐다.
  5. 카테고리 관리 화면에서 카테고리를 추가·수정·삭제한다.

## 3. 뉴스 소스

| 소스 | RSS URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 4. 기능 요구사항

### F1. 로그인 (Clerk)
- 로그인하지 않은 사용자는 모든 페이지와 API에 접근할 수 없다.
- 로그인/로그아웃, 회원가입은 Clerk 기본 컴포넌트를 쓴다.

### F2. 뉴스 가져오기
- '뉴스 가져오기' 버튼을 누르면 두 RSS를 가져와 파싱한다.
- 원문 URL(`sourceUrl`)이 DB에 이미 있는 기사는 건너뛴다 (중복 방지, Claude 호출 비용 절감).
- 새 기사만 Claude API로 처리한다 (F3).
- 진행 중에는 버튼을 비활성화하고 로딩 상태를 보여준다.
- 완료 후 새로 추가된 기사 수를 알려주고 목록을 갱신한다.
- 한 소스가 실패해도 다른 소스는 계속 처리하고, 실패한 소스를 알려준다.

### F3. 번역·요약·분류 (Claude API)
- 입력: 원문 제목, RSS description, 현재 카테고리 목록(이름 + 설명).
- 출력(JSON): 한국어 제목, 한국어 요약(3~4문장), 카테고리 ID 하나.
- 기사 1건당 Claude 호출 1회로 번역·요약·분류를 함께 처리한다.
- 어떤 카테고리에도 맞지 않으면 '미분류'(null)로 둔다.
- 모델: 비용·속도를 위해 Haiku 계열을 기본으로 쓴다.
- 처리 실패한 기사는 저장하지 않고, 다음 '뉴스 가져오기' 때 다시 시도된다.

### F4. 뉴스 카드 목록
- 카드 항목: 한국어 제목, 한국어 요약, 카테고리, 출처, 발행일, 원문 링크, Notion 저장 버튼.
- 정렬: 발행일 최신순.

### F5. 카테고리 필터
- '전체', 각 카테고리, '미분류' 중 하나를 골라 해당 뉴스만 본다.

### F6. 카테고리 관리
- 카테고리 추가·수정(이름, 설명)·삭제가 가능하다.
- 설명은 Claude가 분류할 때 기준으로 쓴다.
- 삭제하면 해당 카테고리의 기사는 '미분류'로 바뀐다 (기사는 남는다).
- 추가·수정은 이후 새로 가져오는 기사부터 적용된다. 기존 기사는 다시 분류하지 않는다.
- 이름은 중복될 수 없다.

### F7. Notion 저장 (Claude API + Notion MCP)
- 카드의 'Notion 저장'을 누르면 서버가 Claude API의 MCP 커넥터로 Notion 원격 MCP 서버를 호출해 페이지를 만든다.
- 저장 내용: 한국어 제목, 요약, 카테고리, 출처, 원문 URL, 발행일.
- 저장 대상은 앱 운영자의 Notion 워크스페이스 하나다 (데이터 공유 구조이므로).
- 저장에 성공하면 Notion 페이지 URL을 DB에 기록하고, 카드 버튼을 '저장됨'(Notion 링크)으로 바꾼다.
- 이미 저장한 기사는 다시 저장하지 않는다.
- 실패하면 오류 메시지를 보여주고 다시 시도할 수 있게 한다.

## 5. 처리 흐름

```
[뉴스 가져오기]
  RSS 2개 파싱
  → sourceUrl 기준으로 기존 기사 제외
  → 새 기사마다 Claude 호출 (번역 + 요약 + 분류, JSON 응답)
  → articles 테이블에 저장
  → 목록 갱신

[Notion 저장]
  articleId 전달
  → 이미 저장됐는지 확인
  → Claude API (MCP 커넥터 → Notion MCP)로 페이지 생성
  → notion_saves에 페이지 URL 기록
  → 카드 상태 '저장됨'
```

## 6. 데이터 모델 (Neon + Drizzle ORM)

### categories
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | serial PK | |
| name | text, unique | |
| description | text, nullable | 분류 기준 힌트 |
| createdAt | timestamp | |

### articles
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | serial PK | |
| sourceUrl | text, unique | 중복 판별 기준 |
| source | text | `techcrunch` / `theverge` |
| originalTitle | text | |
| titleKo | text | |
| summaryKo | text | |
| categoryId | int, nullable FK | `ON DELETE SET NULL` (null = 미분류) |
| publishedAt | timestamp | |
| createdAt | timestamp | |

### notion_saves
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | serial PK | |
| articleId | int FK, unique | 기사당 1회 저장 |
| notionPageUrl | text | |
| savedBy | text | Clerk userId |
| savedAt | timestamp | |

## 7. 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 인증 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| 번역·요약·분류 | Claude API |
| Notion 저장 | Claude API MCP 커넥터 + Notion 원격 MCP 서버 |

### 환경변수 (예상)
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `DATABASE_URL` (Neon)
- `ANTHROPIC_API_KEY`
- Notion OAuth 토큰 및 저장 대상 ID (방식은 8장 미결 사항에 따라 결정)

## 8. 비기능 요구사항
- **보안**: API 키와 Notion 토큰은 서버에서만 쓴다. 모든 API 라우트에서 로그인 여부를 확인한다.
- **비용**: 이미 처리한 URL은 Claude를 다시 호출하지 않는다.
- **성능**: 새 기사는 동시 처리 개수를 제한해 병렬로 처리한다 (rate limit 대비).
- **UI**: 카드형 그리드, 모바일 화면에서도 1열로 자연스럽게 보인다.

## 9. 미결 사항

| # | 항목 | 제안 기본값 |
|---|---|---|
| 1 | Notion 저장 위치 (데이터베이스 행 vs 페이지 하위 페이지) | 데이터베이스 행. 카테고리·날짜를 속성으로 걸러볼 수 있다. |
| 2 | Notion OAuth 토큰 발급·갱신 방식 | 앱에 운영자용 Notion 연결 화면을 두고 토큰을 DB에 저장, 만료 시 갱신 |
| 3 | 초기 카테고리 목록 | 모델·연구 / 제품·서비스 / 투자·비즈니스 / 정책·규제 / 기타 |
| 4 | 저장된 카드 표시 | '저장됨' + Notion 링크로 바꾸고 재저장 불가 (F7에 반영) |

## 10. 완료 기준
- 로그인하지 않으면 앱을 쓸 수 없다.
- '뉴스 가져오기'로 두 소스의 새 기사가 한국어 카드로 추가되고, 다시 눌러도 중복되지 않는다.
- 각 기사가 카테고리 또는 '미분류'로 표시되고, 필터가 동작한다.
- 카테고리 추가·수정·삭제가 되고, 삭제 시 기사가 '미분류'로 바뀐다.
- 'Notion 저장'을 누르면 Notion에 페이지가 생기고 카드가 '저장됨'으로 바뀐다.
