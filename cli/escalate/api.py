"""HTTP client for the escalate backend.

Two endpoints back the whole flow:
  POST /api/ask           -> {"id": "..."}            (submit a question)
  GET  /api/messages/<id> -> {"status", "answer"}     (poll for the answer)
Answers arrive out-of-band (the human replies on Telegram); the CLI only polls.
"""

from __future__ import annotations

from typing import Literal, TypedDict, cast

import requests

from escalate import config

# Re-exported under their historical names so callers and tests have one import site.
DEFAULT_BACKEND: str = config.DEFAULT_API_URL
BACKEND_ENV_VAR: str = config.API_URL_ENV_VAR
resolve_backend = config.resolve_api_url
REQUEST_TIMEOUT_SECONDS: float = 10.0

Status = Literal["pending", "answered"]


class Poll(TypedDict):
    """The poll view of a question: just its status and (once ready) the answer."""

    status: Status
    answer: str | None


class ApiError(Exception):
    """A failure talking to the backend, with cause-and-remedy text for stderr."""

    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code: int = exit_code


def _unreachable_error(backend: str) -> ApiError:
    return ApiError(
        f"Cannot reach backend at {backend}. Is it deployed and is the URL right? "
        f"Set {BACKEND_ENV_VAR} or pass --backend to override."
    )


def _request(
    method: str, backend: str, path: str, json_body: dict[str, str] | None = None
) -> requests.Response:
    url = f"{backend}{path}"
    try:
        response = requests.request(method, url, json=json_body, timeout=REQUEST_TIMEOUT_SECONDS)
    except requests.exceptions.ConnectionError as exc:
        raise _unreachable_error(backend) from exc
    except requests.exceptions.Timeout as exc:
        raise ApiError(
            f"Backend at {backend} did not respond within {REQUEST_TIMEOUT_SECONDS:g}s. "
            f"Is it healthy? Set {BACKEND_ENV_VAR} or pass --backend to override."
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise _unreachable_error(backend) from exc
    return response


def _error_text(response: requests.Response) -> str:
    """The backend's {"error": ...} message if present, else the raw body."""
    try:
        data = response.json()
    except ValueError:
        return response.text.strip()
    if isinstance(data, dict) and "error" in data:
        return str(data["error"])
    return response.text.strip()


def create_question(backend: str, question: str) -> str:
    """POST /api/ask — submit a question. Returns the new question id."""
    response = _request("POST", backend, "/api/ask", json_body={"question": question})
    if not response.ok:
        raise ApiError(
            f"Backend rejected the question (HTTP {response.status_code}): {_error_text(response)}"
        )
    data = response.json()
    if not isinstance(data, dict) or not isinstance(data.get("id"), str):
        raise ApiError(f"Unexpected response from backend (expected {{id}}): {data!r}")
    return cast(str, data["id"])


def poll_question(backend: str, question_id: str) -> Poll:
    """GET /api/messages/<id> — current status and answer (answer is null until ready)."""
    response = _request("GET", backend, f"/api/messages/{question_id}")
    if response.status_code == 404:
        raise ApiError(f"No question '{question_id}'. Check the id printed by 'escalate ask'.")
    if not response.ok:
        raise ApiError(
            f"Backend failed to fetch '{question_id}' (HTTP {response.status_code}): "
            f"{_error_text(response)}"
        )
    data = response.json()
    if not isinstance(data, dict) or "status" not in data:
        raise ApiError(f"Unexpected response from backend (expected {{status, answer}}): {data!r}")
    return cast(Poll, {"status": data["status"], "answer": data.get("answer")})
