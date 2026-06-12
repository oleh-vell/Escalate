"""HTTP client for the rentoleh backend."""

from __future__ import annotations

import os
from typing import Literal, TypedDict, cast

import requests

DEFAULT_BACKEND: str = "http://localhost:3000"
BACKEND_ENV_VAR: str = "RENTOLEH_BACKEND"
REQUEST_TIMEOUT_SECONDS: float = 10.0

Status = Literal["pending", "responded"]


class Message(TypedDict):
    """A question sent to Oleh, as returned by the backend."""

    id: str
    question: str
    status: Status
    response: str | None
    created_at: str
    responded_at: str | None


class ApiError(Exception):
    """A failure talking to the backend, with cause-and-remedy text for stderr."""

    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code: int = exit_code


def resolve_backend(flag_value: str | None) -> str:
    """Backend URL precedence: --backend flag > RENTOLEH_BACKEND env > default."""
    if flag_value:
        return flag_value.rstrip("/")
    env_value = os.environ.get(BACKEND_ENV_VAR)
    if env_value:
        return env_value.rstrip("/")
    return DEFAULT_BACKEND


def _unreachable_error(backend: str) -> ApiError:
    return ApiError(
        f"Cannot reach backend at {backend}. Is it running? "
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


def _parse_message(data: object) -> Message:
    if not isinstance(data, dict):
        raise ApiError(f"Unexpected response from backend (expected a message object): {data!r}")
    return cast(Message, data)


def create_message(backend: str, question: str) -> Message:
    """POST /api/messages — submit a new question for Oleh."""
    response = _request("POST", backend, "/api/messages", json_body={"question": question})
    if not response.ok:
        raise ApiError(
            f"Backend rejected the question (HTTP {response.status_code}): {response.text.strip()}"
        )
    return _parse_message(response.json())


def list_messages(backend: str) -> list[Message]:
    """GET /api/messages — all questions, newest first as the backend returns them."""
    response = _request("GET", backend, "/api/messages")
    if not response.ok:
        raise ApiError(
            f"Backend failed to list messages (HTTP {response.status_code}): "
            f"{response.text.strip()}"
        )
    data = response.json()
    if not isinstance(data, list):
        raise ApiError(f"Unexpected response from backend (expected a list): {data!r}")
    return [_parse_message(item) for item in data]


def get_message(backend: str, message_id: str) -> Message:
    """GET /api/messages/:id — one question with its current status and response."""
    response = _request("GET", backend, f"/api/messages/{message_id}")
    if response.status_code == 404:
        raise ApiError(f"No message '{message_id}'. Run 'rentoleh messages list' to see ids.")
    if not response.ok:
        raise ApiError(
            f"Backend failed to fetch message '{message_id}' (HTTP {response.status_code}): "
            f"{response.text.strip()}"
        )
    return _parse_message(response.json())
