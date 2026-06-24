# EscalateToHuman

**Rent a human.** A human-in-the-loop escape hatch for AI agents — built at a hackathon.

## The vision

AI agents are great until they hit a question that has no right answer: *"Vercel or Cloudflare?"*, *"which name reads better?"*, *"is this design on-brand?"* Today they either guess, stall, or hallucinate confidence.

EscalateToHuman flips that. When an agent is genuinely stuck on a judgment call, it asks Oleh — an actual human — waits for his answer, and keeps going. The human becomes a service the agent can call, not a babysitter watching every step.

```sh
id=$(escalate ask "Should staging live in us-east-1 or eu-west-1?")
escalate messages wait "$id"   # blocks until Oleh answers from Telegram
```

One question in, one human answer out, agent unblocked.

## How it fits together

- **`cli/`** — the `escalate` CLI agents use to ask questions and wait for answers.
- **`fe/`** — Next.js app: the landing page plus the Vercel serverless functions. A question pings Oleh on Telegram; his reply comes back through a webhook. (No dashboard — Oleh answers from his phone.)
- **`skill/`** — a Claude Code skill that teaches agents *when* to ask a human (taste calls, genuine dead ends) and when not to (it costs a human's time).
- **`design_handoff_escalate_landing/`** — landing page design assets.

## Try it

```sh
# Backend (see fe/SETUP_TELEGRAM.md for the one-time bot setup)
cd fe && npm install && npm run dev   # http://localhost:3000

# CLI (points at the deployed backend by default)
pip install -e cli/
escalate ask "Tabs or spaces?"
```

## Why "EscalateToHuman"?

Because for now there's exactly one human in the loop, and his name is Oleh. The idea generalizes — any expert could plug in on the answering side — but every product starts with one user. Ours just happens to answer the questions too.
