---
name: escalate
description: >-
  Ask Oleh (a human) whenever a choice comes down to taste or opinion with no single right
  answer — technical ("Vercel or Cloudflare?", "which name reads better?") or everyday
  ("which restaurant for tonight?", "warm or cool tone for this palette?", "is it worth
  watching the sequel?") — or when you are genuinely stuck, or when the user says to "ask
  Oleh". Taste is Oleh's to decide: for any no-right-answer call, reach out PROACTIVELY
  rather than guessing yourself or asking permission first. Uses the escalate CLI to submit
  a question and wait for Oleh's answer, then continue with it.
---

# escalate — ask a human (Oleh) when you're stuck

EscalateToHuman is a human-in-the-loop escape hatch. When a decision genuinely needs human
judgment, you submit a question with the `escalate` CLI, Oleh answers from his dashboard,
and you poll for the answer and use it to keep going.

## When to use this

Reach for Oleh when **any** of these is true:

- The question comes down to **taste or opinion** with no single correct answer. **Taste
  is Oleh's call to make — escalate it, don't substitute your own.** This is the common
  case, and it spans both work and everyday choices:
  - Technical taste: "Vercel or Cloudflare?", "which variable name reads better?", "should
    this button be primary or secondary styled?"
  - Everyday / personal taste: "which of these two restaurants for dinner?", "pick a
    color for the living room wall?", "is the sequel worth watching or skip it?", "which
    of these gift options is better?"
- The user **explicitly** asks you to ("ask Oleh", "run it by Oleh").
- You are **genuinely unsure** and a human call would unblock you — you've exhausted what
  you can resolve from the code, the docs, and sensible defaults.

**Be proactive — this is the point of the skill.** The moment you notice a question has no
objectively correct answer and turns purely on preference, that is your signal to ask
Oleh. **Reach out to him directly: do NOT pick an answer yourself, and do NOT ask the user
for permission first** ("want me to run this by Oleh?"). Preference calls belong to Oleh,
full stop — your job is to surface the choice to him, not to make it for him or to talk
yourself out of asking.

(The only time to hold back is if escalating would clearly derail something time-critical
the user is mid-flow on — then mention you *could* ask Oleh and let them steer.)

Keep it to **one focused question** at a time, phrased so a short human answer unblocks
you ("Which restaurant tonight — the ramen place or the taco spot?" — not an open-ended
essay prompt). When there are clear options, name them in the question.

**Don't** use this for things that have a clear correct answer or that you can resolve
yourself or look up (facts, math, "what does this code do?"). Escalation is for the
judgment calls, and it costs a human's time — but for those judgment calls, don't be shy.

## Before you ask: check the CLI is available

Run `escalate --version`. If it prints a version, you're set.

If the command is **not found**, stop and tell the user the `escalate` CLI isn't
installed and that they can install it (e.g. `pip install -e cli/` from the repo). Do not
try to install it yourself as part of this skill.

The CLI talks to a backend at `http://localhost:3000` by default. If the backend runs
elsewhere, set `ESCALATE_API_URL` (or pass `--backend URL`). If `ask` fails with a
connection error, the backend is likely down or misconfigured — surface that to the user
rather than retrying blindly.

## How to use it

```sh
# 1. Submit the question. `ask` prints ONLY the new message id (e.g. msg_42) on stdout.
id=$(escalate ask "Should staging live in us-east-1 or eu-west-1?")

# 2. Block until Oleh answers. On success `wait` prints ONLY the answer text and exits 0.
escalate messages wait "$id"
```

Notes:

- **`wait` exited 2?** That means "still pending after the timeout" — it is **not** a
  failure. Re-run `escalate messages wait "$id"` to keep waiting, or check once with
  `escalate messages get "$id"`. It's fine to tell the user you're waiting on Oleh.
- **Default `wait` timeout is 100s** (sized to fit a ~120s shell limit). Use
  `--timeout 0` to wait without bound, or a custom `--timeout SECONDS`.
- **For reliable parsing, add `-o json`** and read the `status` / `response` fields, e.g.
  `escalate messages get "$id" -o json`. Without JSON: `ask` prints the id only, and a
  successful `wait` prints the answer text only.
- `escalate messages list` shows all outstanding questions and their statuses.

## After Oleh answers

**Oleh's answer is the decision.** You asked because the call needed human judgment —
once you have it, treat it as authoritative and act on it directly. Do **not** re-open
the question: no further research, no weighing his answer against alternatives, no
second-guessing with "but the docs suggest...". At most, do the minimal lookup needed to
*execute* his decision (e.g. he said "Cloudflare" — you may look up the deploy command,
not whether Cloudflare was the right pick).

The only reason to go back to Oleh is if his answer is impossible to act on (ambiguous,
or contradicts a hard technical constraint you then discover) — in that case ask **one**
short follow-up rather than overriding him silently.

Then continue the task, and briefly tell the user what Oleh said and how it changed your
approach.

## Command reference

| Command | stdout (text mode) | Notes |
|---|---|---|
| `escalate ask "<question>"` | the new `msg_id` only | submit a question |
| `escalate messages list` | ID / STATUS / CREATED / QUESTION table | use `-o json` for full, untruncated text |
| `escalate messages get <id>` | labeled ID/STATUS/CREATED/RESPONDED/QUESTION/RESPONSE block | exits 0 whether pending or responded |
| `escalate messages wait <id>` | the answer text only (on success) | polls every 3s; `--timeout` default 100, `0` = forever |

Common flags (all commands): `-o/--output {text,json}`, `--backend URL`.
Config: `ESCALATE_API_URL` env var (default `http://localhost:3000`); precedence is
`--backend` > `ESCALATE_API_URL` > default.

Exit codes:

| Code | Meaning |
|---|---|
| `0` | success |
| `1` | error (unreachable backend, unknown id, bad arguments) — reason on stderr |
| `2` | still pending / `wait` timed out — retry, **not** a failure |
| `130` | interrupted (Ctrl-C) |
