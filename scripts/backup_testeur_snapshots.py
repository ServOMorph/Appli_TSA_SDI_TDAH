"""Sauvegarde locale des snapshots Supabase des testeurs dans donnees_testeurs/<tester_code>/
(roadmap_integration_onboard.md, Phase 6 : generalise l'archivage mono-personne herite de
roadmap_sync_marie.md Phase 5).

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement (cle service_role,
jamais la cle anon : RLS bloque tout acces direct a la table).

Appareils traites : tous les appareils presents dans device_snapshots, chacun archive
individuellement (la ligne la plus recente par device_id). Passer --device-id pour restreindre
a un seul appareil.

Chaque appareil est range sous le dossier de son testeur (`Settings.tester_code`, serialise
dans `payload.settings`), normalise en minuscules. Un appareil sans code testeur (fantome,
localStorage regenere, cycle avorte) est range dans `_sans_code/`, jamais suppose appartenir a
un testeur en particulier. Plusieurs appareils d'un meme testeur cohabitent dans son dossier,
distingues par device_id court dans le nom de fichier.

Idempotent par le contenu : n'ecrit rien si une sauvegarde du meme appareil porte deja
exactement le meme payload. Le synced_at ne peut pas servir de cle — il change a chaque
relance de l'app, meme quand les donnees n'ont pas bouge.

Retention : --prune purge chaque dossier de donnees_testeurs/ en gardant les --keep-last
(defaut 30) snapshots les plus recents par appareil plus le premier de chaque mois ; --dry-run
liste sans supprimer. La purge n'est jamais automatique : /start et /close appellent le script
sans ces options.
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from _supabase import SupabaseError, fetch_snapshots, read_credentials

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "donnees_testeurs"
UNKNOWN_TESTER_DIRNAME = "_sans_code"
RETENTION_KEEP_LAST = 30

_ENTRY_RE = re.compile(r"^snapshot-supabase-([0-9a-f]{8})-(.+)\.json$")
_STAMP_RE = re.compile(r"^(\d{4})-?(\d{2})-?(\d{2})-(\d{2})(\d{2})")
_TESTER_DIRNAME_RE = re.compile(r"[^a-z0-9_-]+")


def resolve_tester_dirname(payload: dict) -> str:
    """Nom du sous-dossier de testeur pour ce payload, jamais lie a une identite en dur.

    Lit `payload.settings.tester_code`, normalise en minuscules et restreint aux caracteres
    surs pour un nom de dossier. Code absent, vide apres normalisation, ou payload sans table
    `settings` exploitable : range sous `_sans_code`, jamais devine.
    """
    settings = payload.get("settings") if isinstance(payload, dict) else None
    code = settings.get("tester_code") if isinstance(settings, dict) else None
    if not isinstance(code, str):
        return UNKNOWN_TESTER_DIRNAME
    normalized = _TESTER_DIRNAME_RE.sub("-", code.strip().lower()).strip("-")
    return normalized or UNKNOWN_TESTER_DIRNAME


def build_query(device_id: str | None) -> str:
    query = "select=device_id,payload,schema_version,app_version,synced_at&order=synced_at.desc"
    if device_id:
        query += f"&device_id=eq.{device_id}"
    return query


def select_targets(rows: list[dict]) -> list[dict]:
    """Retient la ligne la plus recente de chaque appareil.

    Les lignes arrivent triees par synced_at decroissant (build_query : &order=synced_at.desc),
    donc la premiere vue pour un device_id donne est la plus recente. Tous les appareils actifs
    du cycle sont ainsi archives, aucun n'est ecarte au profit de celui qui porte le plus de
    resultats de test manuel (rupture R1).
    """
    latest: dict[str, dict] = {}
    for r in rows:
        device_id = r.get("device_id")
        if device_id and device_id not in latest:
            latest[device_id] = r
    return list(latest.values())


def payload_problem(payload) -> str | None:
    """Retourne la raison de refus d'ecriture, ou None si le payload est exploitable."""
    if payload is None:
        return "payload absent"
    if not isinstance(payload, dict):
        return f"payload inattendu de type {type(payload).__name__}"
    if not (payload.get("tasks") or payload.get("manual_test_results")):
        return "payload sans aucune tache ni resultat de test manuel"
    return None


