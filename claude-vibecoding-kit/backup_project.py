"""Copie explicite des fichiers absents de la branche GitHub suivie."""

import argparse
import fnmatch
import json
import os
import subprocess
import sys
from pathlib import Path


RCLONE = Path(os.environ["LOCALAPPDATA"]) / "rclone" / "rclone.exe"
CONFIG = Path(__file__).with_name("rclone_backup.json")
MANIFEST = Path(__file__).with_name("rclone_backup_files.txt")
EXCLUDED_PARTS = {
    ".git",
    "node_modules",
    "__pycache__",
    "venv",
    ".venv",
    "dist",
    "build",
    "test-results",
    "playwright-report",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
    "coverage",
    "htmlcov",
    ".netlify",
    "tmp",
    "donnees_testeurs",
}
SENSITIVE_FILE_PATTERNS = {
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "credentials*.json",
    "token*.json",
    "rclone.conf",
    "settings.local.json",
    "SECRETS.local.md",
}


def is_excluded(path: Path) -> bool:
    return any(part in EXCLUDED_PARTS for part in path.parts) or any(
        fnmatch.fnmatch(path.name, pattern) for pattern in SENSITIVE_FILE_PATTERNS
    )


def git_paths(project_path: Path, *args: str) -> list[Path]:
    result = subprocess.run(
        ["git", "-C", str(project_path), *args], capture_output=True, check=False
    )
    if result.returncode != 0:
        raise RuntimeError("Le dépôt Git ou sa branche publique est inutilisable.")
    return [
        Path(entry.decode("utf-8", errors="surrogateescape"))
        for entry in result.stdout.split(b"\0")
        if entry
    ]


def non_public_files(project_path: Path) -> list[str]:
    git_paths(project_path, "rev-parse", "--verify", "@{upstream}")
    candidates = set(git_paths(project_path, "diff", "--name-only", "-z", "@{upstream}"))
    candidates.update(
        git_paths(project_path, "ls-files", "--others", "--ignored", "--exclude-standard", "-z")
    )
    files: set[str] = set()
    for candidate in candidates:
        if is_excluded(candidate):
            continue
        absolute = project_path / candidate
        if absolute.is_file():
            files.add(candidate.as_posix())
    return sorted(files)


def write_manifest(project_path: Path) -> list[str]:
    files = non_public_files(project_path)
    manifest_relative = MANIFEST.relative_to(project_path).as_posix() if MANIFEST.is_relative_to(project_path) else None
    if manifest_relative and manifest_relative not in files:
        files.append(manifest_relative)
        files.sort()
    MANIFEST.write_text(
        "\n".join(files) + ("\n" if files else ""),
        encoding="utf-8",
        errors="surrogateescape",
    )
    return files


def read_config() -> tuple[str, str]:
    try:
        config = json.loads(CONFIG.read_text(encoding="utf-8"))
        remote = config["remote"].strip()
        drive_folder = config["folder"].strip()
    except (FileNotFoundError, KeyError, json.JSONDecodeError, AttributeError) as error:
        raise RuntimeError(f"Compte Google Drive non configuré dans {CONFIG}.") from error
    if not remote or not drive_folder or drive_folder in {".", ".."} or "/" in drive_folder or "\\" in drive_folder:
        raise RuntimeError(f"Compte Google Drive non configuré dans {CONFIG}.")
    return remote, drive_folder


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    parser = argparse.ArgumentParser()
    parser.add_argument("project_path", type=Path)
    parser.add_argument("--refresh-list", action="store_true")
    parser.add_argument("--show-list", action="store_true")
    operation = parser.add_mutually_exclusive_group()
    operation.add_argument("--upload", action="store_true")
    operation.add_argument("--check", action="store_true")
    args = parser.parse_args()
    project_path = args.project_path.resolve()

    if not project_path.is_dir():
        print(f"ERREUR : dossier introuvable {project_path}")
        return 1
    if not (project_path / ".git").exists():
        print(f"ERREUR : dépôt Git introuvable dans {project_path}")
        return 1

    try:
        if args.refresh_list:
            files = write_manifest(project_path)
        else:
            files = MANIFEST.read_text(
                encoding="utf-8", errors="surrogateescape"
            ).splitlines()
            files = [file for file in files if not is_excluded(Path(file))]
    except (OSError, RuntimeError) as error:
        print(f"ERREUR : {error}")
        return 1

    if args.refresh_list or args.show_list:
        print(f"Liste mise à jour : {MANIFEST}")
        for relative in files:
            print(relative)

    if not args.upload and not args.check:
        return 0
    if not files:
        print("Aucun fichier absent de la branche GitHub suivie à copier.")
        return 0
    if not RCLONE.exists():
        print(f"ERREUR : rclone introuvable à {RCLONE}")
        return 1

    remote, drive_folder = read_config()
    drive_dest = f"{remote}:BackUps/{drive_folder}"
    command = [str(RCLONE), "check" if args.check else "copy", str(project_path), drive_dest]
    if args.check:
        command.append("--one-way")
    command += ["--files-from-raw", str(MANIFEST)]
    result = subprocess.run(
        command, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    if result.returncode != 0:
        print(f"ERREUR {'contrôle' if args.check else 'upload'} : {result.stderr.strip()}")
        return 1
    print(f"{'Contrôle' if args.check else 'Copie'} OK : {len(files)} fichier(s) vers {drive_dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
