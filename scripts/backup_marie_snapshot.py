"""Sauvegarde locale du snapshot Supabase de Marie dans donnees_marie/ (roadmap_sync_marie.md,
Phase 5 : remplace l'archivage qu'assurait l'envoi manuel d'export avant la sync automatique).

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement (cle service_role,
jamais la cle anon : RLS bloque tout acces direct a la table).

Selection de l'appareil : par defaut, celui avec le plus de manual_test_results (signal le
plus fiable observe pour distinguer l'appareil de Marie des appareils de test/dev — seul un
usage reel prolonge accumule des validations de tests manuels). Passer --device-id pour cibler
un appareil precis si l'heuristique devient ambigue (plusieurs testeurs, etc.).

Idempotent : n'ecrit rien si une sauvegarde portant le meme synced_at existe deja.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "donnees_marie"


def fetch_snapshots(url: str, service_key: str, device_id: str | None) -> list[dict]:
    query = "select=device_id,payload,schema_version,app_version,created_at,synced_at"
    if device_id:
        query += f"&device_id=eq.{device_id}"

    request = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/device_snapshots?{query}",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def select_target(rows: list[dict]) -> dict | None:
    if not rows:
        return None
    return max(rows, key=lambda r: len((r.get("payload") or {}).get("manual_test_results") or []))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--device-id", help="UUID de l'appareil a sauvegarder (defaut : heuristique manual_test_results)")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service_key:
        print("ERREUR: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre definies dans l'environnement.", file=sys.stderr)
        return 1

    try:
        rows = fetch_snapshots(url, service_key, args.device_id)
    except urllib.error.HTTPError as e:
        print(f"ERREUR: requete Supabase echouee ({e.code}) : {e.read().decode('utf-8')}", file=sys.stderr)
        return 1

    target = select_target(rows)
    if target is None:
        print("Aucun snapshot trouve.")
        return 0

    device_short = target["device_id"][:8]
    synced_at = target["synced_at"]
    synced_stamp = synced_at[:16].replace(":", "").replace("T", "-") + "h" + synced_at[14:16]

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"snapshot-supabase-{device_short}-{synced_stamp}.json"

    if out_path.exists():
        print(f"Deja sauvegarde : {out_path.name} (synced_at {synced_at})")
        return 0

    out_path.write_text(
        json.dumps(target["payload"], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    n_tasks = len(target["payload"].get("tasks") or [])
    n_tests = len(target["payload"].get("manual_test_results") or [])
    print(
        f"Sauvegarde ecrite : {out_path.name} "
        f"(app_version={target.get('app_version')}, tasks={n_tasks}, manual_test_results={n_tests})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
