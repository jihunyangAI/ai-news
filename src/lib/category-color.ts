// 카테고리별 색 (ui.md 2.4). Tailwind가 클래스를 찾을 수 있게 전체 클래스 이름을 그대로 적는다.
const TONES = [
  { dot: "bg-category-1", hover: "hover:border-category-1/50", active: "border-category-1 bg-category-1/10 text-category-1", badge: "bg-category-1/10 text-category-1" },
  { dot: "bg-category-2", hover: "hover:border-category-2/50", active: "border-category-2 bg-category-2/10 text-category-2", badge: "bg-category-2/10 text-category-2" },
  { dot: "bg-category-3", hover: "hover:border-category-3/50", active: "border-category-3 bg-category-3/10 text-category-3", badge: "bg-category-3/10 text-category-3" },
  { dot: "bg-category-4", hover: "hover:border-category-4/50", active: "border-category-4 bg-category-4/10 text-category-4", badge: "bg-category-4/10 text-category-4" },
  { dot: "bg-category-5", hover: "hover:border-category-5/50", active: "border-category-5 bg-category-5/10 text-category-5", badge: "bg-category-5/10 text-category-5" },
  { dot: "bg-category-6", hover: "hover:border-category-6/50", active: "border-category-6 bg-category-6/10 text-category-6", badge: "bg-category-6/10 text-category-6" },
] as const;

export type CategoryTone = (typeof TONES)[number];

// id로 색을 고른다. 다른 카테고리를 지우거나 순서가 바뀌어도 같은 카테고리는 같은 색을 유지한다.
export function categoryTone(categoryId: number): CategoryTone {
  return TONES[categoryId % TONES.length];
}
