# Escalate

Escalate is a human-in-the-loop service where a human (myself, currently) helps agents with ambiguous, taste-driven questions.

The repo consists of a CLI tool, a backend, and a SKILL.md file for agents.

## Why?

Everyone needs a second opinion—even agents.

With Escalate, agents have the right tooling to reach out to a human friend for help.


![An agent escalating a taste call to Oleh and getting a verdict](docs/escalate-demo.png)

One question in, one human answer out, agent unblocked.

## Parts

- **`cli/`** — the `escalate` CLI agents use to ask and wait. ([details](cli/README.md))
- **`fe/`** — Next.js app landing page + serverless API. A question pings the human on Telegram; the reply returns through a webhook. 
- **`cli/escalate/data/SKILL.md`** — a Claude Code skill that teaches agents *when* to ask (taste calls, real dead ends). Install with `escalate install skill`.

## Try it

```sh
# Backend — one-time bot setup in fe/SETUP_TELEGRAM.md
cd fe && npm install && npm run dev      # http://localhost:3000

# CLI — points at the deployed backend by default
pip install -e cli/
escalate ask "Tabs or spaces?"
```

## Make it yours

Fork this and your agents ask *you* instead of me. Three steps:

1. **Deploy `fe/` to Vercel** — this is your backend + landing page.
2. **Wire up a Telegram bot** — follow [`fe/SETUP_TELEGRAM.md`](fe/SETUP_TELEGRAM.md) to create the bot and grab its token/chat ID.
3. **Point the CLI at your deployment** — set `ESCALATE_API_URL` so `escalate` talks to your backend instead of mine.

### Environment variables

Set these in your Vercel project (Settings → Environment Variables); see [`fe/.env.example`](fe/.env.example) for the canonical list.

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | backend | ✅ | Bot token from @BotFather — sends questions, receives replies. |
| `TELEGRAM_CHAT_ID` | backend | ✅ | Chat that gets pinged when an agent asks. |
| `TELEGRAM_WEBHOOK_SECRET` | backend | ✅ | Shared secret validating Telegram's reply webhook. |
| `DATABASE_URL` | backend | ✅ | Neon Postgres pooled connection string — questions/answers live here. |
| `UPSTASH_REDIS_REST_URL` | backend | ✅ | Upstash Redis REST URL — rate-limit counters only. |
| `UPSTASH_REDIS_REST_TOKEN` | backend | ✅ | Upstash Redis REST token. |
| `NEXT_PUBLIC_ESCALATE_HUMAN` | backend | optional | Display name of the human answering (landing copy). Defaults to `oleh`. |
| `PAUSED` | backend | optional | Kill switch — `true` makes `POST /api/ask` return 503. Defaults to `false`. |
| `ESCALATE_API_URL` | CLI | ✅ | Your deployed backend URL, so the `escalate` CLI asks you. `--backend` flag overrides it. |
| `ESCALATE_HUMAN` | CLI | optional | Name the CLI addresses in output. Defaults to `oleh`. |

Once those are set, deploy, and your agents reach you instead of me.
