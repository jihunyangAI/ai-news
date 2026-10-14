# UI 가이드: AI뉴스 수집기

이 문서는 'AI뉴스 수집기'의 화면 구성과 스타일 규칙을 정한다. 기능 명세는 `PRD.md`를 따르고, 이 문서는 화면을 어떻게 보여줄지만 다룬다.

- 스타일은 **Tailwind CSS v4** 유틸리티 클래스로만 작성한다. 별도 CSS 파일이나 CSS-in-JS를 쓰지 않는다.
- 공통 색과 폰트는 `src/app/globals.css`의 `@theme`에 토큰으로 정의하고, 컴포넌트에서는 토큰 이름(`bg-surface`, `text-muted` 등)을 쓴다. 색상 hex 값을 컴포넌트에 직접 쓰지 않는다.
- `tailwind.config.js`는 만들지 않는다 (v4는 CSS에서 설정한다).

---

## 1. 디자인 원칙

1. **읽기가 먼저다.** 요약 글이 주인공이다. 장식은 줄이고 글자 크기, 줄 간격, 여백으로 위계를 만든다.
2. **조용한 배경, 분명한 동작.** 화면은 흰색과 회색 위주로 두고, 강조색(파랑)은 버튼, 선택된 카테고리, 링크에만 쓴다.
3. **한 화면, 한 흐름.** 메인 화면에서 가져오기 → 필터 → 읽기 → 저장이 모두 끝나야 한다.
4. **상태를 숨기지 않는다.** 로딩, 빈 목록, 오류, 저장됨을 항상 화면에 표시한다.

---

## 2. 디자인 토큰

`src/app/globals.css`에 아래처럼 정의한다. 다크 모드는 시스템 설정(`prefers-color-scheme`)을 따른다.

