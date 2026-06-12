"""Exit-code and output contract tests with a mocked backend."""

from __future__ import annotations

import io
import json
from collections.abc import Iterator
from contextlib import redirect_stderr, redirect_stdout
from unittest import mock

import pytest

from rentoleh.api import ApiError, Message, resolve_backend
from rentoleh.cli import EXIT_ERROR, EXIT_OK, EXIT_PENDING, main

PENDING: Message = {
    "id": "msg_1",
    "question": "Postgres or SQLite?",
    "status": "pending",
    "response": None,
    "created_at": "2026-06-12T10:00:00Z",
    "responded_at": None,
}

RESPONDED: Message = {
    "id": "msg_1",
    "question": "Postgres or SQLite?",
    "status": "responded",
    "response": "Postgres.",
    "created_at": "2026-06-12T10:00:00Z",
    "responded_at": "2026-06-12T10:05:00Z",
}


def run_cli(argv: list[str]) -> tuple[int, str, str]:
    out, err = io.StringIO(), io.StringIO()
    with redirect_stdout(out), redirect_stderr(err):
        try:
            code = main(argv)
        except SystemExit as exc:  # argparse paths (-h, bad args)
            code = int(exc.code or 0)
    return code, out.getvalue(), err.getvalue()


@pytest.fixture(autouse=True)
def no_sleep() -> Iterator[None]:
    with mock.patch("rentoleh.cli.time.sleep"):
        yield


def test_resolve_backend_precedence(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("RENTOLEH_BACKEND", raising=False)
    assert resolve_backend(None) == "http://localhost:3000"
    monkeypatch.setenv("RENTOLEH_BACKEND", "http://env:1234/")
    assert resolve_backend(None) == "http://env:1234"
    assert resolve_backend("http://flag:9/") == "http://flag:9"


def test_ask_prints_only_id() -> None:
    with mock.patch("rentoleh.cli.create_message", return_value=PENDING):
        code, out, err = run_cli(["ask", "Postgres or SQLite?"])
    assert code == EXIT_OK
    assert out == "msg_1\n"
    assert err == ""


def test_ask_json_output() -> None:
    with mock.patch("rentoleh.cli.create_message", return_value=PENDING):
        code, out, _ = run_cli(["ask", "Postgres or SQLite?", "-o", "json"])
    assert code == EXIT_OK
    assert json.loads(out) == PENDING


def test_list_table_has_headers() -> None:
    with mock.patch("rentoleh.cli.list_messages", return_value=[PENDING]):
        code, out, _ = run_cli(["messages", "list"])
    assert code == EXIT_OK
    lines = out.splitlines()
    assert lines[0].split() == ["ID", "STATUS", "CREATED", "QUESTION"]
    assert lines[1].startswith("msg_1")


def test_get_labeled_block() -> None:
    with mock.patch("rentoleh.cli.get_message", return_value=RESPONDED):
        code, out, _ = run_cli(["messages", "get", "msg_1"])
    assert code == EXIT_OK
    assert "STATUS: responded\n" in out
    assert "RESPONSE: Postgres.\n" in out


def test_wait_prints_only_answer_when_responded() -> None:
    with mock.patch("rentoleh.cli.get_message", return_value=RESPONDED):
        code, out, err = run_cli(["messages", "wait", "msg_1"])
    assert code == EXIT_OK
    assert out == "Postgres.\n"
    assert err == ""


def test_wait_pending_exits_2_with_retry_hint() -> None:
    clock = iter(float(i) for i in range(0, 1000, 3))
    with (
        mock.patch("rentoleh.cli.get_message", return_value=PENDING),
        mock.patch("rentoleh.cli.time.monotonic", side_effect=lambda: next(clock)),
    ):
        code, out, err = run_cli(["messages", "wait", "msg_1", "--timeout", "10"])
    assert code == EXIT_PENDING
    assert out == ""
    assert "re-run 'rentoleh messages wait msg_1'" in err


def test_wait_becomes_responded_mid_poll() -> None:
    with mock.patch("rentoleh.cli.get_message", side_effect=[PENDING, PENDING, RESPONDED]):
        code, out, _ = run_cli(["messages", "wait", "msg_1"])
    assert code == EXIT_OK
    assert out == "Postgres.\n"


def test_api_error_exits_1_on_stderr() -> None:
    with mock.patch(
        "rentoleh.cli.get_message",
        side_effect=ApiError("No message 'msg_999'. Run 'rentoleh messages list' to see ids."),
    ):
        code, out, err = run_cli(["messages", "get", "msg_999"])
    assert code == EXIT_ERROR
    assert out == ""
    assert "msg_999" in err and "messages list" in err


def test_bad_args_exit_1_with_help_pointer() -> None:
    code, _, err = run_cli(["messages", "frobnicate"])
    assert code == EXIT_ERROR
    assert "-h" in err


def test_negative_timeout_exits_1() -> None:
    code, _, err = run_cli(["messages", "wait", "msg_1", "--timeout", "-5"])
    assert code == EXIT_ERROR
    assert "--timeout" in err


def test_help_exits_0_everywhere() -> None:
    for argv in (
        ["-h"],
        ["-help"],
        ["ask", "-h"],
        ["messages", "-h"],
        ["messages", "-help"],
        ["messages", "list", "-h"],
        ["messages", "get", "-h"],
        ["messages", "wait", "-help"],
    ):
        code, out, _ = run_cli(argv)
        assert code == EXIT_OK, argv
        assert "usage" in out.lower(), argv


def test_top_help_documents_the_contract() -> None:
    _, out, _ = run_cli(["--help"])
    assert "RENTOLEH_BACKEND" in out
    assert "pending" in out and "responded" in out
    assert "130" in out  # exit-code table
    assert "rentoleh ask" in out  # workflow example


def test_version() -> None:
    code, out, _ = run_cli(["--version"])
    assert code == EXIT_OK
    assert out.startswith("rentoleh ")
