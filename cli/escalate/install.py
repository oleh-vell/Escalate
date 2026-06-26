"""Install the bundled escalate skill into a Claude Code skills directory.

The skill text ships as package data (escalate/data/SKILL.md), so this works the
same whether the CLI was installed editable or from a wheel.
"""

from __future__ import annotations

import re
from importlib import resources
from pathlib import Path

from escalate.api import ApiError

_SKILL_RESOURCE: str = "data/SKILL.md"
_NAME_RE: re.Pattern[str] = re.compile(r"^name:\s*(\S+)\s*$", re.MULTILINE)


def _skill_source() -> str:
    """The bundled SKILL.md text shipped as package data."""
    return resources.files("escalate").joinpath(_SKILL_RESOURCE).read_text(encoding="utf-8")


def _skill_name(source: str) -> str:
    """The skill's directory name, read from the SKILL.md frontmatter."""
    match = _NAME_RE.search(source)
    if match is None:
        raise ApiError("Bundled SKILL.md has no 'name:' in its frontmatter; cannot install.")
    return match.group(1)


def skills_root(project: bool) -> Path:
    """Where skills live: the project's .claude/skills or the user's ~/.claude/skills."""
    base = Path(".claude") if project else Path.home() / ".claude"
    return base / "skills"


def install_skill(project: bool) -> Path:
    """Copy the bundled skill into place and return the written SKILL.md path.

    Fails (without overwriting) if the skill is already installed at the target.
    """
    source = _skill_source()
    name = _skill_name(source)
    target = skills_root(project) / name / "SKILL.md"
    if target.exists():
        raise ApiError(
            f"The '{name}' skill is already installed at {target}. "
            f"Remove it first if you want to reinstall."
        )
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(source, encoding="utf-8")
    return target