```css
@import "tailwindcss";

:root {
  --background: #f8fafc;   /* 페이지 배경 (slate-50) */
  --surface: #ffffff;      /* 카드, 헤더, 모달 */
  --foreground: #0f172a;   /* 본문 글자 (slate-900) */
  --muted: #64748b;        /* 보조 글자: 출처, 날짜 (slate-500) */
  --border: #e2e8f0;       /* 테두리 (slate-200) */
  --primary: #2563eb;      /* 강조색 (blue-600) */
  --primary-hover: #1d4ed8;
  --primary-soft: #eff6ff; /* 선택 배경 (blue-50) */
  --danger: #dc2626;
  --success: #16a34a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0b1120;
    --surface: #111827;
    --foreground: #e5e7eb;
    --muted: #94a3b8;
    --border: #1f2937;
    --primary: #3b82f6;
    --primary-hover: #60a5fa;
    --primary-soft: #172554;
    --danger: #f87171;
    --success: #4ade80;
  }
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: var(--primary-soft);
  --color-danger: var(--danger);
  --color-success: var(--success);
  --font-sans: var(--font-noto-sans-kr), system-ui, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

### 2.1 폰트

- 한글 가독성을 위해 `next/font/google`의 `Noto_Sans_KR`을 `--font-noto-sans-kr` 변수로 불러와 `<html>`에 붙인다. 현재 `layout.tsx`의 Geist는 한글 글리프가 없으므로 본문 폰트로 쓰지 않는다.
- `body`에 직접 지정된 `font-family: Arial ...`은 지우고 `font-sans`를 쓴다.

### 2.2 타이포그래피

| 용도 | 클래스 |
|---|---|
| 앱 이름 (헤더) | `text-lg font-bold tracking-tight` |
| 페이지 제목 | `text-2xl font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug sm:text-lg` |
| 카드 요약 | `text-[15px] leading-7 text-foreground/80` |
| 메타 정보 (출처, 날짜) | `text-xs text-muted` |
| 버튼, 칩 | `text-sm font-medium` |

본문 줄 간격은 `leading-7` 이상으로 둔다. 요약 글은 회색 단계를 너무 낮추지 않는다 (`/80` 이상).

### 2.3 간격, 모서리, 그림자

- 간격은 4의 배수만 쓴다: `gap-2`, `gap-3`, `gap-4`, `p-5`, `py-8` 등.
- 모서리: 카드와 모달 `rounded-2xl`, 버튼과 입력창 `rounded-lg`, 카테고리 칩 `rounded-full`.
- 그림자: 기본은 `shadow-sm`, 카드 hover만 `hover:shadow-md`. 그 이상 진한 그림자는 쓰지 않는다.

### 2.4 카테고리 색

카테고리 바의 칩과 카드의 카테고리 배지는 카테고리마다 색 하나를 쓴다. `globals.css`에 `--category-1` ~ `--category-10`(violet, sky, emerald, rose, amber, fuchsia, teal, orange, indigo, lime)을 두고 `@theme inline`에 `--color-category-N`으로 연결한다. 라이트 모드는 글자로 써도 대비가 충분한 700 계열, 다크 모드는 400 계열을 쓴다. 칩 배경은 같은 색의 `/10` 투명도로 만든다.

- 카테고리 → 색은 `src/lib/category-color.ts`의 `categoryTone(index)`로 정한다. `index`는 카테고리 목록(생성순)에서의 순서이고 `index % 10`으로 색을 고른다. 10개까지는 색이 겹치지 않고, 중간 카테고리를 지우면 뒤 카테고리의 색이 하나씩 당겨진다.
- 카테고리 바, 카드 배지, 카테고리 관리 화면은 모두 같은 순서(`getCategoryCounts()`의 정렬)로 색을 고른다.
- 클래스 이름은 Tailwind가 찾을 수 있게 그 파일에 전체 이름으로 적는다. 컴포넌트에서 문자열을 조립하지 않는다.
- 개발 서버(Turbopack)가 `category-color.ts`를 스캔하지 못해 색이 빠지는 일이 있어, `globals.css`의 `@source inline(...)`에도 같은 클래스를 등록한다. 카테고리 색 클래스를 새로 쓰면 두 곳을 함께 고친다.

---

## 3. 화면 구성

### 3.1 전체 레이아웃 (메인 = 대시보드)

```
┌──────────────────────────────────────────────────────────┐
│ AI뉴스 수집기                     [뉴스 가져오기]  (사용자) │  ← 헤더 (sticky)
├──────────────────────────────────────────────────────────┤
│ 뉴스 대시보드                                              │  ← 페이지 제목 + 기사 수
│ 총 42건                                                   │
│                                                          │
│ (전체) (모델·연구) (제품·서비스) (정책·규제) (미분류) [+ 추가] │  ← 카테고리 바
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│ │ 카드      │ │ 카드      │ │ 카드      │                   │  ← 뉴스 카드 그리드
│ └──────────┘ └──────────┘ └──────────┘                   │
└──────────────────────────────────────────────────────────┘
```

- 본문 컨테이너: `mx-auto w-full max-w-6xl px-4 py-8 sm:px-6`
- 페이지 제목 영역과 카테고리 바 사이: `mt-6`, 카테고리 바와 카드 그리드 사이: `mt-6`

### 3.2 헤더

```tsx
<header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
    <Link href="/" className="text-lg font-bold tracking-tight">AI뉴스 수집기</Link>
    <div className="flex items-center gap-3">
      {/* 뉴스 가져오기 버튼 (주 버튼) */}
      <UserButton />
    </div>
  </div>
</header>
```

- 앱 이름은 `layout.tsx`의 `metadata.title`과 헤더 모두 **'AI뉴스 수집기'**로 맞춘다.
- '뉴스 가져오기'는 화면에서 유일한 주 버튼(파란색)이다. 모바일에서는 글자를 줄여 '가져오기'로 표시해도 된다.

### 3.3 카테고리 바

뉴스 카드 목록 바로 위에 둔다. 순서는 **전체 → 카테고리들(생성순) → 미분류 → [+ 카테고리 추가]**. 추가 버튼은 항상 맨 끝에 있다.

```tsx
<nav aria-label="카테고리" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
  <ul className="flex items-center gap-2 whitespace-nowrap sm:flex-wrap">
    <li><CategoryChip href="/" active>전체</CategoryChip></li>
    {/* ...카테고리 칩 */}
    <li><CategoryChip href="/?category=none">미분류</CategoryChip></li>
    <li><AddCategoryButton /></li>
  </ul>
