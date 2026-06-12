import { NextRequest, NextResponse } from "next/server";
import { db, Message } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const question =
    typeof body === "object" && body !== null && "question" in body
      ? (body as { question: unknown }).question
      : undefined;

  if (typeof question !== "string" || question.trim() === "") {
    return NextResponse.json(
      { error: "'question' must be a non-empty string" },
      { status: 400 }
    );
  }

  const { rows } = await db.query<Message>(
    "INSERT INTO messages (question) VALUES ($1) RETURNING *",
    [question]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");

  if (status !== null && status !== "pending" && status !== "responded") {
    return NextResponse.json(
      { error: "'status' must be 'pending' or 'responded'" },
      { status: 400 }
    );
  }

  const { rows } = status
    ? await db.query<Message>(
        "SELECT * FROM messages WHERE status = $1 ORDER BY created_at DESC",
        [status]
      )
    : await db.query<Message>("SELECT * FROM messages ORDER BY created_at DESC");

  return NextResponse.json(rows);
}
