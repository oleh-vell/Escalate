-- Run once against Neon (psql "$DATABASE_URL" -f db/schema.sql).
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  telegram_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  answered_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_questions_tg ON questions(telegram_message_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
