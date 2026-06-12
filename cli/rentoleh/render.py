"""Output formatting: human-readable text and JSON, always on stdout."""

from __future__ import annotations

import json
import sys

from rentoleh.api import Message

QUESTION_TRUNCATE_AT: int = 60


def _truncate(text: str, limit: int) -> str:
    flattened = " ".join(text.split())
    if len(flattened) <= limit:
        return flattened
    return flattened[: limit - 3] + "..."


def write_json(payload: Message | list[Message]) -> None:
    """JSON to stdout with stable keys mirroring the API."""
    sys.stdout.write(json.dumps(payload, indent=2) + "\n")


def write_raw(value: str) -> None:
    """A single machine-consumable value on stdout, nothing else."""
    sys.stdout.write(value + "\n")


def write_table(messages: list[Message]) -> None:
    """ID  STATUS  CREATED  QUESTION table for 'messages list'."""
    headers = ("ID", "STATUS", "CREATED", "QUESTION")
    rows = [
        (
            message["id"],
            message["status"],
            message["created_at"],
            _truncate(message["question"], QUESTION_TRUNCATE_AT),
        )
        for message in messages
    ]
    widths = [
        max(len(headers[column]), *(len(row[column]) for row in rows))
        if rows
        else len(headers[column])
        for column in range(len(headers))
    ]
    lines = [headers, *rows]
    for line in lines:
        sys.stdout.write(
            "  ".join(cell.ljust(widths[column]) for column, cell in enumerate(line)).rstrip()
            + "\n"
        )


def write_detail(message: Message) -> None:
    """Labeled ID/STATUS/QUESTION/RESPONSE block for 'messages get'."""
    response = message["response"] if message["response"] is not None else "(no response yet)"
    sys.stdout.write(f"ID: {message['id']}\n")
    sys.stdout.write(f"STATUS: {message['status']}\n")
    sys.stdout.write(f"CREATED: {message['created_at']}\n")
    sys.stdout.write(f"RESPONDED: {message['responded_at'] or '-'}\n")
    sys.stdout.write(f"QUESTION: {message['question']}\n")
    sys.stdout.write(f"RESPONSE: {response}\n")
