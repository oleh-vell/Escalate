CREATE SEQUENCE IF NOT EXISTS messages_id_seq;

CREATE TABLE IF NOT EXISTS messages (
  id           TEXT PRIMARY KEY DEFAULT ('msg_' || nextval('messages_id_seq')),
  question     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
  response     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);
