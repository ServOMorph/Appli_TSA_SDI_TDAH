"""Repere les retours testeur, ouverts ou valides depuis le dernier deploiement, dont une reponse
d'agent deja publiee porte sur un ecran modifie depuis ce deploiement : la reponse decrit
peut-etre un comportement que la livraison change ou retire (ex. une fonction annoncee, validee
par le testeur, puis supprimee). Un retour valide (`resolved_at` renseigne) ne recoit plus de
reponse dans son fil : le changement se signale dans le message de livraison.

Rattachement fichier -> ecran par heuristique : code `E<n>` dans le nom du fichier, ou fichier
d'un dossier `src/ui/screens/<dossier>/` (rattache a tous les ecrans de ce dossier). Les fichiers
`src/` hors ecrans (composants, contextes, regles) ne sont rattaches a aucun ecran : ils sont listes
a part, a juger a la main. Le script signale, il ne tranche pas : la comparaison entre la reponse et
le changement reste humaine.

Base par defaut : champ `Commit :` de _contexte/dernier_deploiement.md (a lancer avant que /deploy
ne le mette a jour). Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY ; la cle service_role
n'est jamais affichee ni ecrite par ce script.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

from _supabase import SupabaseError, fetch_rows, read_credentials

ROOT = Path(__file__).resolve().parent.parent
LAST_DEPLOY_FILE = ROOT / "_contexte" / "dernier_deploiement.md"
SCREENS_PREFIX = "src/ui/screens/"
SCREEN_CODE = re.compile(r"^(E\d+)")


def read_last_deployed_commit() -> str:
    if not LAST_DEPLOY_FILE.exists():
        raise SupabaseError(f"{LAST_DEPLOY_FILE.name} absent : fournir --base")
    match = re.search(r"^- Commit : (\S+)", LAST_DEPLOY_FILE.read_text(encoding="utf-8"), re.MULTILINE)
    if not match:
        raise SupabaseError(f"champ Commit absent de {LAST_DEPLOY_FILE.name} : fournir --base")
    return match.group(1)


def git_lines(*args: str) -> list[str]:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        raise SupabaseError(f"git {' '.join(args)} : {result.stderr.strip()}")
    return [line for line in result.stdout.splitlines() if line.strip()]


def screen_code_of(name: str) -> str | None:
    match = SCREEN_CODE.match(Path(name).name)
    return match.group(1) if match else None


def map_changes_to_screens(changed: list[str], screen_files: list[str]) -> tuple[set[str], list[str]]:
    codes_by_dir: dict[str, set[str]] = {}
    for path in screen_files:
        code = screen_code_of(path)
        if code:
            codes_by_dir.setdefault(str(Path(path).parent.as_posix()), set()).add(code)
    codes: set[str] = set()
    unmapped: list[str] = []
    for path in changed:
        if not path.startswith("src/"):
            continue
        code = screen_code_of(path)
        if code:
            codes.add(code)
        elif path.startswith(SCREENS_PREFIX) and Path(path).parent.as_posix() in codes_by_dir:
            codes |= codes_by_dir[Path(path).parent.as_posix()]
        else:
            unmapped.append(path)
    return codes, unmapped


def answered_reports(url: str, service_key: str, resolved_since: str) -> list[dict]:
    since = quote(resolved_since, safe="-:")
    reports = fetch_rows(
        url, service_key, "feedback_reports",
        "select=id,screen_code,comment,created_at,resolved_at"
        f"&or=(resolved_at.is.null,resolved_at.gte.{since})&order=created_at.asc",
    )
    if not reports:
        return []
    ids = ",".join(quote(r["id"], safe="-") for r in reports)
    messages = fetch_rows(
        url, service_key, "feedback_messages",
        f"select=report_id,author,body,created_at&report_id=in.({ids})&author=eq.agent&order=created_at.asc",
    )
    last_agent: dict[str, dict] = {}
    for message in messages:
        last_agent[message["report_id"]] = message
    result = []
    for report in reports:
        if report["id"] in last_agent:
            entry = dict(report)
            entry["derniere_reponse_agent"] = last_agent[report["id"]]
            result.append(entry)
    return result


def flag_reports(reports: list[dict], codes: set[str]) -> tuple[list[dict], list[dict]]:
    flagged, others = [], []
    for report in reports:
        report_codes = set(re.findall(r"E\d+", (report.get("screen_code") or "").upper()))
        (flagged if report_codes & codes else others).append(report)
    return flagged, others


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", help="Commit de reference (defaut : dernier deploiement)")
    args = parser.parse_args()
    try:
        base = args.base or read_last_deployed_commit()
        base_date = git_lines("log", "-1", "--format=%cI", base)[0]
        changed = git_lines("diff", "--name-only", f"{base}..HEAD")
        screen_files = git_lines("ls-files", SCREENS_PREFIX)
        codes, unmapped = map_changes_to_screens(changed, screen_files)
        url, service_key = read_credentials()
        flagged, others = flag_reports(answered_reports(url, service_key, base_date), codes)
    except SupabaseError as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1
    print(json.dumps({
        "base": base,
        "ecrans_modifies": sorted(codes, key=lambda c: int(c[1:])),
        "a_revoir": flagged,
        "autres_retours_repondus": len(others),
        "fichiers_src_non_rattaches": unmapped,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
