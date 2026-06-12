"""Throwaway in-memory backend for smoke-testing the CLI by hand.

Run: python tests/mock_backend.py [port]
Messages auto-respond ~5 seconds after creation so 'wait' has something to poll.
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

MESSAGES: dict[str, dict[str, Any]] = {}
AUTO_RESPOND_AFTER_SECONDS: float = 5.0
_created: dict[str, float] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _maybe_respond(message_id: str) -> None:
    message = MESSAGES[message_id]
    if (
        message["status"] == "pending"
        and time.time() - _created[message_id] > AUTO_RESPOND_AFTER_SECONDS
    ):
        message["status"] = "responded"
        message["response"] = f"Mock answer to: {message['question']}"
        message["responded_at"] = _now()


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: object) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/api/messages":
            for message_id in MESSAGES:
                _maybe_respond(message_id)
            self._send(200, list(MESSAGES.values()))
        elif self.path.startswith("/api/messages/"):
            message_id = self.path.removeprefix("/api/messages/")
            if message_id not in MESSAGES:
                self._send(404, {"error": "not found"})
                return
            _maybe_respond(message_id)
            self._send(200, MESSAGES[message_id])
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self) -> None:
        if self.path != "/api/messages":
            self._send(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", "0"))
        body = json.loads(self.rfile.read(length) or b"{}")
        message_id = f"msg_{len(MESSAGES) + 1}"
        MESSAGES[message_id] = {
            "id": message_id,
            "question": body.get("question", ""),
            "status": "pending",
            "response": None,
            "created_at": _now(),
            "responded_at": None,
        }
        _created[message_id] = time.time()
        self._send(201, MESSAGES[message_id])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    print(f"mock backend on http://localhost:{port}", file=sys.stderr)
    HTTPServer(("localhost", port), Handler).serve_forever()
