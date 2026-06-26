"""Command-line interface: argparse tree, dispatch, central exit-code handling."""

from __future__ import annotations

import argparse
import sys
import time
from typing import NoReturn

from escalate import __version__, config
from escalate.api import (
    BACKEND_ENV_VAR,
    DEFAULT_BACKEND,
    ApiError,
    Poll,
    create_question,
    poll_question,
    resolve_backend,
)
from escalate.install import install_skill
from escalate.render import write_json, write_poll, write_raw

EXIT_OK: int = 0
EXIT_ERROR: int = 1
EXIT_PENDING: int = 2
EXIT_INTERRUPTED: int = 130

# 'wait' polls with exponential backoff: start fast, then ease off so a long wait
# is cheap. Total wall-clock is bounded by --timeout.
INITIAL_POLL_SECONDS: float = 2.0
POLL_BACKOFF: float = 1.5
MAX_POLL_SECONDS: float = 15.0
DEFAULT_MAX_WAIT_SECONDS: int = 900  # 15 minutes

# The human in the loop, read from ESCALATE_HUMAN (defaults to "Oleh").
HUMAN: str = config.human_name()

TOP_EPILOG: str = f"""\
workflow:
  id=$(escalate ask "Should we use Postgres or SQLite?")
  escalate messages wait "$id"        # prints the answer when {HUMAN} responds
  # if wait exits 2 (still pending), just re-run it or check with:
  escalate messages get "$id"

backend:
  Requests go to {DEFAULT_BACKEND} by default.
  Override with the {BACKEND_ENV_VAR} env var or the --backend flag (flag wins).

statuses:
  pending     {HUMAN} has not answered yet
  answered    the answer is available in the 'answer' field

exit codes:
  0    success
  1    error (unreachable backend, unknown id, bad arguments) — reason on stderr
  2    still pending / wait timed out — retry, this is not a failure
  130  interrupted (Ctrl-C)

output:
  stdout carries data only (ids, answers, JSON); progress and errors go to
  stderr. Use '-o json' for stable machine-readable output on any command.
"""

ASK_EPILOG: str = """\
example:
  escalate ask "Which AWS region should staging live in?"
  -> stdout: the new question id, nothing else
  -> then run: escalate messages wait <id>
"""

GET_EPILOG: str = """\
example:
  escalate messages get <id>
  -> stdout: a labeled STATUS/ANSWER block
  -> exits 0 whether the question is pending or answered
"""

INSTALL_SKILL_EPILOG: str = """\
example:
  escalate install skill            # -> ~/.claude/skills/escalate/SKILL.md
  escalate install skill --project  # -> ./.claude/skills/escalate/SKILL.md
  -> prints the path it wrote; fails (exit 1) if the skill is already installed
"""

WAIT_EPILOG: str = f"""\
example:
  escalate messages wait <id>
  -> polls with backoff ({INITIAL_POLL_SECONDS:g}s, x{POLL_BACKOFF:g} each miss,
     capped at {MAX_POLL_SECONDS:g}s); when answered, prints the answer text to
     stdout (nothing else) and exits 0
  -> if still pending after --timeout seconds (default
     {DEFAULT_MAX_WAIT_SECONDS}), exits 2 with a retry hint on stderr — re-run
     the same command to keep waiting, or use '--timeout 0' to wait without bound
"""


class _Parser(argparse.ArgumentParser):
    """argparse parser that follows the exit-code contract (bad args = 1, not 2)."""

    def error(self, message: str) -> NoReturn:
        self.print_usage(sys.stderr)
        sys.stderr.write(f"{self.prog}: error: {message}\n")
        sys.stderr.write(f"Run '{self.prog} -h' for help.\n")
        raise SystemExit(EXIT_ERROR)


