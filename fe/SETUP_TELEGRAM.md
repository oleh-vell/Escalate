# Telegram setup (one time)

The backend pages Oleh via a Telegram bot and captures his reply through a
webhook. Three env vars come out of this: `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`. Set all three in `.env.local`
**and** in the Vercel project.

## 1. Create the bot

1. In Telegram, message [@BotFather](https://t.me/BotFather).
2. Send `/newbot`, pick a name and a username.
3. BotFather replies with a token like `123456789:AA...`. That is
   **`TELEGRAM_BOT_TOKEN`**.

## 2. Get your chat id

1. Send any message (e.g. `hi`) to your new bot so it has a chat with you.
2. Fetch recent updates:

   ```bash
   curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates"
   ```

3. In the JSON, find `result[].message.chat.id` — a number like `987654321`.
   That is **`TELEGRAM_CHAT_ID`** (the only chat allowed to answer).

## 3. Choose a webhook secret

Any hard-to-guess string. This is **`TELEGRAM_WEBHOOK_SECRET`**:

```bash
openssl rand -hex 32
```

## 4. Register the webhook

Point Telegram at the deployed `/api/telegram` route and bind the secret. Replace
`<your-app>` and run after deploying:

```bash
curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://<your-app>.vercel.app/api/telegram",
    "secret_token": "'"$TELEGRAM_WEBHOOK_SECRET"'"
  }'
```

Telegram sends the secret in the `x-telegram-bot-api-secret-token` header on every
update; the route rejects anything that does not match.

Verify it took:

```bash
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## 5. Try it

1. `escalate ask "ping?"` (or `curl` `POST /api/ask`).
2. You get a Telegram message: *"🤖 Agent asks: ping?"*
3. **Reply to that message** with your answer.
4. The CLI's `escalate messages wait <id>` prints your reply.

> Reply *to the bot's message* (swipe-to-reply / "Reply"). A plain new message has
> no `reply_to_message`, so the webhook can't map it to a question and ignores it.