</nav>
```

**카테고리 칩**

| 상태 | 클래스 |
|---|---|
| 기본 | `inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground/70 hover:text-foreground` + 카테고리 색 테두리 hover (`hover:border-category-N/50`) |
| 선택됨 | 카테고리 색으로 채운다: `border-category-N bg-category-N/10 text-category-N` |

- 카테고리 칩은 이름 앞에 색 점(`size-2 rounded-full bg-category-N`)을 둔다. 평소에는 점으로만 구분하고, 선택된 칩만 색으로 채워 화면이 산만하지 않게 한다.
- '전체'는 색 점 없이 선택 시 강조색(`border-primary bg-primary-soft text-primary`), '미분류'는 회색 점(`bg-muted/50`)에 선택 시 `border-foreground/30 bg-foreground/5 text-foreground`를 쓴다.
- 선택된 칩에는 `aria-current="page"`를 붙인다.
- 칩에 해당 카테고리의 기사 수를 붙일 수 있다: `<span className="ml-1.5 text-xs text-muted">12</span>`
- 필터 상태는 URL 쿼리(`?category=<id>`, 미분류는 `?category=none`)로 관리해 새로고침, 공유, 뒤로 가기가 동작하게 한다.
- 모바일에서는 한 줄 가로 스크롤, `sm` 이상에서는 줄바꿈(`flex-wrap`)한다.

**카테고리 추가 버튼**

칩과 같은 높이와 모양이되, 점선 테두리로 '선택지가 아니라 동작'임을 구분한다.

```tsx
<button
  type="button"
  className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-border px-4 text-sm font-medium text-muted hover:border-primary hover:text-primary"
>
  <PlusIcon className="size-4" aria-hidden />
  카테고리 추가
</button>
```

- 누르면 **카테고리 추가 모달**(4.4)을 연다.
- 카테고리 수정·삭제는 카테고리 관리 화면(`/categories`)에서 한다. 카테고리 바 오른쪽 끝이나 모달 하단에 '카테고리 관리' 텍스트 링크(`text-sm text-muted hover:text-foreground`)를 둔다.

### 3.4 뉴스 카드 그리드

```tsx
<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {articles.map((a) => <li key={a.id}><NewsCard article={a} /></li>)}
</ul>
```

| 화면 폭 | 열 수 |
|---|---|
| < 640px | 1열 |
| 640px 이상 (`sm`) | 2열 |
| 1024px 이상 (`lg`) | 3열 |

정렬은 발행일 최신순이다.

---

## 4. 컴포넌트

### 4.1 뉴스 카드

```
┌────────────────────────────────────┐
│ [모델·연구]         TechCrunch · 3시간 전 │  ← 카테고리 배지 + 메타
│                                    │
│ 한국어 제목이 두 줄까지 표시됩니다      │  ← 제목 (line-clamp-2)
│                                    │
│ 한국어 요약 3~4문장이 여기에 표시되며   │  ← 요약 (line-clamp-4)
│ 넘치면 말줄임 처리됩니다...            │
│ ────────────────────────────────── │
│ 원문 보기 ↗                [Notion 저장] │  ← 하단 동작
└────────────────────────────────────┘
```

```tsx
<article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
  <div className="flex items-center justify-between gap-2">
    <CategoryBadge />
    <p className="text-xs text-muted">
      TechCrunch · <time dateTime="2026-10-14T09:00:00Z">3시간 전</time>
    </p>
  </div>

  <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug sm:text-lg">{titleKo}</h2>
  <p className="mt-2 line-clamp-4 text-[15px] leading-7 text-foreground/80">{summaryKo}</p>

  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
    <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
       className="text-sm font-medium text-muted hover:text-primary">
      원문 보기 ↗
    </a>
    {/* Notion 저장 버튼 (4.3) */}
  </div>
