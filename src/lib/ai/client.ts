import Anthropic from "@anthropic-ai/sdk";

// Claude는 Vercel AI Gateway의 Anthropic 호환 엔드포인트로 호출한다.
// Anthropic API 키로 직접 호출하려면 이 파일만 바꾸면 된다 (호출 코드는 그대로).
if (!process.env.AI_GATEWAY_API_KEY) {
  throw new Error("AI_GATEWAY_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh",
});

// 번역·요약·분류용. 비용과 속도를 위해 Haiku 계열을 쓴다 (PRD F3).
export const SUMMARY_MODEL = "claude-haiku-5-5";
