import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { askIpLimit, globalCap } from "@/lib/ratelimit";
import { sendMessage } from "@/lib/telegram";

const MAX_QUESTION_LENGTH = 500;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  // 1. Kill switch.
  if (process.env.PAUSED === "true") {
    return NextResponse.json({ error: "Oleh is napping" }, { status: 503 });
  }

  // 2. Parse + validate.
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
      { status: 400 },
    );
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `Question too long (max ${MAX_QUESTION_LENGTH} characters)` },
      { status: 413 },
    );
  }

  // 3. Rate limits (counters live in Redis; the question never does).
  const ip = await askIpLimit.limit(clientIp(request));
  if (!ip.success) {
    return NextResponse.json(
      { error: "Slow down — one human, limited patience" },
      { status: 429 },
    );
  }
  const global = await globalCap(utcDay());
  if (!global.ok) {
    return NextResponse.json(
      { error: "Oleh is full for today, try tomorrow" },
      { status: 429 },
    );
  }

  // 4. Persist the question (Neon).
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO questions (id, question, status)
    VALUES (${id}, ${question}, 'pending')
  `;

  // 5. Page Oleh on Telegram, then record the message id so his reply maps back.
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const text = `🤖 Agent asks:\n\n${question}\n\n↩️ Reply to this message to answer.`;
  try {
    const messageId = await sendMessage(chatId, text);
    await sql`
      UPDATE questions SET telegram_message_id = ${messageId} WHERE id = ${id}
    `;
  } catch (err) {
    console.error("Telegram notify failed", err);
    return NextResponse.json(
      { error: "Failed to deliver the question — try again shortly" },
      { status: 502 },
    );
  }

  // 6. Hand the CLI an id to poll.
  return NextResponse.json({ id }, { status: 201 });
}
