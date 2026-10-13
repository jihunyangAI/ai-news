import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.");
}

export const db = drizzle(process.env.DATABASE_URL, { schema });
