import { neon } from "@neondatabase/serverless";

// DATABASE_URL = Neon *pooled* connection string. The HTTP driver opens a fresh
// connection per query, so it never exhausts a pool the way node-postgres would
// across many short-lived serverless invocations.
export const sql = neon(process.env.DATABASE_URL!);

export type QuestionStatus = "pending" | "answered";

export interface Question {
  id: string;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  telegram_message_id: number | null;
  created_at: string;
  answered_at: string | null;
}