def payload_is_empty(payload) -> bool:
    """Vrai si le payload est absent ou sans aucune donnee exploitable.

    Distinct d'un payload malforme (mauvais type) : un appareil sans tache ni resultat
    de test est un appareil fantome (localStorage regenere, cycle avorte), pas une
    anomalie. Hors ciblage --device-id, un tel appareil est ignore en silence plutot
    que de lever une erreur (device_snapshots en contient des dizaines).
    """
    if payload is None:
        return True
    return isinstance(payload, dict) and not (payload.get("tasks") or payload.get("manual_test_results"))


def build_stamp(synced_at: str) -> str:
    """Horodatage du nom de fichier, en UTC explicite (suffixe z).

    Parse via datetime.fromisoformat plutot qu'un decoupage de chaine : robuste a
    la presence ou non de microsecondes, a la notation Z ou +00:00, et a un
    decalage non nul (ramene en UTC avant formatage).
    """
    dt = datetime.fromisoformat(synced_at.replace("Z", "+00:00")).astimezone(timezone.utc)
    return dt.strftime("%Y%m%d-%H%Mz")


def serialize_payload(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2)


def find_duplicate(directory: Path, device_short: str, content: str) -> Path | None:
    """Cherche une sauvegarde existante du meme appareil au contenu identique.

    Comparaison sur le texte relu, pas sur la taille du fichier : sous Windows
    write_text traduit les fins de ligne en CRLF, donc la taille sur disque ne
    correspond jamais a celle du contenu serialise. read_text retraduit en \\n,
    ce qui rend la comparaison valable des deux cotes.
    """
    if not directory.exists():
        return None
    for path in sorted(directory.glob(f"snapshot-supabase-{device_short}-*.json"), reverse=True):
        if path.read_text(encoding="utf-8") == content:
            return path
    return None


def plan_retention(filenames: list[str], keep_last: int = RETENTION_KEEP_LAST) -> tuple[list[str], list[str]]:
    """Repartit des noms de fichiers en (a conserver, a purger).

    Regroupe les snapshot-supabase-<device>-<stamp>.json par appareil. Conserve, par
    appareil : les `keep_last` stamps les plus recents plus le premier stamp de chaque
    mois. Le stamp est parse aussi bien au format Phase 2 (20260901-2343z) qu'a l'ancien
    (2026-09-01-1837h37). Tout nom hors motif (exports export-audhd-*.json, fichiers
    etrangers, stamp illisible) est conserve, jamais purge.
    """
    keep: list[str] = []
    by_device: dict[str, list[tuple[tuple[int, ...], str]]] = {}
    for name in filenames:
        m = _ENTRY_RE.match(name)
        stamp = _STAMP_RE.match(m.group(2)) if m else None
        if stamp is None:
            keep.append(name)
            continue
        by_device.setdefault(m.group(1), []).append((tuple(int(g) for g in stamp.groups()), name))

    purge: list[str] = []
    for items in by_device.values():
        items.sort()
        recent = {name for _, name in (items[-keep_last:] if keep_last > 0 else [])}
        seen_months: set[tuple[int, int]] = set()
        for stamp_key, name in items:
            month = (stamp_key[0], stamp_key[1])
            if month not in seen_months:
                seen_months.add(month)
                recent.add(name)
        for _, name in items:
            (keep if name in recent else purge).append(name)
    return sorted(keep), sorted(purge)


def run_prune(directory: Path, keep_last: int, dry_run: bool) -> None:
    if not directory.exists():
        print("Retention : donnees_testeurs/ absent, rien a purger.")
        return
    tester_dirs = [d for d in directory.iterdir() if d.is_dir()]
    if not tester_dirs:
        print("Retention : rien a purger.")
        return
    total_purge = 0
    for tester_dir in sorted(tester_dirs):
        names = [p.name for p in tester_dir.iterdir() if p.is_file()]
        _, purge = plan_retention(names, keep_last=keep_last)
        for name in purge:
            print(f"{'A purger' if dry_run else 'Purge'} : {tester_dir.name}/{name}")
            if not dry_run:
                (tester_dir / name).unlink()
        total_purge += len(purge)
    if not total_purge:
        print("Retention : rien a purger.")
        return
    resume = "listes (dry-run, rien supprime)" if dry_run else "purges"
    print(f"Retention : {total_purge} fichier(s) {resume}.")


