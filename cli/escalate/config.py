"""Environment-driven configuration with sensible defaults.

Forking this project should take one change: point ``ESCALATE_HUMAN`` at your own
human-in-the-loop (and ``ESCALATE_API_URL`` at your own deployment). Everything
user-facing — the CLI help, prompts, exit messages — reads the human's name from
here, so nothing else is hardcoded to "Oleh".
"""

from __future__ import annotations

import os

HUMAN_ENV_VAR: str = "ESCALATE_HUMAN"
API_URL_ENV_VAR: str = "ESCALATE_API_URL"

DEFAULT_HUMAN: str = "oleh"
# TODO(escalate): point this at your own deployed dashboard once it's live,
#   e.g. "https://escalate-to-oleh.vercel.app".
DEFAULT_API_URL: str = "https://escalate-drab.vercel.app"


def human() -> str:
    """The human in the loop, lowercase (env ``ESCALATE_HUMAN``, default 'oleh')."""
    return os.environ.get(HUMAN_ENV_VAR, "").strip() or DEFAULT_HUMAN


def human_name() -> str:
    """The human's name capitalized for display, e.g. 'Oleh'."""
    return human().capitalize()


def resolve_api_url(flag_value: str | None) -> str:
    """API URL precedence: ``--backend`` flag > ``ESCALATE_API_URL`` env > default."""
    if flag_value:
        return flag_value.rstrip("/")
    env_value = os.environ.get(API_URL_ENV_VAR)
    if env_value:
        return env_value.rstrip("/")
    return DEFAULT_API_URL
