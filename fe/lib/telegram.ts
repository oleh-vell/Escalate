// Thin wrapper over the Telegram Bot API. Used by /api/ask (to page Oleh) and
// /api/telegram (to confirm a relayed answer).

const API_BASE = "https://api.telegram.org";

interface SendMessageResult {
  message_id: number;
}

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return t;
}

/**
 * Send a Telegram message. Returns the new message's id so the caller can map a
 * future reply back to the question. `replyToMessageId` threads a reply.
 */
export async function sendMessage(
  chatId: string,
  text: string,
  replyToMessageId?: number,
): Promise<number> {
  const res = await fetch(`${API_BASE}/bot${token()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
    }),
  });

  const data = (await res.json()) as TelegramResponse<SendMessageResult>;
  if (!data.ok || !data.result) {
    throw new Error(`Telegram sendMessage failed: ${data.description ?? res.status}`);
  }
  return data.result.message_id;
}
