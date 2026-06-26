"""Exit-code and output contract tests with a mocked backend."""

from __future__ import annotations

import io
import json
from collections.abc import Iterator
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest import mock

import pytest

from escalate.api import ApiError, Poll, resolve_backend
from escalate.cli import EXIT_ERROR, EXIT_OK, EXIT_PENDING, main
from escalate.config import DEFAULT_API_URL

PENDING: Poll = {"status": "pending", "answer": None}
ANSWERED: Poll = {"status": "answered", "answer": "Postgres."}


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
    with mock.patch("escalate.cli.time.sleep"):
        yield


def test_resolve_backend_precedence(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("ESCALATE_API_URL", raising=False)
    assert resolve_backend(None) == DEFAULT_API_URL
    monkeypatch.setenv("ESCALATE_API_URL", "http://env:1234/")
    assert resolve_backend(None) == "http://env:1234"
    assert resolve_backend("http://flag:9/") == "http://flag:9"


def test_ask_prints_only_id() -> None:
    with mock.patch("escalate.cli.create_question", return_value="q_1"):
        code, out, err = run_cli(["ask", "Postgres or SQLite?"])
    assert code == EXIT_OK
    assert out == "q_1\n"
    assert err == ""


def test_ask_json_output() -> None:
    with mock.patch("escalate.cli.create_question", return_value="q_1"):
        code, out, _ = run_cli(["ask", "Postgres or SQLite?", "-o", "json"])
    assert code == EXIT_OK
    assert json.loads(out) == {"id": "q_1"}


def test_get_labeled_block() -> None:
    with mock.patch("escalate.cli.poll_question", return_value=ANSWERED):
        code, out, _ = run_cli(["messages", "get", "q_1"])
    assert code == EXIT_OK
    assert "STATUS: answered\n" in out
    assert "ANSWER: Postgres.\n" in out


def test_get_json_output() -> None:
    with mock.patch("escalate.cli.poll_question", return_value=PENDING):
        code, out, _ = run_cli(["messages", "get", "q_1", "-o", "json"])
    assert code == EXIT_OK
    assert json.loads(out) == PENDING


def test_wait_prints_only_answer_when_answered() -> None:
    with mock.patch("escalate.cli.poll_question", return_value=ANSWERED):
        code, out, err = run_cli(["messages", "wait", "q_1"])
    assert code == EXIT_OK
    assert out == "Postgres.\n"
    assert err == ""


def test_wait_pending_exits_2_with_retry_hint() -> None:
    clock = iter(float(i) for i in range(0, 10000))
    with (
        mock.patch("escalate.cli.poll_question", return_value=PENDING),
        mock.patch("escalate.cli.time.monotonic", side_effect=lambda: next(clock)),
    ):
        code, out, err = run_cli(["messages", "wait", "q_1", "--timeout", "10"])
    assert code == EXIT_PENDING
    assert out == ""
    assert "re-run 'escalate messages wait q_1'" in err


def test_wait_becomes_answered_mid_poll() -> None:
    with mock.patch("escalate.cli.poll_question", side_effect=[PENDING, PENDING, ANSWERED]):
        code, out, _ = run_cli(["messages", "wait", "q_1"])
    assert code == EXIT_OK
    assert out == "Postgres.\n"


def test_api_error_exits_1_on_stderr() -> None:
    with mock.patch(
        "escalate.cli.poll_question",
        side_effect=ApiError("No question 'q_999'. Check the id printed by 'escalate ask'."),
    ):
        code, out, err = run_cli(["messages", "get", "q_999"])
    assert code == EXIT_ERROR
    assert out == ""
    assert "q_999" in err


def test_bad_args_exit_1_with_help_pointer() -> None:
    code, _, err = run_cli(["messages", "frobnicate"])
    assert code == EXIT_ERROR
    assert "-h" in err


def test_negative_timeout_exits_1() -> None:
    code, _, err = run_cli(["messages", "wait", "q_1", "--timeout", "-5"])
    assert code == EXIT_ERROR
    assert "--timeout" in err


def test_help_exits_0_everywhere() -> None:
    for argv in (
        ["-h"],
        ["-help"],
        ["ask", "-h"],
        ["messages", "-h"],
        ["messages", "-help"],
        ["messages", "get", "-h"],
        ["messages", "wait", "-help"],
    ):
        code, out, _ = run_cli(argv)
        assert code == EXIT_OK, argv
        assert "usage" in out.lower(), argv


def test_top_help_documents_the_contract() -> None:
    _, out, _ = run_cli(["--help"])
    assert "ESCALATE_API_URL" in out
    assert "pending" in out and "answered" in out
    assert "130" in out  # exit-code table
    assert "escalate ask" in out  # workflow example


def test_version() -> None:
    code, out, _ = run_cli(["--version"])
    assert code == EXIT_OK
    assert out.startswith("escalate ")


def test_install_skill_writes_bundled_file(tmp_path: Path) -> None:
    with mock.patch("escalate.install.Path.home", return_value=tmp_path):
        code, out, err = run_cli(["install", "skill"])
    target = tmp_path / ".claude" / "skills" / "escalate" / "SKILL.md"
    assert code == EXIT_OK
    assert err == ""
    assert str(target) in out
    assert target.read_text().startswith("---\nname: escalate")


def test_install_skill_project_scope(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.chdir(tmp_path)
    code, out, _ = run_cli(["install", "skill", "--project"])
    assert code == EXIT_OK
    assert ".claude/skills/escalate/SKILL.md" in out
    assert (tmp_path / ".claude/skills/escalate/SKILL.md").exists()


def test_install_skill_json_output(tmp_path: Path) -> None:
    with mock.patch("escalate.install.Path.home", return_value=tmp_path):
        code, out, _ = run_cli(["install", "skill", "-o", "json"])
    assert code == EXIT_OK
    assert "installed" in json.loads(out)


def test_install_skill_fails_friendly_when_already_installed(tmp_path: Path) -> None:
    with mock.patch("escalate.install.Path.home", return_value=tmp_path):
        first, _, _ = run_cli(["install", "skill"])
        code, out, err = run_cli(["install", "skill"])
    assert first == EXIT_OK
    assert code == EXIT_ERROR
    assert out == ""
    assert "already installed" in err
