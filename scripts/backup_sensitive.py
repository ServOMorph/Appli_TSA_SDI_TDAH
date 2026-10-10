"""Sauvegarde chiffrée (rclone crypt) des seuls fichiers sensibles, vers Google Drive.

Complète claude-vibecoding-kit/backup_project.py, qui exclut ces fichiers du backup en clair.
Périmètre : donnees_testeurs/ et les fichiers dont le nom correspond aux motifs sensibles du kit
(.env, clés, jetons, settings.local.json...). Noms et contenus sont chiffrés côté Drive.

  python scripts/backup_sensitive.py --setup    crée le remote chiffré (saisie masquée des mots de passe)
  python scripts/backup_sensitive.py --list     affiche les fichiers concernés
  python scripts/backup_sensitive.py --upload   copie (rclone copy, ne supprime rien côté Drive)
  python scripts/backup_sensitive.py --check    compare local et Drive (rclone cryptcheck)

Les mots de passe ne sont jamais écrits par ce script ; rclone les stocke obscurcis dans sa propre
configuration. Sans ces deux mots de passe, les fichiers du Drive sont irrécupérables.
"""

import argparse
import fnmatch
import getpass
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "claude-vibecoding-kit"))
from backup_project import CONFIG, EXCLUDED_PARTS, RCLONE, SENSITIVE_FILE_PATTERNS  # noqa: E402

SKIP_PARTS = EXCLUDED_PARTS - {"donnees_testeurs"}
SENSITIVE_DIRS = {"donnees_testeurs"}


def drive_config() -> tuple[str, str]:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    return config["remote"].strip(), config["folder"].strip()


def crypt_remote_name() -> str:
    return f"{drive_config()[0]}_crypt"


def sensitive_files() -> list[str]:
    files: list[str] = []
    for current, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_PARTS]
        for name in names:
            path = Path(current) / name
            relative = path.relative_to(ROOT)
            in_sensitive_dir = any(part in SENSITIVE_DIRS for part in relative.parts)
            matches = any(fnmatch.fnmatch(name, pattern) for pattern in SENSITIVE_FILE_PATTERNS)
            if in_sensitive_dir or matches:
                files.append(relative.as_posix())
    return sorted(files)


def rclone(*args: str, stdin: str | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        [str(RCLONE), *args], input=stdin, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )


def obscure(secret: str) -> str:
    result = rclone("obscure", "-", stdin=secret)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())
    return result.stdout.strip()


def setup() -> int:
    remote, folder = drive_config()
    name = crypt_remote_name()
    if f"{name}:" in rclone("listremotes").stdout.split():
        print(f"Le remote {name}: existe déjà. Rien à faire.")
        return 0
    password = getpass.getpass("Mot de passe de chiffrement : ")
    if not password or getpass.getpass("Confirmer : ") != password:
        print("ERREUR : saisies vides ou différentes.")
        return 1
    salt = getpass.getpass("Second mot de passe (sel), différent du premier : ")
    if not salt or salt == password or getpass.getpass("Confirmer : ") != salt:
        print("ERREUR : saisies vides, identiques au premier ou différentes.")
        return 1
    result = rclone(
        "config", "create", name, "crypt",
        f"remote={remote}:BackUps/{folder}_chiffre",
        f"password={obscure(password)}",
        f"password2={obscure(salt)}",
        "filename_encryption=standard",
        "directory_name_encryption=true",
    )
    if result.returncode != 0:
        print(f"ERREUR : {result.stderr.strip()}")
        return 1
    print(f"Remote {name}: créé. Conserver les deux mots de passe dans un gestionnaire : ils ne sont pas récupérables.")
    return 0


def transfer(operation: str) -> int:
    files = sensitive_files()
    if not files:
        print("Aucun fichier sensible à traiter.")
        return 0
    name = crypt_remote_name()
    if f"{name}:" not in rclone("listremotes").stdout.split():
        print(f"ERREUR : remote {name}: absent. Lancer d'abord --setup.")
        return 1
    with tempfile.NamedTemporaryFile("w", suffix=".txt", encoding="utf-8", delete=False) as handle:
        handle.write("\n".join(files) + "\n")
        manifest = handle.name
    try:
        command = ["cryptcheck", str(ROOT), f"{name}:", "--one-way"] if operation == "check" else ["copy", str(ROOT), f"{name}:"]
        result = rclone(*command, "--files-from-raw", manifest)
    finally:
        os.unlink(manifest)
    if result.returncode != 0:
        print(f"ERREUR {operation} : {result.stderr.strip()}")
        return 1
    print(f"{'Contrôle' if operation == 'check' else 'Copie chiffrée'} OK : {len(files)} fichier(s) vers {name}:")
    return 0


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--setup", action="store_true")
    group.add_argument("--list", action="store_true")
    group.add_argument("--upload", action="store_true")
    group.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if not RCLONE.exists():
        print(f"ERREUR : rclone introuvable à {RCLONE}")
        return 1
    if args.setup:
        return setup()
    if args.list:
        print("\n".join(sensitive_files()))
        return 0
    return transfer("check" if args.check else "upload")


if __name__ == "__main__":
    raise SystemExit(main())
