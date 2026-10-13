import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit은 Next.js 밖에서 실행되므로 .env.local을 직접 읽는다.
config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
