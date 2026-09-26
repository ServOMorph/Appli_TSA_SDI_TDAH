import argparse
import json
import os
import sys
import urllib.request
from datetime import datetime

API = "https://api.netlify.com/api/v1"


def get(path, token):
    request = urllib.request.Request(f"{API}/{path}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def parse(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def main():
    parser = argparse.ArgumentParser(description="Compte les deploiements de production Netlify de la periode de facturation en cours.")
    parser.add_argument("--max", type=int, default=10)
    args = parser.parse_args()

    token = os.environ.get("NETLIFY_AUTH_TOKEN")
    site_id = os.environ.get("NETLIFY_SITE_ID")
    if not token or not site_id:
        print("NETLIFY_AUTH_TOKEN ou NETLIFY_SITE_ID absent de l'environnement.")
        return 2

    site = get(f"sites/{site_id}", token)
    period = get(f"accounts/{site['account_id']}/bandwidth", token)
    start, end = parse(period["period_start_date"]), parse(period["period_end_date"])

    deploys = get(f"sites/{site_id}/deploys?per_page=100", token)
    count = sum(
        1 for d in deploys
        if d.get("context") == "production" and d.get("state") == "ready" and parse(d["created_at"]) >= start
    )

    print(f"Site {site['name']} - periode {start.date()} -> {end.date()} : {count}/{args.max} deploiements de production.")
    if count >= args.max:
        print("Plafond atteint : deploiement refuse.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
