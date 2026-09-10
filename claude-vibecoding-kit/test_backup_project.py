"""Tests du filtrage d'artefacts et de la robustesse d'encodage de backup_project."""

import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

MODULE_DIR = Path(__file__).parent
SCRIPT = MODULE_DIR / "backup_project.py"

sys.path.insert(0, str(MODULE_DIR))
import backup_project as bp


def test_is_excluded_artefacts_regenerables():
    assert bp.is_excluded(Path("e2e/test-results/run/trace.zip"))
    assert bp.is_excluded(Path("e2e/playwright-report/index.html"))
    assert bp.is_excluded(Path(".pytest_cache/v/cache/lastfailed"))
    assert bp.is_excluded(Path("frontend/.ruff_cache/CACHEDIR.TAG"))
    assert bp.is_excluded(Path(".mypy_cache/3.13/x.data.json"))
    assert bp.is_excluded(Path("coverage/lcov.info"))
    assert bp.is_excluded(Path("htmlcov/index.html"))
    assert bp.is_excluded(Path(".netlify/state.json"))
    assert bp.is_excluded(Path("tmp/scratch.txt"))


def test_is_excluded_conserve_les_vraies_sources():
    assert not bp.is_excluded(Path("src/app.py"))
    assert not bp.is_excluded(Path("e2e/specs/onboarding.spec.ts"))
    assert not bp.is_excluded(Path(".env"))
    assert not bp.is_excluded(Path("donnees_marie/registre.json"))


def test_non_public_files_exclut_les_artefacts(monkeypatch, tmp_path):
    reponses = {
        ("rev-parse", "--verify", "@{upstream}"): [Path("ref")],
        ("diff", "--name-only", "-z", "@{upstream}"): [
            Path("src/app.py"),
            Path("e2e/test-results/run/trace.zip"),
        ],
        ("ls-files", "--others", "--ignored", "--exclude-standard", "-z"): [
            Path(".pytest_cache/lastfailed"),
            Path(".env"),
        ],
    }
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "app.py").write_text("x", encoding="utf-8")
    (tmp_path / ".env").write_text("SECRET=1", encoding="utf-8")
    (tmp_path / "e2e" / "test-results" / "run").mkdir(parents=True)
    (tmp_path / "e2e" / "test-results" / "run" / "trace.zip").write_text("x", encoding="utf-8")
    (tmp_path / ".pytest_cache").mkdir()
    (tmp_path / ".pytest_cache" / "lastfailed").write_text("x", encoding="utf-8")

    monkeypatch.setattr(bp, "git_paths", lambda project_path, *args: reponses[args])

    assert bp.non_public_files(tmp_path) == [".env", "src/app.py"]


def _git(cwd, *args):
    subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True)


@pytest.mark.skipif(shutil.which("git") is None, reason="git absent")
def test_refresh_list_exit_zero_sur_noms_non_ascii(tmp_path):
    origin = tmp_path / "origin.git"
    subprocess.run(["git", "init", "--bare", str(origin)], check=True, capture_output=True)
    work = tmp_path / "work"
    subprocess.run(["git", "clone", str(origin), str(work)], check=True, capture_output=True)
    _git(work, "config", "user.email", "t@example.test")
    _git(work, "config", "user.name", "t")
    (work / "README.md").write_text("hello", encoding="utf-8")
    (work / ".gitignore").write_text("e2e/local/\ne2e/test-results/\n", encoding="utf-8")
    _git(work, "add", "README.md", ".gitignore")
    _git(work, "commit", "-m", "init")
    _git(work, "push", "origin", "HEAD")

    weird = work / "e2e" / "local" / "01-onboarding-T02-—-Entrer-→-écran-Profil-chromium"
    weird.mkdir(parents=True)
    (weird / "résumé-→.txt").write_text("x", encoding="utf-8")
    junk = work / "e2e" / "test-results" / "run"
    junk.mkdir(parents=True)
    (junk / "trace.zip").write_text("x", encoding="utf-8")

    script = tmp_path / "backup_project.py"
    shutil.copy(SCRIPT, script)

    env = dict(os.environ)
    env["PYTHONIOENCODING"] = "cp1252"

    proc = subprocess.run(
        [sys.executable, str(script), str(work), "--refresh-list"],
        capture_output=True,
        env=env,
        encoding="utf-8",
        errors="replace",
    )
    assert proc.returncode == 0, proc.stderr

    manifest = (tmp_path / "rclone_backup_files.txt").read_text(
        encoding="utf-8", errors="surrogateescape"
    )
    lignes = manifest.splitlines()
    assert lignes == sorted(lignes)
    assert manifest.endswith("\n")
    assert any("Profil-chromium" in ligne for ligne in lignes)
    assert not any("test-results" in ligne for ligne in lignes)