</article>
```

- 카드 높이는 그리드 행 안에서 맞춘다 (`h-full` + `mt-auto`로 하단 동작 영역 고정).
- 제목에 `title={originalTitle}`을 넣어 원문 제목을 툴팁으로 볼 수 있게 한다.
- 발행일: 24시간 이내는 상대 시간('3시간 전'), 그 외는 `2026. 10. 14.` 형식. `Intl` API를 `ko-KR`로 쓴다.
- 출처 표시명: `techcrunch` → `TechCrunch`, `theverge` → `The Verge`.

### 4.2 카테고리 배지 (카드 안)

```tsx
<span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
  모델·연구
</span>
```

- 미분류는 회색으로 표시한다: `bg-foreground/5 text-muted`.
- 카테고리 배지는 카테고리 바 칩과 같은 카테고리 색(2.4)을 쓴다: `categoryTone(id).badge` = `bg-category-N/10 text-category-N`. 위 예시의 `bg-primary-soft text-primary` 대신 이것을 쓴다.

### 4.3 버튼

| 종류 | 용도 | 클래스 |
|---|---|---|
| 주 버튼 | 뉴스 가져오기, 모달의 '추가' | `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60` |
| 보조 버튼 | Notion 저장, 취소 | `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-foreground/5 disabled:opacity-60` |
| 위험 버튼 | 카테고리 삭제 | `... bg-danger text-white hover:opacity-90` (주 버튼 모양에 색만 바꾼다) |
| 텍스트 버튼 | 원문 보기, 카테고리 관리 | `text-sm font-medium text-muted hover:text-primary` |

모든 버튼에 키보드 포커스 표시를 넣는다: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`.

**Notion 저장 버튼 상태**

| 상태 | 표시 |
|---|---|
| 저장 전 | 보조 버튼 'Notion 저장' |
| 저장 중 | 스피너 + '저장 중…', `disabled`, `aria-busy="true"` |
| 저장됨 | 링크로 바뀐다: `inline-flex items-center gap-1 text-sm font-medium text-success` '✓ 저장됨 ↗' (Notion 페이지로 이동, 새 탭) |
| 실패 | 버튼은 다시 'Notion 저장'으로 돌아오고, 토스트로 오류를 알린다 |

**뉴스 가져오기 버튼 상태**

| 상태 | 표시 |
|---|---|
| 기본 | '뉴스 가져오기' |
| 진행 중 | 스피너 + '가져오는 중…', `disabled` |
| 완료 | 토스트: '새 기사 5건을 추가했어요' / 새 기사가 없으면 '새 기사가 없어요' |
| 일부 실패 | 경고 토스트: 'The Verge를 가져오지 못했어요. 나머지는 추가했어요.' |

스피너: `<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />`

### 4.4 카테고리 추가 모달

```
┌─────────────────────────────────┐
│ 카테고리 추가                  ✕ │
│                                 │
│ 이름 *                           │
│ [                             ] │
│ 설명                             │
│ [                             ] │
│ [                             ] │
│ AI가 기사를 분류할 때 참고해요.     │
│ 새로 가져오는 기사부터 적용돼요.    │
│                                 │
│ 카테고리 관리      [취소] [추가]  │
└─────────────────────────────────┘
```

- HTML `<dialog>`를 쓰거나 같은 동작(포커스 가둠, `Esc`로 닫기, 배경 클릭으로 닫기)을 구현한다.
- 배경: `fixed inset-0 bg-black/40 backdrop-blur-sm`
- 패널: `w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl`
- 입력창: `h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`
- 텍스트 영역(설명): 입력창과 같은 스타일에 `h-auto min-h-20 py-2`
- 라벨: `mb-1.5 block text-sm font-medium`, 도움말: `mt-1.5 text-xs text-muted`
- 오류(이름 중복 등): 입력창에 `border-danger`를 주고 아래에 `mt-1.5 text-xs text-danger`로 '이미 있는 이름이에요.'를 표시한다. `aria-invalid`와 `aria-describedby`를 연결한다.
- 추가에 성공하면 모달을 닫고 카테고리 바에 새 칩이 나타난다. 기존 기사는 다시 분류되지 않는다는 점을 도움말로 미리 알린다.

