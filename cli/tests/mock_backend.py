"""Throwaway in-memory backend for smoke-testing the CLI by hand.

Run: python tests/mock_backend.py [port]
Then: ESCALATE_API_URL=http://localhost:3000 escalate ask "test?"
Questions auto-answer ~5 seconds after creation so 'wait' has something to poll.

Mirrors the real contract:
  POST /api/ask           -> {"id"}
  GET  /api/messages/<id> -> {"status", "answer"}
"""

from __future__ import annotations

import json
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

QUESTIONS: dict[str, dict[str, Any]] = {}
AUTO_ANSWER_AFTER_SECONDS: float = 5.0
_created: dict[str, float] = {}


def _maybe_answer(question_id: str) -> None:
    question = QUESTIONS[question_id]
    if (
        question["status"] == "pending"
        and time.time() - _created[question_id] > AUTO_ANSWER_AFTER_SECONDS
    ):
        question["status"] = "answered"
        question["answer"] = f"Mock answer to: {question['question']}"


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: object) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path.startswith("/api/messages/"):
            question_id = self.path.removeprefix("/api/messages/")
            if question_id not in QUESTIONS:
                self._send(404, {"error": "not found"})
                return
            _maybe_answer(question_id)
            question = QUESTIONS[question_id]
            self._send(200, {"status": question["status"], "answer": question["answer"]})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self) -> None:
        if self.path != "/api/ask":
            self._send(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", "0"))
        body = json.loads(self.rfile.read(length) or b"{}")
        question_id = f"q_{len(QUESTIONS) + 1}"
        QUESTIONS[question_id] = {
            "question": body.get("question", ""),
            "status": "pending",
            "answer": None,
        }
        _created[question_id] = time.time()
        self._send(201, {"id": question_id})

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    print(f"mock backend on http://localhost:{port}", file=sys.stderr)
    HTTPServer(("localhost", port), Handler).serve_forever()
