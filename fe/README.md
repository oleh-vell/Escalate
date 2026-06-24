# EscalateToHuman — landing + serverless backend

Next.js (App Router) app that is two things only: the **landing page** and the
**Vercel serverless functions** for the human-in-the-loop flow. AI agents ask Oleh
a question via the [`escalate` CLI](../cli); Oleh answers by replying on Telegram.

There is no web dashboard — answering happens entirely in Telegram.

## How a question flows

1. `POST /api/ask` stores the question in **Neon** (`pending`) and pings Oleh on
   Telegram with `sendMessage`.
2. Oleh **replies** to that Telegram message. Telegram calls `POST /api/telegram`,
   which records the reply as the answer and flips the row to `answered`.
3. The CLI polls `GET /api/messages/[id]` until `status == "answered"`.

## Auth model (the joke)

Answering is locked to Oleh's Telegram chat id (`TELEGRAM_CHAT_ID`) behind the
bot-secret webhook. The **ask** endpoint has **no auth** by design — it is
protected only by rate limits. Anyone can ask Oleh anything; Oleh decides what to
answer.

## Storage

- **Neon (Postgres)** holds questions/answers, via the `@neondatabase/serverless`
  HTTP driver (`lib/db.ts`) — no connection pool to exhaust on Vercel.
- **Upstash Redis** holds rate-limit counters only (`lib/ratelimit.ts`). No
  question data ever lands in Redis.

Apply the schema once against Neon:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

## Configuration

Copy `.env.example` → `.env.local` for dev, and set the same vars in the Vercel
project. See [SETUP_TELEGRAM.md](./SETUP_TELEGRAM.md) for the bot/chat/webhook
setup.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate-limit counters. |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather. |
| `TELEGRAM_CHAT_ID` | Oleh's chat id — the only id allowed to answer. |
| `TELEGRAM_WEBHOOK_SECRET` | Shared secret for the inbound webhook. |
| `PAUSED` | `"true"` makes `POST /api/ask` return 503 "Oleh is napping". |
| `NEXT_PUBLIC_ESCALATE_HUMAN` | Display name in the landing copy (default `oleh`). |

## Develop

```bash
npm install
npm run dev      # landing at /, which redirects to /landing
npm run build
```

## Layout

- `app/landing/` — the marketing page (`/` redirects here)
- `app/api/ask/` — `POST` ask endpoint (write, strict rate limits)
- `app/api/telegram/` — `POST` Telegram webhook (Oleh's reply)
- `app/api/messages/[id]/` — `GET` poll endpoint
- `lib/db.ts` — Neon HTTP client + `Question` type
- `lib/ratelimit.ts` — Upstash limiters + global daily cap
- `lib/telegram.ts` — Telegram Bot API helper
- `db/schema.sql` — the `questions` table (run once against Neon)

## API reference

See **[API.md](./API.md)**.
