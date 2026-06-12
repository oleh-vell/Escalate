# RentOleh Backend API

REST API for asking Oleh (a human) a question and reading his answer. Used by the
`rentoleh` CLI (agent side) and the dashboard (Oleh side). No authentication.

## Base URL

Defaults to `http://localhost:3000`. If the server runs on another host/port, point
clients there — the `rentoleh` CLI reads the `RENTOLEH_BACKEND` env var or the
`--backend` flag.

## The Message object

All endpoints accept and return JSON. Every successful response carries one or more
Message objects:

```json
{
  "id": "msg_1",
  "question": "What is better, Vercel or Cloudflare?",
  "status": "pending",
  "response": null,
  "created_at": "2026-06-12T10:15:30.123Z",
  "responded_at": null
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Server-assigned, `msg_<n>` (e.g. `msg_42`). Use it in all `/:id` routes. |
| `question` | string | The question text. |
| `status` | string enum | `"pending"` (no answer yet) or `"responded"`. |
| `response` | string \| null | Oleh's answer. `null` while `status` is `pending`. |
| `created_at` | string | ISO 8601 timestamp (UTC) of when the question was asked. |
| `responded_at` | string \| null | ISO 8601 timestamp of the answer, `null` while pending. |

Errors always have the shape `{"error": "<human-readable reason>"}` with a 4xx/5xx
status code.

## Endpoints

### POST /api/messages — ask a question

Caller: agent / CLI (`rentoleh ask`).

Request body: `{"question": string}` — required, non-empty.

```bash
curl -s -X POST http://localhost:3000/api/messages \
  -H 'Content-Type: application/json' \
  -d '{"question": "What is better, Vercel or Cloudflare?"}'
```

Response `201 Created`:

```json
{
  "id": "msg_1",
  "question": "What is better, Vercel or Cloudflare?",
  "status": "pending",
  "response": null,
  "created_at": "2026-06-12T10:15:30.123Z",
  "responded_at": null
}
```

Errors: `400` if the body is not JSON or `question` is missing/empty.

### GET /api/messages — list messages

Caller: dashboard (and `rentoleh messages list`).

Query params: optional `status=pending` or `status=responded`.

```bash
curl -s 'http://localhost:3000/api/messages?status=pending'
```

Response `200 OK` — a bare JSON **array** of Message objects, newest first:

```json
[
  { "id": "msg_2", "question": "...", "status": "pending", "response": null, "created_at": "...", "responded_at": null },
  { "id": "msg_1", "question": "...", "status": "responded", "response": "...", "created_at": "...", "responded_at": "..." }
]
```

Errors: `400` if `status` is given but isn't `pending`/`responded`.

### GET /api/messages/:id — get one message

Caller: agent / CLI (`rentoleh messages get` and the `wait` polling loop).

```bash
curl -s http://localhost:3000/api/messages/msg_1
```

Response `200 OK` with the Message object. Poll this until `status` becomes
`"responded"`, then read `response`.

Errors: `404` if no message with that id exists.

### POST /api/messages/:id/respond — answer a question

Caller: Oleh's dashboard. Sets `status` to `responded`, stores the answer and
`responded_at`. Re-posting overwrites the previous answer.

Request body: `{"response": string}` — required, non-empty.

```bash
curl -s -X POST http://localhost:3000/api/messages/msg_1/respond \
  -H 'Content-Type: application/json' \
  -d '{"response": "Vercel is much better"}'
```

Response `200 OK` with the updated Message object (`status: "responded"`).

Errors: `400` if the body is not JSON or `response` is missing/empty; `404` if no
message with that id exists.

## Typical agent flow

1. `POST /api/messages` with the question → save the returned `id`.
2. Poll `GET /api/messages/:id` every few seconds (the CLI uses 3 s).
3. When `status == "responded"`, use the `response` field and continue.

With the CLI this is just:

```bash
id=$(rentoleh ask "Which AWS region should staging live in?")
rentoleh messages wait "$id"   # blocks, then prints the answer
```
