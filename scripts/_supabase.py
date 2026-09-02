"""Acces partage a la table Supabase device_snapshots (roadmap_sav_snapshot_marie.md, Phase 3).

Consomme par backup_marie_snapshot.py et read_device_snapshots.py : une seule implementation
de la garde d'environnement et de la requete HTTP. SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
(cle service_role, jamais la cle anon : RLS bloque tout acces direct) ne sont jamais affichees
ni journalisees.
"""

import json
import urllib.error
import urllib.request
import os

HTTP_TIMEOUT_SECONDS = 15


class SupabaseError(Exception):
    """Echec d'acces a Supabase, avec un message deja pret pour stderr (sans point final)."""


def read_credentials() -> tuple[str, str]:
    url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service_key:
        raise SupabaseError(
            "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre definies dans l'environnement"
        )
    return url, service_key


def fetch_snapshots(url: str, service_key: str, query: str) -> list[dict]:
    request = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/device_snapshots?{query}",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise SupabaseError(
            f"requete Supabase echouee ({e.code}) : {e.read().decode('utf-8')}"
        ) from e
    except urllib.error.URLError as e:
        raise SupabaseError(f"Supabase injoignable ({e.reason})") from e
    except TimeoutError as e:
        raise SupabaseError(f"Supabase n'a pas repondu en {HTTP_TIMEOUT_SECONDS} s") from e
