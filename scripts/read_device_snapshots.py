"""Lit les snapshots synchronises par les appareils (table device_snapshots), en remplacement
de l'ingestion manuelle des exports JSON (roadmap_sync_marie.md, Phase 4).

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement (cle service_role,
jamais la cle anon : RLS bloque tout acces direct a la table, seule la cle service_role la
contourne). Ces valeurs ne sont jamais affichees ni journalisees par ce script.
"""

import json
import os
import sys
import urllib.request


def main() -> int:
    url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service_key:
        print("ERREUR: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre definies dans l'environnement.", file=sys.stderr)
        return 1

    device_id = sys.argv[1] if len(sys.argv) > 1 else None

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

    try:
        with urllib.request.urlopen(request) as response:
            rows = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"ERREUR: requete Supabase echouee ({e.code}) : {e.read().decode('utf-8')}", file=sys.stderr)
        return 1

    if not rows:
        print("Aucun snapshot trouve.")
        return 0

    print(json.dumps(rows, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