def archive_one(directory: Path, row: dict, targeted: bool = False) -> tuple[int, bool, bool]:
    """Archive un appareil sous `directory/<tester_dirname>/`. Retourne (code, ecrit, ignore).

    code 1 = payload refuse : rien n'est ecrit pour cet appareil, les autres restent traites.
    ecrit = False si une sauvegarde du meme appareil porte deja exactement le meme contenu
    (idempotence par relance de cycle).
    ignore = True si l'appareil est sans donnee et n'a pas ete cible explicitement par
    --device-id : skip silencieux (code 0), pas une erreur. Un payload malforme, ou un
    appareil vide cible explicitement, reste une erreur (code 1).
    """
    device_id = row["device_id"]
    payload = row.get("payload")
    problem = payload_problem(payload)
    if problem is not None:
        if payload_is_empty(payload) and not targeted:
            return 0, False, True
        print(
            f"ERREUR: {problem} pour l'appareil {device_id} - rien n'a ete ecrit pour cet appareil.",
            file=sys.stderr,
        )
        return 1, False, False

    tester_dir = directory / resolve_tester_dirname(payload)
    device_short = device_id[:8]
    content = serialize_payload(payload)
    n_tasks = len(payload.get("tasks") or [])
    n_tests = len(payload.get("manual_test_results") or [])

    tester_dir.mkdir(parents=True, exist_ok=True)

    duplicate = find_duplicate(tester_dir, device_short, content)
    if duplicate is not None:
        print(f"{device_id} : inchange depuis {tester_dir.name}/{duplicate.name} - rien a sauvegarder.")
        return 0, False, False

    out_path = tester_dir / f"snapshot-supabase-{device_short}-{build_stamp(row['synced_at'])}.json"
    out_path.write_text(content, encoding="utf-8")

    print(
        f"Sauvegarde ecrite : {tester_dir.name}/{out_path.name} "
        f"(app_version={row.get('app_version')}, tasks={n_tasks}, manual_test_results={n_tests})"
    )
    return 0, True, False


def run_backup(device_id: str | None) -> int:
    try:
        url, service_key = read_credentials()
        rows = fetch_snapshots(url, service_key, build_query(device_id))
    except SupabaseError as e:
        print(f"ERREUR: {e} - sauvegarde non effectuee.", file=sys.stderr)
        return 1

    targets = select_targets(rows)
    if not targets:
        print("Aucun snapshot trouve.")
        return 0

    print(f"{len(targets)} appareil(s) a archiver : {', '.join(t['device_id'] for t in targets)}")

    exit_code = 0
    written = 0
    skipped = 0
    for row in targets:
        code, did_write, was_skipped = archive_one(OUTPUT_DIR, row, targeted=device_id is not None)
        exit_code = exit_code or code
        written += int(did_write)
        skipped += int(was_skipped)

    resume = f"Sauvegarde terminee : {written} archive(s) ecrite(s) sur {len(targets)} appareil(s)."
    if skipped:
        resume += f" {skipped} appareil(s) sans donnee ignore(s)."
    print(resume)
    return exit_code


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--device-id", help="UUID de l'appareil a sauvegarder (defaut : heuristique manual_test_results)")
    parser.add_argument("--prune", action="store_true", help="Purge donnees_testeurs/ selon la retention apres la sauvegarde")
    parser.add_argument("--dry-run", action="store_true", help="Avec --prune : liste les fichiers a purger sans rien supprimer")
    parser.add_argument("--keep-last", type=int, default=RETENTION_KEEP_LAST, help=f"Snapshots recents conserves par appareil (defaut {RETENTION_KEEP_LAST})")
    args = parser.parse_args()

    code = run_backup(args.device_id)

    if args.prune or args.dry_run:
        run_prune(OUTPUT_DIR, args.keep_last, args.dry_run)

    return code


if __name__ == "__main__":
    raise SystemExit(main())
