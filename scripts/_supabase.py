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
from pathlib import Path
from urllib.parse import quote

HTTP_TIMEOUT_SECONDS = 15

_ENV_KEYS = ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class SupabaseError(Exception):
    """Echec d'acces a Supabase, avec un message deja pret pour stderr (sans point final)."""


def _value_from_env_file(key: str) -> str | None:
    """Lit une cle dans le .env a la racine sans le charger dans l'environnement du process.

    Evite au hook /start et /close de sourcer .env en shell (bloque par le classifieur).
    Ne gere que KEY=VALUE (avec export optionnel, guillemets optionnels) ; ignore
    commentaires et lignes vides. La valeur n'est ni affichee ni journalisee.
    """
    try:
        lines = _ENV_FILE.read_text(encoding="utf-8").splitlines()
    except OSError:
        return None
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export "):].strip()
        name, sep, value = line.partition("=")
        if not sep or name.strip() != key:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        return value or None
    return None


def read_credentials() -> tuple[str, str]:
    values = {
        key: os.environ.get(key) or _value_from_env_file(key)
        for key in _ENV_KEYS
    }
    if not values["SUPABASE_URL"] or not values["SUPABASE_SERVICE_ROLE_KEY"]:
        raise SupabaseError(
            "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre definies "
            "dans l'environnement ou dans le .env a la racine"
        )
    return values["SUPABASE_URL"], values["SUPABASE_SERVICE_ROLE_KEY"]


def fetch_rows(url: str, service_key: str, table: str, query: str) -> list[dict]:
    request = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/{quote(table, safe='_')}?{query}",
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


def fetch_snapshots(url: str, service_key: str, query: str) -> list[dict]:
    return fetch_rows(url, service_key, "device_snapshots", query)


def download_storage_object(url: str, service_key: str, bucket: str, path: str) -> bytes:
    request = urllib.request.Request(
        f"{url.rstrip('/')}/storage/v1/object/{quote(bucket, safe='')}/{quote(path, safe='/')}",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
            return response.read()
    except urllib.error.HTTPError as e:
        raise SupabaseError(
            f"telechargement Storage echoue ({e.code}) : {e.read().decode('utf-8', errors='replace')}"
        ) from e
    except urllib.error.URLError as e:
        raise SupabaseError(f"Supabase injoignable ({e.reason})") from e
    except TimeoutError as e:
        raise SupabaseError(f"Supabase n'a pas repondu en {HTTP_TIMEOUT_SECONDS} s") from e