def _add_common_flags(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "-help",
        action="help",
        help=argparse.SUPPRESS,
    )
    parser.add_argument(
        "-o",
        "--output",
        choices=("text", "json"),
        default="text",
        help="output format on stdout (default: text)",
    )
    parser.add_argument(
        "--backend",
        default=None,
        metavar="URL",
        help=f"backend URL (default: ${BACKEND_ENV_VAR} or {DEFAULT_BACKEND})",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = _Parser(
        prog="escalate",
        description=(
            f"Ask {HUMAN} a question and get their answer. "
            "Submit with 'ask', then poll with 'messages wait' or 'messages get'."
        ),
        epilog=TOP_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("-help", action="help", help=argparse.SUPPRESS)
    parser.add_argument("--version", action="version", version=f"escalate {__version__}")

    commands = parser.add_subparsers(dest="command", required=True, parser_class=_Parser)

    ask = commands.add_parser(
        "ask",
        help=f"submit a question to {HUMAN}; prints the new question id",
        description=f"Submit a question to {HUMAN}. Prints the new question id to stdout.",
        epilog=ASK_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ask.add_argument("question", help="the question text (quote it)")
    _add_common_flags(ask)

    messages = commands.add_parser(
        "messages",
        help="inspect questions and their answers (get, wait)",
        description="Inspect questions and their answers.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    messages.add_argument("-help", action="help", help=argparse.SUPPRESS)
    message_commands = messages.add_subparsers(
        dest="subcommand", required=True, parser_class=_Parser
    )

    get_parser = message_commands.add_parser(
        "get",
        help="show one question's status and answer",
        description="Show one question. Prints a labeled STATUS/ANSWER block to stdout.",
        epilog=GET_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    get_parser.add_argument("id", help="question id from 'ask'")
    _add_common_flags(get_parser)

    wait_parser = message_commands.add_parser(
        "wait",
        help="block until a question is answered, then print the answer",
        description=(
            "Poll a question until it is answered. Prints the answer text to stdout. "
            "Exits 2 if still pending when the timeout elapses."
        ),
        epilog=WAIT_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    wait_parser.add_argument("id", help="question id from 'ask'")
    wait_parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_MAX_WAIT_SECONDS,
        metavar="SECONDS",
        help=(
            f"give up after this many seconds and exit 2 "
            f"(default: {DEFAULT_MAX_WAIT_SECONDS}; 0 = wait forever)"
        ),
    )
    _add_common_flags(wait_parser)

    install = commands.add_parser(
        "install",
        help="install bundled assets onto this machine (skill)",
        description="Install assets bundled with the CLI.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    install.add_argument("-help", action="help", help=argparse.SUPPRESS)
    install_commands = install.add_subparsers(
        dest="subcommand", required=True, parser_class=_Parser
    )

    skill_parser = install_commands.add_parser(
        "skill",
        help="install the escalate Claude Code skill into ~/.claude/skills",
        description=(
            "Copy the bundled escalate skill into your Claude Code skills directory so "
            "agents can discover it. Fails if it is already installed."
        ),
        epilog=INSTALL_SKILL_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    skill_parser.add_argument(
        "--project",
        action="store_true",
        help="install into ./.claude/skills (this project) instead of ~/.claude/skills",
    )
    skill_parser.add_argument("-help", action="help", help=argparse.SUPPRESS)
    skill_parser.add_argument(
        "-o",
        "--output",
        choices=("text", "json"),
        default="text",
        help="output format on stdout (default: text)",
    )

    return parser


def _emit_id(question_id: str, output: str) -> None:
    if output == "json":
        write_json({"id": question_id})
    else:
        write_raw(question_id)


def _emit_poll(poll: Poll, output: str, raw_answer: bool = False) -> None:
    if output == "json":
        write_json(poll)
    elif raw_answer:
        write_raw(poll["answer"] or "")
    else:
        write_poll(poll)


def _run_ask(args: argparse.Namespace) -> int:
    backend = resolve_backend(args.backend)
    question_id = create_question(backend, args.question)
    _emit_id(question_id, args.output)
    return EXIT_OK


def _run_get(args: argparse.Namespace) -> int:
    backend = resolve_backend(args.backend)
    poll = poll_question(backend, args.id)
    _emit_poll(poll, args.output)
    return EXIT_OK


def _run_wait(args: argparse.Namespace) -> int:
    if args.timeout < 0:
        raise ApiError("--timeout must be 0 (wait forever) or a positive number of seconds.")
    backend = resolve_backend(args.backend)
    deadline = None if args.timeout == 0 else time.monotonic() + args.timeout
    interval = INITIAL_POLL_SECONDS
    while True:
        poll = poll_question(backend, args.id)
        if poll["status"] == "answered":
            _emit_poll(poll, args.output, raw_answer=True)
            return EXIT_OK
        now = time.monotonic()
        if deadline is not None and now >= deadline:
            sys.stderr.write(
                f"still pending after {args.timeout}s — re-run "
                f"'escalate messages wait {args.id}' or check with "
                f"'escalate messages get {args.id}'.\n"
            )
            return EXIT_PENDING
        sleep_for = interval if deadline is None else min(interval, deadline - now)
        time.sleep(sleep_for)
        interval = min(interval * POLL_BACKOFF, MAX_POLL_SECONDS)


def _run_install_skill(args: argparse.Namespace) -> int:
    target = install_skill(args.project)
    if args.output == "json":
        write_json({"installed": str(target)})
    else:
        write_raw(f"Installed escalate skill to {target}")
    return EXIT_OK


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.command == "ask":
            return _run_ask(args)
        if args.command == "install":
            return _run_install_skill(args)
        if args.subcommand == "get":
            return _run_get(args)
        return _run_wait(args)
    except ApiError as exc:
        sys.stderr.write(f"{exc}\n")
        return exc.exit_code
    except KeyboardInterrupt:
        sys.stderr.write("interrupted\n")
        return EXIT_INTERRUPTED


if __name__ == "__main__":
    raise SystemExit(main())
