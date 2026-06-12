import { NextRequest, NextResponse } from "next/server";
import { db, Message } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { rows } = await db.query<Message>(
    "SELECT * FROM messages WHERE id = $1",
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: `No message '${id}'` }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}
