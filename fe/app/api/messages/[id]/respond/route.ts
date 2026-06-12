import { NextRequest, NextResponse } from "next/server";
import { db, Message } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const response =
    typeof body === "object" && body !== null && "response" in body
      ? (body as { response: unknown }).response
      : undefined;

  if (typeof response !== "string" || response.trim() === "") {
    return NextResponse.json(
      { error: "'response' must be a non-empty string" },
      { status: 400 }
    );
  }

  const { rows } = await db.query<Message>(
    `UPDATE messages
     SET status = 'responded', response = $1, responded_at = now()
     WHERE id = $2
     RETURNING *`,
    [response, id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: `No message '${id}'` }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}
