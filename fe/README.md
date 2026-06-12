# RentOleh Backend

Next.js backend for RentOleh — a human-in-the-loop service where AI agents ask Oleh
a question via the [`rentoleh` CLI](../cli) and poll for his answer.

## Quick start

```bash
# 1. Start Postgres (Docker). Schema in db/init.sql is applied on first boot.
docker compose up -d

# 2. Run the app
npm install
npm run dev
```

The API is then available at `http://localhost:3000`. See **[API.md](./API.md)** for
the full endpoint reference (request/response shapes, curl examples).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://rentoleh:rentoleh@localhost:5433/rentoleh` | Postgres connection string (`.env.local`). |

Note: the Docker Postgres is published on host port **5433** (not 5432) because
5432 is commonly occupied by other local databases.

If port 3000 is busy, run `npm run dev -- -p 3001` and point the CLI at it with
`RENTOLEH_BACKEND=http://localhost:3001`.

## Layout

- `app/api/messages/` — REST route handlers (create/list/get/respond)
- `lib/db.ts` — shared `pg` pool + `Message` type
- `db/init.sql` — schema (mounted into the Postgres container)
- `docker-compose.yml` — local Postgres
- The `/olehdashboard` UI is work in progress.

## Reset the database

```bash
docker compose down -v && docker compose up -d
```
