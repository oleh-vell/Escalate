import { NextRequest, NextResponse } from "next/server";

import { Question, sql } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

// Telegram retries any non-200, so this handler returns 200 fast for every case
// it cannot or should not act on, and is idempotent for duplicate/retried updates.
const ok = () => new NextResponse("ok", { status: 200 });

interface TelegramUpdate {
  message?: {
    text?: string;
    chat?: { id?: number | string };
    reply_to_message?: { message_id?: number };
  };
}

export async function POST(request: NextRequest) {
  // 1. Authenticate the webhook itself.
  if (
    request.headers.get("x-telegram-bot-api-secret-token") !==
    process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return ok();
  }

  const msg = update.message;
  if (!msg) return ok();

  // 3. Only Oleh's chat may answer.
  if (String(msg.chat?.id) !== process.env.TELEGRAM_CHAT_ID) return ok();

  // 4. We map answers back via the reply target.
  const replyTo = msg.reply_to_message?.message_id;
  if (!replyTo) return ok();

  const text = msg.text?.trim();
  if (!text) return ok();

  // 5. Find the pending question this reply answers.
  const rows = (await sql`
    SELECT id FROM questions
    WHERE telegram_message_id = ${replyTo} AND status = 'pending'
  `) as Pick<Question, "id">[];
  if (rows.length === 0) return ok();

  // 6. Record the answer. The status = 'pending' guard makes a retried update a no-op.
  await sql`
    UPDATE questions
    SET answer = ${text}, status = 'answered', answered_at = now()
    WHERE id = ${rows[0].id} AND status = 'pending'
  `;

  // 7. Best-effort confirmation back to Oleh.
  try {
    await sendMessage(process.env.TELEGRAM_CHAT_ID!, "✅ Answer relayed.", replyTo);
  } catch (err) {
    console.error("Telegram confirmation failed", err);
  }

  // 8. Always 200.
  return ok();
}
