import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { anthropic, SUMMARY_MODEL } from "./client";

export type ArticleInput = {
  originalTitle: string;
  description: string | null;
};

export type CategoryOption = {
  id: number;
  name: string;
  description: string | null;
};

const ProcessedArticle = z.object({
  titleKo: z.string(),
  summaryKo: z.string(),
  categoryId: z.number().int().nullable(),
});

export type ProcessedArticle = z.infer<typeof ProcessedArticle>;

function buildSystemPrompt(categories: CategoryOption[]) {
  const categoryLines = categories.length
    ? categories.map((c) => `- id ${c.id}: ${c.name}${c.description ? ` — ${c.description}` : ""}`).join("\n")
    : "(등록된 카테고리 없음. categoryId는 항상 null)";

  return `너는 해외 AI 뉴스를 한국 독자에게 소개하는 편집자다. 기사 하나의 원문 제목과 본문 일부를 받아 아래 세 가지를 만든다.

- titleKo: 원문 제목을 자연스러운 한국어 기사 제목으로 옮긴다. 회사, 제품, 모델 이름은 원래 표기를 그대로 쓴다.
- summaryKo: 기사의 핵심을 한국어 3~4문장으로 요약한다. "~했다" 체로 쓴다. 본문에 없는 내용은 덧붙이지 않는다. 본문이 짧거나 없으면 있는 정보만으로 짧게 쓴다.
- categoryId: 아래 카테고리 중 기사에 가장 잘 맞는 하나의 id. 어느 것에도 맞지 않으면 null.

카테고리:
${categoryLines}`;
}

// 기사 1건을 Claude 1회 호출로 번역·요약·분류한다. 실패하면 throw하고, 호출한 쪽에서 null로 남겨 다음에 다시 시도한다.
export async function processArticle(article: ArticleInput, categories: CategoryOption[]): Promise<ProcessedArticle> {
  const response = await anthropic.messages.parse({
    model: SUMMARY_MODEL,
    max_tokens: 2048,
    system: buildSystemPrompt(categories),
    messages: [
      {
        role: "user",
        content: `제목: ${article.originalTitle}\n\n본문: ${article.description ?? "(없음)"}`,
      },
    ],
    output_config: { effort: "low", format: zodOutputFormat(ProcessedArticle) },
  });

  const parsed = response.parsed_output;
  if (response.stop_reason !== "end_turn" || !parsed) {
    throw new Error(`Claude 응답을 쓸 수 없음 (stop_reason: ${response.stop_reason})`);
  }

  const titleKo = parsed.titleKo.trim();
  const summaryKo = parsed.summaryKo.trim();
  if (!titleKo || !summaryKo) throw new Error("Claude 응답에 제목 또는 요약이 비어 있음");

  // 목록에 없는 id가 오면 미분류로 둔다
  const categoryId = categories.some((c) => c.id === parsed.categoryId) ? parsed.categoryId : null;

  return { titleKo, summaryKo, categoryId };
}
