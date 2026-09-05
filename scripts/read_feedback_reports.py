"""Liste les retours annotes et telecharge leurs images privees.

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement.
La cle service_role n'est jamais affichee ni ecrite par ce script.
"""

import argparse
import json
import sys
from pathlib import Path
from urllib.parse import quote

from _supabase import (
    SupabaseError,
    download_storage_object,
    fetch_rows,
    read_credentials,
)


def build_query(device_id: str | None) -> str:
    query = (
        "select=id,device_id,screen_code,comment,storage_path,image_bytes,strokes,"
        "app_version,created_at&order=created_at.desc"
    )
    if device_id:
        query += f"&device_id=eq.{quote(device_id, safe='-')}"
    return query


def image_filename(report: dict) -> str:
    report_id = report.get("id")
    if not isinstance(report_id, str) or not report_id:
        raise SupabaseError("retour Supabase sans identifiant exploitable")
    return f"{report_id}.jpg"


def download_images(url: str, service_key: str, reports: list[dict], output_dir: Path) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    for report in reports:
        storage_path = report.get("storage_path")
        if not isinstance(storage_path, str) or not storage_path:
            raise SupabaseError("retour Supabase sans chemin Storage exploitable")
        target = output_dir / image_filename(report)
        target.write_bytes(download_storage_object(url, service_key, "feedback", storage_path))
        downloaded += 1
    return downloaded


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--device-id", help="Limiter aux retours d'un appareil")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("feedback-reports"),
        help="Dossier de telechargement des images (defaut : feedback-reports)",
    )
    parser.add_argument("--no-download", action="store_true", help="Lister sans telecharger les images")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        url, service_key = read_credentials()
        reports = fetch_rows(url, service_key, "feedback_reports", build_query(args.device_id))
        if not reports:
            print("Aucun retour trouve.")
            return 0
        print(json.dumps(reports, ensure_ascii=False, indent=2))
        if not args.no_download:
            count = download_images(url, service_key, reports, args.output_dir)
            print(f"{count} image(s) telechargee(s) dans {args.output_dir}.")
        return 0
    except SupabaseError as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
