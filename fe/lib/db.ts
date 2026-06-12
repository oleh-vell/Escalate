import { Pool } from "pg";

export type MessageStatus = "pending" | "responded";

export interface Message {
  id: string;
  question: string;
  status: MessageStatus;
  response: string | null;
  created_at: Date;
  responded_at: Date | null;
}

const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const db: Pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://rentoleh:rentoleh@localhost:5433/rentoleh",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}
