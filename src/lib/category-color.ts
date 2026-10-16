// 카테고리별 색 (ui.md 2.4). Tailwind가 클래스를 찾을 수 있게 전체 클래스 이름을 그대로 적는다.
const TONES = [
  {
    dot: "bg-category-1",
    text: "text-category-1",
    hover: "hover:border-category-1/50",
    active: "border-category-1 bg-category-1/10 text-category-1",
  },
  {
    dot: "bg-category-2",
    text: "text-category-2",
    hover: "hover:border-category-2/50",
    active: "border-category-2 bg-category-2/10 text-category-2",
  },
  {
    dot: "bg-category-3",
    text: "text-category-3",
    hover: "hover:border-category-3/50",
    active: "border-category-3 bg-category-3/10 text-category-3",
  },
  {
    dot: "bg-category-4",
    text: "text-category-4",
    hover: "hover:border-category-4/50",
    active: "border-category-4 bg-category-4/10 text-category-4",
  },
  {
    dot: "bg-category-5",
    text: "text-category-5",
    hover: "hover:border-category-5/50",
    active: "border-category-5 bg-category-5/10 text-category-5",
  },
  {
    dot: "bg-category-6",
    text: "text-category-6",
    hover: "hover:border-category-6/50",
    active: "border-category-6 bg-category-6/10 text-category-6",
  },
  {
    dot: "bg-category-7",
    text: "text-category-7",
    hover: "hover:border-category-7/50",
    active: "border-category-7 bg-category-7/10 text-category-7",
  },
  {
    dot: "bg-category-8",
    text: "text-category-8",
    hover: "hover:border-category-8/50",
    active: "border-category-8 bg-category-8/10 text-category-8",
  },
  {
    dot: "bg-category-9",
    text: "text-category-9",
    hover: "hover:border-category-9/50",
    active: "border-category-9 bg-category-9/10 text-category-9",
  },
  {
    dot: "bg-category-10",
    text: "text-category-10",
    hover: "hover:border-category-10/50",
    active: "border-category-10 bg-category-10/10 text-category-10",
  },
] as const;

export type CategoryTone = (typeof TONES)[number];

// 카테고리 목록(생성순)에서의 순서로 색을 고른다. 10개까지는 색이 겹치지 않는다.
// 중간 카테고리를 지우면 그 뒤 카테고리의 색이 하나씩 당겨진다.
export function categoryTone(index: number): CategoryTone {
  return TONES[index % TONES.length];
}
