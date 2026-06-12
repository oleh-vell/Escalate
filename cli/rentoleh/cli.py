"""Command-line interface: argparse tree, dispatch, central exit-code handling."""

from __future__ import annotations

import argparse
import sys
import time
from typing import NoReturn

from rentoleh import __version__
from rentoleh.api import (
    BACKEND_ENV_VAR,
    DEFAULT_BACKEND,
    ApiError,
    Message,
    create_message,
    get_message,
    list_messages,
    resolve_backend,
)
from rentoleh.render import write_detail, write_json, write_raw, write_table

EXIT_OK: int = 0
EXIT_ERROR: int = 1
EXIT_PENDING: int = 2
EXIT_INTERRUPTED: int = 130

POLL_INTERVAL_SECONDS: float = 3.0
DEFAULT_WAIT_TIMEOUT_SECONDS: int = 100

TOP_EPILOG: str = f"""\
workflow:
  id=$(rentoleh ask "Should we use Postgres or SQLite?")
  rentoleh messages wait "$id"        # prints the answer when Oleh responds
  # if wait exits 2 (still pending), just re-run it or check with:
  rentoleh messages get "$id"

backend:
  Requests go to {DEFAULT_BACKEND} by default.
  Override with the {BACKEND_ENV_VAR} env var or the --backend flag (flag wins).

statuses:
  pending     Oleh has not answered yet
  responded   answer is available in the 'response' field

exit codes:
  0    success
  1    error (unreachable backend, unknown id, bad arguments) — reason on stderr
  2    still pending / wait timed out — retry, this is not a failure
  130  interrupted (Ctrl-C)

output:
  stdout carries data only (ids, answers, tables, JSON); progress and errors go
  to stderr. Use '-o json' for stable machine-readable output on any command.
"""

ASK_EPILOG: str = """\
example:
  rentoleh ask "Which AWS region should staging live in?"
  -> stdout: the new message id (e.g. msg_42), nothing else
  -> then run: rentoleh messages wait <id>
"""

LIST_EPILOG: str = """\
example:
  rentoleh messages list
  -> stdout: table with columns ID, STATUS, CREATED, QUESTION (truncated)
  -> use '-o json' for full untruncated questions and responses
"""

GET_EPILOG: str = """\
example:
  rentoleh messages get msg_42
  -> stdout: labeled ID/STATUS/CREATED/RESPONDED/QUESTION/RESPONSE block
  -> exits 0 whether the message is pending or responded
"""

WAIT_EPILOG: str = f"""\
example:
  rentoleh messages wait msg_42
  -> polls every {POLL_INTERVAL_SECONDS:g}s; when answered, prints the answer text
     to stdout (nothing else) and exits 0
  -> if still pending after --timeout seconds (default
     {DEFAULT_WAIT_TIMEOUT_SECONDS}, fits inside a ~120s shell tool limit),
     exits 2 with a retry hint on stderr — re-run the same command to keep
     waiting, or use '--timeout 0' to wait without bound
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
        prog="rentoleh",
        description=(
            "Ask Oleh a question and get his answer. "
            "Submit with 'ask', then poll with 'messages wait' or 'messages get'."
        ),
        epilog=TOP_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("-help", action="help", help=argparse.SUPPRESS)
    parser.add_argument("--version", action="version", version=f"rentoleh {__version__}")

    commands = parser.add_subparsers(dest="command", required=True, parser_class=_Parser)

    ask = commands.add_parser(
        "ask",
        help="submit a question to Oleh; prints the new message id",
        description="Submit a question to Oleh. Prints the new message id to stdout.",
        epilog=ASK_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ask.add_argument("question", help="the question text (quote it)")
    _add_common_flags(ask)

    messages = commands.add_parser(
        "messages",
        help="inspect questions and their answers (list, get, wait)",
        description="Inspect questions and their answers.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    messages.add_argument("-help", action="help", help=argparse.SUPPRESS)
    message_commands = messages.add_subparsers(
        dest="subcommand", required=True, parser_class=_Parser
    )

    list_parser = message_commands.add_parser(
        "list",
        help="list all messages as a table",
        description="List all messages. Prints an ID/STATUS/CREATED/QUESTION table to stdout.",
        epilog=LIST_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    _add_common_flags(list_parser)

    get_parser = message_commands.add_parser(
        "get",
        help="show one message, including the response if answered",
        description="Show one message. Prints a labeled block to stdout.",
        epilog=GET_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    get_parser.add_argument("id", help="message id from 'ask' or 'messages list'")
    _add_common_flags(get_parser)

    wait_parser = message_commands.add_parser(
        "wait",
        help="block until a message is answered, then print the answer",
        description=(
            "Poll a message until it is answered. Prints the answer text to stdout. "
            "Exits 2 if still pending when the timeout elapses."
        ),
        epilog=WAIT_EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    wait_parser.add_argument("id", help="message id from 'ask' or 'messages list'")
    wait_parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_WAIT_TIMEOUT_SECONDS,
        metavar="SECONDS",
        help=(
            f"give up after this many seconds and exit 2 "
            f"(default: {DEFAULT_WAIT_TIMEOUT_SECONDS}; 0 = wait forever)"
        ),
    )
    _add_common_flags(wait_parser)

    return parser


def _emit_message(message: Message, output: str, raw_key: str | None = None) -> None:
    """Write a message to stdout: JSON, a single raw field, or the labeled block."""
    if output == "json":
        write_json(message)
    elif raw_key == "id":
        write_raw(message["id"])
    elif raw_key == "response":
        write_raw(message["response"] or "")
    else:
        write_detail(message)


def _run_ask(args: argparse.Namespace) -> int:
    backend = resolve_backend(args.backend)
    message = create_message(backend, args.question)
    _emit_message(message, args.output, raw_key="id")
    return EXIT_OK


def _run_list(args: argparse.Namespace) -> int:
    backend = resolve_backend(args.backend)
    messages = list_messages(backend)
    if args.output == "json":
        write_json(messages)
    else:
        write_table(messages)
    return EXIT_OK


def _run_get(args: argparse.Namespace) -> int:
    backend = resolve_backend(args.backend)
    message = get_message(backend, args.id)
    _emit_message(message, args.output)
    return EXIT_OK


def _run_wait(args: argparse.Namespace) -> int:
    if args.timeout < 0:
        raise ApiError("--timeout must be 0 (wait forever) or a positive number of seconds.")
    backend = resolve_backend(args.backend)
    deadline = None if args.timeout == 0 else time.monotonic() + args.timeout
    while True:
        message = get_message(backend, args.id)
        if message["status"] == "responded":
            _emit_message(message, args.output, raw_key="response")
            return EXIT_OK
        if deadline is not None and time.monotonic() + POLL_INTERVAL_SECONDS > deadline:
            sys.stderr.write(
                f"still pending after {args.timeout}s — re-run "
                f"'rentoleh messages wait {args.id}' or check with "
                f"'rentoleh messages get {args.id}'.\n"
            )
            return EXIT_PENDING
        time.sleep(POLL_INTERVAL_SECONDS)


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.command == "ask":
            return _run_ask(args)
        if args.subcommand == "list":
            return _run_list(args)
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
