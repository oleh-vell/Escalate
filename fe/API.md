# EscalateToHuman Backend API

Serverless API for asking Oleh (a human) a question and reading his answer. The
agent side (`escalate` CLI) submits and polls; Oleh answers out-of-band by
replying on Telegram.

## Base URL

The deployed Vercel URL. The `escalate` CLI reads `ESCALATE_API_URL` or the
`--backend` flag.

## Auth model (by design)

- **Asking** (`POST /api/ask`) has **no auth** — anyone can ask. It is protected
  only by rate limits. That's the joke.
- **Answering** is locked to Oleh: it can only happen via a Telegram reply from
  `TELEGRAM_CHAT_ID`, through the bot-secret-protected webhook. There is no public
  "answer" endpoint.

Errors have the shape `{"error": "<reason>"}` with a 4xx/5xx status.

## Endpoints

### POST /api/ask — ask a question

Caller: agent / CLI (`escalate ask`).

Request body: `{"question": string}` — required, non-empty, ≤ 500 chars.

```bash
curl -s -X POST "$BASE/api/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question": "Vercel or Cloudflare?"}'
```

Response `201 Created`: `{"id": "<uuid>"}`. The question is stored as `pending`
and Oleh is paged on Telegram.

Errors:
- `400` — body is not JSON, or `question` is missing/empty.
- `413` — `question` longer than 500 characters.
- `429` — `"Slow down — one human, limited patience"` (per-IP: 3/hour) or
  `"Oleh is full for today, try tomorrow"` (global: 30/day).
- `503` — `"Oleh is napping"` (kill switch `PAUSED=true`).
- `502` — the question was saved but the Telegram notification failed.

### POST /api/telegram — inbound webhook (Oleh's reply)

Caller: **Telegram only.** Registered with `setWebhook` (see SETUP_TELEGRAM.md).

- Verifies header `x-telegram-bot-api-secret-token` against
  `TELEGRAM_WEBHOOK_SECRET` (`403` otherwise).
- Acts only on a message from `TELEGRAM_CHAT_ID` that **replies to** a question
  the bot sent. The reply text becomes the answer; the question flips to
  `answered`. Everything else is acknowledged and ignored.
- Always returns `200` quickly and is idempotent (a `status = 'pending'` guard
  makes Telegram's retried deliveries a no-op).

Not called by clients.

### GET /api/messages/:id — poll for the answer

Caller: agent / CLI (`escalate messages wait` / `get`).

```bash
curl -s "$BASE/api/messages/<id>"
```

Response `200 OK`:

```json
{ "status": "pending", "answer": null }
```

`status` is `"pending"` or `"answered"`; `answer` is `null` until answered. Poll
until `status == "answered"`, then read `answer`.

Errors:
- `404` — no question with that id.
- `429` — polling faster than 60/min for one id.

## Typical agent flow

```bash
id=$(escalate ask "Which AWS region should staging live in?")
escalate messages wait "$id"   # polls with backoff, prints the answer
```

1. `POST /api/ask` → save the returned `id`.
2. Poll `GET /api/messages/:id` (the CLI backs off 2s → 15s).
3. When `status == "answered"`, use `answer` and continue.
