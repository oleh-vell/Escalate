import { NextRequest, NextResponse } from "next/server";

import { Question, sql } from "@/lib/db";
import { pollIdLimit } from "@/lib/ratelimit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. Loose per-question rate limit: 60 polls/min.
  const { success } = await pollIdLimit.limit(id);
  if (!success) {
    return NextResponse.json({ error: "Polling too fast" }, { status: 429 });
  }

  // 2. Look it up.
  const rows = (await sql`
    SELECT status, answer FROM questions WHERE id = ${id}
  `) as Pick<Question, "status" | "answer">[];

  if (rows.length === 0) {
    return NextResponse.json({ error: `No question '${id}'` }, { status: 404 });
  }

  // 3. Report status + answer (answer is null while pending).
  return NextResponse.json({ status: rows[0].status, answer: rows[0].answer });
}