### 4.5 토스트

- 위치: 화면 하단 중앙 `fixed bottom-6 left-1/2 -translate-x-1/2`, 모바일에서는 좌우 `inset-x-4`
- 모양: `rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-lg`
- 3~4초 뒤 사라진다. 오류 토스트는 닫기 버튼을 두고 자동으로 사라지지 않는다.
- `role="status"` (오류는 `role="alert"`)

---

## 5. 상태 화면

| 상황 | 표시 |
|---|---|
| 첫 로딩 | 카드 모양 스켈레톤 6개. `animate-pulse rounded-2xl border border-border bg-surface p-5` 안에 `h-4 rounded bg-foreground/10` 막대 여러 개 |
| 기사 없음 (전체) | 가운데 정렬 안내: '아직 수집한 뉴스가 없어요' + 주 버튼 '뉴스 가져오기' |
| 기사 없음 (필터) | '이 카테고리에는 아직 뉴스가 없어요' + 텍스트 버튼 '전체 보기' |
| 목록 오류 | '뉴스를 불러오지 못했어요' + 보조 버튼 '다시 시도' |

빈 상태 컨테이너: `flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center`, 안내 문구는 `text-sm text-muted`.

Cache Components를 쓰므로 데이터를 읽는 영역은 `<Suspense fallback={<NewsGridSkeleton />}>`로 감싸 스켈레톤을 보여준다.

---

## 6. 문구 규칙

- 존댓말 해요체로 짧게 쓴다: '저장했어요', '가져오지 못했어요'.
- 버튼은 동사로 끝낸다: '뉴스 가져오기', 'Notion 저장', '카테고리 추가'.
- 오류 문구는 무엇이 안 됐는지와 다음 행동을 함께 쓴다: 'Notion에 저장하지 못했어요. 다시 시도해 주세요.'
- 'Notion', 'TechCrunch', 'The Verge' 등 고유명사는 원래 표기를 쓴다.

---

## 7. 접근성 체크리스트

- [ ] 모든 동작은 키보드로 가능하고 `focus-visible` 표시가 보인다.
- [ ] 글자와 배경의 명암비는 4.5:1 이상이다 (`text-muted`는 메타 정보에만 쓴다).
- [ ] 아이콘만 있는 버튼(모달 닫기 등)에는 `aria-label`이 있다.
- [ ] 새 탭으로 열리는 링크에는 ↗ 표시와 `rel="noopener noreferrer"`가 있다.
- [ ] 선택된 카테고리는 색 외에 `aria-current`로도 구분된다.
- [ ] 로딩 중인 버튼은 `disabled`와 `aria-busy`를 갖는다.
- [ ] 모달이 열리면 첫 입력창으로 포커스가 가고, 닫히면 '카테고리 추가' 버튼으로 돌아온다.
- [ ] `motion-reduce:animate-none`으로 애니메이션 줄이기 설정을 존중한다.

---

## 8. 파일 구조 (제안)

```
src/
├── app/
│   ├── layout.tsx            # 헤더, 폰트, 메타데이터
│   ├── page.tsx              # 대시보드 (카테고리 바 + 카드 그리드)
│   └── categories/page.tsx   # 카테고리 관리 (수정·삭제)
└── components/
    ├── header.tsx
    ├── fetch-news-button.tsx
    ├── category-bar.tsx
    ├── category-chip.tsx
    ├── add-category-dialog.tsx
    ├── news-card.tsx
    ├── news-grid-skeleton.tsx
    ├── notion-save-button.tsx
    ├── empty-state.tsx
    └── toast.tsx
```

클래스 문자열이 길어지는 버튼과 칩은 컴포넌트 하나에 모아두고 재사용한다. 같은 클래스 묶음을 여러 파일에 복사하지 않는다.
