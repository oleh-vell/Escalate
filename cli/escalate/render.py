"""Output formatting: human-readable text and JSON, always on stdout."""

from __future__ import annotations

import json
import sys

from escalate.api import Poll


def write_json(payload: object) -> None:
    """JSON to stdout with stable keys mirroring the API."""
    sys.stdout.write(json.dumps(payload, indent=2) + "\n")


def write_raw(value: str) -> None:
    """A single machine-consumable value on stdout, nothing else."""
    sys.stdout.write(value + "\n")


def write_poll(poll: Poll) -> None:
    """Labeled STATUS/ANSWER block for 'messages get'."""
    answer = poll["answer"] if poll["answer"] is not None else "(no answer yet)"
    sys.stdout.write(f"STATUS: {poll['status']}\n")
    sys.stdout.write(f"ANSWER: {answer}\n")
